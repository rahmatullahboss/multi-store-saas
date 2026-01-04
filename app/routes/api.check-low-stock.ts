/**
 * Low Stock Check API
 * 
 * Route: /api/check-low-stock
 * 
 * Checks for products below the stock threshold and sends alert email to merchant.
 * Can be triggered manually or via cron job.
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lte } from 'drizzle-orm';
import { products, stores, users } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { createEmailService } from '~/services/email.server';

const LOW_STOCK_THRESHOLD = 10;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store info
  const storeResult = await db
    .select({ name: stores.name })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const storeName = storeResult[0]?.name || 'Your Store';

  // Get merchant email
  const merchantResult = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.storeId, storeId))
    .limit(1);

  const merchantEmail = merchantResult[0]?.email;

  if (!merchantEmail) {
    return json({ error: 'Merchant email not found' }, { status: 400 });
  }

  // Find low stock products
  const lowStockProducts = await db
    .select({
      id: products.id,
      title: products.title,
      sku: products.sku,
      inventory: products.inventory,
    })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        lte(products.inventory, LOW_STOCK_THRESHOLD)
      )
    );

  if (lowStockProducts.length === 0) {
    return json({
      success: true,
      message: 'No low stock products found',
      count: 0,
    });
  }

  // Send email alert
  const resendApiKey = context.cloudflare.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    return json({
      success: false,
      error: 'Email service not configured',
      lowStockProducts,
    }, { status: 500 });
  }

  const emailService = createEmailService(resendApiKey);
  
  const emailResult = await emailService.sendLowStockAlert({
    merchantEmail,
    storeName,
    products: lowStockProducts.map(p => ({
      name: p.title,
      stock: p.inventory ?? 0,
    })),
  });

  if (!emailResult.success) {
    return json({
      success: false,
      error: emailResult.error,
      lowStockProducts,
    }, { status: 500 });
  }

  return json({
    success: true,
    message: `Low stock alert sent for ${lowStockProducts.length} product(s)`,
    count: lowStockProducts.length,
    products: lowStockProducts.map(p => ({
      title: p.title,
      sku: p.sku,
      stock: p.inventory,
    })),
  });
}
