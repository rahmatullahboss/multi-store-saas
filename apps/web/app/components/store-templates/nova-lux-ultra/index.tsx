/**
 * Nova Lux Ultra Premium Store Template
 *
 * Ultra-premium 10,000,000৳ worth theme featuring:
 * - Cinematic hero section with parallax
 * - Advanced Framer Motion animations
 * - Premium product cards with 3D hover effects
 * - Scroll-triggered reveal animations
 * - Glassmorphism effects
 * - Micro-interactions throughout
 * - Luxury typography hierarchy
 *
 * Worth 10 Million - World-class design
 */

import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useRef,
} from 'react';

import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Star,
  Check,
  Heart,
  ArrowRight,
  Sparkles,
  Crown,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import type { StoreTemplateProps, SerializedProduct } from '~/templates/store-registry';
import type { ThemeConfig } from '@db/types';
import { formatPrice } from '~/lib/formatting';
import {
  buildProxyImageUrl,
  generateProxySrcset,
  generateSrcset,
  optimizeUnsplashUrl,
} from '~/utils/imageOptimization';
import { getHeroBehavior } from '~/lib/hero-slides';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';

import { NOVALUX_ULTRA_THEME } from './theme';
import { NovaLuxUltraHeader } from './sections/Header';
import { NovaLuxUltraFooter } from './sections/Footer';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  getDemoProductById,
  getRelatedProducts,
  type DemoProduct,
} from '~/utils/store-preview-data';

import { ProductPage } from './pages/ProductPage';
import SharedCartPage from '../shared/CartPage';
import SharedCheckoutPage from '../shared/CheckoutPage';
import type { StoreTemplateTheme } from '~/templates/store-registry';

// Theme adapter for shared components
const NOVALUX_ULTRA_THEME_FOR_SHARED: StoreTemplateTheme = {
  primary: NOVALUX_ULTRA_THEME.primary,
  accent: NOVALUX_ULTRA_THEME.accent,
  background: NOVALUX_ULTRA_THEME.background,
  text: NOVALUX_ULTRA_THEME.text,
  muted: NOVALUX_ULTRA_THEME.textMuted,
  cardBg: NOVALUX_ULTRA_THEME.cardBg,
  headerBg: NOVALUX_ULTRA_THEME.headerBgSolid,
  footerBg: NOVALUX_ULTRA_THEME.footerBg,
  footerText: NOVALUX_ULTRA_THEME.footerText,
};

// ============================================================================
// TYPES
// ============================================================================
type PageType =
  | { type: 'home' }
  | { type: 'product'; productId: number }
  | { type: 'category'; category: string }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'order-success' }
  | { type: 'search'; query: string };

// ============================================================================
// CART CONTEXT FOR PREVIEW MODE
// ============================================================================
interface CartItem {
  id: number;
  title: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: DemoProduct | SerializedProduct, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

function usePreviewCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('usePreviewCart must be used within CartProvider');
  return context;
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: DemoProduct | SerializedProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title ?? '',
          price: product.price ?? 0,
          compareAtPrice: product.compareAtPrice ?? null,
          imageUrl: product.imageUrl ?? null,
          category: product.category ?? null,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// PREMIUM COMPONENTS
// ============================================================================

// Client-side only particles to prevent hydration mismatch
function ClientParticles() {
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    duration: number;
    delay: number;
  }> | null>(null);

