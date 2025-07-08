import express from "express";
import productRoutes from "./productRoutes";

const router = express.Router();

// Mount product routes at /api
router.use("/api", productRoutes);

export default router;
