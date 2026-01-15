/**
 * Collections List Page
 * Route: /app/collections
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql, and } from 'drizzle-orm';
import { collections, productCollections } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Plus, Folder, Trash2, Pencil, ImageOff } from 'lucide-react';
import { PageHeader, EmptyState } from '~/components/ui';

export const meta: MetaFunction = () => [{ title: 'Collections - Ozzyl' }];

export async function loader({ request, context }: LoaderFunctionArgs) {
    const storeId = await getStoreId(request, context.cloudflare.env);
    if (!storeId) throw new Response('Store not found', { status: 404 });

    const db = drizzle(context.cloudflare.env.DB);
    const storeCollections = await db
        .select({
            id: collections.id,
            title: collections.title,
            slug: collections.slug,
            imageUrl: collections.imageUrl,
            isActive: collections.isActive,
            productCount: sql<number>`count(${productCollections.productId})`,
        })
        .from(collections)
        .leftJoin(productCollections, eq(collections.id, productCollections.collectionId))
        .where(eq(collections.storeId, storeId))
        .groupBy(collections.id)
        .orderBy(desc(collections.createdAt));

    return json({ collections: storeCollections });
}

export async function action({ request, context }: ActionFunctionArgs) {
    const storeId = await getStoreId(request, context.cloudflare.env);
    if (!storeId) return json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const intent = formData.get('intent');
    const collectionId = formData.get('id');
    const db = drizzle(context.cloudflare.env.DB);

    if (intent === 'delete' && collectionId) {
        await db.delete(collections).where(and(eq(collections.id, parseInt(collectionId as string)), eq(collections.storeId, storeId)));
        return json({ success: true });
    }
    return json({ error: 'Invalid action' }, { status: 400 });
}

export default function CollectionsIndexPage() {
    const { collections: storeCollections } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="space-y-6">
            <PageHeader title="Collections" description="Group products into collections." primaryAction={{ label: "Create Collection", href: "/app/collections/new", icon: <Plus className="w-4 h-4" /> }} />
            {storeCollections.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200">
                    <EmptyState icon={<Folder className="w-10 h-10" />} title="No collections yet" description="Create your first collection." action={{ label: "Create Collection", href: "/app/collections/new", icon: <Plus className="w-4 h-4" /> }} />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Products</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {storeCollections.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {c.imageUrl ? <img src={c.imageUrl} alt={c.title} className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><ImageOff className="w-5 h-5 text-gray-400" /></div>}
                                            <div><Link to={`/app/collections/${c.id}`} className="font-medium text-gray-900 hover:text-emerald-600">{c.title}</Link><p className="text-xs text-gray-500">/{c.slug}</p></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{c.productCount} products</td>
                                    <td className="px-6 py-4"><span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>{c.isActive ? 'Active' : 'Draft'}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/app/collections/${c.id}`} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Pencil className="w-4 h-4" /></Link>
                                            <Form method="post" onSubmit={(e) => { if (!confirm('Delete this collection?')) e.preventDefault(); }}>
                                                <input type="hidden" name="intent" value="delete" /><input type="hidden" name="id" value={c.id} />
                                                <button type="submit" disabled={isSubmitting} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </Form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
