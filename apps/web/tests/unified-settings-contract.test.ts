/**
 * Unified Storefront Settings — Contract Tests
 *
 * Tests the heroBanner field contract and other key fields flowing correctly
 * from DB (stores.storefront_settings) through getUnifiedStorefrontSettings()
 * to the storefront template config.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettings,
} from '~/services/unified-storefront-settings.server';
import {
  DEFAULT_UNIFIED_SETTINGS,
  serializeUnifiedSettings,
  deserializeUnifiedSettings,
} from '~/services/storefront-settings.schema';

// ============================================================================
// MOCK HELPERS
// ============================================================================

/**
 * Build a minimal mock DrizzleD1Database whose .select() chain
 * resolves with the provided row(s) from the `stores` table.
 */
function createMockDb(storefrontSettingsJson: string | null | undefined) {
  const mockLimit = vi.fn().mockResolvedValue(
    storefrontSettingsJson !== undefined
      ? [{ storefrontSettings: storefrontSettingsJson }]
      : []
  );

  const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  // update chain — used by saveUnifiedStorefrontSettings
  const mockUpdateWhere = vi.fn().mockResolvedValue({ success: true });
  const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

  return {
    select: mockSelect,
    update: mockUpdate,
    // expose internals for assertions
    _mockLimit: mockLimit,
    _mockWhere: mockWhere,
    _mockFrom: mockFrom,
    _mockSet: mockSet,
    _mockUpdateWhere: mockUpdateWhere,
  };
}

/** Serialize a partial settings object into the JSON string stored in the DB. */
function makeSettingsJson(overrides: Record<string, unknown>): string {
  return JSON.stringify({
    ...DEFAULT_UNIFIED_SETTINGS,
    ...overrides,
    updatedAt: new Date().toISOString(),
  });
}

const STORE_ID = 42;

// ============================================================================
// TESTS
// ============================================================================

