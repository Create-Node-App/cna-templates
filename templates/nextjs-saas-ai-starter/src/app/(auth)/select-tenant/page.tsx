import { Building2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui';

import type { TenantRole } from '@/shared/db/schema/auth';
import { auth } from '@/shared/lib/auth';

export const metadata = {
  title: 'Select Organization | Next.js SaaS AI Template',
  description: 'Choose an organization to access',
};

// Force dynamic rendering - this page depends on session data
export const dynamic = 'force-dynamic';

/**
 * Tenant Selector Page
 *
 * Shown when a user has access to multiple tenants.
 * Allows them to choose which organization to access.
 */
export default async function SelectTenantPage() {
  const session = await auth();

  // Must be logged in to see this page
  if (!session?.user) {
    redirect('/login');
  }

  const userRoles = session.user.roles as Record<string, TenantRole> | undefined;
  const tenantSlugs = userRoles ? Object.keys(userRoles) : [];

  // No memberships - show message
  if (tenantSlugs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-500/5 p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 mb-4">
            <Building2 className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">No Organizations</h1>
          <p className="text-muted-foreground mb-4">
            You&apos;re signed in as <strong>{session.user.email}</strong>, but you don&apos;t have access to any
            organizations yet.
          </p>
          <p className="text-sm text-muted-foreground">Ask your organization admin to send you an invitation link.</p>
        </div>
      </div>
    );
  }

  // Single membership - redirect directly
  if (tenantSlugs.length === 1) {
    redirect(`/t/${tenantSlugs[0]}`);
  }

  // Multiple memberships - show selector
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/5 p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary shadow-lg mb-4">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold brand-gradient-text">Select Organization</h1>
          <p className="text-muted-foreground mt-2">Choose which workspace to access</p>
        </div>

        <Card className="border shadow-xl bg-card">
          <CardHeader className="text-center">
            <CardTitle>Your Organizations</CardTitle>
            <CardDescription>Signed in as {session.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenantSlugs.map((slug) => {
              const role = userRoles![slug];
              return (
                <Link
                  key={slug}
                  href={`/t/${slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{slug}</p>
                      <p className="text-xs text-muted-foreground capitalize">{role}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
