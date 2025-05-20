// Sales transaction controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { OrderLineRequest, DiscountRequest } from "../../types/pos";
import {
  getActiveSession,
  isOrderEditable,
  getProductInfo,
} from "../../services/pos.service";

/**
 * Create new POS order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    // Get active session
    const session = await getActiveSession();
    console.log("Active session check:", session);

    if (!session) {
      return res.status(400).json({
        error: "No open session",
        message: "Please open a POS session before creating orders",
      });
    }

    // Extract order data from request body and validate it
    const { orderLines } = req.body;
    console.log("Received orderLines:", orderLines);

    // Check if orderLines exists and is an array
    if (!orderLines || !Array.isArray(orderLines) || orderLines.length === 0) {
      return res.status(400).json({
        error: "Invalid order data",
        message: "Order must contain at least one product line",
      });
    }

    // Prepare order lines for Odoo format with better error handling
    const preparedLines = [];
    let totalAmount = 0;

    for (const line of orderLines) {
      // Make sure each required property exists
      if (!line || typeof line.product_id === "undefined") {
        return res.status(400).json({
          error: "Invalid order line",
          message: "Each order line must have a product_id",
        });
      }

      // Support both 'quantity' and 'qty' since both might be used
      const qty = line.quantity || line.qty || 1;

      // First, get the product's price and taxes if not provided
      let price_unit = line.price_unit;
      let taxes_id = [];

      if (typeof price_unit === "undefined") {
        try {
          // Fetch the product to get its price and taxes
          const products = await callOdoo(
            "product.product",
            "search_read",
            [[["id", "=", line.product_id]]],
            { fields: ["id", "lst_price", "name", "taxes_id"] }
          );

          if (products && products.length > 0) {
            price_unit = products[0].lst_price;
            taxes_id = products[0].taxes_id || [];
            console.log(`Using product's list price: ${price_unit}`);
          } else {
            // Default price if product not found
            price_unit = 0;
            console.warn(
              `Product ${line.product_id} not found, using zero price`
            );
          }
        } catch (error) {
          console.error("Error fetching product price:", error);
          price_unit = 0; // Fallback price
        }
      }

      // Calculate price_subtotal (price after discount * quantity without taxes)
      const discount_amount = (price_unit * (line.discount || 0)) / 100;
      const price_after_discount = price_unit - discount_amount;
      const price_subtotal = price_after_discount * qty;

      // For simplicity, we'll assume price_subtotal_incl is the same as price_subtotal
      // In production, you would calculate this properly based on tax rules
      const price_subtotal_incl = price_subtotal;

      totalAmount += price_subtotal_incl;

      // Create the line object with all required fields
      const lineObj: any = {
        product_id: line.product_id,
        qty: qty,
        price_unit: price_unit,
        price_subtotal: price_subtotal,
        price_subtotal_incl: price_subtotal_incl, // Add this field
        discount: line.discount || 0,
      };

      preparedLines.push([0, 0, lineObj]);
    }

    console.log("Prepared lines for Odoo:", JSON.stringify(preparedLines));

    // Create order data for Odoo
    const orderData = {
      session_id: session.id,
      lines: preparedLines,
      partner_id: req.body.customer_id || false,
      amount_tax: 0, // Will be calculated by Odoo
      amount_total: totalAmount, // Set the calculated total amount
      amount_paid: 0,
      amount_return: 0,
      company_id:
        session.company_id && Array.isArray(session.company_id)
          ? session.company_id[0]
          : 1,
      state: "draft",
    };

    console.log(
      "Order data being sent to Odoo:",
      JSON.stringify(orderData, null, 2)
    );

    // Call Odoo to create the order
    const result = await callOdoo("pos.order", "create", [orderData]);
    console.log("Order creation result:", result);

    if (!result) {
      return res.status(500).json({
        error: "Failed to create order",
        message: "Odoo returned an invalid response",
      });
    }

    // Read back the created order to get full details
    try {
      const orders = await callOdoo("pos.order", "read", [[result]], {
        fields: ["id", "name", "amount_total", "state"],
      });

      return res.status(201).json({
        success: true,
        order: orders && orders.length > 0 ? orders[0] : { id: result },
        message: "Order created successfully",
      });
    } catch (readError: any) {
      console.log("Error reading order after creation:", readError);
      // If we can't read back the order but it was created, still return success
      return res.status(201).json({
        success: true,
        order: { id: result },
        message: "Order created but details couldn't be retrieved",
      });
    }
  } catch (error: any) {
    console.error("Error creating POS order:", error);
    return res.status(500).json({
      error: "Failed to create POS order",
      message: error.message || "An unexpected error occurred",
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
    const orders = await callOdoo<any[]>("pos.order", "read", [[orderId]], {
      fields: [
        "id",
        "name",
        "date_order",
        "partner_id",
        "amount_total",
        "state",
        "pos_reference",
        "session_id",
      ],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    const order = orders[0];

    // Get order lines
    const lines = await callOdoo<any[]>(
      "pos.order.line",
      "search_read",
      [[["order_id", "=", orderId]]],
      {
        fields: [
          "id",
          "product_id",
          "qty",
          "price_unit",
          "price_subtotal",
          "price_subtotal_incl",
          "discount",
        ],
      }
    );

    // Format response
    const response = {
      ...order,
      lines,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error getting POS order:", error);
    res.status(500).json({
      error: "Failed to get POS order",
      message: error.message,
    });
  }
};

/**
 * Add product line to order
 */
