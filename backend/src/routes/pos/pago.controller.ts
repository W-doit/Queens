// Payment processing controller

// Payment processing controller

import { Request, Response } from "express";
import { callOdoo } from "../../utils/odooClient";
import { PaymentRequest } from "../../types/pos";
import { getActiveSession, isOrderEditable } from "../../services/pos.service";

/**
 * Process payment for order
 */
export const processPayment = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { payment_method, amount } = req.body as PaymentRequest;
    
    if (!payment_method || !amount) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Payment method and amount are required"
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
        error: "Order already paid",
        message: "This order has already been processed"
      });
    }
    
    // Get order amount
    const orders = await callOdoo<any[]>(
      "pos.order",
      "read",
      [[orderId]],
      { fields: ['amount_total', 'session_id'] }
    );
    
    // Check if amount is sufficient
    if (amount < orders[0].amount_total) {
      return res.status(400).json({
        error: "Insufficient payment",
        message: `Payment amount (${amount}) is less than order total (${orders[0].amount_total})`
      });
    }
    
    // Get payment methods
    let paymentMethodId: number;
    if (typeof payment_method === 'string' && (payment_method === 'cash' || payment_method === 'card')) {
      // Look up payment method by name
      const methods = await callOdoo<any[]>(
        "pos.payment.method",
        "search_read",
        [[['name', 'ilike', payment_method]]],
        { fields: ['id'], limit: 1 }
      );
      
      if (!methods || methods.length === 0) {
        return res.status(404).json({
          error: "Payment method not found",
          message: `No payment method found for ${payment_method}`
        });
      }
      
      paymentMethodId = methods[0].id;
    } else {
      // Direct ID was provided
      paymentMethodId = parseInt(payment_method as string);
    }
    
    // Create payment
    const paymentId = await callOdoo<number>(
      "pos.payment",
      "create",
      [{
        pos_order_id: orderId,
        payment_method_id: paymentMethodId,
        amount,
      }]
    );
    
    // Mark order as paid
    await callOdoo(
      "pos.order",
      "write",
      [[orderId], { state: 'paid' }]
    );
    
    // Process order payment in Odoo
    await callOdoo(
      "pos.order",
      "action_pos_order_paid",
      [[orderId]]
    );
    
    res.json({
      message: "Payment processed successfully",
      order_id: orderId,
      payment_id: paymentId,
      change_amount: amount - orders[0].amount_total,
      receipt_available: true
    });
  } catch (error: any) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      error: "Failed to process payment",
      message: error.message
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
        message: "Please open a POS session first"
      });
    }
    
    // Get config ID to fetch payment methods
    const configs = await callOdoo<any[]>(
      "pos.config",
      "read",
      [[session.config_id[0]]],
      { fields: ['payment_method_ids'] }
    );
    
    if (!configs || configs.length === 0 || !configs[0].payment_method_ids) {
      return res.status(404).json({
        error: "No payment methods configured"
      });
    }
    
    // Get payment methods
    const methods = await callOdoo<any[]>(
      "pos.payment.method",
      "search_read",
      [[['id', 'in', configs[0].payment_method_ids]]],
      { fields: ['id', 'name', 'is_cash_count'] }
    );
    
    res.json(methods);
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      error: "Failed to fetch payment methods",
      message: error.message
    });
  }
};