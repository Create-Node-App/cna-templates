import { NextResponse } from 'next/server';

import {
  getTenantSettings,
  resetTenantSettings,
  updateTenantInfo,
  updateTenantSettings,
} from '@/features/admin/services/settings-service';
import { logger } from '@/shared/lib/logger';
import type { TenantSettings } from '@/shared/lib/tenant-settings';

interface RouteParams {
  params: Promise<{ tenant: string }>;
}

/**
 * GET /api/tenants/[tenant]/settings
 * Get tenant settings
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { tenant } = await params;
    const settings = await getTenantSettings(tenant);

    return NextResponse.json({ settings });
  } catch (error) {
    logger.error({ error }, 'Failed to get tenant settings');
    return NextResponse.json({ error: 'Failed to get tenant settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/tenants/[tenant]/settings
 * Update tenant settings
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { tenant } = await params;
    const body = await request.json();
    const { section, data } = body as {
      section: string;
      data: Partial<TenantSettings> | { name?: string; description?: string };
    };

    let settings: TenantSettings | null = null;

    switch (section) {
      case 'info':
        await updateTenantInfo(tenant, data as { name?: string; description?: string });
        settings = await getTenantSettings(tenant);
        break;

      case 'reset':
        settings = await resetTenantSettings(tenant);
        break;

      case 'features':
      case 'ui':
      case 'bulkImport':
      case 'integrations':
      case 'ai':
      case 'storage':
      case 'departments':
      case 'general': {
        settings = await updateTenantSettings(tenant, data as Partial<TenantSettings>);

        break;
      }
      case 'taxonomy':
        settings = await updateTenantSettings(tenant, data as Partial<TenantSettings>);
        break;

      default:
        return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    logger.error({ error }, 'Failed to update tenant settings');
    return NextResponse.json({ error: 'Failed to update tenant settings' }, { status: 500 });
  }
}
