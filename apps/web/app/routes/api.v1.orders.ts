import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { orders } from '@db/schema';
import { authenticateApiKey } from '~/services/api.server';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const url = new URL(request.url);

  // 1. Authenticate Request
  const { storeId } = await authenticateApiKey(request, { DB: env.DB }, 'read_orders');

  // 2. Parse Query Params
  const limitRaw = url.searchParams.get('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return json(
      { success: false, error: 'Invalid limit. Use an integer between 1 and 100.' },
      { status: 400 }
    );
  }

  const status = url.searchParams.get('status');
  const allowedStatuses = new Set<OrderStatus>([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]);
  if (status && !allowedStatuses.has(status as OrderStatus)) {
    return json(
      {
        success: false,
        error:
          "Invalid status. Allowed values: pending, confirmed, processing, shipped, delivered, cancelled.",
      },
      { status: 400 }
    );
  }

  // 3. Query Database
  const db = drizzle(env.DB);

  let query = db.select().from(orders).where(eq(orders.storeId, storeId));

  if (status) {
    const statusValue = status as OrderStatus;
    query = db
      .select()
      .from(orders)
      .where(and(eq(orders.storeId, storeId), eq(orders.status, statusValue)));
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
