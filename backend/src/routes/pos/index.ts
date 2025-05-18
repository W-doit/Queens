// POS router for physical store

// POS router for physical store

import express from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as SessionController from "./session.controller";
import * as VentasController from "./ventas.controller";
import * as PagoController from "./pago.controller";
import * as ReceiptController from "./receipt.controller";

const router = express.Router();

//NOTE - test
router.get("/test", (req, res) => {
  res.json({ message: "POS router is working" });
});

// Session management routes
router.get("/session", asyncHandler(SessionController.getSession));
router.post("/session/open", asyncHandler(SessionController.openSession));
router.post(
  "/session/activate",
  asyncHandler(SessionController.activateSession)
);
router.post("/session/force", asyncHandler(SessionController.forcePosSession));
router.post("/session/close", asyncHandler(SessionController.closeSession));
router.post(
  "/session/force-close",
  asyncHandler(SessionController.forceCloseSession)
);
router.get("/session/:id", asyncHandler(SessionController.getSessionDetails));
router.post("/fix", asyncHandler(SessionController.fixPosData));

// Order management routes
router.post("/orders", asyncHandler(VentasController.createOrder));
router.get("/orders", asyncHandler(VentasController.getOrders));
router.get("/orders/:id", asyncHandler(VentasController.getOrderById));
router.post("/orders/:id/lines", asyncHandler(VentasController.addOrderLine));
router.delete(
  "/orders/:id/lines/:lineId",
  asyncHandler(VentasController.removeOrderLine)
);
router.post(
  "/orders/:id/discount",
  asyncHandler(VentasController.applyDiscount)
);

// Payment routes
router.post("/orders/:id/payment", asyncHandler(PagoController.processPayment));
router.get("/payment-methods", asyncHandler(PagoController.getPaymentMethods));

// Receipt routes
router.get(
  "/orders/:id/receipt",
  asyncHandler(ReceiptController.generateReceipt)
);
router.get(
  "/orders/:id/receipt/html",
  asyncHandler(ReceiptController.generateHtmlReceipt)
);
router.post(
  "/orders/:id/receipt/print",
  asyncHandler(ReceiptController.printReceipt)
);

export default router;
