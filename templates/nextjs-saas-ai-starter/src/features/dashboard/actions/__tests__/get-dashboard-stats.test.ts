/**
 * Tests for getDashboardStats server action
 */

import { type AuthResult, createMockSession, createNullAuthResult } from '@/__tests__/mock-factories';

const mockAuthFn = jest.fn<Promise<AuthResult>, []>();

jest.mock('@/shared/db', () => ({
  db: {
    query: {
      auditEvents: { findMany: jest.fn() },
    },
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@/shared/lib/auth', () => ({
  auth: mockAuthFn,
}));

jest.mock('@/shared/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

import { db as mockDb } from '@/shared/db';
import { getDashboardStats } from '../get-dashboard-stats';

describe('getDashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when user is not authenticated', async () => {
    mockAuthFn.mockResolvedValue(createNullAuthResult());

    const result = await getDashboardStats('tenant-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('should return dashboard stats for authenticated user', async () => {
    mockAuthFn.mockResolvedValue(createMockSession());

    (mockDb.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ count: 5 }]),
      }),
    });

    (mockDb.query.auditEvents.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'event-1',
        action: 'member.created',
        entityType: 'person',
        entityId: 'person-1',
        timestamp: new Date(),
        metadata: null,
      },
    ]);

    const result = await getDashboardStats('tenant-123');

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data).toBeDefined();
      expect(result.data.teamSize).toBeDefined();
      expect(result.data.recentActivity).toBeDefined();
    }
  });

  it('should handle errors gracefully', async () => {
    mockAuthFn.mockRejectedValue(new Error('Database error'));

    const result = await getDashboardStats('tenant-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch dashboard stats');
  });
});
