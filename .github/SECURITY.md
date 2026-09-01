# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main`  | ✅        |

Only the default branch (`main`) receives security fixes. Generated projects should update by re-scaffolding or manually bumping the affected dependency.

## Reporting a Vulnerability

- **Do not** open a public issue for security vulnerabilities.
- Email the maintainer via GitHub Security Advisories: [New draft advisory](https://github.com/Create-Node-App/cna-templates/security/advisories/new) or contact `@ulises-jeremias` directly.
- Include: affected template/extension, package name and version, reproduction steps, and impact.

We will acknowledge receipt within 72 hours and provide a triage timeline.

## Triage

We triage using [`docs/MAINTENANCE_SECURITY.md`](../docs/MAINTENANCE_SECURITY.md) §2:

| Severity | Action |
|---|---|
| Critical / High in CLI code path | P0 — fix immediately and release |
| High in transitive dependency of a template | P1 — fix within the sprint |
| Moderate / Low | Batch with other maintenance |
| Informational only | Document and close if not actionable |

For `cna-templates` (no committed lockfiles), fixes land as `package.json` range bumps or `overrides` in the affected `templates/*/template/package.json` or `extensions/*/package.json`. See `docs/MAINTENANCE_SECURITY.md` §4 for patterns and `npm audit` / `osv-scanner` validation steps.
