/**
 * Campaign Pages Management
 * 
 * Route: /app/pages
 * 
 * Features:
 * - List all created landing pages
 * - Metric overview (views, status)
 * - Actions: Edit (Builder), View Live, Delete
 * - Create new page
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Link, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { savedLandingConfigs, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Plus, Eye, Edit, Trash2, Globe, Copy, MoreHorizontal, FileText, ExternalLink } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useState } from 'react';

export const meta: MetaFunction = () => {
    return [{ title: 'Campaign Pages - Ozzyl' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
    const storeId = await getStoreId(request, context.cloudflare.env);
    if (!storeId) {
        throw new Response('Unauthorized', { status: 401 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    // Fetch only active "pages" (those with offerSlug)
    // We exclude homepage backups unless they are promoted to active pages
    // For now, we fetch everything with a slug
    const pages = await db
        .select()
        .from(savedLandingConfigs)
        .where(
            and(
                eq(savedLandingConfigs.storeId, storeId),
                eq(savedLandingConfigs.isActive, true)
            )
        )
        .orderBy(desc(savedLandingConfigs.createdAt));

    // Get Store Subdomain for constructing URLs
    const store = await db
        .select({ subdomain: stores.subdomain, customDomain: stores.customDomain, currency: stores.currency })
        .from(stores)
        .where(eq(stores.id, storeId))
        .get();

    return json({ pages, store });
}

// ============================================================================
// ACTION (Create / Delete)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
    const storeId = await getStoreId(request, context.cloudflare.env);
    if (!storeId) return json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const intent = formData.get('intent');
    const db = drizzle(context.cloudflare.env.DB);

    if (intent === 'create') {
        const title = formData.get('title') as string;
        const slug = formData.get('slug') as string;

        if (!title || !slug) {
            return json({ error: 'Title and Slug are required' }, { status: 400 });
        }

        // Check slug uniqueness
        const existing = await db
            .select()
            .from(savedLandingConfigs)
            .where(and(eq(savedLandingConfigs.storeId, storeId), eq(savedLandingConfigs.offerSlug, slug)))
            .get();

        if (existing) {
            return json({ error: 'Slug already exists' }, { status: 400 });
        }

        // Create new page with default empty config
        await db.insert(savedLandingConfigs).values({
            storeId,
            name: title,
            offerSlug: slug,
            landingConfig: JSON.stringify({}), // Empty config, will rely on builder defaults or template
            isActive: true,
            createdAt: new Date(),
        });

        return json({ success: true });
    }

    if (intent === 'delete') {
        const pageId = parseInt(formData.get('pageId') as string);

        await db
            .delete(savedLandingConfigs)
            .where(and(eq(savedLandingConfigs.id, pageId), eq(savedLandingConfigs.storeId, storeId)));

        return json({ success: true });
    }

    return json({ error: 'Invalid intent' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CampaignPages() {
    const { pages, store } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const fetcher = useFetcher();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isCreating = fetcher.state !== 'idle' && fetcher.formData?.get('intent') === 'create';

    const getPageUrl = (slug: string) => {
        const baseUrl = store?.customDomain
            ? `https://${store.customDomain}`
            : `https://${store?.subdomain}.ozzyl.com`; // Adjust domain as per env
        return `${baseUrl}/p/${slug}`;
    };

    return (
        <div className="md:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campaign Pages</h1>
                    <p className="text-gray-600">Create dedicated landing pages for marketing campaigns</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Create New Page
                </button>
            </div>

            {/* Pages List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {pages.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Page Info</th>
                                <th className="px-6 py-4">URL Slug</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Revenue</th>
                                <th className="px-6 py-4">Conv. Rate</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pages.map((page) => (
                                <tr key={page.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/app/new-builder/${page.id}`}
                                                    className="font-semibold text-gray-900 hover:text-indigo-600"
                                                >
                                                    {page.name}
                                                </Link>
                                                <p className="text-xs text-gray-500">
                                                    Created {new Date(page.createdAt!).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            /p/{page.offerSlug}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {page.viewCount || 0}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {page.orders || 0}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {store?.currency || 'BDT'} {(page.revenue || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {((page.orders || 0) / (page.viewCount || 1) * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={getPageUrl(page.offerSlug!)}
                                                target="_blank"
                                                rel="noreferrer hover:bg-gray-100"
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                                title="View Live"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <Link
                                                to={`/app/new-builder/${page.id}`}
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                                                title="Edit in Builder"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this page?')) {
                                                        fetcher.submit({ intent: 'delete', pageId: page.id.toString() }, { method: 'post' });
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No pages yet</h3>
                        <p className="mb-6">Create your first campaign landing page to start promoting offers.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Create Page
                        </button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Page</h2>
                        <fetcher.Form method="post" onSubmit={() => setIsCreateModalOpen(false)}>
                            <input type="hidden" name="intent" value="create" />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g. Summer Sale 2026"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            /p/
                                        </span>
                                        <input
                                            type="text"
                                            name="slug"
                                            required
                                            placeholder="summer-sale"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : 'Create Page'}
                                </button>
                            </div>
                        </fetcher.Form>
                    </div>
                </div>
            )}
        </div>
    );
}
