---
title: Frequently Asked Questions
description: Common questions about Next.js SaaS AI Template — password reset, roles, manager vs 1:1er, integrations, AI features, data export, and how to get help.
section: faq
order: 1
---

# Frequently Asked Questions

Answers to common questions about Next.js SaaS AI Template. For role-specific guides, see [Member](/docs/member), [Manager](/docs/manager), [1:1 Facilitator](/docs/one-on-one), and [Admin](/docs/admin).

## How do I reset my password?

- If your tenant uses **email/password** login: Use the **Forgot password** link on the sign-in page. Enter your email; you’ll receive a link to set a new password. The link may expire after a short time (e.g. 1 hour).
- If you sign in with **SSO** (e.g. Google, Microsoft): Your password is managed by your identity provider. Use that provider’s password reset flow (e.g. your company’s IT or Google account recovery).
- If you don’t receive the email: Check spam, then ask your **admin** to confirm your email in the tenant and resend the reset, or to check whether password reset is enabled for your tenant.

## How do roles work?

Next.js SaaS AI Template uses **permissions**, not job titles. **Roles** (e.g. Member, Manager, Admin, 1:1er) are bundles of **permissions**. What you can do is determined by the **permissions** you have.

- You can have **multiple roles** in a tenant (e.g. Member + 1:1er). Your effective access is the **union** of all permissions from all your roles.
- Only **admins** can assign or change roles (Admin → Members). If you don’t see a section (e.g. Manager or 1:1), you likely don’t have the right role/permissions — ask your admin.

> **Tip:** Authorization is always by permission key (e.g. `manager:dashboard`, `one_on_one:meetings`). Role names are for display and grouping only.

## What’s the difference between manager and 1:1er?

They are **separate**:

|                | Manager                                                                                        | 1:1 Facilitator (1:1er)                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Meaning**    | Reporting relationship in the **org chart**. Defines “who reports to whom.”                    | Person who **facilitates 1:1 conversations** with another. Used for mentoring, career follow-up, feedback. |
| **Who**        | One manager per person (in the hierarchy).                                                     | One or more 1:1ers per person. The 1:1er can be **anyone** — not necessarily their manager.                |
| **Used for**   | Team view, performance assessments (request/submit for reports), assignments, OKRs, org chart. | 1:1 meetings, notes, action items, feedback; read-only view of facilitee performance and projects.         |
| **Data scope** | Your **direct reports** (and possibly full team hierarchy).                                    | Only the people you have a **1:1 relation** with (your facilitees).                                        |

So: you can be someone’s **1:1 facilitator** without being their **manager**, and vice versa. The org chart shows manager relations; the 1:1 tree shows who facilitates 1:1s with whom.

## How do I connect integrations (GitHub, Slack, etc.)?

- **For your profile**: Often there is a **Profile** or **Settings** area where you can **connect** GitHub, LinkedIn, Slack, etc. You’ll be sent to the provider to authorize; after that, your account is linked and the tenant can use it (e.g. to show repos or sync profile).
- **For the tenant**: **Admins** configure integrations in **Admin** → **Integrations**: OAuth apps, API keys, webhooks. They set redirect URLs and data mapping. If an integration isn’t available, your admin may need to enable it or add credentials. See [Integrations](/docs/admin/integrations) for details.

## How do AI features work?

Next.js SaaS AI Template can use AI for:

- **People Finder** — Natural-language and capability-based search (e.g. “Who knows React?”). Uses embeddings and/or chat models depending on configuration.
- **CV processing** — Extracting text and **suggested skills** from uploaded CVs during onboarding. Admins review and verify or merge skills.
- **AI Assistant** — Chat and recommendations (if enabled). Uses the tenant’s configured AI provider and model.

Admins set the **AI provider and model** in **Admin** → **Settings**. Data sent to the provider depends on the feature (e.g. search queries, CV text). Check your tenant’s privacy and data-processing policies.

## What is "Integration Sync" evidence?

When your admin runs a sync from an integration (e.g. GitHub), Next.js SaaS AI Template **automatically creates an evidence record** on each synced person's profile. This shows what data was synced and when. It appears in your **Evidence** tab alongside CVs and other documents.

- These records are labeled **"Integration Sync"** and include a summary (e.g. "GitHub Profile — 25 repos, TypeScript, Python").
- Each sync **updates** the existing record rather than creating duplicates. The timestamp shows the last sync date.
- No action is needed from you — integration evidence is created and maintained automatically by the system.

## How does People Finder search work behind the scenes?

People Finder uses **AI embeddings** — numerical representations of your profile, skills, and interests that enable semantic matching. When you search "React developers interested in cloud," it doesn't just look for the exact words — it finds people whose skills and profile are semantically similar to your query.

Embeddings are generated and kept up to date automatically when you update your skills, interests, or profile, when a CV is processed, or when an admin runs an integration sync. The more complete your profile, the better you show up in relevant searches.

## What are 360 Review Cycles?

**360 Review Cycles** are structured, multi-perspective performance reviews managed by your admin. A cycle can include:

- **Self-assessment** — You evaluate yourself.
- **Supervisor assessment** — Your manager evaluates you.
- **Peer review** — Colleagues evaluate each other.
- **Upward assessment** — You evaluate your manager.

When a cycle is active and you're a participant, you'll see your pending assignments on your **Performance** page. Complete each one before its due date.

If peer nominations are enabled, you can nominate colleagues to review you. Nominations need approval from an admin or your manager before they become assignments.

For admin setup details, see [360 Review Cycles](/docs/admin/review-cycles). For the member experience, see [Performance — 360 Review Cycles](/docs/member/performance#360-review-cycles).

## How do I export data?

- **Your own data**: Use **Profile** or **Settings** for account data. Some tenants offer a **Download my data** or **Export** option for the current user.
- **Managers**: Analytics or team views may offer **Export** (e.g. CSV) for the data you’re allowed to see (your reports, assessments, learning). Use it for reports or backups within policy.
- **Admins**: **Admin** → **Analytics & Audit** (or similar) may provide exports for analytics or audit logs. Bulk export of members or skills depends on tenant and deployment; check Admin → Members or Settings.

If you don’t see an export option, your role may not have permission, or the feature may not be enabled — ask your admin.

## How do I get help?

- **In-app**: Use the **Help** or **Docs** link (often in the header or footer) to open this documentation.
- **Your admin**: For access, roles, invitations, or tenant-specific behavior, contact your **tenant admin** or IT.
- **Support**: If your organization has a support channel or vendor contact for Next.js SaaS AI Template, use that for bugs, outages, or account issues.

> **Tip:** Bookmark the [Docs](/docs) and use the sidebar to jump to your role (Member, Manager, 1:1 Facilitator, Admin) for step-by-step guides.