export const addOrderLine = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { product_id, quantity, price_unit, discount } =
      req.body as OrderLineRequest;

    if (!product_id || !quantity) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Product ID and quantity are required",
      });
    }

    // Check if order exists and is in draft state
    const orderStatus = await isOrderEditable(orderId);

    if (!orderStatus.exists) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (!orderStatus.editable) {
      return res.status(400).json({
        error: "Order cannot be modified",
        message: "Only draft orders can be modified",
      });
    }

    // Get product info
    const product = await getProductInfo(product_id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    // Use provided price or default to product price
    const finalPrice =
      price_unit !== undefined ? price_unit : product.list_price;

    // Create order line
    const lineId = await callOdoo<number>("pos.order.line", "create", [
      {
        order_id: orderId,
        product_id: product_id,
        qty: quantity,
        price_unit: finalPrice,
        discount: discount || 0,
      },
    ]);

    // Read back the created line
    const lines = await callOdoo<any[]>("pos.order.line", "read", [[lineId]], {
      fields: [
        "id",
        "product_id",
        "qty",
        "price_unit",
        "price_subtotal",
        "price_subtotal_incl",
        "discount",
      ],
    });

    // Get updated order total
    const updatedOrders = await callOdoo<any[]>(
      "pos.order",
      "read",
      [[orderId]],
      { fields: ["amount_total"] }
    );

    res.status(201).json({
      message: "Product added to order",
      line: lines[0],
      product_name: product.name,
      order_total: updatedOrders[0].amount_total,
    });
  } catch (error: any) {
    console.error("Error adding product to order:", error);
    res.status(500).json({
      error: "Failed to add product to order",
      message: error.message,
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
        error: "Order not found",
      });
    }

    if (!orderStatus.editable) {
      return res.status(400).json({
        error: "Order cannot be modified",
        message: "Only draft orders can be modified",
      });
    }

    // Check if line exists
    const lines = await callOdoo<any[]>(
      "pos.order.line",
      "search_read",
      [
        [
          ["id", "=", lineId],
          ["order_id", "=", orderId],
        ],
      ],
      { fields: ["id", "product_id"] }
    );

    if (!lines || lines.length === 0) {
      return res.status(404).json({
        error: "Order line not found",
      });
    }

    const productName = lines[0].product_id[1];

    // Delete line
    await callOdoo("pos.order.line", "unlink", [[lineId]]);

    // Get updated order total
    const updatedOrders = await callOdoo<any[]>(
      "pos.order",
      "read",
      [[orderId]],
      { fields: ["amount_total"] }
    );

    res.json({
      message: "Product removed from order",
      product_name: productName,
      order_total: updatedOrders[0].amount_total,
    });
  } catch (error: any) {
    console.error("Error removing product from order:", error);
    res.status(500).json({
      error: "Failed to remove product from order",
      message: error.message,
    });
  }
};

/**
 * Apply discount to order
 */
