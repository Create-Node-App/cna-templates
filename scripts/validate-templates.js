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
const SCHEMA_PATH = path.join(__dirname, '..', 'templates.schema.json');
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
        error(`Extension "${extension.slug}" has type "${extType}" that doesn't match any template type`);
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

function validatePackageModuleConflict(data) {
  info('Checking package.json vs package/ conflicts...');

  data.templates.forEach((template) => {
    const match = template.url.match(/\/templates\/([^\/]+)/);
    if (!match) return;
    const dir = path.join(TEMPLATES_DIR, match[1]);
    const hasPkgJson = fs.existsSync(path.join(dir, 'package.json'));
    const hasPkgDir = fs.existsSync(path.join(dir, 'package', 'index.js')) ||
      fs.existsSync(path.join(dir, 'package.js'));
    if (hasPkgJson && hasPkgDir) {
      error(
        `Template "${template.slug}" has both package.json and package/ — ` +
          `Node resolves "package" to package.json and package/index.js never runs (breaks file:// CI)`,
      );
    }
  });

  if (!hasErrors) {
    success('No package.json / package/ conflicts');
  }
}

function validateIncompatibleSymmetry(data) {
  info('Checking incompatibleWith symmetry...');

  const bySlug = new Map(data.extensions.map((e) => [e.slug, e]));
  data.extensions.forEach((extension) => {
    const listed = extension.incompatibleWith || [];
    listed.forEach((otherSlug) => {
      const other = bySlug.get(otherSlug);
      if (!other) {
        error(
          `Extension "${extension.slug}" lists incompatibleWith "${otherSlug}" but that slug does not exist`,
        );
        return;
      }
      const reverse = other.incompatibleWith || [];
      if (!reverse.includes(extension.slug)) {
        warning(
          `Extension "${extension.slug}" → "${otherSlug}" is not symmetric (add "${extension.slug}" to "${otherSlug}".incompatibleWith)`,
        );
      }
    });
  });

  if (!hasErrors) {
    success('incompatibleWith references validated');
  }
}

function validateJsonSchema(data) {
  info('Validating against templates.schema.json (draft-04)...');

  if (!fs.existsSync(SCHEMA_PATH)) {
    warning(`Schema file not found at ${SCHEMA_PATH} — skipping JSON Schema validation`);
    return;
  }

  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  } catch (err) {
    error(`Failed to read/parse schema: ${err.message}`);
    return;
  }

  // Try AJV if available (optional dependency — not required for CI)
  try {
    const Ajv = require('ajv');
    // ajv v8 defaults to draft-07; use strict:false to allow draft-04 $schema
    const ajv = new Ajv({ allErrors: true, strict: false });
    // Add draft-04 meta-schema if ajv version needs it (ajv opts already lenient)
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      const details = (validate.errors || [])
        .map((e) => `${e.instancePath || '/'} ${e.message} (${JSON.stringify(e.params)})`)
        .join('; ');
      error(`templates.json does not conform to templates.schema.json: ${details}`);
    } else {
      success('JSON Schema validation passed (ajv)');
    }
    return;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND' || !String(err.message).includes('ajv')) {
      warning(`AJV validation attempt failed (${err.message}) — falling back to manual validation`);
    }
    // Fall through to manual validation when ajv not installed
  }

  // Lightweight manual validation mirroring templates.schema.json (draft-04)
  // Ensures L0 fails if templates.json violates required shape even without ajv.
  // Allow $schema for editor support even though schema has additionalProperties:false.
  const allowedTopKeys = new Set(['$schema', 'categories', 'templates', 'extensions']);
  const requiredTop = ['categories', 'templates', 'extensions'];

  for (const key of requiredTop) {
    if (!(key in data)) {
      error(`Missing required top-level key: ${key}`);
    }
  }
  for (const key of Object.keys(data)) {
    if (!allowedTopKeys.has(key)) {
      error(`Unknown top-level property "${key}" (schema additionalProperties: false)`);
    }
  }
  if (hasErrors) return;

  function isString(v) {
    return typeof v === 'string' && v.length > 0;
  }
  function isStringArray(v) {
    return Array.isArray(v) && v.every((x) => typeof x === 'string');
  }

  // categories: array of { slug, name, description, labels } (+ optional details/details)
  if (!Array.isArray(data.categories)) {
    error('categories must be an array');
  } else {
    data.categories.forEach((cat, i) => {
      for (const f of ['slug', 'name', 'description', 'labels']) {
        if (!(f in cat)) error(`categories[${i}] missing required field: ${f}`);
      }
      if ('slug' in cat && !isString(cat.slug)) error(`categories[${i}].slug must be a non-empty string`);
      if ('name' in cat && !isString(cat.name)) error(`categories[${i}].name must be a non-empty string`);
      if ('description' in cat && !isString(cat.description)) error(`categories[${i}].description must be a non-empty string`);
      if ('labels' in cat && !isStringArray(cat.labels)) error(`categories[${i}].labels must be array of strings`);
      if ('details' in cat && typeof cat.details !== 'string') error(`categories[${i}].details must be string`);
      const allowedCatKeys = new Set(['slug', 'name', 'description', 'details', 'labels']);
      for (const k of Object.keys(cat)) if (!allowedCatKeys.has(k)) error(`categories[${i}] has unknown property "${k}"`);
    });
  }

  // helper for template/extension entry
  function validateEntry(entry, idx, kind) {
    for (const f of ['name', 'slug', 'description', 'url', 'type', 'category', 'labels']) {
      if (!(f in entry)) error(`${kind}[${idx}] (${entry.slug || 'unknown'}) missing required field: ${f}`);
    }
    if ('name' in entry && !isString(entry.name)) error(`${kind}[${idx}].name must be non-empty string`);
    if ('slug' in entry && !isString(entry.slug)) error(`${kind}[${idx}].slug must be non-empty string`);
    if ('description' in entry && !isString(entry.description)) error(`${kind}[${idx}].description must be non-empty string`);
    if ('url' in entry && !isString(entry.url)) error(`${kind}[${idx}].url must be non-empty string`);
    if ('type' in entry) {
      const t = entry.type;
      const ok = isString(t) || (Array.isArray(t) && t.length > 0 && t.every(isString));
      if (!ok) error(`${kind}[${idx}].type must be string or array of non-empty strings`);
    }
    if ('category' in entry && !isString(entry.category)) error(`${kind}[${idx}].category must be non-empty string`);
    if ('labels' in entry && !isStringArray(entry.labels)) error(`${kind}[${idx}].labels must be array of strings`);
    if ('incompatibleWith' in entry && !isStringArray(entry.incompatibleWith)) error(`${kind}[${idx}].incompatibleWith must be array of strings`);
    const allowedKeys = new Set(['name', 'slug', 'description', 'url', 'type', 'category', 'labels', 'incompatibleWith']);
    for (const k of Object.keys(entry)) if (!allowedKeys.has(k)) error(`${kind}[${idx}] has unknown property "${k}"`);
  }

  if (!Array.isArray(data.templates)) error('templates must be an array');
  else data.templates.forEach((t, i) => validateEntry(t, i, 'templates'));

  if (!Array.isArray(data.extensions)) error('extensions must be an array');
  else data.extensions.forEach((e, i) => validateEntry(e, i, 'extensions'));

  if (!hasErrors) {
    success('JSON Schema validation passed (manual — templates.schema.json draft-04)');
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
  validatePackageModuleConflict(data);
  validateIncompatibleSymmetry(data);
  validateJsonSchema(data);
  
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
