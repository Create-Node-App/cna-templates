import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { getTenantBySlug } from '@/shared/lib/tenant';

import { PeopleFinderClient } from './PeopleFinderClient';

interface PeopleFinderPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string }>;
}

/**
 * People Directory Page
 *
 * Server component that fetches persons and renders client component.
 */
export default async function PeopleFinderPage({ params }: PeopleFinderPageProps) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Tenant not found</p>
      </div>
    );
  }

  const persons = await db.query.persons.findMany({
    where: and(eq(schema.persons.tenantId, tenant.id), inArray(schema.persons.status, ['active', 'onboarding'])),
    columns: {
      id: true,
      displayName: true,
      firstName: true,
      lastName: true,
      email: true,
      title: true,
      department: true,
      avatarUrl: true,
    },
    orderBy: (fields, { asc }) => [asc(fields.lastName), asc(fields.firstName)],
  });

  return <PeopleFinderClient tenantSlug={tenantSlug} persons={persons} />;
}
