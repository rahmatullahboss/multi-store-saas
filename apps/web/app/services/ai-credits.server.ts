import { checkCredits, deductCredits } from '~/utils/credit.server';

export type CreditGateResult =
  | { allowed: true; currentBalance: number }
  | { allowed: false; status: number; code: string; error: string };

export async function requireCredits(
  db: Parameters<typeof checkCredits>[0],
  storeId: number,
  cost: number,
  context: 'merchant' | 'customer' | 'super_admin' | 'omnichannel'
): Promise<CreditGateResult> {
  const creditCheck = await checkCredits(db, storeId, cost);
  if (creditCheck.allowed) return { allowed: true, currentBalance: creditCheck.currentBalance };

  if (context === 'customer' || context === 'omnichannel') {
    return {
      allowed: false,
      status: 503,
      code: 'STORE_LIMIT_REACHED',
      error: 'AI assistant is currently unavailable.',
    };
  }

  return {
    allowed: false,
    status: 402,
    code: 'INSUFFICIENT_CREDITS',
    error: `Insufficient credits. This action costs ${cost} credits.`,
  };
}

export async function chargeCredits(
  db: Parameters<typeof deductCredits>[0],
  storeId: number,
  cost: number,
  description: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  return deductCredits(db, storeId, cost, description, metadata);
}
