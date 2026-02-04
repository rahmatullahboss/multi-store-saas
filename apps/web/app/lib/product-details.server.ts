import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { metafields, serializeMetafieldValue } from '@db/schema_metafields';

const PRODUCT_DETAILS_NAMESPACE = 'product_details';

const SPEC_KEYS = ['material', 'weight', 'dimensions', 'origin', 'warranty'] as const;

export interface ProductDetailsInput {
  material?: string | null;
  weight?: string | null;
  dimensions?: string | null;
  origin?: string | null;
  warranty?: string | null;
  shippingInfo?: string | null;
  returnPolicy?: string | null;
}

interface UpsertInput {
  storeId: number;
  productId: number;
  key: string;
  value: string | null;
  type: 'single_line_text_field' | 'multi_line_text_field';
}

function normalize(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function upsertOrDeleteMetafield(db: ReturnType<typeof drizzle>, input: UpsertInput) {
  const ownerId = String(input.productId);

  const existing = await db
    .select({ id: metafields.id })
    .from(metafields)
    .where(
      and(
        eq(metafields.storeId, input.storeId),
        eq(metafields.ownerType, 'product'),
        eq(metafields.ownerId, ownerId),
        eq(metafields.namespace, PRODUCT_DETAILS_NAMESPACE),
        eq(metafields.key, input.key)
      )
    )
    .limit(1);

  if (!input.value) {
    if (existing.length > 0) {
      await db.delete(metafields).where(eq(metafields.id, existing[0].id));
    }
    return;
  }

  const serializedValue = serializeMetafieldValue(input.value, input.type);

  if (existing.length > 0) {
    await db
      .update(metafields)
      .set({
        value: serializedValue,
        type: input.type,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(metafields.id, existing[0].id));
    return;
  }

  const id = `mf_${input.storeId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db.insert(metafields).values({
    id,
    storeId: input.storeId,
    namespace: PRODUCT_DETAILS_NAMESPACE,
    key: input.key,
    value: serializedValue,
    type: input.type,
    ownerId,
    ownerType: 'product',
  });
}

export async function saveProductDetailsMetafields(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  productId: number,
  details: ProductDetailsInput
) {
  const entries: Array<Omit<UpsertInput, 'storeId' | 'productId'>> = [
    { key: 'material', value: normalize(details.material), type: 'single_line_text_field' },
    { key: 'weight', value: normalize(details.weight), type: 'single_line_text_field' },
    { key: 'dimensions', value: normalize(details.dimensions), type: 'single_line_text_field' },
    { key: 'origin', value: normalize(details.origin), type: 'single_line_text_field' },
    { key: 'warranty', value: normalize(details.warranty), type: 'single_line_text_field' },
    {
      key: 'shipping_info',
      value: normalize(details.shippingInfo),
      type: 'multi_line_text_field',
    },
    {
      key: 'return_policy',
      value: normalize(details.returnPolicy),
      type: 'multi_line_text_field',
    },
  ];

  for (const entry of entries) {
    await upsertOrDeleteMetafield(db, {
      storeId,
      productId,
      ...entry,
    });
  }
}

export async function getProductDetailsMetafields(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  productId: number
) {
  const rows = await db
    .select({ key: metafields.key, value: metafields.value })
    .from(metafields)
    .where(
      and(
        eq(metafields.storeId, storeId),
        eq(metafields.ownerType, 'product'),
        eq(metafields.ownerId, String(productId)),
        eq(metafields.namespace, PRODUCT_DETAILS_NAMESPACE)
      )
    );

  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const specifications: Record<string, string> = {};

  for (const key of SPEC_KEYS) {
    const value = normalize(byKey.get(key));
    if (value) {
      specifications[key] = value;
    }
  }

  return {
    specifications,
    shippingInfo: normalize(byKey.get('shipping_info')),
    returnPolicy: normalize(byKey.get('return_policy')),
    fields: {
      material: normalize(byKey.get('material')) ?? '',
      weight: normalize(byKey.get('weight')) ?? '',
      dimensions: normalize(byKey.get('dimensions')) ?? '',
      origin: normalize(byKey.get('origin')) ?? '',
      warranty: normalize(byKey.get('warranty')) ?? '',
      shippingInfo: normalize(byKey.get('shipping_info')) ?? '',
      returnPolicy: normalize(byKey.get('return_policy')) ?? '',
    },
  };
}
