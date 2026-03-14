import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Heart, Tag } from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { buildProxyImageUrl } from '~/utils/imageOptimization';
import { OZZYL_PREMIUM_THEME } from '../theme';
import { OzzylPremiumHeader } from '../sections/Header';
import { OzzylPremiumFooter } from '../sections/Footer';

const THEME = OZZYL_PREMIUM_THEME;

function formatPrice(price: number, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: string;
}

interface CartPageProps extends StoreTemplateProps {
  cartItems?: CartItem[];
}

export function OzzylPremiumCartPage(props: CartPageProps) {
  const { storeName, logo, products = [], storeId, config, socialLinks, businessInfo } = props;
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Demo cart items - in real app, these would come from cart context
  const cartItems: CartItem[] = [
    {
      id: '1',
      productId: 1,
      name: 'Premium Wireless Headphones',
      price: 4599,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      variant: 'Black',
    },
    {
      id: '2',
      productId: 2,
      name: 'Luxury Leather Wallet',
      price: 1899,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
      variant: 'Brown',
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1500 ? 0 : 150;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const updateQuantity = (id: string, delta: number) => {
    console.log('Update quantity:', id, delta);
  };

  const removeItem = (id: string) => {
    console.log('Remove item:', id);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.background, color: THEME.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Manrope', sans-serif; }
        .gold-gradient {
          background: linear-gradient(135deg, #C8A961 0%, #E5D4A1 50%, #C8A961 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass {
          background: rgba(20, 20, 24, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      <OzzylPremiumHeader
        storeName={storeName || 'Store'}
        logo={logo}
        categories={[]}
        isMenuOpen={false}
        setIsMenuOpen={() => {}}
        isScrolled={true}
        setIsScrolled={() => {}}
        config={config}
        socialLinks={socialLinks}
      />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm"
              style={{ color: THEME.textMuted }}
            >
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Your <span className="gold-gradient">Cart</span>
          </h1>

          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-6 p-6 rounded-2xl transition-all duration-300"
                    style={{
                      backgroundColor: THEME.cardBg,
                      border: `1px solid ${THEME.border}`,
                    }}
                  >
                    {/* Product Image */}
                    <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={buildProxyImageUrl(item.imageUrl, { width: 300, quality: 80 })}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: THEME.surface }}
                          >
                            <ShoppingBag size={32} style={{ color: THEME.primary }} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link to={`/product/${item.productId}`}>
                            <h3
                              className="text-lg font-bold hover:text-white transition-colors"
                              style={{ color: THEME.text }}
                            >
                              {item.name}
                            </h3>
                          </Link>
                          {item.variant && (
                            <p className="text-sm mt-1" style={{ color: THEME.textMuted }}>
                              Variant: {item.variant}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                          style={{ color: THEME.textMuted }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        {/* Quantity Controls */}
                        <div
                          className="flex items-center gap-2 rounded-xl"
                          style={{
                            backgroundColor: THEME.surface,
                            border: `1px solid ${THEME.border}`,
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-white/5 rounded-l-xl transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-white/5 rounded-r-xl transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xl font-bold" style={{ color: THEME.primary }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-xs" style={{ color: THEME.textMuted }}>
                              {formatPrice(item.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Continue Shopping */}
                <Link
                  to="/collections/all"
                  className="inline-flex items-center gap-2 text-sm font-medium mt-4 transition-colors"
                  style={{ color: THEME.primary }}
                >
                  <ArrowLeft size={16} />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div
                  className="sticky top-24 rounded-2xl p-6"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  {/* Coupon Code */}
                  <div className="mb-6">
                    <label
                      className="text-sm font-medium mb-2 block"
                      style={{ color: THEME.textMuted }}
                    >
                      Have a coupon?
                    </label>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 flex items-center gap-2 px-4 rounded-xl"
                        style={{
                          backgroundColor: THEME.surface,
                          border: `1px solid ${THEME.border}`,
                        }}
                      >
                        <Tag size={16} style={{ color: THEME.primary }} />
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          className="flex-1 bg-transparent outline-none text-sm"
                          style={{ color: THEME.text }}
                        />
                      </div>
                      <button
                        className="px-4 py-2 rounded-xl font-medium text-sm transition-colors"
                        style={{
                          backgroundColor: `${THEME.primary}20`,
                          color: THEME.primary,
                          border: `1px solid ${THEME.primary}30`,
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Summary Lines */}
                  <div
                    className="space-y-3 py-4"
                    style={{ borderTop: `1px solid ${THEME.border}` }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: THEME.textMuted }}>Subtotal</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: THEME.textMuted }}>Shipping</span>
                      <span className="font-semibold">
                        {shipping === 0 ? (
                          <span style={{ color: THEME.primary }}>FREE</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span style={{ color: THEME.textMuted }}>Discount</span>
                        <span className="font-semibold" style={{ color: THEME.primary }}>
                          -{formatPrice(discount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div
                    className="flex justify-between items-center py-4"
                    style={{ borderTop: `1px solid ${THEME.border}` }}
                  >
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold gold-gradient">{formatPrice(total)}</span>
                  </div>

                  {shipping === 0 && (
                    <p className="text-sm mb-4" style={{ color: THEME.primary }}>
                      🎉 You qualify for free shipping!
                    </p>
                  )}

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="block w-full py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                      color: '#0A0A0C',
                    }}
                  >
                    Proceed to Checkout
                    <ArrowRight className="inline ml-2" size={20} />
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${THEME.border}` }}>
                    <p className="text-xs text-center" style={{ color: THEME.textMuted }}>
                      🔒 Secure checkout • 100% Buyer Protection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Cart */
            <div className="text-center py-20">
              <div
                className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6"
                style={{
                  background: `linear-gradient(135deg, ${THEME.primary}20 0%, ${THEME.primary}10 100%)`,
                  border: `1px solid ${THEME.primary}30`,
                }}
              >
                <ShoppingBag size={48} style={{ color: THEME.primary }} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
              <p className="text-lg mb-8" style={{ color: THEME.textMuted }}>
                Looks like you haven't added anything yet
              </p>
              <Link
                to="/collections/all"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                  color: '#0A0A0C',
                }}
              >
                <span>Start Shopping</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </div>
      </main>

      <OzzylPremiumFooter
        storeName={storeName || 'Store'}
        logo={logo}
        config={config}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      />

      <FloatingContactButtons
        whatsappEnabled={config?.floatingWhatsappEnabled}
        whatsappNumber={
          config?.floatingWhatsappNumber || socialLinks?.whatsapp || businessInfo?.phone
        }
        whatsappMessage={config?.floatingWhatsappMessage}
        callEnabled={config?.floatingCallEnabled}
        callNumber={config?.floatingCallNumber || businessInfo?.phone}
        storeName={storeName || 'Store'}
      />
    </div>
  );
}

export default OzzylPremiumCartPage;
