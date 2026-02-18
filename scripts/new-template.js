#!/usr/bin/env node

/**
 * Interactive script to create a new template
 * Usage: node scripts/new-template.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const TEMPLATES_JSON = path.join(__dirname, '..', 'templates.json');

async function main() {
  console.log('🎨 Create New Template\n');

  // Gather information
  const name = await question('Template name (e.g., "Vue Starter"): ');
  const slug = await question('Template slug (e.g., "vue-starter"): ');
  const description = await question('Brief description: ');
  const type = await question('Template type (e.g., "vue"): ');
  const category = await question('Category slug (e.g., "frontend-applications"): ');
  const labels = (await question('Labels (comma-separated): ')).split(',').map(l => l.trim());

  // Create directory structure
  const templateDir = path.join(TEMPLATES_DIR, slug);
  
  if (fs.existsSync(templateDir)) {
    console.error(`\n❌ Template directory already exists: ${slug}`);
    rl.close();
    return;
  }

  console.log(`\n📁 Creating template directory: ${slug}`);
  
  // Create directories
  fs.mkdirSync(path.join(templateDir), { recursive: true });
  fs.mkdirSync(path.join(templateDir, 'package'));
  fs.mkdirSync(path.join(templateDir, '[src]'));
  fs.mkdirSync(path.join(templateDir, 'docs'));
  fs.mkdirSync(path.join(templateDir, 'public'));

  // Create package files
  fs.writeFileSync(
    path.join(templateDir, 'package', 'index.js'),
    `const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  return {
    name: appName,
    version: "0.1.0",
    description: "${description}",
    engines: {
      node: ">=18.15",
    },
    scripts: {
      dev: "echo 'Add your dev script'",
      build: "echo 'Add your build script'",
      lint: "echo 'Add your lint script'",
      "lint:fix": "echo 'Add your lint:fix script'",
    },
    dependencies,
    devDependencies,
  };
};
`
  );

  fs.writeFileSync(
    path.join(templateDir, 'package', 'dependencies.js'),
    `module.exports = {
  // Add your runtime dependencies here
};
`
  );

  fs.writeFileSync(
    path.join(templateDir, 'package', 'devDependencies.js'),
    `module.exports = {
  // Add your development dependencies here
};
`
  );

  // Create README template
  fs.writeFileSync(
    path.join(templateDir, 'README.md.template'),
    `# <%= projectName %>

This project was generated using [create-awesome-node-app](https://www.npmjs.com/package/create-awesome-node-app).

## Features

- Feature 1
- Feature 2
- Feature 3

## Getting Started

\`\`\`bash
<%= installCommand %>
<%= runCommand %> dev
\`\`\`

## Available Scripts

| \`<%= runCommand %> <script>\` | Description |
| --- | --- |
| \`dev\` | Start development server |
| \`build\` | Build for production |
| \`lint\` | Run linter |
| \`lint:fix\` | Fix linting issues |

## Documentation

See the [docs](./docs) folder for additional documentation.
`
  );

  // Create docs README
  fs.writeFileSync(
    path.join(templateDir, 'docs', 'README.md'),
    `# Documentation

Add detailed documentation for your template here.

## Topics

- Getting Started
- Configuration
- Architecture
- Best Practices
`
  );

  // Create .gitignore
  fs.writeFileSync(
    path.join(templateDir, '.gitignore'),
    `# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
build
dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`
  );

  // Create .env.example
  fs.writeFileSync(
    path.join(templateDir, '.env.example'),
    `# Environment Variables Example
# Copy this file to .env.local for local development

# Add your environment variables here
`
  );

  // Update templates.json
  const templatesData = JSON.parse(fs.readFileSync(TEMPLATES_JSON, 'utf8'));
  const newTemplate = {
    name,
    slug,
    description,
    url: `https://github.com/Create-Node-App/cna-templates/tree/main/templates/${slug}`,
    type,
    category,
    labels,
  };

  templatesData.templates.push(newTemplate);
  fs.writeFileSync(TEMPLATES_JSON, JSON.stringify(templatesData, null, 2));

  console.log('\n✅ Template created successfully!\n');
  console.log('📝 Next steps:');
  console.log(`  1. Add dependencies to templates/${slug}/package/dependencies.js`);
  console.log(`  2. Add devDependencies to templates/${slug}/package/devDependencies.js`);
  console.log(`  3. Update package/index.js with your scripts`);
  console.log(`  4. Add source files to templates/${slug}/[src]/`);
  console.log(`  5. Update README.md.template with detailed info`);
  console.log(`  6. Add documentation to templates/${slug}/docs/`);
  console.log(`  7. Run: node scripts/validate-templates.js`);
  console.log(`  8. Test: npx create-awesome-node-app --template ${slug}`);

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
