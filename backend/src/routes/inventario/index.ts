// Inventory router

import express from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  getInventory,
  updateInventory,
  getLocations,
  getMovements,
} from "./inventario.controller";


const router = express.Router();

/**
 * @route   POST /api/inventario/update
 * @desc    Update inventory levels (add or remove stock)
 * @access  Private
 */
router.post("/update", asyncHandler(updateInventory));

/**
 * @route   GET /api/inventario/locations
 * @desc    Get warehouse locations
 * @access  Private
 */
router.get("/locations", asyncHandler(getLocations));

/**
 * @route   GET /api/inventario/movements/:id
 * @desc    Get inventory movements for a product
 * @access  Private
 */
router.get("/movements/:id", asyncHandler(getMovements));

/**
 * @route   GET /api/inventario/:id
 * @desc    Get inventory levels for a product and its variants
 * @access  Private
 */
router.get("/:id", asyncHandler(getInventory));

// Add default export
export default router;
