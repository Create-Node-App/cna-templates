#!/usr/bin/env node

/**
 * Interactive script to create a new extension
 * Usage: node scripts/new-extension.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions');
const TEMPLATES_JSON = path.join(__dirname, '..', 'templates.json');

async function main() {
  console.log('🔌 Create New Extension\n');

  // Gather information
  const name = await question('Extension name (e.g., "Redux Toolkit"): ');
  const slug = await question('Extension slug (e.g., "redux-toolkit"): ');
  const description = await question('Brief description: ');
  const typesInput = await question('Compatible types (comma-separated, e.g., "react,nextjs"): ');
  const types = typesInput.split(',').map(t => t.trim());
  const category = await question('Category (e.g., "State Management"): ');
  const labels = (await question('Labels (comma-separated): ')).split(',').map(l => l.trim());

  // Create directory structure
  const extensionDir = path.join(EXTENSIONS_DIR, slug);
  
  if (fs.existsSync(extensionDir)) {
    console.error(`\n❌ Extension directory already exists: ${slug}`);
    rl.close();
    return;
  }

  console.log(`\n📁 Creating extension directory: ${slug}`);
  
  // Create directories
  fs.mkdirSync(path.join(extensionDir), { recursive: true });
  fs.mkdirSync(path.join(extensionDir, '[src]'));
  fs.mkdirSync(path.join(extensionDir, 'docs'));

  // Create package.json
  fs.writeFileSync(
    path.join(extensionDir, 'package.json'),
    JSON.stringify({
      dependencies: {
        // Add your dependencies here
      },
      devDependencies: {
        // Add your dev dependencies here
      }
    }, null, 2)
  );

  // Create README
  fs.writeFileSync(
    path.join(extensionDir, 'README.md'),
    `# ${name} Extension

This extension adds ${name} to your project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

### Basic Example

\`\`\`typescript
// Add usage examples here
\`\`\`

## Configuration

Explain any configuration needed.

## Documentation

See [${name} Documentation](https://example.com) for more details.

## Resources

- [Official Documentation](https://example.com)
- [Examples](https://example.com/examples)
`
  );

  // Create docs append file
  fs.writeFileSync(
    path.join(extensionDir, 'docs', 'README.md.append'),
    `
## ${name}

This project includes [${name}](https://example.com).

### Quick Start

\`\`\`bash
# Add quick start commands here
\`\`\`

### Learn More

- [${name} Documentation](https://example.com)
`
  );

  // Create example source file
  fs.mkdirSync(path.join(extensionDir, '[src]', 'components'), { recursive: true });
  fs.writeFileSync(
    path.join(extensionDir, '[src]', 'components', 'Example.tsx'),
    `import React from 'react';

export function Example() {
  return (
    <div>
      <h1>${name} Example Component</h1>
      <p>Replace this with your actual component implementation.</p>
    </div>
  );
}
`
  );

  // Update templates.json
  const templatesData = JSON.parse(fs.readFileSync(TEMPLATES_JSON, 'utf8'));
  const newExtension = {
    name,
    slug,
    description,
    url: `https://github.com/Create-Node-App/cna-templates/tree/main/extensions/${slug}`,
    type: types.length === 1 ? types[0] : types,
    category,
    labels,
  };

  templatesData.extensions.push(newExtension);
  fs.writeFileSync(TEMPLATES_JSON, JSON.stringify(templatesData, null, 2));

  console.log('\n✅ Extension created successfully!\n');
  console.log('📝 Next steps:');
  console.log(`  1. Add dependencies to extensions/${slug}/package.json`);
  console.log(`  2. Add implementation files to extensions/${slug}/[src]/`);
  console.log(`  3. Update README.md with detailed usage instructions`);
  console.log(`  4. Update docs/README.md.append with project-specific info`);
  console.log(`  5. Run: node scripts/validate-templates.js`);
  console.log(`  6. Test with: npx create-awesome-node-app --template react-vite-boilerplate --addons ${slug}`);

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
