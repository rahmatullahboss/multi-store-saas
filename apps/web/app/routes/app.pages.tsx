/**
 * Campaign Pages Management (Modernized)
 * 
 * Route: /app/pages
 * 
 * Features:
 * - List all pages from Page Builder v2 and GrapesJS
 * - Create new pages with builder selection
 * - Metric overview (views, status)
 * - Actions: Edit, View Live, Delete
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useFetcher, Link } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { builderPages } from '@db/schema_page_builder';
import { requireTenant } from '~/lib/tenant-guard.server';
import { Plus, Edit, Trash2, ExternalLink, FileText, Layers, Palette } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useState } from 'react';

export const meta: MetaFunction = () => {
    return [{ title: 'Pages - Ozzyl' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
    const { storeId } = await requireTenant(request, context, {
      requirePermission: 'customers',
    });

    const db = drizzle(context.cloudflare.env.DB);

    // Fetch Page Builder v2 pages
    const builderPagesResult = await db
        .select({
            id: builderPages.id,
            title: builderPages.title,
            slug: builderPages.slug,
            status: builderPages.status,
            createdAt: builderPages.createdAt,
        })
        .from(builderPages)
        .where(eq(builderPages.storeId, storeId))
        .orderBy(desc(builderPages.createdAt));

    // Fetch GrapesJS pages
    const grapesPagesResult = await db
        .select({
            id: landingPages.id,
            name: landingPages.name,
            slug: landingPages.slug,
            isPublished: landingPages.isPublished,
            createdAt: landingPages.createdAt,
        })
        .from(landingPages)
        .where(eq(landingPages.storeId, storeId))
        .orderBy(desc(landingPages.createdAt));

    // Combine into unified list
    const allPages = [
        ...builderPagesResult.map(p => ({
            id: p.id,
            name: p.title || 'Untitled',
            slug: p.slug,
            status: p.status === 'published' ? 'published' : 'draft',
            type: 'builder' as const,
            createdAt: p.createdAt,
            editUrl: `/app/new-builder/${p.id}`,
        })),
        ...grapesPagesResult.map(p => ({
            id: `grapes:${p.id}`,
            name: p.name || 'Untitled',
            slug: p.slug,
            status: p.isPublished ? 'published' : 'draft',
            type: 'grapes' as const,
            createdAt: p.createdAt,
            editUrl: `/app/page-builder?pageId=${p.id}`,
        })),
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Get Store info for constructing URLs
    const store = await db
        .select({ subdomain: stores.subdomain, customDomain: stores.customDomain })
        .from(stores)
        .where(eq(stores.id, storeId))
        .get();

    return json({ pages: allPages, store });
}

// ============================================================================
// ACTION (Delete)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
    const { storeId } = await requireTenant(request, context, {
      requirePermission: 'customers',
    });

    const formData = await request.formData();
    const intent = formData.get('intent');
    const db = drizzle(context.cloudflare.env.DB);

    if (intent === 'delete') {
        const pageId = formData.get('pageId') as string;
        const pageType = formData.get('pageType') as string;

        if (pageType === 'grapes') {
            const numericId = parseInt(pageId.replace('grapes:', ''), 10);
            await db
                .delete(landingPages)
                .where(and(eq(landingPages.id, numericId), eq(landingPages.storeId, storeId)));
        } else {
            await db
                .delete(builderPages)
                .where(and(eq(builderPages.id, pageId), eq(builderPages.storeId, storeId)));
        }

        return json({ success: true });
    }

    return json({ error: 'Invalid intent' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PagesManagement() {
    const { pages, store } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const fetcher = useFetcher();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const getPageUrl = (slug: string) => {
        const baseUrl = store?.customDomain
            ? `https://${store.customDomain}`
            : `https://${store?.subdomain}.ozzyl.com`;
        return `${baseUrl}/p/${slug}`;
    };

    return (
        <div className="md:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                    <p className="text-gray-600">Create and manage your landing pages and campaigns</p>
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
                                <th className="px-6 py-4">Page</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">URL</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pages.map((page) => (
                                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                page.type === 'grapes' 
                                                    ? 'bg-orange-50 text-orange-600'
                                                    : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {page.type === 'grapes' ? (
                                                    <Palette className="w-5 h-5" />
                                                ) : (
                                                    <Layers className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <Link
                                                    to={page.editUrl}
                                                    className="font-semibold text-gray-900 hover:text-indigo-600"
                                                >
                                                    {page.name}
                                                </Link>
                                                <p className="text-xs text-gray-500">
                                                    Created {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            page.type === 'grapes' 
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {page.type === 'grapes' ? 'GrapesJS' : 'Page Builder'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            page.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {page.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">/p/{page.slug}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {page.status === 'published' && (
                                                <a
                                                    href={getPageUrl(page.slug)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                                    title="View Live"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            <Link
                                                to={page.editUrl}
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this page?')) {
                                                        fetcher.submit(
                                                            { intent: 'delete', pageId: page.id.toString(), pageType: page.type },
                                                            { method: 'post' }
                                                        );
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
                        <p className="mb-6">Create your first landing page to start promoting offers.</p>
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

            {/* Create Modal with Builder Selection */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Create New Page</h2>
                        <p className="text-gray-600 text-sm mb-6">Choose a builder to create your page</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Page Builder v2 Option */}
                            <Link
                                to="/app/new-builder"
                                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
                                    <Layers className="w-7 h-7 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-gray-900">Page Builder</h3>
                                    <p className="text-xs text-gray-500 mt-1">Drag & drop sections</p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recommended</span>
                            </Link>

                            {/* GrapesJS Option */}
                            <Link
                                to="/app/page-builder"
                                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition group"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition">
                                    <Palette className="w-7 h-7 text-orange-600" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-gray-900">GrapesJS</h3>
                                    <p className="text-xs text-gray-500 mt-1">Visual HTML editor</p>
                                </div>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Advanced</span>
                            </Link>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="w-full mt-6 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-center"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
