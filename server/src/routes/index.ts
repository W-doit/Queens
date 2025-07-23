import { Router } from "express";
import authRoutes from "./authRoutes";
// Import other route files

const router = Router();

// Auth routes
router.use("/api/auth", authRoutes);

// Other routes
// router.use("/api/products", productRoutes);
// etc.

export default router;