describe('getUnifiedStorefrontSettings — heroBanner contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // Test 1: valid slides parse correctly
  // --------------------------------------------------------------------------
  it('parses heroBanner with valid slides correctly', async () => {
    const json = makeSettingsJson({
      heroBanner: {
        mode: 'single',
        overlayOpacity: 50,
        slides: [
          {
            imageUrl: 'https://r2.example.com/banner.jpg',
            heading: 'Big Sale',
            subheading: 'Up to 50% off',
            ctaText: 'Shop Now',
            ctaLink: '/products',
          },
        ],
        fallbackHeadline: null,
      },
    });

    const db = createMockDb(json);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    expect(result.heroBanner.slides).toHaveLength(1);
    expect(result.heroBanner.slides[0].imageUrl).toBe('https://r2.example.com/banner.jpg');
    expect(result.heroBanner.slides[0].heading).toBe('Big Sale');
    expect(result.heroBanner.slides[0].ctaText).toBe('Shop Now');
    expect(result.heroBanner.overlayOpacity).toBe(50);
    expect(result.heroBanner.mode).toBe('single');
  });

  // --------------------------------------------------------------------------
  // Test 2: heroBanner missing → safe default
  // --------------------------------------------------------------------------
  it('returns safe heroBanner default when heroBanner field is absent from DB JSON', async () => {
    // Build JSON without heroBanner key
    const rawObj: Record<string, unknown> = {
      version: 1,
      theme: DEFAULT_UNIFIED_SETTINGS.theme,
      branding: DEFAULT_UNIFIED_SETTINGS.branding,
      business: DEFAULT_UNIFIED_SETTINGS.business,
      social: DEFAULT_UNIFIED_SETTINGS.social,
      announcement: DEFAULT_UNIFIED_SETTINGS.announcement,
      seo: DEFAULT_UNIFIED_SETTINGS.seo,
      checkout: DEFAULT_UNIFIED_SETTINGS.checkout,
      shippingConfig: DEFAULT_UNIFIED_SETTINGS.shippingConfig,
      floating: DEFAULT_UNIFIED_SETTINGS.floating,
      courier: DEFAULT_UNIFIED_SETTINGS.courier,
      navigation: DEFAULT_UNIFIED_SETTINGS.navigation,
      trustBadges: DEFAULT_UNIFIED_SETTINGS.trustBadges,
      whyChooseUs: DEFAULT_UNIFIED_SETTINGS.whyChooseUs,
      typography: DEFAULT_UNIFIED_SETTINGS.typography,
      flags: DEFAULT_UNIFIED_SETTINGS.flags,
      updatedAt: new Date().toISOString(),
      // heroBanner intentionally omitted
    };

    const db = createMockDb(JSON.stringify(rawObj));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    // Zod fills in the default — must have heroBanner with at least an empty slides array
    expect(result.heroBanner).toBeDefined();
    expect(Array.isArray(result.heroBanner.slides)).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Test 3: heroBanner with empty slides array
  // --------------------------------------------------------------------------
  it('preserves empty slides array without crashing', async () => {
    const json = makeSettingsJson({
      heroBanner: {
        mode: 'carousel',
        overlayOpacity: 30,
        slides: [],
        fallbackHeadline: null,
      },
    });

    const db = createMockDb(json);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    expect(result.heroBanner.slides).toHaveLength(0);
    expect(result.heroBanner.slides[0]).toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // Test 4: slides[0].imageUrl is empty string → falsy, no crash
  // --------------------------------------------------------------------------
  it('handles slides[0].imageUrl being an empty string (after delete)', async () => {
    const json = makeSettingsJson({
      heroBanner: {
        mode: 'single',
        overlayOpacity: 40,
        autoPlayInterval: 5000,
        showAppWidget: true,
        slides: [
          {
            imageUrl: '',
            heading: null,
            subheading: null,
            ctaText: null,
            ctaLink: null,
          },
        ],
        fallbackHeadline: null,
      },
    });

    const db = createMockDb(json);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    expect(result.heroBanner.slides).toHaveLength(1);
    // Empty string is falsy — must not crash and must preserve the value
    expect(result.heroBanner.slides[0].imageUrl).toBe('');
    expect(result.heroBanner.slides[0].imageUrl).toBeFalsy();
  });

  // --------------------------------------------------------------------------
  // Test 5: theme.templateId flows through correctly
  // --------------------------------------------------------------------------
  it('flows theme.templateId through correctly', async () => {
    const json = makeSettingsJson({
      theme: {
        ...DEFAULT_UNIFIED_SETTINGS.theme,
        templateId: 'luxe-boutique',
      },
    });

    const db = createMockDb(json);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    expect(result.theme.templateId).toBe('luxe-boutique');
  });

  // --------------------------------------------------------------------------
  // Test 6: branding.storeName flows through
  // --------------------------------------------------------------------------
  it('flows branding.storeName through correctly', async () => {
    const json = makeSettingsJson({
      branding: {
        ...DEFAULT_UNIFIED_SETTINGS.branding,
        storeName: 'Test Shop',
      },
    });

    const db = createMockDb(json);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    expect(result.branding.storeName).toBe('Test Shop');
  });

  // --------------------------------------------------------------------------
  // Test 7: announcement enabled/disabled + text
  // --------------------------------------------------------------------------
  it('flows announcement.enabled and announcement.text through correctly', async () => {
    const json = makeSettingsJson({
      announcement: {
        enabled: true,
        text: 'Free delivery',
        link: null,
        backgroundColor: '#4F46E5',
        textColor: '#ffffff',
      },
    });

    const db = createMockDb(json);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    expect(result.announcement.enabled).toBe(true);
    expect(result.announcement.text).toBe('Free delivery');
  });

  // --------------------------------------------------------------------------
  // Test 8: malformed JSON → returns safe defaults, no crash
  // --------------------------------------------------------------------------
  it('returns DEFAULT_UNIFIED_SETTINGS when storefront_settings JSON is malformed', async () => {
    const db = createMockDb('not valid json {{{{');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    // deserializeUnifiedSettings returns null on bad JSON → function falls back to defaults
    expect(result).toEqual(DEFAULT_UNIFIED_SETTINGS);
    expect(result.heroBanner).toBeDefined();
    expect(result.theme.templateId).toBe('starter-store');
    expect(result.branding.storeName).toBe('My Store');
  });

  // --------------------------------------------------------------------------
  // Test 9: no row in DB → returns DEFAULT_UNIFIED_SETTINGS
  // --------------------------------------------------------------------------
  it('returns DEFAULT_UNIFIED_SETTINGS when no store row is found in DB', async () => {
    // Empty result set (no rows) simulates store not found
    const mockLimit = vi.fn().mockResolvedValue([]);
    const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });
    const db = { select: mockSelect };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUnifiedStorefrontSettings(db as any, STORE_ID);

    expect(result).toEqual(DEFAULT_UNIFIED_SETTINGS);
  });

  // --------------------------------------------------------------------------
  // Test 10: DB query uses store_id filter (where is called)
  // --------------------------------------------------------------------------
  it('passes the correct storeId filter to the DB query', async () => {
    const json = makeSettingsJson({});
    const db = createMockDb(json);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getUnifiedStorefrontSettings(db as any, STORE_ID);

    // .where() must have been called (multi-tenant isolation)
    expect(db._mockWhere).toHaveBeenCalledOnce();
  });
});

// ============================================================================
// saveUnifiedStorefrontSettings — heroBanner write contract
// ============================================================================

describe('saveUnifiedStorefrontSettings — heroBanner write contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes merged heroBanner with 2 slides to D1 update', async () => {
    // Current settings stored in DB (1 slide)
    const currentSettings = serializeUnifiedSettings({
      ...DEFAULT_UNIFIED_SETTINGS,
      heroBanner: {
        mode: 'single',
        overlayOpacity: 40,
        autoPlayInterval: 5000,
        showAppWidget: true,
        slides: [
          {
            imageUrl: 'https://r2.example.com/old-banner.jpg',
            heading: 'Old Heading',
            subheading: null,
            ctaText: null,
            ctaLink: null,
          },
        ],
        fallbackHeadline: null,
      },
    });

    const db = createMockDb(currentSettings);

    const newSlides = [
      {
        imageUrl: 'https://r2.example.com/slide1.jpg',
        heading: 'Slide 1',
        subheading: 'Sub 1',
        ctaText: 'Buy Now',
        ctaLink: '/products/1',
      },
      {
        imageUrl: 'https://r2.example.com/slide2.jpg',
        heading: 'Slide 2',
        subheading: null,
        ctaText: null,
        ctaLink: null,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await saveUnifiedStorefrontSettings(db as any, STORE_ID, {
      heroBanner: {
        slides: newSlides,
        mode: 'carousel',
      },
    });

    // The returned settings must contain the patched heroBanner
    expect(result.heroBanner.slides).toHaveLength(2);
    expect(result.heroBanner.slides[0].imageUrl).toBe('https://r2.example.com/slide1.jpg');
    expect(result.heroBanner.slides[1].imageUrl).toBe('https://r2.example.com/slide2.jpg');
    expect(result.heroBanner.mode).toBe('carousel');

    // D1 update must have been called
    expect(db._mockSet).toHaveBeenCalledOnce();
    expect(db._mockUpdateWhere).toHaveBeenCalledOnce();

    // The set() payload must include storefrontSettings with the new heroBanner
    const setPayload = db._mockSet.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof setPayload.storefrontSettings).toBe('string');

    const written = JSON.parse(setPayload.storefrontSettings as string);
    expect(written.heroBanner.slides).toHaveLength(2);
    expect(written.heroBanner.slides[0].imageUrl).toBe('https://r2.example.com/slide1.jpg');
    expect(written.heroBanner.mode).toBe('carousel');
    // templateId must still be set on the update (legacy-compatible column)
    expect(setPayload.theme).toBe('starter-store');
  });

  it('preserves existing heroBanner fields not included in the patch', async () => {
    const currentSettings = serializeUnifiedSettings({
      ...DEFAULT_UNIFIED_SETTINGS,
      heroBanner: {
        mode: 'single',
        overlayOpacity: 75,
        autoPlayInterval: 5000,
        showAppWidget: true,
        slides: [
          {
            imageUrl: 'https://r2.example.com/keep.jpg',
            heading: 'Keep Me',
            subheading: null,
            ctaText: null,
            ctaLink: null,
          },
        ],
        fallbackHeadline: 'Fallback headline text',
      },
    });

    const db = createMockDb(currentSettings);

    // Patch only overlayOpacity — slides and fallbackHeadline should be preserved
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await saveUnifiedStorefrontSettings(db as any, STORE_ID, {
      heroBanner: {
        overlayOpacity: 20,
      },
    });

    expect(result.heroBanner.overlayOpacity).toBe(20);
    // Existing slides preserved
    expect(result.heroBanner.slides).toHaveLength(1);
    expect(result.heroBanner.slides[0].imageUrl).toBe('https://r2.example.com/keep.jpg');
    expect(result.heroBanner.fallbackHeadline).toBe('Fallback headline text');
  });

  it('does not crash when saving with null storefront_settings (new store)', async () => {
    // Simulate a brand-new store with no storefront_settings row value
    const db = createMockDb(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await saveUnifiedStorefrontSettings(db as any, STORE_ID, {
      heroBanner: {
        mode: 'carousel',
        slides: [],
      },
    });

    // Must not crash, must return valid settings
    expect(result).toBeDefined();
    expect(result.heroBanner.mode).toBe('carousel');
    expect(result.heroBanner.slides).toHaveLength(0);
  });
});

// ============================================================================
// Schema / serialization round-trip
// ============================================================================

describe('heroBanner serialization round-trip', () => {
  it('survives JSON serialize → deserialize with slide data intact', async () => {
    const original = {
      ...DEFAULT_UNIFIED_SETTINGS,
      heroBanner: {
        mode: 'carousel' as const,
        overlayOpacity: 60,
        autoPlayInterval: 5000,
        showAppWidget: true,
        slides: [
          {
            imageUrl: 'https://cdn.example.com/img.jpg',
            heading: 'Hello',
            subheading: 'World',
            ctaText: 'Go',
            ctaLink: '/go',
          },
          {
            imageUrl: 'https://cdn.example.com/img2.jpg',
            heading: null,
            subheading: null,
            ctaText: null,
            ctaLink: null,
          },
        ],
        fallbackHeadline: 'Fallback',
      },
    };

    const serialized = serializeUnifiedSettings(original);
    const deserialized = deserializeUnifiedSettings(serialized);

    expect(deserialized).not.toBeNull();
    expect(deserialized!.heroBanner.mode).toBe('carousel');
    expect(deserialized!.heroBanner.overlayOpacity).toBe(60);
    expect(deserialized!.heroBanner.slides).toHaveLength(2);
    expect(deserialized!.heroBanner.slides[0].imageUrl).toBe('https://cdn.example.com/img.jpg');
    expect(deserialized!.heroBanner.slides[0].heading).toBe('Hello');
    expect(deserialized!.heroBanner.slides[1].imageUrl).toBe('https://cdn.example.com/img2.jpg');
    expect(deserialized!.heroBanner.fallbackHeadline).toBe('Fallback');
  });

  it('deserializeUnifiedSettings returns null for invalid JSON', () => {
    expect(deserializeUnifiedSettings('{{bad json')).toBeNull();
    expect(deserializeUnifiedSettings(null)).toBeNull();
    expect(deserializeUnifiedSettings('')).toBeNull();
  });

  it('deserializeUnifiedSettings returns null for JSON that fails Zod validation', () => {
    // version is required as literal 1; wrong version triggers Zod failure
    const badSettings = JSON.stringify({ version: 99, theme: {} });
    expect(deserializeUnifiedSettings(badSettings)).toBeNull();
  });
});
