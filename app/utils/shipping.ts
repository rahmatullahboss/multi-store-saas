/**
 * Simplified Shipping Calculator for Bangladesh SMEs
 * 
 * Inside Dhaka / Outside Dhaka is the most common model in BD.
 * This avoids complex zone-based shipping for smaller businesses.
 */

// Default shipping rates (in BDT)
export const DEFAULT_SHIPPING_CONFIG = {
  insideDhaka: 60,
  outsideDhaka: 120,
  freeShippingAbove: 0, // 0 = no free shipping
  enabled: true,
};

export type ShippingConfig = typeof DEFAULT_SHIPPING_CONFIG;

// All divisions in Bangladesh
export const BD_DIVISIONS = [
  { value: 'dhaka', label: 'ঢাকা (Dhaka)', isInsideDhaka: true },
  { value: 'chittagong', label: 'চট্টগ্রাম (Chittagong)', isInsideDhaka: false },
  { value: 'rajshahi', label: 'রাজশাহী (Rajshahi)', isInsideDhaka: false },
  { value: 'khulna', label: 'খুলনা (Khulna)', isInsideDhaka: false },
  { value: 'barisal', label: 'বরিশাল (Barisal)', isInsideDhaka: false },
  { value: 'sylhet', label: 'সিলেট (Sylhet)', isInsideDhaka: false },
  { value: 'rangpur', label: 'রংপুর (Rangpur)', isInsideDhaka: false },
  { value: 'mymensingh', label: 'ময়মনসিংহ (Mymensingh)', isInsideDhaka: false },
] as const;

export type DivisionValue = typeof BD_DIVISIONS[number]['value'];

/**
 * Parse shipping config from JSON string
 */
export function parseShippingConfig(json: string | null | undefined): ShippingConfig {
  if (!json) return DEFAULT_SHIPPING_CONFIG;
  try {
    const parsed = JSON.parse(json);
    return {
      insideDhaka: parsed.insideDhaka ?? DEFAULT_SHIPPING_CONFIG.insideDhaka,
      outsideDhaka: parsed.outsideDhaka ?? DEFAULT_SHIPPING_CONFIG.outsideDhaka,
      freeShippingAbove: parsed.freeShippingAbove ?? DEFAULT_SHIPPING_CONFIG.freeShippingAbove,
      enabled: parsed.enabled ?? DEFAULT_SHIPPING_CONFIG.enabled,
    };
  } catch {
    return DEFAULT_SHIPPING_CONFIG;
  }
}

/**
 * Calculate shipping cost based on division and subtotal
 */
export function calculateShipping(
  config: ShippingConfig,
  division: DivisionValue | string,
  subtotal: number
): { cost: number; isFree: boolean; label: string } {
  // If shipping not enabled, return 0
  if (!config.enabled) {
    return { cost: 0, isFree: true, label: 'ফ্রি ডেলিভারি' };
  }

  // Check if division is Dhaka (inside/outside)
  const divisionInfo = BD_DIVISIONS.find(d => d.value === division);
  const isInsideDhaka = divisionInfo?.isInsideDhaka ?? false;

  // Calculate base shipping cost
  const baseCost = isInsideDhaka ? config.insideDhaka : config.outsideDhaka;

  // Check for free shipping threshold
  if (config.freeShippingAbove > 0 && subtotal >= config.freeShippingAbove) {
    return { 
      cost: 0, 
      isFree: true, 
      label: `ফ্রি ডেলিভারি (৳${config.freeShippingAbove}+ অর্ডারে)` 
    };
  }

  return {
    cost: baseCost,
    isFree: false,
    label: isInsideDhaka ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে',
  };
}

/**
 * Get shipping estimate text
 */
export function getShippingEstimate(division: DivisionValue | string): string {
  const divisionInfo = BD_DIVISIONS.find(d => d.value === division);
  
  if (divisionInfo?.isInsideDhaka) {
    return '২৪ ঘণ্টার মধ্যে ডেলিভারি';
  }
  
  return '২-৩ কার্যদিবসে ডেলিভারি';
}
