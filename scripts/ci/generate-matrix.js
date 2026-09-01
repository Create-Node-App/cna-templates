#!/usr/bin/env node
'use strict';

/**
 * Generate GitHub Actions matrices for layered CI (see #309).
 *
 * Usage:
 *   node scripts/ci/generate-matrix.js --layer templates
 *   node scripts/ci/generate-matrix.js --layer extensions [--changed-only]
 *   node scripts/ci/generate-matrix.js --layer profiles [--changed-only]
 *   node scripts/ci/generate-matrix.js --layer validate-profiles
 *
 * Prints a JSON array to stdout. When GITHUB_OUTPUT is set, also writes matrix=<json>.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  REPO_ROOT,
  loadRegistry,
  templateDir,
  extensionDir,
  asTypes,
  templateFileUrl,
  extensionFileUrl,
  canonicalTemplateDirForType,
  findTemplateByDir,
  loadProfiles,
  assertProfileValid,
} = require('./registry');

function parseArgs(argv) {
  const args = { layer: null, changedOnly: false, baseRef: 'origin/main' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--layer') args.layer = argv[++i];
    else if (a === '--changed-only') args.changedOnly = true;
    else if (a === '--base-ref') args.baseRef = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function changedPaths(baseRef) {
  try {
    const out = execSync(`git diff --name-only ${baseRef}...HEAD`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    return out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function forceFullMatrix(changed) {
  const triggers = [
    'templates.json',
    'scripts/ci/',
    'ci/profiles/',
    '.github/workflows/ci-',
  ];
  return changed.some((p) => triggers.some((t) => p === t || p.startsWith(t)));
}

function matrixTemplates(registry) {
  return registry.templates.map((template) => {
    const dir = templateDir(template);
    return {
      id: `L1 · ${dir}`,
      slug: template.slug,
      templateDir: dir,
      templateUrl: templateFileUrl(REPO_ROOT, template),
      addons: [],
    };
  });
}

function matrixExtensions(registry, { changedOnly, baseRef }) {
  const changed = changedOnly ? changedPaths(baseRef) : [];
  const full = !changedOnly || forceFullMatrix(changed);
  const changedExtDirs = new Set(
    changed
      .filter((p) => p.startsWith('extensions/'))
      .map((p) => p.split('/')[1])
      .filter(Boolean),
  );

  const cells = [];
  const seen = new Set();
  for (const extension of registry.extensions) {
    const dir = extensionDir(extension);
    if (!full && !changedExtDirs.has(dir)) continue;

    for (const type of asTypes(extension.type)) {
      const canonicalDir = canonicalTemplateDirForType(type);
      if (!canonicalDir) continue;
      const template = findTemplateByDir(registry, canonicalDir);
      if (!template) continue;

      const key = `${extension.slug}@@${canonicalDir}`;
      if (seen.has(key)) continue;
      seen.add(key);

      cells.push({
        id: `L2 · ${extension.slug} @ ${canonicalDir}`,
        slug: extension.slug,
        extensionDir: dir,
        templateDir: canonicalDir,
        templateUrl: templateFileUrl(REPO_ROOT, template),
        addons: [extensionFileUrl(REPO_ROOT, extension)],
        type,
      });
    }
  }
  return cells;
}

function matrixProfiles(registry, { changedOnly, baseRef }) {
  const profiles = loadProfiles();
  const changed = changedOnly ? changedPaths(baseRef) : [];
  const full = !changedOnly || forceFullMatrix(changed);

  const cells = [];
  for (const profile of profiles) {
    const { template, addons } = assertProfileValid(registry, profile);

    if (!full) {
      const touchedTemplate = changed.some((p) =>
        p.startsWith(`templates/${profile.templateDir}/`),
      );
      const touchedAddon = addons.some((ext) =>
        changed.some((p) => p.startsWith(`extensions/${extensionDir(ext)}/`)),
      );
      const touchedProfile = changed.some((p) => p === `ci/profiles/${profile._file}`);
      if (!touchedTemplate && !touchedAddon && !touchedProfile) continue;
    }

    cells.push({
      id: `L3 · ${profile.id}`,
      profileId: profile.id,
      templateDir: profile.templateDir,
      templateUrl: templateFileUrl(REPO_ROOT, template),
      addons: addons.map((ext) => extensionFileUrl(REPO_ROOT, ext)),
      sets: profile.sets || {},
    });
  }
  return cells;
}

function validateAllProfiles(registry) {
  const profiles = loadProfiles();
  for (const profile of profiles) {
    assertProfileValid(registry, profile);
    console.error(`✅ profile ${profile.id}`);
  }
  console.error(`Validated ${profiles.length} profiles`);
  return [];
}

function writeOutput(matrix) {
  const json = JSON.stringify(matrix);
  process.stdout.write(json + '\n');
  if (process.env.GITHUB_OUTPUT) {
    // Multiline-safe delimiter for GitHub Actions
    const delim = 'MATRIX_EOF';
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `matrix<<${delim}\n${json}\n${delim}\n`,
    );
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `count=${matrix.length}\n`);
  }
  console.error(`Generated ${matrix.length} matrix cell(s)`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.layer) {
    console.error(`Usage: node scripts/ci/generate-matrix.js --layer <templates|extensions|profiles|validate-profiles> [--changed-only]`);
    process.exit(args.help ? 0 : 1);
  }

  const registry = loadRegistry();
  let matrix;
  switch (args.layer) {
    case 'templates':
      matrix = matrixTemplates(registry);
      break;
    case 'extensions':
      matrix = matrixExtensions(registry, args);
      break;
    case 'profiles':
      matrix = matrixProfiles(registry, args);
      break;
    case 'validate-profiles':
      matrix = validateAllProfiles(registry);
      break;
    default:
      console.error(`Unknown layer: ${args.layer}`);
      process.exit(1);
  }

  writeOutput(matrix);
}

main();
