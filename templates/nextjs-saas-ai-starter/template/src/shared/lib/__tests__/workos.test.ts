/**
 * Tests for WorkOS AuthKit helpers (workos.ts)
 *
 * Covers configuration detection and the pure organization-to-tenant
 * mapping helpers. The AuthKit SDK itself is not imported here.
 */

export {};

const mockEnvValues: { current: Record<string, string | undefined> } = { current: {} };

jest.mock('@/shared/lib/env', () => ({
  get env() {
    return mockEnvValues.current;
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { isWorkosAuthKitConfigured, selectWorkosOrganization, workosOrganizationToTenantSlug } = require(
  '../workos',
) as typeof import('../workos');

describe('isWorkosAuthKitConfigured', () => {
  const FULL = {
    WORKOS_API_KEY: 'sk_test_123',
    WORKOS_CLIENT_ID: 'client_123',
    WORKOS_COOKIE_PASSWORD: 'a-32-plus-characters-long-secret!!',
    WORKOS_REDIRECT_URI: 'http://localhost:3000/api/auth/workos/callback',
  };

  it('returns true when all AuthKit variables are set', () => {
    mockEnvValues.current = { ...FULL };
    expect(isWorkosAuthKitConfigured()).toBe(true);
  });

  it.each([['WORKOS_API_KEY'], ['WORKOS_CLIENT_ID'], ['WORKOS_COOKIE_PASSWORD'], ['WORKOS_REDIRECT_URI']])(
    'returns false when %s is missing',
    (missing) => {
      mockEnvValues.current = { ...FULL, [missing]: undefined };
      expect(isWorkosAuthKitConfigured()).toBe(false);
    },
  );

  it('returns false when nothing is configured (default Auth.js flow)', () => {
    mockEnvValues.current = {};
    expect(isWorkosAuthKitConfigured()).toBe(false);
  });
});

describe('workosOrganizationToTenantSlug', () => {
  it.each([
    [{ id: 'org_1', name: 'Acme Corp' }, 'acme-corp'],
    [{ id: 'org_2', name: '  Globex!! International__HQ  ' }, 'globex-international-hq'],
    [{ id: 'org_3', name: 'UPPER lower MiXeD' }, 'upper-lower-mixed'],
  ])('slugifies %j to %s', (org, slug) => {
    expect(workosOrganizationToTenantSlug(org)).toBe(slug);
  });

  it('falls back to the organization ID when the name yields nothing', () => {
    expect(workosOrganizationToTenantSlug({ id: 'org_abcdef123456', name: '!!!' })).toBe('org-abcdef12');
  });
});

describe('selectWorkosOrganization', () => {
  const orgs = [
    { id: 'org_a', name: 'Alpha' },
    { id: 'org_b', name: 'Beta' },
  ];

  it('returns null when there are no organizations', () => {
    expect(selectWorkosOrganization(undefined)).toBeNull();
    expect(selectWorkosOrganization([])).toBeNull();
  });

  it('returns the first organization by default', () => {
    expect(selectWorkosOrganization(orgs)).toEqual(orgs[0]);
  });

  it('prefers the requested organization ID', () => {
    expect(selectWorkosOrganization(orgs, 'org_b')).toEqual(orgs[1]);
  });

  it('falls back to the first organization for an unknown ID', () => {
    expect(selectWorkosOrganization(orgs, 'org_nope')).toEqual(orgs[0]);
  });
});
