import { eq } from 'drizzle-orm';
import { db } from '@/shared/db';
import { tenants } from '@/shared/db/schema';
import {
  DEFAULT_FEATURES,
  getDefaultTenantSettings,
  mergeTenantSettings,
  parseTenantSettings,
  type TenantSettings,
} from '@/shared/lib/tenant-settings';
import { clearTenantOpenAIClient } from '@/shared/services/embedding-service';
import { clearTenantS3Client } from '@/shared/services/s3-service';

export interface TenantWithSettings {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export async function getTenantSettings(tenantSlug: string): Promise<TenantSettings> {
  const tenant = await db
    .select({ id: tenants.id, settings: tenants.settings })
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);

  if (!tenant.length) {
    return getDefaultTenantSettings();
  }

  return parseTenantSettings(tenant[0].settings);
}

export async function getTenantWithSettings(tenantSlug: string): Promise<TenantWithSettings | null> {
  const tenant = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);

  if (!tenant.length) {
    return null;
  }

  return {
    ...tenant[0],
    settings: parseTenantSettings(tenant[0].settings),
  };
}

export async function updateTenantSettings(
  tenantSlug: string,
  updates: Partial<TenantSettings>,
): Promise<TenantSettings> {
  const current = await getTenantSettings(tenantSlug);
  const merged = mergeTenantSettings(current, updates);

  const tenant = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);

  await db
    .update(tenants)
    .set({
      settings: JSON.stringify(merged),
      updatedAt: new Date(),
    })
    .where(eq(tenants.slug, tenantSlug));

  if (tenant.length > 0) {
    const tenantId = tenant[0].id;
    if (updates.ai !== undefined) {
      clearTenantOpenAIClient(tenantId);
    }
    if (updates.storage !== undefined) {
      clearTenantS3Client(tenantId);
    }
  }

  return merged;
}

export async function updateFeatureFlag(
  tenantSlug: string,
  feature: keyof NonNullable<TenantSettings['features']>,
  enabled: boolean,
): Promise<TenantSettings> {
  const current = await getTenantSettings(tenantSlug);
  const currentFeatures = { ...DEFAULT_FEATURES, ...current.features };
  const newFeatures = { ...currentFeatures, [feature]: enabled };
  return updateTenantSettings(tenantSlug, { features: newFeatures });
}

export async function updateTenantInfo(
  tenantSlug: string,
  data: { name?: string; description?: string },
): Promise<void> {
  await db
    .update(tenants)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tenants.slug, tenantSlug));
}

export async function resetTenantSettings(tenantSlug: string): Promise<TenantSettings> {
  const defaults = getDefaultTenantSettings();

  await db
    .update(tenants)
    .set({ settings: JSON.stringify(defaults), updatedAt: new Date() })
    .where(eq(tenants.slug, tenantSlug));

  return defaults;
}
