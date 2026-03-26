/**
 * Pages Management (Simplified)
 * 
 * Route: /app/pages
 * 
 * Features:
 * - List all custom pages from `landingPages` table
 * - Actions: View Live, Delete
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, useFetcher } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { landingPages, stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { Trash2, ExternalLink, FileText } from 'lucide-react';

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

    // Fetch custom pages
    const pagesResult = await db
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

    const pages = pagesResult.map(p => ({
        id: p.id,
        name: p.name || 'Untitled',
        slug: p.slug,
        status: p.isPublished ? 'published' as const : 'draft' as const,
        createdAt: p.createdAt,
    }));

    // Get Store info for constructing URLs
    const store = await db
        .select({ subdomain: stores.subdomain, customDomain: stores.customDomain })
        .from(stores)
        .where(eq(stores.id, storeId))
        .get();

    return json({ pages, store });
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
        const pageId = Number(formData.get('pageId'));
        if (isNaN(pageId)) return json({ error: 'Invalid page ID' }, { status: 400 });

        await db
            .delete(landingPages)
            .where(and(eq(landingPages.id, pageId), eq(landingPages.storeId, storeId)));

        return json({ success: true });
    }

    return json({ error: 'Invalid intent' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PagesManagement() {
    const { pages, store } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    const getPageUrl = (slug: string) => {
        const baseUrl = store?.customDomain
            ? `https://${store.customDomain}`
            : `https://${store?.subdomain}.ozzyl.com`;
        return `${baseUrl}/p/${slug}`;
    };

    return (
        <div className="md:px-8 py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                <p className="text-gray-600">Manage your custom pages</p>
            </div>

            {/* Pages List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {pages.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Page</th>
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
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 text-gray-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900">
                                                    {page.name}
                                                </span>
                                                <p className="text-xs text-gray-500">
                                                    Created {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                        </div>
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
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this page?')) {
                                                        fetcher.submit(
                                                            { intent: 'delete', pageId: page.id.toString() },
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
                        <p>Custom pages will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
