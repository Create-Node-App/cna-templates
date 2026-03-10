/**
 * Type-Safe Mock Factories
 *
 * Provides fully typed mock factories for testing, eliminating the need for
 * unsafe `as never` casts. All mocks are type-checked at compile time.
 *
 * @example
 * import { createMockSession, createTypedAuthMock } from '@/__tests__/mock-factories';
 *
 * const authMock = createTypedAuthMock();
 * authMock.mockAuthenticated({ user: { email: 'admin@test.com' } });
 */

import type { Session } from 'next-auth';

import type { TenantRole } from '@/shared/db/schema/auth';
import type { Tenant } from '@/shared/db/schema/tenants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * The return type of the auth() function from next-auth.
 * Can be a Session object or null (unauthenticated).
 */
export type AuthResult = Session | null;

/**
 * Partial session user for mock overrides.
 * All properties are optional to allow partial mocking.
 */
export interface MockSessionUserOverrides {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: Record<string, TenantRole>;
  permissions?: Record<string, string[]>;
}

/**
 * Partial session for mock overrides.
 */
export interface MockSessionOverrides {
  user?: MockSessionUserOverrides;
  expires?: string;
}

/**
 * Complete mock tenant matching the database Tenant type.
 */
export type MockTenant = Tenant;

/**
 * Partial tenant for mock overrides.
 */
export type MockTenantOverrides = Partial<Tenant>;

// ============================================================================
// SESSION MOCK FACTORIES
// ============================================================================

/**
 * Creates a fully typed mock Session object.
 * All required properties are provided with sensible defaults.
 *
 * @param overrides - Partial overrides for session properties
 * @returns A complete Session object
 *
 * @example
 * const session = createMockSession();
 * const adminSession = createMockSession({
 *   user: { roles: { 'test-tenant': 'admin' } }
 * });
 */
export function createMockSession(overrides?: MockSessionOverrides): Session {
  const defaultUser: Session['user'] = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    roles: { 'test-tenant': 'member' },
    permissions: {},
  };

  return {
    user: {
      ...defaultUser,
      ...overrides?.user,
    },
    expires: overrides?.expires ?? new Date(Date.now() + 86400000).toISOString(),
  };
}

/**
 * Creates a mock session for an admin user.
 *
 * @param overrides - Additional overrides
 * @returns A Session with admin role
 */
export function createMockAdminSession(overrides?: MockSessionOverrides): Session {
  return createMockSession({
    ...overrides,
    user: {
      roles: { 'test-tenant': 'admin' },
      ...overrides?.user,
    },
  });
}

/**
 * Creates a mock session for a manager user.
 *
 * @param overrides - Additional overrides
 * @returns A Session with manager role
 */
export function createMockManagerSession(overrides?: MockSessionOverrides): Session {
  return createMockSession({
    ...overrides,
    user: {
      roles: { 'test-tenant': 'manager' },
      ...overrides?.user,
    },
  });
}

/**
 * Creates a null AuthResult (unauthenticated state).
 * Use this instead of `null as never` for type safety.
 *
 * @returns null as AuthResult
 */
export function createNullAuthResult(): AuthResult {
  return null;
}

// ============================================================================
// AUTH MOCK HELPERS
// ============================================================================

/**
 * Creates a type-safe mock function for the auth() function.
 * Returns helper methods for common mocking scenarios.
 *
 * @example
 * const authMock = createTypedAuthMock();
 *
 * // Mock unauthenticated state
 * authMock.mockUnauthenticated();
 *
 * // Mock authenticated user
 * authMock.mockAuthenticated({ user: { email: 'admin@test.com' } });
 *
 * // Use in jest.mock
 * jest.mock('@/shared/lib/auth', () => ({ auth: authMock.mock }));
 */
export function createTypedAuthMock() {
  const mockFn = jest.fn<Promise<AuthResult>, []>();

  return {
    /** The underlying Jest mock function */
    mock: mockFn,

    /**
     * Mock an authenticated user.
     * @param overrides - Optional session overrides
     */
    mockAuthenticated: (overrides?: MockSessionOverrides) => {
      mockFn.mockResolvedValue(createMockSession(overrides));
    },

    /**
     * Mock an unauthenticated state (null session).
     */
    mockUnauthenticated: () => {
      mockFn.mockResolvedValue(null);
    },

    /**
     * Mock an admin user.
     * @param overrides - Optional session overrides
     */
    mockAdmin: (overrides?: MockSessionOverrides) => {
      mockFn.mockResolvedValue(createMockAdminSession(overrides));
    },

    /**
     * Mock a manager user.
     * @param overrides - Optional session overrides
     */
    mockManager: (overrides?: MockSessionOverrides) => {
      mockFn.mockResolvedValue(createMockManagerSession(overrides));
    },

    /**
     * Mock an auth error.
     * @param error - The error to throw
     */
    mockError: (error: Error) => {
      mockFn.mockRejectedValue(error);
    },

    /**
     * Reset the mock.
     */
    reset: () => {
      mockFn.mockReset();
    },

    /**
     * Clear the mock (keeps implementation).
     */
    clear: () => {
      mockFn.mockClear();
    },
  };
}

// ============================================================================
// TENANT MOCK FACTORIES
// ============================================================================

/**
 * Creates a fully typed mock Tenant object.
 *
 * @param overrides - Partial overrides for tenant properties
 * @returns A complete Tenant object matching the database schema
 *
 * @example
 * const tenant = createMockTenant();
 * const customTenant = createMockTenant({ slug: 'custom-tenant' });
 */
