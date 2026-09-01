import { Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';

import { TenantLoginForm } from '@/features/auth/components/TenantLoginForm';
import type { TenantRole } from '@/shared/db/schema/auth';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface TenantLoginPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ email?: string }>;
}

export async function generateMetadata({ params }: TenantLoginPageProps) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  return {
    title: `Sign In | ${tenant?.name || tenantSlug} - Next.js SaaS AI Template`,
    description: `Sign in to access ${tenant?.name || tenantSlug} on Next.js SaaS AI Template`,
  };
}

export default async function TenantLoginPage({ params, searchParams }: TenantLoginPageProps) {
  const { tenant: tenantSlug } = await params;
  const { email: emailParam } = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);

  // If tenant doesn't exist, show error
  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-destructive/5 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Tenant Not Found</h1>
          <p className="text-muted-foreground">The organization &quot;{tenantSlug}&quot; does not exist.</p>
        </div>
      </div>
    );
  }

  // Check if already authenticated
  const session = await auth();
  if (session?.user) {
    // Check if user has membership in this tenant
    const userRoles = session.user.roles as Record<string, TenantRole> | undefined;
    const hasMembership = userRoles && tenantSlug in userRoles;

    if (hasMembership) {
      // Has access, redirect to tenant dashboard
      redirect(`/t/${tenantSlug}`);
    } else {
      // Logged in but no membership - show access denied
      return (
        <div className="min-h-screen flex items-center justify-center bg-amber-500/5 p-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 mb-4">
              <Sparkles className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Required</h1>
            <p className="text-muted-foreground mb-4">
              You&apos;re signed in as <strong>{session.user.email}</strong>, but you don&apos;t have access to{' '}
              <strong>{tenant.name}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">Contact your organization admin to request an invitation.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/5 p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary shadow-lg mb-4">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold brand-gradient-text">{tenant.name}</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your workspace</p>
        </div>
        <TenantLoginForm tenantSlug={tenantSlug} tenantName={tenant.name} initialEmail={emailParam ?? ''} />
      </div>
    </div>
  );
}
