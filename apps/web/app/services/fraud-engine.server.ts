export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length >= 13) {
    digits = '0' + digits.slice(3);
  }
  if (digits.startsWith('1') && digits.length === 10) {
    digits = '0' + digits;
  }
  return digits;
}

export function isValidBDPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
}

// ============================================================================
// FRAUD SCORING ENGINE
// ============================================================================

export interface FraudSignal {
  name: string;
  score: number;
  description: string;
}

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

export interface FraudAssessment {
  rawScore: number;
  clampedScore: number;
  signals: FraudSignal[];
}

export interface FraudSettings {
  enabled: boolean;
  allowThreshold: number;
  verifyThreshold: number;
  holdThreshold: number;
  // COD control thresholds (delivery rate %)
  codAutoConfirmAboveRate: number; // >= this rate → auto-confirm
  codBlockBelowRate: number;       // < this rate → block COD
  autoDispatchCourier: boolean;     // Auto-book courier after auto-confirm
}

export const DEFAULT_FRAUD_SETTINGS: FraudSettings = {
  enabled: true,
  allowThreshold: 30,
  verifyThreshold: 60,
  holdThreshold: 80,
  codAutoConfirmAboveRate: 80, // 80%+ delivery rate → auto-confirm
  codBlockBelowRate: 30,       // <30% delivery rate → block COD
  autoDispatchCourier: false,
};

export interface RiskScoreInput {
  phone: string;
  storeId: number;
  orderTotal: number;
  paymentMethod?: string;
  shippingAddress?: string;
  db: unknown;
  skipExternalCheck?: boolean;
  ipAddress?: string;
  cfCountry?: string;
  cfDeviceType?: string;
  userAgent?: string;
}

/**
 * Calculate risk score for a given order/phone combination.
 * Runs multiple signal checks and returns a composite score.
 */
export async function calculateRiskScore(input: RiskScoreInput): Promise<FraudAssessment> {
  const signals: FraudSignal[] = [];
  let totalScore = 0;

  // Signal: COD orders are higher risk
  if (input.paymentMethod === 'cod') {
    const score = 15;
    totalScore += score;
    signals.push({ name: 'cod_payment', score, description: 'Cash on delivery order' });
  }

  // Signal: High-value orders
  if (input.orderTotal > 10000) {
    const score = 10;
    totalScore += score;
    signals.push({ name: 'high_value_order', score, description: `Order total ৳${input.orderTotal} exceeds ৳10,000` });
  }

  // Signal: Non-BD country
  if (input.cfCountry && input.cfCountry !== 'BD') {
    const score = 20;
    totalScore += score;
    signals.push({ name: 'foreign_ip', score, description: `Request from ${input.cfCountry} (non-BD)` });
  }

  // Signal: Missing or suspicious user agent
  if (!input.userAgent || input.userAgent.length < 10) {
    const score = 10;
    totalScore += score;
    signals.push({ name: 'suspicious_ua', score, description: 'Missing or suspicious user agent' });
  }

  // ============================
  // SIGNAL 8: External courier data (fraudchecker.link)
  // ============================
  if (!input.skipExternalCheck) {
    const extResp = await fetchExternalFraudData({ phone: input.phone, storeId: input.storeId, db: input.db });
    const externalData = extResp.data;

    if (externalData && externalData.totalOrders >= 3) {
      const { deliveryRate, riskLevel, totalOrders, totalDelivered } = externalData;

      if (riskLevel === 'critical' || deliveryRate < 20) {
        signals.push({
          name: 'external_critical_risk',
          score: 40,
          description: `External data: Critical risk — ${deliveryRate.toFixed(1)}% delivery rate (${totalDelivered}/${totalOrders} delivered)`,
        });
        totalScore += 40;
      } else if (riskLevel === 'high' || deliveryRate < 40) {
        signals.push({
          name: 'external_high_risk',
          score: 25,
          description: `External data: High risk — ${deliveryRate.toFixed(1)}% delivery rate (${totalDelivered}/${totalOrders} delivered)`,
        });
        totalScore += 25;
      } else if (riskLevel === 'moderate' || deliveryRate < 60) {
        signals.push({
          name: 'external_moderate_risk',
          score: 12,
          description: `External data: Moderate risk — ${deliveryRate.toFixed(1)}% delivery rate (${totalDelivered}/${totalOrders} delivered)`,
        });
        totalScore += 12;
      } else if (riskLevel === 'excellent' || deliveryRate >= 80) {
        signals.push({
          name: 'external_excellent',
          score: -20,
          description: `External data: Excellent customer — ${deliveryRate.toFixed(1)}% delivery rate across ${totalOrders} orders`,
        });
        totalScore -= 20;
      } else if (riskLevel === 'good' || deliveryRate >= 65) {
        signals.push({
          name: 'external_good',
          score: -10,
          description: `External data: Good customer — ${deliveryRate.toFixed(1)}% delivery rate`,
        });
        totalScore -= 10;
      }
    }
  }

  const clampedScore = Math.min(100, Math.max(0, totalScore));

  return {
    rawScore: totalScore,
    clampedScore,
    signals,
  };
}

