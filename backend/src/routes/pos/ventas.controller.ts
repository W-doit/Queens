// Sales transaction controller

// Sales transaction controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { 
  OrderLineRequest, 
  DiscountRequest
} from "../../types/pos";
import { 
  getActiveSession, 
  isOrderEditable, 
  getProductInfo
} from "../../services/pos.service";

/**
 * Create a new POS order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    // Get active session
    const session = await getActiveSession();
    
    if (!session) {
      return res.status(400).json({
        error: "No open session",
        message: "Please open a POS session before creating orders"
      });
    }
    
    // Create order
    const orderId = await callOdoo<number>(
      "pos.order",
      "create",
      [{
        session_id: session.id,
        pos_reference: `Order ${Date.now()}`,
        state: 'draft',
        creation_date: new Date().toISOString()
      }]
    );
    
    // Get order details
    const orders = await callOdoo<any[]>(
      "pos.order",
      "read",
      [[orderId]],
      { fields: ['id', 'name', 'pos_reference', 'creation_date'] }
    );
    
    res.status(201).json({
      message: "Order created successfully",
      order_id: orderId,
      name: orders[0].name,
      reference: orders[0].pos_reference,
      date: orders[0].creation_date
    });
  } catch (error: any) {
    console.error("Error creating POS order:", error);
    res.status(500).json({
      error: "Failed to create POS order",
      message: error.message
    });
  }
};

/**
 * Get all POS orders
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const sessionId = req.query.session_id ? parseInt(req.query.session_id as string) : null;
    
    // Build domain
    const domain: any[] = [];
    
    if (sessionId) {
      domain.push(['session_id', '=', sessionId]);
    }
    
    // Get orders
    const orders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [domain],
      {
        fields: [
          'id', 'name', 'date_order', 'partner_id', 
          'amount_total', 'state', 'pos_reference',
          'session_id'
        ],
        limit,
        offset,
        order: 'create_date DESC'
      }
    );
    
    // Get total count
    const total = await callOdoo<number>(
      "pos.order",
      "search_count",
      [domain]
    );
    
    res.json({
      orders,
      total,
      page: Math.floor(offset / limit) + 1,
      limit
    });
  } catch (error: any) {
    console.error("Error getting POS orders:", error);
    res.status(500).json({
      error: "Failed to get POS orders",
      message: error.message
    });
  }
};

/**
 * Get POS order by ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // Get order
    const orders = await callOdoo<any[]>(
      "pos.order",
      "read",
      [[orderId]],
      {
        fields: [
          'id', 'name', 'date_order', 'partner_id', 
          'amount_total', 'state', 'pos_reference',
          'session_id'
        ]
      }
    );
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: "Order not found"
      });
    }
    
    const order = orders[0];
    
    // Get order lines
    const lines = await callOdoo<any[]>(
      "pos.order.line",
      "search_read",
      [[['order_id', '=', orderId]]],
      {
        fields: [
          'id', 'product_id', 'qty', 'price_unit', 
          'price_subtotal', 'price_subtotal_incl',
          'discount'
        ]
      }
    );
    
    // Format response
    const response = {
      ...order,
      lines
    };
    
    res.json(response);
  } catch (error: any) {
    console.error("Error getting POS order:", error);
    res.status(500).json({
      error: "Failed to get POS order",
      message: error.message
    });
  }
};

/**
 * Add product line to order
 */
export const addOrderLine = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { product_id, quantity, price_unit, discount } = req.body as OrderLineRequest;
    
    if (!product_id || !quantity) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Product ID and quantity are required"
      });
    }
    
    // Check if order exists and is in draft state
    const orderStatus = await isOrderEditable(orderId);
    
    if (!orderStatus.exists) {
      return res.status(404).json({
        error: "Order not found"
      });
    }
    
    if (!orderStatus.editable) {
      return res.status(400).json({
        error: "Order cannot be modified",
        message: "Only draft orders can be modified"
      });
    }
    
    // Get product info
    const product = await getProductInfo(product_id);
    
    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }
    
    // Use provided price or default to product price
    const finalPrice = price_unit !== undefined ? price_unit : product.list_price;
    
    // Create order line
    const lineId = await callOdoo<number>(
      "pos.order.line",
      "create",
      [{
        order_id: orderId,
        product_id: product_id,
        qty: quantity,
        price_unit: finalPrice,
        discount: discount || 0
      }]
    );
    
    // Read back the created line
    const lines = await callOdoo<any[]>(
      "pos.order.line",
      "read",
      [[lineId]],
      {
        fields: [
          'id', 'product_id', 'qty', 'price_unit', 
          'price_subtotal', 'price_subtotal_incl',
          'discount'
        ]
      }
    );
    
    // Get updated order total
    const updatedOrders = await callOdoo<any[]>(
      "pos.order",
      "read",
      [[orderId]],
      { fields: ['amount_total'] }
    );
    
    res.status(201).json({
      message: "Product added to order",
      line: lines[0],
      product_name: product.name,
      order_total: updatedOrders[0].amount_total
    });
  } catch (error: any) {
    console.error("Error adding product to order:", error);
    res.status(500).json({
      error: "Failed to add product to order",
      message: error.message
    });
  }
};

/**
 * Remove product line from order
 */
