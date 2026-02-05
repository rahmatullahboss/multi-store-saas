#!/usr/bin/env node
/*
  Migrate legacy themeConfig.sections to new section registry types.
  - featured-products -> product-grid
  - collection-list  -> category-list
  - trust-badges     -> features
  - hero field mapping (headline/subheadline/backgroundImage -> heading/subheading/image)
*/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas';
const WRANGLER_CWD = `${ROOT}/apps/web`;

function run(cmd) {
  const env = {
    ...process.env,
    WRANGLER_HOME: process.env.WRANGLER_HOME || `${process.env.HOME}/.wrangler`,
  };
  return execSync(cmd, {
    cwd: WRANGLER_CWD,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function normalizeLegacySections(sections) {
  const badgeIconMap = {
    truck: 'Truck',
    shield: 'Shield',
    refresh: 'RotateCcw',
    phone: 'Headphones',
    delivery: 'Truck',
    secure: 'Shield',
    support: 'Headphones',
  };

  return (sections || []).map((section) => {
    if (!section || !section.type) return section;
    const settings = section.settings || {};

    if (section.type === 'hero') {
      const mapped = {
        ...settings,
        heading: settings.heading ?? settings.headline,
        subheading: settings.subheading ?? settings.subheadline,
        image: settings.image ?? settings.backgroundImage,
      };
      if (!mapped.primaryAction && settings.buttonText) {
        mapped.primaryAction = {
          label: settings.buttonText,
          url: settings.buttonLink || '/products',
        };
      }
      return { ...section, settings: mapped };
    }

    if (section.type === 'featured-products') {
      return {
        ...section,
        type: 'product-grid',
        settings: {
          ...settings,
          heading: settings.heading ?? settings.title,
          subheading: settings.subheading ?? settings.subtitle,
        },
      };
    }

    if (section.type === 'collection-list') {
      return {
        ...section,
        type: 'category-list',
        settings: {
          ...settings,
          heading: settings.heading ?? settings.title,
          layout: settings.layout || 'grid',
          limit: settings.limit ?? (settings.columns ? settings.columns * 2 : undefined),
        },
      };
    }

    if (section.type === 'trust-badges') {
      const badges = Array.isArray(settings.badges) ? settings.badges : [];
      return {
        ...section,
        type: 'features',
        settings: {
          heading: settings.heading ?? settings.title ?? 'Why Shop With Us',
          subheading: settings.subheading ?? settings.subtitle,
          features: badges.map((badge) => ({
            icon: badgeIconMap[String(badge.icon || '').toLowerCase()] || 'Truck',
            title: badge.title,
            description: badge.description,
          })),
        },
      };
    }

    return section;
  });
}

function escapeSqlString(value) {
  return value.replace(/'/g, "''");
}

function parseThemeConfig(raw) {
  if (!raw) return null;
  if (typeof raw !== 'string') return raw;
  try {
    return { value: JSON.parse(raw), wasInvalid: false };
  } catch {
    // Attempt to normalize non-JSON object literals like:
    // {storeTemplateId:daraz,sections:[]}
    let s = raw.trim();
    // Quote keys
    s = s.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1\"$2\":');
    // Quote hex colors (e.g., #6366f1)
    s = s.replace(/:\s*(#[0-9a-fA-F]{3,8})(?=\s*[},])/g, ':"$1"');
    // Quote any unquoted value (handles emails/urls/barewords)
    s = s.replace(/:\s*([^\"\\[{,][^,}]*)/g, (m, val) => {
      const v = String(val).trim();
      if (!v) return `:""`; // empty
      if (/^(true|false|null)$/i.test(v)) return `:${v.toLowerCase()}`;
      if (/^-?\\d+(\\.\\d+)?$/.test(v)) return `:${v}`;
      return `:\"${v}\"`;
    });
    return { value: JSON.parse(s), wasInvalid: true };
  }
}

function main() {
  const selectCmd = `npx wrangler d1 execute multi-store-saas-db --remote --json --command "SELECT id, name, theme_config FROM stores WHERE theme_config IS NOT NULL;"`;
  const raw = run(selectCmd);
  const data = JSON.parse(raw);
  const rows = (data && data[0] && data[0].results) || [];

  let changed = 0;
  let skipped = 0;
  let errors = 0;

  const report = [];

  for (const row of rows) {
    const storeId = row.id;
    const storeName = row.name;
    const themeConfigRaw = row.theme_config;

    if (!themeConfigRaw) {
      skipped++;
      report.push({ storeId, storeName, status: 'skipped', reason: 'no theme_config' });
      continue;
    }

    const parsed = parseThemeConfig(themeConfigRaw);
    if (!parsed) {
      errors++;
      report.push({ storeId, storeName, status: 'error', reason: 'invalid JSON' });
      continue;
    }
    const { value: themeConfig, wasInvalid } = parsed;

    const sections = normalizeLegacySections(themeConfig.sections || []);
    const next = { ...themeConfig, sections };
    const before = JSON.stringify(themeConfig);
    const after = JSON.stringify(next);

    if (before === after && !wasInvalid) {
      skipped++;
      report.push({ storeId, storeName, status: 'skipped', reason: 'no changes' });
      continue;
    }

    try {
      const escaped = escapeSqlString(after);
      const sql = `UPDATE stores SET theme_config='${escaped}' WHERE id=${storeId};`;
      const tmpFile = path.join('/tmp', `themeconfig_update_${storeId}.sql`);
      fs.writeFileSync(tmpFile, sql);
      const updateCmd = `npx wrangler d1 execute multi-store-saas-db --remote --file "${tmpFile}"`;
      run(updateCmd);
      changed++;
      report.push({ storeId, storeName, status: 'updated' });
    } catch (e) {
      errors++;
      report.push({ storeId, storeName, status: 'error', reason: 'update failed' });
    }
  }

  const summary = { total: rows.length, changed, skipped, errors };
  console.log(JSON.stringify({ summary, report }, null, 2));
}

main();
