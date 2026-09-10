# WorkOS SSO Setup

Step-by-step guide to connecting your Next.js app to an enterprise identity
provider through WorkOS, using the Auth.js v5 WorkOS provider shipped by this
extension (`[src]/lib/workos.ts`).

## Prerequisites

- A free WorkOS account ([dashboard.workos.com](https://dashboard.workos.com))
- Access to an identity provider (IdP) for testing — WorkOS provides a
  **Test Organization** with a demo IdP so no corporate IdP is needed
- This extension applied to a `nextjs` template (see [README](./README.md))

## 1. Get your API credentials

1. Sign in at [dashboard.workos.com](https://dashboard.workos.com).
2. Copy the **Client ID** (`client_...`) and **API key** (`sk_...`) from the
   dashboard home screen into `.env.local`:

```dotenv
WORKOS_CLIENT_ID=client_your_client_id
WORKOS_CLIENT_SECRET=sk_your_api_key
```

## 2. Create an SSO connection

1. Go to **Organizations** and create an organization (or use the
   **Test Organization**).
2. Open the organization, go to **SSO**, and add a connection for your IdP
   (for local testing pick the demo IdP).
3. Copy the **Connection ID** (`conn_...`) into `.env.local`:

```dotenv
WORKOS_CONNECTION_ID=conn_your_connection_id
```

## 3. Configure redirect URIs

In the dashboard, under the connection (or application) settings, add:

- **Redirect URI**: `http://localhost:3000/api/auth/callback/workos` for local dev
- Production: `https://your-domain.com/api/auth/callback/workos`

The path must match the Auth.js callback route (`/api/auth/callback/workos`);
a mismatch is the most common cause of `callback_uri_mismatch` errors.

## 4. Wire the provider into Auth.js

In your NextAuth config (e.g. `[src]/lib/auth.ts` from the `nextjs-auth`
extension), add the preconfigured provider:

```typescript
import { workosProvider } from './workos';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [workosProvider],
});
```

## 5. Test locally

1. Start the app: `npm run dev`.
2. Trigger sign-in (e.g. visit your login page or call `signIn('workos')`).
3. You are redirected to the IdP; sign in with the test user.
4. WorkOS redirects back to `/api/auth/callback/workos` and Auth.js creates
   the session — verify with `await auth()` in a Server Component.

## Environment variable reference

| Variable | Required | Description |
|---|---|---|
| `WORKOS_CLIENT_ID` | Yes | WorkOS Client ID (`client_...`) from the dashboard |
| `WORKOS_CLIENT_SECRET` | Yes | WorkOS API key (`sk_...`) from the dashboard |
| `WORKOS_CONNECTION_ID` | Yes | SSO connection (`conn_...`) selecting the IdP/organization |

## Troubleshooting

- **`callback_uri_mismatch`** — the dashboard redirect URI must exactly match
  `<origin>/api/auth/callback/workos`.
- **Wrong organization signs in** — check `WORKOS_CONNECTION_ID` points at the
  intended connection.
- **Missing env vars in production** — set all three `WORKOS_*` variables in
  your hosting provider; never commit `.env.local`.

## References

- [WorkOS docs](https://workos.com/docs)
- [WorkOS x NextAuth.js](https://workos.com/docs/integrations/next-auth)
- [Auth.js WorkOS provider](https://authjs.dev/getting-started/providers/workos)
