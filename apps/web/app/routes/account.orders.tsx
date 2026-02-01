import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerOrders } from '~/services/customer-account.server';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/button';
import { format } from 'date-fns';

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });
  
  const { store, storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  // Pagination params could be added here
  const orders = await getCustomerOrders(customerId, storeId, db, 20, 0);

  return json({ orders, storeCurrency: store.currency });
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
    confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
    processing: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
    shipped: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
    delivered: "bg-green-100 text-green-800 hover:bg-green-100/80",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-100/80",
    returned: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
  };
  
  return (
    <Badge className={styles[status] || styles.pending} variant="secondary">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function AccountOrders() {
  const { orders, storeCurrency } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
        <p className="text-muted-foreground">
          View and track your recent orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Button asChild className="mt-4" variant="default">
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const date = order.createdAt ? new Date(order.createdAt) : new Date();
            
            return (
              <div 
                key={order.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">#{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status || 'pending'} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="block sm:inline">{format(date, 'MMM d, yyyy')}</span>
                    <span className="hidden sm:inline mx-2">•</span>
                    <span className="block sm:inline">{order.total} {storeCurrency || 'USD'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
                    <Link to={`/account/orders/${order.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
