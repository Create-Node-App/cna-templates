/**
 * RBAC (Role-Based Access Control) Utilities
 *
 * Provides helpers for checking and enforcing role-based permissions.
 * Uses the tenant_memberships table to determine access levels.
 */

import { redirect } from 'next/navigation';

import type { TenantRole } from '@/shared/db/schema/auth';

import { auth } from './auth';
import { hasPermission } from './permissions';

// ============================================================================
// PERMISSION CHECKS (Non-throwing)
// ============================================================================

/** Map minRole to permission key for authorization (always PBAC). */
function minRoleToPermission(minRole: TenantRole): string {
  if (minRole === 'admin') return 'admin:settings';
  if (minRole === 'manager') return 'manager:dashboard';
  return 'profile:read';
}

/**
 * Check if current user has at least the specified role for a tenant.
 * Resolves via hasPermission (admin → admin:settings, manager → manager:dashboard, member → profile:read).
 */
export async function hasRole(tenantSlug: string, minRole: TenantRole): Promise<boolean> {
  return hasPermission(tenantSlug, minRoleToPermission(minRole));
}

/**
 * Check if current user is a tenant admin
 */
export async function isTenantAdmin(tenantSlug: string): Promise<boolean> {
  return hasRole(tenantSlug, 'admin');
}

/**
 * Check if current user is at least a manager
 */
export async function isTenantManager(tenantSlug: string): Promise<boolean> {
  return hasRole(tenantSlug, 'manager');
}

/**
 * Check if current user has any membership in the tenant
 */
export async function isTenantMember(tenantSlug: string): Promise<boolean> {
  return hasRole(tenantSlug, 'member');
}

// ============================================================================
// GUARDS (Throwing/Redirecting)
// ============================================================================

export interface AuthResult {
  userId: string;
  email: string;
  role: TenantRole;
}

/**
 * Require user to be authenticated
 * Redirects to login if not authenticated
 */
export async function requireAuth(): Promise<{ userId: string; email: string }> {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    redirect('/login');
  }

  return {
    userId: session.user.id,
    email: session.user.email,
  };
}

/**
 * Require user to have at least the specified role in a tenant.
 * Resolves via hasPermission (admin → admin:settings, manager → manager:dashboard, member → profile:read).
 */
export async function requireRole(tenantSlug: string, minRole: TenantRole): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    redirect('/login');
  }
  const allowed = await hasPermission(tenantSlug, minRoleToPermission(minRole));
  if (!allowed) redirect(`/t/${tenantSlug}?error=unauthorized`);
  const userRole = session.user.roles?.[tenantSlug] ?? minRole;
  return {
    userId: session.user.id,
    email: session.user.email,
    role: userRole,
  };
}

/**
 * Require user to be a tenant admin (admin:settings permission).
 */
export async function requireTenantAdmin(tenantSlug: string): Promise<AuthResult> {
  return requireRole(tenantSlug, 'admin');
}

/**
 * Require user to be at least a manager (manager:dashboard permission).
 */
export async function requireTenantManager(tenantSlug: string): Promise<AuthResult> {
  return requireRole(tenantSlug, 'manager');
}

/**
 * Require user to be at least a member (profile:read permission).
 */
export async function requireTenantMember(tenantSlug: string): Promise<AuthResult> {
  return requireRole(tenantSlug, 'member');
}

// ============================================================================
// SESSION HELPERS
// ============================================================================

/**
 * Get current user's role for a specific tenant
 */
export async function getCurrentRole(tenantSlug: string): Promise<TenantRole | null> {
  const session = await auth();
  return session?.user?.roles?.[tenantSlug] ?? null;
}

/**
 * Get all tenant roles for the current user
 */
export async function getAllRoles(): Promise<Record<string, TenantRole>> {
  const session = await auth();
  return session?.user?.roles ?? {};
}

// ============================================================================
// CAPABILITY HELPERS (for UI conditional rendering)
// ============================================================================

/**
 * Capabilities derived from roles
 * This provides a clean API for checking what a user can do
 */
export const RoleCapabilities = {
  member: ['view_own_profile', 'use_assistant', 'view_knowledge'] as const,
  manager: ['view_own_profile', 'use_assistant', 'view_knowledge', 'view_team', 'view_team_reports'] as const,
  admin: [
    'view_own_profile',
    'use_assistant',
    'view_knowledge',
    'view_team',
    'view_team_reports',
    'manage_members',
    'manage_knowledge',
    'view_admin',
  ] as const,
} as const;

export type Capability = (typeof RoleCapabilities)[TenantRole][number];

/**
 * Check if a role has a specific capability
 */
export function roleHasCapability(role: TenantRole | undefined, capability: Capability): boolean {
  if (!role) return false;
  return (RoleCapabilities[role] as readonly string[]).includes(capability);
}

/** Map capability to permission key for authorization */
const CAPABILITY_TO_PERMISSION: Record<Capability, string> = {
  view_own_profile: 'profile:read',
  use_assistant: 'assistant:use',
  view_knowledge: 'knowledge:read',
  view_team: 'manager:team',
  view_team_reports: 'team:reports',
  manage_members: 'admin:members',
  manage_knowledge: 'admin:knowledge',
  view_admin: 'admin:dashboard',
};

/**
 * Check if current user has a specific capability in a tenant.
 * Resolves via hasPermission.
 */
export async function hasCapability(tenantSlug: string, capability: Capability): Promise<boolean> {
  const perm = CAPABILITY_TO_PERMISSION[capability];
  return perm ? hasPermission(tenantSlug, perm) : false;
}
