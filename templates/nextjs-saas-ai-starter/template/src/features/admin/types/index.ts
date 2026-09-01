import type { TenantRole as TenantRoleType } from '@/shared/db/schema/auth';
export type { TenantRole } from '@/shared/db/schema/auth';
type TenantRole = TenantRoleType;

// ============================================================================
// GENERIC
// ============================================================================

export interface AdminActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// MEMBERS
// ============================================================================

export interface MemberUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface MemberPerson {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
}

export interface MemberWithDetails {
  id: string;
  userId: string;
  personId: string | null;
  tenantId: string;
  role: string;
  roles?: string[];
  primaryRoleId?: string | null;
  createdAt: Date;
  user: MemberUser;
  person: MemberPerson | null;
}

export interface GetAvailableRolesResult {
  roles: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isSystem: boolean;
  }>;
}

export interface InviteInput {
  email: string;
  roleIds: string[];
  departmentId?: string;
}

// ============================================================================
// WEBHOOKS
// ============================================================================

export interface WebhookWithStats {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastDeliveryAt: Date | null;
  successCount: number;
  failureCount: number;
}

// ============================================================================
// LISTS / PARAMS
// ============================================================================

export interface AdminListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface InviteMemberInput {
  email: string;
  name?: string;
  role?: TenantRole;
  roleIds?: string[];
  departmentId?: string;
  message?: string;
}

export interface UpdateMemberInput {
  role?: TenantRole;
  roleIds?: string[];
  departmentId?: string;
  status?: string;
}
