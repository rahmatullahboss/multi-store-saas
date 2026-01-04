/**
 * Store Settings Page
 * 
 * Route: /app/settings
 * 
 * Placeholder settings page for store configuration
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Settings, Store, Globe, Palette } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Settings - Multi-Store SaaS' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];

  return json({
    store: {
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      currency: store.currency,
      mode: store.mode,
    },
  });
}

export default function SettingsPage() {
  const { store } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your store configuration</p>
      </div>

      {/* Store Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
            <p className="text-sm text-gray-500">Basic details about your store</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Store Name" value={store.name} />
            <InfoItem label="Subdomain" value={`${store.subdomain}.stores.digitalcare.site`} />
            <InfoItem label="Currency" value={store.currency || 'BDT'} />
            <InfoItem label="Store Mode" value={store.mode === 'landing' ? 'Landing Page' : 'Full Store'} />
          </div>
          {store.customDomain && (
            <InfoItem label="Custom Domain" value={store.customDomain} />
          )}
        </div>
      </div>

      {/* Coming Soon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComingSoonCard
          icon={Palette}
          title="Theme Customization"
          description="Customize your store's colors, fonts, and appearance"
        />
        <ComingSoonCard
          icon={Globe}
          title="Domain Settings"
          description="Connect your custom domain to your store"
        />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function ComingSoonCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 opacity-75">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
}
