jest.mock('@/shared/db', () => ({ db: { query: { tenants: { findFirst: jest.fn() } } } }));

/**
 * Tests for tenant utilities
 */

import { buildTenantPath, extractTenantSlug } from '../tenant';

// Note: getCurrentTenantSlug, getCurrentTenant, getTenantBySlug, and validateTenantSlug
// are async functions that depend on Next.js headers and database.
// They should be tested in integration tests or with more complex mocking.

describe('tenant', () => {
  describe('buildTenantPath', () => {
    it('should build path with leading slash', () => {
      expect(buildTenantPath('acme', '/dashboard')).toBe('/t/acme/dashboard');
    });

    it('should build path without leading slash', () => {
      expect(buildTenantPath('acme', 'settings')).toBe('/t/acme/settings');
    });

    it('should handle empty path', () => {
      expect(buildTenantPath('acme', '')).toBe('/t/acme/');
    });

    it('should handle root path', () => {
      expect(buildTenantPath('acme', '/')).toBe('/t/acme/');
    });

    it('should handle nested paths', () => {
      expect(buildTenantPath('acme', '/admin/settings/features')).toBe('/t/acme/admin/settings/features');
    });

    it('should handle path with query params', () => {
      expect(buildTenantPath('acme', '/search?q=test')).toBe('/t/acme/search?q=test');
    });
  });

  describe('extractTenantSlug', () => {
    it('should extract slug from tenant path', () => {
      expect(extractTenantSlug('/t/acme/dashboard')).toBe('acme');
    });

    it('should extract slug from path without subpath', () => {
      expect(extractTenantSlug('/t/acme')).toBe('acme');
    });

    it('should extract slug from path with trailing slash', () => {
      expect(extractTenantSlug('/t/acme/')).toBe('acme');
    });

    it('should return null for non-tenant paths', () => {
      expect(extractTenantSlug('/about')).toBeNull();
      expect(extractTenantSlug('/login')).toBeNull();
      expect(extractTenantSlug('/')).toBeNull();
    });

    it('should return null for paths that partially match', () => {
      expect(extractTenantSlug('/tenant/acme')).toBeNull();
      expect(extractTenantSlug('/api/t/acme')).toBeNull();
    });

    it('should handle slugs with hyphens', () => {
      expect(extractTenantSlug('/t/my-company/dashboard')).toBe('my-company');
    });

    it('should handle slugs with underscores', () => {
      expect(extractTenantSlug('/t/my_company/dashboard')).toBe('my_company');
    });

    it('should handle numeric slugs', () => {
      expect(extractTenantSlug('/t/123/dashboard')).toBe('123');
    });
  });
});
