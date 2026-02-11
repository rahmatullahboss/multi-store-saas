import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link, useFetcher } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerWishlist, removeFromWishlist } from '~/services/customer-account.server';
import {
  Heart,
  ShoppingBag,
  X
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/Badge';
import { useTranslation } from '~/contexts/LanguageContext';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';


export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { storeId, store } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(env.DB, { schema });
  const wishlistItems = await getCustomerWishlist(customerId, storeId, db);

  return json({ 
    wishlistItems, 
    storeCurrency: store.currency 
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { storeId } = storeContext;
  const env = context.cloudflare.env;
  const customerId = await getCustomerId(request, env);

  if (!customerId) throw new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const intent = formData.get('intent');
  const itemId = Number(formData.get('itemId'));

  const db = drizzle(env.DB, { schema });

  if (intent === 'delete' && !isNaN(itemId)) {
    await removeFromWishlist(customerId, storeId, itemId, db);
    return json({ success: true, message: 'Item removed from wishlist' });
  }

  return json({ success: false, message: 'Invalid action' });
}

export default function AccountWishlist() {
  const { wishlistItems, storeCurrency } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const fetcher = useFetcher();

  // Optimistic UI could be added here, but for now relying on revalidation

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('myWishlist')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? t('item') : t('items')} {t('saved')}
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('continueShopping')}
          </Link>
        </Button>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-dashed flex flex-col items-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <Heart className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('wishlistEmpty')}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">{t('wishlistEmptyDesc')}</p>
            <Button asChild className="rounded-full shadow-lg shadow-pink-500/20">
                <Link to="/products">{t('startShoppingBtn')}</Link>
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div 
                key={item.id} 
                className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
                {/* Remove Button */}
                <fetcher.Form method="post" className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="itemId" value={item.id} />
                    <button 
                        type="submit"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shadow-sm"
                        title={t('removeFromWishlist')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </fetcher.Form>

                {/* Image */}
                <div className="aspect-square bg-muted/30 relative overflow-hidden">
                    {item.imageUrl ? (
                        <img 
                            src={item.imageUrl} 
                            alt={item.title || 'Product'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-10 w-10 opacity-20" />
                        </div>
                    )}
                    
                    {/* Stock Badge */}
                    <div className="absolute bottom-3 left-3">
                        {item.inventory && item.inventory > 0 ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                {t('inStock')}
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                                {t('outOfStock')}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <div>
                        <Link to={`/products/${item.productId}`} className="font-semibold hover:text-primary transition-colors line-clamp-1 block">
                            {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-lg">{storeCurrency} {item.price}</span>
                            {item.compareAtPrice && item.compareAtPrice > item.price && (
                                <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                                    {storeCurrency} {item.compareAtPrice}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button asChild className="w-full rounded-full gap-2" size="sm">
                        <Link to={`/products/${item.productId}`}>
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {t('viewProduct')}
                        </Link>
                    </Button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
