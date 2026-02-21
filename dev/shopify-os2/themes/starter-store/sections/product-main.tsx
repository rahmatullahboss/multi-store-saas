/**
 * Product Main Section
 *
 * Shopify OS 2.0 Compatible Section
 * Main product detail section with images, title, price, variants, and add to cart.
 */

import { useState } from 'react';
import { Link, useFetcher } from '@remix-run/react';
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
} from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  SerializedProduct,
  ProductVariant,
} from '~/lib/theme-engine/types';
import { formatPrice } from '~/lib/theme-engine';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'product-main',
  name: 'Product Main',
  tag: 'section',
  class: 'product-main',

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
      type: 'select',
      id: 'image_size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      default: 'medium',
      label: 'Image size',
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
      default: 'ফ্রি ডেলিভারি ১০০০৳+ অর্ডারে',
    },
    {
      type: 'text',
      id: 'guarantee_text',
      label: 'Guarantee text',
      default: '১০০% অরিজিনাল প্রোডাক্ট',
    },
    {
      type: 'text',
      id: 'return_text',
      label: 'Return text',
      default: '৭ দিনের ইজি রিটার্ন',
    },
    {
      type: 'header',
      id: 'header_style',
      label: 'Style',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#ffffff',
    },
    {
      type: 'range',
      id: 'padding_top',
      min: 0,
      max: 100,
      step: 4,
      default: 48,
      unit: 'px',
      label: 'Padding top',
    },
    {
      type: 'range',
      id: 'padding_bottom',
      min: 0,
      max: 100,
      step: 4,
      default: 48,
      unit: 'px',
      label: 'Padding bottom',
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
          default: 'বিস্তারিত তথ্য',
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
      name: 'Product Main',
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

export interface ProductMainSettings {
  image_position: 'left' | 'right';
  image_size: 'small' | 'medium' | 'large';
  enable_zoom: boolean;
  show_vendor: boolean;
  show_sku: boolean;
  show_quantity_selector: boolean;
  show_share: boolean;
  show_trust_badges: boolean;
  shipping_text: string;
  guarantee_text: string;
  return_text: string;
  background_color: string;
  padding_top: number;
  padding_bottom: number;
}

// Demo product for preview
const DEMO_PRODUCT: SerializedProduct = {
  id: 1,
  title: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
  description:
    'উচ্চমানের সাউন্ড কোয়ালিটি, নয়েজ ক্যান্সেলিং, ২০ ঘন্টা ব্যাটারি লাইফ। আরামদায়ক ইয়ার কুশন সহ।',
  price: 1299,
  compareAtPrice: 1999,
  sku: 'WH-001',
  inventory: 50,
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop',
  ],
  tags: ['featured', 'new'],
  variants: [
    {
      id: 1,
      option1Name: 'Color',
      option1Value: 'কালো',
      price: 1299,
      inventory: 25,
      isAvailable: true,
    },
    {
      id: 2,
      option1Name: 'Color',
      option1Value: 'সাদা',
      price: 1299,
      inventory: 15,
      isAvailable: true,
    },
    {
      id: 3,
      option1Name: 'Color',
      option1Value: 'নীল',
      price: 1499,
      inventory: 10,
      isAvailable: true,
    },
  ],
};

const imageSizeClass = {
  small: 'md:w-1/3',
  medium: 'md:w-1/2',
  large: 'md:w-2/3',
};

