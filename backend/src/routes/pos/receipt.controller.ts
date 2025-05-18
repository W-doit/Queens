// Receipt generation controller

// Receipt generation controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { ReceiptResponse } from "../../types/pos";
import {
  formatReceiptData,
  generateHtmlReceipt as createHtmlReceipt,
} from "../../utils/receipt.helper";

/**
 * Generate receipt in JSON format
 */
export const generateReceipt = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    // Get receipt data
    const receiptData = await getReceiptData(orderId);

    res.json(receiptData);
  } catch (error: any) {
    console.error("Error generating receipt:", error);
    res.status(500).json({
      error: "Failed to generate receipt",
      message: error.message,
    });
  }
};

/**
 * Generate HTML receipt
 */
export const generateHtmlReceipt = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    // Get receipt data
    const receiptData = await getReceiptData(orderId);

    // Convert to HTML
    const html = createHtmlReceipt(receiptData);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error: any) {
    console.error("Error generating HTML receipt:", error);
    res.status(500).json({
      error: "Failed to generate HTML receipt",
      message: error.message,
    });
  }
};

/**
 * Print receipt (send to printer)
 */
export const printReceipt = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    // Verify order exists
    const orders = await callOdoo<any[]>("pos.order", "read", [[orderId]], {
      fields: ["id", "state"],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    // In a real implementation, you would:
    // 1. Generate the receipt content
    // 2. Send it to the printer service/API

    // For demo purposes, just acknowledge the request
    res.json({
      message: "Receipt sent to printer",
      order_id: orderId,
      print_job: `print-${Date.now()}`,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error printing receipt:", error);
    res.status(500).json({
      error: "Failed to print receipt",
      message: error.message,
    });
  }
};

/**
 * Helper function to get receipt data
 */
async function getReceiptData(orderId: number): Promise<ReceiptResponse> {
  // Get order details
  const orders = await callOdoo<any[]>("pos.order", "read", [[orderId]], {
    fields: [
      "id",
      "name",
      "date_order",
      "pos_reference",
      "amount_total",
      "amount_tax",
      "partner_id",
      "session_id",
    ],
  });

  if (!orders || orders.length === 0) {
    throw new Error("Order not found");
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

  // Get payment info
  const payments = await callOdoo<any[]>(
    "pos.payment",
    "search_read",
    [[["pos_order_id", "=", orderId]]],
    { fields: ["payment_method_id", "amount"] }
  );

  // Get company info
  const sessions = await callOdoo<any[]>(
    "pos.session",
    "read",
    [[order.session_id[0]]],
    { fields: ["config_id"] }
  );

  const configs = await callOdoo<any[]>(
    "pos.config",
    "read",
    [[sessions[0].config_id[0]]],
    { fields: ["company_id"] }
  );

  const companies = await callOdoo<any[]>(
    "res.company",
    "read",
    [[configs[0].company_id[0]]],
    {
      fields: [
        "name",
        "street",
        "city",
        "zip",
        "country_id",
        "vat",
        "email",
        "phone",
      ],
    }
  );

  const company = companies[0];

  // Format the receipt data using the helper
  return formatReceiptData(order, lines, payments, company);
}
