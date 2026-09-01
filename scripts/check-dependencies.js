#!/usr/bin/env node

/**
 * Check for dependency issues across all templates and extensions
 * Usage: node scripts/check-dependencies.js
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions');

let hasIssues = false;

function info(message) {
  console.log(`ℹ️  ${message}`);
}

function warning(message) {
  console.warn(`⚠️  WARNING: ${message}`);
  hasIssues = true;
}

function success(message) {
  console.log(`✅ ${message}`);
}

function checkPackageFile(filePath, context) {
  if (!fs.existsSync(filePath)) {
    warning(`${context}: package file not found at ${filePath}`);
    return null;
  }

  try {
    if (filePath.endsWith('.json')) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else if (filePath.endsWith('.js')) {
      return require(filePath);
    }
  } catch (err) {
    warning(`${context}: Failed to parse ${filePath} - ${err.message}`);
    return null;
  }
}

function checkTemplates() {
  info('Checking templates...');
  
  const templates = fs.readdirSync(TEMPLATES_DIR)
    .filter(name => fs.statSync(path.join(TEMPLATES_DIR, name)).isDirectory());

  templates.forEach(templateName => {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    const packagePath = path.join(templatePath, 'package');

    if (!fs.existsSync(packagePath)) {
      warning(`Template "${templateName}": No package directory found`);
      return;
    }

    // Check package/index.js
    const indexPath = path.join(packagePath, 'index.js');
    if (!fs.existsSync(indexPath)) {
      warning(`Template "${templateName}": Missing package/index.js`);
    }

    // Check dependencies files
    const depsPath = path.join(packagePath, 'dependencies.js');
    const devDepsPath = path.join(packagePath, 'devDependencies.js');

    const deps = checkPackageFile(depsPath, `Template "${templateName}"`);
    const devDeps = checkPackageFile(devDepsPath, `Template "${templateName}"`);

    if (deps && Object.keys(deps).length === 0) {
      warning(`Template "${templateName}": No dependencies defined`);
    }

    if (devDeps && Object.keys(devDeps).length === 0) {
      warning(`Template "${templateName}": No devDependencies defined`);
    }

    // Check for .env.example
    const envExample = path.join(templatePath, '.env.example');
    if (!fs.existsSync(envExample)) {
      warning(`Template "${templateName}": Missing .env.example file`);
    } else {
      const content = fs.readFileSync(envExample, 'utf8');
      if (content.trim().length === 0) {
        warning(`Template "${templateName}": .env.example is empty`);
      }
    }

    // Check for README
    const readme = path.join(templatePath, 'README.md.template');
    if (!fs.existsSync(readme)) {
      warning(`Template "${templateName}": Missing README.md.template`);
    }

    // Check for docs
    const docs = path.join(templatePath, 'docs', 'README.md');
    if (!fs.existsSync(docs)) {
      warning(`Template "${templateName}": Missing docs/README.md`);
    }
  });

  success(`Checked ${templates.length} templates`);
}

function checkExtensions() {
  info('Checking extensions...');
  
  const extensions = fs.readdirSync(EXTENSIONS_DIR)
    .filter(name => fs.statSync(path.join(EXTENSIONS_DIR, name)).isDirectory());

  extensions.forEach(extensionName => {
    const extensionPath = path.join(EXTENSIONS_DIR, extensionName);
    const packagePath = path.join(extensionPath, 'package.json');

    // Check package.json
    const pkg = checkPackageFile(packagePath, `Extension "${extensionName}"`);

    if (!pkg) {
      warning(`Extension "${extensionName}": Missing package.json`);
      return;
    }

    if (!pkg.dependencies && !pkg.devDependencies) {
      warning(`Extension "${extensionName}": No dependencies defined in package.json`);
    }

    // Check for README
    const readme = path.join(extensionPath, 'README.md');
    if (!fs.existsSync(readme)) {
      warning(`Extension "${extensionName}": Missing README.md`);
    }

    // Check for [src] directory
    const srcDir = path.join(extensionPath, '[src]');
    if (!fs.existsSync(srcDir)) {
      warning(`Extension "${extensionName}": Missing [src] directory`);
    }
  });

  success(`Checked ${extensions.length} extensions`);
}

function checkCommonIssues() {
  info('Checking for common dependency issues...');

  const templates = fs.readdirSync(TEMPLATES_DIR)
    .filter(name => fs.statSync(path.join(TEMPLATES_DIR, name)).isDirectory());

  // Check for deprecated packages
  const deprecatedPackages = {
    '@types/react-router': 'Use React Router v7 built-in types',
    '@types/react-router-dom': 'Use React Router v7 built-in types (< v7)',
    'eslint-config-prettier': 'Check compatibility with ESLint v9',
  };

  templates.forEach(templateName => {
    const devDepsPath = path.join(TEMPLATES_DIR, templateName, 'package', 'devDependencies.js');
    if (fs.existsSync(devDepsPath)) {
      const devDeps = require(devDepsPath);
      Object.keys(deprecatedPackages).forEach(pkg => {
        if (devDeps[pkg]) {
          warning(`Template "${templateName}": Uses ${pkg} - ${deprecatedPackages[pkg]}`);
        }
      });
    }
  });
}

function main() {
  console.log('🔍 Checking dependencies across templates and extensions...\n');

  checkTemplates();
  console.log();
  checkExtensions();
  console.log();
  checkCommonIssues();

  console.log('\n' + '='.repeat(50));

  if (hasIssues) {
    console.log('⚠️  Found issues that should be reviewed');
    process.exit(0); // Don't fail, just warn
  } else {
    console.log('✅ No issues found!');
    process.exit(0);
  }
}

main();
