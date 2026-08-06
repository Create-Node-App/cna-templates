'use server';

/**
 * Server action to save integration feature flags.
 */

import { revalidatePath } from 'next/cache';

import { auth } from '@/shared/lib/auth';
import { hasPermission } from '@/shared/lib/permissions';
import type { TenantSettings } from '@/shared/lib/tenant-settings';

import { updateFeatureFlag } from './settings-service';

type IntegrationFeatureKey = 'webhooks';

type IntegrationFeatureFlags = Partial<Pick<NonNullable<TenantSettings['features']>, IntegrationFeatureKey>>;

export async function saveIntegrationFeatureFlags(
  tenantSlug: string,
  flags: IntegrationFeatureFlags,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const canManage = await hasPermission(tenantSlug, 'admin:settings');
  if (!canManage) {
    return { success: false, error: 'Forbidden' };
  }

  try {
    // Update each flag individually using the existing function
    for (const [key, value] of Object.entries(flags)) {
      if (value !== undefined) {
        await updateFeatureFlag(tenantSlug, key as IntegrationFeatureKey, value);
      }
    }

    revalidatePath(`/t/${tenantSlug}/admin/integrations`);

    return { success: true };
  } catch (error) {
    console.error('Failed to save integration feature flags:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}
