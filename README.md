# CNA Templates

[![Validation](https://github.com/Create-Node-App/cna-templates/actions/workflows/test-combinations.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/test-combinations.yml)

This repository contains official templates and extensions for [create-awesome-node-app](https://www.npmjs.com/package/create-awesome-node-app), enabling developers to quickly bootstrap modern applications with pre-configured tech stacks.

## 📦 What's Inside?

- **6 Production-Ready Templates**: React, Next.js, NestJS, WebExtension, WebdriverIO, and Turborepo
- **38+ Extensions**: State management, UI libraries, databases, tooling, and cross-platform support
- **Type-Safe Configuration**: JSON schema validation for all templates and extensions
- **Automated Testing**: CI/CD workflow tests template-extension combinations

## 🚀 Quick Start

Create a new project using the CLI:

```bash
# Interactive mode (recommended)
npx create-awesome-node-app

# With specific template
npx create-awesome-node-app --template react-vite-boilerplate

# With template and extensions
npx create-awesome-node-app --template react-vite-boilerplate --addons material-ui zustand
```

## 📚 Available Templates

| Template | Type | Use Case | Key Features |
|----------|------|----------|--------------|
| [React Vite](./templates/react-vite-starter) | `react` | Frontend Apps | TypeScript, Router, Feature-based architecture |
| [Next.js](./templates/nextjs-starter) | `nextjs` | Full-stack Apps | SSR, API routes, Production-ready |
| [NestJS](./templates/nestjs-starter) | `nestjs-backend` | Backend APIs | Scalable, Maintainable, Enterprise-ready |
| [Turborepo](./templates/turborepo-starter) | `monorepo` | Monorepos | Multi-package management, Changesets |
| [WebdriverIO](./templates/wdio-starter) | `webdriverio` | UAT | Automated testing, Selenoid |
| [WebExtension](./templates/webextension-react-vite-starter) | `webextension-react` | Browser Extensions | Chrome/Firefox/Edge compatible |

## 🔌 Popular Extensions

### State Management
- **zustand** - Minimal and flexible state management
- **redux-thunk** / **redux-saga** - Redux with async middleware
- **jotai** - Atomic state management
- **recoil** - Facebook's state management library

### UI Libraries
- **material-ui** - Material Design components
- **tailwind-css** - Utility-first CSS framework
- **shadcn-ui** - Radix UI + Tailwind components
- **ant-design** - Enterprise-class UI design

### Database & ORM
- **drizzle-sqlite** / **drizzle-postgres** - Type-safe SQL ORM
- **mongoose** - MongoDB object modeling

### Tooling
- **github-setup** - GitHub Actions, Dependabot, issue templates
- **husky-lint-staged** - Pre-commit hooks for code quality
- **development-container** - Docker dev environments
- **jest-rtl** - Jest + React Testing Library setup

### Cross-Platform
- **ionic-react-capacitor** - Build mobile apps
- **react-electron-vite** - Desktop applications
- **android-tools** - Android development setup

[View all extensions →](./extensions)

## 🛠️ For Contributors

## 🛠️ For Contributors

### How to Add New Templates or Extensions

1. **Fork this repository**

2. **Create your template or extension**
   - Add to `templates/` or `extensions/` folder
   - Follow the existing structure (see [Template Structure](#template-structure) below)
   - Include a README.md with setup instructions

3. **Update `templates.json`**
   - Add your entry to the `templates` or `extensions` array
   - Ensure all required fields are present
   - Use consistent naming and type conventions

4. **Validate your changes**
   ```bash
   node scripts/validate-templates.js
   ```

5. **Test locally**
   ```bash
   npx create-awesome-node-app --template your-template-slug
   ```

6. **Create a pull request!**

### Template Structure

Each template should include:
- `package/` - Directory with `index.js`, `dependencies.js`, and `devDependencies.js`
- `[src]/` - Source directory (brackets indicate variable naming)
- `README.md.template` - Template README with variable substitution
- `docs/` - Additional documentation
- `.template` files - Files with variables that will be substituted (e.g., `App.tsx.template`)
- Configuration files (tsconfig, eslint, prettier, etc.)

### Extension Structure

Each extension should include:
- `package.json` - Dependencies to be added
- `README.md` - Setup and usage instructions
- `[src]/` - Source files to be merged
- `docs/README.md.append` (optional) - Content to append to main README

### Template Properties Reference

When adding to `templates.json`:

```json
{
  "name": "Display Name",
  "slug": "unique-slug-identifier",
  "description": "Brief description of what this provides",
  "url": "https://github.com/Create-Node-App/cna-templates/tree/main/templates/your-template",
  "type": "template-type",
  "category": "category-slug",
  "labels": ["Keyword1", "Keyword2"],
  "customOptions": [  // Optional
    {
      "name": "srcDir",
      "type": "text",
      "message": "Source directory name",
      "initial": "src"
    }
  ]
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `name` | ✅ | Human-readable name displayed in CLI |
| `slug` | ✅ | Unique identifier (URL-friendly, kebab-case) |
| `description` | ✅ | Short description (1-2 sentences) |
| `url` | ✅ | GitHub URL to template/extension directory |
| `type` | ✅ | Type identifier for compatibility matching (string or array) |
| `category` | ✅ | Category for grouping (must match a category slug for templates) |
| `labels` | ✅ | Array of keywords for filtering and search |
| `customOptions` | ❌ | Array of user prompts for template configuration |

### Type-Based Compatibility

Extensions are matched to templates by the `type` field:

```javascript
// Template with single type
{ "type": "react", ... }

// Extension compatible with multiple templates
{ "type": ["react", "nextjs"], ... }

// Compatibility check
const compatible = Array.isArray(ext.type) 
  ? ext.type.includes(template.type) 
  : ext.type === template.type;
```

**Available Types:**
- `react` - React applications
- `nextjs` - Next.js applications
- `nestjs-backend` - NestJS backend APIs
- `monorepo` - Monorepo projects
- `webdriverio` - Testing projects
- `webextension-react` - Browser extensions

## 📖 Understanding `templates.json`

The `templates.json` file is the single source of truth that defines all available templates, extensions, and categories.

### Structure Overview

```json
{
  "categories": [...],    // Template categories for organization
  "templates": [...],     // Base project templates
  "extensions": [...]     // Optional add-ons for templates
}
```

### How It Works

When you run `create-awesome-node-app`, the CLI:

1. **Reads** `templates.json` to get available options
2. **Matches** your selected template by `slug`
3. **Filters** compatible extensions by matching `type` fields
4. **Generates** your project with the template + selected extensions

**Example:**
```bash
npx create-awesome-node-app --template react-vite-boilerplate --addons material-ui zustand
```

This command:
- Uses the `react-vite-boilerplate` template (type: `react`)
- Adds `material-ui` extension (compatible with type: `react`)
- Adds `zustand` extension (compatible with type: `react`)

### Categories

Categories organize templates in the CLI interface:

```json
{
  "slug": "frontend-applications",
  "name": "Frontend Applications",
  "description": "Templates for building modern web interfaces.",
  "details": "Discover templates for React, Vue, and other frontend frameworks...",
  "labels": ["Frontend", "UI", "React", "Vue", "Web"]
}
```

## 🔧 Development & Testing

### Running Validation

```bash
# Validate templates.json structure
node scripts/validate-templates.js
```

The validation script checks for:
- ✅ Valid JSON syntax
- ✅ No duplicate slugs
- ✅ All required fields present
- ✅ Valid URLs
- ✅ Existing directory references
- ⚠️ Type consistency warnings

### Testing Templates Locally

```bash
# Test a specific template
npx create-awesome-node-app --template your-template-slug

# Test with extensions
npx create-awesome-node-app --template react-vite-boilerplate --addons material-ui zustand

# Navigate to generated project
cd my-project

# Install and test
npm install
npm run lint
npm run build
```

### CI/CD Testing

The repository includes automated testing via GitHub Actions:
- Tests random template-extension combinations weekly
- Validates that generated projects can be built and linted
- Ensures compatibility across the ecosystem

## 📜 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please see our contribution guidelines above or reach out with questions.

## 📞 Support

- 📦 [NPM Package](https://www.npmjs.com/package/create-awesome-node-app)
- 🐛 [Report Issues](https://github.com/Create-Node-App/cna-templates/issues)
- 💬 [Discussions](https://github.com/Create-Node-App/cna-templates/discussions)
