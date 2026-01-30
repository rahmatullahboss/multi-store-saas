/**
 * Nova Lux - Product Main Section
 *
 * Shopify OS 2.0 Compatible Section
 * Luxury product detail section with:
 * - Gold (#C4A35A) accent color
 * - Elegant serif typography (Cormorant Garamond)
 * - Refined, minimal design
 * - Premium feel
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
  primary: '#1C1C1E',
  accent: '#C4A35A',
  accentHover: '#B3924A',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#2C2C2C',
  muted: '#8E8E93',
  border: '#E5E5EA',
};

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'product-main',
  name: 'Product Main (Nova Lux)',
  tag: 'section',
  class: 'nova-lux-product-main',

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
      id: 'show_vendor',
      label: 'Show vendor',
      default: false,
    },
    {
      type: 'checkbox',
      id: 'show_sku',
      label: 'Show SKU',
      default: true,
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
      label: 'Show share buttons',
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
      default: '30-Day Returns',
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
          default: false,
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
          default: 'Product Details',
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
      name: 'Nova Lux Product Main',
      category: 'Product',
      settings: {
        show_trust_badges: true,
      },
      blocks: [
        {
          type: 'description',
          settings: { show_full: false },
        },
      ],
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface NovaLuxProductMainSettings {
  image_position: 'left' | 'right';
  enable_zoom: boolean;
  show_vendor: boolean;
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
  title: 'Diamond Eternity Ring',
  description:
    'Exquisite diamond eternity ring featuring premium cut stones set in 18k white gold. A timeless symbol of eternal love and commitment.',
  price: 125000,
  compareAtPrice: 145000,
  sku: 'NL-RING-001',
  inventory: 5,
  imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=600&fit=crop',
  ],
  tags: ['featured', 'new'],
  variants: [
    {
      id: 1,
      option1Name: 'Size',
      option1Value: '6',
      price: 125000,
      inventory: 2,
      isAvailable: true,
    },
    {
      id: 2,
      option1Name: 'Size',
      option1Value: '7',
      price: 125000,
      inventory: 2,
      isAvailable: true,
    },
    {
      id: 3,
      option1Name: 'Size',
      option1Value: '8',
      price: 130000,
      inventory: 1,
      isAvailable: true,
    },
  ],
};

export default function NovaLuxProductMain({
  section,
  context,
  settings,
  blocks,
}: SectionComponentProps) {
  const {
    image_position = 'left',
    enable_zoom = true,
    show_vendor = false,
    show_sku = true,
    show_quantity_selector = true,
    show_share = true,
    show_trust_badges = true,
    shipping_text = 'Complimentary Shipping',
    guarantee_text = 'Authenticity Guaranteed',
    return_text = '30-Day Returns',
  } = settings as unknown as NovaLuxProductMainSettings;

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
    if (currency === 'BDT') return `৳${price.toLocaleString('bn-BD')}`;
    return `$${price.toFixed(2)}`;
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
        className="relative aspect-square rounded-xl overflow-hidden mb-4"
        style={{ backgroundColor: THEME.surface }}
      >
        <img
          src={images[selectedImage]}
          alt={product.title}
          className={`w-full h-full object-cover ${enable_zoom ? 'cursor-zoom-in hover:scale-110 transition-transform duration-500' : ''}`}
        />
        {discount > 0 && (
          <span
            className="absolute top-4 left-4 px-3 py-1 text-sm font-medium tracking-wider"
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
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                selectedImage === idx ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                outline: selectedImage === idx ? `2px solid ${THEME.accent}` : 'none',
                outlineOffset: selectedImage === idx ? '2px' : '0',
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
      {show_vendor && product.category && (
        <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: THEME.accent }}>
          {product.category}
        </p>
      )}

      {/* Title */}
      <h1
        className="text-3xl md:text-4xl mb-4"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
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

      {/* Gold divider */}
      <div className="w-16 h-0.5 mb-6" style={{ backgroundColor: THEME.accent }} />

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6">
        <span
          className="text-2xl md:text-3xl font-medium"
          style={{ color: THEME.primary, fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {formatPrice(currentPrice)}
        </span>
        {comparePrice && (
          <span className="text-lg line-through" style={{ color: THEME.muted }}>
            {formatPrice(comparePrice)}
          </span>
        )}
      </div>

      {/* Short Description */}
      {product.description && (
        <div
          className="mb-6 prose-sm"
          style={{ color: THEME.muted }}
          dangerouslySetInnerHTML={{
            __html: product.description.slice(0, 300),
          }}
        />
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <label
            className="block text-xs uppercase tracking-wider mb-3"
            style={{ color: THEME.text }}
          >
            {product.variants[0].option1Name || 'Select Option'}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className="min-w-[48px] px-4 py-2 text-sm transition-colors rounded-full"
                style={{
                  backgroundColor:
                    selectedVariant?.id === variant.id ? THEME.primary : 'transparent',
                  color: selectedVariant?.id === variant.id ? THEME.surface : THEME.primary,
                  border: `1px solid ${THEME.border}`,
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
          <div
            className="flex items-center rounded-full"
            style={{ border: `1px solid ${THEME.border}` }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-50 transition-colors rounded-full"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="px-6 text-sm font-medium min-w-[60px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-gray-50 transition-colors rounded-full"
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
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-50 rounded-full"
          style={{ backgroundColor: THEME.primary, color: THEME.surface }}
        >
          <ShoppingBag size={18} />
          {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Bag'}
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="p-4 transition-colors rounded-full"
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
            className="p-4 transition-colors rounded-full"
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
            <Check size={14} style={{ color: '#10B981' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: '#10B981' }}>
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
      data-section-type="nova-lux-product-main"
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
