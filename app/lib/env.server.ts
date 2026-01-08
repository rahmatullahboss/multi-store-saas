/**
 * Environment Validation Utility
 * 
 * Provides strict TypeScript validation for Cloudflare environment variables
 * using Zod schemas. This ensures the app fails fast with clear error messages
 * if required environment variables are missing.
 * 
 * Usage:
 * ```typescript
 * import { getEnv, getOptionalEnv } from '~/lib/env.server';
 * 
 * export async function loader({ context }: LoaderFunctionArgs) {
 *   const env = getEnv(context); // Throws if required vars missing
 *   const db = drizzle(env.DB);
 *   // ...
 * }
 * ```
 */

import { z } from 'zod';
import type { AppLoadContext } from '@remix-run/cloudflare';

// ============================================================================
// ZOD SCHEMAS - Define environment variable requirements
// ============================================================================

/**
 * Core environment variables required for basic app functionality
 * These MUST be present for the app to work at all
 */
const CoreEnvSchema = z.object({
  // Database (D1 binding - required)
  DB: z.custom<D1Database>(
    (val) => val !== undefined && val !== null,
    { message: 'Missing Environment Variable: DB (D1 Database binding)' }
  ),
  
  // SaaS domain for tenant resolution
  SAAS_DOMAIN: z.string({
    required_error: 'Missing Environment Variable: SAAS_DOMAIN',
  }).min(1, 'SAAS_DOMAIN cannot be empty'),
});

// Note: Image uploads now use Cloudflare R2 (configured in wrangler.toml)
// with browser-side compression via app/lib/imageCompression.ts

/**
 * Email service configuration (Resend)
 * Required for order notifications, campaigns, etc.
 */
const EmailEnvSchema = z.object({
  RESEND_API_KEY: z.string({
    required_error: 'Missing Environment Variable: RESEND_API_KEY',
  }).min(1),
});

/**
 * bKash payment gateway configuration
 * Required for bKash payment processing
 */
const BkashEnvSchema = z.object({
  BKASH_BASE_URL: z.string({
    required_error: 'Missing Environment Variable: BKASH_BASE_URL',
  }).url(),
  BKASH_APP_KEY: z.string({
    required_error: 'Missing Environment Variable: BKASH_APP_KEY',
  }).min(1),
  BKASH_APP_SECRET: z.string({
    required_error: 'Missing Environment Variable: BKASH_APP_SECRET',
  }).min(1),
  BKASH_USERNAME: z.string({
    required_error: 'Missing Environment Variable: BKASH_USERNAME',
  }).min(1),
  BKASH_PASSWORD: z.string({
    required_error: 'Missing Environment Variable: BKASH_PASSWORD',
  }).min(1),
});

/**
 * Nagad payment gateway configuration
 * Required for Nagad payment processing
 */
const NagadEnvSchema = z.object({
  NAGAD_BASE_URL: z.string({
    required_error: 'Missing Environment Variable: NAGAD_BASE_URL',
  }).url(),
  NAGAD_MERCHANT_ID: z.string({
    required_error: 'Missing Environment Variable: NAGAD_MERCHANT_ID',
  }).min(1),
  NAGAD_MERCHANT_NUMBER: z.string({
    required_error: 'Missing Environment Variable: NAGAD_MERCHANT_NUMBER',
  }).min(1),
  NAGAD_PUBLIC_KEY: z.string({
    required_error: 'Missing Environment Variable: NAGAD_PUBLIC_KEY',
  }).min(1),
  NAGAD_PRIVATE_KEY: z.string({
    required_error: 'Missing Environment Variable: NAGAD_PRIVATE_KEY',
  }).min(1),
});

/**
 * Stripe payment configuration
 * Required for international card payments
 */
const StripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string({
    required_error: 'Missing Environment Variable: STRIPE_SECRET_KEY',
  }).min(1),
  STRIPE_WEBHOOK_SECRET: z.string({
    required_error: 'Missing Environment Variable: STRIPE_WEBHOOK_SECRET',
  }).min(1),
});

