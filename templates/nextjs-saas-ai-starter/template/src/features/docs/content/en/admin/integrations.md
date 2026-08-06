---
title: Integrations
description: GitHub, LinkedIn, Slack, Google Workspace, GitLab, webhooks — OAuth setup, sync, and data mapping.
section: admin
order: 9
---

# Integrations

Next.js SaaS AI Template can connect to external systems so you can sync people, skills, or activity and enrich profiles. Admins configure **integrations** (OAuth, API keys, webhooks) and **data mapping** so the right data flows in and out.

## Supported Integrations (Overview)

| Integration          | Status      | Typical use                                                        |
| -------------------- | ----------- | ------------------------------------------------------------------ |
| **GitHub**           | ✅ Active   | Link profiles to GitHub; sync repos, activity, or skills from code |
| **Webhooks**         | ✅ Active   | Outbound events (e.g. person updated, assessment submitted)        |
| **LinkedIn**         | 🔜 Soon     | Import profile or skills from LinkedIn                             |
| **Slack**            | 🔜 Soon     | Notifications, bot, or identity linking                            |
| **Google Workspace** | 🔜 Soon     | Identity, calendar, or directory sync                              |
| **GitLab**           | 🔜 Soon     | Similar to GitHub — repos, activity, skills                        |

Use **Admin** → **Integrations** to see which are enabled.

## GitHub Integration (Active)

GitHub is the primary active integration. Once configured:

1. **Create an OAuth App** in GitHub → Developer Settings. Get **Client ID** and **Client Secret**.
2. **Set redirect URI** — use the URL shown in Admin → Integrations → GitHub (e.g. `https://your-tenant.app/api/auth/callback/github`).
3. In **Admin** → **Integrations** → **GitHub**, enter credentials and save.
4. Members can connect their GitHub account from their profile settings.

On each sync, Next.js SaaS AI Template **automatically creates an evidence record** on the person's profile showing repos scanned, languages found, skills inferred, and contributions.

## Webhooks (Active — Outbound)

**Webhooks** send events from Next.js SaaS AI Template to your system (e.g. "person created", "assessment submitted"):

1. **Admin** → **Integrations** → **Webhooks**.
2. **Add webhook** — URL, optional secret for signing payloads, and **event types** to subscribe to.
3. Save. Next.js SaaS AI Template will POST a JSON payload to your URL on each selected event. Implement idempotency and verify the signature.

## OAuth Setup (for coming soon integrations)

For integrations that use **OAuth** (LinkedIn, Slack, Google Workspace, GitLab):

1. **Create an app** in the provider's developer portal. Get **Client ID** and **Client Secret**.
2. **Set redirect URI** — use the URL Next.js SaaS AI Template provides. Must match exactly.
3. In **Admin** → **Integrations**, select the integration and enter credentials.
4. Members authorize via the provider's consent screen.

> **Tip:** Use a dedicated OAuth app per environment (dev vs prod) and rotate secrets if exposed.

## Semantic Search and Embeddings

Integration syncs contribute to **semantic search** (People Finder, AI Assistant):

- **New skills** from GitHub sync get embeddings for skill search.
- **Updated profiles** get their embedding regenerated so People Finder stays current.
- **Bulk imports** (skills, capabilities, persons) also generate embeddings automatically.
