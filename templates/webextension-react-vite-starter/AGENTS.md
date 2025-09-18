# AGENTS.md – AI Interaction & Execution Guide (Human contributors: see CONTRIBUTING.md & docs/)

AI assistants only. Humans: see CONTRIBUTING.md and docs/.

## 1. Authoritative References (Never Reproduce Content Here)

| Topic | Source of Truth |
|-------|-----------------|
| Project architecture | docs/PROJECT_STRUCTURE.md |
| Component & styling patterns | docs/COMPONENTS_AND_STYLING.md |
| Performance guidance | docs/PERFORMANCE.md |
| State management approach | docs/STATE_MANAGEMENT.md |
| Project configuration | docs/PROJECT_CONFIGURATION.md |

(.template files materialize during generation—still authoritative.)

## 2. Operating Principles (AI Perspective)

- Documentation-first
- Reuse-before-build
- Type safety always (no unvetted any)
- Deterministic, incremental changes
- Explicit assumption logging

## 3. AI Execution Protocol (WebExtension React Feature Work)

When adding/modifying extension UI or logic:

1. Identify target feature folder under `[src]/features/*` (justify new ones) or background/content script area
2. Read referenced docs first
3. Follow existing messaging/storage patterns (avoid ad-hoc globals)
4. Present proposed file tree + diff plan BEFORE writing code
5. After changes: list validation (format, lint, type check, build, extension load sanity)

## 4. Guardrails (Must Enforce)

- Do NOT fabricate Chrome/Browser APIs or file paths
- Maintain permission minimalism—flag new manifest permissions
- Preserve accessibility attributes
- Flag large dependency additions (>1 lib)
- Surface potential performance issues (chatty messaging, excessive re-renders)

## 5. Component / Script Creation Checklist

- Typed interfaces exported
- Messaging contracts documented (inline comments ok)
- Accessibility reviewed
- Example / usage snippet considered
- Test file or explicit deferral with reason

## 6. When the AI Should Ask or Refuse

Ask if: unclear script context (popup vs background vs content), conflicting patterns, manifest updates needed.
Refuse if: asked to add unnecessary broad permissions or bypass validation.

## 7. Post-Change Assistant Report

Return a bullet summary:

- Files touched (concise)
- New dependencies (if any)
- Type/lint status
- Suggested manual QA steps
- Deferred items (tests, docs)

---
Maintained automatically by create-awesome-node-app WebExtension React template provisioning.
Humans: stop reading—go to CONTRIBUTING.md + docs/.
