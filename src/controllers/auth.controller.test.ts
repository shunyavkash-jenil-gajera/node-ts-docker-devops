import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import authController from './auth.controller.js';
import authService from '../services/auth.service.js';
import { SendResponse } from '../handlers/responce.handler.js';

// Mock dependencies
vi.mock('../services/auth.service.ts');
vi.mock('../handlers/responce.handler.ts');

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully signup a user', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(authService.signUp).mockResolvedValueOnce({
        user: mockUser,
        session: { access_token: 'token-123' },
      });

      await authController.signup(mockReq as Request, mockRes as Response);

      expect(authService.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        201,
        true,
        'User registered successfully',
        expect.objectContaining({
          user: mockUser,
          token: 'token-123',
        })
      );
    });

    it('should return 400 if email is missing', async () => {
      mockReq.body = {
        password: 'password123',
      };

      await authController.signup(mockReq as Request, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        400,
        false,
        'Email and password are required'
      );
    });

    it('should return 400 if password is missing', async () => {
      mockReq.body = {
        email: 'test@example.com',
      };

      await authController.signup(mockReq as Request, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        400,
        false,
        'Email and password are required'
      );
    });

    it('should handle service errors', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authService.signUp).mockRejectedValueOnce(
        new Error('Email already exists')
      );

      await authController.signup(mockReq as Request, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        400,
        false,
        'Email already exists'
      );
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(authService.login).mockResolvedValueOnce({
        user: mockUser,
        session: { access_token: 'token-123' },
      });

      await authController.login(mockReq as Request, mockRes as Response);

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        200,
        true,
        'Login successful',
        expect.any(Object)
      );
    });

    it('should return 400 if credentials missing', async () => {
      mockReq.body = {};

      await authController.login(mockReq as Request, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        400,
        false,
        'Email and password are required'
      );
    });

    it('should return 401 on invalid credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Invalid login credentials')
      );

      await authController.login(mockReq as Request, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        401,
        false,
        'Invalid login credentials'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      vi.mocked(authService.logout).mockResolvedValueOnce(undefined);

      await authController.logout(mockReq as Request, mockRes as Response);

      expect(authService.logout).toHaveBeenCalled();
      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        200,
        true,
        'Logout successful'
      );
    });

    it('should handle logout errors', async () => {
      vi.mocked(authService.logout).mockRejectedValueOnce(
        new Error('Logout failed')
      );

      await authController.logout(mockReq as Request, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        400,
        false,
        'Logout failed'
      );
    });
  });

  describe('getProfile', () => {
    it('should retrieve user profile', async () => {
      mockReq.user = { id: 'user-123' };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(authService.getUserById).mockResolvedValueOnce(mockUser);

      await authController.getProfile(mockReq as any, mockRes as Response);

      expect(authService.getUserById).toHaveBeenCalledWith('user-123');
      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        200,
        true,
        'Profile retrieved successfully',
        { user: mockUser }
      );
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq = {};

      await authController.getProfile(mockReq as any, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        401,
        false,
        'Unauthorized'
      );
    });

    it('should handle profile retrieval errors', async () => {
      mockReq.user = { id: 'user-123' };

      vi.mocked(authService.getUserById).mockRejectedValueOnce(
        new Error('User not found')
      );

      await authController.getProfile(mockReq as any, mockRes as Response);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        400,
        false,
        'User not found'
      );
    });
  });
});
