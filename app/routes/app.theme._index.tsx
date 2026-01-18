/**
 * Theme Editor - Admin Route
 * 
 * Central hub for managing store themes and templates.
 * - View active theme and settings
 * - Access template editors (home, product, collection, cart, checkout)
 * - Install theme presets
 * - Global theme settings (colors, fonts, etc.)
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useNavigation, Form, Link } from '@remix-run/react';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { 
  themes, 
  themeTemplates, 
  themeSettingsDraft,
  stores,
  type Theme,
  type ThemeTemplate,
} from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { ensureTheme, installThemePreset, getAvailablePresets } from '~/lib/theme-seeding.server';
import { 
  Palette, 
  Layout, 
  ShoppingBag, 
  Grid3X3, 
  ShoppingCart, 
  CreditCard,
  FileText,
  Check,
  Loader2,
  Download,
  Eye,
  Settings,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }
  
  const db = context.cloudflare.env.DB;
  const drizzleDb = drizzle(db);
  
  // Get store info
  const [store] = await drizzleDb
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  // Ensure store has a theme
  const { themeId, created } = await ensureTheme(db, store.id);
  
  if (!themeId) {
    return json({
      theme: null,
      templates: [],
      settings: null,
      presets: getAvailablePresets(),
      storeId: store.id,
      storeName: store.name,
      themeCreated: false,
    });
  }
  
  // Fetch theme details
  const [themeResult] = await drizzleDb
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .limit(1);
  
  // Fetch templates
  const templatesResult = await drizzleDb
    .select()
    .from(themeTemplates)
    .where(eq(themeTemplates.themeId, themeId));
  
  // Fetch draft settings
  const [settingsResult] = await drizzleDb
    .select()
    .from(themeSettingsDraft)
    .where(eq(themeSettingsDraft.themeId, themeId))
    .limit(1);
  
  let settings = null;
  try {
    settings = settingsResult?.settingsJson ? JSON.parse(settingsResult.settingsJson) : null;
  } catch {
    settings = null;
  }
  
  return json({
    theme: themeResult,
    templates: templatesResult,
    settings,
    presets: getAvailablePresets(),
    storeId: store.id,
    storeName: store.name,
    themeCreated: created,
  });
}

// ============================================================================
// ACTION
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    return json({ error: 'Store not found' }, { status: 404 });
  }
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'install-preset') {
    const presetId = formData.get('presetId') as string;
    
    if (!presetId) {
      return json({ error: 'Preset ID is required' }, { status: 400 });
    }
    
    const result = await installThemePreset(context.cloudflare.env.DB, storeId, presetId);
    
    if (!result.success) {
      return json({ error: result.error }, { status: 400 });
    }
    
    return json({ success: true, themeId: result.themeId });
  }
  
  return json({ error: 'Unknown action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ThemeEditor() {
  const { 
    theme, 
    templates, 
    settings, 
    presets, 
    storeId, 
    storeName,
    themeCreated 
  } = useLoaderData<typeof loader>();
  
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  // Template icons and labels
  const templateConfig: Record<string, { icon: typeof Layout; label: string; description: string }> = {
    home: { 
      icon: Layout, 
      label: 'Home Page', 
      description: 'Hero, featured products, categories' 
    },
    product: { 
      icon: ShoppingBag, 
      label: 'Product Page', 
      description: 'Gallery, info, reviews, related products' 
    },
    collection: { 
      icon: Grid3X3, 
      label: 'Collection Page', 
      description: 'Product grid, filters, sorting' 
    },
    cart: { 
      icon: ShoppingCart, 
      label: 'Cart Page', 
      description: 'Cart items, summary, upsells' 
    },
    checkout: { 
      icon: CreditCard, 
      label: 'Checkout Page', 
      description: 'Customer info, shipping, payment' 
    },
    page: { 
      icon: FileText, 
      label: 'Custom Pages', 
      description: 'About, Contact, FAQ, etc.' 
    },
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Palette className="w-7 h-7 text-indigo-600" />
                Theme Editor
              </h1>
              <p className="text-gray-500 mt-1">
                Customize your store's appearance and templates
              </p>
            </div>
            
            {theme && (
              <div className="flex items-center gap-3">
                <Link
                  to={`/preview?theme=${theme.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Link>
                <Link
                  to="/app/theme/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  <Settings className="w-4 h-4" />
                  Global Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success message for new theme */}
        {themeCreated && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800">
              Default theme created successfully! Customize your templates below.
            </p>
          </div>
        )}
        
        {/* Current Theme Info */}
        {theme && settings && (
          <div className="bg-white rounded-xl border shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Active Theme: {theme.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Preset: {theme.presetId || 'Custom'}
                  </p>
                </div>
                
                {/* Theme Colors Preview */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: settings.primaryColor || '#000' }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: settings.accentColor || '#6366F1' }}
                    title="Accent Color"
                  />
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: settings.backgroundColor || '#FFF' }}
                    title="Background Color"
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 divide-x">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                <p className="text-sm text-gray-500">Templates</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{settings.headingFont || 'Inter'}</p>
                <p className="text-sm text-gray-500">Heading Font</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 capitalize">{settings.headerStyle || 'solid'}</p>
                <p className="text-sm text-gray-500">Header Style</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 capitalize">{settings.footerStyle || 'minimal'}</p>
                <p className="text-sm text-gray-500">Footer Style</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Templates Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(templateConfig).map(([key, config]) => {
              const template = templates.find(t => t.templateKey === key);
              const Icon = config.icon;
              
              return (
                <Link
                  key={key}
                  to={template ? `/app/theme/templates/${template.id}` : '#'}
                  className={`
                    bg-white rounded-xl border p-6 transition hover:shadow-md hover:border-indigo-300
                    ${!template ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{config.label}</h4>
                      <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                      {template && (
                        <p className="text-xs text-indigo-600 mt-2">
                          Click to customize →
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Theme Presets */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Install Theme Preset</h3>
          <p className="text-sm text-gray-500 mb-4">
            Choose a pre-built theme to get started quickly. This will replace your current theme.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`
                  bg-white rounded-xl border p-6 transition
                  ${theme?.presetId === preset.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'hover:shadow-md hover:border-gray-300'}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                  {theme?.presetId === preset.id && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">{preset.description}</p>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize mb-4">
                  {preset.category}
                </span>
                
                {theme?.presetId !== preset.id && (
                  <Form method="post">
                    <input type="hidden" name="intent" value="install-preset" />
                    <input type="hidden" name="presetId" value={preset.id} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Install Theme
                    </button>
                  </Form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
