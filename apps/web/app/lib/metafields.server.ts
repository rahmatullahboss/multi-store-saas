/**
 * Metafields Server Utilities
 * 
 * Helpers for fetching and using metafields in server-side rendering
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, inArray } from 'drizzle-orm';
import { 
  metafields, 
  metafieldDefinitions,
  type Metafield,
  type MetafieldDefinition,
  type MetafieldOwnerType,
  type MetafieldType,
  parseMetafieldValue 
} from '@db/schema_metafields';

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedMetafield {
  namespace: string;
  key: string;
  value: unknown;
  type: MetafieldType;
}

export interface MetafieldMap {
  [namespace: string]: {
    [key: string]: unknown;
  };
}

// ============================================================================
// FETCH METAFIELDS
// ============================================================================

/**
 * Get all metafields for a single entity
 */
export async function getMetafieldsForEntity(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  ownerId: string,
  ownerType: MetafieldOwnerType
): Promise<MetafieldMap> {
  const results = await db.select().from(metafields)
    .where(and(
      eq(metafields.storeId, storeId),
      eq(metafields.ownerId, ownerId),
      eq(metafields.ownerType, ownerType)
    ));

  return metafieldsToMap(results);
}

/**
 * Get metafields for multiple entities (batch)
 */
export async function getMetafieldsForEntities(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  ownerIds: string[],
  ownerType: MetafieldOwnerType
): Promise<Map<string, MetafieldMap>> {
  if (ownerIds.length === 0) {
    return new Map();
  }

  const results = await db.select().from(metafields)
    .where(and(
      eq(metafields.storeId, storeId),
      eq(metafields.ownerType, ownerType),
      inArray(metafields.ownerId, ownerIds)
    ));

  // Group by ownerId
  const grouped = new Map<string, MetafieldMap>();
  
  for (const mf of results) {
    if (!grouped.has(mf.ownerId)) {
      grouped.set(mf.ownerId, {});
    }
    const map = grouped.get(mf.ownerId)!;
    
    if (!map[mf.namespace]) {
      map[mf.namespace] = {};
    }
    map[mf.namespace][mf.key] = parseMetafieldValue(mf.value, mf.type as MetafieldType);
  }

  return grouped;
}

/**
 * Get a single metafield value
 */
export async function getMetafieldValue(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  ownerId: string,
  ownerType: MetafieldOwnerType,
  namespace: string,
  key: string
): Promise<unknown | null> {
  const result = await db.select().from(metafields)
    .where(and(
      eq(metafields.storeId, storeId),
      eq(metafields.ownerId, ownerId),
      eq(metafields.ownerType, ownerType),
      eq(metafields.namespace, namespace),
      eq(metafields.key, key)
    ))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return parseMetafieldValue(result[0].value, result[0].type as MetafieldType);
}

/**
 * Get all metafield definitions for a store
 */
export async function getMetafieldDefinitions(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  ownerType?: MetafieldOwnerType
): Promise<MetafieldDefinition[]> {
  let query = db.select().from(metafieldDefinitions)
    .where(eq(metafieldDefinitions.storeId, storeId));

  if (ownerType) {
    query = db.select().from(metafieldDefinitions)
      .where(and(
        eq(metafieldDefinitions.storeId, storeId),
        eq(metafieldDefinitions.ownerType, ownerType)
      ));
  }

  const results = await query;
  
  return results.map(d => ({
    ...d,
    validations: d.validations ? JSON.parse(d.validations) : null,
  })) as MetafieldDefinition[];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert metafields array to nested map
 */
function metafieldsToMap(metafieldsList: Metafield[]): MetafieldMap {
  const map: MetafieldMap = {};
  
  for (const mf of metafieldsList) {
    if (!map[mf.namespace]) {
      map[mf.namespace] = {};
    }
    map[mf.namespace][mf.key] = parseMetafieldValue(mf.value, mf.type as MetafieldType);
  }
  
  return map;
}

/**
 * Hydrate products with metafields
 */
export async function hydrateProductsWithMetafields<T extends { id: number }>(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  products: T[]
): Promise<(T & { metafields: MetafieldMap })[]> {
  if (products.length === 0) {
    return [];
  }

  const productIds = products.map(p => String(p.id));
  const metafieldsMap = await getMetafieldsForEntities(db, storeId, productIds, 'product');

  return products.map(product => ({
    ...product,
    metafields: metafieldsMap.get(String(product.id)) || {},
  }));
}

/**
 * Hydrate collections with metafields
 */
export async function hydrateCollectionsWithMetafields<T extends { id: number }>(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  collections: T[]
): Promise<(T & { metafields: MetafieldMap })[]> {
  if (collections.length === 0) {
    return [];
  }

  const collectionIds = collections.map(c => String(c.id));
  const metafieldsMap = await getMetafieldsForEntities(db, storeId, collectionIds, 'collection');

  return collections.map(collection => ({
    ...collection,
    metafields: metafieldsMap.get(String(collection.id)) || {},
  }));
}

/**
 * Get store-level metafields
 */
export async function getStoreMetafields(
  db: ReturnType<typeof drizzle>,
  storeId: number
): Promise<MetafieldMap> {
  return getMetafieldsForEntity(db, storeId, String(storeId), 'store');
}

// ============================================================================
// SECTION BINDING HELPERS
// ============================================================================

/**
 * Resolve metafield references in section settings
 * 
 * Settings can contain metafield references like:
 * { type: 'metafield', namespace: 'custom', key: 'warranty' }
 * 
 * This function resolves them to actual values
 */
export function resolveMetafieldReferences(
  settings: Record<string, unknown>,
  metafieldsMap: MetafieldMap
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(settings)) {
    if (isMetafieldReference(value)) {
      const ref = value as { type: string; namespace: string; key: string };
      resolved[key] = metafieldsMap[ref.namespace]?.[ref.key] ?? null;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      resolved[key] = resolveMetafieldReferences(value as Record<string, unknown>, metafieldsMap);
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

/**
 * Check if a value is a metafield reference
 */
function isMetafieldReference(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj.type === 'metafield' && typeof obj.namespace === 'string' && typeof obj.key === 'string';
}

// ============================================================================
// EXPORT ALL
// ============================================================================

// Types already exported inline above