export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { discount_type, discount_value, line_id } =
      req.body as DiscountRequest;

    if (!discount_type || discount_value === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Discount type and value are required",
      });
    }

    // Check if order exists and is in draft state
    const orderStatus = await isOrderEditable(orderId);

    if (!orderStatus.exists) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (!orderStatus.editable) {
      return res.status(400).json({
        error: "Order cannot be modified",
        message: "Only draft orders can be modified",
      });
    }

    if (line_id) {
      // Apply discount to specific line
      const lines = await callOdoo<any[]>(
        "pos.order.line",
        "search_read",
        [
          [
            ["id", "=", line_id],
            ["order_id", "=", orderId],
          ],
        ],
        { fields: ["id", "price_unit", "product_id"] }
      );

      if (!lines || lines.length === 0) {
        return res.status(404).json({
          error: "Order line not found",
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (discount_type === "percentage") {
        discountAmount = Math.min(Math.max(discount_value, 0), 100);
      } else if (discount_type === "fixed") {
        // Convert fixed amount to percentage
        const percentage = (discount_value / lines[0].price_unit) * 100;
        discountAmount = Math.min(Math.max(percentage, 0), 100);
      }

      // Update line
      await callOdoo("pos.order.line", "write", [
        [line_id],
        { discount: discountAmount },
      ]);

      res.json({
        message: "Discount applied to product",
        product_name: lines[0].product_id[1],
        discount_percentage: discountAmount,
      });
    } else {
      // Apply discount to all lines
      const lines = await callOdoo<any[]>(
        "pos.order.line",
        "search_read",
        [[["order_id", "=", orderId]]],
        { fields: ["id", "price_unit"] }
      );

      if (!lines || lines.length === 0) {
        return res.status(400).json({
          error: "No order lines",
          message: "Order has no lines to apply discount to",
        });
      }

      // Apply discount to each line
      for (const line of lines) {
        let discountAmount = 0;
        if (discount_type === "percentage") {
          discountAmount = Math.min(Math.max(discount_value, 0), 100);
        } else if (discount_type === "fixed") {
          // For fixed, we distribute evenly
          const percentage =
            (discount_value / lines.length / line.price_unit) * 100;
          discountAmount = Math.min(Math.max(percentage, 0), 100);
        }

        await callOdoo("pos.order.line", "write", [
          [line.id],
          { discount: discountAmount },
        ]);
      }

      // Get updated order details
      const updatedOrders = await callOdoo<any[]>(
        "pos.order",
        "read",
        [[orderId]],
        { fields: ["amount_total"] }
      );

      res.json({
        message: "Discount applied to all products",
        discount_type: discount_type,
        discount_value: discount_value,
        order_total: updatedOrders[0].amount_total,
      });
    }
  } catch (error: any) {
    console.error("Error applying discount:", error);
    res.status(500).json({
      error: "Failed to apply discount",
      message: error.message,
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
        message: "Search query parameter 'q' is required",
      });
    }

    // Build domain to search by barcode, name or reference
    const domain: any[] = [
      "|",
      "|",
      ["barcode", "=", query], // Exact match on barcode
      ["name", "ilike", `%${query}%`], // Partial match on name
      ["default_code", "ilike", `%${query}%`], // Partial match on reference
    ];

    const products = await callOdoo<any[]>(
      "product.product",
      "search_read",
      [domain],
      {
        fields: [
          "id",
          "name",
          "list_price",
          "barcode",
          "default_code",
          "image_small",
        ],
        limit,
      }
    );

    res.json({
      count: products.length,
      products: products,
    });
  } catch (error: any) {
    console.error("Error searching products:", error);
    res.status(500).json({
      error: "Failed to search products",
      message: error.message,
    });
  }
};

/**
 * Get all POS orders
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const { limit = 20, offset = 0, status } = req.query;

    // Build domain for filtering
    let domain: any[] = [];

    // Add status filter if provided
    if (status) {
      domain.push(["state", "=", status]);
    }

    // Get orders
    const orders = await callOdoo<any[]>("pos.order", "search_read", [domain], {
      fields: [
        "id",
        "name",
        "date_order",
        "amount_total",
        "state",
        "partner_id",
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: "date_order desc",
    });

    if (!orders) {
      return res.status(500).json({
        error: "Failed to fetch orders",
        message: "Unexpected response from Odoo",
      });
    }

    // Return formatted orders
    return res.json({
      count: orders.length,
      orders: orders.map((order) => ({
        id: order.id,
        name: order.name,
        date: order.date_order,
        amount: order.amount_total,
        status: order.state,
        customer: order.partner_id
          ? {
              id: order.partner_id[0],
              name: order.partner_id[1],
            }
          : null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      error: "Failed to fetch orders",
      message: error.message || "An unexpected error occurred",
    });
  }
};

/**
 * Confirm an order to process stock movements
 */
