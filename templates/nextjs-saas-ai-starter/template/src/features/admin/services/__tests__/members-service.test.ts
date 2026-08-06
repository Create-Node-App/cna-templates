/**
 * Tests for Members Service
 */

// Type for requireTenantAdmin result
interface TenantAdminResult {
  userId: string;
  email: string;
  role: 'admin';
}

// Create typed mock function
const mockRequireTenantAdminFn = jest.fn<Promise<TenantAdminResult | null>, [string]>();

// Mock dependencies before importing
jest.mock('@/shared/db', () => ({
  db: {
    query: {
      tenants: { findFirst: jest.fn() },
      tenantMemberships: { findFirst: jest.fn(), findMany: jest.fn() },
      users: { findFirst: jest.fn() },
      persons: { findFirst: jest.fn(), findMany: jest.fn() },
      roles: { findMany: jest.fn() },
      userRoles: { findMany: jest.fn() },
    },
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ total: 0 }]),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'new-id' }]),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('@/shared/lib/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

jest.mock('@/shared/lib/rbac', () => ({
  requireTenantAdmin: mockRequireTenantAdminFn,
}));

jest.mock('@/shared/lib/tenant', () => ({
  getTenantBySlug: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { db } from '@/shared/db';
import { listMembers } from '../members-service';

const mockDb = db as jest.Mocked<typeof db>;

describe('members-service', () => {
  const mockAdminResult: TenantAdminResult = {
    userId: 'user-123',
    email: 'admin@example.com',
    role: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireTenantAdminFn.mockResolvedValue(mockAdminResult);
  });

  describe('listMembers', () => {
    it('should return error when not admin', async () => {
      mockRequireTenantAdminFn.mockResolvedValue(null);

      const result = await listMembers('test-tenant');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error when tenant not found', async () => {
      (mockDb.query.tenants.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await listMembers('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tenant not found');
    });

    it('should return members with pagination', async () => {
      const mockTenant = { id: 'tenant-123' };
      const mockMemberships = [
        {
          id: 'mem-1',
          userId: 'user-1',
          tenantId: 'tenant-123',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com', image: null },
          person: { id: 'person-1', firstName: 'John', lastName: 'Doe', title: 'Developer' },
        },
      ];

      (mockDb.query.tenants.findFirst as jest.Mock).mockResolvedValue(mockTenant);
      (mockDb.query.tenantMemberships.findMany as jest.Mock).mockResolvedValue(mockMemberships);

      const result = await listMembers('test-tenant', { page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(1);
    });

    it('should filter by search', async () => {
      const mockTenant = { id: 'tenant-123' };
      const mockMemberships = [
        {
          id: 'mem-1',
          userId: 'user-1',
          tenantId: 'tenant-123',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com', image: null },
          person: { id: 'person-1', firstName: 'John', lastName: 'Doe', title: 'Developer' },
        },
        {
          id: 'mem-2',
          userId: 'user-2',
          tenantId: 'tenant-123',
          user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', image: null },
          person: { id: 'person-2', firstName: 'Jane', lastName: 'Smith', title: 'Designer' },
        },
      ];

      (mockDb.query.tenants.findFirst as jest.Mock).mockResolvedValue(mockTenant);
      (mockDb.query.tenantMemberships.findMany as jest.Mock).mockResolvedValue(mockMemberships);

      const result = await listMembers('test-tenant', { search: 'john' });

      expect(result.success).toBe(true);
      // Search filters on client-side
      expect(result.data?.items).toHaveLength(1);
    });
  });
});
