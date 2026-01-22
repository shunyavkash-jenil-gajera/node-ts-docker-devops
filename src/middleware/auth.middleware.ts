import type { Request, Response, NextFunction } from "express";
import { SendResponse } from "../handlers/responce.handler.js";
import authService from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 * Bearer token format: Authorization: Bearer <token>
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      SendResponse(res, 401, false, "Missing or invalid token");
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    const user = await authService.verifyToken(token);
    (req as any).user = user;
    next();
  } catch (error: any) {
    SendResponse(res, 401, false, "Invalid or expired token");
  }
};

/**
 * Optional middleware - adds user to request if valid token present
 */
export const optionalVerifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const user = await authService.verifyToken(token);
      (req as any).user = user;
    }

    next();
  } catch (error) {
    // Token is invalid, but middleware continues
    next();
  }
};