export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: "Invalid order ID",
        message: "Order ID must be a number",
      });
    }

    // First check if the order exists and is in paid state
    const orders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [[["id", "=", orderId]]],
      { fields: ["id", "name", "state", "picking_id", "amount_total"] }
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: `No order found with ID ${orderId}`,
      });
    }

    const order = orders[0];

    // If order is not paid, we need to mark it as paid first
    if (order.state !== "paid" && order.state === "draft") {
      console.log("Order is not paid yet, marking as paid first...");

      // First create a payment
      const paymentMethods = await callOdoo<any[]>(
        "pos.payment.method",
        "search",
        [[]],
        { limit: 1 }
      );

      if (!paymentMethods || paymentMethods.length === 0) {
        return res.status(500).json({
          error: "No payment methods found",
          message: "Cannot confirm order without payment method",
        });
      }

      // Create payment for the order
      await callOdoo("pos.payment", "create", [
        {
          name: new Date().toISOString(),
          payment_method_id: paymentMethods[0],
          amount: order.amount_total,
          pos_order_id: orderId,
        },
      ]);

      // Mark order as paid
      await callOdoo("pos.order", "write", [
        [orderId],
        {
          state: "paid",
          amount_paid: order.amount_total,
        },
      ]);

      console.log("Order marked as paid");
    }

    // Now try all methods to ensure stock movements are processed
    console.log(`Processing stock movements for order ${orderId}...`);

    try {
      // Method 1: Try to create the picking (stock move)
      await callOdoo("pos.order", "create_picking", [[orderId]]);
      console.log("Created picking for order");
    } catch (error) {
      console.warn("create_picking failed:", error);
      // Continue with other methods
    }

    try {
      // Method 2: Try processing the picking
      if (order.picking_id) {
        await callOdoo("stock.picking", "action_confirm", [
          [order.picking_id[0]],
        ]);
        await callOdoo("stock.picking", "action_assign", [
          [order.picking_id[0]],
        ]);
        await callOdoo("stock.picking", "button_validate", [
          [order.picking_id[0]],
        ]);
        console.log("Processed existing picking");
      }
    } catch (error) {
      console.warn("Processing existing picking failed:", error);
      // Continue with other methods
    }

    try {
      // Method 3: Try finalizing the order
      await callOdoo("pos.order", "action_pos_order_done", [[orderId]]);
      console.log("Finalized order");
    } catch (error) {
      console.warn("action_pos_order_done failed:", error);
      // Continue anyway
    }

    // Get updated order status
    const updatedOrders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [[["id", "=", orderId]]],
      { fields: ["id", "name", "state", "picking_id"] }
    );

    // Check if stock movements were created by looking at picking_id
    const hasStockMovements =
      updatedOrders[0].picking_id && updatedOrders[0].picking_id.length > 0;

    return res.json({
      success: true,
      order: updatedOrders[0],
      inventory_updated: hasStockMovements,
      message: hasStockMovements
        ? "Order confirmed and stock updated"
        : "Order confirmed but no stock movements were created",
    });
  } catch (error: any) {
    console.error("Error confirming order:", error);
    return res.status(500).json({
      error: "Failed to confirm order",
      message: error.message || "An unexpected error occurred",
    });
  }
};

/**
 * Simplified debug endpoint for stock processing
 */
