import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link, useFetcher, useNavigate } from '@remix-run/react';
import { resolveStore } from '~/lib/store.server';
import { getCustomerId } from '~/services/customer-auth.server';
import { getCustomerWishlist, removeFromWishlist } from '~/services/customer-account.server';
import {
  Heart,
  ShoppingBag,
  Trash2
} from 'lucide-react';
import { Button } from '~/components/ui/button';
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
  const navigate = useNavigate();

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
          {wishlistItems.map((item) => {
            const isAvailable = (item.inventory || 0) > 0;
            return (
              <div 
                  key={item.id} 
                  className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Image Area */}
                <div 
                  className="aspect-[4/3] bg-slate-100 relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/products/${item.productId}`)}
                >
                   {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                         <ShoppingBag className="w-12 h-12 opacity-30" />
                      </div>
                   )}
                   
                   {/* Remove Button (Hover visible) */}
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <fetcher.Form method="post">
                         <input type="hidden" name="itemId" value={item.id} />
                         <button 
                           type="submit" 
                           name="intent" 
                           value="delete"
                           className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                           title={t('removeFromWishlist') || "Remove"}
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </fetcher.Form>
                   </div>

                   {/* Stock Status Badge */}
                   {!isAvailable && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                         <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                           {t('outOfStock') || 'Out of Stock'}
                         </span>
                      </div>
                   )}
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1">
                   <div className="mb-auto">
                      <h3 
                        className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-xs mb-3">
                         Added on {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'N/A'}
                      </p>
                   </div>

                   <div className="flex items-end justify-between gap-4 pt-4 border-t border-slate-50 mt-4">
                      <div className="flex flex-col">
                          <span className="text-lg font-bold text-slate-900">
                            {storeCurrency === 'BDT' ? '৳' : '$'}{item.price}
                          </span>
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                              <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                                  {storeCurrency === 'BDT' ? '৳' : '$'}{item.compareAtPrice}
                              </span>
                          )}
                      </div>
                      
                      <Button asChild className="rounded-full gap-2" size="sm">
                          <Link to={`/products/${item.productId}`}>
                              <ShoppingBag className="h-3.5 w-3.5" />
                              {t('viewProduct')}
                          </Link>
                      </Button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
