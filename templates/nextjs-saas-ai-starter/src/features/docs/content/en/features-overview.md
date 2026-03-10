---
title: Platform Features Overview
description: Complete feature guide covering skills management, career growth, team development, AI assistance, and customization options.
section: getting-started
order: 5
---

# Platform Features Overview

Next.js SaaS AI Template combines **skills management**, **career growth**, and **team development** into one integrated platform. This guide provides an overview of every major feature and where to find detailed guides.

---

## Core Features by Domain

### 🎯 Skills Management

**What it is:** Central catalog and assessment of competencies across your organization.

- **Skills catalog** — Define technical, domain, soft, language, or certification skills specific to your tenant.
- **Skill assessments** — Self-assessments, manager feedback, peer assessments, and AI-inferred skills from profiles and evidence.
- **Evidence collection** — Link skills to projects, certifications, learning completed, and feedback received.
- **Semantic search** — AI-powered search across skills to find the right person fast.

**Key benefits:**

- Unified view of organizational capabilities across teams and levels.
- Data-driven hiring, promotion, and learning decisions.
- Transparent growth paths tied to real skills.

**Learn more:**

- [Skills & Assessment Guide](../docs/skills) — Assess and track your skills.
- [People Finder](../docs/people-finder) — Search and discover talent.
- [Admin: Skills & Capabilities](../admin/skills-capabilities) — Configure your skills catalog.

---

### 📈 Career Growth & OKRs

**What it is:** Objective setting, progress tracking, and career development in one place.

- **Personal OKRs** — Set quarterly or custom-cycle objectives and key results with AI-powered suggestions.
- **Team OKRs** — Managers create team goals aligned with company strategy; members see how they contribute.
- **Check-ins** — Regular progress updates and real-time visibility into blockers and wins.
- **Learning assignments** — Trainings, skill-building roadmaps, and certifications tied to career goals.
- **Performance cycles** — Self-assessments, manager reviews, and 360 feedback at regular intervals.

**Key benefits:**

- Every person sees how their work connects to company strategy.
- Managers identify top talent and development needs early.
- Learning is evidence of progress, not an abstract activity.

**Learn more:**

- [OKRs Guide](../docs/okrs) — Set and track objectives.
- [Learning & Development](../docs/learning) — Assign and complete learning.
- [Performance Assessments](../docs/performance) — Run performance cycles.
- [Manager: Learning Assignments](../manager/learning-assignments) — Assign learning to reports.

---

### 👥 Team Development & 1:1 Meetings

**What it is:** Tools and insights for managers and 1:1 facilitators to develop their people.

- **Team dashboard** — Manager overview of reports: skills gaps, OKRs, performance status, and learning progress.
- **1:1 meetings** — Scheduled, templated, and recorded 1:1 agendas and notes. AI can suggest discussion topics based on skills, feedback, and projects.
- **1:1 facilitators** — Dedicated 1:1 view for anyone running development conversations (may or may not be a manager).
- **Performance assessments** — Managers can request and review assessments of their reports.
- **Project & client management** — Track projects and clients, assign team members, monitor capacity.
- **TRACK account strategy** — Full strategic account management: goals linked to KPIs and OKRs, expansion routes linked to projects, 30/60/90-day plays, and meeting cadences with participants.

**Key benefits:**

- Structured conversations lead to better outcomes.
- Managers have visibility into their reports' growth and blockers in real time.
- 1:1 facilitators stay focused on development without manager overhead.
- Evidence from 1:1s and projects feed directly into performance assessments.
- TRACK connects account strategy to people development, projects, and OKRs in a single workflow.

**Learn more:**

- [Manager Guide](../manager) — Overview of manager tools.
- [1:1 Guide](../one-on-one) — How to run 1:1s and track development.
- [Manager: Team Dashboard](../manager/team-dashboard) — Understand your team.
- [Manager: Projects & Clients](../manager/projects) — Track work and capacity.
- [TRACK: Account Strategy](../manager/track-overview) — Strategic account management framework.

---

### 🤖 AI-Powered Assistance

**What it is:** Generative AI built into the platform to reduce manual effort and surface insights.

- **AI skill inference** — Extract skills automatically from profiles, evidence, and project descriptions.
- **OKR suggestions** — AI recommends objectives and key results based on role, team goals, and historical data.
- **1:1 agenda suggestions** — AI surfaces discussion topics based on performance data, feedback, and projects.
- **Feedback summaries** — AI synthesizes feedback from multiple sources into actionable themes.
- **Search and discovery** — Semantic search across people, skills, projects, and knowledge base.
- **Chat assistant** — In-app assistant for quick questions and guidance on platform usage.

**Key benefits:**

- Reduces time spent on data entry and analysis.
- Surfaces insights that would be hard to spot manually.
- Personalizes growth experiences based on role, team, and history.

**Learn more:**

- [AI Assistant Guide](../docs/ai-assistant) — How to use the chat assistant.
- [Evidence & Skills](../docs/evidence) — View inferred skills and evidence.
- [Admin: AI Settings](../admin/integrations) — Configure AI models and behavior.

---

## User-Role-Specific Features

### For Members (Everyone)

- Dashboard with quick links and activity summary
- Profile: Your bio, skills, interests, and availability
- Skills: View assessments, add evidence, request feedback
- OKRs: Personal goals with check-ins
- Learning: Assigned trainings, roadmaps, and self-directed learning
- Performance: View assessments and feedback cycles
- Projects: Work you are assigned to and status
- People Finder: Search for people by skills, interests, availability
- Knowledge Base: Internal docs, policies, guides
- Feedback & recognition: Give and receive feedback, celebrate wins
- AI assistant: Chat for help and personalized suggestions

