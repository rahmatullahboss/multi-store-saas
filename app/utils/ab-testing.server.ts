/**
 * A/B Testing Server Utilities
 * 
 * Handles visitor assignment to test variants with sticky sessions.
 * Uses cookies to ensure visitors see the same variant consistently.
 */

import { drizzle } from 'drizzle-orm/d1';
import { abTests, abTestVariants, abTestAssignments } from '@db/schema';
import { eq, and } from 'drizzle-orm';

export interface VisitorAssignment {
  testId: number;
  variantId: number;
  visitorId: string;
  landingConfig: string | null;
  variantName: string;
}

/**
 * Generate a unique visitor ID
 */
export function generateVisitorId(): string {
  return `vis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get or create visitor ID from cookie
 */
export function getVisitorId(request: Request): { visitorId: string; isNew: boolean } {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => c.split('='))
  );
  
  const existingId = cookies['ab_visitor_id'];
  if (existingId) {
    return { visitorId: existingId, isNew: false };
  }
  
  return { visitorId: generateVisitorId(), isNew: true };
}

/**
 * Create Set-Cookie header for visitor ID
 */
export function createVisitorCookie(visitorId: string): string {
  // 1 year expiry
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  return `ab_visitor_id=${visitorId}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Check for running A/B tests and assign visitor to variant
 */
export async function getVisitorVariant(
  d1: D1Database,
  storeId: number,
  productId: number | null,
  visitorId: string
): Promise<VisitorAssignment | null> {
  const db = drizzle(d1);
  
  // Find running tests for this store/product
  const runningTests = await db
    .select()
    .from(abTests)
    .where(
      and(
        eq(abTests.storeId, storeId),
        eq(abTests.status, 'running'),
        productId ? eq(abTests.productId, productId) : undefined
      )
    )
    .limit(1);
  
  if (runningTests.length === 0) {
    return null;
  }
  
  const test = runningTests[0];
  
  // Check if visitor already assigned
  const existingAssignment = await db
    .select({
      variantId: abTestAssignments.variantId,
    })
    .from(abTestAssignments)
    .where(
      and(
        eq(abTestAssignments.testId, test.id),
        eq(abTestAssignments.visitorId, visitorId)
      )
    )
    .limit(1);
  
  if (existingAssignment.length > 0) {
    // Return existing assignment
    const variant = await db
      .select({
        id: abTestVariants.id,
        name: abTestVariants.name,
        landingConfig: abTestVariants.landingConfig,
      })
      .from(abTestVariants)
      .where(eq(abTestVariants.id, existingAssignment[0].variantId))
      .limit(1);
    
    if (variant.length > 0) {
      return {
        testId: test.id,
        variantId: variant[0].id,
        visitorId,
        landingConfig: variant[0].landingConfig,
        variantName: variant[0].name,
      };
    }
  }
  
  // Assign to new variant based on traffic weights
  const variants = await db
    .select()
    .from(abTestVariants)
    .where(eq(abTestVariants.testId, test.id));
  
  if (variants.length === 0) {
    return null;
  }
  
  // Calculate total weight and select variant
  const totalWeight = variants.reduce((sum, v) => sum + (v.trafficWeight || 0), 0);
  const random = Math.random() * totalWeight;
  
  let cumulative = 0;
  let selectedVariant = variants[0];
  
  for (const variant of variants) {
    cumulative += variant.trafficWeight || 0;
    if (random <= cumulative) {
      selectedVariant = variant;
      break;
    }
  }
  
  // Create assignment
  await db.insert(abTestAssignments).values({
    testId: test.id,
    variantId: selectedVariant.id,
    visitorId,
  });
  
  // Increment variant visitors (non-blocking via raw SQL)
  await d1.prepare(
    'UPDATE ab_test_variants SET visitors = visitors + 1 WHERE id = ?'
  ).bind(selectedVariant.id).run();
  
  return {
    testId: test.id,
    variantId: selectedVariant.id,
    visitorId,
    landingConfig: selectedVariant.landingConfig,
    variantName: selectedVariant.name,
  };
}

/**
 * Track conversion for A/B test
 */
export async function trackABConversion(
  d1: D1Database,
  storeId: number,
  productId: number | null,
  visitorId: string,
  orderAmount: number
): Promise<void> {
  const db = drizzle(d1);
  
  // Find running tests
  const runningTests = await db
    .select({ id: abTests.id })
    .from(abTests)
    .where(
      and(
        eq(abTests.storeId, storeId),
        eq(abTests.status, 'running'),
        productId ? eq(abTests.productId, productId) : undefined
      )
    )
    .limit(1);
  
  if (runningTests.length === 0) return;
  
  const testId = runningTests[0].id;
  
  // Find visitor's assignment
  const assignment = await db
    .select()
    .from(abTestAssignments)
    .where(
      and(
        eq(abTestAssignments.testId, testId),
        eq(abTestAssignments.visitorId, visitorId)
      )
    )
    .limit(1);
  
  if (assignment.length === 0) return;
  
  // Update assignment with conversion
  await db
    .update(abTestAssignments)
    .set({
      convertedAt: new Date(),
      orderAmount,
    })
    .where(eq(abTestAssignments.id, assignment[0].id));
  
  // Update variant stats
  await d1.prepare(
    'UPDATE ab_test_variants SET conversions = conversions + 1, revenue = revenue + ? WHERE id = ?'
  ).bind(orderAmount, assignment[0].variantId).run();
}

/**
 * Calculate statistical significance between variants
 * Using Chi-squared approximation
 */
export function calculateSignificance(
  controlVisitors: number,
  controlConversions: number,
  variantVisitors: number,
  variantConversions: number
): { significant: boolean; confidence: number } {
  if (controlVisitors === 0 || variantVisitors === 0) {
    return { significant: false, confidence: 0 };
  }
  
  const controlRate = controlConversions / controlVisitors;
  const variantRate = variantConversions / variantVisitors;
  
  // Pooled proportion
  const pooledP = (controlConversions + variantConversions) / (controlVisitors + variantVisitors);
  
  // Standard error
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / controlVisitors + 1 / variantVisitors));
  
  if (se === 0) {
    return { significant: false, confidence: 0 };
  }
  
  // Z-score
  const z = Math.abs(variantRate - controlRate) / se;
  
  // Convert to confidence (simplified)
  // z >= 1.96 = 95% confidence
  // z >= 2.58 = 99% confidence
  let confidence = 0;
  if (z >= 2.58) confidence = 99;
  else if (z >= 1.96) confidence = 95;
  else if (z >= 1.645) confidence = 90;
  else confidence = Math.min(Math.round(z / 1.96 * 95), 89);
  
  return {
    significant: confidence >= 95,
    confidence,
  };
}