/**
 * Cloudflare Queue binding for email campaigns
 */
const QueueEnvSchema = z.object({
  EMAIL_QUEUE: z.custom<Queue>(
    (val) => val !== undefined && val !== null,
    { message: 'Missing Environment Variable: EMAIL_QUEUE (Cloudflare Queue binding)' }
  ),
});

// ============================================================================
// COMBINED SCHEMAS - Different validation levels
// ============================================================================

/**
 * Minimal env - Only what's needed for basic page rendering
 * Use this for public routes that don't need API integrations
 */
export const MinimalEnvSchema = CoreEnvSchema;

/**
 * Full env - All required environment variables
 * Use this for routes that need full functionality
 */
export const FullEnvSchema = CoreEnvSchema
  .merge(EmailEnvSchema);

/**
 * Payment env - Includes payment gateway configs (all optional)
 * These are validated separately per payment method
 */
export const PaymentEnvSchema = z.object({
  bkash: BkashEnvSchema.optional(),
  nagad: NagadEnvSchema.optional(),
  stripe: StripeEnvSchema.optional(),
});

// ============================================================================
// TYPE EXPORTS - For TypeScript consumers
// ============================================================================

export type MinimalEnv = z.infer<typeof MinimalEnvSchema>;
export type FullEnv = z.infer<typeof FullEnvSchema>;
export type BkashEnv = z.infer<typeof BkashEnvSchema>;
export type NagadEnv = z.infer<typeof NagadEnvSchema>;
export type StripeEnv = z.infer<typeof StripeEnvSchema>;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * EnvValidationError - Custom error for missing environment variables
 */
export class EnvValidationError extends Error {
  public readonly missingVars: string[];
  
  constructor(missingVars: string[]) {
    const message = `Missing Environment Variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}`;
    super(message);
    this.name = 'EnvValidationError';
    this.missingVars = missingVars;
  }
}

/**
 * Extracts the raw env object from Remix context
 */
function extractEnv(context: AppLoadContext): Record<string, unknown> {
  const cloudflare = context.cloudflare;
  if (!cloudflare) {
    throw new Response('Cloudflare context not available', { status: 503 });
  }
  
  const env = cloudflare.env;
  if (!env) {
    throw new Response('Environment variables not available', { status: 503 });
  }
  
  return env as unknown as Record<string, unknown>;
}

/**
 * Formats Zod errors into readable messages
 */
function formatZodErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    if (err.message.startsWith('Missing Environment Variable:')) {
      return err.message;
    }
    return `${err.path.join('.')}: ${err.message}`;
  });
}

/**
 * getEnv - Get and validate core environment variables
 * 
 * Use this in most loaders/actions. Throws a 503 Response if
 * required environment variables are missing.
 * 
 * @example
 * ```typescript
 * export async function loader({ context }: LoaderFunctionArgs) {
 *   const env = getEnv(context);
 *   const db = drizzle(env.DB);
 *   // env.DB is guaranteed to exist here
 * }
 * ```
 */
export function getEnv(context: AppLoadContext): MinimalEnv {
  const raw = extractEnv(context);
  const result = MinimalEnvSchema.safeParse(raw);
  
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    console.error('[getEnv] Environment validation failed:', errors);
    throw new Response(
      `Configuration Error: ${errors.join(', ')}`,
      { status: 503, statusText: 'Service Unavailable' }
    );
  }
  
  return result.data;
}

/**
 * getFullEnv - Get all required environment variables
 * 
 * Use this in routes that need Resend email, etc.
 * Throws a 503 Response if any required variables are missing.
 */
export function getFullEnv(context: AppLoadContext): FullEnv {
  const raw = extractEnv(context);
  const result = FullEnvSchema.safeParse(raw);
  
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    console.error('[getFullEnv] Environment validation failed:', errors);
    throw new Response(
      `Configuration Error: ${errors.join(', ')}`,
      { status: 503, statusText: 'Service Unavailable' }
    );
  }
  
  return result.data;
}

/**
 * getBkashEnv - Get and validate bKash payment configuration
 * 
 * Use this in bKash payment routes. Throws a descriptive error
 * if bKash is not properly configured.
 */
