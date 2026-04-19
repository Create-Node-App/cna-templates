---
title: Frequently Asked Questions
description: Common questions about the platform — password reset, roles, integrations, AI features, data export, and how to get help.
section: faq
order: 1
---

# Frequently Asked Questions

Answers to common questions. For role-specific guides, see [Member](/docs/member) and [Admin](/docs/admin).

## How do I reset my password?

- If your tenant uses **email/password** login: Use the **Forgot password** link on the sign-in page. Enter your email; you'll receive a link to set a new password. The link may expire after a short time (e.g. 1 hour).
- If you sign in with **SSO** (e.g. Google, Microsoft): Your password is managed by your identity provider. Use that provider's password reset flow (e.g. your company's IT or Google account recovery).
- If you don't receive the email: Check spam, then ask your **admin** to confirm your email in the tenant and resend the reset.

## How do roles work?

The platform uses **permissions**, not job titles. **Roles** (e.g. Member, Manager, Admin) are bundles of **permissions**. What you can do is determined by the **permissions** you have.

- You can have **multiple roles** in a tenant. Your effective access is the **union** of all permissions from all your roles.
- Only **admins** can assign or change roles (Admin → Members). If you don't see a section, you likely don't have the right role/permissions — ask your admin.

> **Tip:** Authorization is always by permission key (e.g. `admin:dashboard`, `admin:members`). Role names are for display and grouping only.

## How do I connect integrations?

- **For the tenant**: **Admins** configure integrations in **Admin** → **Integrations**: webhooks, OAuth apps, API keys, and data mapping. If an integration isn't available, your admin may need to enable it or add credentials. See [Integrations](/docs/admin/integrations) for details.

## How do AI features work?

The platform can use AI for:

- **AI Assistant** — Chat and recommendations (if enabled). Uses the tenant's configured AI provider and model.
- **Semantic search** — AI-powered search across content using embeddings for meaning-based matching.

Admins set the **AI provider and model** in **Admin** → **Settings**. Data sent to the provider depends on the feature. Check your tenant's privacy and data-processing policies.

## How do I export data?

- **Your own data**: Use **Profile** or **Settings** for account data export options.
- **Admins**: **Admin** → **Settings** may provide exports for analytics or audit logs.

If you don't see an export option, your role may not have permission, or the feature may not be enabled — ask your admin.

## How do I get help?

- **In-app**: Use the **Help** or **Docs** link (often in the header or footer) to open this documentation.
- **Your admin**: For access, roles, invitations, or tenant-specific behavior, contact your **tenant admin** or IT.
- **Support**: If your organization has a support channel, use that for bugs, outages, or account issues.

> **Tip:** Bookmark the [Docs](/docs) and use the sidebar to jump to your role (Member, Admin) for step-by-step guides.
