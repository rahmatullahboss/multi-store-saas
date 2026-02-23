/**
 * Fraud Detection Engine
 *
 * Bangladesh-focused COD fraud prevention system.
 * Calculates risk scores based on multiple signals and returns
 * decisions (ALLOW, VERIFY, HOLD, BLOCK).
 *
 * Signals:
 * - Internal order history (return rate, cancel rate)
 * - Phone blacklist check
 * - Order velocity (burst detection)
 * - Payment method (COD vs prepaid)
 * - Address quality
 * - Customer profile (new vs repeat)
 */

import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, and, or, isNull } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface FraudSettings {
  enabled: boolean;
  thresholds: {
    verify: number;  // Score above this → require OTP/verification
    hold: number;    // Score above this → manual review
    block: number;   // Score above this → auto-block
  };
  autoHideCOD: boolean;      // Hide COD for high-risk customers
  requireOTPForCOD: boolean; // Require OTP for all COD orders
  maxCODAmount: number | null; // Max COD amount before requiring advance
}

export interface RiskSignal {
  name: string;
  score: number;        // Positive = more risky, Negative = less risky
  description: string;
  descriptionBn: string;
}

export type FraudDecision = 'allow' | 'verify' | 'hold' | 'block';

export interface RiskAssessment {
  totalScore: number;
  clampedScore: number; // 0-100
  decision: FraudDecision;
  signals: RiskSignal[];
  isBlacklisted: boolean;
}

export interface RiskCheckParams {
  phone: string;
  storeId: number;
  orderTotal: number;
  paymentMethod: string;
  shippingAddress?: string; // JSON string or raw address
  isOTPVerified?: boolean;
  db: DrizzleD1Database<any>;
  skipExternalCheck?: boolean; // Skip external API call (for speed)
}

// ============================================================================
// EXTERNAL FRAUD CHECKER (fraudchecker.link)
// ============================================================================

export interface ExternalCourierData {
  name: string;
  orders: number;
  delivered: number;
  cancelled: number;
  delivery_rate: string;
}

export interface ExternalFraudData {
  phoneNumber: string;
  totalOrders: number;
  totalDelivered: number;
  totalCancelled: number;
  deliveryRate: number;
  riskLevel: 'excellent' | 'good' | 'moderate' | 'high' | 'critical';
  riskMessage: string;
  riskColor: string;
  couriers: ExternalCourierData[];
}

/**
 * Fetch external fraud data from fraudchecker.link
 * Uses Bangladesh courier data (Steadfast, Pathao, RedX)
 */
