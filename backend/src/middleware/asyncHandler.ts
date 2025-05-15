// Async handler middleware

import { Request, Response, NextFunction } from "express";

/*
  Wrapper for async route handlers to catch and forward errors to the error middleware
 */

export const asyncHandler = 
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };