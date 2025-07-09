import express from "express";
import {
  authController,
  validateLogin,
  validateRegister,
} from "../auth/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/logout", requireAuth, authController.logout);

// Use the middleware for protected routes
router.get("/profile", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