export function createMockTenant(overrides?: MockTenantOverrides): MockTenant {
  return {
    id: 'tenant-123',
    name: 'Test Tenant',
    slug: 'test-tenant',
    description: null,
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a type-safe mock function for getTenantBySlug.
 *
 * @example
 * const tenantMock = createTypedTenantMock();
 * tenantMock.mockFound({ name: 'Custom Tenant' });
 * tenantMock.mockNotFound();
 */
export function createTypedTenantMock() {
  const mockFn = jest.fn<Promise<MockTenant | undefined>, [string]>();

  return {
    /** The underlying Jest mock function */
    mock: mockFn,

    /**
     * Mock a found tenant.
     * @param overrides - Optional tenant overrides
     */
    mockFound: (overrides?: MockTenantOverrides) => {
      mockFn.mockResolvedValue(createMockTenant(overrides));
    },

    /**
     * Mock a not found state (undefined).
     */
    mockNotFound: () => {
      mockFn.mockResolvedValue(undefined);
    },

    /**
     * Reset the mock.
     */
    reset: () => {
      mockFn.mockReset();
    },
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if an AuthResult is a valid Session.
 *
 * @param value - The AuthResult to check
 * @returns true if value is a Session, false if null
 *
 * @example
 * const result = await auth();
 * if (isSession(result)) {
 *   console.log(result.user.email);
 * }
 */
export function isSession(value: AuthResult): value is Session {
  return value !== null && typeof value === 'object' && 'user' in value && 'expires' in value;
}

/**
 * Type guard to check if a session has an email.
 *
 * @param session - The Session to check
 * @returns true if user.email is a string
 *
 * @example
 * if (hasEmail(session)) {
 *   sendEmail(session.user.email);
 * }
 */
export function hasEmail(session: Session): session is Session & { user: { email: string } } {
  return typeof session.user.email === 'string';
}

/**
 * Type guard to check if a session user has a specific role for a tenant.
 *
 * @param session - The Session to check
 * @param tenantSlug - The tenant slug to check
 * @param role - The expected role
 * @returns true if user has the specified role
 */
export function hasRole(session: Session, tenantSlug: string, role: TenantRole): boolean {
  return session.user.roles[tenantSlug] === role;
}

// ============================================================================
// PERSON MOCK FACTORIES
// ============================================================================

/**
 * Person summary type for lists and references.
 */
export interface MockPersonSummary {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  title: string | null;
}

/**
 * Person with hierarchy depth information.
 */
export interface MockPersonWithDepth extends MockPersonSummary {
  department: string | null;
  depth: number;
  path: string[];
}

/**
 * Creates a mock person summary.
 *
 * @param overrides - Partial overrides
 * @returns A complete MockPersonSummary
 */
export function createMockPersonSummary(overrides?: Partial<MockPersonSummary>): MockPersonSummary {
  return {
    id: 'person-123',
    displayName: 'Test Person',
    email: 'person@example.com',
    avatarUrl: null,
    title: null,
    ...overrides,
  };
}

/**
 * Creates a mock person with depth information.
 *
 * @param overrides - Partial overrides
 * @returns A complete MockPersonWithDepth
 */
export function createMockPersonWithDepth(overrides?: Partial<MockPersonWithDepth>): MockPersonWithDepth {
  return {
    ...createMockPersonSummary(overrides),
    department: null,
    depth: 0,
    path: [],
    ...overrides,
  };
}

// ============================================================================
// ROADMAP PROGRESS MOCK FACTORIES
// ============================================================================

/**
 * Node progress status.
 */
export type NodeProgressStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Individual node progress.
 */
export interface MockNodeProgress {
  nodeId: string;
  status: NodeProgressStatus;
  updatedAt: Date;
}

/**
 * Roadmap progress with nodes.
 */
export interface MockRoadmapProgressWithNodes {
  id: string;
  roadmapId: string;
  personId: string;
  completionPercentage: number;
  nodeProgress: MockNodeProgress[];
  nodesCompleted: number;
  nodesTotal: number;
  currentNodeId: string | null;
  lastActivityAt: Date | null;
  startedAt: Date;
  completedAt: Date | null;
}

/**
 * Creates a mock roadmap progress with nodes.
 *
 * @param overrides - Partial overrides
 * @returns A complete MockRoadmapProgressWithNodes
 */
export function createMockRoadmapProgress(
  overrides?: Partial<MockRoadmapProgressWithNodes>,
): MockRoadmapProgressWithNodes {
  const nodeProgress = overrides?.nodeProgress ?? [];
  const nodesCompleted = nodeProgress.filter((n) => n.status === 'completed').length;

  return {
    id: 'progress-1',
    roadmapId: 'roadmap-123',
    personId: 'person-1',
    completionPercentage: overrides?.completionPercentage ?? 0,
    nodeProgress,
    nodesCompleted: overrides?.nodesCompleted ?? nodesCompleted,
    nodesTotal: overrides?.nodesTotal ?? nodeProgress.length,
    currentNodeId: overrides?.currentNodeId ?? null,
    lastActivityAt: overrides?.lastActivityAt ?? null,
    startedAt: overrides?.startedAt ?? new Date(),
    completedAt: overrides?.completedAt ?? null,
  };
}

/**
 * Creates a mock node progress entry.
 *
 * @param nodeId - The node ID
 * @param status - The progress status
 * @returns A MockNodeProgress entry
 */
export function createMockNodeProgress(nodeId: string, status: NodeProgressStatus): MockNodeProgress {
  return {
    nodeId,
    status,
    updatedAt: new Date(),
  };
}
