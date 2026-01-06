/**
 * Cart Page
 * 
 * Shopping cart with local state and checkout flow.
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { eq, and, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '@db/schema';
import { useTranslation } from '~/contexts/LanguageContext';

export async function loader({ context }: LoaderFunctionArgs) {
  const { store } = context;
  
  return json({
    storeName: store?.name || 'Store',
    currency: store?.currency || 'USD',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, cloudflare } = context;
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'get-products') {
    // Get product details for cart items
    const productIds = formData.get('productIds')?.toString().split(',').map(Number) || [];
    
    if (productIds.length === 0) {
      return json({ products: [] });
    }
    
    const db = drizzle(cloudflare.env.DB);
    const cartProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          inArray(products.id, productIds)
        )
      );
    
    return json({ products: cartProducts });
  }
  
  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function Cart() {
  const { storeName, currency } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { t } = useTranslation();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="store-header">
        <div className="container-store py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              {storeName}
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <main className="container-store py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('yourCart')}</h1>
        
        {/* Cart items will be managed client-side and rendered here */}
        <div id="cart-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" id="cart-items">
            {/* Placeholder - items loaded client-side from localStorage */}
            <div className="card p-6 text-center text-gray-500">
              <p>{t('cartEmpty')}</p>
              <Link to="/" className="btn btn-primary mt-4">
                {t('continueShopping')}
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="font-medium" id="cart-subtotal">{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="font-bold text-lg" id="cart-total">{formatPrice(0)}</span>
                </div>
              </div>
              
              <Link 
                to="/checkout"
                className="btn btn-primary w-full mt-6"
              >
                {t('proceedToCheckout')}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Client-side cart logic */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const cartCount = document.getElementById('cart-count');
          
          if (cartCount) {
            const total = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = total.toString();
          }
          
          // More cart rendering logic would go here
        })();
      `}} />
    </div>
  );
}
