'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const TEMPLATES_JSON = path.join(REPO_ROOT, 'templates.json');
const PROFILES_DIR = path.join(REPO_ROOT, 'ci', 'profiles');

/** Canonical template directory per extension `type`. */
const CANONICAL_TEMPLATE_BY_TYPE = {
  react: 'react-vite-starter',
  nextjs: 'nextjs-starter',
  'nestjs-backend': 'nestjs-starter',
  monorepo: 'turborepo-starter',
  'webextension-react': 'webextension-react-vite-starter',
  webdriverio: 'wdio-starter',
  'nextjs-saas-ai': 'nextjs-saas-ai-starter',
  remix: 'remix-starter',
  astro: 'astro-starter',
  hono: 'hono-starter',
  backend: 'nestjs-starter',
  sls: 'nestjs-starter',
};

function loadRegistry() {
  return JSON.parse(fs.readFileSync(TEMPLATES_JSON, 'utf8'));
}

function dirFromUrl(url, kind) {
  const re =
    kind === 'template'
      ? /\/templates\/([^/]+)(?:\/|$)/
      : /\/extensions\/([^/]+)(?:\/|$)/;
  const match = String(url || '').match(re);
  return match ? match[1] : null;
}

function templateDir(template) {
  return dirFromUrl(template.url, 'template');
}

function extensionDir(extension) {
  return dirFromUrl(extension.url, 'extension');
}

function asTypes(typeField) {
  return Array.isArray(typeField) ? typeField : [typeField];
}

function fileUrl(repoRoot, relativePath) {
  const absolute = path.resolve(repoRoot, relativePath);
  return `file://${absolute}`;
}

function templateFileUrl(repoRoot, template) {
  const dir = templateDir(template);
  if (!dir) {
    throw new Error(`Cannot resolve directory for template slug=${template.slug}`);
  }
  return fileUrl(repoRoot, path.join('templates', dir));
}

function extensionFileUrl(repoRoot, extension) {
  const dir = extensionDir(extension);
  if (!dir) {
    throw new Error(`Cannot resolve directory for extension slug=${extension.slug}`);
  }
  return fileUrl(repoRoot, path.join('extensions', dir));
}

function canonicalTemplateDirForType(type) {
  return CANONICAL_TEMPLATE_BY_TYPE[type] || null;
}

function findTemplateByDir(registry, dir) {
  return registry.templates.find((t) => templateDir(t) === dir) || null;
}

function hasIncompatibility(selected, candidate) {
  const candidateSlugs = new Set([candidate.slug]);
  const selectedSlugs = new Set(selected.map((e) => e.slug));
  for (const ext of selected) {
    const incompatible = ext.incompatibleWith || [];
    if (incompatible.some((s) => candidateSlugs.has(s))) return true;
    const candidateIncompatible = candidate.incompatibleWith || [];
    if (candidateIncompatible.some((s) => selectedSlugs.has(s))) return true;
  }
  return false;
}

function loadProfiles() {
  if (!fs.existsSync(PROFILES_DIR)) return [];
  return fs
    .readdirSync(PROFILES_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const full = path.join(PROFILES_DIR, file);
      const profile = JSON.parse(fs.readFileSync(full, 'utf8'));
      return { ...profile, _file: file };
    });
}

function resolveProfileAddons(registry, profile) {
  return (profile.addons || []).map((slug) => {
    const ext = registry.extensions.find((e) => e.slug === slug);
    if (!ext) {
      throw new Error(`Profile ${profile.id}: unknown addon slug "${slug}"`);
    }
    return ext;
  });
}

function assertProfileValid(registry, profile) {
  const template = registry.templates.find((t) => templateDir(t) === profile.templateDir);
  if (!template) {
    throw new Error(`Profile ${profile.id}: unknown templateDir "${profile.templateDir}"`);
  }
  const addons = resolveProfileAddons(registry, profile);
  const categories = new Map();
  for (const ext of addons) {
    if (categories.has(ext.category)) {
      throw new Error(
        `Profile ${profile.id}: category "${ext.category}" used twice (${categories.get(ext.category)} and ${ext.slug})`,
      );
    }
    categories.set(ext.category, ext.slug);
  }
  const selected = [];
  for (const ext of addons) {
    if (hasIncompatibility(selected, ext)) {
      throw new Error(`Profile ${profile.id}: incompatible addons involving ${ext.slug}`);
    }
    selected.push(ext);
  }
  return { template, addons };
}

module.exports = {
  REPO_ROOT,
  TEMPLATES_JSON,
  PROFILES_DIR,
  CANONICAL_TEMPLATE_BY_TYPE,
  loadRegistry,
  dirFromUrl,
  templateDir,
  extensionDir,
  asTypes,
  fileUrl,
  templateFileUrl,
  extensionFileUrl,
  canonicalTemplateDirForType,
  findTemplateByDir,
  hasIncompatibility,
  loadProfiles,
  resolveProfileAddons,
  assertProfileValid,
};
