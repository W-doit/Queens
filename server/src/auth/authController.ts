import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { OdooAuthService } from "./odooService";
import { odooConfig } from "./config";

const odooAuthService = new OdooAuthService();

export const validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres"),
  body("email").isEmail().withMessage("Correo electrónico inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Correo electrónico inválido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

export const validateForgotPassword = [
  body("email").isEmail().withMessage("Correo electrónico inválido"),
];

export const authController = {
  register: async (req: Request, res: Response) => {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const userId = await odooAuthService.createUser(name, email, password);

      // Generar token JWT
      const token = jwt.sign({ id: userId, email }, odooConfig.jwtSecret, {
        expiresIn: odooConfig.jwtExpiration,
      });

      return res.status(201).json({
        success: true,
        message: "Usuario registrado correctamente",
        userId,
        token,
      });
    } catch (error: any) {
      if (error.message === "El correo electrónico ya está registrado") {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error al registrar usuario",
        error: error.message,
      });
    }
  },

  login: async (req: Request, res: Response) => {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const { uid, userData } = await odooAuthService.authenticateUser(
        email,
        password
      );

      // Generar token JWT
      const token = jwt.sign(
        {
          id: uid,
          email,
          name: userData.name,
        },
        odooConfig.jwtSecret,
        { expiresIn: odooConfig.jwtExpiration }
      );

      return res.json({
        success: true,
        user: {
          id: uid,
          name: userData.name,
          email: userData.email,
        },
        token,
      });
    } catch (error: any) {
      if (error.message === "Credenciales inválidas") {
        return res.status(401).json({
          success: false,
          message: "Correo electrónico o contraseña incorrectos",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error al iniciar sesión",
        error: error.message,
      });
    }
  },

  logout: async (req: Request, res: Response) => {
    // For JWT auth, the client needs to remove the token
    // We can't truly invalidate the token server-side without a token blacklist
    // But we can acknowledge the logout request

    return res.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  },

  forgotPassword: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Trigger Odoo's native password reset flow
      const result = await odooAuthService.triggerOdooPasswordReset(email);

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Error in forgot password:", error);
      return res.status(500).json({
        success: false,
        message:
          "Error al procesar la solicitud de restablecimiento de contraseña",
      });
    }
  },
};
