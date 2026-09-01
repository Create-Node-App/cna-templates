/**
 * Tests for Department Service
 */

// Mock dependencies before importing
jest.mock('@/features/admin/services/settings-service', () => ({
  getTenantSettings: jest.fn(),
  updateTenantSettings: jest.fn(),
}));

jest.mock('@/shared/db', () => ({
  db: {
    query: {
      tenants: { findFirst: jest.fn() },
      persons: { findMany: jest.fn() },
      departmentManagers: { findMany: jest.fn() },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
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

import { getTenantSettings, updateTenantSettings } from '@/features/admin/services/settings-service';
import { db } from '@/shared/db';
import { getDepartments, getDepartmentsWithDetails } from '../department-service';

const mockGetTenantSettings = getTenantSettings as jest.MockedFunction<typeof getTenantSettings>;
// Suppress unused warning - kept for future tests
void (updateTenantSettings as jest.MockedFunction<typeof updateTenantSettings>);
const mockDb = db as jest.Mocked<typeof db>;

describe('department-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDepartments', () => {
    it('should return departments from tenant settings', async () => {
      const mockDepartments = [
        { id: 'dept-1', name: 'Engineering', description: 'Engineering team' },
        { id: 'dept-2', name: 'Design', description: 'Design team' },
      ];
      mockGetTenantSettings.mockResolvedValue({
        departments: { list: mockDepartments },
      } as ReturnType<typeof getTenantSettings> extends Promise<infer T> ? T : never);

      const result = await getDepartments('test-tenant');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].name).toBe('Engineering');
    });

    it('should return empty array when no departments', async () => {
      mockGetTenantSettings.mockResolvedValue(
        {} as ReturnType<typeof getTenantSettings> extends Promise<infer T> ? T : never,
      );

      const result = await getDepartments('test-tenant');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      mockGetTenantSettings.mockRejectedValue(new Error('Settings error'));

      const result = await getDepartments('test-tenant');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get departments');
    });
  });

  describe('getDepartmentsWithDetails', () => {
    it('should return error when tenant not found', async () => {
      (mockDb.query.tenants.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getDepartmentsWithDetails('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tenant not found');
    });

    it('should return departments with member counts', async () => {
      const mockTenant = { id: 'tenant-123', slug: 'test-tenant' };
      const mockDepartments = [
        { id: 'dept-1', name: 'Engineering' },
        { id: 'dept-2', name: 'Design' },
      ];
      const mockPersons = [
        { id: 'person-1', departmentId: 'dept-1' },
        { id: 'person-2', departmentId: 'dept-1' },
        { id: 'person-3', departmentId: 'dept-2' },
      ];
      const mockManagers = [{ departmentId: 'dept-1', managerId: 'person-1', isPrimary: true }];

      (mockDb.query.tenants.findFirst as jest.Mock).mockResolvedValue(mockTenant);
      (mockDb.query.persons.findMany as jest.Mock).mockResolvedValue(mockPersons);
      (mockDb.query.departmentManagers.findMany as jest.Mock).mockResolvedValue(mockManagers);
      mockGetTenantSettings.mockResolvedValue({
        departments: { list: mockDepartments },
      } as ReturnType<typeof getTenantSettings> extends Promise<infer T> ? T : never);

      const result = await getDepartmentsWithDetails('test-tenant');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].memberCount).toBe(2);
      expect(result.data?.[1].memberCount).toBe(1);
    });

    it('should handle errors gracefully', async () => {
      (mockDb.query.tenants.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await getDepartmentsWithDetails('test-tenant');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get departments with details');
    });
  });
});
