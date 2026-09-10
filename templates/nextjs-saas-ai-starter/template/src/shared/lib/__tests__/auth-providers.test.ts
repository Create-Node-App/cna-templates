/**
 * Tests for Auth Provider Selection (auth-providers.ts)
 *
 * Covers AUTH_PROVIDER resolution (Auth0 default, WorkOS opt-in,
 * development fallback), display names, and the client-side reader.
 * Pure module: no env validation or database on import.
 */

import {
  getAuthProviderDisplayName,
  getPublicAuthProviderId,
  isSsoProviderId,
  resolveAuthProviderId,
} from '../auth-providers';

describe('resolveAuthProviderId', () => {
  it('defaults to auth0 when configured provider is unset and Auth0 credentials exist', () => {
    expect(resolveAuthProviderId({ auth0Configured: true, workosConfigured: false })).toBe('auth0');
  });

  it('selects auth0 when explicitly configured with credentials', () => {
    expect(
      resolveAuthProviderId({ configured: 'auth0', auth0Configured: true, workosConfigured: true }),
    ).toBe('auth0');
  });

  it('selects workos when configured with WorkOS credentials', () => {
    expect(
      resolveAuthProviderId({ configured: 'workos', auth0Configured: true, workosConfigured: true }),
    ).toBe('workos');
  });

  it('falls back to development when nothing is configured', () => {
    expect(resolveAuthProviderId({ auth0Configured: false, workosConfigured: false })).toBe('development');
  });

  it('falls back to development when workos is selected but only Auth0 credentials exist', () => {
    // Fail closed: an explicit but uncredentialed selection must not
    // silently serve the other SSO provider.
    expect(
      resolveAuthProviderId({ configured: 'workos', auth0Configured: true, workosConfigured: false }),
    ).toBe('development');
  });

  it('uses auth0 credentials when the configured value is unknown', () => {
    expect(
      resolveAuthProviderId({ configured: 'okta', auth0Configured: true, workosConfigured: false }),
    ).toBe('auth0');
  });

  it('uses workos credentials when the configured value is unknown but only WorkOS is set up', () => {
    expect(
      resolveAuthProviderId({ configured: 'okta', auth0Configured: false, workosConfigured: true }),
    ).toBe('workos');
  });
});

describe('isSsoProviderId', () => {
  it.each([['auth0'], ['workos']])('accepts %s', (value) => {
    expect(isSsoProviderId(value)).toBe(true);
  });

  it.each([['development'], ['okta'], [''], [undefined]])('rejects %s', (value) => {
    expect(isSsoProviderId(value)).toBe(false);
  });
});

describe('getAuthProviderDisplayName', () => {
  it.each([
    ['auth0', 'Auth0'],
    ['workos', 'WorkOS'],
    ['development', 'Development'],
  ] as const)('maps %s to %s', (id, name) => {
    expect(getAuthProviderDisplayName(id)).toBe(name);
  });
});

describe('getPublicAuthProviderId', () => {
  const KEY = 'NEXT_PUBLIC_AUTH_PROVIDER';
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[KEY];
    } else {
      process.env[KEY] = original;
    }
  });

  it('returns auth0 by default', () => {
    delete process.env[KEY];
    expect(getPublicAuthProviderId()).toBe('auth0');
  });

  it('returns workos when configured', () => {
    process.env[KEY] = 'workos';
    expect(getPublicAuthProviderId()).toBe('workos');
  });

  it('falls back to auth0 for unknown values', () => {
    process.env[KEY] = 'okta';
    expect(getPublicAuthProviderId()).toBe('auth0');
  });
});
