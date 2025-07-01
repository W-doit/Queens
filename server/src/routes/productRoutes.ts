import express from "express";
import { ProductController } from "../controllers/productController";

const router = express.Router();
const productController = new ProductController();

// Routes are ordered from most specific to most general
// to avoid path conflicts

/**
 * @route GET /api/products/search
 * @desc Search products by query
 * @access Public
 */
//NOTE - to implement later
// router.get("/products/search", productController.searchProducts);

/**
 * @route GET /api/products/category/:id
 * @desc Get products by category ID
 * @access Public
 */
//NOTE - to implement later
// router.get("/products/category/:id", productController.getProductsByCategory);

/**
 * @route GET /api/products/:id/stock
 * @desc Get product stock information
 * @access Public
 */
//NOTE - to implement later
// router.get("/products/:id/stock", productController.getProductStock);

/**
 * @route GET /api/products/:id/price
 * @desc Get product price information
 * @access Public
 */
//NOTE - to implement later
// router.get("/products/:id/price", productController.getProductPrice);

/**
 * @route GET /api/products/:id
 * @desc Get product by ID
 * @access Public
 */
router.get("/products/:id", productController.getProductById);

/**
 * @route GET /api/products
 * @desc Get all products
 * @access Public
 */
router.get("/products", productController.getAllProducts);

export default router;
