/**
 * Upsell Offer Page
 * 
 * Displays post-purchase upsell/downsell offers.
 * Route: /upsell/$token
 * 
 * Features:
 * - Countdown timer (15 minutes)
 * - One-click accept button
 * - Decline link
 * - Visual product display
 */

import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigate } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { upsellTokens, upsellOffers, orders, products, stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { useState, useEffect, useCallback } from 'react';
import { Clock, ShoppingBag, CheckCircle, X, ArrowRight, ShieldCheck, Zap, Gift } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.offer?.headline || 'Special Offer' },
    { name: 'robots', content: 'noindex' },
  ];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const token = params.token;
  
  if (!token) {
    throw redirect('/');
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get token record
  const tokenRecord = await db
    .select()
    .from(upsellTokens)
    .where(eq(upsellTokens.token, token))
    .limit(1);

  if (tokenRecord.length === 0) {
    throw redirect('/');
  }

  const upsellToken = tokenRecord[0];

  // Check if expired or used
  if (new Date() > new Date(upsellToken.expiresAt)) {
    throw redirect(`/thank-you/${upsellToken.orderId}`);
  }

  if (upsellToken.usedAt) {
    throw redirect(`/thank-you/${upsellToken.orderId}`);
  }

  // Get offer details
  const offer = await db
    .select()
    .from(upsellOffers)
    .where(eq(upsellOffers.id, upsellToken.offerId!))
    .limit(1);

  if (offer.length === 0) {
    throw redirect(`/thank-you/${upsellToken.orderId}`);
  }

  const upsellOffer = offer[0];

  // Get product details
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, upsellOffer.offerProductId))
    .limit(1);

  if (product.length === 0) {
    throw redirect(`/thank-you/${upsellToken.orderId}`);
  }

  // Get order details
  const order = await db
    .select({ orderNumber: orders.orderNumber, total: orders.total })
    .from(orders)
    .where(eq(orders.id, upsellToken.orderId))
    .limit(1);

  // Get store details
  const store = await db
    .select({ name: stores.name, currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, upsellOffer.storeId))
    .limit(1);

  // Calculate prices
  const originalPrice = product[0].price;
  const discountPercent = upsellOffer.discount || 0;
  const discountedPrice = discountPercent > 0 
    ? Math.round(originalPrice * (1 - discountPercent / 100))
    : originalPrice;
  const savings = originalPrice - discountedPrice;

  return json({
    token,
    offer: {
      headline: upsellOffer.headline,
      subheadline: upsellOffer.subheadline,
      description: upsellOffer.description,
      type: upsellOffer.type,
      discount: discountPercent,
    },
    product: {
      title: product[0].title,
      description: product[0].description,
      imageUrl: product[0].imageUrl,
      originalPrice,
      discountedPrice,
      savings,
    },
    order: order[0],
    store: store[0],
    expiresAt: upsellToken.expiresAt,
    orderId: upsellToken.orderId,
  });
}

export default function UpsellPage() {
  const { token, offer, product, order, store, expiresAt, orderId } = useLoaderData<typeof loader>();
  const acceptFetcher = useFetcher();
  const declineFetcher = useFetcher();
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 15, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(expiresAt).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { minutes: 0, seconds: 0 };
      }

      return {
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  // Handle fetcher responses
  useEffect(() => {
    if (acceptFetcher.data?.success && acceptFetcher.data?.nextUrl) {
      navigate(acceptFetcher.data.nextUrl);
    }
    if (declineFetcher.data?.success && declineFetcher.data?.nextUrl) {
      navigate(declineFetcher.data.nextUrl);
    }
  }, [acceptFetcher.data, declineFetcher.data, navigate]);

  // Handle expired
  useEffect(() => {
    if (isExpired) {
      navigate(`/thank-you/${orderId}`);
    }
  }, [isExpired, orderId, navigate]);

  const handleAccept = useCallback(() => {
    acceptFetcher.submit(
      { token },
      { method: 'POST', action: '/api/accept-upsell', encType: 'application/json' }
    );
  }, [acceptFetcher, token]);

  const handleDecline = useCallback(() => {
    declineFetcher.submit(
      { token },
      { method: 'POST', action: '/api/decline-upsell', encType: 'application/json' }
    );
  }, [declineFetcher, token]);

  const isSubmitting = acceptFetcher.state === 'submitting' || declineFetcher.state === 'submitting';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: store?.currency || 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-900 text-white">
      {/* Countdown Bar */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 py-3 px-4 text-center sticky top-0 z-50">
        <div className="flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 animate-pulse" />
          <span className="font-bold">এই অফার শেষ হবে:</span>
          <div className="flex items-center gap-1">
            <span className="bg-white/20 px-3 py-1 rounded font-mono text-xl">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-xl">:</span>
            <span className="bg-white/20 px-3 py-1 rounded font-mono text-xl">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">অর্ডার #{order?.orderNumber} সফল হয়েছে!</span>
          </div>
        </div>

        {/* Main Offer Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
          {/* Offer Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-center">
            <div className="inline-flex items-center gap-2 bg-black/20 rounded-full px-4 py-1 mb-3">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">
                {offer.type === 'downsell' ? 'Last Chance Offer' : 'Special Offer'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-black">
              {offer.headline}
            </h1>
            {offer.subheadline && (
              <p className="text-black/80 mt-2 text-lg">
                {offer.subheadline}
              </p>
            )}
          </div>

          {/* Product Display */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Product Image */}
              <div className="relative">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="w-full aspect-square bg-white/5 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-24 h-24 text-white/30" />
                  </div>
                )}
                {offer.discount > 0 && (
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg">
                    -{offer.discount}% OFF
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
                  {product.description && (
                    <p className="text-white/70">{product.description}</p>
                  )}
                </div>

                {/* Price Display */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-4 mb-2">
                    {offer.discount > 0 && (
                      <span className="text-xl text-white/50 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    <span className="text-4xl font-black text-yellow-400">
                      {formatPrice(product.discountedPrice)}
                    </span>
                  </div>
                  {product.savings > 0 && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Gift className="w-4 h-4" />
                      <span>আপনি বাঁচাবেন {formatPrice(product.savings)}!</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {offer.description && (
                  <p className="text-white/80">{offer.description}</p>
                )}

                {/* Trust Badges */}
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>নিরাপদ পেমেন্ট</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>একই অর্ডারে যোগ হবে</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleAccept}
                disabled={isSubmitting}
                className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold rounded-2xl shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {acceptFetcher.state === 'submitting' ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <span>হ্যাঁ! আমার অর্ডারে যোগ করুন</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>

              <button
                onClick={handleDecline}
                disabled={isSubmitting}
                className="w-full py-3 text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {declineFetcher.state === 'submitting' ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>না ধন্যবাদ, আমি এই অফার চাই না</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Store Footer */}
        <div className="mt-8 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} {store?.name}</p>
        </div>
      </div>
    </div>
  );
}