export function getBkashEnv(context: AppLoadContext): BkashEnv {
  const raw = extractEnv(context);
  const result = BkashEnvSchema.safeParse(raw);
  
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    console.error('[getBkashEnv] bKash configuration missing:', errors);
    throw new Response(
      `bKash is not configured. ${errors.join(', ')}`,
      { status: 503, statusText: 'Payment Gateway Unavailable' }
    );
  }
  
  return result.data;
}

/**
 * getNagadEnv - Get and validate Nagad payment configuration
 */
export function getNagadEnv(context: AppLoadContext): NagadEnv {
  const raw = extractEnv(context);
  const result = NagadEnvSchema.safeParse(raw);
  
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    console.error('[getNagadEnv] Nagad configuration missing:', errors);
    throw new Response(
      `Nagad is not configured. ${errors.join(', ')}`,
      { status: 503, statusText: 'Payment Gateway Unavailable' }
    );
  }
  
  return result.data;
}

/**
 * getStripeEnv - Get and validate Stripe payment configuration
 */
export function getStripeEnv(context: AppLoadContext): StripeEnv {
  const raw = extractEnv(context);
  const result = StripeEnvSchema.safeParse(raw);
  
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    console.error('[getStripeEnv] Stripe configuration missing:', errors);
    throw new Response(
      `Stripe is not configured. ${errors.join(', ')}`,
      { status: 503, statusText: 'Payment Gateway Unavailable' }
    );
  }
  
  return result.data;
}

/**
 * getOptionalEnv - Get an optional environment variable
 * 
 * Returns undefined if the variable doesn't exist, instead of throwing.
 * Use for graceful degradation of optional features.
 * 
 * @example
 * ```typescript
 * const groqKey = getOptionalEnv(context, 'GROQ_API_KEY');
 * if (groqKey) {
 *   // AI features available
 * }
 * ```
 */
export function getOptionalEnv<K extends string>(
  context: AppLoadContext,
  key: K
): string | undefined {
  try {
    const raw = extractEnv(context);
    const value = raw[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * requireEnv - Require a specific environment variable
 * 
 * Throws a descriptive error if the variable is missing.
 * Use for one-off validations of specific keys.
 * 
 * @example
 * ```typescript
 * const apiKey = requireEnv(context, 'GROQ_API_KEY');
 * // apiKey is guaranteed to be a non-empty string
 * ```
 */
export function requireEnv<K extends string>(
  context: AppLoadContext,
  key: K
): string {
  const raw = extractEnv(context);
  const value = raw[key];
  
  if (typeof value !== 'string' || value.length === 0) {
    console.error(`[requireEnv] Missing required environment variable: ${key}`);
    throw new Response(
      `Missing Environment Variable: ${key}`,
      { status: 503, statusText: 'Service Unavailable' }
    );
  }
  
  return value;
}

/**
 * validateAllEnv - Validate all environment variables at startup
 * 
 * Call this in your root loader to fail fast if the app is misconfigured.
 * Returns a summary of what's configured vs missing.
 */
export function validateAllEnv(context: AppLoadContext): {
  valid: boolean;
  core: boolean;
  email: boolean;
  bkash: boolean;
  nagad: boolean;
  stripe: boolean;
  missing: string[];
} {
  const raw = extractEnv(context);
  const missing: string[] = [];
  
  const coreResult = MinimalEnvSchema.safeParse(raw);
  if (!coreResult.success) {
    missing.push(...formatZodErrors(coreResult.error));
  }
  
  const emailResult = EmailEnvSchema.safeParse(raw);
  const bkashResult = BkashEnvSchema.safeParse(raw);
  const nagadResult = NagadEnvSchema.safeParse(raw);
  const stripeResult = StripeEnvSchema.safeParse(raw);
  
  return {
    valid: coreResult.success,
    core: coreResult.success,
    email: emailResult.success,
    bkash: bkashResult.success,
    nagad: nagadResult.success,
    stripe: stripeResult.success,
    missing,
  };
}
