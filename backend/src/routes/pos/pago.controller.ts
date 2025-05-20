// Payment processing controller

// Payment processing controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { PaymentRequest } from "../../types/pos";

// Add the import at the top
import {
  getActiveSession,
  isOrderEditable,
  processStockMovements,
  processStockMovementsDirect,
} from "../../services/pos.service";

/**
 * Process payment for an order
 */
export const processPayment = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { payment_method, amount } = req.body;

    // Validate required fields
    if (!payment_method || amount === undefined) {
      return res.status(400).json({
        error: "Missing payment information",
        message: "Payment method and amount are required",
      });
    }

    // Get order details
    const orders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [[["id", "=", orderId]]],
      { fields: ["id", "name", "amount_total", "state", "session_id"] }
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: `Order with ID ${orderId} not found`,
      });
    }

    const order = orders[0];

    // Check if order is already paid
    if (order.state === "paid" || order.state === "done") {
      return res.status(400).json({
        error: "Order already paid",
        message: "This order has already been paid",
      });
    }

    // Check if payment amount is sufficient
    const paymentDifference = Math.abs(amount - order.amount_total);
    if (amount < order.amount_total && paymentDifference > 0.01) {
      return res.status(400).json({
        error: "Insufficient payment",
        message: `Payment amount (${amount}) is less than order total (${order.amount_total})`,
      });
    }

    // Get payment methods
    const paymentMethods = await callOdoo<any[]>(
      "pos.payment.method",
      "search_read",
      [[["name", "ilike", payment_method]]],
      { fields: ["id", "name"] }
    );

    if (!paymentMethods || paymentMethods.length === 0) {
      // Get available methods for better error message
      const allMethods = await callOdoo<any[]>(
        "pos.payment.method",
        "search_read",
        [[]],
        { fields: ["id", "name"] }
      );

      return res.status(400).json({
        error: "Invalid payment method",
        message: `Payment method '${payment_method}' not found. Available methods: ${allMethods
          .map((m) => m.name)
          .join(", ")}`,
      });
    }

    const paymentMethodId = paymentMethods[0].id;

    // Create the payment line
    const paymentData = {
      name: new Date().toISOString(),
      payment_method_id: paymentMethodId,
      amount: amount,
      pos_order_id: orderId,
    };

    // Create payment
    const paymentId = await callOdoo("pos.payment", "create", [paymentData]);
    console.log("Payment created with ID:", paymentId);

    // Mark order as paid
    await callOdoo("pos.order", "write", [
      [orderId],
      {
        state: "paid",
        amount_paid: amount,
        amount_return:
          amount - order.amount_total > 0 ? amount - order.amount_total : 0,
      },
    ]);

    console.log("Updated order state to paid");

    // Process payment in Odoo
    try {
      await callOdoo("pos.order", "action_pos_order_paid", [[orderId]]);
      console.log("Called action_pos_order_paid");
    } catch (actionError: any) {
      console.warn("Error calling action_pos_order_paid:", actionError.message);
      // Continue anyway as this is not critical
    }

    // Process stock movements with both approaches
    let stockProcessed = false;

    // First try the standard approach
    try {
      console.log("Attempting standard stock movement processing...");
      stockProcessed = await processStockMovements(orderId);
    } catch (stockError: any) {
      console.warn("Standard stock processing failed:", stockError.message);
    }

    // If standard approach failed, use direct adjustment
    if (!stockProcessed) {
      console.log("Falling back to direct stock adjustment...");
      stockProcessed = await processStockMovementsDirect(orderId);
    }

    console.log(
      `Stock movements processed: ${
        stockProcessed ? "Successfully" : "With issues"
      }`
    );

    // Mark the order as done if needed
    try {
      await callOdoo("pos.order", "write", [[orderId], { state: "done" }]);
      console.log("Marked order as done");
    } catch (stateError: any) {
      console.warn("Error setting order to done state:", stateError.message);
    }

    // Get updated order details
    const updatedOrders = await callOdoo<any[]>(
      "pos.order",
      "search_read",
      [[["id", "=", orderId]]],
      { fields: ["id", "name", "amount_total", "state", "amount_paid"] }
    );

    if (!updatedOrders || updatedOrders.length === 0) {
      return res.status(404).json({
        error: "Order not found after payment",
        message: "The order could not be retrieved after payment processing",
      });
    }

    // Respond with updated order information
    return res.json({
      success: true,
      order: updatedOrders[0],
      stock_updated: stockProcessed,
      message:
        "Payment processed successfully" +
        (stockProcessed ? "" : " (stock update pending)"),
    });
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      error: "Failed to process payment",
      message: error.message || "An unexpected error occurred",
    });
  }
};

/**
 * Get available payment methods
 */
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const session = await getActiveSession();

    if (!session) {
      return res.status(400).json({
        error: "No active session",
        message: "Please open a POS session first",
      });
    }

    // Get config ID to fetch payment methods
    const configs = await callOdoo<any[]>(
      "pos.config",
      "read",
      [[session.config_id[0]]],
      { fields: ["payment_method_ids"] }
    );

    if (!configs || configs.length === 0 || !configs[0].payment_method_ids) {
      return res.status(404).json({
        error: "No payment methods configured",
      });
    }

    // Get payment methods
    const methods = await callOdoo<any[]>(
      "pos.payment.method",
      "search_read",
      [[["id", "in", configs[0].payment_method_ids]]],
      { fields: ["id", "name", "is_cash_count"] }
    );

    res.json(methods);
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      error: "Failed to fetch payment methods",
      message: error.message,
    });
  }
};
