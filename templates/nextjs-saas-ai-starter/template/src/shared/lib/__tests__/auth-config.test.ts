/**
 * Integration Tests for Auth Provider Swap (Auth0 <-> WorkOS)
 *
 * Verifies the exported Auth.js configuration registers the correct
 * provider for each AUTH_PROVIDER selection, and that the session callbacks
 * enrich sessions identically regardless of provider. Database, env, and
 * permissions are mocked; no real OAuth credentials are used.
 */

export {};

const mockDbQuery = {
  users: { findFirst: jest.fn() },
  tenants: { findFirst: jest.fn() },
  tenantMemberships: { findMany: jest.fn() },
};

// Mutable env holder (mock-prefixed so jest.mock factories may reference it).
const mockEnvValues: {
  current: Record<string, string | undefined>;
} = {
  current: {},
};

jest.mock('@/shared/lib/env', () => ({
  get env() {
    return mockEnvValues.current;
  },
}));

jest.mock('@/shared/db', () => ({
  db: { query: mockDbQuery },
}));

jest.mock('@/shared/lib/permissions', () => ({
  getAllTenantPermissionsForUser: jest.fn(),
}));

// Provider SDK modules ship ESM that is not transformable under pnpm paths,
// so stub the factories (the global setup already stubs next-auth itself).
jest.mock('next-auth/providers/auth0', () => ({
  __esModule: true,
  default: jest.fn((options: Record<string, unknown>) => ({ id: 'auth0', ...options })),
}));

jest.mock('next-auth/providers/workos', () => ({
  __esModule: true,
  default: jest.fn((options: Record<string, unknown>) => ({ id: 'workos', ...options })),
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn((options: Record<string, unknown>) => ({ id: options.id ?? 'credentials', ...options })),
}));

// Override the global '@/shared/lib/auth' mock with the real module so the
// exported authConfig (provider wiring + callbacks) is exercised.
jest.mock('@/shared/lib/auth', () => jest.requireActual('@/shared/lib/auth'));

const BASE_ENV: Record<string, string | undefined> = {
  NODE_ENV: 'test',
  AUTH_SECRET: 'test-secret-at-least-32-characters-long',
  AUTH_PROVIDER: 'auth0',
  AUTH0_CLIENT_ID: 'auth0-id',
  AUTH0_CLIENT_SECRET: 'auth0-secret',
  AUTH0_ISSUER: 'https://tenant.auth0.com',
  WORKOS_CLIENT_ID: undefined,
  WORKOS_CLIENT_SECRET: undefined,
  WORKOS_CONNECTION_ID: undefined,
  NEXT_PUBLIC_STAGE: undefined,
};

function loadAuthConfig() {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../auth') as typeof import('../auth');
}

function providerIds(config: { authConfig: { providers?: unknown[] } }): string[] {
  return (config.authConfig.providers ?? []).map((p) => (p as { id?: string }).id ?? 'unknown');
}

describe('auth provider registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers auth0 by default with Auth0 credentials', () => {
    mockEnvValues.current = { ...BASE_ENV };
    const { authConfig, activeAuthProviderId } = loadAuthConfig();

    expect(activeAuthProviderId).toBe('auth0');
    expect(providerIds({ authConfig })).toContain('auth0');
    expect(providerIds({ authConfig })).not.toContain('workos');
  });

  it('registers workos when AUTH_PROVIDER=workos with WorkOS credentials', () => {
    mockEnvValues.current = {
      ...BASE_ENV,
      AUTH_PROVIDER: 'workos',
      AUTH0_CLIENT_ID: undefined,
      AUTH0_CLIENT_SECRET: undefined,
      AUTH0_ISSUER: undefined,
      WORKOS_CLIENT_ID: 'client_123',
      WORKOS_CLIENT_SECRET: 'sk_test_123',
      WORKOS_CONNECTION_ID: 'conn_123',
    };
    const { authConfig, activeAuthProviderId } = loadAuthConfig();

    expect(activeAuthProviderId).toBe('workos');
    expect(providerIds({ authConfig })).toContain('workos');
    expect(providerIds({ authConfig })).not.toContain('auth0');
  });

  it('falls back to development-only when no SSO credentials exist', () => {
    mockEnvValues.current = {
      ...BASE_ENV,
      AUTH0_CLIENT_ID: undefined,
      AUTH0_CLIENT_SECRET: undefined,
      AUTH0_ISSUER: undefined,
    };
    const { authConfig, activeAuthProviderId } = loadAuthConfig();

    expect(activeAuthProviderId).toBe('development');
    expect(providerIds({ authConfig })).not.toContain('auth0');
    expect(providerIds({ authConfig })).not.toContain('workos');
  });
});