/**
 * Determine fraud decision based on risk score and settings thresholds.
 */
export function getDecision(score: number, settings: FraudSettings): string {
  if (score >= settings.holdThreshold) return 'block';
  if (score >= settings.verifyThreshold) return 'hold';
  if (score >= settings.allowThreshold) return 'verify';
  return 'allow';
}

// ============================================================================
// FRAUD SETTINGS PARSER
// ============================================================================

/**
 * Parse fraud settings from a JSON string (stored in stores.fraudSettings column).
 * Falls back to DEFAULT_FRAUD_SETTINGS on parse error.
 */
export function parseFraudSettings(raw?: string | null): FraudSettings {
  if (!raw) return { ...DEFAULT_FRAUD_SETTINGS };
  try {
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled ?? DEFAULT_FRAUD_SETTINGS.enabled,
      allowThreshold: parsed.allowThreshold ?? DEFAULT_FRAUD_SETTINGS.allowThreshold,
      verifyThreshold: parsed.verifyThreshold ?? DEFAULT_FRAUD_SETTINGS.verifyThreshold,
      holdThreshold: parsed.holdThreshold ?? DEFAULT_FRAUD_SETTINGS.holdThreshold,
      codAutoConfirmAboveRate: parsed.codAutoConfirmAboveRate ?? DEFAULT_FRAUD_SETTINGS.codAutoConfirmAboveRate,
      codBlockBelowRate: parsed.codBlockBelowRate ?? DEFAULT_FRAUD_SETTINGS.codBlockBelowRate,
      autoDispatchCourier: parsed.autoDispatchCourier ?? DEFAULT_FRAUD_SETTINGS.autoDispatchCourier,
    };
  } catch {
    return { ...DEFAULT_FRAUD_SETTINGS };
  }
}

// ============================================================================
// COD DELIVERY RATE CONTROL (used during checkout)
// ============================================================================

export type CODDecision = 
  | { action: 'auto_confirm'; deliveryRate: number; reason: string }
  | { action: 'pending'; deliveryRate: number; reason: string }
  | { action: 'block_cod'; deliveryRate: number; reason: string }
  | { action: 'skip'; deliveryRate: number; reason: string };

/**
 * Check delivery rate from fraudchecker.link and decide COD behavior.
 * - rate >= codAutoConfirmAboveRate → auto-confirm
 * - rate < codBlockBelowRate → block COD
 * - in between → leave as pending
 * - no data / API down → skip (fail open, leave as pending)
 */
export async function checkCODByDeliveryRate(
  phone: string,
  settings: FraudSettings,
  opts?: { storeId?: number; db?: unknown }
): Promise<CODDecision> {
  if (!settings.enabled) {
    return { action: 'skip', deliveryRate: 0, reason: 'Fraud check disabled' };
  }

  try {
    const result = await fetchExternalFraudData({ phone, storeId: opts?.storeId, db: opts?.db });
    
    if (!result.found || !result.data) {
      return { action: 'skip', deliveryRate: 0, reason: 'No external data found' };
    }

    const deliveryRate = result.data.deliveryRate;
    const totalOrders = result.data.totalOrders;

    // New customers (0 orders) — leave as pending (no data to judge)
    if (totalOrders === 0) {
      return { action: 'skip', deliveryRate: 0, reason: 'New customer, no order history' };
    }

    // Excellent history → auto-confirm
    if (deliveryRate >= settings.codAutoConfirmAboveRate) {
      return {
        action: 'auto_confirm',
        deliveryRate,
        reason: `Delivery rate ${deliveryRate.toFixed(1)}% >= ${settings.codAutoConfirmAboveRate}% threshold`,
      };
    }

    // Terrible history → block COD
    if (deliveryRate < settings.codBlockBelowRate) {
      return {
        action: 'block_cod',
        deliveryRate,
        reason: `Delivery rate ${deliveryRate.toFixed(1)}% < ${settings.codBlockBelowRate}% threshold`,
      };
    }

    // Middle ground → pending for manual review
    return {
      action: 'pending',
      deliveryRate,
      reason: `Delivery rate ${deliveryRate.toFixed(1)}% between thresholds`,
    };
  } catch (error) {
    console.error('[COD RATE CONTROL] Check failed:', error);
    return { action: 'skip', deliveryRate: 0, reason: 'External check failed' };
  }
}

