/**
 * Invite Acceptance Page
 *
 * Validates an invite token and redirects to sign-in if needed,
 * or directly to onboarding if already authenticated.
 */

import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { acceptInvite, validateInviteToken } from '@/features/admin/services/invite-service';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

interface InvitePageProps {
  params: Promise<{ tenant: string; token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { tenant: tenantSlug, token } = await params;

  // Verify tenant exists
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return (
      <InviteErrorPage
        title="Invalid Link"
        message="This invitation link is invalid or the organization no longer exists."
      />
    );
  }

  // Validate the token
  const validation = await validateInviteToken(tenantSlug, token);

  if (!validation.success || !validation.data) {
    return (
      <InviteErrorPage
        title="Invalid Invitation"
        message={validation.error || 'This invitation is invalid or has expired.'}
      />
    );
  }

  const inviteData = validation.data;

  // Check if user is authenticated
  const session = await auth();

  if (!session?.user?.id) {
    // Not authenticated - redirect to sign in with callback
    const callbackUrl = encodeURIComponent(`/t/${tenantSlug}/invite/${token}`);
    redirect(`/login?callbackUrl=${callbackUrl}&invite_email=${encodeURIComponent(inviteData.email)}`);
  }

  // Verify email matches
  if (session.user.email?.toLowerCase() !== inviteData.email.toLowerCase()) {
    return (
      <InviteErrorPage
        title="Email Mismatch"
        message={`This invitation was sent to ${inviteData.email}. Please sign in with that email address.`}
        showSignOut
      />
    );
  }

  // Accept the invite
  const acceptResult = await acceptInvite(tenantSlug, token, session.user.id);

  if (!acceptResult.success) {
    return (
      <InviteErrorPage
        title="Could Not Accept Invitation"
        message={acceptResult.error || 'Failed to accept the invitation.'}
      />
    );
  }

  // Success - redirect to onboarding
  redirect(`/t/${tenantSlug}/onboarding/cv`);
}

// Error component
function InviteErrorPage({
  title,
  message,
  showSignOut = false,
}: {
  title: string;
  message: string;
  showSignOut?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {showSignOut ? (
            <Button asChild>
              <Link href="/api/auth/signout">Sign Out & Try Again</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/">Go to Home</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