describe('session callbacks (provider-agnostic)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnvValues.current = { ...BASE_ENV };
  });

  function mockMemberships() {
    mockDbQuery.tenantMemberships.findMany.mockResolvedValue([
      { tenant: { slug: 'acme' }, role: 'admin' },
      { tenant: { slug: 'globex' }, role: 'member' },
    ]);
    const { getAllTenantPermissionsForUser } =
      jest.requireMock('@/shared/lib/permissions') as {
        getAllTenantPermissionsForUser: jest.Mock;
      };
    getAllTenantPermissionsForUser.mockResolvedValue({ acme: ['members:read'], globex: [] });
  }

  it('jwt callback enriches the token with roles and permissions on sign in', async () => {
    const { authConfig } = loadAuthConfig();
    mockMemberships();

    const token = await authConfig.callbacks?.jwt?.({
      token: {},
      user: { id: 'user-1' },
      account: null,
      profile: undefined,
      trigger: 'signIn',
      isNewUser: false,
      session: undefined,
    } as never);

    expect(token).toMatchObject({
      id: 'user-1',
      roles: { acme: 'admin', globex: 'member' },
      permissions: { acme: ['members:read'], globex: [] },
    });
  });

  it('session callback adds id, roles, and permissions for database sessions', async () => {
    const { authConfig } = loadAuthConfig();
    mockMemberships();

    const session = await authConfig.callbacks?.session?.({
      session: { user: {}, expires: new Date().toISOString() },
      user: { id: 'user-1' },
      token: {},
    } as never);

    expect(session?.user).toMatchObject({
      id: 'user-1',
      roles: { acme: 'admin', globex: 'member' },
      permissions: { acme: ['members:read'], globex: [] },
    });
  });

  it('session callback works identically for a workos-backed account', async () => {
    mockEnvValues.current = {
      ...BASE_ENV,
      AUTH_PROVIDER: 'workos',
      WORKOS_CLIENT_ID: 'client_123',
      WORKOS_CLIENT_SECRET: 'sk_test_123',
    };
    const { authConfig } = loadAuthConfig();
    mockMemberships();

    // Provider is recorded on the account row; enrichment is provider-agnostic.
    expect(providerIds({ authConfig })).toContain('workos');
    const session = await authConfig.callbacks?.session?.({
      session: { user: {}, expires: new Date().toISOString() },
      user: { id: 'user-9' },
      token: {},
    } as never);

    expect(session?.user).toMatchObject({
      id: 'user-9',
      roles: { acme: 'admin', globex: 'member' },
      permissions: { acme: ['members:read'], globex: [] },
    });
  });
});

describe('authorized callback route protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnvValues.current = { ...BASE_ENV };
  });

  function check(pathname: string, loggedIn: boolean) {
    const { authConfig } = loadAuthConfig();
    return authConfig.callbacks?.authorized?.({
      auth: loggedIn ? { user: { id: 'user-1' } } : null,
      request: { nextUrl: new URL(`http://localhost${pathname}`) },
    } as never);
  }

  it.each([['/login'], ['/'], ['/api/health'], ['/api/auth/signin'], ['/t/acme/login']])(
    'allows unauthenticated access to %s',
    async (pathname) => {
      await expect(check(pathname, false)).resolves.toBe(true);
    },
  );

  it.each([['/select-tenant'], ['/t/acme'], ['/t/acme/admin']])(
    'requires authentication for %s',
    async (pathname) => {
      await expect(check(pathname, false)).resolves.toBe(false);
      await expect(check(pathname, true)).resolves.toBe(true);
    },
  );
});