  useEffect(() => {
    // Generate particles only on client side
    const newParticles = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  if (!particles) {
    // Return empty placeholder during SSR to ensure consistent HTML
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: NOVALUX_ULTRA_THEME.accent,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

// Cinematic Hero Section with Parallax
function CinematicHero({
  config,
  onNavigate,
}: {
  config: ThemeConfig | null;
  onNavigate: (page: PageType) => void;
}) {
  const heroBehavior = getHeroBehavior(config);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlide = heroBehavior.slides[heroIndex];
  const heroImage = heroSlide?.imageUrl || config?.bannerUrl || null;
  const isUnsplashHero = heroImage?.includes('unsplash.com') ?? false;
  const heroSrc = heroImage
    ? isUnsplashHero
      ? optimizeUnsplashUrl(heroImage, { width: 1800, height: 1000, quality: 80, format: 'webp' })
      : buildProxyImageUrl(heroImage, { width: 1800, height: 1000, quality: 78 })
    : null;
  const heroSrcSet =
    heroImage && isUnsplashHero
      ? generateSrcset(heroImage, [640, 960, 1280, 1600, 1800])
      : heroImage
        ? generateProxySrcset(heroImage, [640, 960, 1280, 1600, 1800], 78)
        : undefined;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroHeading = heroSlide?.heading || config?.bannerText || 'Redefining\nLuxury';
  const heroSubheading =
    heroSlide?.subheading || 'Discover our exclusive collection crafted for the discerning few';
  const heroCta = heroSlide?.ctaText || 'Explore Collection';

  useEffect(() => {
    if (!heroBehavior.isCarousel || !heroBehavior.autoplay) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBehavior.slides.length);
    }, heroBehavior.delayMs);
    return () => clearInterval(timer);
  }, [
    heroBehavior.autoplay,
    heroBehavior.delayMs,
    heroBehavior.isCarousel,
    heroBehavior.slides.length,
  ]);

  useEffect(() => {
    if (heroIndex >= heroBehavior.slides.length) {
      setHeroIndex(0);
    }
  }, [heroBehavior.slides.length, heroIndex]);

  return (
    <div ref={ref} className="relative h-[90vh] overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        {heroSrc ? (
          <img
            src={heroSrc}
            alt="Hero"
            className="w-full h-full object-cover"
            srcSet={heroSrcSet}
            sizes="100vw"
            loading="eager"
            {...({ fetchpriority: 'high' } as Record<string, unknown>)}
            decoding="async"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${NOVALUX_ULTRA_THEME.primary} 0%, ${NOVALUX_ULTRA_THEME.accent}30 50%, ${NOVALUX_ULTRA_THEME.primary} 100%)`,
            }}
          />
        )}
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: NOVALUX_ULTRA_THEME.heroGradient }}
        />
      </motion.div>

      {/* Animated Particles - Client-side only to prevent hydration mismatch */}
      <ClientParticles />

      {/* Content */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{ opacity }}
      >
        <div className="text-center max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Crown className="w-8 h-8" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
            </motion.div>
            <span
              className="text-sm tracking-[0.3em] uppercase"
              style={{ color: NOVALUX_ULTRA_THEME.accent }}
            >
              Premium Collection 2025
            </span>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Crown className="w-8 h-8" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-6xl md:text-8xl lg:text-9xl font-semibold mb-6 leading-tight"
            style={{
              fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
              color: '#fff',
              textShadow: '0 4px 30px rgba(0,0,0,0.3)',
            }}
          >
            {heroHeading}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-xl md:text-2xl mb-12"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            {heroSubheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => onNavigate({ type: 'home' })}
              className="px-10 py-5 rounded-full font-semibold text-lg flex items-center gap-3"
              style={{
                background: NOVALUX_ULTRA_THEME.accentGradient,
                color: NOVALUX_ULTRA_THEME.primary,
                boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: NOVALUX_ULTRA_THEME.buttonShadowHover,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {heroCta}
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={() => onNavigate({ type: 'home' })}
              className="px-10 py-5 rounded-full font-semibold text-lg border-2 border-white/30 text-white backdrop-blur-sm"
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              View Lookbook
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase text-white/60">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Premium Product Card with 3D Hover Effect
function PremiumProductCard({
  product,
  currency,
  onNavigate,
  index,
}: {
  product: DemoProduct | SerializedProduct;
  currency: string;
  onNavigate: (page: PageType) => void;
  index: number;
}) {
  const cart = usePreviewCart();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  // Calculate 3D transform based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current as HTMLElement;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        boxShadow: isHovered ? NOVALUX_ULTRA_THEME.cardShadowHover : NOVALUX_ULTRA_THEME.cardShadow,
        transformStyle: 'preserve-3d',
        border: `1px solid ${isHovered ? NOVALUX_ULTRA_THEME.borderGold : NOVALUX_ULTRA_THEME.cardBorder}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onNavigate({ type: 'product', productId: product.id })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onNavigate({ type: 'product', productId: product.id });
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {product.imageUrl ? (
          <motion.img
            src={buildProxyImageUrl(product.imageUrl, { width: 640, quality: 75 })}
            alt={product.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.7 }}
            srcSet={generateProxySrcset(product.imageUrl, [320, 480, 640], 75)}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: NOVALUX_ULTRA_THEME.backgroundAlt }}
          >
            <Crown className="w-20 h-20" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
          </div>
        )}

        {/* Sale Badge */}
        <AnimatePresence>
          {isSale && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-5 left-5 px-4 py-2 rounded-full text-xs font-bold tracking-wider"
              style={{
                background: NOVALUX_ULTRA_THEME.accentGradient,
                color: NOVALUX_ULTRA_THEME.primary,
                boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
              }}
            >
              -{discount}% OFF
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          className="absolute top-5 right-5 flex flex-col gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
            style={{ boxShadow: NOVALUX_ULTRA_THEME.cardShadow }}
            whileHover={{ scale: 1.1, backgroundColor: '#fff' }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.textMuted }} />
          </motion.button>
        </motion.div>

        {/* Quick Add Button */}
        <motion.div
          className="absolute bottom-6 left-6 right-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              cart.addItem(product);
            }}
            className="w-full py-4 rounded-2xl text-sm font-semibold backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,0.95)',
              color: NOVALUX_ULTRA_THEME.primary,
              boxShadow: NOVALUX_ULTRA_THEME.cardShadow,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Quick Add
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        {product.category && (
          <motion.span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: NOVALUX_ULTRA_THEME.accent }}
          >
            {product.category}
          </motion.span>
        )}

        {/* Title */}
        <h3
          className="font-semibold mt-3 mb-4 line-clamp-2 transition-colors duration-300 group-hover:text-opacity-70"
          style={{
            fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
            fontSize: '1.25rem',
            lineHeight: '1.4',
            color: NOVALUX_ULTRA_THEME.text,
          }}
        >
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4"
              style={{
                color: NOVALUX_ULTRA_THEME.accent,
                fill: i < 4 ? NOVALUX_ULTRA_THEME.accent : 'none',
              }}
            />
          ))}
          <span className="text-xs ml-2" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
            (24 reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold" style={{ color: NOVALUX_ULTRA_THEME.primary }}>
            {formatPrice(product.price, currency)}
          </span>
          {isSale && (
            <span className="text-sm line-through" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Premium Section Title with Animation
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className="text-center mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center gap-3 mb-4"
      >
        <motion.div
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
        </motion.div>
        <div
          className="w-12 h-px rounded-full"
          style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
        />
        <span
          className="text-xs tracking-[0.3em] uppercase font-semibold"
          style={{ color: NOVALUX_ULTRA_THEME.accent }}
        >
          Premium Selection
        </span>
        <div
          className="w-12 h-px rounded-full"
          style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
        />
        <motion.div
          animate={{ rotate: [0, -180, -360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-semibold"
        style={{
          fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
          color: NOVALUX_ULTRA_THEME.text,
        }}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-lg"
          style={{ color: NOVALUX_ULTRA_THEME.textMuted }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

// Premium Features Section
function PremiumFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    { icon: Truck, title: 'ফ্রি শিপিং', desc: '৳1,000 এর বেশি অর্ডারে' },
    { icon: RotateCcw, title: 'সহজ ফেরত', desc: '৭ দিনের রিটার্ন পলিসি' },
    { icon: Shield, title: 'নিরাপদ পেমেন্ট', desc: '১০০% সুরক্ষিত' },
    { icon: Star, title: 'ক্যাশ অন ডেলিভারি', desc: 'সারাদেশে লভ্য' },
  ];

  return (
    <section
      ref={ref}
      className="py-20"
      style={{ backgroundColor: NOVALUX_ULTRA_THEME.primary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${NOVALUX_ULTRA_THEME.accent}15` }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon className="w-8 h-8" style={{ color: NOVALUX_ULTRA_THEME.accent }} />
              </motion.div>
              <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PREVIEW MODE COMPONENTS
// ============================================================================

// Preview Home Page
function PreviewHomePage({
  storeName: _storeName,
  products,
  categories: _categories,
  currency,
  config,
  onNavigate,
}: {
  storeName: string;
  products: DemoProduct[] | SerializedProduct[];
  categories: (string | null)[];
  currency: string;
  config: ThemeConfig | null;
  onNavigate: (page: PageType) => void;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: NOVALUX_ULTRA_THEME.background }}>
      {/* Cinematic Hero */}
      <CinematicHero config={config} onNavigate={onNavigate} />

      {/* Premium Features */}
      <PremiumFeatures />

      {/* Featured Products Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Curated Collection"
            subtitle="Handpicked premium items for the discerning collector"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product, index) => (
              <PremiumProductCard
                key={product.id}
                product={product}
                currency={currency}
                onNavigate={onNavigate}
                index={index}
              />
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => onNavigate({ type: 'home' })}
              className="px-10 py-5 rounded-full font-semibold inline-flex items-center gap-3"
              style={{
                border: `2px solid ${NOVALUX_ULTRA_THEME.accent}`,
                color: NOVALUX_ULTRA_THEME.accent,
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: NOVALUX_ULTRA_THEME.accent,
                color: '#fff',
              }}
              whileTap={{ scale: 0.95 }}
            >
              View All Products
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${NOVALUX_ULTRA_THEME.accent} 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div
                className="w-24 h-1 mb-8 rounded-full"
                style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
              />
              <h2
                className="text-4xl md:text-5xl font-semibold mb-6"
                style={{
                  fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                  color: NOVALUX_ULTRA_THEME.text,
                }}
              >
                Crafted with Passion, Delivered with Pride
              </h2>
              <p
                className="text-lg mb-8 leading-relaxed"
                style={{ color: NOVALUX_ULTRA_THEME.textMuted }}
              >
                Every piece in our collection tells a story of exceptional craftsmanship and
                timeless design. We partner with world-renowned artisans to bring you products that
                define luxury living.
              </p>
              <div className="flex gap-8">
                <div>
                  <div
                    className="text-4xl font-bold mb-1"
                    style={{
                      fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                      background: NOVALUX_ULTRA_THEME.accentGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    10K+
                  </div>
                  <div className="text-sm" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
                    Happy Customers
                  </div>
                </div>
                <div>
                  <div
                    className="text-4xl font-bold mb-1"
                    style={{
                      fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                      background: NOVALUX_ULTRA_THEME.accentGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    500+
                  </div>
                  <div className="text-sm" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
                    Premium Products
                  </div>
                </div>
                <div>
                  <div
                    className="text-4xl font-bold mb-1"
                    style={{
                      fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                      background: NOVALUX_ULTRA_THEME.accentGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    50+
                  </div>
                  <div className="text-sm" style={{ color: NOVALUX_ULTRA_THEME.textMuted }}>
                    Brand Partners
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div
                className="aspect-square rounded-3xl overflow-hidden"
                style={{ boxShadow: NOVALUX_ULTRA_THEME.cardShadowHover }}
              >
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                  alt="Luxury Store Interior"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Badge */}
              <motion.div
                className="absolute -bottom-6 -left-6 px-6 py-4 rounded-2xl"
                style={{
                  background: NOVALUX_ULTRA_THEME.accentGradient,
                  boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6" style={{ color: NOVALUX_ULTRA_THEME.primary }} />
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: NOVALUX_ULTRA_THEME.primary }}
                    >
                      Premium Quality
                    </div>
                    <div className="text-xs" style={{ color: `${NOVALUX_ULTRA_THEME.primary}99` }}>
                      Guaranteed Authentic
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// MAIN PREVIEW STORE CONTAINER
// ============================================================================
function PreviewNovaLuxUltraStore(props: StoreTemplateProps) {
  const { storeName, storeId, logo, config, currency, isPreview } = props;
  const [currentPage, setCurrentPage] = useState<PageType>({ type: 'home' });

  const navigate = useCallback((page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateByPath = useCallback(
    (path: string) => {
      if (path === '/' || path === '') {
        navigate({ type: 'home' });
      } else if (path.startsWith('/products/')) {
        const productId = parseInt(path.replace('/products/', ''), 10);
        if (!isNaN(productId)) {
          navigate({ type: 'product', productId });
        }
      } else if (path === '/cart') {
        navigate({ type: 'cart' });
      } else if (path === '/checkout') {
        navigate({ type: 'checkout' });
      } else if (path.startsWith('/collections/')) {
        const category = path.replace(/^\/collections\//, '');
        navigate({ type: 'category', category });
      } else {
        navigate({ type: 'home' });
      }
    },
    [navigate]
  );

  // Use real products from props in production, demo only in preview mode
  const products = props.products || DEMO_PRODUCTS;
  const validCategories = props.categories || DEMO_CATEGORIES;
  const normalizedCategories = validCategories.map((category: any) =>
    typeof category === 'string' || category === null ? category : (category.title ?? null)
  );

  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <PreviewHomePage
            storeName={storeName}
            products={products}
            categories={normalizedCategories}
            currency={currency}
            config={config}
            onNavigate={navigate}
          />
        );
      case 'product': {
        // Look up product in real products first, then fallback to demo
        const product =
          products.find((p) => p.id === currentPage.productId) ||
          getDemoProductById(currentPage.productId);
        const relatedProducts = getRelatedProducts(currentPage.productId, 4);
        if (!product) return <div className="pt-32 text-center">Product not found</div>;
        return (
          <div className="pt-20">
            <ProductPage
              product={{
                id: product.id,
                title: product.title || 'Untitled Product',
                description: product.description || '',
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                imageUrl: product.imageUrl || undefined,
                images: (Array.isArray(product.images)
                  ? product.images
                  : product.images
                    ? [product.images]
                    : []) as string[],
                category: product.category || undefined,
                stock: 99,
              }}
              currency={currency}
              relatedProducts={relatedProducts.map((p) => ({
                id: p.id,
                title: p.title || 'Untitled',
                price: p.price,
                compareAtPrice: p.compareAtPrice,
                imageUrl: p.imageUrl || undefined,
                category: p.category || undefined,
              }))}
              theme={NOVALUX_ULTRA_THEME_FOR_SHARED}
              isPreview={true}
              templateId="nova-lux-ultra"
              onNavigate={navigateByPath}
            />
          </div>
        );
      }
      case 'cart':
        return (
          <div className="pt-20">
            <SharedCartPage
              theme={NOVALUX_ULTRA_THEME_FOR_SHARED}
              isPreview={true}
              templateId="nova-lux-ultra"
              onNavigate={navigateByPath}
              recommendedProducts={products.slice(0, 4).map((p) => ({
                id: p.id,
                title: p.title,
                price: p.price,
                imageUrl: p.imageUrl,
              }))}
            />
          </div>
        );
      case 'checkout':
        return (
          <div className="pt-20">
            <SharedCheckoutPage
              theme={NOVALUX_ULTRA_THEME_FOR_SHARED}
              isPreview={true}
              templateId="nova-lux-ultra"
              onNavigate={navigateByPath}
              storeId={storeId}
            />
          </div>
        );
      case 'category': {
        const filtered = products.filter((p) => p.category === currentPage.category);
        return (
          <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <h1
              className="text-5xl font-serif mb-12 text-center"
              style={{ fontFamily: NOVALUX_ULTRA_THEME.fontHeading }}
            >
              {currentPage.category}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {filtered.map((p, index) => (
                <PremiumProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  onNavigate={navigate}
                  index={index}
                />
              ))}
            </div>
          </div>
        );
      }
      case 'order-success':
        return (
          <div className="min-h-[60vh] flex items-center justify-center pt-20 flex-col">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: NOVALUX_ULTRA_THEME.accentGradient }}
            >
              <Check className="w-10 h-10" style={{ color: NOVALUX_ULTRA_THEME.primary }} />
            </motion.div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: NOVALUX_ULTRA_THEME.fontHeading }}
            >
              Order Confirmed
            </h2>
            <p className="text-gray-600 mb-6">Thank you for shopping with us!</p>
            <motion.button
              onClick={() => navigate({ type: 'home' })}
              className="px-8 py-3 rounded-full font-semibold"
              style={{
                background: NOVALUX_ULTRA_THEME.accentGradient,
                color: NOVALUX_ULTRA_THEME.primary,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Shopping
            </motion.button>
          </div>
        );
      case 'search':
        return <div className="pt-32 text-center">Search results for: {currentPage.query}</div>;
      default:
        return null;
    }
  };

  return (
    <CartProvider>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: NOVALUX_ULTRA_THEME.background,
          fontFamily: NOVALUX_ULTRA_THEME.fontBody,
        }}
      >
        {/* Load Premium Fonts with font-display: swap to prevent layout shift */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap" 
        />

        <NovaLuxUltraHeader
          storeName={storeName}
          logo={logo}
          categories={normalizedCategories}
          config={config}
          isPreview={isPreview}
        />
        <main>{renderPage()}</main>
        <NovaLuxUltraFooter
          storeName={storeName}
          logo={logo}
          categories={normalizedCategories}
          socialLinks={props.socialLinks}
          footerConfig={props.footerConfig}
          businessInfo={props.businessInfo}
          planType={props.planType}
          isPreview={isPreview}
        />
        {!isPreview && (
          <FloatingContactButtons
            whatsappEnabled={config?.floatingWhatsappEnabled}
            whatsappNumber={
              config?.floatingWhatsappNumber ||
              props.socialLinks?.whatsapp ||
              props.businessInfo?.phone ||
              undefined
            }
            whatsappMessage={config?.floatingWhatsappMessage || undefined}
            callEnabled={config?.floatingCallEnabled}
            callNumber={config?.floatingCallNumber || props.businessInfo?.phone || undefined}
            storeName={storeName}
            aiEnabled={props.isCustomerAiEnabled}
            aiCredits={props.aiCredits}
            storeId={storeId}
            accentColor={config?.primaryColor || NOVALUX_ULTRA_THEME.accent}
          />
        )}
      </div>
    </CartProvider>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function NovaLuxUltraTemplate(props: StoreTemplateProps) {
  if (props.isPreview) {
    return <PreviewNovaLuxUltraStore {...props} />;
  }
  // For live mode, use the same preview component (can be enhanced later)
  return <PreviewNovaLuxUltraStore {...props} />;
}

export default NovaLuxUltraTemplate;
