/**
 * My Themes - User's Theme Collection
 * Route: /app/my-themes
 * 
 * Displays all themes the user has installed/purchased. Allows switching between themes.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useNavigation, Form, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { stores, storeThemes } from '@db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { 
  Palette, Trash2, CheckCircle2, ExternalLink, Sparkles, ArrowLeft,
  Plus, Settings, RotateCcw, Loader2
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => [{ title: 'My Themes - Ozzyl' }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw json({ error: 'Unauthorized' }, { status: 401 });

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch user's installed themes
  const themes = await db
    .select()
    .from(storeThemes)
    .where(eq(storeThemes.storeId, storeId))
    .orderBy(desc(storeThemes.lastUsedAt));

  return json({ themes });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const themeId = formData.get('themeId') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'activate' && themeId) {
    // Get the theme to activate
    const theme = await db
      .select()
      .from(storeThemes)
      .where(and(eq(storeThemes.id, parseInt(themeId)), eq(storeThemes.storeId, storeId)))
      .limit(1);

    if (theme.length === 0) {
      return json({ error: 'Theme not found' }, { status: 404 });
    }

    // Deactivate all themes for this store
    await db
      .update(storeThemes)
      .set({ isActive: false })
      .where(eq(storeThemes.storeId, storeId));

    // Activate selected theme
    await db
      .update(storeThemes)
      .set({ isActive: true, lastUsedAt: new Date() })
      .where(eq(storeThemes.id, parseInt(themeId)));

    // Apply theme config to store
    await db
      .update(stores)
      .set({
        themeConfig: theme[0].config,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Theme activated' });
  }

  if (intent === 'delete' && themeId) {
    // Don't allow deleting active theme
    const theme = await db
      .select()
      .from(storeThemes)
      .where(and(eq(storeThemes.id, parseInt(themeId)), eq(storeThemes.storeId, storeId)))
      .limit(1);

    if (theme.length > 0 && theme[0].isActive) {
      return json({ error: 'Cannot delete active theme. Activate another theme first.' }, { status: 400 });
    }

    await db
      .delete(storeThemes)
      .where(and(eq(storeThemes.id, parseInt(themeId)), eq(storeThemes.storeId, storeId)));

    return json({ success: true, message: 'Theme removed from collection' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function MyThemes() {
  const { themes } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1 text-purple-600">
            <Palette size={20} />
            <span className="text-sm font-semibold tracking-wider uppercase">Collection</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Themes</h1>
          <p className="text-gray-500 mt-1">Manage your installed themes. Switch anytime.</p>
        </div>
        
        <div className="flex gap-3">
          <Link 
            to="/app/theme-store"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-purple-600 px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
          >
            <Plus size={16} />
            Browse Themes
          </Link>
          <Link 
            to="/app/store-design"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-purple-200"
          >
            <ArrowLeft size={16} />
            Back to Design
          </Link>
        </div>
      </div>

      {themes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Themes Yet</h3>
          <p className="text-gray-500 mb-6">Install themes from the Theme Store to build your collection.</p>
          <Link 
            to="/app/theme-store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <Sparkles size={18} />
            Browse Theme Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <div 
              key={theme.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-300 group flex flex-col h-full ${
                theme.isActive 
                  ? 'border-purple-400 ring-2 ring-purple-100' 
                  : 'border-gray-200 hover:shadow-lg hover:border-purple-200'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-100">
                {theme.thumbnail ? (
                  <img 
                    src={theme.thumbnail} 
                    alt={theme.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                    <Palette size={40} className="text-purple-300" />
                  </div>
                )}
                
                {/* Active Badge */}
                {theme.isActive && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <CheckCircle2 size={12} />
                    ACTIVE
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{theme.name}</h3>
                
                <div className="text-xs text-gray-400 mb-4">
                  {theme.installedAt && (
                    <span>Installed: {new Date(theme.installedAt).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  {!theme.isActive && (
                    <Form method="POST" className="flex-grow">
                      <input type="hidden" name="intent" value="activate" />
                      <input type="hidden" name="themeId" value={theme.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-black disabled:opacity-50 transition-all active:scale-95"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <>
                            <RotateCcw size={16} />
                            Activate
                          </>
                        )}
                      </button>
                    </Form>
                  )}
                  
                  {theme.isActive && (
                    <button
                      disabled
                      className="flex-grow inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-500 rounded-xl text-sm font-bold cursor-not-allowed relative"
                      title="Coming Soon"
                    >
                      <Settings size={16} />
                      Edit Theme
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        Soon
                      </span>
                    </button>
                  )}
                  
                  {!theme.isActive && (
                    <Form method="POST">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="themeId" value={theme.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
                        title="Remove from collection"
                      >
                        <Trash2 size={18} />
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
