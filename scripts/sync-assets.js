#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SHARED_ASSETS = path.join(__dirname, '..', 'shared', 'assets');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

const assetMap = [
  // { asset: source, targetPath: relative to template dir }
  { asset: 'logo-mark.svg', targetPath: 'public/logo.svg' },
  { asset: 'favicon.svg', targetPath: 'public/favicon.svg' },
];

const templateOverrides = {
  'webextension-react-vite-starter': [
    { asset: 'logo-mark.svg', targetPath: '[src]/assets/img/logo.svg' },
  ],
  'nextjs-starter': [
    { asset: 'logo-mark.svg', targetPath: 'public/logo.svg' },
    { asset: 'favicon.svg', targetPath: '[src]/app/favicon.svg' },
  ],
  'nextjs-saas-ai-starter': [
    { asset: 'logo-mark.svg', targetPath: 'public/logo.svg' },
  ],
};

function syncAssets() {
  const templates = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let copied = 0;
  let errors = 0;

  for (const template of templates) {
    const templateDir = path.join(TEMPLATES_DIR, template);
    const overrides = templateOverrides[template] || [];

    const mappings = [...assetMap, ...overrides];

    for (const { asset, targetPath } of mappings) {
      const sourceFile = path.join(SHARED_ASSETS, asset);
      const targetFile = path.join(templateDir, targetPath);

      if (!fs.existsSync(sourceFile)) {
        console.error(`  SKIP  ${asset} → ${template}/${targetPath} (source not found)`);
        errors++;
        continue;
      }

      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      try {
        fs.copyFileSync(sourceFile, targetFile);
        console.log(`  COPY  ${asset} → ${template}/${targetPath}`);
        copied++;
      } catch (err) {
        console.error(`  FAIL  ${asset} → ${template}/${targetPath}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone: ${copied} asset(s) copied, ${errors} error(s).`);
  process.exit(errors > 0 ? 1 : 0);
}

syncAssets();
