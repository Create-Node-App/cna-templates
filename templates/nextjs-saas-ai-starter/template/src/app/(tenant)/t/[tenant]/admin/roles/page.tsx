/**
 * Roles & Permissions Admin Page
 *
 * Server component that fetches roles and permissions and renders the client.
 */

import { RolesClient } from '@/features/admin/components/RolesClient';
import { listPermissions, listRoles } from '@/features/admin/services/roles-service';
import { requireTenantAdmin } from '@/shared/lib/rbac';
import { getTenantBySlug } from '@/shared/lib/tenant';
import { isFeatureEnabled, parseTenantSettings } from '@/shared/lib/tenant-settings';

interface RolesPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function RolesPage({ params }: RolesPageProps) {
  const { tenant } = await params;
  await requireTenantAdmin(tenant);

  const [rolesResult, permissionsResult, tenantRow] = await Promise.all([
    listRoles(tenant),
    listPermissions(tenant),
    getTenantBySlug(tenant),
  ]);

  if (!rolesResult.success || !rolesResult.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-800">Error Loading Roles</h2>
        <p className="mt-2 text-sm text-red-600">{rolesResult.error || 'An unexpected error occurred'}</p>
      </div>
    );
  }

  const permissions = permissionsResult.success && permissionsResult.data ? permissionsResult.data : [];
  const settings = tenantRow?.settings ? parseTenantSettings(tenantRow.settings) : {};
  const allowCustomRoles = isFeatureEnabled(settings, 'allowCustomRoles');

  return (
    <RolesClient
      tenantSlug={tenant}
      initialRoles={rolesResult.data}
      initialPermissions={permissions}
      allowCustomRoles={allowCustomRoles}
    />
  );
}

export const metadata = {
  title: 'Roles & Permissions | Admin',
  description: 'Manage tenant roles and their permissions',
};
