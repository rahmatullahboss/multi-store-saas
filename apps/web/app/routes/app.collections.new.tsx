/**
 * New Collection Page
 * Route: /app/collections/new
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigation, useFetcher, useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, like, and } from 'drizzle-orm';
import { collections, productCollections, products } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, Upload, X, Search, Check } from 'lucide-react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { LazyRichTextEditor } from '~/components/RichTextEditor.lazy';

export async function loader({ request, context }: LoaderFunctionArgs) {
    const storeId = await getStoreId(request, context.cloudflare.env);
    if (!storeId) throw new Response('Unauthorized', { status: 401 });
    const db = drizzle(context.cloudflare.env.DB);
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const searchResults = await db.select({ id: products.id, title: products.title, imageUrl: products.imageUrl, price: products.price })
        .from(products).where(and(eq(products.storeId, storeId), q ? like(products.title, `%${q}%`) : undefined)).limit(20).orderBy(desc(products.createdAt));
    return json({ searchResults });
}

export async function action({ request, context }: ActionFunctionArgs) {
    const storeId = await getStoreId(request, context.cloudflare.env);
    if (!storeId) return json({ errors: { form: 'Unauthorized' } }, { status: 401 });
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const slug = formData.get('slug') as string;
    const isActive = formData.get('isActive') === 'true';
    const productIdsJson = formData.get('productIds') as string;

    const errors: Record<string, string> = {};
    if (!title || title.length < 2) errors.title = 'Title is required';
    if (!slug) errors.slug = 'Slug is required';
    if (Object.keys(errors).length > 0) return json({ errors }, { status: 400 });

    const db = drizzle(context.cloudflare.env.DB);
    const existing = await db.select().from(collections).where(and(eq(collections.storeId, storeId), eq(collections.slug, slug))).limit(1);
    if (existing.length > 0) return json({ errors: { slug: 'Handle must be unique' } }, { status: 400 });

    const [newCollection] = await db.insert(collections).values({ storeId, title, slug, description, imageUrl, isActive }).returning();
    if (productIdsJson) {
        const productIds = JSON.parse(productIdsJson) as number[];
        if (productIds.length > 0) await db.insert(productCollections).values(productIds.map(pid => ({ productId: pid, collectionId: newCollection.id })));
    }
    return redirect('/app/collections');
}

export default function NewCollectionPage() {
    const { searchResults } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as any;
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [manualSlug, setManualSlug] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState<typeof searchResults>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const productFetcher = useFetcher<typeof loader>();
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageFetcher = useFetcher<{ success?: boolean; url?: string }>();
    const isUploading = imageFetcher.state !== 'idle';

    useEffect(() => { if (!manualSlug) setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }, [title, manualSlug]);
    useEffect(() => { const t = setTimeout(() => { if (searchQuery) productFetcher.load(`/app/collections/new?q=${searchQuery}`); }, 300); return () => clearTimeout(t); }, [searchQuery]);
    useEffect(() => { if (imageFetcher.data?.success && imageFetcher.data?.url) { setImageUrl(imageFetcher.data.url); setImagePreview(imageFetcher.data.url); } }, [imageFetcher.data]);

    const pickerProducts = searchQuery ? (productFetcher.data?.searchResults || []) : searchResults;
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file);
        try {
            const format = getOptimalFormat();
            const compressedBlob = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8, format });
            const formData = new FormData(); formData.append('file', new File([compressedBlob], `image.${format}`, { type: `image/${format}` })); formData.append('folder', 'collections');
            imageFetcher.submit(formData, { method: 'post', action: '/api/upload-image', encType: 'multipart/form-data' });
        } catch (e) { console.error(e); }
    };
    const addProduct = (p: typeof searchResults[0]) => { if (!selectedProducts.find(x => x.id === p.id)) setSelectedProducts([...selectedProducts, p]); };
    const removeProduct = (id: number) => setSelectedProducts(selectedProducts.filter(p => p.id !== id));

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-6 flex items-center gap-4"><Link to="/app/collections" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link><h1 className="text-2xl font-bold">Create Collection</h1></div>
            <Form method="post" className="space-y-6">
                <input type="hidden" name="imageUrl" value={imageUrl} /><input type="hidden" name="productIds" value={JSON.stringify(selectedProducts.map(p => p.id))} /><input type="hidden" name="isActive" value={String(isActive)} /><input type="hidden" name="slug" value={slug} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Sale" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />{actionData?.errors?.title && <p className="text-red-500 text-sm mt-1">{actionData.errors.title}</p>}</div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="hidden" name="description" value={description} /><LazyRichTextEditor content={description} onChange={setDescription} /></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900">Products</h3>
                            <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                            {searchQuery && <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y">{pickerProducts.map(p => { const isSelected = selectedProducts.some(x => x.id === p.id); return <button key={p.id} type="button" onClick={() => addProduct(p)} disabled={isSelected} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left disabled:opacity-50">{p.imageUrl ? <img src={p.imageUrl} className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-gray-100" />}<span className="flex-1 text-sm font-medium truncate">{p.title}</span>{isSelected && <Check className="w-4 h-4 text-emerald-600" />}</button>; })}</div>}
                            <div className="space-y-2"><p className="text-xs font-semibold text-gray-500 uppercase">Selected ({selectedProducts.length})</p><div className="divide-y border-t border-gray-100">{selectedProducts.map(p => <div key={p.id} className="flex items-center gap-3 py-2 group">{p.imageUrl ? <img src={p.imageUrl} className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-gray-100" />}<span className="flex-1 text-sm text-gray-700">{p.title}</span><button type="button" onClick={() => removeProduct(p.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button></div>)}{selectedProducts.length === 0 && <p className="text-sm text-gray-400 italic py-2">No products selected</p>}</div></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900">SEO</h3><button type="button" onClick={() => setManualSlug(true)} className="text-xs text-blue-600 hover:underline">Edit handle</button></div>
                            <p className="text-green-700 text-sm truncate">https://yourstore.com/collections/<span className="font-semibold">{slug}</span></p>
                            {manualSlug && <div><label className="block text-sm font-medium text-gray-700 mb-1">URL Handle</label><input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />{actionData?.errors?.slug && <p className="text-red-500 text-sm mt-1">{actionData.errors.slug}</p>}</div>}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="font-semibold text-gray-900 mb-4">Status</h3><label className="flex items-center gap-3 cursor-pointer"><div className={`w-10 h-6 rounded-full p-1 transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setIsActive(!isActive)}><div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} /></div><span className="text-sm font-medium text-gray-700">{isActive ? 'Active' : 'Draft'}</span></label></div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="font-semibold text-gray-900 mb-4">Image</h3>{imagePreview ? <div className="relative group"><img src={imagePreview} alt="Collection" className="w-full aspect-square object-cover rounded-lg" />{isUploading && <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}<button type="button" onClick={() => { setImageUrl(''); setImagePreview(''); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button></div> : <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400">{isUploading ? <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" /> : <Upload className="w-8 h-8 text-gray-400 mb-2" />}<span className="text-sm font-medium text-gray-600">Add Image</span></div>}<input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" /></div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200"><Link to="/app/collections" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</Link><button type="submit" disabled={isSubmitting || isUploading} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}Save Collection</button></div>
            </Form>
        </div>
    );
}
