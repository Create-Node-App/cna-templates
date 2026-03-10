---
title: Roles & Permissions
description: System roles (Member, Manager, Admin, 1:1er, Referente), custom roles, assigning permissions, and the PBAC model.
section: admin
order: 7
---

# Roles & Permissions

Next.js SaaS AI Template uses a **permission-based** model (PBAC): access is determined by **permissions**, not by job title. **Roles** are bundles of permissions; a person can have **multiple roles** per tenant, and their effective permissions are the **union** of all those roles' permissions.

## System Roles

These roles are typically available in every tenant:

| Role          | Typical use                                 | Main permissions (examples)                                                                                                                      |
| ------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Member**    | Default for most users                      | profile, self_assess, knowledge, assistant                                                                                                       |
| **Manager**   | People with direct reports                  | member + team, reports, manager:dashboard, manager:team, manager:assignments, manager:performance_assessments, manager:okrs, etc.                |
| **Admin**     | Full tenant configuration                   | manager + all admin:_ and often all one_on_one:_                                                                                                 |
| **1:1er**     | 1:1 facilitators (not necessarily managers) | member + one_on_one:dashboard, one_on_one:meetings, one_on_one:feedback, one_on_one:performance_read, one_on_one:projects_read, one_on_one:notes |
| **Referente** | Subject-matter experts who assign learning  | member + instructor:assign_learning (can assign learning to anyone in the tenant)                                                                |

**Manager** and **1:1er** are **separate**: a 1:1 facilitator does not have to be the person's manager. Permissions define what you can do; person relations (manager, one_to_one) define with whom.

## Custom Roles

If your tenant has **custom roles** enabled (feature flag `allowCustomRoles`):

1. Go to **Admin** → **Roles & Permissions**.
2. Click **Create role** (or **Add role**).
3. Enter **name** and optional **description**.
4. **Assign permissions** — Select the permissions this role should grant (e.g. a "Mentor" role with only one_on_one:meetings and one_on_one:notes).
5. Save. The new role appears in the role list and can be assigned to members and invitations.

When custom roles are **disabled**, only system roles exist; the "Create role" button is hidden, but you can still edit permissions of existing roles.

## Assigning Permissions to a Role

- Open **Admin** → **Roles & Permissions** and select a **role** (system or custom).
- You'll see a list of **permissions** (often grouped by category: profile, manager, one_on_one, admin, etc.).
- **Check** the permissions this role should grant. Save.
- Anyone who has this role (alone or with others) will have the union of all permissions from all their roles.

> **Tip:** Prefer granting the minimum set of permissions needed for the role. You can always add more later; avoid giving admin permissions to broad groups.

## Assigning Roles to Members

- Go to **Admin** → **Members** and open a member.
- **Roles** — Select one or more roles (multiselect). The member's effective permissions are the union of all selected roles.
- Save. Changes apply on next request; the member may need to refresh or log in again to see updated menus and access.

## PBAC Model Summary

| Concept           | Meaning                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Permission**    | A single right (e.g. `manager:dashboard`, `admin:skills`). Authorization checks use permission keys.                  |
| **Role**          | A named bundle of permissions. Used for convenience and clarity.                                                      |
| **Member**        | Can have **multiple roles** per tenant. Effective permissions = union of all roles' permissions.                      |
| **Authorization** | Always by permission: "Can this user do X?" → check `hasPermission(tenant, permissionKey)`. Never by role name alone. |

Admins manage **roles** and **permissions** in Admin → Roles & Permissions; they assign **roles** to members and invitations. The system always resolves access by **permissions** in the database.