export const debugStockProcessing = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    console.log(`DEBUG: Processing stock movements for order ${orderId}...`);

    // 1. Get the order
    const orders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [[["id", "=", orderId]]],
      { fields: ["id", "name", "state", "session_id", "lines"] }
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: `Order with ID ${orderId} not found`,
      });
    }

    const order = orders[0];
    console.log("DEBUG: Found order:", order);

    // 2. Get the order lines to identify products
    const lineIds = order.lines || [];

    if (!lineIds || lineIds.length === 0) {
      return res.json({
        error: "No order lines",
        message: "Order doesn't contain any products",
        order: order,
      });
    }

    console.log("DEBUG: Found line IDs:", lineIds);

    const orderLines = await callOdoo<any[]>(
      "pos.order.line",
      "search_read",
      [[["id", "in", lineIds]]],
      { fields: ["id", "product_id", "qty", "price_unit"] }
    );

    console.log("DEBUG: Order lines:", orderLines);

    // 3. Check if stock moves were created for this order
    // In Odoo 16, POS orders might use stock.move directly without picking
    const productIds = orderLines.map((line) => line.product_id[0]);

    // Search for stock moves related to these products around this order time
    const stockMoves = await callOdoo<any[]>(
      "stock.move",
      "search_read",
      [
        [
          ["product_id", "in", productIds],
          ["origin", "ilike", order.name],
        ],
      ],
      {
        fields: [
          "id",
          "name",
          "product_id",
          "product_uom_qty",
          "quantity_done",
          "state",
          "origin",
        ],
      }
    );

    console.log("DEBUG: Stock moves by origin:", stockMoves);

    // 4. Try alternative ways to find stock movements
    let pickingIds: number[] = [];

    // Search for stock pickings with this order name
    const pickings = await callOdoo<any[]>(
      "stock.picking",
      "search_read",
      [[["origin", "ilike", order.name]]],
      { fields: ["id", "name", "state", "move_lines", "origin"] }
    );

    if (pickings && pickings.length > 0) {
      pickingIds = pickings.map((p) => p.id);
      console.log("DEBUG: Found pickings by name:", pickingIds);
    } else {
      console.log("DEBUG: No pickings found by name search");
    }

    // 5. Try to create stock movements manually
    let success = false;
    let manualCreation = null;

    if (stockMoves.length === 0 && pickings.length === 0) {
      try {
        console.log(
          "DEBUG: No existing stock movements found, trying to create..."
        );

        // Try to call create_picking method directly
        await callOdoo("pos.order", "create_picking", [[orderId]]);

        // Check if it worked
        const newPickings = await callOdoo<any[]>(
          "stock.picking",
          "search_read",
          [[["origin", "ilike", order.name]]],
          { fields: ["id", "name", "state"] }
        );

        if (newPickings && newPickings.length > 0) {
          manualCreation = {
            success: true,
            pickings: newPickings,
          };

          // Process these pickings
          for (const picking of newPickings) {
            try {
              // Confirm if needed
              if (picking.state === "draft") {
                await callOdoo("stock.picking", "action_confirm", [
                  [picking.id],
                ]);
              }

              // Assign
              await callOdoo("stock.picking", "action_assign", [[picking.id]]);

              // Get moves to set quantities
              const moves = await callOdoo<any[]>(
                "stock.move",
                "search_read",
                [[["picking_id", "=", picking.id]]],
                { fields: ["id", "product_id", "product_uom_qty"] }
              );

              // Set quantities
              for (const move of moves) {
                await callOdoo("stock.move", "write", [
                  [move.id],
                  { quantity_done: move.product_uom_qty },
                ]);
              }

              // Validate
              try {
                await callOdoo("stock.picking", "button_validate", [
                  [picking.id],
                ]);
                success = true;
              } catch (validateError: any) {
                console.log("DEBUG: Validation error, trying wizard");

                // Try with wizard
                const wizardId = await callOdoo(
                  "stock.immediate.transfer",
                  "create",
                  [
                    {
                      pick_ids: [[6, 0, [picking.id]]],
                    },
                  ]
                );

                await callOdoo("stock.immediate.transfer", "process", [
                  [wizardId],
                ]);
                success = true;
              }
            } catch (processError: any) {
              console.log(
                `DEBUG: Error processing picking ${picking.id}:`,
                processError.message
              );
            }
          }
        } else {
          manualCreation = {
            success: false,
            message: "create_picking called but no new pickings found",
          };
        }
      } catch (createError: any) {
        manualCreation = {
          success: false,
          error: createError.message,
        };
        console.log("DEBUG: Error creating picking:", createError.message);
      }
    }

    // 6. Check the stock levels for the products
    const stockChecks = [];

    for (const line of orderLines) {
      try {
        const productStock = await callOdoo<any[]>(
          "product.product",
          "read",
          [[line.product_id[0]]],
          { fields: ["id", "name", "qty_available", "virtual_available"] }
        );

        if (productStock && productStock.length > 0) {
          stockChecks.push({
            product_id: line.product_id[0],
            product_name: line.product_id[1],
            qty_ordered: line.qty,
            qty_available: productStock[0].qty_available,
            virtual_available: productStock[0].virtual_available,
          });
        }
      } catch (error: any) {
        console.log(
          `DEBUG: Error checking stock for ${line.product_id[1]}:`,
          error.message
        );
      }
    }

    // 7. If everything else failed, try direct stock adjustment
    let directAdjustment = null;

    if (!success && stockChecks.length > 0) {
      try {
        console.log("DEBUG: Attempting direct stock adjustment as fallback");

        // Find the warehouse/location
        const locations = await callOdoo<any[]>(
          "stock.location",
          "search_read",
          [[["usage", "=", "internal"]]],
          { fields: ["id", "name"], limit: 1 }
        );

        if (locations && locations.length > 0) {
          const locationId = locations[0].id;

          // Create inventory adjustment for each product
          for (const line of orderLines) {
            // Create inventory adjustment
            try {
              // Check if we need to use inventory.adjustment or stock.quant depending on Odoo version
              let success = false;

              // Try stock.quant method first (Odoo 16+)
              try {
                // Get current quants
                const quants = await callOdoo<any[]>(
                  "stock.quant",
                  "search_read",
                  [
                    [
                      ["product_id", "=", line.product_id[0]],
                      ["location_id", "=", locationId],
                    ],
                  ],
                  { fields: ["id", "quantity"] }
                );

                if (quants && quants.length > 0) {
                  // Update existing quant
                  const quantId = quants[0].id;
                  const newQty = Math.max(0, quants[0].quantity - line.qty);

                  await callOdoo("stock.quant", "write", [
                    [quantId],
                    { inventory_quantity: newQty },
                  ]);

                  await callOdoo("stock.quant", "action_apply_inventory", [
                    [quantId],
                  ]);
                  success = true;
                } else {
                  // Create new quant with negative adjustment
                  const quantId = await callOdoo("stock.quant", "create", [
                    {
                      product_id: line.product_id[0],
                      location_id: locationId,
                      inventory_quantity: -line.qty,
                    },
                  ]);

                  await callOdoo("stock.quant", "action_apply_inventory", [
                    [quantId],
                  ]);
                  success = true;
                }
              } catch (quantError: any) {
                console.log(
                  "DEBUG: Stock quant approach failed:",
                  quantError.message
                );
              }

              if (success) {
                console.log(
                  `DEBUG: Successfully adjusted stock for ${line.product_id[1]}`
                );
              }
            } catch (adjustError: any) {
              console.log(
                `DEBUG: Error with inventory adjustment:`,
                adjustError.message
              );
            }
          }

          // Check stock again after adjustment
          const afterAdjustment = [];

          for (const line of orderLines) {
            const productStock = await callOdoo<any[]>(
              "product.product",
              "read",
              [[line.product_id[0]]],
              { fields: ["id", "name", "qty_available"] }
            );

            if (productStock && productStock.length > 0) {
              afterAdjustment.push({
                product_id: line.product_id[0],
                product_name: line.product_id[1],
                qty_available: productStock[0].qty_available,
              });
            }
          }

          directAdjustment = {
            success: true,
            after_adjustment: afterAdjustment,
          };
        } else {
          directAdjustment = {
            success: false,
            message: "No internal location found",
          };
        }
      } catch (directError: any) {
        directAdjustment = {
          success: false,
          error: directError.message,
        };
        console.log("DEBUG: Direct adjustment error:", directError.message);
      }
    }

    // 8. Return all the debugging information
    return res.json({
      order_id: orderId,
      order_name: order.name,
      order_state: order.state,
      order_lines: orderLines,
      stock_movements: {
        stock_moves_found: stockMoves,
        pickings_found: pickings,
        manual_creation: manualCreation,
        direct_adjustment: directAdjustment,
      },
      stock_levels: stockChecks,
      stock_updated: success,
    });
  } catch (error: any) {
    console.error("Error in debug endpoint:", error);
    return res.status(500).json({
      error: "Debug endpoint error",
      message: error.message,
    });
  }
};
