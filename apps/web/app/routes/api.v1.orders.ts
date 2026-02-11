import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { orders } from '@db/schema';
import { authenticateApiKey } from '~/services/api.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  
  // 1. Authenticate Request
  const { storeId } = await authenticateApiKey(request, { DB: env.DB }, 'read_orders');

  // 2. Parse Query Params
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
  const status = url.searchParams.get('status'); // 'pending', 'processing', 'completed', 'cancelled'
  
  // 3. Query Database
  const db = drizzle(env.DB);
  
  let query = db.select().from(orders).where(eq(orders.storeId, storeId));

  if (status) {
    query = db.select().from(orders).where(and(eq(orders.storeId, storeId), eq(orders.status, status as any)));
  }

  const results = await query.orderBy(desc(orders.createdAt)).limit(limit);

  // 4. Return JSON
  return json({
    success: true,
    count: results.length,
    data: results,
  });
}


export default function() {}
