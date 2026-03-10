/**
 * Tests for Auth Service
 */

import { type AuthResult, createMockSession, createNullAuthResult } from '@/__tests__/mock-factories';

// Create typed mock function
const mockAuthFn = jest.fn<Promise<AuthResult>, []>();

// Mock dependencies before importing
jest.mock('@/shared/lib/auth', () => ({
  auth: mockAuthFn,
}));

import { getCurrentUser, getSession, isAuthenticated } from '../auth-service';

describe('auth-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('should return session when authenticated', async () => {
      const mockSession = createMockSession({ user: { email: 'user@example.com', name: 'Test User' } });
      mockAuthFn.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(mockAuthFn).toHaveBeenCalledTimes(1);
    });

    it('should return null when not authenticated', async () => {
      mockAuthFn.mockResolvedValue(createNullAuthResult());

      const result = await getSession();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockSession = createMockSession({ user: { email: 'user@example.com', name: 'Test User' } });
      mockAuthFn.mockResolvedValue(mockSession);

      const result = await getCurrentUser();

      expect(result).toEqual(mockSession.user);
    });

    it('should return null when not authenticated', async () => {
      mockAuthFn.mockResolvedValue(createNullAuthResult());

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when session has no user', async () => {
      // Note: This case is technically invalid since Session always has user,
      // but we test the code path for defensive programming
      mockAuthFn.mockResolvedValue({} as AuthResult);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      mockAuthFn.mockResolvedValue(createMockSession({ user: { email: 'user@example.com' } }));

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      mockAuthFn.mockResolvedValue(createNullAuthResult());

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when session has no user', async () => {
      mockAuthFn.mockResolvedValue({} as AuthResult);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
