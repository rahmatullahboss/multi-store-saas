/**
 * Theme Editor Validation Schemas
 *
 * Zod schemas for validating all form inputs in the store live editor.
 * These ensure type safety and prevent XSS/injection attacks.
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVE VALIDATORS
// ============================================================================

/** Safe hex color validator - prevents XSS via color values */
const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
  .or(z.literal(''))
  .default('#000000');

/** Safe URL validator */
const safeUrlSchema = z.string().url().or(z.literal('')).default('');

/** Safe text input - strips potential XSS */
const safeTextSchema = z
  .string()
  .max(1000)
  .transform((val) => val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''))
  .default('');

/** Safe CSS input - limited characters */
const safeCssSchema = z
  .string()
  .max(50000)
  .regex(/^[a-zA-Z0-9\s\-_:;.,#{}()@%'"\/\n\r\t]*$/, 'Invalid CSS characters')
  .or(z.literal(''))
  .default('');

// ============================================================================
// THEME ID VALIDATORS
// ============================================================================

/** Valid theme preset IDs */
const themePresetIdSchema = z
  .enum(['starter-store', 'daraz', 'bdshop', 'ghorer-bazar'])
  .default('starter-store');

/** Store template ID */
const storeTemplateIdSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Invalid template ID format')
  .max(50)
  .default('modern-standard');

// ============================================================================
// TYPOGRAPHY SCHEMA
// ============================================================================

const typographySchema = z
  .object({
    headingSize: z.enum(['small', 'medium', 'large']).optional(),
    bodySize: z.enum(['small', 'medium', 'large']).optional(),
    lineHeight: z.enum(['compact', 'normal', 'relaxed']).optional(),
    letterSpacing: z.enum(['tight', 'normal', 'wide']).optional(),
  })
  .default({});

// ============================================================================
// SECTION SCHEMAS
// ============================================================================

/** Block instance schema */
const blockInstanceSchema = z.object({
  id: z.string().max(100),
  type: z
    .string()
    .regex(/^[a-z0-9-_]+$/i)
    .max(50),
  disabled: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).default({}),
});

/** Section instance schema */
const sectionInstanceSchema = z.object({
  id: z.string().max(100),
  type: z
    .string()
    .regex(/^[a-z0-9-_]+$/i)
    .max(50),
  disabled: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).default({}),
  blocks: z.array(blockInstanceSchema).optional(),
  block_order: z.array(z.string()).optional(),
});

/** Array of sections */
const sectionsArraySchema = z.array(sectionInstanceSchema).default([]);

// ============================================================================
// HEADER/FOOTER SCHEMAS
// ============================================================================

const headerLayoutSchema = z.enum(['centered', 'left-logo', 'minimal']).default('centered');

const footerColumnSchema = z.object({
  title: safeTextSchema,
  links: z
    .array(
      z.object({
        label: safeTextSchema,
        url: safeUrlSchema,
      })
    )
    .default([]),
});

const footerColumnsSchema = z.array(footerColumnSchema).default([]);

// ============================================================================
// MARKETING SCHEMAS
// ============================================================================

const flashSaleSchema = z
  .object({
    isActive: z.boolean().default(false),
    text: safeTextSchema.optional(),
  })
  .optional();

const trustBadgesSchema = z
  .object({
    showPaymentIcons: z.boolean().default(false),
    showGuaranteeSeals: z.boolean().default(false),
  })
  .optional();

const marketingPopupSchema = z
  .object({
    isActive: z.boolean().default(false),
    title: safeTextSchema.optional(),
    description: safeTextSchema.optional(),
    offerCode: safeTextSchema.optional(),
  })
  .optional();

const seoSchema = z
  .object({
    metaTitle: safeTextSchema.optional(),
    metaDescription: safeTextSchema.optional(),
  })
  .optional();

// ============================================================================
// MAIN FORM SCHEMA
// ============================================================================

