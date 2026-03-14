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
