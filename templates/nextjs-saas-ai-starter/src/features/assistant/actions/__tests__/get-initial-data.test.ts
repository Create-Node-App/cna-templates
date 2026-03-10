/**
 * Tests for Get Initial Data Action
 */

import { type AuthResult, createMockSession, createNullAuthResult } from '@/__tests__/mock-factories';

const mockAuthFn = jest.fn<Promise<AuthResult>, []>();

interface MockTenantResult {
  id: string;
  slug: string;
  name: string;
}

const mockGetTenantBySlugFn = jest.fn<Promise<MockTenantResult | null>, [string]>();

jest.mock('@/shared/lib/auth', () => ({
  auth: mockAuthFn,
}));

jest.mock('@/shared/lib/tenant', () => ({
  getTenantBySlug: mockGetTenantBySlugFn,
}));

jest.mock('@/shared/db', () => ({
  db: {
    query: {
      persons: { findFirst: jest.fn() },
    },
  },
}));

jest.mock('@/shared/lib/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { db } from '@/shared/db';
import { getInitialData } from '../get-initial-data';

const mockDb = db as jest.Mocked<typeof db>;

describe('getInitialData', () => {
  const mockTenant = { id: 'tenant-123', slug: 'test-tenant', name: 'Test Tenant' };
  const mockPerson = { id: 'person-123', email: 'user@example.com', firstName: 'Test', lastName: 'User' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthFn.mockResolvedValue(createMockSession({ user: { email: 'user@example.com', name: 'Test User' } }));
    mockGetTenantBySlugFn.mockResolvedValue(mockTenant);
    (mockDb.query.persons.findFirst as jest.Mock).mockResolvedValue(mockPerson);
  });

  it('should throw error when not authenticated', async () => {
    mockAuthFn.mockResolvedValue(createNullAuthResult());
    await expect(getInitialData('test-tenant')).rejects.toThrow();
  });

  it('should throw error when user has no email', async () => {
    mockAuthFn.mockResolvedValue(createMockSession({ user: { email: null } }));
    await expect(getInitialData('test-tenant')).rejects.toThrow();
  });

  it('should throw error when tenant not found', async () => {
    mockGetTenantBySlugFn.mockResolvedValue(null);
    await expect(getInitialData('test-tenant')).rejects.toThrow();
  });

  it('should return initial data when person is found', async () => {
    const result = await getInitialData('test-tenant');

    expect(result).toBeDefined();
    expect(result.welcomeMessage).toBeDefined();
    expect(result.suggestedQuestions).toBeDefined();
    expect(result.capabilities).toHaveLength(3);
  });

  it('should include user name in welcome message', async () => {
    const result = await getInitialData('test-tenant');
    expect(result.welcomeMessage).toContain('Test User');
  });

  it('should return correct capabilities', async () => {
    const result = await getInitialData('test-tenant');
    const capabilityIds = result.capabilities.map((c) => c.id);
    expect(capabilityIds).toContain('automation');
    expect(capabilityIds).toContain('integrations');
    expect(capabilityIds).toContain('general');
  });
});
