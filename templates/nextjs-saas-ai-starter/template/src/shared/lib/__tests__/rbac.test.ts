/**
 * Tests for RBAC utilities
 */

import {
  type AuthResult,
  createMockAdminSession,
  createMockManagerSession,
  createMockSession,
  createNullAuthResult,
} from '@/__tests__/mock-factories';

// Note: hasRole, isTenantAdmin, isTenantManager, isTenantMember, requireAuth, requireRole,
// requireTenantAdmin, requireTenantManager, requireTenantMember, getCurrentRole, getAllRoles,
// and hasCapability are async functions that depend on auth session and DB.
// They should be tested in integration tests with proper mocking.

// Mock auth and permissions for async function tests
// These mocks use inline jest.fn() to avoid hoisting issues
jest.mock('../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../permissions', () => ({
  hasPermission: jest.fn(),
}));

import { type Capability, RoleCapabilities, roleHasCapability } from '../rbac';
import {
  getAllRoles,
  getCurrentRole,
  hasCapability,
  hasRole,
  isTenantAdmin,
  isTenantManager,
  isTenantMember,
  requireAuth,
  requireRole,
  requireTenantAdmin,
  requireTenantManager,
  requireTenantMember,
} from '../rbac';
// eslint-disable-next-line import/order -- must import after jest.mock
import { auth } from '../auth';
// eslint-disable-next-line import/order -- must import after jest.mock
import { hasPermission } from '../permissions';

// Get typed references to the mocked functions
// Using unknown intermediate cast because auth has complex overload types
const mockAuthFn = auth as unknown as jest.MockedFunction<() => Promise<AuthResult>>;
const mockHasPermissionFn = hasPermission as jest.MockedFunction<typeof hasPermission>;

