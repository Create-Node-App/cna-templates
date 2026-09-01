/**
 * Audit Logs Admin Page
 *
 * Server component that fetches initial data and renders the client.
 */

import { AuditLogsClient } from '@/features/admin/components/AuditLogsClient';
import {
  getAuditActors,
  getDistinctActions,
  getDistinctEntityTypes,
  listAuditEvents,
} from '@/features/admin/services/audit-logs-service';

interface AuditLogsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function AuditLogsPage({ params }: AuditLogsPageProps) {
  const { tenant } = await params;

  // Fetch initial data in parallel
  const [eventsResult, actionsResult, entityTypesResult, actorsResult] = await Promise.all([
    listAuditEvents(tenant, { page: 1, pageSize: 50 }),
    getDistinctActions(tenant),
    getDistinctEntityTypes(tenant),
    getAuditActors(tenant),
  ]);

  if (!eventsResult.success || !eventsResult.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-800">Error Loading Audit Logs</h2>
        <p className="mt-2 text-sm text-red-600">{eventsResult.error || 'An unexpected error occurred'}</p>
      </div>
    );
  }

  return (
    <AuditLogsClient
      tenantSlug={tenant}
      initialData={eventsResult.data}
      availableActions={actionsResult.success ? actionsResult.data || [] : []}
      availableEntityTypes={entityTypesResult.success ? entityTypesResult.data || [] : []}
      availableActors={actorsResult.success ? actorsResult.data || [] : []}
    />
  );
}

export const metadata = {
  title: 'Audit Logs | Admin',
  description: 'View all actions performed in your organization',
};
