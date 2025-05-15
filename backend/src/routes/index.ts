// Routes registry

import express from "express";
import productRoutes from "./productos";
import inventoryRoutes from "./inventario";

const router = express.Router();

/**
 * Register all API routes
 */

// Product management routes
router.use("/productos", productRoutes);

// Inventory management routes
router.use("/inventario", inventoryRoutes);

export default router;