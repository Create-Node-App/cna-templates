#!/usr/bin/env node
'use strict';

/**
 * Scaffold a template (+ optional addons) and run trustable health checks.
 *
 * Usage:
 *   node scripts/ci/run-scaffold-check.js \
 *     --template-url 'file:///.../templates/hono-starter' \
 *     [--addon-url 'file:///.../extensions/foo']... \
 *     [--set key=value]... \
 *     [--workdir /tmp/cna-check] \
 *     [--skip-test]
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { REPO_ROOT } = require('./registry');

function parseArgs(argv) {
  const args = {
    templateUrl: null,
    addonUrls: [],
    sets: [],
    workdir: path.join(REPO_ROOT, '.ci-scaffold'),
    projectName: 'scaffold-check',
    skipTest: false,
    skipBuild: false,
    keep: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--template-url') args.templateUrl = argv[++i];
    else if (a === '--addon-url') args.addonUrls.push(argv[++i]);
    else if (a === '--set') args.sets.push(argv[++i]);
    else if (a === '--workdir') args.workdir = argv[++i];
    else if (a === '--project-name') args.projectName = argv[++i];
    else if (a === '--skip-test') args.skipTest = true;
    else if (a === '--skip-build') args.skipBuild = true;
    else if (a === '--keep') args.keep = true;
  }
  return args;
}

function fail(phase, message, code = 1) {
  console.error(`\n❌ [${phase}] ${message}`);
  process.exit(code);
}

function run(phase, cmd, cmdArgs, options = {}) {
  console.log(`\n▶ [${phase}] ${cmd} ${cmdArgs.join(' ')}`);
  const result = spawnSync(cmd, cmdArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: 'true',
      FORCE_COLOR: '0',
      SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || 'true',
    },
    ...options,
  });
  if (result.error) {
    fail(phase, result.error.message);
  }
  if (result.status !== 0) {
    fail(phase, `command failed with exit code ${result.status}`, result.status || 1);
  }
}

function resolveFileTarget(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('file://')) {
    fail('scaffold', `URL must be file://, got: ${fileUrl}`);
  }
  const parsed = new URL(fileUrl);
  const pathname = decodeURIComponent(parsed.pathname);
  const subdir = parsed.searchParams.get('subdir');
  return subdir ? path.join(pathname, subdir) : pathname;
}

function assertTemplateUrlExists(templateUrl) {
  const target = resolveFileTarget(templateUrl);
  if (!fs.existsSync(target)) {
    fail(
      'scaffold',
      `template path does not exist: ${target}\n` +
        `  (refusing to continue — this is how empty scaffolds go green)`,
    );
  }
  if (!fs.statSync(target).isDirectory()) {
    fail('scaffold', `template path is not a directory: ${target}`);
  }
  console.log(`✅ [scaffold] template path exists: ${target}`);
}

function assertNonEmptyProject(projectRoot) {
  const pkgPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    fail('empty-guard', `missing package.json in ${projectRoot}`);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const depCount =
    Object.keys(pkg.dependencies || {}).length +
    Object.keys(pkg.devDependencies || {}).length;
  const hasWorkspaces = Boolean(
    (Array.isArray(pkg.workspaces) && pkg.workspaces.length) ||
      (pkg.workspaces && pkg.workspaces.packages),
  );
  const scripts = Object.keys(pkg.scripts || {});
  const meaningfulScripts = scripts.filter((s) =>
    ['dev', 'build', 'start', 'test', 'lint', 'type-check', 'format'].includes(s),
  );

  const entries = fs
    .readdirSync(projectRoot)
    .filter((name) => !['.git', 'node_modules', '.ci-meta.json'].includes(name));

  if (entries.length < 3 && depCount === 0 && !hasWorkspaces) {
    fail(
      'empty-guard',
      `scaffold looks empty (${entries.length} entries, 0 deps). ` +
        `Likely wrong template path / silent no-op copy.`,
    );
  }

  if (depCount === 0 && !hasWorkspaces && meaningfulScripts.length === 0) {
    fail(
      'empty-guard',
      `package.json has no dependencies/workspaces and no meaningful scripts — refusing green CI`,
    );
  }

  console.log(
    `✅ [empty-guard] project ok (${entries.length} top-level entries, ${depCount} deps, workspaces=${hasWorkspaces})`,
  );
}

function hasScript(projectRoot, script) {
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  return Boolean(pkg.scripts && pkg.scripts[script]);
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.templateUrl) {
    console.error('Missing --template-url');
    process.exit(1);
  }

  // Prefer explicit --project-name; also honor --set projectName=...
  for (const set of args.sets) {
    const m = /^projectName=(.+)$/.exec(set);
    if (m) args.projectName = m[1];
  }

  assertTemplateUrlExists(args.templateUrl);

  fs.rmSync(args.workdir, { recursive: true, force: true });
  fs.mkdirSync(args.workdir, { recursive: true });

  const projectRoot = path.join(args.workdir, args.projectName);

  const scaffoldArgs = [
    '--yes',
    'create-awesome-node-app@latest',
    args.projectName,
    '--no-interactive',
    '--no-install',
    '-t',
    args.templateUrl,
  ];
  if (args.addonUrls.length > 0) {
    scaffoldArgs.push('--addons', ...args.addonUrls);
  }
  for (const set of args.sets) {
    scaffoldArgs.push('--set', set);
  }

  run('scaffold', 'npx', scaffoldArgs, { cwd: args.workdir });

  if (!fs.existsSync(projectRoot)) {
    fail('scaffold', `expected project at ${projectRoot}`);
  }

  assertNonEmptyProject(projectRoot);

  run('install', 'npm', ['install'], { cwd: projectRoot });

  if (hasScript(projectRoot, 'format')) {
    console.log(`\n▶ [format] npm run format --if-present (soft)`);
    const formatResult = spawnSync('npm', ['run', 'format', '--if-present'], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true', FORCE_COLOR: '0' },
    });
    if (formatResult.status !== 0) {
      console.warn(
        `⚠ [format] failed with exit ${formatResult.status} — continuing (format is soft in CI)`,
      );
    }
  }

  if (hasScript(projectRoot, 'type-check')) {
    run('type-check', 'npm', ['run', 'type-check'], { cwd: projectRoot });
  } else {
    console.log('ℹ [type-check] skipped (script not present)');
  }

  if (!args.skipBuild) {
    if (hasScript(projectRoot, 'build')) {
      run('build', 'npm', ['run', 'build'], { cwd: projectRoot });
    } else {
      console.log('ℹ [build] skipped (script not present)');
    }
  }

  if (!args.skipTest) {
    if (hasScript(projectRoot, 'test')) {
      run('test', 'npm', ['test'], { cwd: projectRoot });
    } else {
      console.log('ℹ [test] skipped (script not present)');
    }
  }

  console.log('\n✅ scaffold-check passed');
  if (!args.keep) {
    fs.rmSync(args.workdir, { recursive: true, force: true });
  }
}

main();
