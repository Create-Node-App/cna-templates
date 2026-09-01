# Husky and Lint-Staged Extension

This extension improves code quality with pre-commit hooks using Husky and Lint Staged to automatically run linters and formatters before commits.

## Features

- Pre-commit hooks with Husky
- Staged file linting with Lint Staged
- Automated code formatting
- Code quality enforcement
- Git workflow integration

## Usage

Husky and Lint Staged are automatically configured when this extension is added to your project. The extension includes:

- Husky pre-commit hooks setup
- Lint Staged configuration
- Automatic linting and formatting
- Git hooks integration

## Benefits

- **Quality Control**: Prevents bad code from being committed
- **Automation**: Automatically formats and lints staged files
- **Team Consistency**: Enforces code standards across the team
- **Fast Feedback**: Catches issues before they reach the repository

## How It Works

1. **Stage files**: `git add .`
2. **Commit**: `git commit -m "message"`
3. **Automatic**: Husky runs lint-staged on staged files
4. **Validation**: Only clean code gets committed

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Lint Staged Documentation](https://github.com/okonet/lint-staged)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) 