describe('rbac', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RoleCapabilities', () => {
    it('should define member capabilities', () => {
      expect(RoleCapabilities.member).toContain('view_own_profile');
      expect(RoleCapabilities.member).toContain('use_assistant');
      expect(RoleCapabilities.member).toContain('view_knowledge');
    });

    it('should define manager capabilities (includes member)', () => {
      expect(RoleCapabilities.manager).toContain('view_own_profile');
      expect(RoleCapabilities.manager).toContain('view_team');
      expect(RoleCapabilities.manager).toContain('view_team_reports');
    });

    it('should define admin capabilities (includes all)', () => {
      expect(RoleCapabilities.admin).toContain('view_own_profile');
      expect(RoleCapabilities.admin).toContain('view_team');
      expect(RoleCapabilities.admin).toContain('manage_knowledge');
      expect(RoleCapabilities.admin).toContain('manage_members');
      expect(RoleCapabilities.admin).toContain('view_admin');
    });
  });

  describe('roleHasCapability', () => {
    it('should return true for member capability with member role', () => {
      expect(roleHasCapability('member', 'view_own_profile')).toBe(true);
      expect(roleHasCapability('member', 'use_assistant')).toBe(true);
    });

    it('should return false for manager capability with member role', () => {
      expect(roleHasCapability('member', 'view_team')).toBe(false);
      expect(roleHasCapability('member', 'view_team_reports')).toBe(false);
    });

    it('should return true for manager capabilities with manager role', () => {
      expect(roleHasCapability('manager', 'view_team')).toBe(true);
      expect(roleHasCapability('manager', 'view_own_profile')).toBe(true);
    });

    it('should return false for admin capability with manager role', () => {
      expect(roleHasCapability('manager', 'manage_members')).toBe(false);
      expect(roleHasCapability('manager', 'view_admin')).toBe(false);
    });

    it('should return true for admin capabilities with admin role', () => {
      expect(roleHasCapability('admin', 'manage_knowledge')).toBe(true);
      expect(roleHasCapability('admin', 'manage_members')).toBe(true);
      expect(roleHasCapability('admin', 'view_admin')).toBe(true);
      expect(roleHasCapability('admin', 'view_own_profile')).toBe(true);
    });

    it('should return false for undefined role', () => {
      expect(roleHasCapability(undefined, 'view_own_profile')).toBe(false);
    });

    it('should return false for non-existent capability', () => {
      expect(roleHasCapability('admin', 'non_existent' as Capability)).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should call hasPermission with correct permission for admin', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      const result = await hasRole('test-tenant', 'admin');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'admin:settings');
      expect(result).toBe(true);
    });

    it('should call hasPermission with correct permission for manager', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      const result = await hasRole('test-tenant', 'manager');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'manager:dashboard');
      expect(result).toBe(true);
    });

    it('should call hasPermission with correct permission for member', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      const result = await hasRole('test-tenant', 'member');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'profile:read');
      expect(result).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      mockHasPermissionFn.mockResolvedValue(false);

      const result = await hasRole('test-tenant', 'admin');

      expect(result).toBe(false);
    });
  });

  describe('isTenantAdmin', () => {
    it('should check for admin role', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      await isTenantAdmin('test-tenant');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'admin:settings');
    });
  });

  describe('isTenantManager', () => {
    it('should check for manager role', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      await isTenantManager('test-tenant');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'manager:dashboard');
    });
  });

  describe('isTenantMember', () => {
    it('should check for member role', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      await isTenantMember('test-tenant');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'profile:read');
    });
  });

  describe('requireAuth', () => {
    it('should return user info when authenticated', async () => {
      mockAuthFn.mockResolvedValue(createMockSession({ user: { email: 'test@example.com' } }));

      const result = await requireAuth();

      expect(result).toEqual({ userId: 'user-123', email: 'test@example.com' });
    });

    // Note: redirect tests would require mocking next/navigation which is complex
    // These are better tested in integration tests
  });

  describe('requireRole', () => {
    it('should return auth result when user has permission', async () => {
      mockAuthFn.mockResolvedValue(createMockAdminSession({ user: { email: 'test@example.com' } }));
      mockHasPermissionFn.mockResolvedValue(true);

      const result = await requireRole('test-tenant', 'admin');

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });
    });
  });

  describe('requireTenantAdmin', () => {
    it('should call requireRole with admin', async () => {
      mockAuthFn.mockResolvedValue(createMockAdminSession({ user: { email: 'test@example.com' } }));
      mockHasPermissionFn.mockResolvedValue(true);

      const result = await requireTenantAdmin('test-tenant');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'admin:settings');
      expect(result.role).toBe('admin');
    });
  });

  describe('requireTenantManager', () => {
    it('should call requireRole with manager', async () => {
      mockAuthFn.mockResolvedValue(createMockManagerSession({ user: { email: 'test@example.com' } }));
      mockHasPermissionFn.mockResolvedValue(true);

      await requireTenantManager('test-tenant');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'manager:dashboard');
    });
  });

  describe('requireTenantMember', () => {
    it('should call requireRole with member', async () => {
      mockAuthFn.mockResolvedValue(createMockSession({ user: { email: 'test@example.com' } }));
      mockHasPermissionFn.mockResolvedValue(true);

      await requireTenantMember('test-tenant');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'profile:read');
    });
  });

  describe('getCurrentRole', () => {
    it('should return role from session', async () => {
      mockAuthFn.mockResolvedValue(createMockAdminSession());

      const result = await getCurrentRole('test-tenant');

      expect(result).toBe('admin');
    });

    it('should return null when no session', async () => {
      mockAuthFn.mockResolvedValue(createNullAuthResult());

      const result = await getCurrentRole('test-tenant');

      expect(result).toBeNull();
    });

    it('should return null when tenant not in roles', async () => {
      mockAuthFn.mockResolvedValue(createMockSession({ user: { roles: { 'other-tenant': 'admin' } } }));

      const result = await getCurrentRole('test-tenant');

      expect(result).toBeNull();
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles from session', async () => {
      const roles = { 'tenant-1': 'admin' as const, 'tenant-2': 'member' as const };
      mockAuthFn.mockResolvedValue(createMockSession({ user: { roles } }));

      const result = await getAllRoles();

      expect(result).toEqual(roles);
    });

    it('should return empty object when no session', async () => {
      mockAuthFn.mockResolvedValue(createNullAuthResult());

      const result = await getAllRoles();

      expect(result).toEqual({});
    });
  });

  describe('hasCapability', () => {
    it('should check permission for capability', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      const result = await hasCapability('test-tenant', 'view_own_profile');

      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'profile:read');
      expect(result).toBe(true);
    });

    it('should return false for unknown capability', async () => {
      const result = await hasCapability('test-tenant', 'unknown' as Capability);

      expect(result).toBe(false);
    });

    it('should check correct permission for each capability', async () => {
      mockHasPermissionFn.mockResolvedValue(true);

      await hasCapability('test-tenant', 'use_assistant');
      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'assistant:use');

      await hasCapability('test-tenant', 'view_team');
      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'manager:team');

      await hasCapability('test-tenant', 'manage_members');
      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'admin:members');

      await hasCapability('test-tenant', 'manage_knowledge');
      expect(mockHasPermissionFn).toHaveBeenCalledWith('test-tenant', 'admin:knowledge');
    });
  });
});
