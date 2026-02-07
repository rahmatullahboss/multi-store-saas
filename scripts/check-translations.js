#!/usr/bin/env node

/**
 * Translation Checker Script
 *
 * This script scans all translation files and identifies:
 * 1. Missing keys (exists in EN but not in BN)
 * 2. Placeholder translations (where translation = key name)
 * 3. Broken translations (hc_ keys with missing first letters)
 * 4. Empty translations
 *
 * Usage: node scripts/check-translations.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../apps/web/public/locales');
const SOURCE_LANG = 'en';
const TARGET_LANG = 'bn';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}Error loading ${filePath}:${colors.reset}`, error.message);
    return {};
  }
}

function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], `${prefix}${key}.`));
    } else {
      keys.push(`${prefix}${key}`);
    }
  }
  return keys;
}

function getValue(obj, keyPath) {
  const keys = keyPath.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

function isPlaceholderTranslation(key, value) {
  // Check if translation is same as key or contains key name
  if (typeof value !== 'string') return false;

  const normalizedValue = value.toLowerCase().replace(/[_\-]/g, '');
  const normalizedKey = key.toLowerCase().replace(/[_\-]/g, '');

  // Check if value equals key or is very similar
  if (normalizedValue === normalizedKey) return true;
  if (value === key) return true;

  // Check if value is just the key name with spaces
  if (normalizedValue === normalizedKey.replace(/\./g, '')) return true;

  return false;
}

function isBrokenHcTranslation(key, value) {
  // Check for broken hc_ translations where first letters are missing
  if (!key.startsWith('hc_')) return false;
  if (typeof value !== 'string') return false;

  // If value is empty or contains only partial words (missing first letters)
  const words = value.split(/\s+/);
  const hasBrokenWords = words.some((word) => {
    if (word.length === 0) return false;
    // Check if word starts with lowercase in the middle of sentence
    // This is a heuristic for broken translations like "dd To Cart" instead of "Add To Cart"
    return word.length > 1 && word[0] === word[0].toLowerCase() && /^[a-z]/.test(word);
  });

  // Also check if value contains underscores (indicates untranslated)
  if (value.includes('_') && !value.includes(' ')) return true;

  return hasBrokenWords || value.length === 0;
}

function checkNamespace(namespace) {
  const enPath = path.join(LOCALES_DIR, SOURCE_LANG, `${namespace}.json`);
  const bnPath = path.join(LOCALES_DIR, TARGET_LANG, `${namespace}.json`);

  if (!fs.existsSync(enPath)) {
    console.log(`${colors.yellow}Skipping ${namespace}: Source file not found${colors.reset}`);
    return null;
  }

  const enData = loadJSON(enPath);
  const bnData = fs.existsSync(bnPath) ? loadJSON(bnPath) : {};

  const enKeys = getAllKeys(enData);
  const bnKeys = getAllKeys(bnData);

  const issues = {
    namespace,
    missingInBN: [],
    placeholders: [],
    brokenHc: [],
    empty: [],
    extraInBN: [],
  };

  // Check for missing keys in BN
  for (const key of enKeys) {
    const bnValue = getValue(bnData, key);
    const enValue = getValue(enData, key);

    if (bnValue === undefined) {
      issues.missingInBN.push({ key, enValue });
    } else if (typeof bnValue === 'string') {
      if (bnValue.trim() === '') {
        issues.empty.push({ key, enValue });
      } else if (isPlaceholderTranslation(key, bnValue)) {
        issues.placeholders.push({ key, enValue, bnValue });
      } else if (isBrokenHcTranslation(key, bnValue)) {
        issues.brokenHc.push({ key, enValue, bnValue });
      }
    }
  }

  // Check for extra keys in BN that don't exist in EN
  for (const key of bnKeys) {
    if (getValue(enData, key) === undefined) {
      issues.extraInBN.push(key);
    }
  }

  return issues;
}

function printReport(issues) {
  let hasIssues = false;

  console.log(`\n${colors.cyan}=== ${issues.namespace.toUpperCase()} ===${colors.reset}`);

  // Missing in BN
  if (issues.missingInBN.length > 0) {
    hasIssues = true;
    console.log(
      `\n${colors.red}❌ Missing in Bengali (${issues.missingInBN.length} keys):${colors.reset}`
    );
    issues.missingInBN.forEach(({ key, enValue }) => {
      console.log(`   - ${colors.yellow}${key}${colors.reset}`);
      console.log(`     EN: "${enValue}"`);
    });
  }

  // Placeholder translations
  if (issues.placeholders.length > 0) {
    hasIssues = true;
    console.log(
      `\n${colors.yellow}⚠️  Placeholder translations (${issues.placeholders.length} keys):${colors.reset}`
    );
    issues.placeholders.forEach(({ key, enValue, bnValue }) => {
      console.log(`   - ${colors.yellow}${key}${colors.reset}`);
      console.log(`     EN: "${enValue}"`);
      console.log(`     BN: "${bnValue}" ${colors.red}(same as key)${colors.reset}`);
    });
  }

  // Broken hc_ translations
  if (issues.brokenHc.length > 0) {
    hasIssues = true;
    console.log(
      `\n${colors.red}🔧 Broken hc_ translations (${issues.brokenHc.length} keys):${colors.reset}`
    );
    issues.brokenHc.forEach(({ key, enValue, bnValue }) => {
      console.log(`   - ${colors.yellow}${key}${colors.reset}`);
      console.log(`     EN: "${enValue}"`);
      console.log(`     BN: "${bnValue}" ${colors.red}(broken)${colors.reset}`);
    });
  }

  // Empty translations
  if (issues.empty.length > 0) {
    hasIssues = true;
    console.log(
      `\n${colors.red}⚪ Empty translations (${issues.empty.length} keys):${colors.reset}`
    );
    issues.empty.forEach(({ key, enValue }) => {
      console.log(`   - ${colors.yellow}${key}${colors.reset}`);
      console.log(`     EN: "${enValue}"`);
    });
  }

  // Extra in BN
  if (issues.extraInBN.length > 0) {
    console.log(
      `\n${colors.blue}ℹ️  Extra keys in Bengali (${issues.extraInBN.length} keys - can be removed):${colors.reset}`
    );
    issues.extraInBN.forEach((key) => {
      console.log(`   - ${colors.cyan}${key}${colors.reset}`);
    });
  }

  if (!hasIssues) {
    console.log(`${colors.green}✅ No critical issues found!${colors.reset}`);
  }

  return hasIssues;
}

function generateSummary(allIssues) {
  let totalMissing = 0;
  let totalPlaceholders = 0;
  let totalBroken = 0;
  let totalEmpty = 0;

  allIssues.forEach((issues) => {
    totalMissing += issues.missingInBN.length;
    totalPlaceholders += issues.placeholders.length;
    totalBroken += issues.brokenHc.length;
    totalEmpty += issues.empty.length;
  });

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}       TRANSLATION SUMMARY REPORT       ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.red}❌ Missing keys:        ${totalMissing}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Placeholder values:  ${totalPlaceholders}${colors.reset}`);
  console.log(`${colors.red}🔧 Broken hc_ keys:     ${totalBroken}${colors.reset}`);
  console.log(`${colors.red}⚪ Empty translations:  ${totalEmpty}${colors.reset}`);
  console.log(`${colors.cyan}----------------------------------------${colors.reset}`);
  console.log(
    `${colors.cyan}Total issues: ${totalMissing + totalPlaceholders + totalBroken + totalEmpty}${colors.reset}`
  );
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  return totalMissing + totalPlaceholders + totalBroken + totalEmpty;
}

function main() {
  console.log(`${colors.cyan}🔍 Checking translations...${colors.reset}`);

  // Get all namespaces
  const enDir = path.join(LOCALES_DIR, SOURCE_LANG);
  const namespaces = fs
    .readdirSync(enDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace('.json', ''));

  console.log(`Found ${namespaces.length} namespaces: ${namespaces.join(', ')}\n`);

  const allIssues = [];

  for (const namespace of namespaces) {
    const issues = checkNamespace(namespace);
    if (issues) {
      const hasIssues = printReport(issues);
      if (hasIssues || issues.extraInBN.length > 0) {
        allIssues.push(issues);
      }
    }
  }

  const totalIssues = generateSummary(allIssues);

  if (totalIssues === 0) {
    console.log(`${colors.green}🎉 All translations are perfect!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(
      `${colors.yellow}💡 Tip: Run ${colors.cyan}npm run i18n:extract${colors.yellow} to auto-extract missing keys${colors.reset}\n`
    );
    process.exit(1);
  }
}

main();
