import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { verifyToken, optionalVerifyToken } from './auth.middleware.js';
import authService from '../services/auth.service.js';
import { SendResponse } from '../handlers/responce.handler.js';

// Mock dependencies
vi.mock('../services/auth.service.ts');
vi.mock('../handlers/responce.handler.ts');

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify valid token and attach user to request', async () => {
      mockReq.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(authService.verifyToken).mockResolvedValueOnce(mockUser);

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect((mockReq as any).user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if token missing', async () => {
      mockReq.headers = {};

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        401,
        false,
        'Missing or invalid token'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header invalid', async () => {
      mockReq.headers = {
        authorization: 'InvalidToken',
      };

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        401,
        false,
        'Missing or invalid token'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 on invalid token', async () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token',
      };

      vi.mocked(authService.verifyToken).mockRejectedValueOnce(
        new Error('Invalid token')
      );

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(SendResponse).toHaveBeenCalledWith(
        mockRes,
        401,
        false,
        'Invalid or expired token'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle different Bearer token formats', async () => {
      mockReq.headers = {
        authorization: 'Bearer token.with.dots',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(authService.verifyToken).mockResolvedValueOnce(mockUser);

      await verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(authService.verifyToken).toHaveBeenCalledWith('token.with.dots');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('optionalVerifyToken', () => {
    it('should verify token if present', async () => {
      mockReq.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(authService.verifyToken).mockResolvedValueOnce(mockUser);

      await optionalVerifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without error if no token provided', async () => {
      mockReq.headers = {};

      await optionalVerifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without error on invalid token', async () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token',
      };

      vi.mocked(authService.verifyToken).mockRejectedValueOnce(
        new Error('Invalid token')
      );

      await optionalVerifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should not attach user if token invalid', async () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token',
      };

      vi.mocked(authService.verifyToken).mockRejectedValueOnce(
        new Error('Invalid token')
      );

      await optionalVerifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle malformed Authorization header gracefully', async () => {
      mockReq.headers = {
        authorization: 'MalformedHeader',
      };

      await optionalVerifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
