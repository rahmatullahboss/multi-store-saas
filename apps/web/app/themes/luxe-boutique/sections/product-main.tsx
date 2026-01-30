/**
 * Luxe Boutique - Product Main Section
 *
 * Shopify OS 2.0 Compatible Section
 * Elegant luxury product detail section:
 * - Black (#1a1a1a) and gold (#c9a961) color scheme
 * - Serif typography for headings (Playfair Display)
 * - Sharp edges (border-radius: 0)
 * - Portrait aspect ratio images
 * - Elegant hover animations
 */

import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  ShoppingBag,
  Heart,
  Share2,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  SerializedProduct,
  ProductVariant,
} from '~/lib/theme-engine/types';

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  accentHover: '#b8944f',
  background: '#faf9f7',
  surface: '#ffffff',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  border: '#e5e5e5',
};

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'product-main',
  name: 'Product Main (Luxe)',
  tag: 'section',
  class: 'luxe-product-main',

  enabled_on: {
    templates: ['product'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_layout',
      label: 'Layout',
    },
    {
      type: 'select',
      id: 'image_position',
      options: [
        { value: 'left', label: 'Images Left' },
        { value: 'right', label: 'Images Right' },
      ],
      default: 'left',
      label: 'Image position',
    },
    {
      type: 'checkbox',
      id: 'enable_zoom',
      label: 'Enable image zoom',
      default: true,
    },
    {
      type: 'header',
      id: 'header_content',
      label: 'Content',
    },
    {
      type: 'checkbox',
      id: 'show_category',
      label: 'Show product category',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_sku',
      label: 'Show SKU',
      default: false,
    },
    {
      type: 'checkbox',
      id: 'show_quantity_selector',
      label: 'Show quantity selector',
      default: true,
    },
    {
      type: 'checkbox',
      id: 'show_share',
      label: 'Show share button',
      default: true,
    },
    {
      type: 'header',
      id: 'header_trust',
      label: 'Trust Badges',
    },
    {
      type: 'checkbox',
      id: 'show_trust_badges',
      label: 'Show trust badges',
      default: true,
    },
    {
      type: 'text',
      id: 'shipping_text',
      label: 'Shipping text',
      default: 'Complimentary Shipping',
    },
    {
      type: 'text',
      id: 'guarantee_text',
      label: 'Guarantee text',
      default: 'Authenticity Guaranteed',
    },
    {
      type: 'text',
      id: 'return_text',
      label: 'Return text',
      default: '14-Day Returns',
    },
  ],

  blocks: [
    {
      type: 'description',
      name: 'Description',
      limit: 1,
      settings: [
        {
          type: 'checkbox',
          id: 'show_full',
          label: 'Show full description',
          default: true,
        },
      ],
    },
    {
      type: 'accordion',
      name: 'Accordion',
      settings: [
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Details & Care',
        },
        {
          type: 'richtext',
          id: 'content',
          label: 'Content',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Luxe Product Main',
      category: 'Product',
      settings: {
        show_trust_badges: true,
        show_category: true,
      },
      blocks: [
        {
          type: 'description',
          settings: { show_full: true },
        },
      ],
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface LuxeProductMainSettings {
  image_position: 'left' | 'right';
  enable_zoom: boolean;
  show_category: boolean;
  show_sku: boolean;
  show_quantity_selector: boolean;
  show_share: boolean;
  show_trust_badges: boolean;
  shipping_text: string;
  guarantee_text: string;
  return_text: string;
}

// Demo product for preview
const DEMO_PRODUCT: SerializedProduct = {
  id: 1,
  title: 'Silk Evening Gown',
  description:
    'Exquisitely crafted from pure mulberry silk, this evening gown features a timeless silhouette with delicate hand-sewn details. The flowing fabric drapes elegantly, creating a sophisticated look perfect for special occasions.',
  price: 2499900,
  compareAtPrice: 3499900,
  sku: 'LX-EG-001',
  inventory: 12,
  category: 'Evening Wear',
  imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&fit=crop',
  ],
  tags: ['featured', 'new'],
  variants: [
    {
      id: 1,
      option1Name: 'Size',
      option1Value: 'XS',
      price: 2499900,
      inventory: 3,
      isAvailable: true,
    },
    {
      id: 2,
      option1Name: 'Size',
      option1Value: 'S',
      price: 2499900,
      inventory: 4,
      isAvailable: true,
    },
    {
      id: 3,
      option1Name: 'Size',
      option1Value: 'M',
      price: 2499900,
      inventory: 3,
      isAvailable: true,
    },
    {
      id: 4,
      option1Name: 'Size',
      option1Value: 'L',
      price: 2499900,
      inventory: 2,
      isAvailable: true,
    },
  ],
};

export default function LuxeProductMain({
  section,
  context,
  settings,
  blocks,
}: SectionComponentProps) {
  const {
    image_position = 'left',
    enable_zoom = true,
    show_category = true,
    show_sku = false,
    show_quantity_selector = true,
    show_share = true,
    show_trust_badges = true,
    shipping_text = 'Complimentary Shipping',
    guarantee_text = 'Authenticity Guaranteed',
    return_text = '14-Day Returns',
  } = settings as unknown as LuxeProductMainSettings;

  // Use context product or demo product
  const product = context.product || DEMO_PRODUCT;
  const fetcher = useFetcher();
  const currency = context.store?.currency || 'BDT';

  // State
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Computed values
  const currentPrice = selectedVariant?.price ?? product.price;
  const comparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const discount = comparePrice ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;
  const isInStock = selectedVariant
    ? (selectedVariant.inventory ?? 0) > 0
    : (product.inventory ?? 0) > 0;
  const images = product.images?.length
    ? product.images
    : [product.imageUrl || '/placeholder-product.svg'];

  // Format price
  const formatPrice = (price: number) => {
    if (currency === 'BDT') return `৳${(price / 100).toLocaleString('bn-BD')}`;
    return `$${(price / 100).toFixed(2)}`;
  };

  // Handlers
  const handleAddToCart = () => {
    if (!isInStock) return;

    fetcher.submit(
      {
        action: 'add',
        productId: String(product.id),
        variantId: selectedVariant?.id ? String(selectedVariant.id) : '',
        quantity: String(quantity),
      },
      { method: 'post', action: '/cart' }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  // Image Gallery
  const ImageGallery = () => (
    <div className="md:w-1/2 flex-shrink-0">
      {/* Main Image */}
      <div
        className="aspect-[3/4] overflow-hidden mb-4 relative"
        style={{ backgroundColor: THEME.surface }}
      >
        <img
          src={images[selectedImage]}
          alt={product.title}
          className={`w-full h-full object-cover ${enable_zoom ? 'cursor-zoom-in hover:scale-105 transition-transform duration-700' : ''}`}
        />
        {discount > 0 && (
          <span
            className="absolute top-4 left-4 px-3 py-1 text-xs font-medium tracking-wider"
            style={{ backgroundColor: THEME.accent, color: THEME.primary }}
          >
            -{discount}%
          </span>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`flex-shrink-0 w-20 h-24 overflow-hidden transition-opacity ${
                selectedImage === idx ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
              style={{
                outline: selectedImage === idx ? `2px solid ${THEME.accent}` : 'none',
                outlineOffset: '2px',
              }}
            >
              <img
                src={img}
                alt={`${product.title} - ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Product Info
  const ProductInfo = () => (
    <div className="flex-1 min-w-0">
      {/* Category */}
      {show_category && product.category && (
        <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: THEME.muted }}>
          {product.category}
        </p>
      )}

      {/* Title */}
      <h1
        className="text-2xl md:text-3xl lg:text-4xl mb-4"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: THEME.primary,
          lineHeight: 1.2,
        }}
      >
        {product.title}
      </h1>

      {/* SKU */}
      {show_sku && product.sku && (
        <p className="text-xs mb-4" style={{ color: THEME.muted }}>
          SKU: {product.sku}
        </p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-xl md:text-2xl font-medium" style={{ color: THEME.primary }}>
          {formatPrice(currentPrice)}
        </span>
        {comparePrice && (
          <span className="text-base line-through" style={{ color: THEME.muted }}>
            {formatPrice(comparePrice)}
          </span>
        )}
      </div>

      {/* Gold divider */}
      <div className="w-12 h-0.5 mb-6" style={{ backgroundColor: THEME.accent }} />

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <label
            className="block text-xs uppercase tracking-wider mb-3"
            style={{ color: THEME.text }}
          >
            {product.variants[0].option1Name || 'Size'}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className="min-w-[48px] px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    selectedVariant?.id === variant.id ? THEME.primary : 'transparent',
                  color: selectedVariant?.id === variant.id ? THEME.surface : THEME.primary,
                  border: `1px solid ${THEME.primary}`,
                }}
                disabled={!variant.isAvailable}
              >
                {variant.option1Value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      {show_quantity_selector && (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs uppercase tracking-wider" style={{ color: THEME.text }}>
            Quantity
          </span>
          <div className="flex items-center" style={{ border: `1px solid ${THEME.border}` }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="px-6 text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-gray-50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || fetcher.state !== 'idle'}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-50"
          style={{ backgroundColor: THEME.primary, color: THEME.surface }}
        >
          <ShoppingBag size={18} />
          {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Bag'}
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="p-4 transition-colors"
          style={{
            border: `1px solid ${THEME.border}`,
            color: isWishlisted ? '#ef4444' : THEME.text,
          }}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>
        {show_share && (
          <button
            onClick={handleShare}
            className="p-4 transition-colors"
            style={{ border: `1px solid ${THEME.border}`, color: THEME.text }}
            aria-label="Share product"
          >
            <Share2 size={18} />
          </button>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 mb-6">
        {isInStock ? (
          <>
            <Check size={14} style={{ color: '#2d6a4f' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: '#2d6a4f' }}>
              In Stock
            </span>
          </>
        ) : (
          <span className="text-xs uppercase tracking-wider text-red-600">Out of Stock</span>
        )}
      </div>

      {/* Trust Badges */}
      {show_trust_badges && (
        <div
          className="grid grid-cols-3 gap-4 py-6"
          style={{
            borderTop: `1px solid ${THEME.border}`,
            borderBottom: `1px solid ${THEME.border}`,
          }}
        >
          <div className="flex flex-col items-center text-center">
            <Truck size={20} style={{ color: THEME.accent }} className="mb-2" />
            <span className="text-xs" style={{ color: THEME.muted }}>
              {shipping_text}
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield size={20} style={{ color: THEME.accent }} className="mb-2" />
            <span className="text-xs" style={{ color: THEME.muted }}>
              {guarantee_text}
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <RotateCcw size={20} style={{ color: THEME.accent }} className="mb-2" />
            <span className="text-xs" style={{ color: THEME.muted }}>
              {return_text}
            </span>
          </div>
        </div>
      )}

      {/* Blocks (Description, Accordions) */}
      {blocks && blocks.length > 0 && (
        <div className="mt-8 space-y-4">
          {blocks.map((block) => {
            if (block.type === 'description' && product.description) {
              return (
                <div key={block.id}>
                  <h3
                    className="text-sm uppercase tracking-wider mb-3"
                    style={{ color: THEME.primary }}
                  >
                    Description
                  </h3>
                  <div
                    className="text-sm leading-relaxed prose-sm"
                    style={{ color: THEME.muted }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              );
            }
            if (block.type === 'accordion') {
              return (
                <details
                  key={block.id}
                  className="group"
                  style={{ borderBottom: `1px solid ${THEME.border}` }}
                >
                  <summary
                    className="py-4 cursor-pointer text-sm uppercase tracking-wider flex justify-between items-center"
                    style={{ color: THEME.primary }}
                  >
                    {(block.settings?.title as string) || 'Details'}
                    <Plus size={14} className="group-open:hidden" />
                    <Minus size={14} className="hidden group-open:block" />
                  </summary>
                  <div className="pb-4 text-sm" style={{ color: THEME.muted }}>
                    {(block.settings?.content as string) || 'Add content here'}
                  </div>
                </details>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );

  return (
    <section
      className="py-8 md:py-12"
      style={{ backgroundColor: THEME.background }}
      data-section-id={section.id}
      data-section-type="luxe-product-main"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col md:flex-row gap-8 md:gap-12 ${image_position === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
          <ImageGallery />
          <ProductInfo />
        </div>
      </div>
    </section>
  );
}