### For Managers

Everything Members have, plus:

- Manager dashboard: Overview of reports, OKRs, performance, learning status
- Team management: View org chart, manage direct reports, bulk actions
- Performance assessments: Request and review assessments of reports
- Learning assignments: Assign trainings and roadmaps to reports
- Team OKRs: Set team goals and track progress
- 1:1 meetings: Manage 1:1 schedule and agendas
- Projects & clients: Create projects, assign team members, track capacity
- Analytics: Team and organizational insights

### For 1:1 Facilitators

Everything Members have, plus:

- 1:1 dashboard: List of people you facilitate 1:1s with
- 1:1 meetings: Manage meetings with your 1:1 people
- Read-only access: View performance and projects of people you 1:1 with
- Meeting templates: Customize meeting agendas and talking points

### For Admins

Everything Members have, plus:

- Members & invitations: Invite users, manage roles, offboard
- Skills & capabilities: Define and update organizational skills catalog
- Role profiles: Link roles to required capabilities and skills
- Career roadmaps: Create learning paths for roles and progression
- Roles & permissions: Configure role definitions and access control
- Branding & customization: Customize colors, typography, and visual identity
- Settings: Email templates, feature flags, integrations
- Integrations: Connect with HR systems, SSO, webhooks, external APIs
- Analytics: Tenant-wide usage and insights
- Audit logs: Track changes and compliance

---

## Advanced Features

### Integrations & Customization

**Integrations:**

- **Auth0 SSO** — Log in with your company's identity provider (Azure AD, Google Workspace, OKTA, etc.)
- **HR system connectors** — Sync org data, job changes, departures (via webhooks or API)
- **Spreadsheet import** — Bulk import members and skills
- **Webhooks** — Listen to events (user created, OKR updated, performance submitted) and trigger workflows
- **REST API** — Build custom tools and integrations on top of Next.js SaaS AI Template

**Customization:**

- **Branding** — Customize primary colors, secondary colors, accent colors, and gradients
- **Typography** — Choose font family and adjust density for readability
- **Surface styles** — Switch between flat, elevated, and glass-morphism designs
- **Feature flags** — Enable/disable features per tenant (skills, OKRs, performance, etc.)
- **Fields & attributes** — Extend profiles with custom fields
- **Workflows** — Automation and approval workflows for certain actions

**Learn more:**

- [Admin: Integrations](../admin/integrations) — Set up and manage integrations.
- [Admin: Branding Settings](../admin/settings) — Customize visual identity.
- [Admin: API Documentation](../admin/api) — Develop custom integrations.

---

## Analytics & Insights

**For Managers:**

- Team capacity and utilization
- Skills coverage and gaps
- OKR progress and alignment
- Performance cycle status
- Learning completion rates

**For Admins:**

- Organization-wide skills distribution
- Role coverage and capability gaps
- OKR adoption and progress
- Performance cycle timelines
- Integrations and data quality

**Learn more:**

- [Manager: Analytics](../manager/analytics) — View team metrics.
- [Admin: Analytics](../admin/analytics) — View tenant insights.

---

## Security & Compliance

- **Role-based access control (RBAC)** — Fine-grained permissions for every action.
- **Tenant isolation** — Complete data separation between organizations.
- **Audit logs** — Track who changed what and when for compliance.
- **Session management** — Configurable session timeouts and multi-device sign-out.
- **Data retention** — Customize how long data is kept after people leave.
- **IP allowlisting** — Restrict access by IP (Enterprise).

**Learn more:**

- [Admin: Roles & Permissions](../admin/roles-permissions) — Configure access control.
- [Admin: Settings](../admin/settings) — Manage security policies.

---

## Getting Started with Each Feature

Use this quick reference to find guides for the features most relevant to you:

| I want to...                             | Start here                                       |
| ---------------------------------------- | ------------------------------------------------ |
| Assess my skills and build a profile     | [Skills Guide](../docs/skills)                   |
| Set and track personal OKRs              | [OKRs Guide](../docs/okrs)                       |
| Complete learning and training           | [Learning Guide](../docs/learning)               |
| Prepare for performance reviews          | [Performance Guide](../docs/performance)         |
| Work on a team project                   | [Projects Guide](../docs/projects)               |
| Run 1:1s with my direct reports or peers | [1:1 Guide](../one-on-one)                       |
| Find people by skills                    | [People Finder Guide](../docs/people-finder)     |
| Access company policies and docs         | [Knowledge Base Guide](../docs/knowledge-base)   |
| Give feedback or celebrate wins          | [Feedback & Recognition Guide](../docs/feedback) |
| Manage my team (manager)                 | [Manager Guide](../manager)                      |
| Configure my organization (admin)        | [Admin Guide](../admin)                          |
| Automate workflows or build integrations | [API & Integrations Guide](../admin/api)         |

---

## Next Steps

- **Just joined?** → [Welcome to Next.js SaaS AI Template](../getting-started) and [First Login](../getting-started/first-login)
- **Managing a team?** → [Manager Guide](../manager) for tools and best practices
- **Setting up your tenant?** → [Admin Guide](../admin) for configuration and integrations
- **Have questions?** → [FAQ](../faq) or search the docs using **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux)

Welcome to Next.js SaaS AI Template. We're excited to help you and your team grow.
