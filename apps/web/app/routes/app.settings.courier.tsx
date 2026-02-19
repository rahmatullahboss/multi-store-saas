/**
 * Courier Settings Page
 *
 * Route: /app/settings/courier
 *
 * Features:
 * - Select courier provider (Pathao, RedX, Steadfast)
 * - Enter API credentials
 * - Test connection
 * - View connected stores (pickup locations)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  useFetcher,
  Link,
} from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId, getUserId } from '~/services/auth.server';
import { createPathaoClient } from '~/services/pathao.server';
import { createSteadfastClient } from '~/services/steadfast.server';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Save,
  TestTube,
  Store,
  X,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { GlassCard } from '~/components/ui/GlassCard';
import { z } from 'zod';
import { logActivity } from '~/lib/activity.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Courier Settings - Ozzyl' }];
};

// Types
interface CourierSettings {
  provider: 'pathao' | 'redx' | 'steadfast' | null;
  pathao?: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    baseUrl?: string;
    defaultStoreId?: number;
  };
  redx?: {
    apiKey: string;
    secretKey: string;
  };
  steadfast?: {
    apiKey: string;
    secretKey: string;
  };
  isConnected: boolean;
}

interface PathaoStore {
  store_id: number;
  store_name: string;
  store_address: string;
}

interface PathaoZone {
  zone_id: number;
  zone_name: string;
}

interface PathaoArea {
  area_id: number;
  area_name: string;
}

const ProviderSchema = z.enum(['pathao', 'redx', 'steadfast']);
const IntentSchema = z.enum(['save', 'test', 'disconnect', 'create-store']);
const PathaoInputSchema = z.object({
  clientId: z.string().trim().min(1).max(120),
  clientSecret: z.string().trim().max(255).optional(),
  username: z.string().trim().min(1).max(120),
  password: z.string().trim().max(255).optional(),
  baseUrl: z.string().trim().url().max(255).optional().or(z.literal('')),
  defaultStoreId: z.number().int().positive().optional(),
});

type ActionResponse =
  | {
      success: true;
      message: string;
      stores?: PathaoStore[];
      autoSet?: boolean;
      createdStore?: PathaoStore;
    }
  | { error: string };

function toUnifiedCourier(courier: Partial<CourierSettings>) {
  return {
    provider: (courier.provider ?? null) as 'pathao' | 'redx' | 'steadfast' | null,
    pathao: courier.pathao
      ? {
          clientId: courier.pathao.clientId || null,
          clientSecret: courier.pathao.clientSecret || null,
          username: courier.pathao.username || null,
          password: courier.pathao.password || null,
          baseUrl: courier.pathao.baseUrl || null,
          defaultStoreId: courier.pathao.defaultStoreId ?? null,
        }
      : null,
    redx: courier.redx
      ? {
          apiKey: courier.redx.apiKey || null,
          secretKey: courier.redx.secretKey || null,
        }
      : null,
    steadfast: courier.steadfast
      ? {
          apiKey: courier.steadfast.apiKey || null,
          secretKey: courier.steadfast.secretKey || null,
        }
      : null,
  };
}

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env as unknown as Env);
  if (!storeId) {
    return redirect('/auth/login');
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  const db = drizzle(context.cloudflare.env.DB);

  const store = await db.select().from(stores).where(eq(stores.id, storeId)).get();
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Read unified settings as canonical source
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  const rawCourierSettings =
    typeof store.courierSettings === 'string'
      ? JSON.parse(store.courierSettings)
      : store.courierSettings || null;

  const courierConfig = unifiedSettings.courier || rawCourierSettings || {};
  const courierSettings = {
    provider: courierConfig.provider || null,
    pathao: courierConfig.pathao
      ? {
          clientId: courierConfig.pathao.clientId || '',
          clientSecret: courierConfig.pathao.clientSecret || '',
          username: courierConfig.pathao.username || '',
          password: courierConfig.pathao.password || '',
          baseUrl: courierConfig.pathao.baseUrl || undefined,
          defaultStoreId: courierConfig.pathao.defaultStoreId || undefined,
        }
      : undefined,
    redx: courierConfig.redx
      ? {
          apiKey: courierConfig.redx.apiKey || '',
          secretKey: courierConfig.redx.secretKey || '',
        }
      : undefined,
    steadfast: courierConfig.steadfast
      ? {
          apiKey: courierConfig.steadfast.apiKey || '',
          secretKey: courierConfig.steadfast.secretKey || '',
        }
      : undefined,
    isConnected: !!courierConfig.provider,
  };

  // Handle Geo Data Requests for Pathao Store Creation
  if (action === 'get-zones' || action === 'get-areas') {
    if (!courierSettings.pathao) {
      return json({ error: 'Pathao credentials not configured' }, { status: 400 });
    }

    try {
      const client = createPathaoClient({
        clientId: courierSettings.pathao.clientId,
        clientSecret: courierSettings.pathao.clientSecret,
        username: courierSettings.pathao.username,
        password: courierSettings.pathao.password,
        baseUrl: courierSettings.pathao.baseUrl,
      });

      if (action === 'get-zones') {
        const cityId = Number(url.searchParams.get('city_id'));
        if (!cityId) return json({ error: 'City ID required' }, { status: 400 });
        const zones = await client.getZones(cityId);
        return json({ zones });
      }

      if (action === 'get-areas') {
        const zoneId = Number(url.searchParams.get('zone_id'));
        if (!zoneId) return json({ error: 'Zone ID required' }, { status: 400 });
        const areas = await client.getAreas(zoneId);
        return json({ areas });
      }
    } catch (error) {
      console.error('Geo fetch error:', error);
      return json({ error: 'Failed to fetch location data' }, { status: 500 });
    }
  }

  // Initial Data: Cities (if Pathao is configured)
  let cities: { city_id: number; city_name: string }[] = [];
  if (courierSettings.pathao) {
    try {
      const client = createPathaoClient({
        clientId: courierSettings.pathao.clientId,
        clientSecret: courierSettings.pathao.clientSecret,
        username: courierSettings.pathao.username,
        password: courierSettings.pathao.password,
        baseUrl: courierSettings.pathao.baseUrl,
      });
      cities = await client.getCities();
    } catch (e) {
      console.warn('Failed to fetch cities for initial load:', e);
    }
  }

  // Mask sensitive data
  const maskedSettings = {
    ...courierSettings,
    pathao: courierSettings.pathao
      ? {
          ...courierSettings.pathao,
          clientSecret: courierSettings.pathao.clientSecret ? '••••••••' : '',
          password: courierSettings.pathao.password ? '••••••••' : '',
        }
      : undefined,
    redx: courierSettings.redx
      ? {
          ...courierSettings.redx,
          secretKey: courierSettings.redx.secretKey ? '••••••••' : '',
        }
      : undefined,
    steadfast: courierSettings.steadfast
      ? {
          ...courierSettings.steadfast,
          secretKey: courierSettings.steadfast.secretKey ? '••••••••' : '',
        }
      : undefined,
  };

  return json({ settings: maskedSettings, cities });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env as unknown as Env);
  if (!storeId) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    // Validate intent
    const intentResult = IntentSchema.safeParse(intent);
    if (!intentResult.success) {
      return json({ error: 'Invalid intent' }, { status: 400 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    const store = await db.select().from(stores).where(eq(stores.id, storeId)).get();
    if (!store) {
      return json({ error: 'Store not found' }, { status: 404 });
    }
    const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
      env: context.cloudflare.env,
    });

    const currentCourier = (
      store.courierSettings
        ? typeof store.courierSettings === 'string'
          ? JSON.parse(store.courierSettings)
          : store.courierSettings
        : unifiedSettings.courier || {}
    ) as CourierSettings;

    // ------------------------------------------------------------------------
    // CASE 4: Create Store (Pathao)
    // ------------------------------------------------------------------------
    if (intent === 'create-store') {
      if (!currentCourier.pathao) {
        return json({ error: 'Please save Pathao credentials first.' }, { status: 400 });
      }

      const name = String(formData.get('name'));
      const contact_name = String(formData.get('contact_name'));
      const contact_number = String(formData.get('contact_number'));
      const address = String(formData.get('address'));
      const city_id = Number(formData.get('city_id'));
      const zone_id = Number(formData.get('zone_id'));
      const area_id = Number(formData.get('area_id'));

      if (
        !name ||
        !contact_name ||
        !contact_number ||
        !address ||
        !city_id ||
        !zone_id ||
        !area_id
      ) {
        return json({ error: 'All fields are required.' }, { status: 400 });
      }

      const client = createPathaoClient({
        clientId: currentCourier.pathao.clientId,
        clientSecret: currentCourier.pathao.clientSecret,
        username: currentCourier.pathao.username,
        password: currentCourier.pathao.password,
        baseUrl: currentCourier.pathao.baseUrl,
      });

      try {
        await client.createStore({
          name,
          contact_name,
          contact_number,
          address,
          city_id,
          zone_id,
          area_id,
        });

        // Store Created! attempt to auto-set it
        let message = 'Store created successfully!';
        let autoSet = false;

        // Also return the fresh list of stores so the UI updates
        const freshStores = await client.getStores();
        const createdStore = freshStores.find((s) => s.store_name === name); // Try to find by name since API might not return ID

        if (createdStore) {
          // Update DB
          const updatedPathao = {
            ...currentCourier.pathao,
            defaultStoreId: createdStore.store_id,
          };

          const updatedCourier = {
            ...currentCourier,
            pathao: updatedPathao,
          };

          await saveUnifiedStorefrontSettingsWithCacheInvalidation(
            db as unknown as DrizzleD1Database<Record<string, unknown>>,
            {
              KV: context.cloudflare.env.STORE_CACHE,
              STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as Fetcher,
            },
            storeId,
            { courier: toUnifiedCourier(updatedCourier) }
          );

          await db
            .update(stores)
            .set({
              courierSettings: JSON.stringify(updatedCourier),
              updatedAt: new Date(),
            })
            .where(eq(stores.id, storeId));

          message += ` Auto-selected Store ID: ${createdStore.store_id}`;
          autoSet = true;
        } else {
          message += ' Please verify the Store ID in the list.';
        }

        return json({
          success: true,
          message,
          createdStore,
          stores: freshStores,
          autoSet,
        });
      } catch (error: unknown) {
        console.error('Create store error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create store';
        return json({ error: message }, { status: 500 });
      }
    }

    // ------------------------------------------------------------------------
    // CASE 1: Save Credentials
    // ------------------------------------------------------------------------
    if (intent === 'save') {
      const provider = String(formData.get('provider'));
      const providerResult = ProviderSchema.safeParse(provider);

      if (!providerResult.success) {
        return json({ error: 'Invalid provider' }, { status: 400 });
      }

      const selectedProvider = providerResult.data;
      let newSettings: Partial<CourierSettings> = {};

      if (selectedProvider === 'pathao') {
        const pathaoData = {
          clientId: formData.get('clientId'),
          clientSecret: formData.get('clientSecret'),
          username: formData.get('username'),
          password: formData.get('password'),
          baseUrl: formData.get('baseUrl'),
          defaultStoreId: formData.get('defaultStoreId')
            ? Number(formData.get('defaultStoreId'))
            : undefined,
        };

        const parseResult = PathaoInputSchema.safeParse(pathaoData);
        if (!parseResult.success) {
          return json({ error: parseResult.error.errors[0].message }, { status: 400 });
        }

        newSettings = {
          provider: 'pathao',
          pathao: {
            clientId: parseResult.data.clientId,
            username: parseResult.data.username,
            clientSecret:
              parseResult.data.clientSecret || currentCourier.pathao?.clientSecret || '',
            password: parseResult.data.password || currentCourier.pathao?.password || '',
            baseUrl: parseResult.data.baseUrl,
            defaultStoreId: parseResult.data.defaultStoreId,
          },
          redx: currentCourier.redx,
          steadfast: currentCourier.steadfast,
        };
      } else if (selectedProvider === 'redx') {
        // Placeholder
        newSettings = { ...currentCourier };
      } else if (selectedProvider === 'steadfast') {
        const steadfastData = {
          apiKey: String(formData.get('apiKey')),
          secretKey: String(formData.get('secretKey')),
        };
        newSettings = {
          provider: 'steadfast',
          pathao: currentCourier.pathao,
          redx: currentCourier.redx,
          steadfast: steadfastData,
        };
      }

      await saveUnifiedStorefrontSettingsWithCacheInvalidation(
        db as unknown as DrizzleD1Database<Record<string, unknown>>,
        {
          KV: context.cloudflare.env.STORE_CACHE,
          STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as Fetcher,
        },
        storeId,
        { courier: toUnifiedCourier(newSettings) }
      );

      await db
        .update(stores)
        .set({
          courierSettings: JSON.stringify(newSettings),
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      await logActivity(db, {
        storeId,
        userId: (await getUserId(request, context.cloudflare.env as unknown as Env)) ?? null,
        action: 'api_key_update',
        details: { action: `Updated ${selectedProvider} credentials` },
      });

      return json({ success: true, message: 'Settings saved successfully' });
    }

    // ------------------------------------------------------------------------
    // CASE 2: Test Connection
    // ------------------------------------------------------------------------
    if (intent === 'test') {
      const provider = currentCourier.provider;

      if (provider === 'pathao') {
        if (!currentCourier.pathao) return json({ error: 'No credentials found' }, { status: 400 });

        const client = createPathaoClient({
          clientId: currentCourier.pathao.clientId,
          clientSecret: currentCourier.pathao.clientSecret,
          username: currentCourier.pathao.username,
          password: currentCourier.pathao.password,
          baseUrl: currentCourier.pathao.baseUrl,
        });

        const isConnected = await client.testConnection();
        if (isConnected) {
          // Fetch stores to help user select ID
          const pathaoStores = await client.getStores();
          return json({
            success: true,
            message: 'Connection successful!',
            stores: pathaoStores,
          });
        } else {
          return json({ error: 'Connection failed. Check credentials.' }, { status: 400 });
        }
      }

      if (provider === 'steadfast') {
        if (!currentCourier.steadfast) return json({ error: 'No Steadfast credentials found' }, { status: 400 });

        const client = createSteadfastClient({
          apiKey: currentCourier.steadfast.apiKey,
          secretKey: currentCourier.steadfast.secretKey,
        });

        const isConnected = await client.testConnection();
        if (isConnected) {
          try {
            const balance = await client.getBalance();
            return json({
              success: true,
              message: `Connection successful! Balance: ৳${balance.current_balance}`,
            });
          } catch {
            return json({ success: true, message: 'Connection successful!' });
          }
        } else {
          return json({ error: 'Connection failed. Check API Key and Secret Key.' }, { status: 400 });
        }
      }

      return json({ error: 'Provider not supported for testing' }, { status: 400 });
    }

    // ------------------------------------------------------------------------
    // CASE 3: Disconnect
    // ------------------------------------------------------------------------
    if (intent === 'disconnect') {
      const disconnectedCourier = {
        provider: null,
        isConnected: false,
      };

      await saveUnifiedStorefrontSettingsWithCacheInvalidation(
        db as unknown as DrizzleD1Database<Record<string, unknown>>,
        {
          KV: context.cloudflare.env.STORE_CACHE,
          STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as Fetcher,
        },
        storeId,
        { courier: toUnifiedCourier(disconnectedCourier) }
      );

      await db
        .update(stores)
        .set({
          courierSettings: JSON.stringify(disconnectedCourier),
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      await logActivity(db, {
        storeId,
        userId: (await getUserId(request, context.cloudflare.env as unknown as Env)) ?? null,
        action: 'settings_updated',
        entityType: 'settings',
        details: {
          section: 'courier',
          intent: 'disconnect',
        },
      });

      return json({ success: true, message: 'Courier disconnected!' });
    }

    return json({ error: 'Unknown intent' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Settings error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CourierSettingsPage() {
  const { settings, cities } = useLoaderData<typeof loader>() as {
    settings: CourierSettings;
    cities: { city_id: number; city_name: string }[];
  };
  const actionData = useActionData<typeof action>() as ActionResponse | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();

  const [selectedProvider, setSelectedProvider] = useState<string>(settings.provider || 'pathao');

  // Update selected provider if settings change externally or on load
  useEffect(() => {
    if (settings.provider) {
      setSelectedProvider(settings.provider);
    }
  }, [settings.provider]);

  const providers = [
    {
      id: 'pathao',
      name: 'Pathao Courier',
      logo: '🚴',
      description: t('fastDeliveryDhaka'),
      signupUrl: 'https://merchant.pathao.com',
    },
    {
      id: 'redx',
      name: 'RedX',
      logo: '📦',
      description: t('nationwideCoverage'),
      signupUrl: 'https://redx.com.bd/merchant',
    },
    {
      id: 'steadfast',
      name: 'Steadfast Courier',
      logo: '🚚',
      description: t('affordableRates'),
      signupUrl: 'https://steadfast.com.bd',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('courierSettings')}</h1>
            <p className="text-gray-600">{t('courierSettingsDesc')}</p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div
          className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
            settings.isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}
        >
          {settings.isConnected ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Not Connected</span>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {actionData && 'success' in actionData && (
        <GlassCard className="bg-emerald-50/50 border-emerald-200/50 text-emerald-800 px-4 py-3 flex items-center gap-2 backdrop-blur-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {actionData.message}
        </GlassCard>
      )}
      {actionData && 'error' in actionData && (
        <GlassCard className="bg-red-50/50 border-red-200/50 text-red-600 px-4 py-3 flex items-center gap-2 backdrop-blur-sm">
          <XCircle className="w-5 h-5" />
          {actionData.error}
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Selection (Left Sidebar) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Select Provider</h2>
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedProvider === provider.id
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{provider.logo}</div>
                  <div>
                    <h3
                      className={`font-medium ${selectedProvider === provider.id ? 'text-emerald-900' : 'text-gray-900'}`}
                    >
                      {provider.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{provider.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* New Store Creation Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Need a Store ID?</h4>
                <p className="text-xs text-blue-700 mt-1">
                  You can now create a new Pathao store directly from here. Useful for Sandbox
                  testing!
                </p>
                <button
                  type="button"
                  onClick={() =>
                    (
                      document.getElementById('create-store-modal') as HTMLDialogElement
                    )?.showModal()
                  }
                  disabled={!settings.pathao?.clientId}
                  className="mt-2 text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !settings.pathao?.clientId
                      ? 'Please save Pathao credentials first'
                      : 'Create a new store'
                  }
                >
                  Create New Store
                </button>
                {!settings.pathao?.clientId && (
                  <p className="text-[10px] text-red-500 mt-1">Save credentials first to enable.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Form (Main Content) */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="save" />
              <input type="hidden" name="provider" value={selectedProvider} />

              {/* Pathao Form */}
              {selectedProvider === 'pathao' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Pathao Configuration</h3>
                    <a
                      href="https://merchant.pathao.com/developer/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      Get Credentials <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('clientId')}
                      </label>
                      <input
                        type="text"
                        name="clientId"
                        defaultValue={settings.pathao?.clientId || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('clientSecret')}
                      </label>
                      <input
                        type="password"
                        name="clientSecret"
                        defaultValue={settings.pathao?.clientSecret || ''}
                        placeholder={settings.pathao?.clientSecret ? '••••••••' : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('email')} / Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        defaultValue={settings.pathao?.username || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('password')}
                      </label>
                      <input
                        type="password"
                        name="password"
                        defaultValue={settings.pathao?.password || ''}
                        placeholder={settings.pathao?.password ? '••••••••' : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('baseUrl') || 'Base URL'}{' '}
                        <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="baseUrl"
                        defaultValue={settings.pathao?.baseUrl || ''}
                        placeholder="https://courier-api-sandbox.pathao.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for default. For Sandbox, use:{' '}
                        <code>https://courier-api-sandbox.pathao.com</code>
                      </p>
                    </div>

                    {/* Store ID Field */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Store ID <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="defaultStoreId"
                          defaultValue={settings.pathao?.defaultStoreId || ''}
                          placeholder="e.g. 13245"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                          required
                        />
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] text-gray-500 px-2 leading-tight">
                            Required for
                            <br />
                            creating orders
                          </span>
                        </div>
                      </div>

                      {/* Display Fetched Stores if available */}
                      {actionData && 'stores' in actionData && Array.isArray(actionData.stores) && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-semibold text-emerald-800">
                              Available Stores found in your account:
                            </p>
                            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {actionData.stores?.length || 0} found
                            </span>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {actionData.stores?.map((store: PathaoStore) => (
                              <div
                                key={store.store_id}
                                className="flex justify-between items-start text-xs p-2 bg-white rounded border border-emerald-100 shadow-sm hover:border-emerald-300 transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-emerald-900">{store.store_name}</p>
                                  <p
                                    className="text-gray-500 line-clamp-1"
                                    title={store.store_address}
                                  >
                                    {store.store_address}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700 font-bold select-all">
                                    ID: {store.store_id}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const input = document.querySelector(
                                        'input[name="defaultStoreId"]'
                                      ) as HTMLInputElement;
                                      if (input) input.value = String(store.store_id);
                                    }}
                                    className="text-[10px] text-emerald-600 hover:text-emerald-800 hover:underline font-medium flex items-center gap-0.5"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Use this
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* RedX Form */}
              {selectedProvider === 'redx' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4 text-sm text-amber-800">
                    <div className="flex items-center gap-2 mb-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Coming Soon
                    </div>
                    RedX integration is currently under development.
                  </div>
                </div>
              )}

              {/* Steadfast Form */}
              {selectedProvider === 'steadfast' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Steadfast Configuration</h3>
                    <a
                      href="https://portal.packzy.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      Get Keys <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('apiKey')}
                      </label>
                      <input
                        type="text"
                        name="apiKey"
                        defaultValue={settings.steadfast?.apiKey || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('secretKey')}
                      </label>
                      <input
                        type="password"
                        name="secretKey"
                        defaultValue={settings.steadfast?.secretKey || ''}
                        placeholder={settings.steadfast?.secretKey ? '••••••••' : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  name="intent"
                  value="save"
                  disabled={
                    isSubmitting ||
                    (selectedProvider !== 'pathao' && selectedProvider !== 'steadfast')
                  }
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t('saveCredentials')}
                </button>

                {selectedProvider === 'pathao' && (
                  <button
                    type="submit"
                    name="intent"
                    value="test"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    Test Connection
                  </button>
                )}
              </div>
            </Form>
          </GlassCard>
        </div>
      </div>

      <CreateStoreModal cities={cities || []} />
      <GlassCard className="bg-gray-50/50 border-gray-200/50 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{t('howShipmentsWork')}</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>{t('howShipmentsWork1')}</li>
          <li>{t('howShipmentsWork2')}</li>
          <li>{t('howShipmentsWork3')}</li>
          <li>{t('howShipmentsWork4')}</li>
          <li>{t('howShipmentsWork5')}</li>
        </ol>
      </GlassCard>
    </div>
  );
}

