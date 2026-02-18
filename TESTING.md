# Testing Guide for CNA Templates

This guide explains how to test templates and extensions in the cna-templates repository.

## 📋 Table of Contents

- [Overview](#overview)
- [Local Testing](#local-testing)
- [Validation Testing](#validation-testing)
- [Integration Testing](#integration-testing)
- [CI/CD Testing](#cicd-testing)
- [Common Issues](#common-issues)

## 🎯 Overview

Testing in cna-templates involves multiple layers:

1. **Validation Testing** - Ensures `templates.json` is valid
2. **Local Testing** - Tests template/extension generation locally
3. **Integration Testing** - Verifies generated projects build and run
4. **CI/CD Testing** - Automated testing of template combinations

## 🏠 Local Testing

### Prerequisites

```bash
# Ensure you have Node.js installed
node --version  # Should be >= 18.15

# Install npm packages globally (if not already)
npm install -g create-awesome-node-app
```

### Testing a Single Template

```bash
# Generate a project with your template
npx create-awesome-node-app --template your-template-slug

# Or specify the project name
npx create-awesome-node-app --template your-template-slug my-test-project

# Navigate to the generated project
cd my-test-project

# Install dependencies
npm install

# Run all available checks
npm run lint        # Check for code issues
npm run lint:fix    # Auto-fix linting issues
npm run build       # Build the project
npm run dev         # Start dev server (manually verify)
```

### Testing Template with Extensions

```bash
# Test template with one extension
npx create-awesome-node-app --template react-vite-boilerplate --addons material-ui

# Test with multiple extensions
npx create-awesome-node-app --template react-vite-boilerplate --addons material-ui zustand tailwind-css

# Navigate and verify
cd my-project
npm install
npm run lint:fix
npm run build
```

### Testing Different Package Managers

The CLI supports multiple package managers:

```bash
# Using npm (default)
npx create-awesome-node-app --template your-template-slug

# Using yarn
yarn create awesome-node-app --template your-template-slug

# Using pnpm
pnpm create awesome-node-app --template your-template-slug
```

## ✅ Validation Testing

### Run Validation Script

The validation script checks `templates.json` for common issues:

```bash
# From repository root
node scripts/validate-templates.js
```

### What It Checks

The validator performs the following checks:

#### ✅ JSON Syntax
- Valid JSON structure
- Proper formatting
- No syntax errors

#### ✅ Duplicate Slugs
- No duplicate template slugs
- No duplicate extension slugs
- Unique identifiers across the board

#### ✅ Required Fields
Templates and extensions must have:
- `name` - Display name
- `slug` - Unique identifier
- `description` - Brief description
- `url` - GitHub URL
- `type` - Type identifier(s)
- `category` - Category classification
- `labels` - Array of keywords

#### ✅ URL Validation
- All URLs are properly formatted
- URLs follow expected patterns

#### ✅ Directory References
- Template directories exist in `templates/`
- Extension directories exist in `extensions/`
- URLs match actual directory structure

#### ⚠️ Type Consistency Warnings
- Extensions have types matching at least one template
- Flags extensions with types that don't match any template

#### ⚠️ Category Warnings
- Templates use defined category slugs
- Flags undefined categories

### Expected Output

**All checks pass:**
```
🔍 Validating templates.json...

ℹ️  Validating JSON syntax...
✅ JSON syntax is valid
ℹ️  Checking for duplicate slugs...
✅ No duplicate slugs found (6 templates, 38 extensions)
ℹ️  Checking required fields...
✅ All required fields present
ℹ️  Validating URLs...
✅ All URLs are valid
ℹ️  Checking if template/extension directories exist...
✅ All directory references are valid
ℹ️  Validating type consistency...
✅ Type consistency validated (6 unique types found)
ℹ️  Validating categories...
✅ Category validation passed

==================================================
✅ All validations passed!
```

**With warnings:**
```
⚠️  WARNING: Extension "future-extension" has type "future-type" that doesn't match any template type

==================================================
⚠️  Validation passed with warnings
```

**With errors:**
```
❌ ERROR: Duplicate extension slug "duplicate-slug" at indices 5 and 12

==================================================
❌ Validation failed with errors
```

## 🔗 Integration Testing

Integration testing verifies that generated projects work correctly.

### Manual Integration Test

```bash
# 1. Generate project
npx create-awesome-node-app --template react-vite-boilerplate --addons material-ui zustand

cd my-project

# 2. Install dependencies
npm install

# 3. Run linting
npm run lint

# 4. Fix any auto-fixable issues
npm run lint:fix

# 5. Type check (if TypeScript)
npm run type-check

# 6. Build the project
npm run build

# 7. Preview production build
npm run preview

# 8. Start development server
npm run dev
```

### What to Verify

#### ✅ Installation
- [ ] Dependencies install without errors
- [ ] No peer dependency warnings
- [ ] Lock file is generated

#### ✅ Linting
- [ ] Linter runs successfully
- [ ] No critical linting errors
- [ ] Code follows style guidelines

#### ✅ Type Checking
- [ ] TypeScript compiles without errors
- [ ] Type definitions are correct
- [ ] No `any` types where avoidable

#### ✅ Build
- [ ] Project builds successfully
- [ ] Output files are generated
- [ ] No build warnings or errors
- [ ] Bundle size is reasonable

#### ✅ Runtime
- [ ] Dev server starts without errors
- [ ] Hot module replacement works
- [ ] Pages load correctly
- [ ] No console errors
- [ ] Features work as expected

### Testing Checklist for New Templates

When creating a new template, test:

- [ ] Template generates successfully
- [ ] All template variables are substituted
- [ ] Package.json is generated correctly
- [ ] Dependencies are installed
- [ ] Scripts work (dev, build, lint, etc.)
- [ ] README is generated with correct content
- [ ] Configuration files are valid
- [ ] TypeScript compiles (if applicable)
- [ ] Linting passes
- [ ] Project builds
- [ ] Dev server runs

### Testing Checklist for New Extensions

When creating a new extension, test with multiple compatible templates:

- [ ] Extension files are merged correctly
- [ ] Dependencies are added to package.json
- [ ] No file conflicts with base template
- [ ] Integration code works
- [ ] Documentation is appended correctly
- [ ] Compatible with all listed template types
- [ ] No breaking changes to base template

## 🤖 CI/CD Testing

### GitHub Actions Workflow

The repository uses GitHub Actions to automatically test template combinations.

**Workflow file:** `.github/workflows/test-combinations.yml`

### When Tests Run

- **On Push** to `main` branch
- **On Pull Request** to `main` branch
- **Weekly** via scheduled cron job (Sundays at midnight UTC)

### What It Tests

The workflow:

1. **Generates random combinations** of templates and extensions
2. **Creates a project** for each combination
3. **Installs dependencies** 
4. **Runs format** (if available)
5. **Runs lint:fix** (if available)
6. **Runs build** (if available)
7. **Outputs project structure** for inspection

### Viewing Test Results

1. Go to the [Actions tab](https://github.com/Create-Node-App/cna-templates/actions)
2. Click on a workflow run
3. View individual job logs
4. Check for failures or warnings

### Test Matrix

The workflow generates combinations by:
- Selecting each template
- Finding compatible extensions (matching `type`)
- Picking one extension from each category
- Creating a test project with that combination

Example combinations:
```
Template: react-vite-boilerplate
Extensions: material-ui, zustand, github-setup

Template: nextjs-starter
Extensions: tailwind-css, drizzle-sqlite, husky-lint-staged

Template: nestjs-boilerplate
Extensions: drizzle-postgres, openapi
```

### Reading CI Logs

**Successful run:**
```
Testing template: react-vite-boilerplate
With extensions: material-ui zustand github-setup

✓ Project generated
✓ Dependencies installed
✓ Format completed
✓ Lint passed
✓ Build successful
```

**Failed run:**
```
Testing template: react-vite-boilerplate
With extensions: broken-extension

✓ Project generated
✓ Dependencies installed
✗ Lint failed
  Error: 'SomeComponent' is not defined
```

## 🐛 Common Issues

### Issue: Template Not Found

**Symptom:**
```
Error: Template "your-template-slug" not found
```

**Solutions:**
- Verify slug in `templates.json` matches exactly
- Check that template directory exists
- Ensure URL in `templates.json` is correct
- Run validation script

### Issue: Extension Not Compatible

**Symptom:**
```
Warning: Extension "your-extension" is not compatible with template type "react"
```

**Solutions:**
- Check extension `type` field in `templates.json`
- Ensure extension type matches template type
- Add template type to extension's type array if appropriate

### Issue: Build Fails

**Symptom:**
```
npm run build
Error: Module not found
```

**Solutions:**
- Check that all dependencies are in package.json
- Verify import paths are correct
- Ensure TypeScript types are installed
- Check for circular dependencies

### Issue: Linting Errors

**Symptom:**
```
npm run lint
Error: 'variable' is defined but never used
```

**Solutions:**
- Run `npm run lint:fix` to auto-fix
- Update ESLint configuration if rules are too strict
- Add necessary ESLint comments for exceptions
- Fix the actual code issues

### Issue: Type Errors

**Symptom:**
```
npm run type-check
Error: Type 'string' is not assignable to type 'number'
```

**Solutions:**
- Fix type definitions
- Add proper type annotations
- Check for any missing `@types/*` packages
- Update tsconfig.json if needed

### Issue: Variables Not Substituted

**Symptom:**
Generated files contain `<%= variableName %>` instead of actual values.

**Solutions:**
- Ensure files have `.template` extension
- Check variable names match available variables
- Verify template processing logic in create-awesome-node-app

## 📊 Testing Best Practices

### Before Submitting PR

1. ✅ Run validation script
2. ✅ Test template/extension locally
3. ✅ Verify builds succeed
4. ✅ Check linting passes
5. ✅ Test with different package managers
6. ✅ Test multiple extension combinations
7. ✅ Check CI passes on PR

### Regular Testing

- Test after updating dependencies
- Test after modifying templates.json
- Test when adding new templates/extensions
- Test existing templates when adding new extensions

### Debugging Tips

1. **Use verbose logging** - Add `console.log` in package/index.js
2. **Check generated files** - Inspect output in my-project/
3. **Test incrementally** - Add one extension at a time
4. **Compare with working templates** - See how others do it
5. **Check CI logs** - Look for patterns in failures

## 🔍 Advanced Testing

### Testing Custom Options

Test templates with custom options:

```bash
# The CLI will prompt for custom options
npx create-awesome-node-app --template nextjs-starter

# Follow prompts for srcDir, projectImportPath, etc.
```

### Testing Edge Cases

- Empty project names
- Special characters in names
- Very long extension lists
- Incompatible extension combinations
- Missing optional scripts

### Performance Testing

Check generated project performance:

```bash
cd my-project
npm run build

# Check bundle size
ls -lh dist/

# Analyze bundle
npx vite-bundle-visualizer
```

## 📝 Reporting Issues

When you find issues during testing:

1. **Document the issue:**
   - Template/extension used
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages
   - Environment (Node version, OS, etc.)

2. **Check existing issues:**
   - Search GitHub issues
   - Check if already reported

3. **Create new issue:**
   - Use issue templates
   - Provide complete information
   - Include reproduction steps
   - Add relevant logs/screenshots

## 🎓 Learning Resources

- [create-awesome-node-app on NPM](https://www.npmjs.com/package/create-awesome-node-app)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [ESLint Documentation](https://eslint.org/)

---

Happy Testing! 🧪✨
