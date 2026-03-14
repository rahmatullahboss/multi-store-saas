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

export interface FraudAssessment {
  rawScore: number;
  clampedScore: number;
  signals: FraudSignal[];
}

export interface FraudSettings {
  allowThreshold: number;
  verifyThreshold: number;
  holdThreshold: number;
}

export const DEFAULT_FRAUD_SETTINGS: FraudSettings = {
  allowThreshold: 30,
  verifyThreshold: 60,
  holdThreshold: 80,
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
      allowThreshold: parsed.allowThreshold ?? DEFAULT_FRAUD_SETTINGS.allowThreshold,
      verifyThreshold: parsed.verifyThreshold ?? DEFAULT_FRAUD_SETTINGS.verifyThreshold,
      holdThreshold: parsed.holdThreshold ?? DEFAULT_FRAUD_SETTINGS.holdThreshold,
    };
  } catch {
    return { ...DEFAULT_FRAUD_SETTINGS };
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
  storeId: number;
  db: unknown;
}): Promise<{ found: boolean; data: Record<string, unknown>[] }> {
  // Stub — real implementation queries external fraud APIs
  return { found: false, data: [] };
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
