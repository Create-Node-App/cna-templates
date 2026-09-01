import { formatDistanceToNow } from 'date-fns';
import { desc, eq } from 'drizzle-orm';
import { BarChart3, Clock, Mail, Users } from 'lucide-react';
import Link from 'next/link';

import { getAdminStats } from '@/features/admin/services/admin-stats-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui';
import { db } from '@/shared/db';
import { auditEvents, tenants } from '@/shared/db/schema';

interface AdminDashboardProps {
  params: Promise<{ tenant: string }>;
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { tenant } = await params;

  const stats = await getAdminStats(tenant);

  // Get recent audit events
  const tenantRecord = await db.query.tenants.findFirst({ where: eq(tenants.slug, tenant) });
  const recentEvents = tenantRecord
    ? await db.query.auditEvents.findMany({
        where: eq(auditEvents.tenantId, tenantRecord.id),
        orderBy: [desc(auditEvents.timestamp)],
        limit: 5,
      })
    : [];

  const statCards = [
    { name: 'Team Members', value: stats.persons, icon: Users, href: 'members' },
    { name: 'Roles', value: stats.roles, icon: BarChart3, href: 'roles' },
    { name: 'Integration Jobs', value: stats.integrationJobs, icon: Clock, href: 'processing' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your tenant <span className="font-medium">{tenant}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={`/t/${tenant}/admin/${stat.href}`}>
              <Card className="rounded-xl border-0 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <CardDescription className="text-xs text-primary hover:underline">Manage →</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link
              href={`/t/${tenant}/admin/members`}
              className="flex items-center gap-3 rounded-xl border p-4 hover:shadow-md hover:border-primary/30 transition-all duration-300"
            >
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">Invite Members</p>
                <p className="text-sm text-muted-foreground">Add new team members to the tenant</p>
              </div>
            </Link>
            <Link
              href={`/t/${tenant}/admin/integrations`}
              className="flex items-center gap-3 rounded-xl border p-4 hover:shadow-md hover:border-primary/30 transition-all duration-300"
            >
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">Manage Integrations</p>
                <p className="text-sm text-muted-foreground">Configure connected services</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest audit events</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity to display.</p>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.entityType && <span>{event.entityType} • </span>}
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
