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
import { useLoaderData, useActionData, Form, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { createPathaoClient } from '~/services/pathao.server';
import { createSteadfastClient } from '~/services/steadfast.server';
import { 
  Truck, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowLeft,
  Save,
  TestTube,
  AlertCircle,
  Store,
  Key,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

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

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return redirect('/auth/login');
  }

  // Guard: Store-only page - redirect if store is disabled
  const { requireStoreEnabled } = await import('~/services/store-guard.server');
  await requireStoreEnabled(storeId, context);

  const db = drizzle(context.cloudflare.env.DB);
  
  const storeResult = await db
    .select({ 
      themeConfig: stores.themeConfig,
      businessInfo: stores.businessInfo,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (storeResult.length === 0) {
    throw new Response('Store not found', { status: 404 });
  }

  // Parse courier settings from themeConfig
  const themeConfig = storeResult[0].themeConfig 
    ? JSON.parse(storeResult[0].themeConfig) 
    : {};

  const courierSettings: CourierSettings = themeConfig.courier || {
    provider: null,
    isConnected: false,
  };

  // Mask sensitive data
  const maskedSettings = {
    ...courierSettings,
    pathao: courierSettings.pathao ? {
      ...courierSettings.pathao,
      clientSecret: courierSettings.pathao.clientSecret ? '••••••••' : '',
      password: courierSettings.pathao.password ? '••••••••' : '',
    } : undefined,
    redx: courierSettings.redx ? {
      ...courierSettings.redx,
      secretKey: courierSettings.redx.secretKey ? '••••••••' : '',
    } : undefined,
    steadfast: courierSettings.steadfast ? {
      ...courierSettings.steadfast,
      secretKey: courierSettings.steadfast.secretKey ? '••••••••' : '',
    } : undefined,
  };

  return json({ settings: maskedSettings });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const provider = formData.get('provider') as 'pathao' | 'redx' | 'steadfast';

  const db = drizzle(context.cloudflare.env.DB);

  // Get current settings
  const storeResult = await db
    .select({ themeConfig: stores.themeConfig })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const themeConfig = storeResult[0]?.themeConfig 
    ? JSON.parse(storeResult[0].themeConfig) 
    : {};

  // ----------------------------------------
  // SAVE CREDENTIALS
  // ----------------------------------------
  if (intent === 'save') {
    const courierSettings: CourierSettings = {
      provider,
      isConnected: false,
    };

    if (provider === 'pathao') {
      courierSettings.pathao = {
        clientId: formData.get('clientId') as string,
        clientSecret: formData.get('clientSecret') as string,
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        defaultStoreId: formData.get('defaultStoreId') 
          ? parseInt(formData.get('defaultStoreId') as string) 
          : undefined,
      };
    } else if (provider === 'redx') {
      courierSettings.redx = {
        apiKey: formData.get('apiKey') as string,
        secretKey: formData.get('secretKey') as string,
      };
    } else if (provider === 'steadfast') {
      courierSettings.steadfast = {
        apiKey: formData.get('apiKey') as string,
        secretKey: formData.get('secretKey') as string,
      };
    }

    // Save to database
    themeConfig.courier = courierSettings;
    
    await db
      .update(stores)
      .set({ 
        themeConfig: JSON.stringify(themeConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    // Also save to courierSettings for Steadfast/RedX
    if (provider === 'steadfast' || provider === 'redx') {
      await db
        .update(stores)
        .set({ 
          courierSettings: JSON.stringify(courierSettings),
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));
    }

    return json({ success: true, message: 'Credentials saved!' });
  }

  // ----------------------------------------
  // TEST CONNECTION
  // ----------------------------------------
  if (intent === 'test') {
    const courierSettings = themeConfig.courier as CourierSettings;

    if (!courierSettings || !courierSettings.provider) {
      return json({ error: 'No courier configured' }, { status: 400 });
    }

    if (courierSettings.provider === 'pathao' && courierSettings.pathao) {
      try {
        const client = createPathaoClient({
          clientId: courierSettings.pathao.clientId,
          clientSecret: courierSettings.pathao.clientSecret,
          username: courierSettings.pathao.username,
          password: courierSettings.pathao.password,
        });

        const connected = await client.testConnection();

        if (connected) {
          // Update connection status
          themeConfig.courier.isConnected = true;
          await db
            .update(stores)
            .set({ 
              themeConfig: JSON.stringify(themeConfig),
              updatedAt: new Date(),
            })
            .where(eq(stores.id, storeId));

          // Get stores for dropdown
          const pathaoStores = await client.getStores();
          
          return json({ 
            success: true, 
            message: 'Connection successful!',
            stores: pathaoStores,
          });
        } else {
          return json({ error: 'Connection failed. Check your credentials.' });
        }
      } catch (error) {
        return json({ error: `Connection error: ${String(error)}` });
      }
    }

    // Steadfast test connection
    if (courierSettings.provider === 'steadfast' && courierSettings.steadfast) {
      try {
        const client = createSteadfastClient({
          apiKey: courierSettings.steadfast.apiKey,
          secretKey: courierSettings.steadfast.secretKey,
        });

        const connected = await client.testConnection();

        if (connected) {
          // Update connection status and save to courierSettings field
          courierSettings.isConnected = true;
          
          await db
            .update(stores)
            .set({ 
              courierSettings: JSON.stringify(courierSettings),
              themeConfig: JSON.stringify(themeConfig),
              updatedAt: new Date(),
            })
            .where(eq(stores.id, storeId));

          const balance = await client.getBalance();
          
          return json({ 
            success: true, 
            message: `Connected! Balance: ৳${balance.current_balance}`,
          });
        } else {
          return json({ error: 'Connection failed. Check your credentials.' });
        }
      } catch (error) {
        return json({ error: `Connection error: ${String(error)}` });
      }
    }

    return json({ error: 'Provider not supported yet' }, { status: 400 });
  }

  // ----------------------------------------
  // DISCONNECT
  // ----------------------------------------
  if (intent === 'disconnect') {
    themeConfig.courier = {
      provider: null,
      isConnected: false,
    };

    await db
      .update(stores)
      .set({ 
        themeConfig: JSON.stringify(themeConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Connected successfully!' });
  }

  if (intent === 'disconnect') {
    // ... logic for disconnecting
    
    // Reset courier settings in store record too
    await db
      .update(stores)
      .set({ 
        courierSettings: null,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    // Reset theme config courier settings
    if (themeConfig.courier) {
      themeConfig.courier = {
        provider: null,
        isConnected: false,
      };
      
      await db
      .update(stores)
      .set({ 
        themeConfig: JSON.stringify(themeConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    }

    return json({ success: true, message: 'Courier disconnected!' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CourierSettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  const [selectedProvider, setSelectedProvider] = useState<string>(settings.provider || '');

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
          <Link 
            to="/app/settings" 
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('courierSettings')}</h1>
            <p className="text-gray-600">{t('courierSettingsDesc')}</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {actionData && 'success' in actionData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {String(actionData.message)}
        </div>
      )}
      {actionData && 'error' in actionData && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {actionData.error}
        </div>
      )}

      {/* Connection Status */}
      {settings.isConnected && settings.provider && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800">
                {t('connectedTo')} {providers.find(p => p.id === settings.provider)?.name}
              </p>
              <p className="text-sm text-emerald-600">
                {t('canCreateShipments')}
              </p>
            </div>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="disconnect" />
            <button
              type="submit"
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              {t('disconnect')}
            </button>
          </Form>
        </div>
      )}

      {/* Provider Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('selectCourierProvider')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => setSelectedProvider(provider.id)}
              className={`p-4 border-2 rounded-xl text-left transition ${
                selectedProvider === provider.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{provider.logo}</div>
              <p className="font-semibold text-gray-900">{provider.name}</p>
              <p className="text-sm text-gray-500 mt-1">{provider.description}</p>
              <a 
                href={provider.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-2 hover:underline"
              >
                {t('merchantSignup')} <ExternalLink className="w-3 h-3" />
              </a>
            </button>
          ))}
        </div>
      </div>

      {/* Credentials Form */}
      {selectedProvider && (
        <Form method="post" className="bg-white rounded-xl border border-gray-200 p-6">
          <input type="hidden" name="provider" value={selectedProvider} />
          
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              {providers.find(p => p.id === selectedProvider)?.name} {t('credentials')}
            </h2>
          </div>

          {/* Pathao Fields */}
          {selectedProvider === 'pathao' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">📋 {t('howToGetPathao')}</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Login to <a href="https://merchant.pathao.com" target="_blank" rel="noopener noreferrer" className="underline">merchant.pathao.com</a></li>
                  <li>Go to Settings → API Credentials</li>
                  <li>Copy Client ID, Client Secret, Username and Password</li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('clientId')}
                  </label>
                  <input
                    type="text"
                    name="clientId"
                    defaultValue={settings.pathao?.clientId || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    placeholder={settings.pathao?.clientSecret || 'Enter client secret'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required={!settings.pathao?.clientSecret}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('usernameEmail')}
                  </label>
                  <input
                    type="email"
                    name="username"
                    defaultValue={settings.pathao?.username || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    placeholder={settings.pathao?.password || 'Enter password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required={!settings.pathao?.password}
                  />
                </div>
              </div>
            </div>
          )}

          {/* RedX Fields (Still coming soon) */}
          {selectedProvider === 'redx' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {t('redxComingSoon')}
              </div>

              <div className="grid grid-cols-2 gap-4 opacity-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('apiKey')}
                  </label>
                  <input
                    type="text"
                    name="apiKey"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('secretKey')}
                  </label>
                  <input
                    type="password"
                    name="secretKey"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Steadfast Fields */}
          {selectedProvider === 'steadfast' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                <p className="font-medium mb-1">📋 {t('howToGetSteadfast')}</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Login to <a href="https://portal.packzy.com" target="_blank" rel="noopener noreferrer" className="underline">portal.packzy.com</a></li>
                  <li>Go to Settings → API Settings</li>
                  <li>Copy your API Key and Secret Key</li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('apiKey')}
                  </label>
                  <input
                    type="text"
                    name="apiKey"
                    defaultValue={settings.steadfast?.apiKey || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    placeholder={settings.steadfast?.secretKey || 'Enter secret key'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required={!settings.steadfast?.secretKey}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={isSubmitting || (selectedProvider !== 'pathao' && selectedProvider !== 'steadfast')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('saveCredentials')}
            </button>

            {settings.provider === selectedProvider && (
              <button
                type="submit"
                name="intent"
                value="test"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-0 disabled:opacity-50 transition"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                {t('testConnection')}
              </button>
            )}
          </div>
        </Form>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{t('howShipmentsWork')}</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>{t('howShipmentsWork1')}</li>
          <li>{t('howShipmentsWork2')}</li>
          <li>{t('howShipmentsWork3')}</li>
          <li>{t('howShipmentsWork4')}</li>
          <li>{t('howShipmentsWork5')}</li>
        </ol>
      </div>
    </div>
  );
}
