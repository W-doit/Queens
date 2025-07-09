import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { odooConfig } from '../auth/config';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Token no proporcionado.'
    });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, odooConfig.jwtSecret);
    
    // Add user info to request
    req.user = decoded;
    
    // Continue to the route handler
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada. Por favor inicie sesión nuevamente.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido o manipulado.'
    });
  }
};

/**
 * Optional middleware to check if user is authenticated but not require it
 */
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, odooConfig.jwtSecret);
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  
  next();
};

/**
 * Middleware to restrict access to admin users only
 * Requires requireAuth middleware to be used first
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado.'
    });
  }
  
  // Check if user has admin role or is in admin groups
  // This depends on how you store admin status in your JWT token
  if (!req.user.isAdmin && !req.user.groups?.includes('admin')) {
    return res.status(403).json({
      success: false,
      message: 'Acceso prohibido. Se requieren permisos de administrador.'
    });
  }
  
  next();
};