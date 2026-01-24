/**
 * API: Metafield Definitions
 * 
 * CRUD operations for metafield definitions (templates)
 * 
 * GET    /api/metafield-definitions?ownerType=product
 * POST   /api/metafield-definitions
 * PUT    /api/metafield-definitions (with id in body)
 * DELETE /api/metafield-definitions?id=xxx
 */

import { json, type ActionFunction, type LoaderFunction } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql } from 'drizzle-orm';
import { getSession } from '~/services/auth.server';
import { metafieldDefinitions, metafields, type MetafieldDefinition, type MetafieldOwnerType, type MetafieldType } from '@db/schema_metafields';
import { z } from 'zod';

// Validation schema
const MetafieldDefinitionSchema = z.object({
  namespace: z.string().min(1).max(50).regex(/^[a-z_][a-z0-9_]*$/i, 'Namespace must be alphanumeric with underscores'),
  key: z.string().min(1).max(50).regex(/^[a-z_][a-z0-9_]*$/i, 'Key must be alphanumeric with underscores'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum([
    'single_line_text_field', 'multi_line_text_field', 'rich_text_field',
    'number_integer', 'number_decimal', 'boolean',
    'date', 'date_time', 'url', 'color', 'json', 'file_reference',
    'product_reference', 'collection_reference',
    'list.single_line_text_field', 'list.number_integer', 
    'list.product_reference', 'list.file_reference'
  ]),
  ownerType: z.enum(['product', 'collection', 'store', 'page']),
  validations: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    regex: z.string().optional(),
    choices: z.array(z.string()).optional(),
  }).optional(),
  pinned: z.boolean().optional(),
});

// GET: List definitions
export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getSession(request, context.cloudflare.env);
  const storeId = session.get('storeId');
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);
  const ownerType = url.searchParams.get('ownerType') as MetafieldOwnerType | null;

  let query = db.select().from(metafieldDefinitions)
    .where(eq(metafieldDefinitions.storeId, storeId));

  if (ownerType) {
    query = db.select().from(metafieldDefinitions)
      .where(and(
        eq(metafieldDefinitions.storeId, storeId),
        eq(metafieldDefinitions.ownerType, ownerType)
      ));
  }

  const definitions = await query;

  return json({ 
    success: true, 
    definitions: definitions.map(d => ({
      ...d,
      validations: d.validations ? JSON.parse(d.validations) : null,
    }))
  });
};

// POST/PUT/DELETE: Manage definitions
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

    // Guard: prevent delete if values exist
    const valueCount = await db.select({ count: sql<number>`count(*)` })
      .from(metafields)
      .where(and(
        eq(metafields.definitionId, id),
        eq(metafields.storeId, storeId)
      ));

    const existingCount = valueCount[0]?.count ?? 0;
    if (existingCount > 0) {
      return json({ 
        error: 'Cannot delete definition with existing values',
        count: existingCount 
      }, { status: 409 });
    }

    await db.delete(metafieldDefinitions)
      .where(and(
        eq(metafieldDefinitions.id, id),
        eq(metafieldDefinitions.storeId, storeId)
      ));

    return json({ success: true, message: 'Definition deleted' });
  }

  // POST/PUT
  const body = await request.json();
  const validation = MetafieldDefinitionSchema.safeParse(body);

  if (!validation.success) {
    return json({ 
      error: 'Validation failed', 
      details: validation.error.errors 
    }, { status: 400 });
  }

  const data = validation.data;

  // PUT: Update existing
  if (method === 'PUT' && body.id) {
    await db.update(metafieldDefinitions)
      .set({
        namespace: data.namespace,
        key: data.key,
        name: data.name,
        description: data.description || null,
        type: data.type,
        ownerType: data.ownerType,
        validations: data.validations ? JSON.stringify(data.validations) : null,
        pinned: data.pinned ? 1 : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(and(
        eq(metafieldDefinitions.id, body.id as string),
        eq(metafieldDefinitions.storeId, storeId)
      ));

    return json({ success: true, message: 'Definition updated' });
  }

  // POST: Create new
  const id = `mfd_${storeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    await db.insert(metafieldDefinitions).values({
      id,
      storeId: storeId,
      namespace: data.namespace,
      key: data.key,
      name: data.name,
      description: data.description || null,
      type: data.type,
      ownerType: data.ownerType,
      validations: data.validations ? JSON.stringify(data.validations) : null,
      pinned: data.pinned ? 1 : 0,
    });

    return json({ success: true, id, message: 'Definition created' });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return json({ 
        error: `A definition with namespace "${data.namespace}" and key "${data.key}" already exists for ${data.ownerType}` 
      }, { status: 400 });
    }
    throw error;
  }
};
