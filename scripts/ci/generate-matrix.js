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
 *   node scripts/ci/generate-matrix.js --layer validate-incompat
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
  hasIncompatibility,
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
    const paths = out.split('\n').map((s) => s.trim()).filter(Boolean);
    console.error(`Changed paths vs ${baseRef}: ${paths.length} file(s)`);
    return paths;
  } catch {
    // Fail toward FULL coverage, never toward an empty matrix: a generator
    // that cannot determine changed files must test everything (refs #381).
    // An empty matrix would skip all jobs and report green (false positive).
    console.error(
      `⚠ cannot diff ${baseRef}...HEAD (e.g. shallow fetch with no merge base) — falling back to FULL matrix`,
    );
    return null;
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
  const full = !changedOnly || changed === null || forceFullMatrix(changed || []);
  const changedExtDirs = new Set(
    (changed || [])
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
  const full = !changedOnly || changed === null || forceFullMatrix(changed || []);
  const changedList = changed || [];

  const cells = [];
  for (const profile of profiles) {
    const { template, addons } = assertProfileValid(registry, profile);

    if (!full) {
      const touchedTemplate = changedList.some((p) =>
        p.startsWith(`templates/${profile.templateDir}/`),
      );
      const touchedAddon = addons.some((ext) =>
        changedList.some((p) => p.startsWith(`extensions/${extensionDir(ext)}/`)),
      );
      const touchedProfile = changedList.some((p) => p === `ci/profiles/${profile._file}`);
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

/**
 * Validate the incompatibleWith matrix (refs #402).
 *
 * For every declared incompatibleWith pair:
 *   - negative control: hasIncompatibility() must flag the pair as blocked;
 *   - the pair must share at least one template type (otherwise blocking it
 *     is meaningless because the two extensions can never meet).
 * For every extension declaring incompatibilities:
 *   - positive control: at least one same-type extension must remain allowed,
 *     proving the block list is not overbroad.
 * TEMPLATE+0 cells are covered by the templates layer (L1); this layer only
 * validates pair semantics, so it stays fast on every PR.
 */
function validateIncompat(registry) {
  const bySlug = new Map(registry.extensions.map((e) => [e.slug, e]));
  const failures = [];
  let negatives = 0;
  let positives = 0;

  for (const ext of registry.extensions) {
    const listed = ext.incompatibleWith || [];
    for (const otherSlug of listed) {
      const other = bySlug.get(otherSlug);
      if (!other) {
        failures.push(`${ext.slug} lists unknown slug "${otherSlug}"`);
        continue;
      }
      if (!hasIncompatibility([ext], other)) {
        failures.push(
          `negative control failed: ${ext.slug} + ${otherSlug} not detected as incompatible`,
        );
        continue;
      }
      negatives += 1;
      const otherTypes = new Set(asTypes(other.type));
      const shared = asTypes(ext.type).filter((t) => otherTypes.has(t));
      if (shared.length === 0) {
        failures.push(
          `${ext.slug} + ${otherSlug} share no template type (negative test is meaningless)`,
        );
      }
    }

    if (listed.length > 0) {
      const myTypes = new Set(asTypes(ext.type));
      const partner = registry.extensions.find(
        (cand) =>
          cand.slug !== ext.slug &&
          !listed.includes(cand.slug) &&
          !(cand.incompatibleWith || []).includes(ext.slug) &&
          asTypes(cand.type).some((t) => myTypes.has(t)),
      );
      if (!partner) {
        failures.push(
          `${ext.slug}: no allowed same-type partner found (incompatibleWith blocks everything)`,
        );
      } else if (hasIncompatibility([ext], partner)) {
        failures.push(
          `positive control failed: ${ext.slug} + ${partner.slug} flagged incompatible`,
        );
      } else {
        positives += 1;
        console.error(`✅ positive control: ${ext.slug} + ${partner.slug} allowed`);
      }
    }
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(`❌ ${f}`);
    console.error(
      `incompatibleWith matrix INVALID (${negatives} negative / ${positives} positive controls held)`,
    );
    process.exit(1);
  }
  console.error(
    `incompatibleWith matrix valid (${negatives} negative / ${positives} positive controls)`,
  );
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
    console.error(`Usage: node scripts/ci/generate-matrix.js --layer <templates|extensions|profiles|validate-profiles|validate-incompat> [--changed-only]`);
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
    case 'validate-incompat':
      matrix = validateIncompat(registry);
      break;
    default:
      console.error(`Unknown layer: ${args.layer}`);
      process.exit(1);
  }

  writeOutput(matrix);
}

main();
