/**
 * Validation Schemas for New Features
 * 
 * Zod schemas for input validation on API routes
 */

import { z } from 'zod';

// ============================================================================
// Courier Analytics Validation
// ============================================================================

export const courierAnalyticsQuerySchema = z.object({
  startDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  courier: z.string().min(1).optional(),
});

export const updateDeliverySchema = z.object({
  shipmentId: z.number().int().positive(),
  deliveredAt: z.string().datetime(),
  pickedUpAt: z.string().datetime(),
  attemptCount: z.number().int().positive().min(1),
  deliveryCost: z.number().positive().optional(),
  failureReason: z.string().max(255).optional(),
});

// ============================================================================
// GTM Tracking Validation
// ============================================================================

export const gtmEventTypeSchema = z.enum([
  'page_view',
  'view_item',
  'add_to_cart',
  'remove_from_cart',
  'begin_checkout',
  'add_shipping_info',
  'add_payment_info',
  'purchase',
  'refund',
  'search',
  'select_item',
  'view_item_list',
  'contact',
  'generate_lead',
]);

export const gtmEventItemSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1).max(500),
  price: z.number().positive(),
  quantity: z.number().int().positive().min(1),
});

export const gtmTrackSchema = z.object({
  eventName: gtmEventTypeSchema,
  sessionId: z.string().min(1).max(255).optional(),
  customerId: z.number().int().positive().optional(),
  isLoggedIn: z.boolean().optional(),
  pageUrl: z.string().url().optional(),
  pageTitle: z.string().max(500).optional(),
  referrer: z.string().url().optional(),
  productId: z.number().int().positive().optional(),
  productName: z.string().max(500).optional(),
  value: z.number().positive().optional(),
  currency: z.string().length(3).default('BDT'),
  transactionId: z.string().max(255).optional(),
  deviceType: z.enum(['mobile', 'desktop', 'tablet']).optional(),
  userAgent: z.string().max(500).optional(),
  eventData: z.record(z.any()).optional(),
});

export const gtmPurchaseSchema = gtmTrackSchema.extend({
  eventName: z.literal('purchase'),
  transactionId: z.string().min(1).max(255),
  value: z.number().positive(),
  items: z.array(gtmEventItemSchema).min(1),
  tax: z.number().nonnegative().optional(),
  shipping: z.number().nonnegative().optional(),
});

export const gtmAddToCartSchema = gtmTrackSchema.extend({
  eventName: z.literal('add_to_cart'),
  productId: z.number().int().positive(),
  productName: z.string().min(1).max(500),
  price: z.number().positive(),
  quantity: z.number().int().positive().min(1),
});

// ============================================================================
// Checkout Abandonment Validation
// ============================================================================

export const checkoutStepSchema = z.enum(['info', 'address', 'payment', 'review', 'completed']);

export const startCheckoutSessionSchema = z.object({
  sessionId: z.string().min(1).max(255),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().max(20).optional().or(z.literal('')),
  cartValue: z.number().nonnegative(),
  cartItemsCount: z.number().int().positive(),
  deviceType: z.enum(['mobile', 'desktop', 'tablet']).optional(),
  browser: z.string().max(100).optional(),
  os: z.string().max(100).optional(),
});

export const updateCheckoutStepSchema = z.object({
  sessionId: z.string().min(1).max(255),
  step: checkoutStepSchema,
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().max(20).optional().or(z.literal('')),
});

export type CheckoutStepUpdate = z.infer<typeof updateCheckoutStepSchema>;

export const markAbandonedSchema = z.object({
  sessionId: z.string().min(1).max(255),
  exitReason: z.enum([
    'shipping_cost',
    'payment_issue',
    'changed_mind',
    'technical_issue',
    'slow_delivery',
    'no_payment_method',
    'other',
  ]).optional(),
  exitPage: z.string().url().optional(),
});

export const checkoutFormatSchema = z.enum(['one-page', 'multi-step']);

// ============================================================================
// Helper Functions
// ============================================================================

export function validateGtmEvent(data: unknown) {
  const result = gtmTrackSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
  }
  return { valid: true, data: result.data };
}

export function validateCheckoutSession(data: unknown) {
  const result = startCheckoutSessionSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
  }
  return { valid: true, data: result.data };
}
