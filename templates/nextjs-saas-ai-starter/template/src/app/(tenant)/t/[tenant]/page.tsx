import { formatDistanceToNow } from 'date-fns';
import { BarChart3, Clock, LayoutDashboard, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getDashboardStats } from '@/features/dashboard/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/ui/page-header';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface TenantDashboardProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantDashboard({ params }: TenantDashboardProps) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  await auth();
  const t = await getTranslations('dashboard');

  const statsResult = tenant?.id ? await getDashboardStats(tenant.id) : null;
  const stats = statsResult?.success ? statsResult.data : null;

  return (
    <div className="space-y-8">
      <PageHeader
        variant="hero"
        icon={<LayoutDashboard className="h-5 w-5" aria-hidden />}
        title={t('welcome', { name: tenant?.name || 'User' })}
        description={t('platformDescription')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.teamSize ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.recentActivity?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
