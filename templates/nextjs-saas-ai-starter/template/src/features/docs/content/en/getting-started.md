---
title: Welcome to Next.js SaaS AI Template
description: Overview of the platform — multi-tenant SaaS with AI assistance, RBAC, and integrations. Key concepts, user roles, and quick links to guides.
section: getting-started
order: 1
---

# Welcome to Next.js SaaS AI Template

Next.js SaaS AI Template is a **multi-tenant SaaS starter** with AI assistance, role-based access control, and integration capabilities built in. It helps teams collaborate, manage members, and leverage AI — all with proper tenant isolation and permissions.

This guide introduces the platform, key concepts, user roles, and where to go next.

---

## What This Platform Does

The template provides three foundational pillars:

- **Multi-tenant organization** — Each tenant (organization) has its own members, roles, departments, and settings. Data is fully isolated between tenants.
- **AI-powered assistance** — An in-app AI assistant that can answer questions, search content semantically, and provide recommendations. Configurable per tenant.
- **Integrations and automation** — Webhooks, sync engine, and external system connectivity for building workflows that fit your needs.

> **Tip:** This is a **tenant-based** platform. Your organization (tenant) has its own members, configuration, and data. If you belong to multiple organizations, you switch between them from the app.

---

## Key Concepts

| Concept          | What it means                                                                    |
| ---------------- | -------------------------------------------------------------------------------- |
| **Tenant**       | Your organization. Each tenant has its own members, roles, and configuration.    |
| **Person**       | A member within a tenant — contains profile info, department, and relationships. |
| **Role**         | Defines permissions: what you can see and do (member, manager, admin).           |
| **AI Assistant** | In-app conversational AI for questions, search, and guidance.                    |
| **Integrations** | Connections to external systems via webhooks and sync engine.                    |

Understanding these will help you navigate the Member and Admin guides.

---

## User Roles

Your experience depends on your **role** (and permissions) in the tenant. Roles are separate from your job title; they define what you can see and do.

| Role        | Who it's for            | What you get                                                                       |
| ----------- | ----------------------- | ---------------------------------------------------------------------------------- |
| **Member**  | Everyone                | Your profile, dashboard, AI assistant, and access to shared resources.             |
| **Manager** | People who manage teams | Everything in Member, plus team visibility and management capabilities.            |
| **Admin**   | Tenant administrators   | Full access: members, invitations, roles, permissions, settings, and integrations. |

---

## Quick Links to Guides

Depending on your role, start here:

- **New to the platform?** → [First Login](/docs/en/getting-started/first-login) and [Navigation](/docs/en/getting-started/navigation).
- **Set up your profile** → [Profile Setup](/docs/en/getting-started/profile-setup).
- **Member** → Member guide: dashboard, profile settings, and AI assistant.
- **Admin** → Admin guide: members, roles, settings, and integrations.

Use the **docs sidebar** or **search** to jump to any topic.

---

## Interactive Components

The platform uses a consistent design system. Here is a live preview of available button variants:

```preview
component: ButtonVariants
props: {}
```

---

## Why This Template?

This template is designed as a solid foundation for your SaaS:

- **Multi-tenancy from day one** — Proper data isolation, per-tenant configuration, and scalable architecture.
- **AI-native** — AI assistant infrastructure ready for your domain-specific use cases.
- **Permissions done right** — RBAC with fine-grained permissions, not just role checks.
- **Integration-ready** — Webhook and sync engine infrastructure for connecting to external systems.

If you have feedback or questions, use your tenant's usual support channel or reach out to your admin.
