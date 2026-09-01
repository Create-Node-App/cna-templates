# Roles and Permissions (PBAC)

The Next.js SaaS AI Template uses a **permission-based** model (PBAC). Authorization is always resolved from the database: `tenant_membership_roles` → `role_permissions` → `permissions`. **A person can have multiple roles per tenant**; their effective permissions are the **union** of all their roles' permissions. Roles are named bundles of permissions; the decision "can this user do X?" is always `hasPermission(tenantSlug, permissionKey)` against the DB.

## Feature flag: allowCustomRoles

- **Key**: `allowCustomRoles`
- **Location**: Tenant settings (Admin → Settings → Features)
- **Default**: `true`

When **on**: Admins can create new roles in addition to system roles (Member, Manager, Admin, 1:1er, Referente, etc.) in Admin → Roles & Permissions.

When **off**: Only system roles exist; the "Create role" button is hidden. Admins can still edit permissions of existing system roles.

## Session and permissions for UI

- **`session.user.roles`**: Role enum per tenant (`member` | `manager` | `admin`) for display and tenant list. Not used for authorization.
- **`session.user.permissions`**: `Record<tenantSlug, string[]>` filled by the auth callback. Used **only for UI/nav** (e.g. Sidebar, ManagerSidebar) so the client can show the correct links without waiting for layout props. **API authorization always uses `hasPermission(tenantSlug, key)` against the DB** so that revocations apply on the next request.

## Data model

