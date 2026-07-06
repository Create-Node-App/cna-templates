# Maintenance Runbook

> Single source of truth for operating, extending, and fixing the `create-node-app` ecosystem.
>
> Scope: [`Create-Node-App/create-node-app`](https://github.com/Create-Node-App/create-node-app) (CLI + monorepo) and [`Create-Node-App/cna-templates`](https://github.com/Create-Node-App/cna-templates) (template and extension bank).

---

## 1. Why this runbook exists

The project is two repositories that must stay in sync:

- `create-node-app` — the CLI scaffolding tool, published to npm.
- `cna-templates` — the template and extension bank consumed by the CLI.

Both have automated CI, automated releases, and a large surface area of dependencies. A change in one repo (a new Storybook version, a peer-dependency change in an extension, a Node requirement bump) can break the full matrix in the other. This runbook makes that work repeatable and traceable.

---

## 2. Operating constraints

Read these before any change:

- **Start with an issue.** Every significant fix, dependency update, security hardening, or new template/extension must begin as a GitHub issue. Break complex work into sub-issues when needed. The issue is the canonical place for analysis and decision history before any code is written.
- **If unsure, open an issue.** Do not start implementation when the solution is unclear. Use the issue to document the problem, options, and the chosen path.
- **One fix per PR.** If two issues are unrelated, open two PRs.
- **PRs must be ready for review.** Do not open PRs as drafts. Open them as **ready for review** so automated reviewers (CodeRabbit, AI tools, etc.) can inspect them.
- **Wait for AI review comments before merging.** After CI passes, allow a reasonable window for CodeRabbit or any configured AI reviewer to comment. If a blocking comment is raised, resolve it before merging. Only merge once both CI and AI reviews are quiet.
- **Link issues.** PR bodies must include `Closes #<issue>` when applicable.
- **English for all artifacts.** Commits, PRs, issues, docs, and comments are written in English.
- **Do not commit directly to `main`.** Always open a PR and let CI pass before merging.
- **Do not leave CI red on `main`.** If a merge breaks `main`, treat it as the next P0 fix.
- **Prefer minimal changes.** Do not refactor unrelated code while fixing a bug.
- **Document decisions.** If a choice is non-obvious (e.g., pinning Storybook to v8, using `.npmrc` with `legacy-peer-deps`, or adding `incompatibleWith`), document the rationale in the issue, the PR, and—if recurrent—in this runbook.

---

## 3. Pre-flight checklist for every session

Before writing code, run through this list. It is designed to be executed by a human or an AI agent.

```text
1. Read AGENTS.md in the target repository.
2. Read knowledge/processes/create-node-app-maintenance.md in the workspace (AI mirror).
3. Review open issues:
   gh issue list --repo Create-Node-App/create-node-app --state open --limit 20
   gh issue list --repo Create-Node-App/cna-templates --state open --limit 20
4. Review recent failed CI runs:
   gh run list --repo Create-Node-App/create-node-app --limit 10
   gh run list --repo Create-Node-App/cna-templates --limit 10
5. Identify whether the task is:
   a) Bug fix (CI/templates/extensions broken)
   b) Dependency update (security, compatibility, features)
   c) New template or extension
   d) Security hardening
   e) Release/maintenance task
   f) Research/spike
6. Route to the right section of this runbook.
```

---

## 4. Decision tree

Use this to decide which procedure to follow:

```text
CI is red
├── Failure is in .github/workflows/test-combinations.yml
│   └── Read MAINTENANCE_CI.md
├── Failure is dependency resolution (ERESOLVE, ETARGET, peer conflict)
│   └── Read MAINTENANCE_DEPENDENCIES.md
├── Failure is TypeScript / lint / build in a generated project
│   └── Read MAINTENANCE_TEMPLATES.md
└── Failure is in create-node-app core workflows (test, lint, type-check, publish)
    └── Read MAINTENANCE_RELEASE.md

Security alert received
└── Read MAINTENANCE_SECURITY.md

New template/extension requested
└── Read MAINTENANCE_TEMPLATES.md

Need to publish a release
└── Read MAINTENANCE_RELEASE.md
```

---

## 5. Generic workflow

Every task should follow these phases:

### 5.1 Discovery and issue creation

- Open a GitHub issue that describes the problem, its impact, and any known context. For large items, create sub-issues.
- Reproduce the failure locally when possible.
- Collect exact error messages, CI run IDs, and package versions.
- Check whether the issue is a regression (recent PR) or an external change (new dependency release).
- If the fix is not obvious, keep the analysis in the issue and ask for human input before coding.

### 5.2 Plan

- Decide the fix strategy.
- Identify affected templates/extensions and the CI matrix.
- Estimate risk. If the change is high-risk, run the full matrix manually before merging.

### 5.3 Implement

- Create a feature/fix branch.
- Make the smallest change that resolves the issue.
- Add or update tests/docs as needed.

### 5.4 Validate locally

- For `cna-templates`: scaffold the affected template + extensions with `file://` URLs and run the full validation command.
- For `create-node-app`: run `npm run test:all`, `npm run lint`, and `npm run build`.

### 5.5 Open PR

- Open the PR as **ready for review** (not draft).
- Use a descriptive title.
- Include `Closes #<issue>` and a clear description of the change, validation performed, and risks.
- Ensure CI passes on the PR branch.
- Wait for automated AI reviews (e.g., CodeRabbit) to finish before merging. Address any blocking feedback; do not bypass it silently.

### 5.6 Merge and monitor

- Merge with squash or merge commit as appropriate.
- Watch `main` CI after merge.
- If `main` fails, start a hotfix immediately.

### 5.7 Sync knowledge

- If a new pattern, decision, or shortcut was learned, update `knowledge/processes/create-node-app-maintenance.md` and/or this runbook.

---

## 6. Repositories at a glance

| Repo | What it is | Critical files | Critical CI |
|---|---|---|---|
| `create-node-app` | CLI + monorepo | `packages/*/package.json`, `.changeset/config.json`, `.github/workflows/publish.yml` | `test.yml`, `type-check.yml`, `publish.yml`, `mega-linter.yml` |
| `cna-templates` | Template/extension bank | `templates.json`, `templates.schema.json`, `templates/`, `extensions/`, `.github/workflows/test-combinations.yml` | `test-combinations.yml`, `smoke-test.yml` |

---

## 7. Quick reference: most common commands

```bash
# --- Scaffold locally from cna-templates ---
REPO=/absolute/path/to/cna-templates
CI=true npx create-awesome-node-app@latest my-app \
  -t "file://$REPO?subdir=templates/<slug>" \
  --addons "file://$REPO?subdir=extensions/<ext1>" \
         "file://$REPO?subdir=extensions/<ext2>"

cd my-app
npm install
npm run format --if-present
npm run lint:fix --if-present
npm run lint --if-present
npm run type-check --if-present
SKIP_ENV_VALIDATION=true npm run build --if-present

# --- Inspect CI failures ---
gh run view <run-id> --repo Create-Node-App/<repo> --log-failed

# --- Run cna-templates CI manually ---
gh workflow run "Test Template and Extension Combinations" \
  --repo Create-Node-App/cna-templates --ref main
gh run watch <run-id> --repo Create-Node-App/cna-templates --exit-status

# --- Inspect package versions ---
npm view <pkg>@<version>
npm view <pkg> versions --json | tail -n 20

# --- create-node-app monorepo ---
npm run build
npm run test:all
npm run lint
```

---

## 8. Related documentation

| File | Use |
|---|---|
| [docs/ARCHITECTURE.md](./ARCHITECTURE.md) | How templates and extensions are composed |
| [docs/AUTHORING.md](./AUTHORING.md) | File conventions, EJS, `package/index.js`, `customOptions` |
| [docs/TESTING.md](./TESTING.md) | Local test commands |
| [docs/MAINTENANCE_TEMPLATES.md](./MAINTENANCE_TEMPLATES.md) | Working with templates and extensions |
| [docs/DEFAULT_LANDING_GUIDE.md](./DEFAULT_LANDING_GUIDE.md) | Building and maintaining default landing pages |
| [docs/DEFAULT_LANDING_DESIGN.md](./DEFAULT_LANDING_DESIGN.md) | Design tokens, typography, and motion |
| [docs/MAINTENANCE_DEPENDENCIES.md](./MAINTENANCE_DEPENDENCIES.md) | Updating and resolving dependencies |
| [docs/MAINTENANCE_SECURITY.md](./MAINTENANCE_SECURITY.md) | Security alerts, audits, Dependabot |
| [docs/MAINTENANCE_CI.md](./MAINTENANCE_CI.md) | CI workflows, troubleshooting, YAML/JS scripts |
| [docs/MAINTENANCE_RELEASE.md](./MAINTENANCE_RELEASE.md) | Changesets, npm Trusted Publishing, releases |

---

## 9. Runbook changelog

| Date | Change | PR |
|---|---|---|
| 2026-07-05 | Initial runbook | TBD |
