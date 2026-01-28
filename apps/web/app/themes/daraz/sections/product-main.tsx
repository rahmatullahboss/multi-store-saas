/**
 * Daraz Product Main Section
 *
 * Shopify OS 2.0 Compatible Section
 * Main product detail section with Daraz-style design:
 * - Orange (#F85606) accent color
 * - Star ratings display
 * - Quantity selector
 * - Add to cart with orange button
 * - Flash sale badge
 * - Trust badges in orange theme
 */

import { useState } from 'react';
import { Link, useFetcher } from '@remix-run/react';
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Zap,
} from 'lucide-react';
import type {
  SectionSchema,
  SectionComponentProps,
  SerializedProduct,
  ProductVariant,
} from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'product-main',
  name: 'Product Main (Daraz)',
  tag: 'section',
  class: 'daraz-product-main',

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
      id: 'show_rating',
      label: 'Show product rating',
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
      default: 'Free Delivery on orders over ৳1000',
    },
    {
      type: 'text',
      id: 'guarantee_text',
      label: 'Guarantee text',
      default: '100% Authentic Products',
    },
    {
      type: 'text',
      id: 'return_text',
      label: 'Return text',
      default: '7 Days Easy Return',
    },
    {
      type: 'header',
      id: 'header_colors',
      label: 'Colors',
    },
    {
      type: 'color',
      id: 'primary_color',
      label: 'Primary color',
      default: '#F85606',
    },
    {
      type: 'color',
      id: 'price_color',
      label: 'Price color',
      default: '#F36D00',
    },
    {
      type: 'color',
      id: 'badge_color',
      label: 'Badge color',
      default: '#FFD700',
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
      name: 'Daraz Product Main',
      category: 'Product',
      settings: {
        show_trust_badges: true,
        show_rating: true,
        primary_color: '#F85606',
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

export interface DarazProductMainSettings {
  image_position: 'left' | 'right';
  enable_zoom: boolean;
  show_rating: boolean;
  show_sku: boolean;
  show_quantity_selector: boolean;
  show_share: boolean;
  show_trust_badges: boolean;
  shipping_text: string;
  guarantee_text: string;
  return_text: string;
  primary_color: string;
  price_color: string;
  badge_color: string;
}

// Demo product for preview
const DEMO_PRODUCT: SerializedProduct = {
  id: 1,
  title: 'Wireless Bluetooth Headphones with Noise Cancellation',
  description:
    'Premium quality wireless headphones with active noise cancellation, 20-hour battery life, and comfortable ear cushions. Perfect for music lovers and professionals.',
  price: 3999,
  compareAtPrice: 5999,
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
      option1Value: 'Black',
      price: 3999,
      inventory: 25,
      isAvailable: true,
    },
    {
      id: 2,
      option1Name: 'Color',
      option1Value: 'White',
      price: 3999,
      inventory: 15,
      isAvailable: true,
    },
    {
      id: 3,
      option1Name: 'Color',
      option1Value: 'Blue',
      price: 4299,
      inventory: 10,
      isAvailable: true,
    },
  ],
};

// Generate pseudo-random rating based on product id
function getProductRating(productId: number): { rating: number; count: number } {
  const seed = productId % 100;
  return {
    rating: 3.5 + (seed % 20) / 10,
    count: 10 + ((seed * 7) % 500),
  };
}

