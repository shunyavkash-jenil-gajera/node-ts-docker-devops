import express from "express";
import type { Request, Response } from "express";
import authController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * POST /auth/signup
 * Register a new user
 * Body: { email, password, firstName?, lastName? }
 */
router.post("/signup", (req: Request, res: Response) =>
  authController.signup(req, res)
);

/**
 * POST /auth/login
 * Login user with credentials
 * Body: { email, password }
 */
router.post("/login", (req: Request, res: Response) =>
  authController.login(req, res)
);

/**
 * POST /auth/logout
 * Logout user
 * Requires: Valid JWT token in Authorization header
 */
router.post("/logout", verifyToken, (req: Request, res: Response) =>
  authController.logout(req, res)
);

/**
 * GET /auth/profile
 * Get current user profile
 * Requires: Valid JWT token in Authorization header
 */
router.get("/profile", verifyToken, (req: Request, res: Response) =>
  authController.getProfile(req, res)
);

export default router;