// ============================================================================
// HIGHER-LEVEL FRAUD CHECK (used by internal api.fraud-check.ts)
// ============================================================================

/**
 * Perform a full fraud check for an order — runs calculateRiskScore and
 * returns decision + assessment.
 */
export async function performFraudCheck(input: RiskScoreInput & { fraudSettings?: FraudSettings }) {
  const settings = input.fraudSettings ?? DEFAULT_FRAUD_SETTINGS;
  const assessment = await calculateRiskScore(input);
  const decision = getDecision(assessment.clampedScore, settings);
  return { assessment, decision };
}

// ============================================================================
// BLACKLIST MANAGEMENT
// ============================================================================

/**
 * Add a phone number to the blacklist.
 */
export async function addToBlacklist(params: {
  db: unknown;
  storeId: number;
  phone: string;
  reason?: string;
  blockedBy?: string;
}): Promise<void> {
  // Stub — real implementation hits phoneBlacklist table
  console.log(`[FRAUD] Blacklisted phone ${params.phone} for store ${params.storeId}`);
}

/**
 * Remove a phone number from the blacklist.
 */
export async function removeFromBlacklist(params: {
  db: unknown;
  storeId: number;
  phone: string;
}): Promise<void> {
  // Stub — real implementation removes from phoneBlacklist table
  console.log(`[FRAUD] Unblacklisted phone ${params.phone} for store ${params.storeId}`);
}

// ============================================================================
// EXTERNAL FRAUD DATA
// ============================================================================

/**
 * Fetch fraud data from external sources (e.g., courier APIs, shared blacklists).
 */
export async function fetchExternalFraudData(params: {
  phone: string;
  storeId?: number;
  db?: unknown;
}): Promise<{ found: boolean; data: ExternalFraudData | null }> {
  const normalized = normalizePhone(params.phone);
  const url = `https://fraudchecker.link/free-fraud-checker-bd/api/search.php?phone=${normalized}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Referer: 'https://fraudchecker.link/free-fraud-checker-bd/',
        Origin: 'https://fraudchecker.link',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      // 8 second timeout (allow enough time for slow responses)
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return { found: false, data: null };

    const result = await response.json() as { success: boolean; data: ExternalFraudData };
    if (!result.success || !result.data) return { found: false, data: null };

    return { found: true, data: result.data };
  } catch (error) {
    // Don't fail fraud check if external API is down
    console.warn('[FRAUD] External fraud check failed:', error);
    return { found: false, data: null };
  }
}

// ============================================================================
// OZZYL GUARD CACHE
// ============================================================================

/**
 * Generate a KV cache key for Ozzyl Guard fraud data.
 */
export function ozzylGuardCacheKey(storeId: number, phone: string): string {
  return `guard:${storeId}:${normalizePhone(phone)}`;
}

/**
 * Fetch fraud guard data with KV caching.
 */
export async function fetchAndCacheGuardData(params: {
  storeId: number;
  phones: string[];
  db: unknown;
  kv?: unknown;
}): Promise<Map<string, { score: number; decision: string }>> {
  const results = new Map<string, { score: number; decision: string }>();

  for (const phone of params.phones) {
    const normalized = normalizePhone(phone);
    const assessment = await calculateRiskScore({
      phone: normalized,
      storeId: params.storeId,
      orderTotal: 0,
      db: params.db,
    });
    const decision = getDecision(assessment.clampedScore, DEFAULT_FRAUD_SETTINGS);
    results.set(normalized, { score: assessment.clampedScore, decision });
  }

  return results;
}
