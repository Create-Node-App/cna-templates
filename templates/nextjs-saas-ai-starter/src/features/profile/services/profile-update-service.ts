'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

export interface ProfileUpdateData {
  githubUsername?: string | null;
  linkedinUrl?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  phoneNumber?: string | null;
  personalEmail?: string | null;
  timezone?: string | null;
  location?: string | null;
}

/**
 * Get the current user's person record for a tenant.
 */
export async function getMyPerson(tenantSlug: string) {
  const session = await auth();
  if (!session?.user?.email) return null;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return null;

  return db.query.persons.findFirst({
    where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.email, session.user.email)),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      email: true,
      title: true,
      githubUsername: true,
      linkedinUrl: true,
      bio: true,
      pronouns: true,
      phoneNumber: true,
      personalEmail: true,
      timezone: true,
      location: true,
      avatarUrl: true,
    },
  });
}

/**
 * Update the current user's own person profile.
 * Users can only edit specific fields (not name, email, department, etc.).
 */
export async function updateMyProfile(
  tenantSlug: string,
  data: ProfileUpdateData,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: 'Not authenticated' };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  const person = await db.query.persons.findFirst({
    where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.email, session.user.email)),
    columns: { id: true },
  });

  if (!person) {
    return { success: false, error: 'Person not found' };
  }

  try {
    // Sanitize github username (remove @ prefix if provided)
    const githubUsername = data.githubUsername
      ? data.githubUsername
          .trim()
          .replace(/^@/, '')
          .replace(/^https?:\/\/github\.com\//, '')
      : data.githubUsername;

    // Sanitize LinkedIn URL
    const linkedinUrl = data.linkedinUrl ? data.linkedinUrl.trim() : data.linkedinUrl;

    await db
      .update(schema.persons)
      .set({
        githubUsername: githubUsername ?? null,
        linkedinUrl: linkedinUrl ?? null,
        bio: data.bio ?? null,
        pronouns: data.pronouns ?? null,
        phoneNumber: data.phoneNumber ?? null,
        personalEmail: data.personalEmail ?? null,
        timezone: data.timezone ?? null,
        location: data.location ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.persons.id, person.id));

    // Regenerate person profile embedding asynchronously (profile text includes title, dept, etc.)

    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

/**
 * Admin: update a specific person's github username.
 * Requires admin:members permission.
 */
export async function updatePersonGitHubUsername(
  tenantSlug: string,
  personId: string,
  githubUsername: string | null,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  // Import dynamically to avoid circular deps
  const { requirePermission } = await import('@/shared/lib/permissions');
  await requirePermission(tenantSlug, 'admin:members');

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  try {
    const sanitized = githubUsername
      ? githubUsername
          .trim()
          .replace(/^@/, '')
          .replace(/^https?:\/\/github\.com\//, '')
      : null;

    await db
      .update(schema.persons)
      .set({
        githubUsername: sanitized,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.persons.id, personId), eq(schema.persons.tenantId, tenant.id)));

    return { success: true };
  } catch (error) {
    console.error('Failed to update GitHub username:', error);
    return { success: false, error: 'Failed to update' };
  }
}

export interface ProfileSettingsData {
  name?: string;
  title?: string | null;
  bio?: string | null;
  githubUsername?: string | null;
}

export async function updateProfileSettings(
  tenantSlug: string,
  data: ProfileSettingsData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await updateMyProfile(tenantSlug, {
      bio: data.bio,
      githubUsername: data.githubUsername,
    });
    return { success: result.success, error: result.error };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
