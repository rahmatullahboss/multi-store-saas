import { useState } from 'react';
import { Link, useFetcher, useParams } from '@remix-run/react';
import { formatPrice } from '~/lib/formatting';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ChevronRight,
  Star,
  Minus,
  Plus,
  Heart,
  Truck,
  Package,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import { AddToCartButton } from '~/components/AddToCartButton';
import { sanitizeHtml } from '~/utils/sanitize';

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  color?: string;
  size?: string;
  colorHex?: string;
}

interface Product {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  images?: string[];
  category?: string | null;
  sku?: string | null;
  stock?: number | null;
  specifications?: Record<string, string>;
  shippingInfo?: string | null;
  returnPolicy?: string | null;
  variants?: ProductVariant[];
  reviews?: {
    average: number;
    count: number;
    items?: Array<{
      id: number;
      customerName: string;
      rating: number;
      comment: string;
      createdAt: string;
      verified?: boolean;
    }>;
  };
}

interface NovaLuxProductPageProps {
  product: Product;
  currency: string;
  relatedProducts?: Product[];
  complementaryProducts?: Product[];
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
  templateId?: string;
  onNavigate?: (path: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any; // Theme config
}

function AccordionItem({
  title,
  isOpen,
  onClick,
  children,
  colors,
}: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  colors: StoreTemplateTheme;
}) {
  return (
    <div className="border-b" style={{ borderColor: colors.muted + '30' }}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 text-left font-medium transition-colors hover:opacity-70"
        style={{ color: colors.text }}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div style={{ color: colors.muted }} className="prose prose-sm max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}

export function NovaLuxProductPage({
  product,
  currency,
  relatedProducts = [],
  theme,
  isPreview = false,
  templateId: propTemplateId,
  onNavigate,
  config,
}: NovaLuxProductPageProps) {
  const params = useParams();
  const templateId = propTemplateId || params.templateId;

  const colors = theme || {
    primary: '#1C1C1E',
    accent: '#C4A35A',
    background: '#FAFAFA',
    text: '#2C2C2C',
    muted: '#8E8E93',
    cardBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    footerBg: '#1C1C1E',
    footerText: '#FAFAFA',
  };

  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const fetcher = useFetcher();
  const allImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

  const currentPrice = selectedVariant?.price || product.price;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > currentPrice;

  const currentStock = selectedVariant?.stock ?? product.stock ?? 100;
  const isOutOfStock = currentStock === 0;

  const uniqueColors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean))
  ) as string[];
  const uniqueSizes = Array.from(
    new Set(product.variants?.map((v) => v.size).filter(Boolean))
  ) as string[];

  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path.startsWith('/products/')) {
        const id = path.replace('/products/', '');
        return `/store-template-preview/${templateId}/products/${id}`;
      }
      if (path.startsWith('/collections/')) {
        const cat = path.replace('/collections/', '');
        return `/store-template-preview/${templateId}/collections/${cat}`;
      }
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAdding(true);

    if (isPreview) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item: { productId: number; quantity: number }) => item.productId === product.id);
      if (existing) existing.quantity += quantity;
      else cart.push({ productId: product.id, quantity });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } else {
      fetcher.submit(
        {
            productId: String(product.id),
            variantId: selectedVariant?.id ? String(selectedVariant.id) : '',
            quantity: String(quantity),
        },
        { method: 'POST', action: '/api/cart' }
      );
    }

    setTimeout(() => {
      setIsAdding(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen pt-20 pb-20" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-8" style={{ color: colors.muted }}>
          <Link to={getLink('/')} onClick={(e) => handleNavigation(e, '/')} className="hover:opacity-70">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to={getLink('/products')} onClick={(e) => handleNavigation(e, '/products')} className="hover:opacity-70">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link
                to={getLink(`/collections/${product.category}`)}
                onClick={(e) => handleNavigation(e, `/collections/${product.category}`)}
                className="hover:opacity-70"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 mx-2" />
          <span style={{ color: colors.text }}>{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery - Left Side */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-sm">
              {allImages.length > 0 ? (
                <img
                  src={allImages[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-16 h-16" />
                </div>
              )}
              {hasDiscount && (
                <div 
                  className="absolute top-4 left-4 text-xs font-bold px-3 py-1 tracking-widest uppercase"
                  style={{ backgroundColor: colors.accent, color: colors.background }}
                >
                  Sale
                </div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-24 aspect-[3/4] flex-shrink-0 overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: idx === currentImageIndex ? colors.text : 'transparent' }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details - Right Side */}
          <div className="flex flex-col">
            <h1 
              className="text-3xl md:text-4xl font-serif mb-4"
              style={{ color: colors.text, fontFamily: 'Cormorant Garamond, serif' }}
            >
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium" style={{ color: colors.primary }}>
                  {formatPrice(currentPrice, currency)}
                </span>
                {hasDiscount && (
                  <span className="text-lg line-through opacity-50" style={{ color: colors.text }}>
                    {formatPrice(comparePrice, currency)}
                  </span>
                )}
              </div>
              {/* Reviews Star Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    fill={i < 4 ? colors.accent : 'none'}
                    stroke={i < 4 ? colors.accent : colors.muted}
                  />
                ))}
                <span className="text-sm ml-2" style={{ color: colors.muted }}>(24 reviews)</span>
              </div>
            </div>
            
            {/* Short Description */}
            <div className="mb-8 text-lg" style={{ color: colors.muted }}>
                <p>{product.description?.slice(0, 150)}...</p>
            </div>

            {/* Variants */}
            <div className="space-y-6 mb-8">
              {uniqueColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: colors.text }}>
                    Color
                  </label>
                  <div className="flex gap-3">
                    {uniqueColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          const variant = product.variants?.find((v) => v.color === color);
                          if (variant) setSelectedVariant(variant);
                        }}
                        className={`w-8 h-8 rounded-full border border-gray-200 transition-all ${
                          selectedVariant?.color === color ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{ 
                          backgroundColor: color.toLowerCase(),
                          // ringColor is not a valid style prop, handling via class
                          outlineColor: colors.text,
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {uniqueSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: colors.text }}>
                    Size
                  </label>
                  <div className="flex gap-3">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                            const variant = product.variants?.find((v) => v.size === size);
                            if (variant) setSelectedVariant(variant);
                        }}
                        className={`h-10 px-4 min-w-[3rem] border transition-all flex items-center justify-center text-sm ${
                          selectedVariant?.size === size 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-200 hover:border-black'
                        }`}
                        style={{
                            backgroundColor: selectedVariant?.size === size ? colors.text : 'transparent',
                            color: selectedVariant?.size === size ? colors.background : colors.text,
                            borderColor: selectedVariant?.size === size ? colors.text : '#E5E7EB'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <AddToCartButton
                productId={product.id}
                productName={product.title}
                productPrice={currentPrice}
                quantity={quantity}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-6 text-white text-sm font-medium uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </AddToCartButton>
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-3 border border-gray-200 rounded-sm hover:border-black transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {/* Accordions for Details */}
            <div className="border-t" style={{ borderColor: colors.muted + '30' }}>
               <AccordionItem 
                 title="Description" 
                 isOpen={openAccordion === 'description'} 
                 onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')}
                 colors={colors}
               >
                 <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description || '') }} />
               </AccordionItem>
               
               <AccordionItem 
                 title="Specifications" 
                 isOpen={openAccordion === 'specifications'} 
                 onClick={() => setOpenAccordion(openAccordion === 'specifications' ? null : 'specifications')}
                 colors={colors}
               >
                 <ul className="space-y-2">
                   {Object.entries(product.specifications || {}).map(([key, value]) => (
                     <li key={key} className="flex justify-between">
                       <span className="font-medium opacity-80">{key}</span>
                       <span>{value}</span>
                     </li>
                   ))}
                 </ul>
               </AccordionItem>

               <AccordionItem 
                 title="Shipping & Returns" 
                 isOpen={openAccordion === 'shipping'} 
                 onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                 colors={colors}
               >
                 <div className="space-y-4">
                   <div className="flex items-start gap-3">
                     <Truck className="w-5 h-5 mt-0.5" />
                     <div>
                       <p className="font-medium">Free Shipping</p>
                       <p className="text-sm opacity-70">On all orders over {currency === 'BDT' ? '৳2000' : '$50'}</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-3">
                     <RotateCcw className="w-5 h-5 mt-0.5" />
                     <div>
                       <p className="font-medium">Easy Returns</p>
                       <p className="text-sm opacity-70">30-day return policy for unused items</p>
                     </div>
                   </div>
                 </div>
               </AccordionItem>
            </div>

            {/* Trust Badges - Powered by Unified Settings */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {((config as any)?.trustBadges?.badges?.length > 0) && (
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t" style={{ borderColor: colors.muted + '30' }}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(config as any)?.trustBadges?.badges.map((badge: any, idx: number) => {
                    const Icon = badge.icon === 'truck' ? Truck : badge.icon === 'shield' ? ShieldCheck : badge.icon === 'refresh' ? RotateCcw : Star;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center gap-2">
                        <div className="p-2 rounded-full" style={{ backgroundColor: colors.background, color: colors.muted }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm" style={{ color: colors.text }}>{badge.title}</h4>
                          <p className="text-xs" style={{ color: colors.muted }}>{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
            <div className="mt-24 mb-12">
                <h2 className="text-2xl font-serif mb-8 text-center" style={{ color: colors.text, fontFamily: 'Cormorant Garamond, serif' }}>
                    You May Also Like
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {relatedProducts.map((p) => (
                        <Link 
                            key={p.id} 
                            to={getLink(`/products/${p.id}`)}
                            onClick={(e) => handleNavigation(e, `/products/${p.id}`)}
                            className="group block"
                        >
                            <div className="aspect-[3/4] mb-4 overflow-hidden bg-gray-100">
                                <img 
                                    src={p.imageUrl || ''} 
                                    alt={p.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <h3 className="font-medium mb-1" style={{ color: colors.text }}>{p.title}</h3>
                            <p style={{ color: colors.muted }}>{formatPrice(p.price, currency)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default NovaLuxProductPage;
