/**
 * Nova Lux Ultra Cart Page
 *
 * Ultra-premium cart page featuring:
 * - Animated cart items with swipe gestures
 * - Premium empty state with illustration
 * - Order summary with animated totals
 * - Recommended products carousel
 * - Progress bar for free shipping
 * - Sticky checkout button
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Gift,
  Tag,
  ChevronRight,
  Sparkles,
  Package,
  Crown,
  X,
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { NOVALUX_ULTRA_THEME } from '../theme';
import { formatPrice } from '~/lib/formatting';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import type { StoreTemplateTheme } from '~/templates/store-registry';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: string;
}

interface RecommendedProduct {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
}

interface CartPageProps {
  theme: StoreTemplateTheme;
  isPreview?: boolean;
  templateId: string;
  onNavigate?: (path: string) => void;
  recommendedProducts?: RecommendedProduct[];
  currency?: string;
}

// Recommended Product Card
function RecommendedCard({
  product,
  onNavigate,
  index,
  currency = 'BDT',
}: {
  product: RecommendedProduct;
  onNavigate?: (path: string) => void;
  index: number;
  currency?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-48"
    >
      <PreviewSafeLink
        to={`/products/${product.id}`}
        className="block group"
        isPreview={!onNavigate}
        onClick={() => onNavigate?.(`/products/${product.id}`)}
      >
        <div
          className="aspect-square rounded-2xl overflow-hidden mb-3"
          style={{ boxShadow: NOVALUX_ULTRA_THEME.cardShadow }}
        >
          <motion.img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <h4
          className="text-sm font-medium line-clamp-1 mb-1 group-hover:opacity-70 transition-opacity"
          style={{ color: NOVALUX_ULTRA_THEME.text }}
        >
          {product.title}
        </h4>
        <p className="text-sm font-semibold" style={{ color: NOVALUX_ULTRA_THEME.primary }}>
          {formatPrice(product.price, currency)}
        </p>
      </PreviewSafeLink>
    </motion.div>
  );
}

export function CartPage({
  theme,
  isPreview,
  onNavigate,
  recommendedProducts = [],
  currency = 'BDT',
}: CartPageProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 1,
      title: 'Premium Leather Handbag',
      price: 12500,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
      variant: 'Brown / Medium',
    },
    {
      id: 2,
      title: 'Luxury Silk Scarf',
      price: 3500,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa33?w=400',
      variant: 'Gold / One Size',
    },
  ]);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const pageRef = useRef(null);
  const isInView = useInView(pageRef, { once: true });

  // Cart calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 150;
  const discount = 0;
  const total = subtotal + shipping - discount;

  // Free shipping progress
  const freeShippingThreshold = 5000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <div
        ref={pageRef}
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: NOVALUX_ULTRA_THEME.background }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div
            className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${NOVALUX_ULTRA_THEME.accent}15` }}
          >
            <ShoppingBag className="w-16 h-16" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
          </div>
          <h1
            className="text-3xl font-semibold mb-4"
            style={{
              fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
              color: NOVALUX_ULTRA_THEME.text,
            }}
          >
            Your Cart is Empty
          </h1>
          <p className="text-lg mb-8 max-w-md" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
            Discover our premium collection and add some luxury items to your cart
          </p>
          <motion.button
            onClick={() => onNavigate?.('/')}
            className="px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 mx-auto"
            style={{
              background: NOVALUX_ULTRA_THEME.accentGradient,
              color: NOVALUX_ULTRA_THEME.primary,
              boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={pageRef} style={{ backgroundColor: NOVALUX_ULTRA_THEME.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <h1
            className="text-4xl font-semibold"
            style={{
              fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
              color: NOVALUX_ULTRA_THEME.text,
            }}
          >
            Shopping Cart
          </h1>
          <span
            className="px-4 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${NOVALUX_ULTRA_THEME.accent}20`,
              color: NOVALUX_ULTRA_THEME.accent,
            }}
          >
            {items.length} items
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress */}
            {remaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl mb-6"
                style={{ backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
                  <span style={{ color: NOVALUX_ULTRA_THEME.text }}>
                    Add {formatPrice(remaining, currency)} more for{' '}
                    <span style={{ color: NOVALUX_ULTRA_THEME.accent, fontWeight: 600 }}>
                      FREE shipping
                    </span>
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: `${NOVALUX_ULTRA_THEME.accent}20` }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Cart Items List */}
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl flex gap-6"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: NOVALUX_ULTRA_THEME.cardShadow,
                  }}
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: NOVALUX_ULTRA_THEME.text }}
                      >
                        {item.title}
                      </h3>
                      {item.variant && (
                        <p
                          className="text-sm mb-2"
                          style={{ color: NOVALUX_ULTRA_THEME.textMuted }}
                        >
                          {item.variant}
                        </p>
                      )}
                      <p
                        className="font-bold text-lg"
                        style={{ color: NOVALUX_ULTRA_THEME.primary }}
                      >
                        {formatPrice(item.price, currency)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt }}
                      >
                        <motion.button
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'white' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span
                          className="w-8 text-center font-semibold"
                          style={{ color: NOVALUX_ULTRA_THEME.text }}
                        >
                          {item.quantity}
                        </span>
                        <motion.button
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'white' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${NOVALUX_ULTRA_THEME.textMuted}15`,
                        }}
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: '#fee2e2',
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <PreviewSafeLink
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: NOVALUX_ULTRA_THEME.accent }}
                isPreview={isPreview}
                onClick={() => onNavigate?.('/')}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Continue Shopping
              </PreviewSafeLink>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div
              className="p-6 rounded-2xl"
              style={{
                backgroundColor: 'white',
                boxShadow: NOVALUX_ULTRA_THEME.cardShadow,
              }}
            >
              <h2
                className="text-xl font-semibold mb-6"
                style={{
                  fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                  color: NOVALUX_ULTRA_THEME.text,
                }}
              >
                Order Summary
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <AnimatePresence>
                  {showPromoInput ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl text-sm border-2 focus:outline-none"
                        style={{
                          borderColor: NOVALUX_ULTRA_THEME.border,
                          color: NOVALUX_ULTRA_THEME.text,
                        }}
                      />
                      <motion.button
                        className="px-4 py-2 rounded-xl text-sm font-medium"
                        style={{
                          backgroundColor: NOVALUX_ULTRA_THEME.accent,
                          color: NOVALUX_ULTRA_THEME.primary,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Apply
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: NOVALUX_ULTRA_THEME.accent }}
                      onClick={() => setShowPromoInput(true)}
                      whileHover={{ x: 5 }}
                    >
                      <Tag className="w-4 h-4" />
                      Have a promo code?
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Totals */}
              <div
                className="space-y-3 mb-6 pb-6 border-b"
                style={{ borderColor: NOVALUX_ULTRA_THEME.border }}
              >
                <div className="flex justify-between">
                  <span style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>Subtotal</span>
                  <span style={{ color: NOVALUX_ULTRA_THEME.text }}>
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>Shipping</span>
                  <span style={{ color: NOVALUX_ULTRA_THEME.text }}>
                    {shipping === 0 ? (
                      <span style={{ color: NOVALUX_ULTRA_THEME.accent }}>Free</span>
                    ) : (
                      formatPrice(shipping, currency)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>Discount</span>
                    <span style={{ color: '#10b981' }}>-{formatPrice(discount, currency)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold" style={{ color: NOVALUX_ULTRA_THEME.text }}>
                  Total
                </span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.2, color: NOVALUX_ULTRA_THEME.accent }}
                  animate={{ scale: 1, color: NOVALUX_ULTRA_THEME.primary }}
                  className="text-2xl font-bold"
                >
                  {formatPrice(total, currency)}
                </motion.span>
              </div>

              {/* Checkout Button */}
              <motion.button
                className="w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 mb-4"
                style={{
                  background: NOVALUX_ULTRA_THEME.accentGradient,
                  color: NOVALUX_ULTRA_THEME.primary,
                  boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate?.('/checkout')}
              >
                <Sparkles className="w-5 h-5" />
                Proceed to Checkout
              </motion.button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Shield, text: 'Secure' },
                  { icon: Truck, text: 'Fast Delivery' },
                  { icon: RotateCcw, text: 'Easy Returns' },
                ].map((badge) => (
                  <div key={badge.text} className="flex flex-col items-center gap-1">
                    <badge.icon className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
                    <span className="text-xs" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <Crown className="w-6 h-6" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
              <h2
                className="text-2xl font-semibold"
                style={{
                  fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                  color: NOVALUX_ULTRA_THEME.text,
                }}
              >
                Complete Your Look
              </h2>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {recommendedProducts.map((product, index) => (
                <RecommendedCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
