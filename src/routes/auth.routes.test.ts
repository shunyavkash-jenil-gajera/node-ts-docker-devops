import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import authService from '../services/auth.service.js';

// Mock Supabase
vi.mock('../services/auth.service.ts');

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should register a new user successfully', async () => {
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
        session: {
          access_token: 'token-123',
          refresh_token: 'refresh-123',
        },
      });

      const res = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.token).toBe('token-123');
    });

    it('should return 400 for missing email', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle signup errors', async () => {
      vi.mocked(authService.signUp).mockRejectedValueOnce(
        new Error('Email already exists')
      );

      const res = await request(app)
        .post('/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
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
        session: {
          access_token: 'token-123',
          refresh_token: 'refresh-123',
        },
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data.user.id).toBe('user-123');
    });

    it('should return 400 for missing credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Invalid login credentials')
      );

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return profile with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock verifyToken to attach user
      vi.mocked(authService.verifyToken).mockResolvedValueOnce({
        id: 'user-123',
      });

      vi.mocked(authService.getUserById).mockResolvedValueOnce(mockUser);

      const res = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      vi.mocked(authService.verifyToken).mockRejectedValueOnce(
        new Error('Invalid token')
      );

      const res = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout with valid token', async () => {
      vi.mocked(authService.verifyToken).mockResolvedValueOnce({
        id: 'user-123',
      });

      vi.mocked(authService.logout).mockResolvedValueOnce(undefined);

      const res = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logout successful');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      vi.mocked(authService.verifyToken).mockRejectedValueOnce(
        new Error('Invalid token')
      );

      const res = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET / (Health Check)', () => {
    it('should return health check message', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toBe(200);
    });
  });
});