export async function fetchExternalFraudData(
  phone: string
): Promise<ExternalFraudData | null> {
  const normalized = normalizePhone(phone);
  const url = `https://fraudchecker.link/free-fraud-checker-bd/api/search.php?phone=${normalized}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Referer: 'https://fraudchecker.link/free-fraud-checker-bd/',
        'User-Agent':
          'Mozilla/5.0 (compatible; FraudChecker/1.0)',
      },
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const result = await response.json() as { success: boolean; data: ExternalFraudData };
    if (!result.success || !result.data) return null;

    return result.data;
  } catch (error) {
    // Don't fail fraud check if external API is down
    console.warn('[FRAUD] External fraud check failed:', error);
    return null;
  }
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

export const DEFAULT_FRAUD_SETTINGS: FraudSettings = {
  enabled: true,
  thresholds: {
    verify: 30,
    hold: 60,
    block: 80,
  },
  autoHideCOD: false,
  requireOTPForCOD: false,
  maxCODAmount: null,
};

// ============================================================================
// PHONE NORMALIZATION
// ============================================================================

/**
 * Normalize Bangladesh phone number to standard 01XXXXXXXXX format.
 * Handles: +8801..., 8801..., 01..., 1...
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Remove +880 or 880 prefix
  if (digits.startsWith('880') && digits.length >= 13) {
    digits = '0' + digits.slice(3);
  }

  // Add leading 0 if missing (e.g., "1712345678" → "01712345678")
  if (digits.startsWith('1') && digits.length === 10) {
    digits = '0' + digits;
  }

  return digits;
}

/**
 * Validate if phone looks like a valid BD mobile number
 */
export function isValidBDPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // BD mobile: 01[3-9]XXXXXXXX (11 digits total)
  return /^01[3-9]\d{8}$/.test(normalized);
}

// ============================================================================
// BLACKLIST CHECK
// ============================================================================

/**
 * Check if a phone number is blacklisted (store-level or global)
 */
export async function isBlacklisted(
  phone: string,
  storeId: number,
  db: DrizzleD1Database<any>
): Promise<boolean> {
  const { phoneBlacklist } = await import('@db/schema');
  const normalized = normalizePhone(phone);

  const result = await db
    .select({ id: phoneBlacklist.id })
    .from(phoneBlacklist)
    .where(
      and(
        eq(phoneBlacklist.phone, normalized),
        or(
          eq(phoneBlacklist.storeId, storeId),
          isNull(phoneBlacklist.storeId)  // global blacklist
        )
      )
    )
    .limit(1);

  return result.length > 0;
}

// ============================================================================
// RISK SCORING ENGINE
// ============================================================================

/**
 * Calculate risk score for a customer/order combination.
 * Returns a RiskAssessment with all contributing signals.
 */
export async function calculateRiskScore(
  params: RiskCheckParams
): Promise<RiskAssessment> {
  const { phone, storeId, orderTotal, paymentMethod, shippingAddress, isOTPVerified, db, skipExternalCheck } = params;
  const { orders } = await import('@db/schema');

  const normalizedPhone = normalizePhone(phone);
  const signals: RiskSignal[] = [];

  // ============================
  // SIGNAL 1: Blacklist check
  // ============================
  const blacklisted = await isBlacklisted(normalizedPhone, storeId, db);
  if (blacklisted) {
    return {
      totalScore: 100,
      clampedScore: 100,
      decision: 'block',
      signals: [{
        name: 'blacklisted',
        score: 100,
        description: 'Phone number is blacklisted',
        descriptionBn: 'ফোন নম্বর ব্ল্যাকলিস্টে আছে',
      }],
      isBlacklisted: true,
    };
  }

  // ============================
  // SIGNAL 2: Payment method
  // ============================
  const isCOD = paymentMethod === 'cod' || paymentMethod === 'COD';
  if (isCOD) {
    signals.push({
      name: 'cod_order',
      score: 20,
      description: 'Cash on Delivery order',
      descriptionBn: 'ক্যাশ অন ডেলিভারি অর্ডার',
    });
  } else {
    signals.push({
      name: 'prepaid_verified',
      score: -40,
      description: 'Prepaid/verified payment',
      descriptionBn: 'অগ্রিম/ভেরিফাইড পেমেন্ট',
    });
  }

  // ============================
  // SIGNAL 3: Customer history (internal DB)
  // ============================
  const allOrders = await db
    .select({
      status: orders.status,
      courierStatus: orders.courierStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerPhone, normalizedPhone));

  const totalOrders = allOrders.length;

  if (totalOrders === 0) {
    // New customer
    signals.push({
      name: 'first_time_customer',
      score: isCOD ? 10 : 5,
      description: 'First-time customer (no order history)',
      descriptionBn: 'নতুন কাস্টমার (কোনো অর্ডার ইতিহাস নেই)',
    });
  } else {
    // Calculate return rate from SHIPPED orders
    let deliveredCount = 0;
    let returnedCount = 0;
    let cancelledRecent = 0;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const o of allOrders) {
      const status = o.status?.toLowerCase() || '';
      const courierStatus = o.courierStatus?.toLowerCase() || '';

      if (status === 'delivered' || courierStatus === 'delivered') {
        deliveredCount++;
      } else if (courierStatus === 'returned') {
        returnedCount++;
      }

      // Count recent cancels (within 7 days)
      if (status === 'cancelled' && o.createdAt && new Date(o.createdAt) >= sevenDaysAgo) {
        cancelledRecent++;
      }
    }

    const shippedTotal = deliveredCount + returnedCount;
    const returnRate = shippedTotal > 0 ? (returnedCount / shippedTotal) * 100 : 0;

    // High return rate
    if (shippedTotal >= 2 && returnRate > 30) {
      signals.push({
        name: 'high_return_rate',
        score: 30,
        description: `High return rate: ${Math.round(returnRate)}% (${returnedCount}/${shippedTotal} shipped orders returned)`,
        descriptionBn: `উচ্চ রিটার্ন রেট: ${Math.round(returnRate)}% (${returnedCount}/${shippedTotal} শিপড অর্ডার রিটার্ন)`,
      });
    }

    // Repeat customer with good history
    if (deliveredCount >= 2 && returnRate <= 10) {
      signals.push({
        name: 'good_history',
        score: -25,
        description: `Good customer: ${deliveredCount} successful deliveries`,
        descriptionBn: `ভালো কাস্টমার: ${deliveredCount} সফল ডেলিভারি`,
      });
    }

    // Multiple cancels in last 7 days
    if (cancelledRecent >= 3) {
      signals.push({
        name: 'recent_cancels',
        score: 20,
        description: `${cancelledRecent} cancellations in last 7 days`,
        descriptionBn: `গত ৭ দিনে ${cancelledRecent}টি ক্যান্সেলেশন`,
      });
    }
  }

  // ============================
  // SIGNAL 4: High-value COD
  // ============================
  // Check if store has configured a threshold
  if (isCOD && orderTotal >= 5000) {
    signals.push({
      name: 'high_value_cod',
      score: 15,
      description: `High-value COD: ৳${orderTotal}`,
      descriptionBn: `উচ্চ মূল্যের COD: ৳${orderTotal}`,
    });
  }

  // ============================
  // SIGNAL 5: OTP verification
  // ============================
  if (isOTPVerified) {
    signals.push({
      name: 'otp_verified',
      score: -15,
      description: 'Phone verified via OTP',
      descriptionBn: 'OTP দ্বারা ফোন ভেরিফাইড',
    });
  } else if (isCOD) {
    signals.push({
      name: 'no_otp',
      score: 15,
      description: 'Phone not OTP-verified',
      descriptionBn: 'ফোন OTP-ভেরিফাইড নয়',
    });
  }

  // ============================
  // SIGNAL 6: Order velocity
  // ============================
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOrders = allOrders.filter(
    (o) => o.createdAt && new Date(o.createdAt) >= oneDayAgo
  );

  if (recentOrders.length >= 3) {
    signals.push({
      name: 'high_velocity',
      score: 15,
      description: `${recentOrders.length} orders in last 24 hours`,
      descriptionBn: `গত ২৪ ঘণ্টায় ${recentOrders.length}টি অর্ডার`,
    });
  }

  // ============================
  // SIGNAL 7: Address quality
  // ============================
  if (shippingAddress) {
    let addressText = '';
    try {
      const parsed = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
      addressText = parsed.address || parsed.address1 || '';
    } catch {
      addressText = shippingAddress;
    }

    if (addressText.length < 15 && addressText.length > 0) {
      signals.push({
        name: 'short_address',
        score: 10,
        description: 'Shipping address is very short/vague',
        descriptionBn: 'ঠিকানা খুব ছোট/অস্পষ্ট',
      });
    }
  }

  // ============================
  // SIGNAL 8: External courier data (fraudchecker.link)
  // ============================
  if (!skipExternalCheck) {
    const externalData = await fetchExternalFraudData(normalizedPhone);

    if (externalData && externalData.totalOrders >= 3) {
      const { deliveryRate, riskLevel, totalOrders, totalDelivered } = externalData;

      if (riskLevel === 'critical' || deliveryRate < 20) {
        signals.push({
          name: 'external_critical_risk',
          score: 40,
          description: `External data: Critical risk — ${deliveryRate.toFixed(1)}% delivery rate (${totalDelivered}/${totalOrders} delivered)`,
          descriptionBn: `বাইরের ডেটা: অতি উচ্চ ঝুঁকি — ${deliveryRate.toFixed(1)}% ডেলিভারি রেট (${totalDelivered}/${totalOrders})`,
        });
      } else if (riskLevel === 'high' || deliveryRate < 40) {
        signals.push({
          name: 'external_high_risk',
          score: 25,
          description: `External data: High risk — ${deliveryRate.toFixed(1)}% delivery rate (${totalDelivered}/${totalOrders} delivered)`,
          descriptionBn: `বাইরের ডেটা: উচ্চ ঝুঁকি — ${deliveryRate.toFixed(1)}% ডেলিভারি রেট (${totalDelivered}/${totalOrders})`,
        });
      } else if (riskLevel === 'moderate' || deliveryRate < 60) {
        signals.push({
          name: 'external_moderate_risk',
          score: 12,
          description: `External data: Moderate risk — ${deliveryRate.toFixed(1)}% delivery rate (${totalDelivered}/${totalOrders} delivered)`,
          descriptionBn: `বাইরের ডেটা: মাঝারি ঝুঁকি — ${deliveryRate.toFixed(1)}% ডেলিভারি রেট (${totalDelivered}/${totalOrders})`,
        });
      } else if (riskLevel === 'excellent' || deliveryRate >= 80) {
        signals.push({
          name: 'external_excellent',
          score: -20,
          description: `External data: Excellent customer — ${deliveryRate.toFixed(1)}% delivery rate across ${totalOrders} orders`,
          descriptionBn: `বাইরের ডেটা: চমৎকার কাস্টমার — ${deliveryRate.toFixed(1)}% ডেলিভারি রেট (${totalOrders}টি অর্ডার)`,
        });
      } else if (riskLevel === 'good' || deliveryRate >= 65) {
        signals.push({
          name: 'external_good',
          score: -10,
          description: `External data: Good customer — ${deliveryRate.toFixed(1)}% delivery rate`,
          descriptionBn: `বাইরের ডেটা: ভালো কাস্টমার — ${deliveryRate.toFixed(1)}% ডেলিভারি রেট`,
        });
      }
    }
  }

  // ============================
  // CALCULATE FINAL SCORE
  // ============================
  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
  const clampedScore = Math.max(0, Math.min(100, totalScore));

  return {
    totalScore,
    clampedScore,
    decision: 'allow', // Will be set by getDecision()
    signals,
    isBlacklisted: false,
  };
}

// ============================================================================
// DECISION ENGINE
// ============================================================================

/**
 * Map a risk score to a fraud decision using store-level thresholds
 */
export function getDecision(
  score: number,
  settings: FraudSettings = DEFAULT_FRAUD_SETTINGS
): FraudDecision {
  if (score >= settings.thresholds.block) return 'block';
  if (score >= settings.thresholds.hold) return 'hold';
  if (score >= settings.thresholds.verify) return 'verify';
  return 'allow';
}

/**
 * Full fraud check: calculate score + determine decision + log event
 */
export async function performFraudCheck(
  params: RiskCheckParams & { orderId?: number; settings?: FraudSettings }
): Promise<RiskAssessment> {
  const { orderId, settings = DEFAULT_FRAUD_SETTINGS, ...checkParams } = params;
  const { fraudEvents } = await import('@db/schema');

  // Calculate risk
  const assessment = await calculateRiskScore(checkParams);

  // Determine decision
  assessment.decision = assessment.isBlacklisted
    ? 'block'
    : getDecision(assessment.clampedScore, settings);

  // Log the fraud event
  const normalizedPhone = normalizePhone(checkParams.phone);
  try {
    await checkParams.db.insert(fraudEvents).values({
      storeId: checkParams.storeId,
      orderId: orderId || null,
      phone: normalizedPhone,
      riskScore: assessment.clampedScore,
      decision: assessment.decision,
      signals: JSON.stringify(assessment.signals),
      resolvedBy: assessment.decision === 'allow' ? 'auto' : null,
      resolvedAt: assessment.decision === 'allow' ? new Date() : null,
    });
  } catch (error) {
    console.error('[FRAUD] Failed to log fraud event:', error);
    // Don't fail the order because logging failed
  }

  return assessment;
}

// ============================================================================
// BLACKLIST MANAGEMENT
// ============================================================================

/**
 * Add a phone number to the blacklist
 */
export async function addToBlacklist(
  phone: string,
  storeId: number | null,
  reason: string,
  addedBy: 'system' | 'merchant' | 'admin',
  db: DrizzleD1Database<any>
): Promise<void> {
  const { phoneBlacklist } = await import('@db/schema');
  const normalized = normalizePhone(phone);

  // Check if already blacklisted
  const existing = await isBlacklisted(normalized, storeId || 0, db);
  if (existing) return;

  await db.insert(phoneBlacklist).values({
    phone: normalized,
    storeId,
    reason,
    addedBy,
  });
}

/**
 * Remove a phone number from the blacklist
 */
export async function removeFromBlacklist(
  phone: string,
  storeId: number,
  db: DrizzleD1Database<any>
): Promise<void> {
  const { phoneBlacklist } = await import('@db/schema');
  const normalized = normalizePhone(phone);

  await db
    .delete(phoneBlacklist)
    .where(
      and(
        eq(phoneBlacklist.phone, normalized),
        eq(phoneBlacklist.storeId, storeId)
      )
    );
}

// ============================================================================
// STORE SETTINGS HELPER
// ============================================================================

/**
 * Parse fraud settings from store record, with defaults
 */
export function parseFraudSettings(raw: string | null | undefined): FraudSettings {
  if (!raw) return DEFAULT_FRAUD_SETTINGS;

  try {
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled ?? DEFAULT_FRAUD_SETTINGS.enabled,
      thresholds: {
        verify: parsed.thresholds?.verify ?? DEFAULT_FRAUD_SETTINGS.thresholds.verify,
        hold: parsed.thresholds?.hold ?? DEFAULT_FRAUD_SETTINGS.thresholds.hold,
        block: parsed.thresholds?.block ?? DEFAULT_FRAUD_SETTINGS.thresholds.block,
      },
      autoHideCOD: parsed.autoHideCOD ?? DEFAULT_FRAUD_SETTINGS.autoHideCOD,
      requireOTPForCOD: parsed.requireOTPForCOD ?? DEFAULT_FRAUD_SETTINGS.requireOTPForCOD,
      maxCODAmount: parsed.maxCODAmount ?? DEFAULT_FRAUD_SETTINGS.maxCODAmount,
    };
  } catch {
    return DEFAULT_FRAUD_SETTINGS;
  }
}
