import { stores } from '@db/schema';
import type { Database } from '~/lib/db.server';

export interface StorePolicyBundle {
  storeName: string;
  currency: string;
  deliveryText?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  subscriptionPolicy?: string;
  legalNotice?: string;
  paymentMethods?: string[];
  storeUrl?: string;
  businessName?: string;
}

function safeJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function getStorePolicyBundle(db: Database, storeId: number): Promise<StorePolicyBundle | null> {
  const store = await db.query.stores.findFirst({
    where: (s, { eq }) => eq(s.id, storeId),
    columns: {
      name: true,
      currency: true,
      subdomain: true,
      customDomain: true,
      businessInfo: true,
      shippingConfig: true,
      manualPaymentConfig: true,
      customRefundPolicy: true,
      customShippingPolicy: true,
      customSubscriptionPolicy: true,
      customLegalNotice: true,
    },
  });

  if (!store) return null;

  const businessInfo = safeJson<{ name?: string }>(store.businessInfo);
  const shippingConfig = safeJson<{ insideDhaka?: number; outsideDhaka?: number; freeShippingAbove?: number; enabled?: boolean }>(
    store.shippingConfig
  );
  const paymentConfig = safeJson<Record<string, string | null>>(store.manualPaymentConfig);

  const paymentMethods: string[] = [];
  if (paymentConfig) {
    if (paymentConfig.bkashPersonal || paymentConfig.bkashMerchant) paymentMethods.push('bKash');
    if (paymentConfig.nagadPersonal || paymentConfig.nagadMerchant) paymentMethods.push('Nagad');
  }

  const deliveryParts: string[] = [];
  if (shippingConfig?.enabled) {
    if (shippingConfig.insideDhaka !== undefined) {
      deliveryParts.push(`Dhaka: ৳${shippingConfig.insideDhaka}`);
    }
    if (shippingConfig.outsideDhaka !== undefined) {
      deliveryParts.push(`Outside Dhaka: ৳${shippingConfig.outsideDhaka}`);
    }
    if (shippingConfig.freeShippingAbove !== undefined) {
      deliveryParts.push(`Free shipping above: ৳${shippingConfig.freeShippingAbove}`);
    }
  }

  const storeUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://${store.subdomain}.ozzyl.com`;

  return {
    storeName: store.name,
    currency: store.currency || 'BDT',
    deliveryText: deliveryParts.length ? deliveryParts.join(', ') : undefined,
    returnPolicy: store.customRefundPolicy || undefined,
    shippingPolicy: store.customShippingPolicy || undefined,
    subscriptionPolicy: store.customSubscriptionPolicy || undefined,
    legalNotice: store.customLegalNotice || undefined,
    paymentMethods: paymentMethods.length ? paymentMethods : undefined,
    storeUrl,
    businessName: businessInfo?.name || store.name,
  };
}
