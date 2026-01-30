/**
 * Tech Modern - Product Main Section
 *
 * Shopify OS 2.0 Compatible Section
 * Modern tech-focused product detail section with:
 * - Slate (#0f172a) + Blue (#3b82f6) color scheme
 * - Rounded corners and modern UI
 * - Tech-focused trust badges
 * - Clean, minimal design
 */

import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Cpu,
  Battery,
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
  primary: '#0f172a', // Slate 900
  secondary: '#1e293b', // Slate 800
  accent: '#3b82f6', // Blue 500
  accentHover: '#2563eb', // Blue 600
  background: '#f8fafc', // Slate 50
  surface: '#ffffff',
  text: '#0f172a',
  muted: '#64748b', // Slate 500
  border: '#e2e8f0', // Slate 200
  success: '#22c55e',
};

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'product-main',
  name: 'Product Main (Tech Modern)',
  tag: 'section',
  class: 'tech-modern-product-main',

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
      label: 'Show category badge',
      default: true,
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
      type: 'checkbox',
      id: 'show_specs_badge',
      label: 'Show tech specs badge',
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
      default: 'Free Express Shipping',
    },
    {
      type: 'text',
      id: 'warranty_text',
      label: 'Warranty text',
      default: '1 Year Warranty',
    },
    {
      type: 'text',
      id: 'return_text',
      label: 'Return text',
      default: '7-Day Returns',
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
      type: 'specifications',
      name: 'Specifications',
      settings: [
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Technical Specifications',
        },
        {
          type: 'richtext',
          id: 'content',
          label: 'Specifications content',
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
      name: 'Tech Modern Product Main',
      category: 'Product',
      settings: {
        show_trust_badges: true,
        show_specs_badge: true,
      },
      blocks: [
        {
          type: 'description',
          settings: { show_full: false },
        },
        {
          type: 'specifications',
          settings: { title: 'Technical Specifications' },
        },
      ],
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface TechModernProductMainSettings {
  image_position: 'left' | 'right';
  enable_zoom: boolean;
  show_category: boolean;
  show_sku: boolean;
  show_quantity_selector: boolean;
  show_share: boolean;
  show_specs_badge: boolean;
  show_trust_badges: boolean;
  shipping_text: string;
  warranty_text: string;
  return_text: string;
}

// Demo product for preview
const DEMO_PRODUCT: SerializedProduct = {
  id: 1,
  title: 'Wireless Noise-Canceling Headphones Pro',
  description:
    'Premium wireless headphones with industry-leading noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for work, travel, and immersive listening experiences.',
  price: 24999,
  compareAtPrice: 29999,
  sku: 'TM-HP-001',
  inventory: 25,
  category: 'Audio',
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop',
  ],
  tags: ['featured', 'new', 'tech'],
  variants: [
    {
      id: 1,
      option1Name: 'Color',
      option1Value: 'Midnight Black',
      price: 24999,
      inventory: 15,
      isAvailable: true,
    },
    {
      id: 2,
      option1Name: 'Color',
      option1Value: 'Silver Frost',
      price: 24999,
      inventory: 10,
      isAvailable: true,
    },
  ],
};

export default function TechModernProductMain({
  section,
  context,
  settings,
  blocks,
}: SectionComponentProps) {
  const {
    image_position = 'left',
    enable_zoom = true,
    show_category = true,
    show_sku = true,
    show_quantity_selector = true,
    show_share = true,
    show_specs_badge = true,
    show_trust_badges = true,
    shipping_text = 'Free Express Shipping',
    warranty_text = '1 Year Warranty',
    return_text = '7-Day Returns',
  } = settings as unknown as TechModernProductMainSettings;

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
        className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg"
        style={{ backgroundColor: THEME.surface }}
      >
        <img
          src={images[selectedImage]}
          alt={product.title}
          className={`w-full h-full object-cover ${enable_zoom ? 'cursor-zoom-in hover:scale-110 transition-transform duration-300' : ''}`}
        />
        {discount > 0 && (
          <span
            className="absolute top-4 left-4 px-3 py-1 text-sm font-semibold rounded-lg"
            style={{ backgroundColor: THEME.accent, color: 'white' }}
          >
            -{discount}% OFF
          </span>
        )}
        {product.tags?.includes('new') && (
          <span
            className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-lg"
            style={{ backgroundColor: THEME.primary, color: 'white' }}
          >
            NEW
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
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all border-2 ${
                selectedImage === idx ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                borderColor: selectedImage === idx ? THEME.accent : THEME.border,
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
      {/* Category Badge */}
      {show_category && product.category && (
        <span
          className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4"
          style={{ backgroundColor: `${THEME.accent}15`, color: THEME.accent }}
        >
          {product.category}
        </span>
      )}

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: THEME.text }}>
        {product.title}
      </h1>

      {/* SKU */}
      {show_sku && product.sku && (
        <p className="text-sm mb-4" style={{ color: THEME.muted }}>
          SKU: {product.sku}
        </p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-3xl font-bold" style={{ color: THEME.accent }}>
          {formatPrice(currentPrice)}
        </span>
        {comparePrice && (
          <span className="text-xl line-through" style={{ color: THEME.muted }}>
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
            __html: product.description.slice(0, 400),
          }}
        />
      )}

      {/* Tech Specs Badge */}
      {show_specs_badge && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full"
            style={{ backgroundColor: THEME.background, color: THEME.text }}
          >
            <Zap size={12} /> Fast Charging
          </span>
          <span
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full"
            style={{ backgroundColor: THEME.background, color: THEME.text }}
          >
            <Battery size={12} /> 30h Battery
          </span>
          <span
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full"
            style={{ backgroundColor: THEME.background, color: THEME.text }}
          >
            <Cpu size={12} /> Active Noise Cancel
          </span>
        </div>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3" style={{ color: THEME.text }}>
            {product.variants[0].option1Name || 'Select Option'}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all"
                style={{
                  backgroundColor:
                    selectedVariant?.id === variant.id ? THEME.accent : THEME.background,
                  color: selectedVariant?.id === variant.id ? 'white' : THEME.text,
                  border: `1px solid ${selectedVariant?.id === variant.id ? THEME.accent : THEME.border}`,
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
          <span className="text-sm font-medium" style={{ color: THEME.text }}>
            Quantity
          </span>
          <div
            className="flex items-center rounded-xl"
            style={{ border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-100 transition-colors rounded-l-xl"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 py-2 min-w-[50px] text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-gray-100 transition-colors rounded-r-xl"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || fetcher.state !== 'idle'}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: THEME.accent }}
        >
          <ShoppingCart size={18} />
          {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="p-3 rounded-xl transition-colors"
          style={{
            border: `1px solid ${THEME.border}`,
            color: isWishlisted ? '#ef4444' : THEME.text,
            backgroundColor: THEME.surface,
          }}
          aria-label="Add to wishlist"
        >
          <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>
        {show_share && (
          <button
            onClick={handleShare}
            className="p-3 rounded-xl transition-colors"
            style={{
              border: `1px solid ${THEME.border}`,
              color: THEME.text,
              backgroundColor: THEME.surface,
            }}
            aria-label="Share product"
          >
            <Share2 size={20} />
          </button>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 mb-6">
        {isInStock ? (
          <>
            <Check size={16} style={{ color: THEME.success }} />
            <span className="text-sm" style={{ color: THEME.success }}>
              In Stock
            </span>
          </>
        ) : (
          <span className="text-sm text-red-500">Out of Stock</span>
        )}
      </div>

      {/* Trust Badges */}
      {show_trust_badges && (
        <div
          className="grid grid-cols-3 gap-3 p-4 rounded-xl"
          style={{ backgroundColor: THEME.background }}
        >
          <div className="flex flex-col items-center text-center">
            <Truck size={20} style={{ color: THEME.accent }} className="mb-1" />
            <span className="text-xs" style={{ color: THEME.muted }}>
              {shipping_text}
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield size={20} style={{ color: THEME.accent }} className="mb-1" />
            <span className="text-xs" style={{ color: THEME.muted }}>
              {warranty_text}
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <RotateCcw size={20} style={{ color: THEME.accent }} className="mb-1" />
            <span className="text-xs" style={{ color: THEME.muted }}>
              {return_text}
            </span>
          </div>
        </div>
      )}

      {/* Blocks (Description, Specifications, Accordions) */}
      {blocks && blocks.length > 0 && (
        <div className="mt-8 space-y-4">
          {blocks.map((block) => {
            if (block.type === 'description' && product.description) {
              return (
                <div key={block.id}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text }}>
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
            if (block.type === 'specifications') {
              return (
                <div
                  key={block.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: THEME.background }}
                >
                  <h3 className="text-lg font-semibold mb-3" style={{ color: THEME.text }}>
                    {(block.settings?.title as string) || 'Specifications'}
                  </h3>
                  <div className="text-sm" style={{ color: THEME.muted }}>
                    {(block.settings?.content as string) || 'No specifications available'}
                  </div>
                </div>
              );
            }
            if (block.type === 'accordion') {
              return (
                <details
                  key={block.id}
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: THEME.background }}
                >
                  <summary
                    className="p-4 cursor-pointer font-medium flex justify-between items-center"
                    style={{ color: THEME.text }}
                  >
                    {(block.settings?.title as string) || 'Details'}
                    <Plus size={16} className="details-icon-plus" />
                  </summary>
                  <div className="px-4 pb-4 text-sm" style={{ color: THEME.muted }}>
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
      data-section-type="tech-modern-product-main"
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
