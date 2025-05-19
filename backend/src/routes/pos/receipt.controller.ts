import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";

/**
 * Helper function to format monetary values to 2 decimal places
 */
const formatPrice = (price: number | string): string => {
  if (typeof price === "number") {
    return price.toFixed(2);
  }
  if (typeof price === "string" && !isNaN(parseFloat(price))) {
    return parseFloat(price).toFixed(2);
  }
  return "0.00";
};

/**
 * Format receipt data with company and order details
 */
const formatReceiptData = (
  order: any,
  lines: any[],
  payments: any[],
  company: any
) => {
  const companyAddress = company.street
    ? `${company.street}${company.city ? ", " + company.city : ""}${
        company.state_id ? ", " + company.state_id[1] : ""
      }${company.zip ? " " + company.zip : ""}`
    : "";

  return {
    company: {
      name: company.name || "My Company",
      address: companyAddress || ", ",
      vat: company.vat || "",
      phone: company.phone || "",
      email: company.email || "",
    },
    order: {
      id: order.id,
      name: order.name,
      date: new Date(order.date_order).toLocaleString(),
      reference: order.pos_reference || false,
      customer: order.partner_id ? order.partner_id[1] : "Walk-in Customer",
    },
    lines: lines.map((line) => ({
      product: line.product_id[1],
      quantity: line.qty,
      unit_price: formatPrice(line.price_unit),
      discount: line.discount,
      subtotal: formatPrice(line.price_subtotal),
    })),
    payments: payments.map((payment) => ({
      method: payment.payment_method_id[1],
      amount: formatPrice(payment.amount),
    })),
    totals: {
      subtotal: formatPrice(order.amount_total - order.amount_tax),
      tax: formatPrice(order.amount_tax),
      total: formatPrice(order.amount_total),
    },
  };
};

/**
 * Get receipt data for a specific order
 */
export const generateReceipt = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: "Invalid order ID",
        message: "Order ID must be a number",
      });
    }

    // Get order details
    const orderData = await getOrderReceiptData(orderId);

    if (!orderData) {
      return res.status(404).json({
        error: "Order not found",
        message: `No order found with ID ${orderId}`,
      });
    }

    return res.json(orderData);
  } catch (error: any) {
    console.error("Error generating receipt:", error);
    return res.status(500).json({
      error: "Failed to generate receipt",
      message: error.message || "An unexpected error occurred",
    });
  }
};

/**
 * Generate HTML receipt for printing
 */
