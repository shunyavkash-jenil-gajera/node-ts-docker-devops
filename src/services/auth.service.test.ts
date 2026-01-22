import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from './auth.service.js';
import type { SignUpPayload, LoginPayload } from '../models/user.model.js';

// Mock Supabase client
vi.mock('../config/supabase.config.ts', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      admin: {
        getUserById: vi.fn(),
      },
    },
  },
}));

import { supabase } from '../config/supabase.config';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully register a new user', async () => {
      const payload: SignUpPayload = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2026-01-22T10:00:00Z',
        updated_at: '2026-01-22T10:00:00Z',
        user_metadata: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      const result = await authService.signUp(payload);

      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.firstName).toBe('John');
      expect(result.session).toBe(mockSession);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      });
    });

    it('should throw error when signUp fails', async () => {
      const payload: SignUpPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      });

      await expect(authService.signUp(payload)).rejects.toThrow('Email already exists');
    });

    it('should throw error when user creation fails', async () => {
      const payload: SignUpPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: null,
      });

      await expect(authService.signUp(payload)).rejects.toThrow('User creation failed');
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const payload: LoginPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2026-01-22T10:00:00Z',
        updated_at: '2026-01-22T10:00:00Z',
        user_metadata: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      const result = await authService.login(payload);

      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.session).toBe(mockSession);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error on invalid credentials', async () => {
      const payload: LoginPayload = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(authService.login(payload)).rejects.toThrow('Invalid login credentials');
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      await expect(authService.logout()).resolves.toBeUndefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error on logout failure', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: { message: 'Logout failed' },
      });

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2026-01-22T10:00:00Z',
        updated_at: '2026-01-22T10:00:00Z',
        user_metadata: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      vi.mocked(supabase.auth.admin.getUserById).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.getUserById('user-123');

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(supabase.auth.admin.getUserById).toHaveBeenCalledWith('user-123');
    });

    it('should throw error when user not found', async () => {
      vi.mocked(supabase.auth.admin.getUserById).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      await expect(authService.getUserById('invalid-id')).rejects.toThrow('User not found');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.verifyToken('valid-token');

      expect(result.id).toBe('user-123');
      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
    });

    it('should throw error on invalid token', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(authService.verifyToken('invalid-token')).rejects.toThrow('Invalid token');
    });
  });
});
