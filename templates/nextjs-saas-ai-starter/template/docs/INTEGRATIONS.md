# Integrations

Third-party API integrations using OAuth2 or other auth. The Next.js SaaS AI Template uses Auth.js for **sign-in** (Auth0, development credentials). Integrations below are for **API access** (e.g., syncing data, calling external APIs on behalf of the user or tenant).

The template ships with **GitHub** as the included integration example. Additional integrations can be added by following the same pattern, leveraging the `integration_sync_control` table for sync state management.

---

## GitHub (OAuth2)

[GitHub](https://github.com) is the included integration example. It allows users to connect their GitHub account so the application can call the GitHub API on their behalf.

### Configuration

1. **Register an OAuth App** at [GitHub Developer Settings](https://github.com/settings/developers).
2. **Add the exact redirect URI** your app will use (must match character-for-character):
   - Local: `http://localhost:3000/api/integrations/github/callback`
   - Production: `https://your-domain.com/api/integrations/github/callback`
3. **Environment variables** (optional; if missing, the integration is disabled):

```env
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

### OAuth2 Flow

- **Authorization URL:** `GET https://github.com/login/oauth/authorize`
- **Token URL:** `POST https://github.com/login/oauth/access_token`
- **Flow:** Authorization code.

### App Routes

| Route                                   | Method | Description                                                                                                            |
| --------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `/api/integrations/github/connect`      | GET    | Requires auth. Redirects user to GitHub to authorize. Query: `returnUrl` (optional).                                   |
| `/api/integrations/github/callback`     | GET    | OAuth callback. Exchanges `code` for tokens, stores in `accounts` table (provider `github`), redirects to `returnUrl`. |
| `/api/integrations/github/user-connect` | GET    | User-level GitHub connection flow.                                                                                     |

### Stored Data

- Tokens are stored in the existing Auth.js **accounts** table:
  - `provider`: `github`
  - `providerAccountId`: GitHub user id
  - `access_token`
- One connection per user; reconnecting replaces the previous one.

### Using the API from Code

```ts
import { getValidAccessToken, githubFetch, isGithubConfigured } from '@/features/github';

// Check if user has connected GitHub
const tokens = await getValidAccessToken(userId);
if (tokens) {
  // Call any GitHub API endpoint
  const user = await githubFetch('/user', tokens);
}
```

---

## Outbound Webhooks

The template includes a full outbound webhook system with delivery tracking, configurable per tenant via admin settings.

Tenants can register webhook endpoints to receive notifications for events (e.g., member added, assessment created). Delivery attempts are tracked with retry logic and status history.

### Admin UI

Admins with the **admin:settings** permission can manage webhooks at **Admin → Settings → Webhooks**.

---

## Adding a New Integration

To add a new integration, follow the pattern established by the GitHub integration:

1. Create a feature module in `src/features/<integration-name>/`
2. Add OAuth routes in `src/app/api/integrations/<integration-name>/`
3. Store tokens in the `accounts` table (`provider: '<integration-name>'`)
4. Use `integration_sync_control` for sync state if the integration involves data sync
5. Add environment variables to `src/shared/lib/env.ts`
6. Document the integration in this file

---

_For Auth.js configuration (sign-in providers), see [AUTHENTICATION.md](./AUTHENTICATION.md)._
