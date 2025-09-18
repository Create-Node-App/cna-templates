# AGENTS.md – AI Interaction & Execution Guide (Human contributors: see CONTRIBUTING.md & docs/)

AI assistants only. Humans: see CONTRIBUTING.md and docs/.

## 1. Authoritative References (Never Reproduce Content Here)

| Topic | Source of Truth |
|-------|-----------------|
| Project structure | docs/PROJECT_STRUCTURE.md |
| Test configuration | docs/TEST_CONFIGURATION.md |
| Running tests | docs/RUNNING_TESTS.md |
| Writing tests | docs/WRITING_TESTS.md |

## 2. Operating Principles (AI Perspective)

- Documentation-first
- Reuse-before-build (existing helpers/page objects)
- Deterministic tests (no hidden timing flakiness)
- Explicit assumption logging

## 3. AI Execution Protocol (E2E Test Work)

When adding/modifying tests:

1. Locate/create appropriate spec under `tests/` (follow existing naming)
2. Prefer existing selectors & helper utilities
3. Present proposed file tree + diff plan BEFORE writing code (for large additions)
4. Ensure test isolation & idempotence (no order dependency)
5. After changes: list validation steps (lint, type check if TS, run subset of tests)

## 4. Guardrails (Must Enforce)

- Do NOT fabricate selectors or commands—inspect source under test
- Avoid brittle selectors (prefer data-testid / accessible roles)
- No arbitrary sleeps—use proper waits
- Flag large dependency additions (>1 new lib)
- Surface potential flakiness sources (network variance, race conditions)

## 5. Test / Helper Creation Checklist

- Clear descriptive test names
- Reusable page objects or helpers when patterns emerge
- Assertions meaningful & minimal
- Cleanup performed (if stateful operations)
- Skipped tests justified or removed

## 6. When the AI Should Ask or Refuse

Ask if: unclear target flow, ambiguous selector strategy, missing stable identifiers.
Refuse if: asked to add brittle sleeps or bypass reliability patterns.

## 7. Post-Change Assistant Report

Return a bullet summary:

- Files touched (concise)
- New dependencies (if any)
- Lint/status
- Suggested manual QA steps
- Deferred items (tests, docs)

---
Maintained automatically by create-awesome-node-app WDIO template provisioning.
Humans: stop reading—go to CONTRIBUTING.md + docs/.
