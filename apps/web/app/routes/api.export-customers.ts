import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { customers } from '@db/schema';
import { eq, desc } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);

  if (!storeId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const allCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.storeId, storeId))
    .orderBy(desc(customers.createdAt));

  // CSV Headers: Name, Phone, Email, Address, District, Total Orders, Total Spent, Created Date
  let csvContent = 'Name,Phone,Email,Address,District,Total Orders,Total Spent,Created Date\n';

  allCustomers.forEach((customer) => {
    let addressStr = '';
    let districtStr = '';

    if (customer.address) {
      try {
        const addrObj = JSON.parse(customer.address);
        addressStr = addrObj.address || '';
        districtStr = addrObj.district || '';
      } catch (e) {
        // Fallback if it's not JSON
        addressStr = customer.address;
      }
    }

    const name = `"${(customer.name || '').replace(/"/g, '""')}"`;
    const phone = `"${(customer.phone || '').replace(/"/g, '""')}"`;
    const email = `"${(customer.email || '').replace(/"/g, '""')}"`;
    const address = `"${(addressStr || '').replace(/"/g, '""')}"`;
    const district = `"${(districtStr || '').replace(/"/g, '""')}"`;
    const totalOrders = customer.totalOrders || 0;

    // Convert cents to standard currency format (assuming it's stored in cents or base units)
    // Actually the memory says: "For e-commerce calculations, money is internally stored and calculated as integer cents (e.g., 10050 cents = 100.50)".
    // Let's divide by 100. If it's already a float/real, dividing by 100 might be wrong if it's not cents. Wait, the schema says: `totalSpent: real('total_spent').default(0)`.
    // Let's check `utils/money.ts` or just format it as is if it's real.
    // The memory states: "money is internally stored and calculated as integer cents". So totalSpent / 100 is likely correct. Wait, we should check utils/money.ts to be sure.
    // However, looking at the customer page: `formatPrice(customer.totalSpent || 0)` is used directly without dividing by 100 in `app.customers._index.tsx`.
    // Ah, wait! The memory says "money is internally stored and calculated as integer cents" but `customers._index.tsx` does:
    // `const formatPrice = (price: number) => { return new Intl.NumberFormat(...).format(price); };`
    // And uses `formatPrice(customer.totalSpent || 0)`.
    // Let's just output `customer.totalSpent || 0` directly as it's done in the UI.
    const totalSpent = customer.totalSpent || 0;

    let createdDate = '';
    if (customer.createdAt) {
      const d = new Date(customer.createdAt);
      createdDate = `"${d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}"`;
    }

    csvContent += `${name},${phone},${email},${address},${district},${totalOrders},${totalSpent},${createdDate}\n`;
  });

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="customers.csv"',
    },
  });
}
