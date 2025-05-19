// Payment processing controller

// Payment processing controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { PaymentRequest } from "../../types/pos";
import { getActiveSession, isOrderEditable } from "../../services/pos.service";

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
    if (order.state === "paid") {
      return res.status(400).json({
        error: "Order already paid",
        message: "This order has already been paid",
      });
    }

    // Check if payment amount is sufficient (with small tolerance for float precision)
    const paymentDifference = Math.abs(amount - order.amount_total);
    if (amount < order.amount_total && paymentDifference > 0.01) {
      return res.status(400).json({
        error: "Insufficient payment",
        message: `Payment amount (${amount}) is less than order total (${order.amount_total})`,
      });
    }

    // Get payment methods (case-insensitive)
    const paymentMethods = await callOdoo<any[]>(
      "pos.payment.method",
      "search_read",
      [[["name", "ilike", payment_method]]],
      { fields: ["id", "name"] }
    );

    if (!paymentMethods || paymentMethods.length === 0) {
      // Get all available payment methods
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

    if (!paymentId) {
      return res.status(500).json({
        error: "Failed to create payment",
        message: "Could not create payment record",
      });
    }

    console.log("Payment created with ID:", paymentId);

    try {
      // Try using the write method to set state to 'paid'
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

      // Try calling the action to finalize the order
      await callOdoo("pos.order", "action_pos_order_paid", [[orderId]]);
      console.log("Called action_pos_order_paid");
    } catch (actionError) {
      console.error("Error setting order to paid state:", actionError);
      // Continue anyway as we'll check the state next
    }

    // After successfully marking the order as paid, handle stock movements
    try {
      console.log(`Processing stock movements for order ${orderId}...`);

      // Method 1: Try to create the picking (stock move)
      await callOdoo("pos.order", "create_picking", [[orderId]]);
      console.log("Created picking for order");

      // Get updated order with picking information
      const orderWithPicking = await callOdoo<any[]>(
        "pos.order",
        "search_read",
        [[["id", "=", orderId]]],
        { fields: ["id", "name", "state", "picking_id"] }
      );

      // If picking was created, try to process it immediately
      if (orderWithPicking[0].picking_id) {
        const pickingId = orderWithPicking[0].picking_id[0];
        console.log(`Processing picking ID: ${pickingId}`);

        try {
          // Confirm and process the picking
          await callOdoo("stock.picking", "action_confirm", [[pickingId]]);
          console.log("Picking confirmed");

          await callOdoo("stock.picking", "action_assign", [[pickingId]]);
          console.log("Picking assigned");

          await callOdoo("stock.picking", "button_validate", [[pickingId]]);
          console.log("Picking validated successfully");
        } catch (pickingError) {
          console.warn("Error processing stock picking:", pickingError);
        }
      }

      // Method 3: Try finalizing the order
      try {
        await callOdoo("pos.order", "action_pos_order_done", [[orderId]]);
        console.log("Finalized order");
      } catch (doneError) {
        console.warn("action_pos_order_done failed:", doneError);
      }
    } catch (stockError) {
      console.warn("Error processing stock movements:", stockError);
      // Continue anyway - payment was successful
    }

    // Additional update to ensure order is properly marked as processed
    try {
      await callOdoo("pos.order", "write", [[orderId], { state: "done" }]);
      console.log("Order marked as done");
    } catch (writeError) {
      console.warn("Error setting order state to 'done':", writeError);
    }

    // Get updated order
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

    const updatedOrder = updatedOrders[0];

    // Check if order state was updated
    if (updatedOrder.state !== "paid" && updatedOrder.state !== "done") {
      console.warn(
        "Order state is still not 'paid' or 'done', forcing state update"
      );

      // Force state update as a fallback
      try {
        await callOdoo("pos.order", "write", [[orderId], { state: "paid" }]);
        updatedOrder.state = "paid";
      } catch (writeError) {
        console.error("Failed to force order state:", writeError);
      }
    }

    return res.json({
      success: true,
      order: updatedOrder,
      message: "Payment processed successfully",
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
