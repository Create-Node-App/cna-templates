'use server';

import Papa from 'papaparse';

import { requireTenantAdmin } from '@/shared/lib/rbac';
import type { AdminActionResult } from '../types';

export type BulkImportEntityType = 'members';

export interface BulkImportConfig {
  entityType: BulkImportEntityType;
  csvHeaders: string[];
  requiredHeaders: string[];
  sampleRow: Record<string, string>;
}

export const BULK_IMPORT_CONFIGS: Record<BulkImportEntityType, BulkImportConfig> = {
  members: {
    entityType: 'members',
    csvHeaders: ['email', 'name', 'title', 'department'],
    requiredHeaders: ['email'],
    sampleRow: { email: 'user@example.com', name: 'Jane Doe', title: 'Engineer', department: 'Engineering' },
  },
};

export async function getBulkImportConfig(
  tenantSlug: string,
  entityType: BulkImportEntityType,
): Promise<AdminActionResult<BulkImportConfig>> {
  await requireTenantAdmin(tenantSlug);
  const config = BULK_IMPORT_CONFIGS[entityType];
  if (!config) return { success: false, error: 'Unknown entity type' };
  return { success: true, data: config };
}

export async function parseBulkImportCSV(
  tenantSlug: string,
  _entityType: BulkImportEntityType,
  csvContent: string,
): Promise<AdminActionResult<{ rows: Record<string, string>[]; errors: string[] }>> {
  await requireTenantAdmin(tenantSlug);

  const result = Papa.parse<Record<string, string>>(csvContent, { header: true, skipEmptyLines: true });
  const errors = result.errors.map((e) => e.message);

  return { success: true, data: { rows: result.data, errors } };
}
