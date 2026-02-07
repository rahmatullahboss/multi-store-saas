#!/usr/bin/env node

/**
 * Fix ALL Broken Translations Script
 *
 * This script automatically fixes ALL broken translations where first letters are missing.
 *
 * Usage: node scripts/fix-all-translations.js
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
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error(`${colors.red}Error saving ${filePath}:${colors.reset}`, error.message);
    return false;
  }
}

function isBrokenTranslation(value) {
  if (typeof value !== 'string') return false;
  if (value.trim() === '') return false;

  // Skip URLs and special strings
  if (value.startsWith('http') || value.startsWith('/') || value.startsWith('<')) return false;
  if (value.includes('{{') || value.includes('}}')) return false; // Template variables

  // Check for patterns that indicate broken translation
  // Missing first letters pattern (e.g., "bout" instead of "About")
  const words = value.split(/\s+/);
  let brokenWordCount = 0;
  let totalMeaningfulWords = 0;

  for (const word of words) {
    if (word.length === 0) continue;

    // Skip small words, numbers, and special characters
    if (word.length <= 2) continue;
    if (/^\d/.test(word)) continue; // Numbers
    if (!/^[a-zA-Z]/.test(word)) continue; // Non-English words (Bengali already)

    totalMeaningfulWords++;

    // Check if word starts with lowercase when it shouldn't
    if (word[0] === word[0].toLowerCase() && /^[a-z]/.test(word)) {
      brokenWordCount++;
    }
  }

  // If more than 30% words are broken, consider it broken
  if (totalMeaningfulWords > 0 && brokenWordCount / totalMeaningfulWords > 0.3) {
    return true;
  }

  return false;
}

function fixTranslations(enData, bnData) {
  const fixes = [];
  const skipped = [];

  for (const key in enData) {
    const enValue = enData[key];
    const bnValue = bnData[key];

    // Skip if Bengali translation doesn't exist
    if (bnValue === undefined) {
      skipped.push({ key, reason: 'Missing in BN' });
      continue;
    }

    // Skip if already has Bengali characters
    if (/[ঀ-৿]/.test(bnValue)) {
      continue;
    }

    // Check if broken
    if (isBrokenTranslation(bnValue)) {
      // Replace with English value for now
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

  const { fixes, skipped } = fixTranslations(enData, bnData);

  if (fixes.length > 0) {
    // Save the fixed data
    if (saveJSON(bnPath, bnData)) {
      console.log(
        `${colors.green}✅ Fixed ${fixes.length} broken translations in ${namespace}${colors.reset}`
      );

      // Show examples
      if (fixes.length <= 5) {
        console.log(`${colors.cyan}   All fixed:${colors.reset}`);
        fixes.forEach((fix) => {
          console.log(`   - ${colors.yellow}${fix.key}${colors.reset}`);
          console.log(`     "${fix.oldValue}" → "${fix.newValue}"`);
        });
      } else {
        console.log(`${colors.cyan}   Examples:${colors.reset}`);
        fixes.slice(0, 3).forEach((fix) => {
          console.log(`   - ${colors.yellow}${fix.key}${colors.reset}`);
          console.log(`     "${fix.oldValue}" → "${fix.newValue}"`);
        });
        console.log(`   ... and ${fixes.length - 3} more`);
      }
    }
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
  console.log(`${colors.yellow}⚠️  Missing: ${totalSkipped} keys${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  if (totalFixed > 0) {
    console.log(`${colors.green}🎉 Successfully fixed all broken translations!${colors.reset}`);
    console.log(
      `${colors.yellow}💡 Next: Replace English text with proper Bengali translations${colors.reset}\n`
    );
  }
}

function main() {
  console.log(`${colors.cyan}🔧 Fixing ALL broken translations...${colors.reset}\n`);

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
  console.log(`   1. Scanned all translation files`);
  console.log(`   2. Found broken translations (missing first letters)`);
  console.log(`   3. Replaced with English text as fallback`);
  console.log(`\n${colors.yellow}💡 Recommendation:${colors.reset}`);
  console.log(`   - Review bn/*.json files`);
  console.log(`   - Translate English text to Bengali`);
  console.log(`   - Run 'node scripts/check-translations.js' to verify\n`);
}

main();
