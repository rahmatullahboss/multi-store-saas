/**
 * API: Metafields
 * 
 * CRUD operations for metafield values
 * 
 * GET    /api/metafields?ownerId=xxx&ownerType=product
 * POST   /api/metafields
 * PUT    /api/metafields (with id in body)
 * DELETE /api/metafields?id=xxx
 */

import { json, type ActionFunction, type LoaderFunction } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { getSession } from '~/services/auth.server';
import { 
  metafields, 
  metafieldDefinitions,
  type Metafield, 
  type MetafieldOwnerType, 
  type MetafieldType,
  parseMetafieldValue,
  serializeMetafieldValue,
  validateMetafieldValue
} from '@db/schema_metafields';
import { z } from 'zod';

// Validation schema
const MetafieldSchema = z.object({
  namespace: z.string().min(1).max(50),
  key: z.string().min(1).max(50),
  value: z.unknown(),
  type: z.enum([
    'single_line_text_field', 'multi_line_text_field', 'rich_text_field',
    'number_integer', 'number_decimal', 'boolean',
    'date', 'date_time', 'url', 'color', 'json', 'file_reference',
    'product_reference', 'collection_reference',
    'list.single_line_text_field', 'list.number_integer', 
    'list.product_reference', 'list.file_reference'
  ]),
  ownerId: z.string().min(1),
  ownerType: z.enum(['product', 'collection', 'store', 'page']),
  definitionId: z.string().optional(),
});

// GET: List metafields for an entity
export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getSession(request, context.cloudflare.env);
  const storeId = session.get('storeId');
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  
  const ownerId = url.searchParams.get('ownerId');
  const ownerType = url.searchParams.get('ownerType') as MetafieldOwnerType | null;
  const namespace = url.searchParams.get('namespace');
  const key = url.searchParams.get('key');

  // Single metafield lookup by namespace/key
  if (ownerId && ownerType && namespace && key) {
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
      return json({ success: true, metafield: null });
    }

    const mf = result[0];
    return json({ 
      success: true, 
      metafield: {
        ...mf,
        value: parseMetafieldValue(mf.value, mf.type as MetafieldType),
      }
    });
  }

  // List all metafields for an entity
  if (ownerId && ownerType) {
    const results = await db.select().from(metafields)
      .where(and(
        eq(metafields.storeId, storeId),
        eq(metafields.ownerId, ownerId),
        eq(metafields.ownerType, ownerType)
      ));

    return json({ 
      success: true, 
      metafields: results.map(mf => ({
        ...mf,
        value: parseMetafieldValue(mf.value, mf.type as MetafieldType),
      }))
    });
  }

  // List all metafields by owner type
  if (ownerType) {
    const results = await db.select().from(metafields)
      .where(and(
        eq(metafields.storeId, storeId),
        eq(metafields.ownerType, ownerType)
      ));

    return json({ 
      success: true, 
      metafields: results.map(mf => ({
        ...mf,
        value: parseMetafieldValue(mf.value, mf.type as MetafieldType),
      }))
    });
  }

  return json({ error: 'Missing required parameters: ownerId and ownerType' }, { status: 400 });
};

// POST/PUT/DELETE: Manage metafields
export const action: ActionFunction = async ({ request, context }) => {
  const session = await getSession(request, context.cloudflare.env);
  const storeId = session.get('storeId');
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const method = request.method;

  // DELETE
  if (method === 'DELETE') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await db.delete(metafields)
      .where(and(
        eq(metafields.id, id),
        eq(metafields.storeId, storeId)
      ));

    return json({ success: true, message: 'Metafield deleted' });
  }

  // POST/PUT
  const body = await request.json();
  const validation = MetafieldSchema.safeParse(body);

  if (!validation.success) {
    return json({ 
      error: 'Validation failed', 
      details: validation.error.errors 
    }, { status: 400 });
  }

  const data = validation.data;

  // If there's a definition, validate against it
  if (data.definitionId) {
    const def = await db.select().from(metafieldDefinitions)
      .where(and(
        eq(metafieldDefinitions.id, data.definitionId),
        eq(metafieldDefinitions.storeId, storeId)
      ))
      .limit(1);

    if (def.length > 0) {
      const definition = def[0];
      const validations = definition.validations ? JSON.parse(definition.validations) : null;
      const valueValidation = validateMetafieldValue(data.value, data.type as MetafieldType, validations);
      
      if (!valueValidation.valid) {
        return json({ error: valueValidation.error }, { status: 400 });
      }
    }
  }

  // Serialize value
  const serializedValue = serializeMetafieldValue(data.value, data.type as MetafieldType);

  // PUT: Update existing
  const bodyWithId = body as { id?: string };
  if (method === 'PUT' && bodyWithId.id) {
    await db.update(metafields)
      .set({
        namespace: data.namespace,
        key: data.key,
        value: serializedValue,
        type: data.type,
        updatedAt: new Date().toISOString(),
      })
      .where(and(
        eq(metafields.id, bodyWithId.id as string),
        eq(metafields.storeId, storeId)
      ));

    return json({ success: true, message: 'Metafield updated' });
  }

  // POST: Create or update (upsert)
  const existingMetafield = await db.select().from(metafields)
    .where(and(
      eq(metafields.storeId, storeId),
      eq(metafields.ownerId, data.ownerId),
      eq(metafields.ownerType, data.ownerType),
      eq(metafields.namespace, data.namespace),
      eq(metafields.key, data.key)
    ))
    .limit(1);

  if (existingMetafield.length > 0) {
    // Update existing
    await db.update(metafields)
      .set({
        value: serializedValue,
        type: data.type,
        definitionId: data.definitionId || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(metafields.id, existingMetafield[0].id));

    return json({ success: true, id: existingMetafield[0].id, message: 'Metafield updated' });
  }

  // Create new
  const id = `mf_${storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(metafields).values({
    id,
    storeId: storeId,
    definitionId: data.definitionId || null,
    namespace: data.namespace,
    key: data.key,
    value: serializedValue,
    type: data.type,
    ownerId: data.ownerId,
    ownerType: data.ownerType,
  });

  return json({ success: true, id, message: 'Metafield created' });
};
