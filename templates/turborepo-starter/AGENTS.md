# AGENTS.md – AI Interaction & Execution Guide (Human contributors: see CONTRIBUTING.md & docs/)

This file is for AI assistants only. Humans: see CONTRIBUTING.md and docs/.

## 1. Authoritative References (Never Reproduce Content Here)

| Topic | Source of Truth |
|-------|-----------------|
| Monorepo structure | docs/PROJECT_STRUCTURE.md |
| Development workflow | docs/DEVELOPMENT_WORKFLOW.md |

(.template files are materialized during generation—treat as authoritative.)

## 2. Operating Principles (AI Perspective)

- Documentation-first
- Reuse-before-build (internal packages over new external deps)
- Type safety across packages
- Incremental, isolated changes (avoid cross-package churn unless justified)
- Explicit assumption logging

## 3. AI Execution Protocol (Monorepo Package / App Work)

When modifying or adding functionality:

1. Identify target package/app under `apps/` or `packages/` (justify new ones)
2. Audit existing shared packages before adding utilities
3. Present proposed file tree + diff plan BEFORE writing code
4. Respect build / pipeline constraints (turborepo caching)
5. After code: list validation steps (affected builds, lint, type check, tests)

## 4. Guardrails (Must Enforce)

- Do NOT fabricate package names or paths
- Do NOT add inter-package circular dependencies
- Flag large dependency additions (>1 new external lib) for confirmation
- Preserve task pipeline efficiency (avoid unnecessary workspace-wide changes)
- Surface potential cache invalidation or build performance concerns

## 5. Package / Library Creation Checklist

- Proper `package.json` name/version/workspaces alignment
- Type declarations exported
- Entry points defined (main/module/types)
- Tests or explicit deferral with reason
- README stub or usage comments

## 6. When the AI Should Ask or Refuse

Ask if: unclear which package should own logic, potential duplication, cross-cutting concern.
Refuse if: asked to introduce tight coupling or bypass existing build/test constraints.

## 7. Post-Change Assistant Report

Return a bullet summary:

- Files touched (concise)
- New dependencies (if any)
- Type/lint status
- Suggested manual QA steps
- Deferred items (tests, docs)

---
Maintained automatically by create-awesome-node-app Turborepo template provisioning.
Humans: stop reading—go to CONTRIBUTING.md + docs/.
