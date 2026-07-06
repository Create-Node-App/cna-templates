#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

const UI_TEMPLATES = [
  {
    name: 'react-vite-starter',
    entry: '[src]/pages/Landing.tsx.template',
    cssEntry: '[src]/pages/Landing.css',
    ctaFile: '<%= srcDir %>/pages/Landing.tsx',
  },
  {
    name: 'nextjs-starter',
    entry: '[src]/app/page.tsx.template',
    cssEntry: '[src]/app/page.module.css',
    ctaFile: '<%= srcDir %>/app/page.tsx',
  },
  {
    name: 'remix-starter',
    entry: 'app/routes/_index.tsx.template',
    cssEntry: 'app/styles/landing.css',
    ctaFile: 'app/routes/_index.tsx',
  },
  {
    name: 'astro-starter',
    entry: 'src/pages/index.astro',
    cssEntry: null,
    ctaFile: 'src/pages/index.astro',
  },
  {
    name: 'webextension-react-vite-starter',
    entry: '[src]/newtab/Newtab.tsx.template',
    cssEntry: '[src]/newtab/Newtab.css',
    ctaFile: '<%= srcDir %>/newtab/Newtab.tsx',
  },
];

const ALLOWED_CTA_ELEMENTS = ['span'];
const HARDCODED_PATTERNS = [
  /rgba\(245\s*,\s*158\s*,\s*11/,
  /#f59e0b(?!\s*;)/,
  /#d97706/,
  /#0d9488/,
];

let hasErrors = false;

function error(template, message) {
  console.error(`  ERROR  [${template}] ${message}`);
  hasErrors = true;
}

function success(template, message) {
  console.log(`  OK     [${template}] ${message}`);
}

function readFile(templateDir, filePath) {
  const fullPath = path.join(templateDir, filePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function auditTemplate(config) {
  const templateDir = path.join(TEMPLATES_DIR, config.name);
  const content = readFile(templateDir, config.entry);

  if (!content) {
    error(config.name, `Entry file not found: ${config.entry}`);
    return;
  }

  // 1. Feature cards: count === 6
  const cardDataStart = content.match(/const\s+features\s*[=:]/);
  const cardDataEnd = content.match(/(?:const\s+docs|href:\s*['"](?:\/docs|\.\/docs))/);
  const featuresSlice = cardDataStart && cardDataEnd
    ? content.slice(cardDataStart.index, cardDataEnd.index)
    : content;
  const cardMatches = featuresSlice.match(/icon:\s*['"][^'"]*['"]/g);
  const cardCount = cardMatches ? cardMatches.length : 0;
  if (cardCount !== 6) {
    error(config.name, `Expected 6 feature cards, found ${cardCount}`);
  } else {
    success(config.name, `Feature cards: ${cardCount}`);
  }

  // 2. Docs links: all hrefs start with /docs/
  const docLinkPattern = /href:\s*['"](\.\/docs\/|docs\/)/g;
  if (docLinkPattern.test(content)) {
    error(config.name, 'Docs links use relative path (./docs/ or docs/) instead of root-absolute /docs/');
  } else {
    success(config.name, 'Docs links use root-absolute /docs/');
  }

  // 3a. CTA "Start editing": element should NOT be <a href>
  const ctaPattern = /<a\s[^>]*href=[^>]*>[\s\n]*Start editing/g;
  if (ctaPattern.test(content)) {
    error(config.name, 'CTA "Start editing" is an <a href> — should be a <span>');
  } else {
    success(config.name, 'CTA "Start editing" is not a navigable link');
  }

  // 3b. CTA should reference the correct editable file
  if (config.ctaFile) {
    const filePath = config.ctaFile.replace('<%= srcDir %>', '');
    const ctaPattern = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const ctaHasFileRegex = new RegExp(ctaPattern);
    if (!ctaHasFileRegex.test(content)) {
      error(config.name, `CTA does not reference the correct editable file: ${config.ctaFile}`);
    } else {
      success(config.name, `CTA references correct file: ${config.ctaFile}`);
    }
  }

  // 4. CSS audit (check if CSS exists and has token usage)
  if (config.cssEntry) {
    const css = readFile(templateDir, config.cssEntry);
    if (css) {
      // Check for hardcoded colors outside :root blocks
      const outsideRoot = css.replace(/:\s*root\s*\{[^}]*\}/g, '');
      for (const pattern of HARDCODED_PATTERNS) {
        if (pattern.test(outsideRoot)) {
          error(config.name, `Hardcoded color found outside :root: ${pattern}`);
          break;
        }
      }

      // Check for prefers-reduced-motion
      if (!css.includes('prefers-reduced-motion')) {
        error(config.name, 'Missing @media (prefers-reduced-motion: reduce)');
      }

      // Check for --cna-amber-soft in light mode
      const lightModeBlock = css.match(/@media\s*\(prefers-color-scheme:\s*light\)\s*\{([^}]*)\}/);
      if (lightModeBlock && !lightModeBlock[1].includes('--cna-amber-soft')) {
        error(config.name, 'Light mode block does not override --cna-amber-soft');
      }

      // Check animation selector includes the card class
      if (config.name === 'react-vite-starter' || config.name === 'remix-starter' || config.name === 'webextension-react-vite-starter') {
        const staggerSelector = css.match(/\.(?:cna-)?landing__(?:hero|features|docs|footer|card)[^}]*\{[^}]*animation[^}]*\}/);
        if (staggerSelector) {
          const hasCard = css.match(/\.(?:cna-)?landing__card[^}]*\{[^}]*animation-delay[^}]*\}/);
          if (!hasCard) {
            error(config.name, 'Animation stagger selector does not include card class');
          } else {
            success(config.name, 'Animation stagger includes card class');
          }
        }
      }

      // Check for token-based gradient in --primary button
      const hasTokenGradient = css.match(/linear-gradient[^}]*var\(--cna-amber\)[^}]*var\(--cna-amber-dark\)[^}]*var\(--cna-teal\)/);
      if (!hasTokenGradient) {
        const hasButtonGradient = css.match(/\.(?:cna-)?landing__button--primary\s*\{[^}]*background:\s*linear-gradient[^}]*\}/);
        if (hasButtonGradient && !css.includes('var(--cna-amber)')) {
          error(config.name, 'Primary button gradient uses hardcoded colors instead of --cna-* tokens');
        }
      }
    }
  }

  // Astro-specific: check inline styles
  if (config.name === 'astro-starter') {
    const astroCSS = content.match(/<style[^>]*>([\s\S]*)<\/style>/);
    if (astroCSS) {
      const styleContent = astroCSS[1];
      const outsideRoot = styleContent.replace(/:\s*root\s*\{[^}]*\}/g, '');
      for (const pattern of HARDCODED_PATTERNS) {
        if (pattern.test(outsideRoot)) {
          error(config.name, `Hardcoded color found in inline <style> outside :root: ${pattern}`);
          break;
        }
      }
    }
  }

  // Logo check for webext (imports from @/assets/img/)
  if (config.name === 'webextension-react-vite-starter') {
    if (!content.includes("import logo from")) {
      error(config.name, 'Missing logo import (should import from @/assets/img/logo.svg)');
    }
  } else {
    if (!content.includes('/logo.svg')) {
      error(config.name, 'Missing logo reference as /logo.svg');
    }
  }
}

function main() {
  console.log('Landing Audit\n');
  console.log('Checking', UI_TEMPLATES.length, 'UI templates...\n');

  for (const config of UI_TEMPLATES) {
    console.log(`--- ${config.name} ---`);
    auditTemplate(config);
    console.log();
  }

  if (hasErrors) {
    console.log('Audit FAILED — fix errors above.\n');
    process.exit(1);
  } else {
    console.log('All landings passed audit!\n');
    process.exit(0);
  }
}

main();
