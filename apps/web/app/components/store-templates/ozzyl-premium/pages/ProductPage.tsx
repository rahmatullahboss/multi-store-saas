import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ArrowLeft,
  Star,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useWishlist } from '~/hooks/useWishlist';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useProductPrice } from '~/hooks/useProductPrice';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { buildProxyImageUrl, generateProxySrcset } from '~/utils/imageOptimization';
import { OZZYL_PREMIUM_THEME } from '../theme';
import { OzzylPremiumHeader } from '../sections/Header';
import { OzzylPremiumFooter } from '../sections/Footer';

const THEME = OZZYL_PREMIUM_THEME;

function formatPrice(price: number | undefined, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price || 0);
}

export function OzzylPremiumProductPage(props: StoreTemplateProps) {
  const { storeName, logo, products = [], storeId, config, socialLinks, businessInfo } = props;
  const { id } = useParams();
  const product = products.find((p) => p.id.toString() === id);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: THEME.background }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: THEME.text }}>
            Product Not Found
          </h1>
          <Link to="/" className="underline" style={{ color: THEME.primary }}>
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const { price, compareAtPrice, isOnSale, discountPercentage } = useProductPrice(product);
  const isLiked = isInWishlist(product.id);
  const images = product.images?.length > 0 ? product.images : [product.imageUrl].filter(Boolean);

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
              <span>Back to Shop</span>
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div
                className="aspect-square rounded-2xl overflow-hidden"
                style={{ backgroundColor: THEME.cardBg }}
              >
                <img
                  src={buildProxyImageUrl(images[selectedImage], { width: 800, quality: 85 })}
                  alt={product.name || product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${
                      selectedImage === index ? 'ring-2' : 'opacity-60'
                    }`}
                    style={{
                      ...(selectedImage === index ? { ringColor: THEME.primary } : {}),
                      borderColor: selectedImage === index ? THEME.primary : 'transparent',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                    }}
                  >
                    <img
                      src={buildProxyImageUrl(img, { width: 160, quality: 80 })}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium" style={{ color: THEME.primary }}>
                  {product.category || 'General'}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{product.name || product.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold" style={{ color: THEME.primary }}>
                  {formatPrice(price)}
                </span>
                {compareAtPrice && compareAtPrice > price && (
                  <>
                    <span className="text-xl line-through" style={{ color: THEME.textMuted }}>
                      {formatPrice(compareAtPrice)}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ backgroundColor: `${THEME.primary}20`, color: THEME.primary }}
                    >
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="mb-8 leading-relaxed" style={{ color: THEME.textMuted }}>
                {product.description ||
                  'Premium quality product with exceptional craftsmanship. Available for immediate delivery across Bangladesh.'}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div
                  className="flex items-center justify-between rounded-xl px-4"
                  style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <AddToCartButton
                  productId={product.id}
                  storeId={Number(storeId)}
                  quantity={quantity}
                  variantId={product.variants?.[0]?.id}
                  className="flex-1 justify-center py-4 rounded-xl font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                    color: '#0A0A0C',
                  }}
                />

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    backgroundColor: isLiked ? `${THEME.primary}20` : 'transparent',
                    border: `2px solid ${isLiked ? THEME.primary : THEME.border}`,
                  }}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={24}
                    fill={isLiked ? THEME.primary : 'none'}
                    stroke={isLiked ? THEME.primary : 'currentColor'}
                  />
                </button>
              </div>

              {/* Trust Badges */}
              <div
                className="grid grid-cols-3 gap-4 py-6"
                style={{ borderTop: `1px solid ${THEME.border}` }}
              >
                {[
                  { icon: Truck, label: 'Free Shipping' },
                  { icon: Shield, label: 'Secure Payment' },
                  { icon: RefreshCw, label: 'Easy Returns' },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <item.icon
                      className="mx-auto mb-2"
                      size={24}
                      style={{ color: THEME.primary }}
                    />
                    <span className="text-xs" style={{ color: THEME.textMuted }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
          config?.floatingWhatsappNumber ||
          socialLinks?.whatsapp ||
          businessInfo?.phone ||
          undefined
        }
        whatsappMessage={config?.floatingWhatsappMessage || undefined}
        callEnabled={config?.floatingCallEnabled}
        callNumber={config?.floatingCallNumber || businessInfo?.phone || undefined}
        storeName={storeName || 'Store'}
      />
    </div>
  );
}

export default OzzylPremiumProductPage;
