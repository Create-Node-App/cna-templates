# 📚 Glossary of Terms - Next.js SaaS AI Template

This document defines key terms used in Next.js SaaS AI Template to avoid ambiguities and facilitate understanding of the domain. Each term includes its definition in the Next.js SaaS AI Template context, references to market standards when applicable, and its relationship with other concepts in the system.

---

## 🔐 Authentication and Access

### User

**Definition in Next.js SaaS AI Template:**  
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

**Definition in Next.js SaaS AI Template:**  
A **Person** is the representation of an individual within a specific tenant. It contains all professional and profile information (skills, assessments, relationships, etc.). It is the central entity of the business domain.

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

**References:**

- Similar concept to "Employee" or "Member" in HRIS systems (Workday, BambooHR)
- Aligned with the "Person" concept in talent management systems

**Relationship with other terms:**

- A Person has multiple **Assessments** (skill evaluations)
- A Person can have multiple **Capabilities** (capabilities)
- A Person has **Relations** (relationships with other people: manager, mentor, etc.)

---

### Role / Tenant Role

**Definition in Next.js SaaS AI Template:**  
A **Role** defines the access level and permissions a user has within a specific tenant. Roles are hierarchical: `admin` > `manager` > `member`.

**Available roles:**

- **`member`**: Regular user. Can view own profile, self-assess, use assistant, view knowledge.
- **`manager`**: Team manager. Includes `member` permissions plus: view team, view team reports.
- **`admin`**: Tenant administrator. Includes `manager` permissions plus: manage capabilities, role profiles, members, knowledge, admin panel.

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

### Manager vs Admin

**Manager:**

- Person with `manager` or `admin` role in a tenant
- Can view team reports
- Can manage evaluations of direct reports
- Can assign roadmaps and trainings to team
- Can view team objectives
- **Cannot** manage tenant configuration or members globally

**Admin:**

- Person with `admin` role in a tenant
- Has all `manager` permissions
- Can manage tenant configuration
- Can manage members (invite, change roles)
- Can manage capabilities, skills, knowledge documents
- Full access to admin panel

**References:**

- Similar to distinction between "Team Lead" and "Organization Admin" in systems like GitLab, Jira
- Aligned with permission hierarchies in HR systems (Workday, SuccessFactors)

---

## 🎯 Skills and Assessments

### Skill

**Definition in Next.js SaaS AI Template:**  
A **Skill** is a technical, domain, soft, language, or certification competency that can be evaluated. Skills are tenant-specific and use semantic search (embeddings) instead of a closed catalog.

**Categories:**

- `technical`: Programming languages, frameworks, tools
- `domain`: Business domain knowledge
- `soft`: Communication, leadership, teamwork
- `language`: Human languages
- `certification`: Certifications and credentials

**Characteristics:**

- Stored in the `skills` table
- Has vector embeddings (pgvector) for semantic search
- Can have hierarchy (parent skill)
- Can have aliases (alternative names)
- Can be verified by admin (`isVerified`)

**References:**