function CreateStoreModal({ cities }: { cities: { city_id: number; city_name: string }[] }) {
  const fetcher = useFetcher();
  const zoneFetcher = useFetcher();
  const areaFetcher = useFetcher();
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  // Fetch Zones when City changes
  useEffect(() => {
    if (selectedCity) {
      zoneFetcher.load(`/app/settings/courier?action=get-zones&city_id=${selectedCity}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  // Fetch Areas when Zone changes
  useEffect(() => {
    if (selectedZone) {
      areaFetcher.load(`/app/settings/courier?action=get-areas&zone_id=${selectedZone}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone]);

  // Close modal on success
  useEffect(() => {
    const data = fetcher.data as ActionResponse | undefined;
    if (data && 'success' in data && data.success) {
      modalRef.current?.close();
      // Reset form
      setSelectedCity(null);
      setSelectedZone(null);
      (document.getElementById('create-store-form') as HTMLFormElement)?.reset();
    }
  }, [fetcher.data]);

  return (
    <dialog
      id="create-store-modal"
      className="modal rounded-xl shadow-2xl p-0 backdrop:bg-black/50"
      ref={modalRef}
    >
      <div className="bg-white w-[500px] max-w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            Create New Store
          </h3>
          <form method="dialog">
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </form>
        </div>

        <div className="p-6 overflow-y-auto">
          <fetcher.Form method="post" id="create-store-form" className="space-y-4">
            <input type="hidden" name="intent" value="create-store" />

            {cities.length === 0 && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cannot load cities!</p>
                  <p>
                    Please make sure you have saved valid Pathao credentials in the settings first.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="My Awesome Store"
                className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  name="contact_name"
                  required
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="contact_number"
                  required
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                required
                placeholder="Full street address..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500"
                rows={2}
              ></textarea>
            </div>

            {/* City, Zone, Area Selection */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city_id"
                  required
                  className="w-full px-2 py-2 border rounded-lg text-sm"
                  onChange={(e) => setSelectedCity(Number(e.target.value))}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
                <select
                  name="zone_id"
                  required
                  className="w-full px-2 py-2 border rounded-lg text-sm disabled:bg-gray-100"
                  disabled={!selectedCity}
                  onChange={(e) => setSelectedZone(Number(e.target.value))}
                >
                  <option value="">Select Zone</option>
                  {(zoneFetcher.data as { zones: PathaoZone[] } | undefined)?.zones?.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.zone_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Area</label>
                <select
                  name="area_id"
                  required
                  className="w-full px-2 py-2 border rounded-lg text-sm disabled:bg-gray-100"
                  disabled={!selectedZone}
                >
                  <option value="">Select Area</option>
                  {(areaFetcher.data as { areas: PathaoArea[] } | undefined)?.areas?.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.area_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={fetcher.state === 'submitting'}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {fetcher.state === 'submitting' ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </fetcher.Form>
        </div>
      </div>
    </dialog>
  );
}
