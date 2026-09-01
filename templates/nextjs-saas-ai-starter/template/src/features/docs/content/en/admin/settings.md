---
title: Settings
description: Feature flags, branding (logo, colors), AI provider config, skill scales, skill categories, and storage settings.
section: admin
order: 8
---

# Settings

Admins configure **tenant-wide settings** in **Admin** → **Settings**: feature flags, branding, AI provider, skill scales, categories, and storage. These affect how the platform looks and behaves for everyone in the tenant.

## Feature Flags

**Feature flags** turn features on or off for the tenant without a code deploy.

| Typical flags                 | What they control                                                           |
| ----------------------------- | --------------------------------------------------------------------------- |
| **allowCustomRoles**          | When on: admins can create custom roles. When off: only system roles exist. |
| **OKRs**                      | Enable or hide OKR features (objectives, check-ins) for the tenant.         |
| **Recognitions**              | Enable or hide recognition/praise features.                                 |
| **Integrations**              | Enable specific integrations (e.g. GitHub, Slack).                          |
| **CV upload / onboarding**    | Enable AI-powered CV processing and skill extraction for onboarding.        |
| **People Finder / AI search** | Enable natural-language and capability-based search.                        |

Toggle flags as needed for rollout or compliance. Changes apply after save; users may need to refresh.

## Branding

- **Logo** — Upload or set the tenant logo shown in the header and login/shell. Recommended format and size are usually indicated in the UI.
- **Colors** — Primary (and optionally secondary) colors for buttons, links, and accents. Use your organization's brand colors for a consistent look.

> **Tip:** Use a high-contrast logo and colors so the interface stays accessible.

## AI Provider Configuration

If your tenant uses **AI features** (e.g. People Finder, CV extraction, AI assistant):

- **Provider** — e.g. OpenAI, Azure OpenAI, or another configured provider.
- **Model** — Which model to use for embeddings and/or chat (e.g. for search vs assistant).
- **API key / endpoint** — Stored securely; admins set or rotate keys in Settings. Keys are not shown in full after saving.

Check your provider's documentation for rate limits and costs. Changes to model or key may require a restart or cache clear for some features.

## Skill Scales (1–5 Levels)

Skill levels are usually defined on a **scale** (e.g. 1–5). In Settings you can:

- **Set the scale** — e.g. 1 = Beginner, 5 = Expert. Labels may be editable per level.
- **Use consistently** — The same scale applies to self-assessments, capabilities (minimum level), and reporting. Change only when you're ready to align historical data (or accept a one-time migration).

## Skill Categories

- **Categories** group skills in the catalog (e.g. "Technical", "Leadership"). You can create, rename, reorder, or archive categories in Settings (or in Skills Management).
- Categories help filter skills in admin and member UIs. Keep the list concise.

## Storage Settings

Depending on your deployment, Settings may include:

- **File storage** — Where uploaded files (e.g. CVs, avatars, attachments) are stored (e.g. S3, local). Admins may set bucket, region, or paths.
- **Limits** — Max file size, allowed types, or retention. Configure as required by policy.

## Step-by-Step: Change Branding and a Feature Flag

1. Go to **Admin** → **Settings**.
2. **Branding** — Upload a new logo and set primary color. Save.
3. **Feature flags** — Find the flag (e.g. "Recognitions") and turn it on or off. Save.
4. Refresh the app and confirm the logo/colors and the feature visibility (e.g. Recognition menu appears or disappears).