- **`permissions`**: `id`, `tenantId` (nullable for global), `key`, `name`, `category`.
- **`roles`**: `id`, `tenantId`, `name`, `slug`, `isSystem`, `description`.
- **`role_permissions`**: `roleId`, `permissionId` (many-to-many).
- **`tenant_memberships`**: `role` (enum for display), `primaryRoleId` (FK to `roles`, optional).
- **`tenant_membership_roles`**: `membershipId`, `roleId` (many-to-many: **a person can have multiple roles per tenant**; effective permissions are the union of all their roles' permissions).
- **`tenant_invitations`**: `role` (display), `roleId` (FK to `roles` for initial role when accepting).

## Default permissions (by category)

| Category   | Keys                                                                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| profile    | `profile:read`, `profile:write`                                                                                                                                                                                                                                                                       |
| assessment | `self_assess`                                                                                                                                                                                                                                                                                         |
| assistant  | `assistant:use`                                                                                                                                                                                                                                                                                       |
| knowledge  | `knowledge:read`                                                                                                                                                                                                                                                                                      |
| team       | `team:read`, `team:reports`                                                                                                                                                                                                                                                                           |
| manager    | `manager:dashboard`, `manager:team`, `manager:assignments`, `manager:analytics`, `manager:okrs`, `manager:project_assignments`, `manager:performance_assessments`                                                                                                                                     |
| one_on_one | `one_on_one:dashboard`, `one_on_one:meetings`, `one_on_one:feedback`, `one_on_one:performance_read`, `one_on_one:projects_read`, `one_on_one:notes`                                                                                                                                                   |
| learning   | `instructor:assign_learning` (assign learning to any tenant member)                                                                                                                                                                                                                                   |
| admin      | `admin:dashboard`, `admin:skills`, `admin:capabilities`, `admin:role_profiles`, `admin:trainings`, `admin:roadmaps`, `admin:members`, `admin:invites`, `admin:onboard`, `admin:processing`, `admin:audit`, `admin:settings`, `admin:okrs`, `admin:recognitions`, `admin:roles`, `admin:review_cycles` |

### Manager vs 1:1er permissions

The `manager:*` and `one_on_one:*` namespaces are **separate and independent**:

- **manager:\*** permissions are for people who have **reports in the management hierarchy**. They can manage performance, projects, and assignments for their reports.
- **one_on_one:\*** permissions are for people who **facilitate 1:1 conversations**. They can manage 1:1 meetings, view feedback, and have read-only access to performance/projects for the people they 1:1 with.

A person who is **both a manager AND a 1:1 facilitator** simply has both sets of permissions. They are composable roles.

## Default roles

- **member**: profile, self_assess, assistant, knowledge.
- **manager**: member + team, reports, manager:dashboard, manager:team, manager:assignments, manager:analytics, manager:okrs, manager:project_assignments, manager:performance_assessments.
- **admin**: manager + all one_on_one:\* + all admin:\*.
- **1:1er** (optional role): member + all one_on_one:\* (dashboard, meetings, feedback, performance_read, projects_read, notes). Configurable in Admin → Roles & Permissions.
- **Referente** (optional role): member + `manager:dashboard`, `instructor:assign_learning`. Can assign learning to any tenant member.

## API (code)

- **`hasPermission(tenantSlug, permissionKey): Promise<boolean>`**  
  `src/shared/lib/permissions.ts`  
  Always resolves via DB. Use this for all API and server-side authorization. Do not rely on `session.user.permissions` for authorization.

- **`requirePermission(tenantSlug, permissionKey)`**  
  Same module. Redirects to login or unauthorized if the user does not have the permission.

- **`getCurrentUserPermissions(tenantSlug): Promise<string[]>`**  
  Returns the list of permission keys. May return from `session.user.permissions` when already set (to avoid extra DB in the same request). Used by layouts/sidebars for conditional nav.

- **`getCurrentRoleIds(tenantSlug)` / `getCurrentRoles(tenantSlug)`**  
  Return the current user’s role IDs/roles in the tenant (from DB).

- **`requireTenantAdmin` / `requireTenantManager` / `requireTenantMember`**  
  `src/shared/lib/rbac.ts`  
  Resolve to permission checks (admin → `admin:settings`, manager → `manager:dashboard`, member → `profile:read`).

## Layouts and sidebars

- **Admin layout**: Access requires `admin:dashboard`. Layout passes `getCurrentUserPermissions(tenant)` to `AdminSidebar`; sidebars also read `session.user.permissions?.[tenantSlug]` when available.
- **Manager layout**: Access requires `manager:dashboard` or `instructor:assign_learning`. Sidebar items are shown based on permissions (e.g. `manager:team`, `manager:assignments`, `instructor:assign_learning`).
- **1:1 Facilitator features**: Access requires `one_on_one:dashboard` or `one_on_one:meetings`. Sidebar items show based on `one_on_one:*` permissions.
- **Admin OKRs route**: Protected by layout that requires `admin:okrs` or `manager:okrs`.

## Admin UI

- **Roles & Permissions** (Admin → System → Roles & Permissions): List and edit roles, assign permissions. When `allowCustomRoles` is off, "Create role" is hidden.
- **Members** (Admin → Team Members): Members are assigned one or more roles (multiselect from tenant roles).
- **Invitations**: Invite form offers a role dropdown from tenant roles; stores `roleId`. On accept, the membership is created with that role in `tenant_membership_roles`.

## Person relations (manager and 1:1 facilitator)

Access (what you can do) is separate from **who is related to whom**:

- **Manager (reporting)**: `person_relations` with `relationType = 'manager'`.
- **1:1 facilitator**: Same table with `relationType = 'one_to_one'`. A person can have both a manager and a 1:1er.

See schema in `src/shared/db/schema/persons.ts`, API in `api/tenants/[tenant]/admin/persons/[personId]/relations`, and UI in `PersonRelationsDialog`.

## Projects and clients scope (manager:project_assignments)

The permission `manager:project_assignments` allows managing projects and clients **in the context of the people the manager oversees** (direct and indirect reports via the reporting hierarchy). This is consistent with Team, Assignments, and Performance:

- **List views**: A manager sees only projects where they are the project manager or where at least one of their reports is a member. They see only clients that have at least one such project. Users with `admin:dashboard` see all projects and clients (no scope filter).
- **Updating a client**: A manager may update a client only if that client has at least one project they can manage. Admins may update any client.
- **Adding project members**: A manager may add only themselves or one of their reports to a project they manage. Admins may add any tenant member.
- **Creating a project**: If a project manager is set, it must be the current user or one of their reports. Admins may set any person as project manager.

## 1:1 Facilitator scope (one_on_one:\*)

The `one_on_one:*` permissions allow facilitators to manage 1:1 conversations and view data for the people they facilitate:

- **`one_on_one:dashboard`**: Access the 1:1 facilitator dashboard showing people you 1:1 with.
- **`one_on_one:meetings`**: Create, edit, and manage 1:1 meetings.
- **`one_on_one:feedback`**: Request and view 360 feedback for people you 1:1 with.
- **`one_on_one:performance_read`**: Read-only access to performance assessments for people you 1:1 with.
- **`one_on_one:projects_read`**: Read-only access to projects for people you 1:1 with.
- **`one_on_one:notes`**: Manage notes about the people you 1:1 with.

The `one_on_one:*_read` permissions are read-only; they do not grant create/edit rights.

## Performance assessments scope (manager:performance_assessments)

The permission `manager:performance_assessments` allows requesting and managing performance assessments **only for the people the manager oversees** (direct and indirect reports via the reporting hierarchy). This is consistent with Team, Assignments, and project_assignments.

- **Request self-assessments**: A manager may request a self-assessment only for a report.
- **Create, view, update, publish supervisor assessments**: A manager may create and manage supervisor-to-user assessments only for their reports. Drafts, submitted assessments, and "last assessment by me" lists are scoped to those same reports.
- **Listing "people I can assess"**: The list of people the manager can request an assessment from or create an assessment for is restricted to reports. An optional project filter may further restrict to reports who are members of selected projects.

Read-only 1:1 scope (`manager:performance_assessments_1_1_read`) allows **read-only** access to performance assessment data for people the user facilitates 1:1s with (no request, create, or edit).

## 360 Review Cycles scope (admin:review_cycles)

The permission `admin:review_cycles` allows full management of **360 review cycles**:

- **Create / Edit / Delete** review cycles (draft, active, completed, cancelled).
- **Add / Remove participants** to cycles.
- **Launch** a cycle — generates assignments (self, supervisor, upward) based on participants and their manager hierarchy.
- **Close / Cancel** active cycles.
- **Approve / Reject** peer nominations submitted by participants.
- **View progress** — overall cycle completion, per-participant assignment status.

### Manager interaction with review cycles

Managers with `manager:performance_assessments` can:

- **View active cycles** affecting their reports (via `getActiveCyclesForReports`).
- **See assignment progress** for their direct reports within a cycle.
- **Approve / reject peer nominations** submitted by or for their reports.
- **Complete** their own supervisor assessments linked to a cycle.

### 1:1 Facilitator interaction with review cycles

Users with `one_on_one:performance_read` can:

- **View active cycles** for people they facilitate 1:1s with (via `getActiveCyclesForFacilitees`).
- **See read-only assignment progress** for those people within a cycle.

### Member interaction with review cycles

All members with `self_assess` can:

- **See their pending assignments** within active cycles (self, peer, upward).
- **Nominate peers** if peer nomination is enabled for the cycle.
- **Withdraw** their own pending nominations.
- **Complete** peer assessments assigned to them.

## Seeds

Demo seeds call `seedPermissionsAndRoles` to create default permissions and roles. All memberships have at least one row in `tenant_membership_roles`. Invitations use `roleId`; on accept, the membership is created with that role in `tenant_membership_roles`.
