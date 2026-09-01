import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

// Configure this route as the "Sign-in endpoint" in the WorkOS dashboard
// (Redirects section). Required for dashboard-initiated impersonation to work.
export const GET = async () => {
  const signInUrl = await getSignInUrl();
  return redirect(signInUrl);
};
