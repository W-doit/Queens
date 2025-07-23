import express from "express";
import { ProductController } from "../controllers/productController";

const router = express.Router();
const productController = new ProductController();

/**
 * @route GET /api/products
 * @desc Get all products with optional filtering, searching, and sorting
 * @access Public
 */
router.get("/products", productController.getAllProducts);

/**
 * @route GET /api/products/:id
 * @desc Get a specific product by ID
 * @access Public
 */
router.get("/products/:id", productController.getProductById);

export default router;