export default function ProductMain({ section, context, settings, blocks }: SectionComponentProps) {
  const {
    image_position = 'left',
    image_size = 'medium',
    enable_zoom = true,
    show_vendor = false,
    show_sku = true,
    show_quantity_selector = true,
    show_share = true,
    show_trust_badges = true,
    shipping_text = 'ফ্রি ডেলিভারি ১০০০৳+ অর্ডারে',
    guarantee_text = '১০০% অরিজিনাল প্রোডাক্ট',
    return_text = '৭ দিনের ইজি রিটার্ন',
    background_color = '#ffffff',
    padding_top = 48,
    padding_bottom = 48,
  } = settings as unknown as ProductMainSettings;

  // Use context product or demo product
  const product = context.product || DEMO_PRODUCT;
  const fetcher = useFetcher();

  // State
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Theme colors
  const primaryColor = context.theme?.colors?.primary || '#6366f1';
  const accentColor = context.theme?.colors?.accent || '#f59e0b';
  const textColor = context.theme?.colors?.text || '#111827';
  const mutedColor = context.theme?.colors?.textMuted || '#6b7280';
  const surfaceColor = context.theme?.colors?.surface || '#ffffff';
  const borderColor = context.theme?.colors?.border || '#e5e7eb';

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
      alert('লিংক কপি হয়েছে!');
    }
  };

  // Image Gallery
  const ImageGallery = () => (
    <div className={`${imageSizeClass[image_size]} flex-shrink-0`}>
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-xl overflow-hidden mb-4"
        style={{ backgroundColor: surfaceColor }}
      >
        <img
          src={images[selectedImage]}
          alt={product.title}
          className={`w-full h-full object-cover ${enable_zoom ? 'cursor-zoom-in hover:scale-110 transition-transform duration-300' : ''}`}
        />
        {discount > 0 && (
          <span
            className="absolute top-4 left-4 px-3 py-1 text-sm font-bold rounded-full text-white"
            style={{ backgroundColor: accentColor }}
          >
            -{discount}%
          </span>
        )}
        {product.tags?.includes('new') && (
          <span
            className="absolute top-4 right-4 px-3 py-1 text-sm font-bold rounded-full text-white"
            style={{ backgroundColor: primaryColor }}
          >
            নতুন
          </span>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === idx
                  ? 'border-opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ borderColor: selectedImage === idx ? primaryColor : 'transparent' }}
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
      {/* Title & Rating */}
      <div className="mb-4">
        {show_vendor && product.category && (
          <p className="text-sm mb-1" style={{ color: mutedColor }}>
            {product.category}
          </p>
        )}
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: textColor }}>
          {product.title}
        </h1>
        {show_sku && product.sku && (
          <p className="text-sm" style={{ color: mutedColor }}>
            SKU: {product.sku}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-bold" style={{ color: primaryColor }}>
          {formatPrice(currentPrice, context.store?.currency)}
        </span>
        {comparePrice && (
          <>
            <span className="text-xl line-through" style={{ color: mutedColor }}>
              {formatPrice(comparePrice, context.store?.currency)}
            </span>
            <span
              className="px-2 py-1 text-sm font-medium rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              {discount}% ছাড়
            </span>
          </>
        )}
      </div>

      {/* Short Description */}
      {product.description && (
        <div
          className="mb-6 prose-sm"
          style={{ color: mutedColor }}
          dangerouslySetInnerHTML={{
            __html: product.description.slice(0, 500),
          }}
        />
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
            {product.variants[0].option1Name || 'বিকল্প'}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedVariant?.id === variant.id ? 'border-2' : 'border hover:border-gray-400'
                }`}
                style={{
                  borderColor: selectedVariant?.id === variant.id ? primaryColor : borderColor,
                  backgroundColor:
                    selectedVariant?.id === variant.id ? `${primaryColor}10` : 'transparent',
                  color: textColor,
                }}
                disabled={!variant.isAvailable}
              >
                {variant.option1Value}
                {variant.price !== product.price && (
                  <span className="ml-1 text-sm" style={{ color: mutedColor }}>
                    +{formatPrice(variant.price! - product.price)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-wrap gap-4 mb-6">
        {show_quantity_selector && (
          <div className="flex items-center rounded-lg border" style={{ borderColor: borderColor }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-100 rounded-l-lg transition-colors"
              style={{ color: textColor }}
            >
              <Minus size={18} />
            </button>
            <span
              className="px-4 py-2 min-w-[60px] text-center font-medium"
              style={{ color: textColor }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-gray-100 rounded-r-lg transition-colors"
              style={{ color: textColor }}
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!isInStock || fetcher.state !== 'idle'}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {fetcher.state !== 'idle' ? (
            <>
              <span className="animate-spin">⏳</span>
              যোগ হচ্ছে...
            </>
          ) : isInStock ? (
            <>
              <ShoppingCart size={20} />
              কার্টে যোগ করুন
            </>
          ) : (
            'স্টক নেই'
          )}
        </button>

        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="p-3 rounded-lg border transition-colors hover:bg-gray-50"
          style={{ borderColor: borderColor, color: isWishlisted ? '#ef4444' : textColor }}
        >
          <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>

        {show_share && (
          <button
            onClick={handleShare}
            className="p-3 rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: borderColor, color: textColor }}
          >
            <Share2 size={20} />
          </button>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 mb-6">
        {isInStock ? (
          <>
            <Check size={16} className="text-green-500" />
            <span className="text-sm text-green-600">স্টকে আছে</span>
          </>
        ) : (
          <span className="text-sm text-red-500">স্টক শেষ</span>
        )}
      </div>

      {/* Trust Badges */}
      {show_trust_badges && (
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl"
          style={{ backgroundColor: `${primaryColor}08`, borderColor: borderColor }}
        >
          <div className="flex items-center gap-3">
            <Truck size={24} style={{ color: primaryColor }} />
            <span className="text-sm" style={{ color: textColor }}>
              {shipping_text}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={24} style={{ color: primaryColor }} />
            <span className="text-sm" style={{ color: textColor }}>
              {guarantee_text}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw size={24} style={{ color: primaryColor }} />
            <span className="text-sm" style={{ color: textColor }}>
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
                <div key={block.id} className="prose max-w-none" style={{ color: textColor }}>
                  <h3 className="text-lg font-bold mb-2">বিবরণ</h3>
                  <div
                    style={{ color: mutedColor }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              );
            }
            if (block.type === 'accordion') {
              return (
                <details
                  key={block.id}
                  className="border rounded-lg overflow-hidden"
                  style={{ borderColor: borderColor }}
                >
                  <summary
                    className="p-4 cursor-pointer font-medium hover:bg-gray-50"
                    style={{ color: textColor }}
                  >
                    {(block.settings?.title as string) || 'বিস্তারিত'}
                  </summary>
                  <div
                    className="p-4 border-t"
                    style={{ borderColor: borderColor, color: mutedColor }}
                  >
                    {(block.settings?.content as string) || 'কন্টেন্ট এখানে যোগ করুন'}
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
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="product-main"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex flex-col md:flex-row gap-8 ${image_position === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
          <ImageGallery />
          <ProductInfo />
        </div>
      </div>
    </section>
  );
}
