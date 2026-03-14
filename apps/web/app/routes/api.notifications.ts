import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, lte } from 'drizzle-orm';
import { orders, products, reviews, payments, stores } from '@db/schema';
import { formatDistanceToNow } from 'date-fns';
import { getStoreId } from '~/services/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const storeIdParam = url.searchParams.get('storeId');
  const sessionStoreId = await getStoreId(request, context.cloudflare.env);

  const storeId = storeIdParam ? parseInt(storeIdParam, 10) : sessionStoreId;

  if (!storeId || isNaN(storeId)) {
    return json([], { status: 400 });
  }

  try {
    const db = drizzle(context.cloudflare.env.DB);

    // Get store's low stock threshold
    const store = await db
      .select({ lowStockThreshold: stores.lowStockThreshold })
      .from(stores)
      .where(eq(stores.id, storeId))
      .get();

    const threshold = store?.lowStockThreshold ?? 10;

    // Run all queries in parallel for speed
    const [recentOrders, lowStockProducts, pendingReviews, recentPayments] =
      await Promise.all([
        // 1. Pending orders (select only needed fields)
        db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            total: orders.total,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .where(
            and(eq(orders.storeId, storeId), eq(orders.status, 'pending'))
          )
          .orderBy(desc(orders.createdAt))
          .limit(5),

        // 2. Low stock products
        db
          .select({
            id: products.id,
            title: products.title,
            inventory: products.inventory,
            updatedAt: products.updatedAt,
          })
          .from(products)
          .where(
            and(
              eq(products.storeId, storeId),
              lte(products.inventory, threshold)
            )
          )
          .orderBy(desc(products.updatedAt))
          .limit(5),

        // 3. Pending reviews
        db
          .select({
            id: reviews.id,
            customerName: reviews.customerName,
            rating: reviews.rating,
            createdAt: reviews.createdAt,
          })
          .from(reviews)
          .where(
            and(eq(reviews.storeId, storeId), eq(reviews.status, 'pending'))
          )
          .orderBy(desc(reviews.createdAt))
          .limit(5),

        // 4. Recent payments
        db
          .select({
            id: payments.id,
            amount: payments.amount,
            method: payments.method,
            createdAt: payments.createdAt,
          })
          .from(payments)
          .where(
            and(eq(payments.storeId, storeId), eq(payments.status, 'paid'))
          )
          .orderBy(desc(payments.createdAt))
          .limit(5),
      ]);

    const notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      timeAgo: string;
      createdAt: string;
    }> = [];

    // Format orders
    for (const order of recentOrders) {
      if (order.createdAt) {
        notifications.push({
          id: `order_${order.id}`,
          type: 'new_order',
          title: `New Order: ${order.orderNumber}`,
          message: `Order received for ৳${order.total}`,
          timeAgo: formatDistanceToNow(new Date(order.createdAt), {
            addSuffix: true,
          }),
          createdAt: new Date(order.createdAt).toISOString(),
        });
      }
    }

    // Format low stock
    for (const product of lowStockProducts) {
      if (product.updatedAt) {
        notifications.push({
          id: `stock_${product.id}`,
          type: 'low_stock',
          title: `Low Stock Alert`,
          message: `${product.title} is running low (${product.inventory} left)`,
          timeAgo: formatDistanceToNow(new Date(product.updatedAt), {
            addSuffix: true,
          }),
          createdAt: new Date(product.updatedAt).toISOString(),
        });
      }
    }

    // Format reviews
    for (const review of pendingReviews) {
      if (review.createdAt) {
        notifications.push({
          id: `review_${review.id}`,
          type: 'store_review',
          title: `New Review Pending`,
          message: `${review.customerName} left a ${review.rating}-star review`,
          timeAgo: formatDistanceToNow(new Date(review.createdAt), {
            addSuffix: true,
          }),
          createdAt: new Date(review.createdAt).toISOString(),
        });
      }
    }

    // Format payments
    for (const payment of recentPayments) {
      if (payment.createdAt) {
        notifications.push({
          id: `payment_${payment.id}`,
          type: 'payment',
          title: `Payment Received`,
          message: `Received ৳${payment.amount} via ${payment.method}`,
          timeAgo: formatDistanceToNow(new Date(payment.createdAt), {
            addSuffix: true,
          }),
          createdAt: new Date(payment.createdAt).toISOString(),
        });
      }
    }

    // Sort combined array by date descending
    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Return top 10
    return json(notifications.slice(0, 10));
  } catch (error) {
    console.error(
      '[api.notifications] Error:',
      error instanceof Error ? error.message : error
    );
    // Return empty array instead of 500 to prevent client-side SyntaxError
    return json([], { status: 200 });
  }
}