export const generateHtmlReceipt = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: "Invalid order ID",
        message: "Order ID must be a number",
      });
    }

    // Get order details
    const receiptData = await getOrderReceiptData(orderId);

    if (!receiptData) {
      return res.status(404).json({
        error: "Order not found",
        message: `No order found with ID ${orderId}`,
      });
    }

    // Generate HTML content
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${receiptData.order.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; max-width: 300px; }
        .header { text-align: center; margin-bottom: 10px; }
        .company-name { font-size: 18px; font-weight: bold; }
        .info { font-size: 12px; margin-bottom: 5px; }
        .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
        .item { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
        .item-name { flex: 3; }
        .item-qty { flex: 1; text-align: right; }
        .item-price { flex: 1; text-align: right; }
        .item-total { flex: 1; text-align: right; }
        .payment { display: flex; justify-content: space-between; font-size: 12px; }
        .total-line { display: flex; justify-content: space-between; font-size: 14px; margin-top: 5px; }
        .grand-total { font-weight: bold; }
        .footer { text-align: center; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${receiptData.company.name}</div>
        <div class="info">${receiptData.company.address}</div>
        ${
          receiptData.company.vat
            ? `<div class="info">VAT: ${receiptData.company.vat}</div>`
            : ""
        }
        ${
          receiptData.company.phone
            ? `<div class="info">Tel: ${receiptData.company.phone}</div>`
            : ""
        }
        ${
          receiptData.company.email
            ? `<div class="info">Email: ${receiptData.company.email}</div>`
            : ""
        }
      </div>
      
      <div class="info">Order: ${receiptData.order.name}</div>
      <div class="info">Date: ${receiptData.order.date}</div>
      <div class="info">Customer: ${receiptData.order.customer}</div>
      
      <div class="divider"></div>
      
      <div class="item" style="font-weight: bold;">
        <div class="item-name">Item</div>
        <div class="item-qty">Qty</div>
        <div class="item-price">Price</div>
        <div class="item-total">Total</div>
      </div>
      
      ${receiptData.lines
        .map(
          (line) => `
        <div class="item">
          <div class="item-name">${line.product}${
            line.discount > 0 ? ` (${line.discount}% off)` : ""
          }</div>
          <div class="item-qty">${line.quantity}</div>
          <div class="item-price">${line.unit_price}</div>
          <div class="item-total">${line.subtotal}</div>
        </div>
      `
        )
        .join("")}
      
      <div class="divider"></div>
      
      <div class="total-line">
        <div>Subtotal:</div>
        <div>${receiptData.totals.subtotal}</div>
      </div>
      
      <div class="total-line">
        <div>Tax:</div>
        <div>${receiptData.totals.tax}</div>
      </div>
      
      <div class="total-line grand-total">
        <div>TOTAL:</div>
        <div>${receiptData.totals.total}</div>
      </div>
      
      <div class="divider"></div>
      
      ${receiptData.payments
        .map(
          (payment) => `
        <div class="payment">
          <div>${payment.method}:</div>
          <div>${payment.amount}</div>
        </div>
      `
        )
        .join("")}
      
      <div class="footer">
        Thank you for your purchase!
      </div>
    </body>
    </html>
    `;

    // Send HTML response
    res.setHeader("Content-Type", "text/html");
    return res.send(html);
  } catch (error: any) {
    console.error("Error generating HTML receipt:", error);
    return res.status(500).json({
      error: "Failed to generate HTML receipt",
      message: error.message || "An unexpected error occurred",
    });
  }
};

/**
 * Print receipt (stub for integration with printer systems)
 */
export const printReceipt = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    // This would integrate with a real printer system
    // For now, we'll just return success

    return res.json({
      success: true,
      message: "Receipt sent to printer",
      order_id: orderId,
    });
  } catch (error: any) {
    console.error("Error printing receipt:", error);
    return res.status(500).json({
      error: "Failed to print receipt",
      message: error.message || "An unexpected error occurred",
    });
  }
};

/**
 * Helper function to get all order data needed for receipts
 */
async function getOrderReceiptData(orderId: number) {
  // Get order details
  const orders = await callOdoo<any[]>(
    "pos.order",
    "search_read",
    [[["id", "=", orderId]]],
    {
      fields: [
        "id",
        "name",
        "date_order",
        "partner_id",
        "amount_total",
        "amount_tax",
        "state",
        "pos_reference",
      ],
    }
  );

  if (!orders || orders.length === 0) {
    return null;
  }

  const order = orders[0];

  // Get order lines
  const lines = await callOdoo<any[]>(
    "pos.order.line",
    "search_read",
    [[["order_id", "=", orderId]]],
    {
      fields: [
        "product_id",
        "qty",
        "price_unit",
        "discount",
        "price_subtotal",
        "price_subtotal_incl",
      ],
    }
  );

  // Get payments
  const payments = await callOdoo<any[]>(
    "pos.payment",
    "search_read",
    [[["pos_order_id", "=", orderId]]],
    {
      fields: ["payment_method_id", "amount"],
    }
  );

  // Get company info
  const companies = await callOdoo<any[]>("res.company", "search_read", [[]], {
    fields: [
      "name",
      "street",
      "city",
      "state_id",
      "zip",
      "vat",
      "phone",
      "email",
    ],
    limit: 1,
  });

  const company = companies[0];

  // Format the receipt data using the helper
  return formatReceiptData(order, lines, payments, company);
}
