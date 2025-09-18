# AGENTS.md – AI Interaction & Execution Guide (Human contributors: see CONTRIBUTING.md & docs/)

This file is intentionally scoped only for AI assistants.
Humans: read CONTRIBUTING.md and docs/.

## 1. Authoritative References (Never Reproduce Content Here)

| Topic | Source of Truth |
|-------|-----------------|
| Project architecture | docs/README.md |

(Additional structured docs may be added over time—only reference, never duplicate.)

## 2. Operating Principles (AI Perspective)

- Documentation-first
- Reuse-before-build (prefer existing modules/providers/services)
- Strict typing (no unvetted any)
- Deterministic, incremental changes
- Explicit assumption logging

## 3. AI Execution Protocol (NestJS Feature / Module Work)

When asked to add/modify backend logic:

1. Locate existing module in `src/` or justify creation of a new module
2. Check for existing providers/services before creating new ones
3. Present proposed file tree + diff plan BEFORE writing code
4. Ensure proper DI wiring (module imports/exports/providers arrays)
5. After changes: outline validation (lint, type check, unit test / e2e test impact)

## 4. Guardrails (Must Enforce)

- Do NOT fabricate file paths, DTO shapes, or provider names
- Do NOT bypass validation pipes / guards without justification
- Do NOT introduce global mutable state—use DI scoped providers
- Flag heavy dependency additions (>1 lib) for human confirmation
- Surface potential performance or security concerns (N+1 queries, missing authz)

## 5. Module / Service Creation Checklist

- DTOs & interfaces typed and exported
- Validation decorators on DTOs where appropriate
- Providers registered in the module
- Controller routes use proper HTTP status codes
- Tests added or explicitly deferred with reason

## 6. When the AI Should Ask or Refuse

Ask if: unclear domain ownership, overlapping module responsibility, missing environment config.
Refuse if: asked to skip validation/security layers or introduce untyped dynamic logic.

## 7. Post-Change Assistant Report

Return a bullet summary:

- Files touched (concise)
- New dependencies (if any)
- Type/lint status
- Suggested manual QA / test steps
- Deferred items (tests, docs)

---
Maintained automatically by create-awesome-node-app NestJS template provisioning.
Humans: stop reading—go to CONTRIBUTING.md + docs/.
