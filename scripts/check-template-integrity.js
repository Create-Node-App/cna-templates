#!/usr/bin/env node

/**
 * Fail CI when UI landings / READMEs link to docs that do not exist in the template.
 * Treats `FOO.md.template` as satisfying a link to `FOO.md`.
 *
 * Usage: node scripts/check-template-integrity.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TEMPLATES_DIR = path.join(ROOT, "templates");

const LANDING_BASENAMES = new Set([
  "index.astro",
  "Landing.tsx",
  "Landing.tsx.template",
  "page.tsx",
  "page.tsx.template",
  "_index.tsx",
  "_index.tsx.template",
  "Newtab.tsx",
  "Newtab.tsx.template",
]);

const DOC_HREF_RE =
  /(?:href|to)\s*[:=]\s*["'`](\.?\.?\/?docs\/[^"'`#?]+)["'`]/g;
const MD_LINK_RE = /\[[^\]]*\]\((\.?\.?\/?docs\/[^)#?\s]+)\)/g;

let failures = 0;

function rel(p) {
  return path.relative(ROOT, p);
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function extractDocHrefs(content) {
  const hrefs = new Set();
  for (const re of [DOC_HREF_RE, MD_LINK_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(content)) !== null) {
      let href = match[1].replace(/^\.\//, "").replace(/^\//, "");
      if (href.startsWith("docs/")) hrefs.add(href);
    }
  }
  return [...hrefs];
}

function docExists(templateRoot, docHref) {
  const candidates = [
    path.join(templateRoot, docHref),
    path.join(templateRoot, `${docHref}.template`),
  ];
  // PROJECT_STRUCTURE.md.template under docs/
  if (docHref.endsWith(".md")) {
    candidates.push(path.join(templateRoot, `${docHref}.template`));
  }
  return candidates.some((p) => fs.existsSync(p));
}

function checkTemplate(templateName) {
  const templateRoot = path.join(TEMPLATES_DIR, templateName);
  const files = walk(templateRoot);
  const targets = files.filter((f) => {
    const base = path.basename(f);
    if (LANDING_BASENAMES.has(base)) return true;
    if (base === "README.md" || base === "README.md.template") return true;
    if (base === "CONTRIBUTING.md" || base === "CONTRIBUTING.md.template") return true;
    return false;
  });

  for (const file of targets) {
    const content = fs.readFileSync(file, "utf8");
    const hrefs = extractDocHrefs(content);
    for (const href of hrefs) {
      if (!docExists(templateRoot, href)) {
        console.error(`❌ ${rel(file)} → missing ${href} (and ${href}.template)`);
        failures += 1;
      }
    }
  }
}

function main() {
  console.log("🔍 Checking template landing/README doc link integrity...\n");

  const templates = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((name) => fs.statSync(path.join(TEMPLATES_DIR, name)).isDirectory());

  for (const name of templates) {
    checkTemplate(name);
  }

  console.log("\n" + "=".repeat(50));
  if (failures > 0) {
    console.error(`Found ${failures} broken doc link(s).`);
    process.exit(1);
  }
  console.log("✅ All scanned doc links resolve.");
  process.exit(0);
}

main();