export const removeOrderLine = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const lineId = parseInt(req.params.lineId);
    
    // Check if order exists and is in draft state
    const orderStatus = await isOrderEditable(orderId);
    
    if (!orderStatus.exists) {
      return res.status(404).json({
        error: "Order not found"
      });
    }
    
    if (!orderStatus.editable) {
      return res.status(400).json({
        error: "Order cannot be modified",
        message: "Only draft orders can be modified"
      });
    }
    
    // Check if line exists
    const lines = await callOdoo<any[]>(
      "pos.order.line",
      "search_read",
      [[
        ['id', '=', lineId],
        ['order_id', '=', orderId]
      ]],
      { fields: ['id', 'product_id'] }
    );
    
    if (!lines || lines.length === 0) {
      return res.status(404).json({
        error: "Order line not found"
      });
    }
    
    const productName = lines[0].product_id[1];
    
    // Delete line
    await callOdoo(
      "pos.order.line",
      "unlink",
      [[lineId]]
    );
    
    // Get updated order total
    const updatedOrders = await callOdoo<any[]>(
      "pos.order",
      "read",
      [[orderId]],
      { fields: ['amount_total'] }
    );
    
    res.json({
      message: "Product removed from order",
      product_name: productName,
      order_total: updatedOrders[0].amount_total
    });
  } catch (error: any) {
    console.error("Error removing product from order:", error);
    res.status(500).json({
      error: "Failed to remove product from order",
      message: error.message
    });
  }
};

/**
 * Apply discount to order
 */
export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { discount_type, discount_value, line_id } = req.body as DiscountRequest;
    
    if (!discount_type || discount_value === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Discount type and value are required"
      });
    }
    
    // Check if order exists and is in draft state
    const orderStatus = await isOrderEditable(orderId);
    
    if (!orderStatus.exists) {
      return res.status(404).json({
        error: "Order not found"
      });
    }
    
    if (!orderStatus.editable) {
      return res.status(400).json({
        error: "Order cannot be modified",
        message: "Only draft orders can be modified"
      });
    }
    
    if (line_id) {
      // Apply discount to specific line
      const lines = await callOdoo<any[]>(
        "pos.order.line",
        "search_read",
        [[
          ['id', '=', line_id],
          ['order_id', '=', orderId]
        ]],
        { fields: ['id', 'price_unit', 'product_id'] }
      );
      
      if (!lines || lines.length === 0) {
        return res.status(404).json({
          error: "Order line not found"
        });
      }
      
      // Calculate discount
      let discountAmount = 0;
      if (discount_type === 'percentage') {
        discountAmount = Math.min(Math.max(discount_value, 0), 100);
      } else if (discount_type === 'fixed') {
        // Convert fixed amount to percentage
        const percentage = (discount_value / lines[0].price_unit) * 100;
        discountAmount = Math.min(Math.max(percentage, 0), 100);
      }
      
      // Update line
      await callOdoo(
        "pos.order.line",
        "write",
        [[line_id], { discount: discountAmount }]
      );
      
      res.json({
        message: "Discount applied to product",
        product_name: lines[0].product_id[1],
        discount_percentage: discountAmount
      });
    } else {
      // Apply discount to all lines
      const lines = await callOdoo<any[]>(
        "pos.order.line",
        "search_read",
        [[['order_id', '=', orderId]]],
        { fields: ['id', 'price_unit'] }
      );
      
      if (!lines || lines.length === 0) {
        return res.status(400).json({
          error: "No order lines",
          message: "Order has no lines to apply discount to"
        });
      }
      
      // Apply discount to each line
      for (const line of lines) {
        let discountAmount = 0;
        if (discount_type === 'percentage') {
          discountAmount = Math.min(Math.max(discount_value, 0), 100);
        } else if (discount_type === 'fixed') {
          // For fixed, we distribute evenly
          const percentage = (discount_value / lines.length / line.price_unit) * 100;
          discountAmount = Math.min(Math.max(percentage, 0), 100);
        }
        
        await callOdoo(
          "pos.order.line",
          "write",
          [[line.id], { discount: discountAmount }]
        );
      }
      
      // Get updated order details
      const updatedOrders = await callOdoo<any[]>(
        "pos.order",
        "read",
        [[orderId]],
        { fields: ['amount_total'] }
      );
      
      res.json({
        message: "Discount applied to all products",
        discount_type: discount_type,
        discount_value: discount_value,
        order_total: updatedOrders[0].amount_total
      });
    }
  } catch (error: any) {
    console.error("Error applying discount:", error);
    res.status(500).json({
      error: "Failed to apply discount",
      message: error.message
    });
  }
};

/**
 * Search products (for adding to order)
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!query) {
      return res.status(400).json({
        error: "Missing search query",
        message: "Search query parameter 'q' is required"
      });
    }
    
    // Build domain to search by barcode, name or reference
    const domain: any[] = [
      '|', '|',
      ['barcode', '=', query],          // Exact match on barcode
      ['name', 'ilike', `%${query}%`],  // Partial match on name
      ['default_code', 'ilike', `%${query}%`]  // Partial match on reference
    ];
    
    const products = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [domain],
      { 
        fields: ['id', 'name', 'list_price', 'barcode', 'default_code', 'image_small'],
        limit
      }
    );
    
    res.json({
      count: products.length,
      products: products
    });
  } catch (error: any) {
    console.error("Error searching products:", error);
    res.status(500).json({
      error: "Failed to search products",
      message: error.message
    });
  }
};