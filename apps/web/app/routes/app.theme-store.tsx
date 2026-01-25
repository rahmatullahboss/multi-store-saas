/**
 * Theme Store - Merchant Dashboard
 * Route: /app/theme-store
 * 
 * Allows merchants to browse and install system themes (from registry).
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useNavigation, useActionData, Form, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { stores, storeThemes } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { 
  Palette, Layout, Image as ImageIcon, CheckCircle2, 
  ExternalLink, Sparkles, ArrowLeft,
  BadgeCheck, ShoppingBag, Loader2, Crown, Store
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { STORE_TEMPLATES, type StoreTemplateDefinition, getStoreTemplate } from '~/templates/store-registry';
import { type ThemeConfig, defaultThemeConfig } from '@db/types';
import { installThemePreset, installCustomThemePreset, convertPresetToConfig } from '~/lib/theme-seeding.server';
import { getThemePreset, createPresetFromStoreTemplate } from '~/lib/theme-presets';

export const meta: MetaFunction = () => [{ title: 'Theme Store - Ozzyl' }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  
  // We use the static registry as the source of truth for system themes
  return json({ themes: STORE_TEMPLATES });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const themeId = formData.get('themeId') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (!themeId) {
    return json({ error: 'Theme ID required' }, { status: 400 });
  }

  // 1. Find the selected template in the registry
  const template = STORE_TEMPLATES.find(t => t.id === themeId);

  if (!template) {
    return json({ error: 'Theme not found in registry' }, { status: 404 });
  }

  // 2. Build ThemeConfig from template defaults
  const newThemeConfig: ThemeConfig = {
    storeTemplateId: template.id,
    primaryColor: template.theme.primary,
    accentColor: template.theme.accent,
    backgroundColor: template.theme.background,
    textColor: template.theme.text,
    sections: [], // Fresh sections (template default will be used)
  };

  // 3. Check if this theme is already in user's collection
  const existingTheme = await db
    .select()
    .from(storeThemes)
    .where(and(eq(storeThemes.storeId, storeId), eq(storeThemes.templateId, template.id)))
    .limit(1);

  // 4. Deactivate all current themes for this store
  await db
    .update(storeThemes)
    .set({ isActive: false })
    .where(eq(storeThemes.storeId, storeId));

  if (existingTheme.length > 0) {
    // Theme already in collection - just activate it
    await db
      .update(storeThemes)
      .set({ 
        isActive: true, 
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(storeThemes.id, existingTheme[0].id));
  } else {
    // 5. Add theme to user's collection
    await db.insert(storeThemes).values({
      storeId,
      templateId: template.id,
      name: template.name,
      config: JSON.stringify(newThemeConfig),
      thumbnail: template.thumbnail,
      isActive: true,
      installedAt: new Date(),
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 6. Apply theme to store (for immediate use)
  await db
    .update(stores)
    .set({
      themeConfig: JSON.stringify(newThemeConfig),
      fontFamily: template.fonts.body,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  // 7. Seed the theme into the new system (for Editor compatibility)
  try {
    const preset = getThemePreset(template.id);
    
    if (preset) {
      await installThemePreset(context.cloudflare.env.DB, storeId, template.id);
    } else {
      // Create dynamic preset from legacy template definition
      const dynamicPreset = createPresetFromStoreTemplate(template);
      const config = convertPresetToConfig(dynamicPreset);
      await installCustomThemePreset(context.cloudflare.env.DB, storeId, config);
    }
  } catch (err) {
    console.error('Theme seeding failed:', err);
    // Non-blocking error, allow redirection to proceed
  }

  return redirect('/store-live-editor');
}

export default function ThemeStore() {
  const { themes } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();

  // Category visual helpers
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'luxury': return <Crown size={14} className="text-amber-600" />;
      case 'tech': return <Sparkles size={14} className="text-blue-600" />;
      case 'artisan': return <Palette size={14} className="text-orange-600" />;
      default: return <Store size={14} className="text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1 text-purple-600">
            <Sparkles size={20} />
            <span className="text-sm font-semibold tracking-wider uppercase">Marketplace</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Theme Store</h1>
          <p className="text-gray-500 mt-1">Browse and install professional themes for your store.</p>
        </div>
        
        <Link 
          to="/app/store-design"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-purple-200"
        >
          <ArrowLeft size={16} />
          Back to Design
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {themes.map((theme) => (
          <div 
            key={theme.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 group flex flex-col h-full"
          >
            {/* Thumbnail Placeholder/Image */}
            <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-100">
              {theme.thumbnail ? (
                <img 
                  src={theme.thumbnail} 
                  alt={theme.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                   {/* Fallback abstract pattern */}
                   <div className="text-center opacity-20">
                      <Layout size={48} className="mx-auto mb-2" />
                      <span className="text-xs uppercase font-bold tracking-widest">{theme.category} TEMPLATE</span>
                   </div>
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 border border-gray-100">
                {getCategoryIcon(theme.category)}
                <span className="uppercase tracking-wide text-[10px]">{theme.category}</span>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {theme.name}
                </h3>
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                  <BadgeCheck size={12} />
                  Verified
                </div>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                {theme.description}
              </p>

              {/* Color Swatches */}
              <div className="flex items-center gap-2 mb-6">
                 {Object.entries(theme.theme).slice(0, 4).map(([key, color]) => (
                   <div 
                    key={key} 
                    className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" 
                    style={{ backgroundColor: color as string }} 
                    title={key}
                   />
                 ))}
                 <span className="text-xs text-gray-400 pl-1">+ more</span>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <Form method="POST" className="flex-grow">
                  <input type="hidden" name="themeId" value={theme.id} />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-black disabled:opacity-50 transition-all active:scale-95 group-hover:shadow-purple-200"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        Install Theme
                      </>
                    )}
                  </button>
                </Form>
                
                {/* Preview Link */}
                <Link 
                  to={`/store-template-preview/${theme.id}`} // Assuming this route exists or we create it
                  className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-purple-600 rounded-xl transition-colors border border-gray-200"
                  title="Preview"
                >
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
