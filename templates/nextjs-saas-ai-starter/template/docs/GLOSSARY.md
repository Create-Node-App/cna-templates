# Glossary of Terms - Next.js SaaS AI Template

This document defines key terms used in Next.js SaaS AI Template to avoid ambiguities and facilitate understanding of the domain. Each term includes its definition, references to standards when applicable, and its relationship with other concepts.

---

## Authentication and Access

### User

**Definition:**
A **User** is an authentication entity managed by Auth.js (NextAuth). It represents a system access account with credentials (email, OAuth providers, etc.). A user can belong to multiple tenants and have different roles in each one.

**Characteristics:**

- Stored in the `users` table (Auth.js)
- Has a unique `id` (text)
- Can have multiple `tenant_memberships` (one per tenant)
- Links to a `Person` via email

**References:**

- [Auth.js Documentation](https://authjs.dev/) - Authentication standard for Next.js
- [OAuth 2.0](https://oauth.net/2/) - Standard authorization protocol

**Relationship with other terms:**

- A User can have multiple **Persons** (one per tenant)
- A User has different **Roles** in each tenant

---

### Person

**Definition:**
A **Person** is the representation of an individual within a specific tenant. It contains profile and organizational information. It is the central entity of the business domain.

**Characteristics:**

- Stored in the `persons` table
- Belongs to a single `tenant`
- Has a unique `id` (UUID)
- Can be linked to a `User` via email
- Contains professional information: title, department, bio, etc.

**Key differences from User:**

- **User**: Authentication entity (can access the system)
- **Person**: Domain entity (represents someone in the organization)
- A User can have multiple Persons (one per tenant)
- A Person can exist without a User (pending invitations, imported data)

**Relationship with other terms:**

- A Person has **Relations** (relationships with other people: manager, mentor, etc.)
- A Person belongs to a **Tenant**
- A Person can have **Roles** via tenant membership

---

### Role / Tenant Role

**Definition:**
A **Role** defines the access level and permissions a user has within a specific tenant. Roles are hierarchical: `admin` > `manager` > `member`.

**Available roles:**

- **`member`**: Regular user. Can view own profile, use the AI assistant, access the knowledge base.
- **`manager`**: Team manager. Includes `member` permissions plus: view team, manage reports.
- **`admin`**: Tenant administrator. Includes `manager` permissions plus: manage members, roles, settings, integrations, and the admin panel.

**Characteristics:**

- Stored in `tenant_memberships.role`
- A user can have different roles in different tenants
- Roles are transitive: `admin` has all permissions of `manager` and `member`

**References:**

- [RBAC (Role-Based Access Control)](https://en.wikipedia.org/wiki/Role-based_access_control) - Standard access control pattern
- Similar concept to roles in systems like GitHub Organizations, Slack Workspaces

**Relationship with other terms:**

- A **Manager** is a person with `manager` role or higher
- An **Admin** is a person with `admin` role

---

### Permission

**Definition:**
A **Permission** is a granular access control unit that defines what actions a user can perform. Permissions are grouped into roles.

**Characteristics:**

- Stored in the `permissions` table
- Assigned to roles via `role_permissions`
- Scoped to a tenant (tenantId nullable for system-wide permissions)
- Authorization is always by permission key (e.g. `admin:dashboard`, `admin:members`)

**References:**

- [PBAC (Permission-Based Access Control)](https://en.wikipedia.org/wiki/Attribute-based_access_control) - Fine-grained access control

---

## Organization

### Tenant

**Definition:**
A **Tenant** represents an organization using the platform. All data is scoped to a tenant for multi-tenant isolation.

**Characteristics:**

- Stored in the `tenants` table
- Has a unique `slug` (used in URLs: `/t/{slug}`)
- Has configuration in JSON (`settings`)
- All data (persons, files, conversations, etc.) belongs to a tenant

**References:**

- [Multi-tenancy Pattern](https://en.wikipedia.org/wiki/Multitenancy) - Standard architectural pattern
- Similar to "Organization" or "Workspace" in SaaS systems (Slack, GitHub Organizations)

**Relationship with other terms:**

- A Tenant has multiple **Persons**
- A Tenant has specific configuration (departments, feature flags, AI settings, etc.)

---

### Department

**Definition:**
A **Department** is an organizational unit within a tenant. It is stored in tenant configuration (`tenant_settings.departments`) and can have assigned managers.

**Characteristics:**

- Stored in `tenant_settings.departments.list[]` (JSON in tenant settings)
- Has a unique `id` (string)
- Can have managers (`department_managers`)
- A Person can belong to a department (`persons.departmentId`)

**References:**

- Standard concept in organizational systems
- Similar to "Department" or "Division" in SaaS platforms

**Relationship with other terms:**

- A Department can have multiple **Persons**
- A Department can have assigned **Managers**

---

### Person Relation

**Definition:**
A **Person Relation** represents a professional relationship between two people within a tenant.

**Relation types:**

- `manager`: Direct manager
- `mentor`: Assigned mentor
- `peer`: Peer relationship

**Characteristics:**

- Stored in the `person_relations` table
- Has validity period (`startDate`, `endDate`)
- For manager relationships, can have `isPrimaryManager`

**Relationship with other terms:**

- A Person Relation connects two **Persons**
- Manager relationships define the organizational hierarchy

---

### Invitation

**Definition:**
An **Invitation** is an invitation for a user to join a tenant with a specific role.

**States:**

- `pending`: Invitation sent, awaiting acceptance
- `accepted`: User accepted and joined
- `expired`: Invitation expired without being used
- `revoked`: Admin revoked the invitation

**Characteristics:**

- Stored in `tenant_invitations`
- Has a unique token for acceptance
- Has expiration date
- Can include personalized message

**References:**

- Standard concept in multi-tenant systems (Slack, GitHub Organizations)

**Relationship with other terms:**

- An Invitation belongs to a **Tenant**
- An Invitation has an assigned **Role**
- Upon acceptance, a **TenantMembership** and potentially a **Person** are created

---

## AI and Knowledge

### AI Assistant

**Definition:**
The **AI Assistant** is an in-app conversational interface that helps users with questions, recommendations, and platform navigation. It uses the tenant's configured AI provider (e.g., OpenAI).

**Characteristics:**

- Conversations stored in `assistant_conversations`
- Scoped to a person and tenant
- Configurable AI provider, model, and system prompt via admin settings
- Can use embeddings for semantic search

**Relationship with other terms:**

- An AI Assistant conversation belongs to a **Person**
- AI settings are configured per **Tenant**

---

### Embedding

**Definition:**
An **Embedding** is a vector representation of content used for semantic search. Embeddings enable AI-powered search that understands meaning rather than just keyword matching.

**Characteristics:**

- Stored in the `embedding_chunks` table
- Uses pgvector for efficient similarity search
- Generated automatically when content is created or updated
- Scoped to a tenant

---

## Infrastructure

### Webhook

**Definition:**
A **Webhook** is a mechanism to notify external systems when events occur in the platform. Admins configure webhook endpoints to receive event notifications.

**Characteristics:**

- Endpoints stored in `webhook_endpoints`
- Deliveries tracked in `webhook_deliveries`
- Events are categorized (e.g., member events, system events)
- Supports secret-based signature verification

---

### Integration Sync

**Definition:**
The **Integration Sync** engine provides bidirectional data synchronization between the platform and external systems.

**Characteristics:**

- Entity links stored in `integration_entity_links`
- Sync runs tracked in `integration_sync_runs` and `integration_sync_run_items`
- Supports conflict detection (`integration_sync_conflicts`)
- Field mappings configurable via `integration_field_mappings`
- Cursor-based incremental sync via `integration_sync_cursors`

---

### File Object

**Definition:**
A **File Object** represents an uploaded file stored in the configured storage provider (e.g., S3-compatible).

**Characteristics:**

- Stored in the `file_objects` table
- Linked to a person and tenant
- Storage provider configured in tenant settings

---

### Audit Event

**Definition:**
An **Audit Event** records a significant action in the system for compliance and debugging purposes.

**Characteristics:**

- Stored in the `audit_events` table
- Includes actor, action, target, timestamp, and metadata
- Filterable by event type, actor, and time range

---

## Summary of Key Differences

### User vs Person

- **User**: Authentication entity (can access the system)
- **Person**: Domain entity (represents someone in the organization)
- A User can have multiple Persons (one per tenant)

### Role vs Permission

- **Role**: Named bundle of permissions (e.g., "admin", "member")
- **Permission**: Individual access control unit (e.g., `admin:members`)

### Manager vs Admin

- **Manager**: Can view team and manage reports
- **Admin**: Has full access to tenant configuration and management

---

## External References

### Standards and Frameworks

- **Auth.js**: [authjs.dev](https://authjs.dev/)
- **OAuth 2.0**: [oauth.net/2](https://oauth.net/2/)
- **RBAC**: [Role-Based Access Control](https://en.wikipedia.org/wiki/Role-based_access_control)
- **Multi-tenancy**: [Wikipedia](https://en.wikipedia.org/wiki/Multitenancy)

### Similar Systems

- **Multi-tenant SaaS**: Slack Workspaces, GitHub Organizations, Notion Workspaces
- **RBAC implementations**: AWS IAM, GitHub Organizations, Vercel Teams

---

## Maintenance Notes

This glossary should be updated when:

1. New entities are added to the database schema
2. New domain terms are introduced
3. Definitions of existing terms change
4. Ambiguities in term usage are identified

**Last updated:** 2026-04-19
