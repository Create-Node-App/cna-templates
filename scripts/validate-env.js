#!/usr/bin/env node
'use strict';

/**
 * L0 env validation model (issues #382, #398).
 *
 * Problem: `SKIP_ENV_VALIDATION=true` lets builds pass without exercising env
 * schemas, which can mask mis-configured schemas (missing required vars,
 * weakened zod constraints) that would fail in production.
 *
 * This validator enforces a model where real schema bugs fail CI while
 * legitimate skips still work:
 *
 *   1. No-masking audit — nothing under `.github/workflows/`, `scripts/ci/`,
 *      or `ci/profiles/` may *set* `SKIP_ENV_VALIDATION=true` blanket.
 *      Legitimate reads stay allowed: template runtime `skipValidation` /
 *      `=== 'true'` checks, the caller opt-in propagation in
 *      `scripts/ci/run-scaffold-check.js`, per-command opt-ins such as the
 *      SaaS template `build:ci` script, and docs/`.env.example` comments.
 *   2. Required fail-fast — every schema-declared required var (no
 *      `.optional()` / `.default()`) must be listed in the model with a
 *      constraint and a CI-only fixture. The required set is derived from
 *      the schema source, so silently weakening a field (e.g. adding
 *      `.optional()` or dropping `.min(32)`) fails this check.
 *   3. Fixture proof — an empty env must fail for schemas with required
 *      vars (no masking), while the CI fixture must satisfy every
 *      constraint. Build-safe schemas (all defaults) must pass empty.
 *
 * Usage:
 *   node scripts/validate-env.js              # validate the repo
 *   node scripts/validate-env.js --self-test  # also run the negative test:
 *      synthetic broken schemas / blanket skips that MUST be flagged.
 *      Exits non-zero if any breakage goes undetected.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');

let failures = 0;
let selfTestMode = false;

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`❌ ERROR: ${message}`);
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
//
// `required` maps VAR -> constraint used both to re-derive expectations from
// the schema source and to evaluate the CI fixture:
//   { constraint: 'url' }        value must parse as a URL
//   { constraint: 'minlen:<n>' }  value must have length >= n
//
// `ciFixture` values are synthetic CI-only placeholders (never real
// secrets); they must look like placeholders (see PLACEHOLDER_HINT).

const PLACEHOLDER_HINT = /ci|localhost|example|placeholder|test|development/i;

const SCHEMAS = [
  {
    id: 'nextjs-saas-ai-starter (required fail-fast)',
    file: 'templates/nextjs-saas-ai-starter/template/src/shared/lib/env.ts',
    kind: 't3-env',
    required: {
      DATABASE_URL: { constraint: 'url' },
      AUTH_SECRET: { constraint: 'minlen:32' },
    },
    ciFixture: {
      DATABASE_URL: 'postgresql://ci:ci@localhost:5432/ci',
      AUTH_SECRET: 'ci-only-secret-placeholder-min-32-chars',
    },
    envExample: 'templates/nextjs-saas-ai-starter/template/.env.example',
  },
  {
    id: 'nextjs-starter (all defaults, build-safe)',
    file: 'templates/nextjs-starter/template/[src]/env.ts',
    kind: 'zod-object',
    required: {},
    ciFixture: {},
    envExample: 'templates/nextjs-starter/template/.env.example',
  },
  {
    id: 'nextjs-t3-env extension (all defaults, build-safe)',
    file: 'extensions/nextjs-t3-env/[src]/env.ts.template',
    kind: 't3-env',
    required: {},
    ciFixture: {},
    envExample: 'extensions/nextjs-t3-env/.env.example.append',
  },
  {
    id: 'nestjs-starter (all optional/defaulted, fail-fast loader)',
    file: 'templates/nestjs-starter/template/src/config/env.schema.ts',
    kind: 'zod-object',
    required: {},
    ciFixture: {},
    envExample: 'templates/nestjs-starter/template/.env.example',
    optionalHelpers: ['optionalNonEmptyString', 'optionalUrl'],
    failFastFile: 'templates/nestjs-starter/template/src/config/env.validation.ts',
  },
  {
    id: 'hono-starter (all defaulted, fail-fast loader)',
    file: 'templates/hono-starter/template/src/env.ts',
    kind: 'zod-object',
    required: {},
    ciFixture: {},
    envExample: 'templates/hono-starter/template/.env.example',
  },
];

// Scanned for blanket `SKIP_ENV_VALIDATION=true` assignments (scope: CI env
// handling — scripts/ci + workflows). Template runtime sources, template
// package.json opt-in scripts, docs, and `.env.example` comments are
// intentionally out of scope: they are the legitimate skip paths.

const NO_BLANKET_SKIP_DIRS = ['.github/workflows', 'scripts/ci', 'ci/profiles'];
const NO_BLANKET_SKIP_EXTS = new Set(['.yml', '.yaml', '.js', '.json']);

// ---------------------------------------------------------------------------
// No-masking audit
// ---------------------------------------------------------------------------

function isCommentLine(line) {
  const t = line.trim();
  return (
    t.startsWith('#') ||
    t.startsWith('//') ||
    t.startsWith('*') ||
    t.startsWith('<!--')
  );
}

// True when a line *assigns* the skip flag instead of merely reading it.
// Reads stay allowed: `process.env.SKIP_ENV_VALIDATION`, `=== 'true'`
// comparisons, `skipValidation: !!process.env...`, and prose comments.
function isBlanketSkipAssignment(line) {
  if (isCommentLine(line)) return false;
  // Caller opt-in propagation (`env.X = process.env.X`), `=== 'true'`
  // comparisons, and `skipValidation: !!process.env...` are reads, not sets.
  if (/process\.env\.SKIP_ENV_VALIDATION/.test(line)) return false;
  return (
    /(^|[\s;|&(`'"])SKIP_ENV_VALIDATION\s*=\s*"?true"?/.test(line) || // shell prefix / export
    /SKIP_ENV_VALIDATION\s*:\s*["']?true["']?/.test(line) || // yaml mapping / json key
    /SKIP_ENV_VALIDATION\s*\]?\s*=\s*["']true["']/.test(line) // js literal assignment
  );
}

function collectScannedFiles() {
  const files = [];
  for (const dir of NO_BLANKET_SKIP_DIRS) {
    const abs = path.join(REPO_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (!NO_BLANKET_SKIP_EXTS.has(path.extname(name))) continue;
      files.push(path.join(abs, name));
    }
  }
  return files.sort();
}

function checkNoBlanketSkip() {
  info('Auditing for blanket SKIP_ENV_VALIDATION=true (workflows + scripts/ci)...');
  let scanned = 0;
  for (const file of collectScannedFiles()) {
    scanned += 1;
    const rel = path.relative(REPO_ROOT, file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      if (isBlanketSkipAssignment(line)) {
        fail(
          `blanket SKIP_ENV_VALIDATION=true in ${rel}:${idx + 1}: ${line.trim()} ` +
            `(masks env schema bugs — use a per-command opt-in instead, see docs/MAINTENANCE_CI.md)`,
        );
      }
    });
  }
  if (failures === 0) pass(`no blanket SKIP_ENV_VALIDATION sets (${scanned} CI files scanned)`);
}

// ---------------------------------------------------------------------------
// Schema source parsing (zero-deps static analysis)
// ---------------------------------------------------------------------------

// Split the top-level fields of the `{...}` block starting at `openIdx`.
// Returns [{ name, expr }] with `expr` spanning the full zod chain,
// including multi-line chains (brace/paren/bracket-depth aware).
function splitBlockFields(source, openIdx) {
  const fields = [];
  let depth = 0;
  let current = '';
  let quote = null;
  const push = () => {
    const m = /^\s*([A-Za-z_][\w]*)\s*:(.*)$/s.exec(current);
    if (m) fields.push({ name: m[1], expr: m[2].trim() });
    current = '';
  };
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      current += ch;
      if (ch === '\\') {
        current += source[i + 1] || '';
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    // Strip comments quote-aware: schema blocks interleave `//` section
    // headers (e.g. `// Database`) with fields, and URLs in strings must
    // survive (handled above by the quote branch).
    if (ch === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i + 2);
      i = end === -1 ? source.length : end;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) throw new Error('unterminated block comment while parsing schema source');
      i = end + 1;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1;
    if (ch === '}' || ch === ')' || ch === ']') {
      depth -= 1;
      if (depth === 0) {
        push();
        return fields;
      }
    }
    if (ch === ',' && depth === 1) {
      push();
      continue;
    }
    if (depth >= 1 && i !== openIdx) current += ch;
  }
  throw new Error('unterminated block while parsing schema source');
}

function findBlock(source, key) {
  // Matches `key: {` or `key:{` or `z.object({`.
  const re = key === 'z.object'
    ? /z\.object\(\s*\{/
    : new RegExp(`${key}\\s*:\\s*\\{`);
  const m = re.exec(source);
  if (!m) return null;
  return splitBlockFields(source, m.index + m[0].length - 1);
}

function isOptionalExpr(expr, entry) {
  if (/\.optional\s*\(/.test(expr) || /\.default\s*\(/.test(expr)) return true;
  for (const helper of entry.optionalHelpers || []) {
    if (new RegExp(`\\b${helper}\\b`).test(expr)) return true;
  }
  return false;
}

// Derive the required set from schema source so weakening a field fails.
function deriveRequired(source, entry) {
  const blocks =
    entry.kind === 't3-env'
      ? ['server', 'client'].map((k) => findBlock(source, k) || [])
      : [findBlock(source, 'z.object') || []];
  const required = new Map();
  for (const fields of blocks) {
    for (const { name, expr } of fields) {
      if (!isOptionalExpr(expr, entry)) required.set(name, expr);
    }
  }
  return required;
}

function extractConstraint(expr) {
  if (/z\.url\s*\(|\.url\s*\(/.test(expr)) return 'url';
  const m = /\.min\s*\(\s*(\d+)\s*\)/.exec(expr);
  if (m) return `minlen:${m[1]}`;
  return null;
}

function checkConstraintSatisfied(varName, constraint, value) {
  if (typeof value !== 'string' || value.length === 0) {
    return `${varName}: fixture must be a non-empty string`;
  }
  if (constraint === 'url') {
    try {
      new URL(value);
    } catch {
      return `${varName}: fixture ${JSON.stringify(value)} is not a URL`;
    }
  }
  const min = /^minlen:(\d+)$/.exec(constraint || '');
  if (min && value.length < Number(min[1])) {
    return `${varName}: fixture length ${value.length} < min ${min[1]}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Per-schema checks
// ---------------------------------------------------------------------------

function checkSchema(entry) {
  const abs = path.join(REPO_ROOT, entry.file);
  if (!fs.existsSync(abs)) {
    fail(`[${entry.id}] schema file missing: ${entry.file}`);
    return;
  }
  const source = fs.readFileSync(abs, 'utf8');
  let example = null;
  if (entry.envExample) {
    const exAbs = path.join(REPO_ROOT, entry.envExample);
    example = fs.existsSync(exAbs) ? fs.readFileSync(exAbs, 'utf8') : null;
  }
  checkSchemaFromSource(entry, source, example);
}

// Pure core of checkSchema: operates on source strings so the negative test
// can run the REAL checker against mutated schemas.
function checkSchemaFromSource(entry, source, example) {
  const before = failures;

  // 1. Legitimate skip path OR fail-fast loader must exist.
  const hasSkipRead = /SKIP_ENV_VALIDATION/.test(source);
  let hasFailFast = /safeParse/.test(source) && /throw new Error/.test(source);
  if (entry.failFastFile) {
    const fAbs = path.join(REPO_ROOT, entry.failFastFile);
    if (fs.existsSync(fAbs)) {
      const fSrc = fs.readFileSync(fAbs, 'utf8');
      hasFailFast = /safeParse/.test(fSrc) && /throw new Error/.test(fSrc);
    } else {
      fail(`[${entry.id}] fail-fast loader missing: ${entry.failFastFile}`);
    }
  }
  if (!hasSkipRead && !hasFailFast) {
    fail(
      `[${entry.id}] neither a SKIP_ENV_VALIDATION read nor a fail-fast ` +
        `safeParse+throw loader found`,
    );
  }

  // 2. Required set derived from source must equal the model. A weakened
  //    field (added .optional()/.default(), dropped constraint) or a new
  //    un-fixtured required var fails here — that is the anti-masking core.
  let derived;
  try {
    derived = deriveRequired(source, entry);
  } catch (err) {
    fail(`[${entry.id}] could not parse schema source: ${err.message}`);
    return;
  }
  const modeled = new Map(Object.entries(entry.required));
  for (const [name, expr] of derived) {
    if (!modeled.has(name)) {
      fail(
        `[${entry.id}] schema requires "${name}" but the model has no CI ` +
          `fixture for it — CI would fail (or need a masking skip). ` +
          `Add it to scripts/validate-env.js with a constraint + fixture.`,
      );
      continue;
    }
    const expected = modeled.get(name).constraint;
    const actual = extractConstraint(expr);
    if (actual !== expected) {
      fail(
        `[${entry.id}] "${name}" constraint changed: schema has ` +
          `${JSON.stringify(actual)}, model expects ${JSON.stringify(expected)} ` +
          `(weakened validation must fail CI, not slip through).`,
      );
    }
  }
  for (const name of modeled.keys()) {
    if (!derived.has(name)) {
      fail(
        `[${entry.id}] model requires "${name}" but the schema no longer ` +
          `fails fast on it (now optional/defaulted?) — masking risk.`,
      );
    }
  }

  // 3. t3-env: every required var must be wired through runtimeEnv so the
  //    fixture actually reaches validation.
  if (entry.kind === 't3-env') {
    const runtime = findBlock(source, 'runtimeEnv');
    const wired = new Set((runtime || []).map((f) => f.name));
    for (const name of modeled.keys()) {
      if (!wired.has(name)) {
        fail(`[${entry.id}] required "${name}" is not wired in runtimeEnv`);
      }
    }
    if (!/skipValidation\s*:\s*!!process\.env\.SKIP_ENV_VALIDATION/.test(source)) {
      fail(`[${entry.id}] t3 skipValidation must stay the supported library flag`);
    }
  }

  // 4. Fixtures: placeholders only, satisfying every modeled constraint.
  //    Empty env fails for required schemas (no masking); build-safe
  //    schemas pass empty by construction (no required vars).
  for (const [name, spec] of modeled) {
    const value = entry.ciFixture[name];
    if (value === undefined) {
      fail(`[${entry.id}] required "${name}" has no CI fixture`);
      continue;
    }
    if (!PLACEHOLDER_HINT.test(value)) {
      fail(`[${entry.id}] fixture for "${name}" must be an obvious placeholder, not a real secret`);
      continue;
    }
    const problem = checkConstraintSatisfied(name, spec.constraint, value);
    if (problem) fail(`[${entry.id}] ${problem}`);
  }
  for (const name of Object.keys(entry.ciFixture)) {
    if (!modeled.has(name)) {
      fail(`[${entry.id}] fixture for "${name}" has no modeled required var (stale fixture?)`);
    }
  }

  // 5. .env.example must document every required var.
  if (entry.envExample) {
    if (example === null) {
      fail(`[${entry.id}] env example missing: ${entry.envExample}`);
    } else {
      for (const name of modeled.keys()) {
        if (!new RegExp(`\\b${name}\\b`).test(example)) {
          fail(`[${entry.id}] required "${name}" is not documented in ${entry.envExample}`);
        }
      }
    }
  }

  if (failures === before) {
    const req = [...modeled.keys()];
    pass(
      `[${entry.id}] model holds ` +
        (req.length === 0
          ? '(build-safe: empty env passes)'
          : `(empty env fails on ${req.join(', ')}; CI fixture passes)`),
    );
  }
}

// ---------------------------------------------------------------------------
// Negative test (--self-test): breakages that MUST be flagged
// ---------------------------------------------------------------------------

function expectFlagged(label, fn) {
  const before = failures;
  const savedLog = console.log;
  const savedErr = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    fn();
  } finally {
    console.log = savedLog;
    console.error = savedErr;
  }
  if (failures > before) {
    failures = before; // absorb the expected failure; the detector worked
    pass(`[self-test] breakage detected as required: ${label}`);
  } else {
    fail(`[self-test] BREAKAGE NOT DETECTED (validator is masking): ${label}`);
  }
}

function runSelfTest() {
  info('Running negative test: breakages that must fail...');
  const saas = SCHEMAS[0];
  const saasSource = fs.readFileSync(path.join(REPO_ROOT, saas.file), 'utf8');
  const saasExample = fs.readFileSync(path.join(REPO_ROOT, saas.envExample), 'utf8');

  // Blanket sets must be flagged in every CI surface syntax.
  for (const [label, line] of [
    ['shell blanket skip', 'SKIP_ENV_VALIDATION=true npm run build'],
    ['yaml blanket skip', '          SKIP_ENV_VALIDATION: "true"'],
    ['js literal blanket skip', "    env.SKIP_ENV_VALIDATION = 'true';"],
  ]) {
    if (!isBlanketSkipAssignment(line)) {
      fail(`[self-test] detector missed a ${label} — fix isBlanketSkipAssignment`);
    } else {
      pass(`[self-test] breakage detected as required: ${label}`);
    }
  }

  // Reads must NOT be flagged (legitimate skips still work).
  const reads = [
    '  if (process.env.SKIP_ENV_VALIDATION) {',
    '    env.SKIP_ENV_VALIDATION = process.env.SKIP_ENV_VALIDATION;',
    '  skipValidation: !!process.env.SKIP_ENV_VALIDATION,',
    "  const skipValidation = process.env.SKIP_ENV_VALIDATION === 'true';",
  ];
  if (reads.some(isBlanketSkipAssignment)) {
    fail('[self-test] legitimate SKIP_ENV_VALIDATION read was flagged (false positive)');
  } else {
    pass('[self-test] legitimate reads not flagged (skip still works)');
  }

  // Broken schemas go through the REAL per-schema checker with a mutated
  // copy of the actual SaaS source — a masking change must fail.
  const mutations = [
    [
      'DATABASE_URL silently made optional',
      saasSource.replace(
        'DATABASE_URL: z.url().describe(',
        'DATABASE_URL: z.string().optional().describe(',
      ),
    ],
    [
      'AUTH_SECRET min length dropped',
      saasSource.replace('z.string().min(32).describe(', 'z.string().describe('),
    ],
    [
      'DATABASE_URL unwired from runtimeEnv',
      saasSource.replace('    DATABASE_URL: process.env.DATABASE_URL,\n', ''),
    ],
    [
      'new required var without fixture',
      saasSource.replace(
        '    AUTH_URL: z.url().optional().describe(',
        '    AUTH_URL: z.url().describe(',
      ),
    ],
  ];
  for (const [label, mutated] of mutations) {
    if (mutated === saasSource) {
      fail(`[self-test] mutation did not apply (source drifted?): ${label}`);
      continue;
    }
    expectFlagged(label, () => checkSchemaFromSource(saas, mutated, saasExample));
  }

  // A weakened fixture must fail too: a short AUTH_SECRET (minlen
  // guard) or a non-URL DATABASE_URL (url guard — note the issue's literal
  // `file:./dev.db` example is likewise rejected: it is not a `z.url()`).
  expectFlagged('short AUTH_SECRET fixture rejected', () =>
    checkSchemaFromSource(
      { ...saas, ciFixture: { ...saas.ciFixture, AUTH_SECRET: 'ci-short' } },
      saasSource,
      saasExample,
    ),
  );
  expectFlagged('non-URL DATABASE_URL fixture rejected', () =>
    checkSchemaFromSource(
      {
        ...saas,
        ciFixture: { ...saas.ciFixture, DATABASE_URL: 'ci-placeholder-not-a-url' },
      },
      saasSource,
      saasExample,
    ),
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  selfTestMode = process.argv.includes('--self-test');
  console.log('🔍 Validating env model (no SKIP_ENV_VALIDATION masking)...\n');

  checkNoBlanketSkip();
  for (const entry of SCHEMAS) checkSchema(entry);
  if (selfTestMode) runSelfTest();

  console.log(`\n${'='.repeat(50)}`);
  if (failures > 0) {
    console.log(`❌ Env validation failed (${failures} problem${failures === 1 ? '' : 's'})`);
    process.exit(1);
  }
  console.log(
    selfTestMode
      ? '✅ Env model valid — and the negative test proves breakages fail.'
      : '✅ Env model valid. (Run with --self-test for the negative test.)',
  );
}

main();

