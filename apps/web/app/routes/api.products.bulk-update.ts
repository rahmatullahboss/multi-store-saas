import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { inArray, and, eq, sql } from 'drizzle-orm';
import { products } from '@db/schema';
import { getStoreId } from '~/services/auth.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productIds, action, priceUpdate } = body as {
      productIds: number[];
      action: 'activate' | 'deactivate' | 'update-price';
      priceUpdate?: {
        type: 'fixed' | 'percent_increase' | 'percent_decrease';
        value: number;
      };
    };

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return json({ error: 'No products selected' }, { status: 400 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    if (action === 'activate') {
      await db
        .update(products)
        .set({ isPublished: true })
        .where(
          and(
            inArray(products.id, productIds),
            eq(products.storeId, storeId)
          )
        );
      return json({ success: true, message: `${productIds.length} product(s) activated` });
    }

    if (action === 'deactivate') {
      await db
        .update(products)
        .set({ isPublished: false })
        .where(
          and(
            inArray(products.id, productIds),
            eq(products.storeId, storeId)
          )
        );
      return json({ success: true, message: `${productIds.length} product(s) deactivated` });
    }

    if (action === 'update-price') {
      if (!priceUpdate || typeof priceUpdate.value !== 'number') {
        return json({ error: 'Invalid price update data' }, { status: 400 });
      }

      const { type, value } = priceUpdate;

      if (type === 'fixed') {
        await db
          .update(products)
          .set({ price: Math.max(0, value) })
          .where(
            and(
              inArray(products.id, productIds),
              eq(products.storeId, storeId)
            )
          );
      } else if (type === 'percent_increase') {
        // value is like 10 for 10%
        await db
          .update(products)
          .set({
            price: sql`ROUND(${products.price} * (1 + ${value} / 100.0))`
          })
          .where(
            and(
              inArray(products.id, productIds),
              eq(products.storeId, storeId)
            )
          );
      } else if (type === 'percent_decrease') {
        await db
          .update(products)
          .set({
            price: sql`MAX(0, ROUND(${products.price} * (1 - ${value} / 100.0)))`
          })
          .where(
            and(
              inArray(products.id, productIds),
              eq(products.storeId, storeId)
            )
          );
      } else {
        return json({ error: 'Invalid price update type' }, { status: 400 });
      }

      return json({ success: true, message: `Prices updated for ${productIds.length} product(s)` });
    }

    return json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Bulk update error:', error);
    return json(
      { error: `Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
