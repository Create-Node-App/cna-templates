---
title: Admin Guide Overview
description: Admin responsibilities, dashboard, and admin permissions.
section: admin
order: 1
---

# Admin Guide Overview

**Admins** configure the platform for their organization: members, roles, settings, integrations, and more. This guide covers what admins can do and how to access the Admin area.

## Admin Responsibilities

| Area                      | What admins do                                                                 |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Members & Invitations** | Add and remove members, generate invite links with roles, manage member status |
| **Roles & Permissions**   | Manage system and custom roles; assign permissions; configure PBAC             |
| **Settings**              | Feature flags, branding (colors, typography), AI provider config, storage      |
| **Integrations**          | Configure Webhooks, external system sync, OAuth, and data mapping              |

## Admin Dashboard

The **Admin Dashboard** is the landing page when you open the Admin section. It typically shows:

- **Tenant overview** — Name, member count, key config summary
- **Quick links** to Members, Settings, and other admin areas
- **Recent activity or alerts** — e.g. pending invites or items needing attention

Use it as a starting point each time you work in Admin.

## Admin Permissions

Access to admin features is **permission-based** (PBAC). Admins have permissions such as:

| Permission category     | Examples                                                          |
| ----------------------- | ----------------------------------------------------------------- |
| **Dashboard**           | `admin:dashboard` — See the admin area                            |
| **Members & invites**   | `admin:members`, `admin:invites` — Manage members and invitations |
| **System**              | `admin:roles` — Roles & permissions; `admin:settings` — Settings  |
| **Integrations & data** | Integrations and webhooks configuration                           |

You only see menu items and pages for which you have the corresponding permission. If you don't see something, ask a senior admin to assign the right role or permission.

## Accessing the Admin Area

1. Log in and open the main navigation.
2. Go to **Admin** (or the equivalent label for your tenant).
3. You'll land on the Admin Dashboard. Use the sidebar to open Members, Settings, and other sections.

Only users with at least one admin permission (e.g. `admin:dashboard`) see the Admin section.

## Quick Links

- [Members & Invitations](/docs/admin/members-invitations)
- [Roles & Permissions](/docs/admin/roles-permissions)
- [Settings](/docs/admin/settings)
- [Integrations](/docs/admin/integrations)

> **Tip:** Start with Members & Invitations and Settings to ensure your tenant and people are set up correctly.
