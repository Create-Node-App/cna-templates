#!/usr/bin/env node

/**
 * Copy shared CNA brand assets into template public paths.
 *
 * Usage:
 *   node scripts/sync-shared-assets.js           # apply copies
 *   node scripts/sync-shared-assets.js --check    # exit 1 if drift
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHARED = path.join(ROOT, "shared", "assets");

/**
 * Map shared master → template-relative destinations.
 * Keep in sync with docs/DEFAULT_LANDING_GUIDE.md.
 */
const COPIES = [
  {
    from: "logo-mark.svg",
    to: [
      "templates/astro-starter/public/logo.svg",
      "templates/remix-starter/public/logo.svg",
      "templates/react-vite-starter/public/logo.svg",
      "templates/nextjs-starter/public/logo.svg",
      "templates/webextension-react-vite-starter/public/logo.svg",
      "templates/webextension-react-vite-starter/[src]/assets/img/logo.svg",
    ],
  },
  {
    from: "favicon.svg",
    to: [
      "templates/astro-starter/public/favicon.svg",
      "templates/remix-starter/public/favicon.svg",
      "templates/react-vite-starter/public/favicon.svg",
      "templates/nextjs-starter/[src]/app/favicon.svg",
      "templates/webextension-react-vite-starter/public/favicon.svg",
    ],
  },
];

const checkOnly = process.argv.includes("--check");
let drift = 0;

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function main() {
  console.log(
    checkOnly
      ? "🔍 Checking shared asset sync...\n"
      : "📦 Syncing shared assets into templates...\n",
  );

  for (const { from, to } of COPIES) {
    const src = path.join(SHARED, from);
    if (!fs.existsSync(src)) {
      console.error(`❌ Missing shared asset: shared/assets/${from}`);
      process.exit(1);
    }
    const srcBuf = fs.readFileSync(src);

    for (const relDest of to) {
      const dest = path.join(ROOT, relDest);
      if (checkOnly) {
        if (!fs.existsSync(dest)) {
          console.error(`❌ Missing copy: ${relDest}`);
          drift += 1;
          continue;
        }
        const destBuf = fs.readFileSync(dest);
        if (!srcBuf.equals(destBuf)) {
          console.error(`❌ Drift: ${relDest} differs from shared/assets/${from}`);
          drift += 1;
        } else {
          console.log(`✅ ${relDest}`);
        }
      } else {
        ensureDir(dest);
        fs.writeFileSync(dest, srcBuf);
        console.log(`→ ${relDest}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  if (checkOnly) {
    if (drift > 0) {
      console.error(`${drift} asset path(s) out of sync. Run: node scripts/sync-shared-assets.js`);
      process.exit(1);
    }
    console.log("✅ Shared assets in sync.");
    process.exit(0);
  }
  console.log("✅ Sync complete.");
}

main();
