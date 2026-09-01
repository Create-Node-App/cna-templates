# GitHub Setup Guide

## Overview

This extension configures GitHub workflows, Dependabot, and templates for a professional repository setup.

## Included Features

### GitHub Actions

- **Mega Linter**: Comprehensive code linting across multiple languages
- **PR Previews**: Automatic deployment of preview environments for pull requests (see [DEPLOYMENT.md](DEPLOYMENT.md))
- **Build & Test**: Automated validation on every PR
- **Type Checking**: TypeScript validation
- **Dependency Updates**: Automated security and version updates
- **Issue Templates**: Structured bug reports and feature requests
- **PR Templates**: Consistent pull request format

### Automated Workflows

- Code quality checks on every PR
- Security vulnerability scanning
- Dependency update automation
- Lint validation for multiple file types

## Configuration Files

### Workflows (`.github/workflows/`)

- `pr-preview.yml` - Automatically deploys preview environments for PRs to main
- `deploy.yml` - Manual deployment workflow for dev/staging/prod environments
- `build.yml` - Builds the Next.js application on every PR and push to main
- `lint.yml` - Runs ESLint on code changes
- `type-check.yml` - Validates TypeScript types
- `tests.yml` - Runs the test suite
- `mega-linter.yml` - Runs Mega Linter on all code changes
- `pr-review.yml` - Danger.js PR review automation
- `todo.yml` - Tracks TODO comments in code

### Templates (`.github/`)

- `ISSUE_TEMPLATE/` - Bug report and feature request templates
- `pull_request_template.md` - Standard PR format
- `CODEOWNERS` - Define code review assignments

## Customization

### Mega Linter Configuration

The Mega Linter is configured to:

- Only validate changed files (`VALIDATE_ALL_CODEBASE: false`)
- Skip TypeScript Standard validation
- Run on push and PR events to main branch

### Dependabot Settings

Automatic updates for:

- npm packages (daily)
- GitHub Actions (weekly)
- Docker images (if applicable)

### Issue Templates

Pre-configured templates for:

- 🐛 Bug reports with reproduction steps
- 🚀 Feature requests with use cases
- 📖 Documentation improvements

## Best Practices

### Branch Protection

Consider enabling:

- Require PR reviews
- Require status checks
- Require branches to be up to date
- Restrict pushes to main branch

### Security

The setup includes:

- Dependabot security updates
- CodeQL analysis (if applicable)
- Secret scanning alerts

### Team Collaboration

- Use CODEOWNERS for automated review assignments
- Customize issue labels for better organization
- Set up project boards for task management

## Common Workflows

### Adding Custom Actions

1. Create new workflow file in `.github/workflows/`
2. Define triggers (push, PR, schedule)
3. Add necessary steps and actions
4. Test with pull requests

### Customizing Templates

1. Edit files in `.github/ISSUE_TEMPLATE/`
2. Modify `pull_request_template.md`
3. Update labels and assignees as needed

### Managing Dependencies

Dependabot will automatically:

- Create PRs for dependency updates
- Group related updates when possible
- Follow your merge preferences

## Troubleshooting

### Linter Failures

- Check the Mega Linter output for specific errors
- Common issues: trailing whitespace, missing newlines
- Configure `.gitignore` for generated files

### Dependabot Issues

- Check Dependabot logs in repository insights
- Verify `package.json` permissions
- Review conflicting dependency versions

### Workflow Permissions

Ensure workflows have proper permissions:

- `contents: read` for accessing repository
- `pull-requests: write` for creating PRs
- `checks: write` for status updates

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [Mega Linter](https://megalinter.io)
