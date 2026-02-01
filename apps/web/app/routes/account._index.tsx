import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerStats } from '~/services/customer-account.server';
import { Package, DollarSign, Award } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });
  
  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  const stats = await getCustomerStats(customerId, storeId, db);

  return json({ stats });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  className?: string;
  description?: string;
}

function StatCard({ label, value, icon: Icon, className, description }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm p-6", className)}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{label}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}

export default function AccountDashboard() {
  const { stats } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          description="Lifetime orders placed"
        />
        <StatCard
          label="Total Spent"
          value={`$${stats.totalSpent.toFixed(2)}`}
          icon={DollarSign}
          description="Lifetime value"
        />
        <StatCard
          label="Loyalty Points"
          value={stats.loyaltyPoints}
          icon={Award}
          description={`${stats.loyaltyTier} Tier`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="text-sm text-muted-foreground text-center py-8">
            No recent activity to show.
            {/* TODO: Load recent activity logs or orders here */}
          </div>
          <div className="mt-4">
             <Button asChild variant="outline" className="w-full">
                <Link to="/account/orders">View Order History</Link>
             </Button>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold mb-4">Account Details</h3>
          <div className="space-y-2 text-sm">
             {/* We could pass customer details here too */}
             <p className="text-muted-foreground">Manage your personal information and password.</p>
          </div>
          <div className="mt-4">
             <Button asChild variant="outline" className="w-full">
                <Link to="/account/profile">Edit Profile</Link>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
