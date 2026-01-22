import type { Request, Response } from "express";
import authService from "../services/auth.service.js";
import { SendResponse } from "../handlers/responce.handler.js";
import type { SignUpPayload, LoginPayload } from "../models/user.model.js";

export class AuthController {
  /**
   * Handle user sign up
   * POST /auth/signup
   */
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body as SignUpPayload;

      if (!email || !password) {
        SendResponse(res, 400, false, "Email and password are required");
        return;
      }

      const { user, session } = await authService.signUp({
        email,
        password,
        firstName,
        lastName,
      });

      SendResponse(res, 201, true, "User registered successfully", {
        user,
        token: session?.access_token,
        refreshToken: session?.refresh_token,
      });
    } catch (error: any) {
      // Handle specific Supabase errors
      if (error.message?.includes("rate limit")) {
        SendResponse(res, 429, false, "Too many signup attempts. Please try again later.");
        return;
      }
      if (error.message?.includes("already exists")) {
        SendResponse(res, 409, false, "Email already registered");
        return;
      }
      SendResponse(res, 400, false, error.message || "Signup failed");
    }
  }

  /**
   * Handle user login
   * POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginPayload;

      if (!email || !password) {
        SendResponse(res, 400, false, "Email and password are required");
        return;
      }

      const { user, session } = await authService.login({
        email,
        password,
      });

      SendResponse(res, 200, true, "Login successful", {
        user,
        token: session?.access_token,
        refreshToken: session?.refresh_token,
      });
    } catch (error: any) {
      // Handle rate limit errors
      if (error.message?.includes("rate limit")) {
        SendResponse(res, 429, false, "Too many login attempts. Please try again later.");
        return;
      }
      SendResponse(res, 401, false, error.message || "Login failed");
    }
  }

  /**
   * Handle user logout
   * POST /auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      await authService.logout();
      SendResponse(res, 200, true, "Logout successful");
    } catch (error: any) {
      SendResponse(res, 400, false, error.message || "Logout failed");
    }
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        SendResponse(res, 401, false, "Unauthorized");
        return;
      }

      const user = await authService.getUserById(userId);
      SendResponse(res, 200, true, "Profile retrieved successfully", { user });
    } catch (error: any) {
      SendResponse(res, 400, false, error.message || "Failed to get profile");
    }
  }
}

export default new AuthController();
