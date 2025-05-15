// Inventory router

import express from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  getInventory,
  updateInventory
} from "./inventory.controller";

const router = express.Router();

/**
 * @route   GET /api/inventory/:id
 * @desc    Get inventory levels for a product and its variants
 * @access  Private
 */
router.get("/:id", asyncHandler(getInventory));

/**
 * @route   POST /api/inventory/update
 * @desc    Update inventory levels (add or remove stock)
 * @access  Private
 */
router.post("/update", asyncHandler(updateInventory));

export default router;