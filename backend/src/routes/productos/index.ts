// Products router (main entry)
import express from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./productos.controller";
import {
  getProductVariants,
  updateProductVariants,
  updateVariantStock,
} from "./variantes.controller";
import { getProductImage, uploadProductImage } from "./imagen.controller";

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination, filtering, and sorting
 * @access  Public
 */
router.get("/", asyncHandler(getProducts));

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get("/:id", asyncHandler(getProductById));

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post("/", asyncHandler(createProduct));

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private
 */
router.put("/:id", asyncHandler(updateProduct));

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete("/:id", asyncHandler(deleteProduct));

/**
 * @route   GET /api/products/:id/image
 * @desc    Get product image
 * @access  Public
 */
router.get("/:id/image", asyncHandler(getProductImage));

/**
 * @route   POST /api/products/:id/image
 * @desc    Upload product image
 * @access  Private
 */
router.post("/:id/image", asyncHandler(uploadProductImage));

/**
 * @route   GET /api/products/:id/variants
 * @desc    Get variants for a product
 * @access  Public
 */
router.get("/:id/variants", asyncHandler(getProductVariants));

/**
 * @route   PUT /api/products/:id/variants
 * @desc    Update variants for a product
 * @access  Private
 */
router.put("/:id/variants", asyncHandler(updateProductVariants));

/**
 * @route   PUT /api/products/variants/:variantId/stock
 * @desc    Update stock for a specific variant
 * @access  Private
 */
router.put("/variants/:variantId/stock", asyncHandler(updateVariantStock));

export default router;
