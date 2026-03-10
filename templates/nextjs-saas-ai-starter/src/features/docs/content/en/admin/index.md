---
title: Admin Guide Overview
description: Admin responsibilities, dashboard, and admin permissions in Next.js SaaS AI Template.
section: admin
order: 1
---

# Admin Guide Overview

Next.js SaaS AI Template **admins** configure the platform for their organization: members, skills, capabilities, roles, settings, integrations, and more. This guide covers what admins can do and how to access the Admin area.

## Admin Responsibilities

| Area                      | What admins do                                                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Members & Invitations** | Add and remove members, generate invite links with roles, manage member status and invite expiration                                                      |
| **Skills Management**     | Create, edit, and archive skills; manage categories; handle verification and CV-extracted skills; merge duplicates                                        |
| **Capabilities**          | Define capabilities and skill requirements (minimum level, mandatory vs nice-to-have); capability search                                                  |
| **Role Profiles**         | Create role descriptions as knowledge documents; link competencies and responsibilities; career paths                                                     |
| **Trainings & Roadmaps**  | Create training content; use the visual roadmap editor (drag-and-drop); publish/archive; link to skills                                                   |
| **Roles & Permissions**   | Manage system and custom roles; assign permissions; configure PBAC (permission-based access)                                                              |
| **Settings**              | Feature flags, branding (logo, colors), AI provider config, skill scales, categories, storage                                                             |
| **Integrations**          | Configure GitHub (active), Webhooks (active), LinkedIn, Slack, Google Workspace, GitLab (coming soon); OAuth and data mapping |
| **Analytics & Audit**     | View admin analytics dashboard and audit log; filter by event type                                                                                        |
| **Onboarding & Import**   | Onboard new persons (e.g. CV upload); AI-powered CV processing and skill extraction; bulk import                                                          |
| **Recognitions**          | Manage recognition categories; enable/disable; view all recognitions                                                                                      |
| **360 Review Cycles**     | Create and manage 360 review cycles; add participants; launch, close, cancel cycles; approve peer nominations; track progress                             |

## Admin Dashboard

The **Admin Dashboard** is the landing page when you open the Admin section. It typically shows:

- **Tenant overview** — Name, member count, key config summary
- **Quick links** to Members, Settings, Skills, Invitations, and other admin areas
- **Recent activity or alerts** — e.g. pending invites, failed syncs, or items needing attention

Use it as a starting point each time you work in Admin.

## Admin Permissions

Access to admin features is **permission-based** (PBAC). Admins have permissions such as:

| Permission category     | Examples                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **Dashboard**           | `admin:dashboard` — See the admin area                                                               |
| **Members & invites**   | `admin:members`, `admin:invites` — Manage members and invitations                                    |
| **Content**             | `admin:skills`, `admin:capabilities`, `admin:role_profiles`, `admin:trainings`, `admin:roadmaps`     |
| **System**              | `admin:roles` — Roles & permissions; `admin:settings` — Tenant settings                              |
| **Integrations & data** | Integrations and webhooks (often under settings or a dedicated area)                                 |
| **Audit & onboarding**  | `admin:audit`, `admin:onboard`, `admin:processing` — Audit log, onboarding, processing               |
| **Other**               | `admin:okrs`, `admin:recognitions`, `admin:review_cycles` — OKR, recognition, and review cycle admin |

You only see menu items and pages for which you have the corresponding permission. If you don't see something, ask a senior admin to assign the right role or permission.

## Accessing the Admin Area

1. Log in to Next.js SaaS AI Template and open the main navigation.
2. Go to **Admin** (or the equivalent label for your tenant).
3. You'll land on the Admin Dashboard. Use the sidebar to open Members, Skills, Settings, and other sections.

Only users with at least one admin permission (e.g. `admin:dashboard`) see the Admin section.

## Quick Links

- [Members & Invitations](/docs/admin/members-invitations)
- [Skills Management](/docs/admin/skills-management)
- [Capabilities](/docs/admin/capabilities)
- [Role Profiles](/docs/admin/role-profiles)
- [Trainings & Roadmaps](/docs/admin/trainings-roadmaps)
- [Roles & Permissions](/docs/admin/roles-permissions)
- [Settings](/docs/admin/settings)
- [Integrations](/docs/admin/integrations)
- [Analytics & Audit](/docs/admin/analytics-audit)
- [Onboarding & Import](/docs/admin/onboarding-import)
- [Recognitions](/docs/admin/recognitions)
- [360 Review Cycles](/docs/admin/review-cycles)

> **Tip:** Start with Members & Invitations and Settings to ensure your tenant and people are set up, then configure Skills and Capabilities so the rest of the platform has a solid foundation.