- [SFIA (Skills Framework for the Information Age)](https://sfia-online.org/) - Global standard for digital skills
- [Universal Competency Framework (UCF)](https://www.shl.com/products/assessments/behavioral-assessments/universal-competency-framework/) - SHL competency framework
- Similar concept to "Competency" in talent management systems

**Relationship with other terms:**

- A Skill can have multiple **Assessments** (evaluations)
- A Skill can be required by multiple **Capabilities**
- A Skill can appear in **Roadmaps** and **Role Profiles**

---

### Assessment

**Definition in Next.js SaaS AI Template:**  
An **Assessment** is an evaluation of a skill level for a specific person. It records who evaluated, when, the level achieved, and can include evidence.

**Assessment sources:**

- `self`: Self-assessment
- `supervised`: Assessment by manager/mentor
- `teacher`: Assessment by instructor (e.g., English level)
- `peer`: Peer assessment
- `inferred`: AI-inferred from CV or other sources

**Characteristics:**

- Stored in the `assessments` table
- Has a `score` on a configurable scale (default 0-4)
- Can have `confidence` (for inferred assessments)
- Can be linked to a specific context (`capabilityId`, `roadmapId`)
- Can have associated evidence (`assessment_evidence`)

**References:**

- [SFIA Assessment Guidelines](https://sfia-online.org/en/tools-and-resources/using-sfia/sfia-assessment) - SFIA assessment guidelines
- [ISO/TS 30428:2021](https://www.iso.org/standard/68705.html) - ISO standard for skills and capabilities metrics
- Similar concept to "Competency Assessment" in HR systems

**Relationship with other terms:**

- An Assessment evaluates a **Skill** for a **Person**
- An Assessment can have associated **Evidence**
- An Assessment can be contextualized by a **Capability** or **Roadmap**

---

### Evidence

**Definition in Next.js SaaS AI Template:**  
An **Evidence** is a reusable record that demonstrates competency in a skill. It can be a CV, external link (GitHub, LinkedIn), document, or feedback.

**Evidence types:**

- `cv`: Extracted from CV
- `link`: External URL (GitHub, portfolio, LinkedIn)
- `document`: Uploaded document
- `feedback`: Manager/peer feedback

**Characteristics:**

- Stored in the `evidences` table
- Can reference a `file_object` (document in S3)
- Can have a `sourceRef` (URL or file reference)
- Can be linked to multiple assessments

**References:**

- Similar concept to "Portfolio Evidence" or "Work Samples" in competency evaluation systems
- Aligned with evidence-based assessment practices (Evidence-Based Assessment)

**Relationship with other terms:**

- An Evidence belongs to a **Person**
- An Evidence can be linked to multiple **Assessments**

---

## 🚀 Capabilities and Roles

### Capability

**Definition in Next.js SaaS AI Template:**  
A **Capability** represents a role or task that requires specific skills at certain levels. Used for staffing queries: "Who can do X?"

**Examples:**

- "Tech Interviewer - Backend Java"
- "Data Engineer"
- "Frontend Lead"

**Characteristics:**

- Stored in the `capabilities` table
- Has `requirements` (skill requirements with minimum levels)
- Has embedding for semantic search
- Can have `relevanceLevel` (priority for learning)
- Requirements can be `mandatory` or `nice-to-have`

**References:**

- [ISO/TS 30428:2021](https://www.iso.org/standard/68705.html) - ISO standard for capabilities metrics
- [People Capability Maturity Model (P-CMM)](https://sei.cmu.edu/library/people-capability-maturity-model) - Capability maturity model
- Similar concept to "Job Profile" or "Role Capability" in talent management systems

**Key differences:**

- **Capability**: Defines WHAT someone can do (e.g., "Tech Interviewer")
- **Role Profile**: Defines HOW a complete role is (responsibilities, career, etc.)

**Relationship with other terms:**

- A Capability requires multiple **Skills** at certain levels
- A Person can have multiple **Assessments** that qualify them for a Capability
- A Capability can be the target of an **Objective** (OKR)

---

### Role Profile

**Definition in Next.js SaaS AI Template:**  
A **Role Profile** is a knowledge document that defines a complete role within the organization. It includes purpose, responsibilities, technical competencies, client interaction expectations, and professional growth paths.

**Characteristics:**

- Stored as `knowledge_document` with `docType: 'role_profile'`
- Content in Markdown with versioning
- Can be linked to a Person (`persons.roleProfileId`)
- Can reference related **Roadmaps**

**Examples:**

- "Software Engineer Full Stack - Junior"
- "Engineering Manager"
- "Solutions Architect"

**References:**

- Similar concept to "Job Description" or "Role Definition" in HR systems
- Aligned with "Role Profiles" in frameworks like SFIA
- Similar to "Competency Models" in talent management

**Key differences:**

- **Role Profile**: Complete descriptive document of a role (what it is, responsibilities, career)
- **Capability**: Operational definition of what skills are needed for a specific task

**Relationship with other terms:**

- A Role Profile can reference multiple **Roadmaps**
- A Person can have a Role Profile assigned
- A Role Profile can mention required **Skills**

---

## 📚 Knowledge and Learning

### Roadmap

**Definition in Next.js SaaS AI Template:**  
A **Roadmap** is a structured knowledge document that defines a learning path to develop skills or advance in a career. It can be role-based or skill-specific.

**Types:**

- **Role-based Roadmaps**: Career paths for specific roles (e.g., "Software Engineer Roadmap")
- **Skill-based Roadmaps**: Paths to develop specific skills (e.g., "AWS Roadmap")

**Characteristics:**

- Stored as `knowledge_document` with `docType: 'roadmap'`
- Structured content in Markdown (can include JSON for node structure)
- Can have versioning
- Can have associated progress (`roadmap_progress`, `roadmap_node_progress`)

**References:**

- Similar concept to "Learning Path" or "Career Path" in LMS systems (Learning Management Systems)
- Aligned with "Development Roadmaps" in talent management
- Similar to "Skill Trees" in learning gamification

**Relationship with other terms:**

- A Roadmap can be linked to a **Role Profile**
- A Person can have progress in multiple **Roadmaps**
- A Roadmap can be assigned as a **Learning Assignment**
- A Roadmap can be the target of an **Objective** (OKR)

---

### Training

**Definition in Next.js SaaS AI Template:**  
A **Training** is a knowledge document that represents training material, course, or educational content. It can be internal or reference external content.

**Characteristics:**

- Stored as `knowledge_document` with `docType: 'training'`
- Content in Markdown
- Can have associated progress (`training_completions`)
- Can have external certificates (`certificateUrl`)

**References:**

- Similar concept to "Course" or "Learning Module" in LMS systems (Moodle, Canvas, Coursera)
- Aligned with "Training Materials" in talent development management

**Key differences:**

- **Training**: Specific educational material (course, tutorial, certification)
- **Roadmap**: Structured path that can include multiple trainings

**Relationship with other terms:**

- A Training can be part of a **Roadmap**
- A Training can be assigned as a **Learning Assignment**
- A Person can complete multiple **Trainings**

---

### Growth Plan

**Definition in Next.js SaaS AI Template:**  
A **Growth Plan** (also referred to as "Growth Paths") is not a separate entity in the database, but an aggregated view that combines:

1. **Capabilities** the person can achieve (based on current skills)
2. **Roadmaps** recommended to develop missing skills
3. **Objectives** (OKRs) related to professional growth
4. Active **Learning Assignments**

**Characteristics:**

- Calculated dynamically on the `/growth` page
- Analyzes gaps between current skills and capability requirements
- Suggests next steps based on interests and existing skills
- Shows progress on active roadmaps

**References:**

- Similar concept to "Individual Development Plan (IDP)" in talent management
- Aligned with "Career Development Plans" in HR systems
- Similar to "Growth Plans" in professional development platforms (LinkedIn Learning, Pluralsight)

**Relationship with other terms:**

- A Growth Plan includes **Capabilities**, **Roadmaps**, **Objectives**, and **Learning Assignments**
- Based on current **Assessments** of the person
- Can include declared **Interests**

---

## 🎯 Objectives and Results

### Objective / OKR

**Definition in Next.js SaaS AI Template:**  
An **Objective** is a goal a person wants to achieve, following the OKR methodology (Objectives and Key Results). It can be linked to capabilities, roadmaps, or be independent.

**Types:**

- `career_growth`: Career growth
- `skill_development`: Skill development
- `project`: Project objective
- `learning`: Learning objective

**Characteristics:**

- Stored in the `objectives` table
- Has multiple **Key Results** (measurable key results)
- Can have hierarchy (parent/child objectives for cascading)
- Can have scope: `individual`, `team`, `department`, `company`
- Can be linked to a `targetCapability` or `targetRoadmap`

**References:**

- [OKR-BOK™ Standard](https://okrinternational.com/okr-bok/) - International OKR standard
- [Wikipedia: Objectives and Key Results](https://en.wikipedia.org/wiki/Objectives_and_key_results)
- Framework popularized by Google, Intel, and other tech companies

**Relationship with other terms:**

- An Objective has multiple **Key Results**
- An Objective can be linked to a **Capability** or **Roadmap**
- An Objective can have comments from managers in the management chain

---

### Key Result

**Definition in Next.js SaaS AI Template:**  
A **Key Result** is a measurable result that indicates progress toward an Objective. It must be quantifiable and have target and current values.

**Metric types:**

- `percentage`: Percentage (0-100)
- `number`: Absolute number
- `boolean`: Yes/No
- `skill_level`: Skill level (0-4)
- `milestone`: Milestone achieved

**Characteristics:**

- Stored in the `key_results` table
- Has `targetValue` and `currentValue`
- Can be linked to a **Skill** (`targetSkillId`, `targetLevel`)
- Has `weight` to calculate objective progress
- Has `status`: `on_track`, `at_risk`, `behind`, `completed`
- Can have check-ins (`kr_check_ins`)

**References:**

- [OKR-BOK™ Standard](https://okrinternational.com/okr-bok/) - Defines standards for Key Results
- Best practices: 3-5 Key Results per Objective, measurable on 0-100% scale

**Relationship with other terms:**

- A Key Result belongs to an **Objective**
- A Key Result can be linked to a **Skill** (for auto-update from assessments)

---

## 👥 Relationships and Organization

### Person Relation

**Definition in Next.js SaaS AI Template:**  
A **Person Relation** represents a professional relationship between two people within a tenant. It captures important relationships for assessments and growth tracking.

**Relation types:**

- `manager`: Direct manager
- `mentor`: Assigned mentor
- `teacher`: Instructor (e.g., English teacher)
- `peer`: Peer relationship

**Characteristics:**

- Stored in the `person_relations` table
- Has validity period (`startDate`, `endDate`)
- For manager relationships, can have `isPrimaryManager` (primary vs secondary manager)
- Can have contextual notes

**References:**

- Similar concept to "Reporting Relationships" in HRIS systems
- Aligned with "Mentorship Programs" in talent management

**Relationship with other terms:**

- A Person Relation connects two **Persons**
- Manager relationships allow managers to view reports from their direct reports

---

### Tenant

**Definition in Next.js SaaS AI Template:**  
A **Tenant** represents an organization using Next.js SaaS AI Template. All data is scoped to a tenant for multi-tenant isolation.

**Characteristics:**

- Stored in the `tenants` table
- Has a unique `slug` (used in URLs: `/t/{slug}`)
- Has configuration in JSON (`settings`)
- All data (persons, skills, assessments, etc.) belongs to a tenant

**References:**

- [Multi-tenancy Pattern](https://en.wikipedia.org/wiki/Multitenancy) - Standard architectural pattern
- Similar to "Organization" or "Workspace" in SaaS systems (Slack, GitHub Organizations)

**Relationship with other terms:**

- A Tenant has multiple **Persons**
- A Tenant has its own **Skills**, **Capabilities**, **Knowledge Documents**
- A Tenant has specific configuration (departments, skill scales, etc.)

---

### Department

**Definition in Next.js SaaS AI Template:**  
A **Department** is an organizational unit within a tenant. It is stored in tenant configuration (`tenant_settings.departments`) and can have assigned managers.

**Characteristics:**

- Stored in `tenant_settings.departments.list[]` (JSON in tenant settings)
- Has a unique `id` (string)
- Can have managers (`department_managers`)
- A Person can belong to a department (`persons.departmentId`)

**References:**

- Standard concept in HRIS systems (Workday, BambooHR)
- Similar to "Department" or "Division" in organizational systems

**Relationship with other terms:**

- A Department can have multiple **Persons**
- A Department can have assigned **Managers**
- A Department can be the scope of **Objectives** (department OKRs)

---

## 📝 Assignments and Progress

### Learning Assignment

**Definition in Next.js SaaS AI Template:**  
A **Learning Assignment** is a learning assignment made by a manager or self-assigned. It can be a roadmap, training, or specific skill.

**Assignable types:**

- `roadmap`: Assignment of a complete roadmap
- `training`: Assignment of a specific training
- `skill`: Assignment to develop a specific skill

**Characteristics:**

- Stored in the `learning_assignments` table
- Has `priority`: `required`, `recommended`, `optional`
- Has `status`: `assigned`, `in_progress`, `completed`, `cancelled`
- Can have `dueDate`
- Can be assigned by a manager (`assignedById`) or self-assigned

**References:**

- Similar concept to "Learning Assignment" in LMS systems
- Aligned with "Development Assignments" in talent management

**Relationship with other terms:**

- A Learning Assignment can assign a **Roadmap**, **Training**, or **Skill**
- A Learning Assignment belongs to a **Person**
- A Learning Assignment can be created by a **Manager**

---

### Interest

**Definition in Next.js SaaS AI Template:**  
An **Interest** (Interest Signal) represents what a person wants to learn or do. It can be explicitly declared or inferred by AI.

**Sources:**

- `declared`: Explicitly declared by the person
- `inferred`: Inferred from behavior or conversations

**Characteristics:**

- Stored in the `interest_signals` table
- Can be linked to a **Skill** or be free text (`freeText`)
- Has `intensity` (0-1) and `confidence` for inferred interests
- Has validity period (`validFrom`, `validUntil`)

**References:**

- Similar concept to "Learning Goals" or "Career Aspirations" in talent development systems
- Aligned with "Interest Signals" in recommendation systems

**Relationship with other terms:**

- An Interest can be linked to a **Skill**
- Interests are used to recommend **Roadmaps** and **Capabilities**

---

## 🔍 Other Important Terms

### Quiz

**Definition in Next.js SaaS AI Template:**  
A **Quiz** is an AI-generated questionnaire to assess knowledge of a specific skill. Used as a self-assessment tool.

**Characteristics:**

- Stored in `quiz_cache` (cache of generated quizzes)
- Has 10 questions by default
- Generated using OpenAI
- Has rate limiting (10 attempts per person per day)
- Can suggest a skill level based on results

**References:**

- Similar concept to "Knowledge Quiz" or "Skill Assessment Quiz" in learning systems
- Aligned with formative assessment practices

**Relationship with other terms:**

- A Quiz evaluates a specific **Skill**
- Quiz results can be converted to **Assessments** (self-assessment)

---

### Invitation

**Definition in Next.js SaaS AI Template:**  
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

### Meeting Template

**Definition in Next.js SaaS AI Template:**  
A **Meeting Template** is a reusable structure for 1:1 meetings that combines static talking points with dynamic context blocks. Templates are managed from Admin and can be system-wide or personal.

**Characteristics:**

- Stored in `meeting_templates` and `meeting_template_items`
- Items have a `contextType`: `static`, `skill_changes`, `learning_progress`, `okr_status`, `capability_gaps`, `recent_feedback`
- System templates (`isSystem: true`) are available to all users
- Personal templates (`isPersonal: true`) are only visible to their creator
- When selected during meeting creation/editing, static items pre-fill the agenda and dynamic items appear as descriptive placeholders

**Relationship with other terms:**

- A Meeting Template contains multiple **Meeting Template Items**
- A Meeting Template can guide **AI Agenda Suggestions** as structural input
- Templates are used in **1:1 Meetings** during creation and editing

---

### AI Agenda Suggestion

**Definition in Next.js SaaS AI Template:**  
An **AI Agenda Suggestion** is a contextual meeting agenda generated by AI (GPT-4o-mini) based on a person's full profile data. Available via the "Suggest with AI" button during 1:1 meeting creation or editing.

**Data aggregated (Person Context):**

- Recent skill changes and assessments
- OKR progress and key results
- Learning assignments and completions
- Capability gaps (vs role profiles)
- Recent feedback and recognitions
- Previous meeting notes and action items
- Growth notes

**Characteristics:**

- Returns a numbered agenda with `@[Name](entityType:entityId)` mentions that render as interactive badges
- Can optionally use a **Meeting Template** as structural guidance
- Can build upon an existing agenda
- Available to users with `one_on_one:meetings` permission or facilitators of the person

**Relationship with other terms:**

- Uses **Person** data from multiple sources (Skills, OKRs, Learning, Feedback, etc.)
- Can be guided by a **Meeting Template**
- Generates content for **1:1 Meetings**
- Uses **@ Mentions** format for referencing entities

---

### @ Mention

**Definition in Next.js SaaS AI Template:**  
An **@ Mention** (mention) is a rich-text reference to an entity (skill, capability, person, knowledge, roadmap) within text fields. Mentions render as colored badges with hover preview cards showing entity details.

**Format:** `@[Display Name](entityType:entityId)`

**Supported entity types:**

- `skill` — links to a skill, shows level and category on hover
- `capability` — links to a capability, shows required skills
- `person` — links to a person, shows title and profile info
- `knowledge` — links to a knowledge document (training, etc.)
- `roadmap` — links to a learning roadmap

**Used in:**

- 1:1 meeting agendas and notes
- AI-generated agenda suggestions
- Growth notes
- Feedback and recognitions

---

## 📊 Summary of Key Differences

### User vs Person

- **User**: Authentication entity (can access the system)
- **Person**: Domain entity (represents someone in the organization)
- A User can have multiple Persons (one per tenant)

### Capability vs Role Profile

- **Capability**: Defines WHAT someone can do (operational, for staffing)
- **Role Profile**: Defines HOW a complete role is (descriptive, for career)

### Roadmap vs Training

- **Roadmap**: Structured learning path (can include multiple trainings)
- **Training**: Specific educational material (course, tutorial)

### Manager vs Admin

- **Manager**: Can view team and reports, assign learning
- **Admin**: Has full access to tenant configuration and management

### Assessment vs Quiz

- **Assessment**: Formal skill evaluation (can be from multiple sources)
- **Quiz**: AI-generated self-assessment tool

---

## 🔗 External References

### Standards and Frameworks

- **OKR-BOK™**: [OKR International](https://okrinternational.com/okr-bok/)
- **SFIA**: [Skills Framework for the Information Age](https://sfia-online.org/)
- **ISO/TS 30428:2021**: [Human resource management — Skills and capabilities metrics](https://www.iso.org/standard/68705.html)
- **Universal Competency Framework (UCF)**: [SHL](https://www.shl.com/products/assessments/behavioral-assessments/universal-competency-framework/)
- **People Capability Maturity Model**: [Carnegie Mellon SEI](https://sei.cmu.edu/library/people-capability-maturity-model)

### Similar Systems

- **HRIS**: Workday, BambooHR, SuccessFactors
- **LMS**: Moodle, Canvas, Coursera
- **Talent Management**: LinkedIn Learning, Pluralsight Skills
- **Multi-tenant SaaS**: Slack Workspaces, GitHub Organizations

---

## 📈 TRACK Account Management

### Client (Account)

**Definition in Next.js SaaS AI Template:**
A **Client** (also called Account) represents an external organization that the company serves. It is the top-level entity in the TRACK framework and owns all strategic data: goals, routes, plays, cadences, KPIs, contacts, and health/journey snapshots.

### Track Goal

**Definition in Next.js SaaS AI Template:**
A **Track Goal** is a measurable account-level goal linked to one or more client KPIs (M:N via `track_goal_kpis`) and optionally to internal OKR objectives (M:N via `track_goal_objectives`). Goals have baseline/target values, progress tracking, and check-ins.

### Track Route

**Definition in Next.js SaaS AI Template:**
A **Track Route** is an expansion opportunity in the account pipeline (upsell, cross-sell, renewal, partnership). Routes can be linked to multiple projects (M:N via `track_route_projects`) when opportunities become active delivery.

### Track Play

**Definition in Next.js SaaS AI Template:**
A **Track Play** is a concrete strategic action with a 30/60/90-day horizon. Plays link to multiple routes (M:N via `track_play_routes`) and multiple learning assignments (M:N via `track_play_assignments`).

### Meeting Cadence

**Definition in Next.js SaaS AI Template:**
A **Meeting Cadence** defines recurring meeting structures for an account (internal syncs, client check-ins, QBRs, executive sponsors). Cadences have multiple participants (M:N via `track_cadence_participants` with optional role).

### Client KPI

**Definition in Next.js SaaS AI Template:**
A **Client KPI** is a success metric defined by the client (NPS, ARR, churn rate, etc.). KPIs are linked to goals via M:N bridge tables, not free-text fields.

---

## 📝 Maintenance Notes

This glossary should be updated when:

1. New entities are added to the database schema
2. New domain terms are introduced
3. Definitions of existing terms change
4. Ambiguities in term usage are identified

**Last updated:** 2026-02-09
