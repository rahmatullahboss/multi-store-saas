import { type DrizzleD1Database } from 'drizzle-orm/d1';

export async function checkLowStockAfterOrder(
  db: DrizzleD1Database,
  storeId: number,
  productId: number,
  currentStock: number
) {
  const threshold = 5; // Default threshold

  if (currentStock <= threshold) {
    // Option 1: Create a notification record (if notifications table exists)
    // Option 2: Log to console (the store owner will see via observability)
    // Option 3: Send email alert if store has email configured

    console.warn(`[LOW STOCK] Store ${storeId}: Product ${productId} has only ${currentStock} units left`);

    // Try to create notification record if table exists
    // Try to send email if Resend is configured
  }
}
