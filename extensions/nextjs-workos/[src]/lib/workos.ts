import WorkOS from 'next-auth/providers/workos';

// WorkOS SSO via the Auth.js v5 built-in provider.
// Add `workosProvider` to the `providers` array of your NextAuth config
// (for example the `[src]/lib/auth.ts` shipped by the `nextjs-auth`
// extension), then set the WORKOS_* variables in `.env.local`.
export const workosProvider = WorkOS({
  clientId: process.env.WORKOS_CLIENT_ID,
  clientSecret: process.env.WORKOS_CLIENT_SECRET,
  connection: process.env.WORKOS_CONNECTION_ID,
});
