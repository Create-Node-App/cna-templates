'use server';

import { auth } from '@/shared/lib/auth';
import { requirePermission } from '@/shared/lib/permissions';
import { getTenantBySlug } from '@/shared/lib/tenant';
import type { TenantSettings } from '@/shared/lib/tenant-settings';

import { getTenantSettings, updateTenantSettings } from './settings-service';

/**
 * Save GitHub OAuth credentials to tenant settings.
 */
export async function saveGitHubCredentials(
  tenantSlug: string,
  clientId: string,
  clientSecret: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  await requirePermission(tenantSlug, 'admin:integrations');

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant not found' };
  }

  try {
    const currentSettings = await getTenantSettings(tenantSlug);
    const currentGH = currentSettings.integrations?.github;

    await updateTenantSettings(tenantSlug, {
      integrations: {
        ...currentSettings.integrations,
        github: {
          ...currentGH,
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          enabled: currentGH?.enabled ?? false,
        },
      },
    } as Partial<TenantSettings>);

    return { success: true };
  } catch (error) {
    console.error('Failed to save GitHub credentials:', error);
    return { success: false, error: 'Failed to save credentials' };
  }
}

/**
 * Get GitHub credentials from tenant settings.
 */
export async function getGitHubTenantCredentials(
  tenantSlug: string,
): Promise<{ clientId?: string; clientSecret?: string } | null> {
  const settings = await getTenantSettings(tenantSlug);
  const gh = settings?.integrations?.github;

  if (!gh?.clientId || !gh?.clientSecret) return null;

  return {
    clientId: gh.clientId,
    clientSecret: gh.clientSecret,
  };
}