export const themeEditorFormSchema = z.object({
  // Theme identification
  themeId: themePresetIdSchema,
  storeTemplateId: storeTemplateIdSchema,

  // Colors
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  backgroundColor: hexColorSchema,
  textColor: hexColorSchema,
  borderColor: hexColorSchema,

  // Typography
  typography: typographySchema,
  fontFamily: z
    .string()
    .regex(/^[a-z0-9-]+$/i)
    .max(50)
    .default('inter'),

  // Sections (JSON strings that need parsing)
  sections: sectionsArraySchema,
  productSections: sectionsArraySchema,
  collectionSections: sectionsArraySchema,
  cartSections: sectionsArraySchema,
  checkoutSections: sectionsArraySchema,

  // Branding
  logo: safeUrlSchema,
  bannerUrl: safeUrlSchema,
  bannerText: safeTextSchema,

  // Announcement
  announcementText: safeTextSchema,
  announcementLink: safeUrlSchema,

  // Header settings
  headerLayout: headerLayoutSchema,
  headerShowSearch: z.boolean().default(true),
  headerShowCart: z.boolean().default(true),

  // Footer settings
  footerDescription: safeTextSchema,
  copyrightText: safeTextSchema,
  footerColumns: footerColumnsSchema,

  // Floating buttons
  floatingWhatsappEnabled: z.boolean().default(false),
  floatingWhatsappNumber: z
    .string()
    .regex(/^[0-9+\-\s]*$/)
    .max(20)
    .default(''),
  floatingWhatsappMessage: safeTextSchema,
  floatingCallEnabled: z.boolean().default(false),
  floatingCallNumber: z
    .string()
    .regex(/^[0-9+\-\s]*$/)
    .max(20)
    .default(''),

  // Checkout
  checkoutStyle: z.enum(['standard', 'minimal', 'one_page']).default('standard'),

  // Marketing
  flashSale: flashSaleSchema,
  trustBadges: trustBadgesSchema,
  marketingPopup: marketingPopupSchema,
  seo: seoSchema,

  // Custom CSS
  customCSS: safeCssSchema,

  // Business info
  phone: z
    .string()
    .regex(/^[0-9+\-\s]*$/)
    .max(20)
    .default(''),
  email: z.string().email().or(z.literal('')).default(''),
  address: safeTextSchema,

  // Social links
  facebook: safeUrlSchema,
  instagram: safeUrlSchema,
  whatsapp: z
    .string()
    .regex(/^[0-9+\-\s]*$/)
    .max(20)
    .default(''),

  // Action type
  _action: z.enum(['save', 'publish']).optional(),
});

export type ThemeEditorFormData = z.infer<typeof themeEditorFormSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate form data from the theme editor
 */
export function parseThemeEditorFormData(formData: FormData):
  | {
      success: true;
      data: ThemeEditorFormData;
    }
  | {
      success: false;
      error: z.ZodError;
    } {
  // Extract raw values from FormData
  const rawData: Record<string, unknown> = {};

  // Simple string fields
  const stringFields = [
    'themeId',
    'storeTemplateId',
    'primaryColor',
    'accentColor',
    'backgroundColor',
    'textColor',
    'borderColor',
    'fontFamily',
    'logo',
    'bannerUrl',
    'bannerText',
    'announcementText',
    'announcementLink',
    'headerLayout',
    'footerDescription',
    'copyrightText',
    'floatingWhatsappNumber',
    'floatingWhatsappMessage',
    'floatingCallNumber',
    'checkoutStyle',
    'customCSS',
    'phone',
    'email',
    'address',
    'facebook',
    'instagram',
    'whatsapp',
    '_action',
  ];

  for (const field of stringFields) {
    rawData[field] = formData.get(field) ?? '';
  }

  // Boolean fields
  rawData.headerShowSearch = formData.get('headerShowSearch') === 'true';
  rawData.headerShowCart = formData.get('headerShowCart') === 'true';
  rawData.floatingWhatsappEnabled = formData.get('floatingWhatsappEnabled') === 'true';
  rawData.floatingCallEnabled = formData.get('floatingCallEnabled') === 'true';

  // JSON fields that need parsing
  const jsonFields = [
    'typography',
    'sections',
    'productSections',
    'collectionSections',
    'cartSections',
    'checkoutSections',
    'footerColumns',
    'flashSale',
    'trustBadges',
    'marketingPopup',
    'seo',
  ];

  for (const field of jsonFields) {
    const jsonStr = formData.get(field) as string;
    if (jsonStr) {
      try {
        rawData[field] = JSON.parse(jsonStr);
      } catch {
        rawData[field] = field.endsWith('Sections') || field === 'footerColumns' ? [] : {};
      }
    }
  }

  // Validate with Zod
  const result = themeEditorFormSchema.safeParse(rawData);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validate a section settings object
 */
export function validateSectionSettings(settings: unknown): Record<string, unknown> {
  if (!settings || typeof settings !== 'object') {
    return {};
  }

  // Deep clone and sanitize
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(settings)) {
    // Sanitize keys (alphanumeric + underscore only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) continue;

    // Sanitize values based on type
    if (typeof value === 'string') {
      // Remove script tags
      sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' ? validateSectionSettings(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = validateSectionSettings(value);
    }
  }

  return sanitized;
}

/**
 * Safely parse JSON from database with validation
 */
export function safeJsonParse<T>(
  json: string | null | undefined,
  schema: z.ZodSchema<T>,
  defaultValue: T
): T {
  if (!json) return defaultValue;

  try {
    const parsed = JSON.parse(json);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : defaultValue;
  } catch {
    return defaultValue;
  }
}
