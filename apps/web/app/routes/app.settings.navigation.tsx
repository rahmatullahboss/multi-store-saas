/**
 * Navigation Settings Page (MVP)
 *
 * Route: /app/settings/navigation
 *
 * Allows merchants to manage header navigation links.
 * Now uses unified settings as single source of truth.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { z } from 'zod';
import { requireTenant } from '~/lib/tenant-guard.server';
import { logActivity } from '~/lib/activity.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';
import { generateUUID } from '~/lib/uuid';

const MAX_HEADER_ITEMS = 8;
const MAX_DEPTH = 3;
const MAX_FOOTER_COLUMNS = 3;
const MAX_COLUMN_LINKS = 6;

const emptyMenuItem = () => ({
  id: generateUUID(),
  label: '',
  url: '',
  children: [] as Array<{ id?: string; label: string; url: string; children?: any[] }>,
});
const emptyFooterColumn = () => ({ id: generateUUID(), title: '', links: [] as Array<{ label: string; url: string }> });
import { ArrowLeft, CheckCircle, Loader2, Plus, Trash2, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

const FooterDescriptionSchema = z.string().trim().max(500);

function isValidNavigationUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const meta: MetaFunction = () => [{ title: 'Navigation Settings' }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  return json({
    storeId,
    headerMenu: unifiedSettings.navigation?.headerMenu ?? [],
    footerColumns: unifiedSettings.navigation?.footerColumns ?? [],
    footerDescription: unifiedSettings.navigation?.footerDescription ?? '',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });
  const formData = await request.formData();
  const menuJson = formData.get('headerMenu') as string | null;
  const footerColumnsJson = formData.get('footerColumns') as string | null;
  const footerDescriptionParsed = FooterDescriptionSchema.safeParse(
    formData.get('footerDescription') || ''
  );
  if (!footerDescriptionParsed.success) {
    return json({ error: 'Invalid footer description.' }, { status: 400 });
  }
  const footerDescription = footerDescriptionParsed.data;

  let headerMenu: Array<{
    label: string;
    url: string;
    children: Array<{
      label: string;
      url: string;
      children: Array<{ label: string; url: string }>;
    }>;
  }> = [];
  let footerColumns: Array<{ title: string; links: Array<{ label: string; url: string }> }> = [];

  if (menuJson) {
    try {
      const parsed = JSON.parse(menuJson) as Array<any>;
      const sanitizeMenu = (items: Array<any>, depth = 1): typeof headerMenu => {
        if (depth > MAX_DEPTH) return [];
        return items
          .map((item) => ({
            label: (item?.label || '').trim(),
            url: (item?.url || '').trim(),
            children: Array.isArray(item?.children) ? sanitizeMenu(item.children, depth + 1) : [],
          }))
          .filter((item) => item.label && isValidNavigationUrl(item.url))
          .slice(0, depth === 1 ? MAX_HEADER_ITEMS : MAX_COLUMN_LINKS);
      };

      headerMenu = sanitizeMenu(parsed, 1);
    } catch {
      return json({ error: 'Invalid header menu data.' }, { status: 400 });
    }
  }

  if (footerColumnsJson) {
    try {
      const parsed = JSON.parse(footerColumnsJson) as Array<any>;
      footerColumns = parsed
        .map((column: any) => ({
          title: (column?.title || '').trim(),
          links: Array.isArray(column?.links)
            ? column.links
                .map((link: any) => ({
                  label: (link?.label || '').trim(),
                  url: (link?.url || '').trim(),
                }))
                .filter((link: any) => link.label && isValidNavigationUrl(link.url))
                .slice(0, MAX_COLUMN_LINKS)
            : [],
        }))
        .filter((column) => column.title && column.links.length)
        .slice(0, MAX_FOOTER_COLUMNS);
    } catch {
      return json({ error: 'Invalid footer menu data.' }, { status: 400 });
    }
  }

  const db = drizzle(context.cloudflare.env.DB);

  try {
    await saveUnifiedStorefrontSettingsWithCacheInvalidation(
      db,
      {
        KV: context.cloudflare.env.STORE_CACHE,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as any,
      },
      storeId,
      {
        navigation: {
          headerMenu,
          footerColumns,
          footerDescription: footerDescription || null,
        },
      }
    );
  } catch (error) {
    console.error('Failed to save unified navigation settings:', error);
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }

  if (userId) {
    try {
      await logActivity(db, {
        storeId,
        userId,
        action: 'settings_updated',
        entityType: 'settings',
        details: {
          section: 'navigation',
          headerMenuItems: headerMenu.length,
          footerColumns: footerColumns.length,
          hasFooterDescription: Boolean(footerDescription),
        },
      });
    } catch (e) {
      console.error('logActivity failed:', e);
      // Don't fail the action because of this
    }
  }

  return json({ success: true });
}

export default function NavigationSettingsPage() {
  const { headerMenu, footerColumns, footerDescription } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [menu, setMenu] = useState(() =>
    headerMenu.map((item) => ({ id: generateUUID(), ...item }))
  );
  const [columns, setColumns] = useState(() =>
    footerColumns.map((col) => ({ id: generateUUID(), ...col }))
  );
  const [description, setDescription] = useState(footerDescription);
  const [showSuccess, setShowSuccess] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const remainingSlots = useMemo(() => MAX_HEADER_ITEMS - menu.length, [menu.length]);

  const handleAddLink = () => {
    if (menu.length >= MAX_HEADER_ITEMS) return;
    setMenu([...menu, emptyMenuItem()]);
  };

  const handleRemoveLink = (index: number) => {
    setMenu(menu.filter((_, idx) => idx !== index));
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...menu];
    updated[index] = { ...updated[index], [field]: value };
    setMenu(updated);
  };

  const addChild = (index: number) => {
    const updated = [...menu];
    const children = updated[index].children || [];
    if (children.length >= MAX_COLUMN_LINKS) return;
    updated[index].children = [...children, emptyMenuItem()];
    setMenu(updated);
  };

  const removeChild = (index: number, childIndex: number) => {
    const updated = [...menu];
    updated[index].children = (updated[index].children || []).filter(
      (_, idx) => idx !== childIndex
    );
    setMenu(updated);
  };

  const updateChild = (
    index: number,
    childIndex: number,
    field: 'label' | 'url',
    value: string
  ) => {
    const updated = [...menu];
    const children = updated[index].children || [];
    children[childIndex] = { ...children[childIndex], [field]: value };
    updated[index].children = children;
    setMenu(updated);
  };

  const handleAddColumn = () => {
    if (columns.length >= MAX_FOOTER_COLUMNS) return;
    setColumns([...columns, emptyFooterColumn()]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, idx) => idx !== index));
  };

  const updateColumnTitle = (index: number, value: string) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], title: value };
    setColumns(updated);
  };

  const addColumnLink = (index: number) => {
    const updated = [...columns];
    const links = updated[index].links || [];
    if (links.length >= MAX_COLUMN_LINKS) return;
    updated[index].links = [...links, { label: '', url: '' }];
    setColumns(updated);
  };

  const updateColumnLink = (
    index: number,
    linkIndex: number,
    field: 'label' | 'url',
    value: string
  ) => {
    const updated = [...columns];
    const links = updated[index].links || [];
    links[linkIndex] = { ...links[linkIndex], [field]: value };
    updated[index].links = links;
    setColumns(updated);
  };

  const removeColumnLink = (index: number, linkIndex: number) => {
    const updated = [...columns];
    updated[index].links = (updated[index].links || []).filter((_, idx) => idx !== linkIndex);
    setColumns(updated);
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Mobile Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 h-[60px]">
            <Link to="/app/settings" className="p-2 -ml-2 text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-semibold text-gray-900">
              {t('navigationSettings') || 'Navigation'}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex flex-col gap-5 p-4 pb-32">
          {/* Mobile Success/Error Messages */}
          {showSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('settingsSaved') || 'Settings saved successfully!'}
            </div>
          )}

          {actionData && 'error' in actionData && actionData.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl">
              {actionData.error}
            </div>
          )}

          {/* Header Navigation Card */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('headerNavigation') || 'Header Navigation'}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {t('headerNavigationDesc') || 'Add up to 8 links for your store menu.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={menu.length >= MAX_HEADER_ITEMS}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {t('addLink') || 'Add'}
                  </button>
                </div>

                {menu.length === 0 && (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                    {t('noLinksYet') || 'No links yet. Add your first navigation link.'}
                  </div>
                )}

                <div className="space-y-3">
                  {menu.map((link, index) => (
                    <div key={link.id} className="space-y-3 border border-gray-100 rounded-xl p-3">
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(index, 'label', e.target.value)}
                          placeholder={t('linkLabelPlaceholder') || 'Label'}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            placeholder="/products"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Child Links */}
                      <div className="pl-3 border-l-2 border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-500">
                            {t('childLinks') || 'Dropdown'}
                          </p>
                          <button
                            type="button"
                            onClick={() => addChild(index)}
                            className="text-xs text-emerald-600"
                          >
                            <Plus className="w-3 h-3 inline" /> {t('addChildLink') || 'Add'}
                          </button>
                        </div>
                        {(link.children || []).map((child, childIndex) => (
                          <div key={child.id ?? childIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={child.label}
                              onChange={(e) => updateChild(index, childIndex, 'label', e.target.value)}
                              placeholder="Label"
                              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              value={child.url}
                              onChange={(e) => updateChild(index, childIndex, 'url', e.target.value)}
                              placeholder="/url"
                              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeChild(index, childIndex)}
                              className="p-1 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {remainingSlots > 0 && (
                  <p className="text-xs text-gray-400">
                    {t('navigationLinksRemaining', { count: remainingSlots }) || `${remainingSlots} slots remaining.`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Navigation Card */}
          <Form method="post" id="mobile-navigation-form" className="hidden">
            <input type="hidden" name="headerMenu" value={JSON.stringify(menu)} />
            <input type="hidden" name="footerColumns" value={JSON.stringify(columns)} />
            <input type="hidden" name="footerDescription" value={description} />
          </Form>
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('footerNavigation') || 'Footer Navigation'}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {t('footerNavigationDesc') || 'Add up to 3 columns.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    disabled={columns.length >= MAX_FOOTER_COLUMNS}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {t('addColumn') || 'Add'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('footerDescription') || 'Description'}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={t('footerDescriptionPlaceholder') || 'Short brand statement...'}
                  />
                </div>

                {columns.length === 0 && (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                    {t('noFooterColumns') || 'No footer columns yet.'}
                  </div>
                )}

                <div className="space-y-3">
                  {columns.map((column, index) => (
                    <div key={column.id} className="space-y-2 border border-gray-100 rounded-xl p-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={column.title}
                          onChange={(e) => updateColumnTitle(index, e.target.value)}
                          placeholder={t('columnTitlePlaceholder') || 'Column Title'}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pl-3 border-l-2 border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-500">{t('columnLinks') || 'Links'}</p>
                          <button
                            type="button"
                            onClick={() => addColumnLink(index)}
                            className="text-xs text-emerald-600"
                          >
                            <Plus className="w-3 h-3 inline" /> {t('addLink') || 'Add'}
                          </button>
                        </div>
                        {(column.links || []).map((link, linkIndex) => (
                          <div key={link.url || link.label || linkIndex} className="flex gap-2"> {/* footer column links have no id */}
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => updateColumnLink(index, linkIndex, 'label', e.target.value)}
                              placeholder="Label"
                              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => updateColumnLink(index, linkIndex, 'url', e.target.value)}
                              placeholder="/url"
                              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeColumnLink(index, linkIndex)}
                              className="p-1 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Save Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70] md:hidden">
          <button
            type="submit"
            form="mobile-navigation-form"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('savingSettings') || 'Saving...'}
              </>
            ) : (
              t('saveSettings') || 'Save Settings'
            )}
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
        <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <List className="w-6 h-6 text-emerald-600" />
            {t('navigationSettings') || 'Navigation Settings'}
          </h1>
          <p className="text-gray-600">
            {t('navigationSettingsDesc') || 'Control the links shown in your store header.'}
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {t('settingsSaved') || 'Settings saved successfully!'}
        </div>
      )}

      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        <input type="hidden" name="headerMenu" value={JSON.stringify(menu)} />
        <input type="hidden" name="footerColumns" value={JSON.stringify(columns)} />
        <input type="hidden" name="footerDescription" value={description} />

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('headerNavigation') || 'Header Navigation'}
              </h2>
              <p className="text-sm text-gray-500">
                {t('headerNavigationDesc') || 'Add up to 8 links for your store menu.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLink}
              disabled={menu.length >= MAX_HEADER_ITEMS}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t('addLink') || 'Add Link'}
            </button>
          </div>

          {menu.length === 0 && (
            <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
              {t('noLinksYet') || 'No links yet. Add your first navigation link.'}
            </div>
          )}

          <div className="space-y-4">
            {menu.map((link, index) => (
              <div key={link.id} className="space-y-3 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_auto] gap-3 items-start">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('linkLabel') || 'Label'}
                    </label>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(index, 'label', e.target.value)}
                      placeholder={t('linkLabelPlaceholder') || 'Home'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('linkUrl') || 'URL'}
                    </label>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      placeholder="/products"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="pt-7">
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      aria-label="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      {t('childLinks') || 'Dropdown Links'}
                    </p>
                    <button
                      type="button"
                      onClick={() => addChild(index)}
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      <Plus className="w-3 h-3" />
                      {t('addChildLink') || 'Add child'}
                    </button>
                  </div>

                  {(link.children || []).length === 0 && (
                    <p className="text-xs text-gray-500">
                      {t('noChildLinks') || 'No dropdown links yet.'}
                    </p>
                  )}

                  {(link.children || []).map((child, childIndex) => (
                    <div
                      key={child.id ?? childIndex}
                      className="grid grid-cols-1 md:grid-cols-[2fr_3fr_auto] gap-3 items-start"
                    >
                      <input
                        type="text"
                        value={child.label}
                        onChange={(e) => updateChild(index, childIndex, 'label', e.target.value)}
                        placeholder={t('linkLabelPlaceholder') || 'New Arrivals'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <input
                        type="text"
                        value={child.url}
                        onChange={(e) => updateChild(index, childIndex, 'url', e.target.value)}
                        placeholder="/products?sort=newest"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => removeChild(index, childIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        aria-label="Remove child link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {remainingSlots > 0 && (
            <p className="text-xs text-gray-500">
              {t('navigationLinksRemaining', { count: remainingSlots }) || `${remainingSlots} slots remaining.`}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('footerNavigation') || 'Footer Navigation'}
              </h2>
              <p className="text-sm text-gray-500">
                {t('footerNavigationDesc') || 'Add up to 3 columns for footer links.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddColumn}
              disabled={columns.length >= MAX_FOOTER_COLUMNS}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t('addColumn') || 'Add Column'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('footerDescription') || 'Footer Description'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder={t('footerDescriptionPlaceholder') || 'Write a short brand statement.'}
            />
          </div>

          {columns.length === 0 && (
            <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
              {t('noFooterColumns') || 'No footer columns yet. Add your first column.'}
            </div>
          )}

          <div className="space-y-4">
            {columns.map((column, index) => (
              <div key={column.id} className="space-y-3 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => updateColumnTitle(index, e.target.value)}
                    placeholder={t('columnTitlePlaceholder') || 'Company'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    aria-label="Remove column"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      {t('columnLinks') || 'Links'}
                    </p>
                    <button
                      type="button"
                      onClick={() => addColumnLink(index)}
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      <Plus className="w-3 h-3" />
                      {t('addLink') || 'Add Link'}
                    </button>
                  </div>

                  {(column.links || []).length === 0 && (
                    <p className="text-xs text-gray-500">{t('noColumnLinks') || 'No links yet.'}</p>
                  )}

                  {(column.links || []).map((link, linkIndex) => (
                    <div
                      key={link.url || link.label || linkIndex} /* footer column links have no id */
                      className="grid grid-cols-1 md:grid-cols-[2fr_3fr_auto] gap-3 items-start"
                    >
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateColumnLink(index, linkIndex, 'label', e.target.value)
                        }
                        placeholder={t('linkLabelPlaceholder') || 'About Us'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateColumnLink(index, linkIndex, 'url', e.target.value)}
                        placeholder="/pages/about"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => removeColumnLink(index, linkIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        aria-label="Remove link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('savingSettings') || 'Saving...'}
              </>
            ) : (
              t('saveSettings') || 'Save Settings'
            )}
          </button>
        </div>
      </Form>
      </div>
    </>
  );
}
