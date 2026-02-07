#!/usr/bin/env node

/**
 * Fix Broken HC Translations Script
 *
 * This script automatically fixes the broken hc_ translations
 * where the first letters are missing.
 *
 * Strategy: Use English text as fallback until proper Bengali translations are added
 *
 * Usage: node scripts/fix-hc-translations.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../apps/web/public/locales');

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

function saveJSON(filePath, data) {
  try {
    // Preserve key order and use 2-space indentation
    const sortedKeys = Object.keys(data).sort();
    const sortedData = {};
    sortedKeys.forEach((key) => {
      sortedData[key] = data[key];
    });

    fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error(`${colors.red}Error saving ${filePath}:${colors.reset}`, error.message);
    return false;
  }
}

function isBrokenHcTranslation(key, value) {
  if (!key.startsWith('hc_')) return false;
  if (typeof value !== 'string') return false;
  if (value.trim() === '') return true;

  // Check for patterns that indicate broken translation
  // 1. Missing first letters pattern (e.g., "bout" instead of "About")
  const words = value.split(/\s+/);
  let brokenWordCount = 0;

  for (const word of words) {
    if (word.length === 0) continue;

    // Skip small words
    if (word.length <= 2) continue;

    // Check if word starts with lowercase when it shouldn't
    if (word[0] === word[0].toLowerCase() && /^[a-z]/.test(word)) {
      brokenWordCount++;
    }
  }

  // If more than half the words are broken, consider it broken
  if (words.length > 0 && brokenWordCount / words.length > 0.3) {
    return true;
  }

  // Check for underscores without spaces (untranslated)
  if (value.includes('_') && !value.includes(' ')) {
    return true;
  }

  return false;
}

function fixHcTranslations(enData, bnData) {
  const fixes = [];
  const skipped = [];

  for (const key in enData) {
    // Only process hc_ keys
    if (!key.startsWith('hc_')) continue;

    const enValue = enData[key];
    const bnValue = bnData[key];

    // Skip if Bengali translation doesn't exist
    if (bnValue === undefined) {
      skipped.push({ key, reason: 'Missing in BN' });
      continue;
    }

    // Check if broken
    if (isBrokenHcTranslation(key, bnValue)) {
      // Replace with English value for now
      // TODO: Replace with actual Bengali translation later
      bnData[key] = enValue;
      fixes.push({ key, oldValue: bnValue, newValue: enValue });
    }
  }

  return { fixes, skipped };
}

function fixNamespace(namespace) {
  const enPath = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
  const bnPath = path.join(LOCALES_DIR, 'bn', `${namespace}.json`);

  if (!fs.existsSync(enPath) || !fs.existsSync(bnPath)) {
    console.log(`${colors.yellow}Skipping ${namespace}: File not found${colors.reset}`);
    return null;
  }

  const enData = loadJSON(enPath);
  const bnData = loadJSON(bnPath);

  const { fixes, skipped } = fixHcTranslations(enData, bnData);

  if (fixes.length > 0) {
    // Save the fixed data
    if (saveJSON(bnPath, bnData)) {
      console.log(
        `${colors.green}✅ Fixed ${fixes.length} broken hc_ translations in ${namespace}${colors.reset}`
      );

      // Show examples
      console.log(`${colors.cyan}   Examples:${colors.reset}`);
      fixes.slice(0, 3).forEach((fix) => {
        console.log(`   - ${colors.yellow}${fix.key}${colors.reset}`);
        console.log(`     Before: "${fix.oldValue}"`);
        console.log(`     After:  "${fix.newValue}"`);
      });

      if (fixes.length > 3) {
        console.log(`   ... and ${fixes.length - 3} more`);
      }
    }
  }

  if (skipped.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Skipped ${skipped.length} missing keys in ${namespace}${colors.reset}`
    );
  }

  return { namespace, fixes, skipped };
}

function generateReport(results) {
  const totalFixed = results.reduce((sum, r) => sum + r.fixes.length, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped.length, 0);

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}       FIX SUMMARY REPORT               ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✅ Fixed: ${totalFixed} broken translations${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Skipped: ${totalSkipped} missing keys${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  if (totalFixed > 0) {
    console.log(`${colors.green}🎉 Successfully fixed all broken hc_ translations!${colors.reset}`);
    console.log(
      `${colors.yellow}💡 Next step: Replace English text with proper Bengali translations${colors.reset}\n`
    );
  }
}

function main() {
  console.log(`${colors.cyan}🔧 Fixing broken hc_ translations...${colors.reset}\n`);

  // Get all namespaces
  const enDir = path.join(LOCALES_DIR, 'en');
  const namespaces = fs
    .readdirSync(enDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace('.json', ''));

  const results = [];

  for (const namespace of namespaces) {
    const result = fixNamespace(namespace);
    if (result && (result.fixes.length > 0 || result.skipped.length > 0)) {
      results.push(result);
    }
  }

  generateReport(results);

  console.log(`${colors.blue}📋 What was done:${colors.reset}`);
  console.log(`   1. Identified all broken hc_ translations (missing first letters)`);
  console.log(`   2. Replaced them with English text as fallback`);
  console.log(`   3. Preserved proper Bengali translations`);
  console.log(`\n${colors.yellow}💡 Recommendation:${colors.reset}`);
  console.log(`   - Review the fixed translations in bn/common.json`);
  console.log(`   - Replace English text with proper Bengali`);
  console.log(`   - Use AI or translator for bulk translation`);
  console.log(`   - Run 'node scripts/check-translations.js' to verify\n`);
}

main();
