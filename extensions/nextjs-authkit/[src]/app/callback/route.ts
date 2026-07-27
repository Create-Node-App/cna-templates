import { handleAuth } from '@workos-inc/authkit-nextjs';

// Handles the redirect back from WorkOS after a user signs in.
// Must match NEXT_PUBLIC_WORKOS_REDIRECT_URI and the redirect URI
// configured in the WorkOS dashboard (Redirects section).
export const GET = handleAuth({
  returnPathname: '/',
});
