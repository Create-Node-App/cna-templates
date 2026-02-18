# Contributing to CNA Templates

Thank you for your interest in contributing to CNA Templates! This guide will help you understand our development workflow and how to make contributions.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a New Template](#adding-a-new-template)
- [Adding a New Extension](#adding-a-new-extension)
- [Testing Your Changes](#testing-your-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Style Guidelines](#code-style-guidelines)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.15
- Git
- A GitHub account

### Fork and Clone

1. Fork this repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cna-templates.git
   cd cna-templates
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/Create-Node-App/cna-templates.git
   ```

## 🔄 Development Workflow

### Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Make Your Changes

1. Add or modify templates/extensions
2. Update `templates.json`
3. Test your changes locally
4. Validate with the validation script

### Commit Your Changes

We follow conventional commit messages:

```bash
git add .
git commit -m "feat: add new react-query extension"
```

**Commit types:**
- `feat:` - New feature or template/extension
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests

## 📦 Adding a New Template

### 1. Create the Template Directory

```bash
mkdir -p templates/your-template-name
cd templates/your-template-name
```

### 2. Template Structure

Your template should follow this structure:

```
your-template-name/
├── package/
│   ├── index.js           # Package.json generator
│   ├── dependencies.js    # Runtime dependencies
│   └── devDependencies.js # Development dependencies
├── [src]/                 # Source directory (name will be configurable)
│   ├── components/
│   ├── pages/
│   └── ...
├── docs/
│   └── README.md          # Detailed documentation
├── public/                # Static assets
├── README.md.template     # Template README with variables
├── .gitignore
├── tsconfig.json.template # Config files with variables
├── eslint.config.mjs.template
└── vite.config.ts.template
```

### 3. Template Variables

Use `<%= variableName %>` syntax for dynamic values:

```javascript
// README.md.template
# <%= projectName %>

## Getting Started

<%= installCommand %>
<%= runCommand %> dev
```

Available variables:
- `projectName` - User's project name
- `appName` - Formatted app name
- `installCommand` - npm/yarn/pnpm install
- `runCommand` - npm/yarn/pnpm run
- Custom variables from `customOptions` in templates.json

### 4. Package Configuration

**package/index.js:**
```javascript
const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  return {
    name: appName,
    version: "0.1.0",
    description: "Your template description",
    engines: { node: ">=18.15" },
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      lint: "eslint .",
      "lint:fix": "eslint . --fix"
    },
    dependencies,
    devDependencies
  };
};
```

**package/dependencies.js:**
```javascript
module.exports = {
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
};
```

**package/devDependencies.js:**
```javascript
module.exports = {
  "@types/react": "^18.3.12",
  "typescript": "^5.7.2",
  "vite": "^6.0.7"
};
```

### 5. Add to templates.json

```json
{
  "name": "Your Template Name",
  "slug": "your-template-slug",
  "description": "Brief description of your template",
  "url": "https://github.com/Create-Node-App/cna-templates/tree/main/templates/your-template-name",
  "type": "your-template-type",
  "category": "frontend-applications",
  "labels": ["React", "TypeScript", "Vite"],
  "customOptions": [
    {
      "name": "srcDir",
      "type": "text",
      "message": "Source directory name",
      "initial": "src"
    }
  ]
}
```

### 6. Validate and Test

```bash
# Validate templates.json
node scripts/validate-templates.js

# Test your template
npx create-awesome-node-app --template your-template-slug

# Test the generated project
cd my-project
npm install
npm run lint
npm run build
```

## 🔌 Adding a New Extension

### 1. Create the Extension Directory

```bash
mkdir -p extensions/react-your-extension
cd extensions/react-your-extension
```

### 2. Extension Structure

```
react-your-extension/
├── package.json          # Dependencies only
├── README.md             # Setup and usage guide
├── [src]/                # Source files to merge
│   ├── components/
│   │   └── YourComponent.tsx
│   └── hooks/
│       └── useYourHook.ts
└── docs/
    └── README.md.append  # Content to append to project README
```

### 3. package.json

Extensions only need dependencies:

```json
{
  "dependencies": {
    "your-library": "^1.0.0"
  },
  "devDependencies": {
    "@types/your-library": "^1.0.0"
  }
}
```

### 4. README.md

Provide clear setup and usage instructions:

```markdown
# Your Extension Name

Brief description of what this extension provides.

## Features

- Feature 1
- Feature 2

## Usage

### Basic Example

\`\`\`typescript
import { YourComponent } from '@/components/YourComponent';

function App() {
  return <YourComponent />;
}
\`\`\`

## Configuration

Explain any configuration needed.

## Resources

- [Library Documentation](https://example.com)
```

### 5. Source Files

Place implementation files in `[src]/`:

```typescript
// [src]/components/YourComponent.tsx
import React from 'react';

export function YourComponent() {
  return <div>Your Component</div>;
}
```

### 6. Documentation Append (Optional)

**docs/README.md.append:**
```markdown

## Your Extension

This project includes [Your Library](https://example.com) for...

### Quick Start

\`\`\`bash
# Your commands here
\`\`\`
```

### 7. Add to templates.json

```json
{
  "name": "Your Extension Name",
  "slug": "your-extension-slug",
  "description": "Brief description",
  "url": "https://github.com/Create-Node-App/cna-templates/tree/main/extensions/react-your-extension",
  "type": ["react", "nextjs"],
  "category": "UI",
  "labels": ["React", "UI", "Components"]
}
```

### 8. Test the Extension

```bash
# Validate
node scripts/validate-templates.js

# Test with a compatible template
npx create-awesome-node-app --template react-vite-boilerplate --addons your-extension-slug

# Verify the generated project
cd my-project
npm install
npm run lint
npm run build
```

## 🧪 Testing Your Changes

### Local Validation

```bash
# Run the validation script
node scripts/validate-templates.js
```

This checks for:
- Valid JSON syntax
- No duplicate slugs
- Required fields present
- Valid URLs
- Directory references exist
- Type consistency

### Integration Testing

```bash
# Test template alone
npx create-awesome-node-app --template your-template-slug

# Test template with extensions
npx create-awesome-node-app --template your-template-slug --addons extension1 extension2

# Navigate and test
cd my-project
npm install
npm run lint
npm run build
npm run dev  # Manually verify the app works
```

### CI Testing

Push your branch and the GitHub Actions workflow will automatically test random combinations of templates and extensions.

## 📤 Submitting a Pull Request

### Before Submitting

- [ ] Run validation: `node scripts/validate-templates.js`
- [ ] Test your template/extension locally
- [ ] Ensure generated projects build successfully
- [ ] Update documentation if needed
- [ ] Follow code style guidelines

### Submit PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the [CNA Templates repository](https://github.com/Create-Node-App/cna-templates)

3. Click "New Pull Request"

4. Select your fork and branch

5. Fill in the PR template:
   - Clear title describing the change
   - Description of what was added/changed
   - Screenshots if applicable (for UI changes)
   - Testing steps

6. Submit and wait for review!

## 🎨 Code Style Guidelines

### File Naming

- Use kebab-case for directories: `react-material-ui`
- Use PascalCase for React components: `MyComponent.tsx`
- Use camelCase for utilities: `useMyHook.ts`
- Use `.template` suffix for template files: `App.tsx.template`

### TypeScript

- Use TypeScript for all new code
- Include proper type definitions
- Export types when appropriate

### Code Organization

- Group related files together
- Use feature-based architecture when possible
- Keep components small and focused
- Include JSDoc comments for complex functions

### Configuration Files

- Include comments explaining non-obvious configurations
- Use modern, up-to-date syntax
- Follow ecosystem best practices

### Documentation

- Write clear, concise documentation
- Include code examples
- Add comments for complex logic
- Keep README files updated

## ❓ Questions?

If you have questions or need help:

1. Check existing [issues](https://github.com/Create-Node-App/cna-templates/issues)
2. Start a [discussion](https://github.com/Create-Node-App/cna-templates/discussions)
3. Reach out to maintainers

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to CNA Templates! 🎉
