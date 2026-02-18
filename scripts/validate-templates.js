#!/usr/bin/env node

/**
 * Validation script for templates.json
 * Checks for common issues like:
 * - Duplicate slugs
 * - Invalid JSON structure
 * - Missing required fields
 * - Invalid URLs
 * - Broken references
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_PATH = path.join(__dirname, '..', 'templates.json');
const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

let hasErrors = false;
let hasWarnings = false;

function error(message) {
  console.error(`❌ ERROR: ${message}`);
  hasErrors = true;
}

function warning(message) {
  console.warn(`⚠️  WARNING: ${message}`);
  hasWarnings = true;
}

function success(message) {
  console.log(`✅ ${message}`);
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

function validateJSON() {
  info('Validating JSON syntax...');
  try {
    const data = fs.readFileSync(TEMPLATES_PATH, 'utf8');
    JSON.parse(data);
    success('JSON syntax is valid');
    return JSON.parse(data);
  } catch (err) {
    error(`Invalid JSON: ${err.message}`);
    return null;
  }
}

function validateDuplicateSlugs(data) {
  info('Checking for duplicate slugs...');
  
  const templateSlugs = new Map();
  const extensionSlugs = new Map();
  
  // Check templates
  data.templates.forEach((template, index) => {
    if (templateSlugs.has(template.slug)) {
      error(`Duplicate template slug "${template.slug}" at indices ${templateSlugs.get(template.slug)} and ${index}`);
    } else {
      templateSlugs.set(template.slug, index);
    }
  });
  
  // Check extensions
  data.extensions.forEach((extension, index) => {
    if (extensionSlugs.has(extension.slug)) {
      error(`Duplicate extension slug "${extension.slug}" at indices ${extensionSlugs.get(extension.slug)} and ${index}`);
    } else {
      extensionSlugs.set(extension.slug, index);
    }
  });
  
  if (!hasErrors) {
    success(`No duplicate slugs found (${templateSlugs.size} templates, ${extensionSlugs.size} extensions)`);
  }
}

function validateRequiredFields(data) {
  info('Checking required fields...');
  
  const requiredFields = ['name', 'slug', 'description', 'url', 'type', 'category', 'labels'];
  
  data.templates.forEach((template, index) => {
    requiredFields.forEach(field => {
      if (!template[field]) {
        error(`Template at index ${index} (slug: ${template.slug || 'unknown'}) is missing required field: ${field}`);
      }
    });
  });
  
  data.extensions.forEach((extension, index) => {
    requiredFields.forEach(field => {
      if (!extension[field]) {
        error(`Extension at index ${index} (slug: ${extension.slug || 'unknown'}) is missing required field: ${field}`);
      }
    });
  });
  
  if (!hasErrors) {
    success('All required fields present');
  }
}

function validateURLs(data) {
  info('Validating URLs...');
  
  data.templates.forEach((template) => {
    try {
      new URL(template.url);
    } catch (err) {
      error(`Template "${template.slug}" has invalid URL: ${template.url}`);
    }
  });
  
  data.extensions.forEach((extension) => {
    try {
      new URL(extension.url);
    } catch (err) {
      error(`Extension "${extension.slug}" has invalid URL: ${extension.url}`);
    }
  });
  
  if (!hasErrors) {
    success('All URLs are valid');
  }
}

function validateDirectoryReferences(data) {
  info('Checking if template/extension directories exist...');
  
  data.templates.forEach((template) => {
    const match = template.url.match(/\/templates\/([^\/]+)/);
    if (match) {
      const dir = path.join(TEMPLATES_DIR, match[1]);
      if (!fs.existsSync(dir)) {
        error(`Template "${template.slug}" references non-existent directory: ${match[1]}`);
      }
    } else {
      warning(`Template "${template.slug}" has URL that doesn't match expected pattern`);
    }
  });
  
  data.extensions.forEach((extension) => {
    const match = extension.url.match(/\/extensions\/([^\/]+)/);
    if (match) {
      const dir = path.join(EXTENSIONS_DIR, match[1]);
      if (!fs.existsSync(dir)) {
        error(`Extension "${extension.slug}" references non-existent directory: ${match[1]}`);
      }
    } else {
      warning(`Extension "${extension.slug}" has URL that doesn't match expected pattern`);
    }
  });
  
  if (!hasErrors) {
    success('All directory references are valid');
  }
}

function validateTypes(data) {
  info('Validating type consistency...');
  
  const templateTypes = new Set();
  data.templates.forEach(template => {
    if (Array.isArray(template.type)) {
      template.type.forEach(t => templateTypes.add(t));
    } else {
      templateTypes.add(template.type);
    }
  });
  
  data.extensions.forEach(extension => {
    const extTypes = Array.isArray(extension.type) ? extension.type : [extension.type];
    extTypes.forEach(extType => {
      if (!templateTypes.has(extType)) {
        warning(`Extension "${extension.slug}" has type "${extType}" that doesn't match any template type`);
      }
    });
  });
  
  if (!hasWarnings) {
    success(`Type consistency validated (${templateTypes.size} unique types found)`);
  }
}

function validateCategories(data) {
  info('Validating categories...');
  
  const definedCategories = new Set(data.categories.map(c => c.slug));
  
  data.templates.forEach(template => {
    if (!definedCategories.has(template.category)) {
      warning(`Template "${template.slug}" uses undefined category: ${template.category}`);
    }
  });
  
  if (!hasWarnings) {
    success('Category validation passed');
  }
}

function main() {
  console.log('🔍 Validating templates.json...\n');
  
  const data = validateJSON();
  if (!data) {
    console.log('\n❌ Validation failed due to JSON syntax errors');
    process.exit(1);
  }
  
  validateDuplicateSlugs(data);
  validateRequiredFields(data);
  validateURLs(data);
  validateDirectoryReferences(data);
  validateTypes(data);
  validateCategories(data);
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.log('❌ Validation failed with errors');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Validation passed with warnings');
    process.exit(0);
  } else {
    console.log('✅ All validations passed!');
    process.exit(0);
  }
}

main();