export default function DarazProductMain({
  section,
  context,
  settings,
  blocks,
}: SectionComponentProps) {
  const {
    image_position = 'left',
    enable_zoom = true,
    show_rating = true,
    show_sku = true,
    show_quantity_selector = true,
    show_share = true,
    show_trust_badges = true,
    shipping_text = 'Free Delivery on orders over ৳1000',
    guarantee_text = '100% Authentic Products',
    return_text = '7 Days Easy Return',
    primary_color = '#F85606',
    price_color = '#F36D00',
    badge_color = '#FFD700',
  } = settings as unknown as DarazProductMainSettings;

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

  // Rating
  const { rating, count: reviewCount } = getProductRating(product.id);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

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

  const handleBuyNow = () => {
    if (!isInStock) return;
    handleAddToCart();
    window.location.href = '/checkout';
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
      <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-white border border-gray-200">
        <img
          src={images[selectedImage]}
          alt={product.title}
          className={`w-full h-full object-contain ${enable_zoom ? 'cursor-zoom-in hover:scale-110 transition-transform duration-300' : ''}`}
        />
        {discount > 0 && (
          <span
            className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded text-white"
            style={{ backgroundColor: primary_color }}
          >
            -{discount}%
          </span>
        )}
        {product.tags?.includes('new') && (
          <span
            className="absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded text-gray-800"
            style={{ backgroundColor: badge_color }}
          >
            NEW
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
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                selectedImage === idx ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ borderColor: selectedImage === idx ? primary_color : '#e5e5e5' }}
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
      {/* Title */}
      <h1 className="text-xl md:text-2xl font-medium mb-3 text-gray-800 leading-tight">
        {product.title}
      </h1>

      {/* Rating & Reviews */}
      {show_rating && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < fullStars
                    ? 'fill-yellow-400 text-yellow-400'
                    : i === fullStars && hasHalfStar
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {rating.toFixed(1)} ({reviewCount} Reviews)
          </span>
          {show_sku && product.sku && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
            </>
          )}
        </div>
      )}

      {/* Price */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl md:text-3xl font-bold" style={{ color: price_color }}>
            ৳{currentPrice.toLocaleString()}
          </span>
          {comparePrice && (
            <>
              <span className="text-lg line-through text-gray-400">
                ৳{comparePrice.toLocaleString()}
              </span>
              <span
                className="px-2 py-0.5 text-xs font-bold rounded text-white"
                style={{ backgroundColor: primary_color }}
              >
                {discount}% OFF
              </span>
            </>
          )}
        </div>
      </div>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {product.variants[0].option1Name || 'Variant'}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded border text-sm transition-colors ${
                  selectedVariant?.id === variant.id ? 'border-2' : 'border hover:border-gray-400'
                }`}
                style={{
                  borderColor: selectedVariant?.id === variant.id ? primary_color : '#e5e5e5',
                  backgroundColor:
                    selectedVariant?.id === variant.id ? `${primary_color}10` : 'transparent',
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
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <div className="flex items-center rounded border border-gray-300">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 py-1 min-w-[50px] text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleBuyNow}
          disabled={!isInStock || fetcher.state !== 'idle'}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded font-medium text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: primary_color }}
        >
          <Zap size={18} />
          Buy Now
        </button>
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || fetcher.state !== 'idle'}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded font-medium border-2 transition-colors disabled:opacity-50"
          style={{ borderColor: primary_color, color: primary_color }}
        >
          <ShoppingCart size={18} />
          {fetcher.state !== 'idle' ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>

      {/* Wishlist & Share */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          aria-label="Add to wishlist"
        >
          <Heart
            size={18}
            fill={isWishlisted ? '#ef4444' : 'none'}
            className={isWishlisted ? 'text-red-500' : ''}
          />
          {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
        </button>
        {show_share && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            aria-label="Share product"
          >
            <Share2 size={18} />
            Share
          </button>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 mb-4">
        {isInStock ? (
          <>
            <Check size={16} className="text-green-500" />
            <span className="text-sm text-green-600">In Stock</span>
          </>
        ) : (
          <span className="text-sm text-red-500">Out of Stock</span>
        )}
      </div>

      {/* Trust Badges */}
      {show_trust_badges && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-3">
            <Truck size={20} style={{ color: primary_color }} />
            <span className="text-xs text-gray-700">{shipping_text}</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={20} style={{ color: primary_color }} />
            <span className="text-xs text-gray-700">{guarantee_text}</span>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw size={20} style={{ color: primary_color }} />
            <span className="text-xs text-gray-700">{return_text}</span>
          </div>
        </div>
      )}

      {/* Blocks (Description, Accordions) */}
      {blocks && blocks.length > 0 && (
        <div className="mt-6 space-y-4">
          {blocks.map((block) => {
            if (block.type === 'description' && product.description) {
              return (
                <div key={block.id} className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>
              );
            }
            if (block.type === 'accordion') {
              return (
                <details
                  key={block.id}
                  className="border rounded-lg overflow-hidden border-gray-200"
                >
                  <summary className="p-4 cursor-pointer font-medium hover:bg-gray-50 text-gray-800">
                    {(block.settings?.title as string) || 'Details'}
                  </summary>
                  <div className="p-4 border-t border-gray-200 text-gray-600 text-sm">
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
      className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6"
      data-section-id={section.id}
      data-section-type="daraz-product-main"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`flex flex-col md:flex-row gap-6 md:gap-8 ${image_position === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
          <ImageGallery />
          <ProductInfo />
        </div>
      </div>
    </section>
  );
}
