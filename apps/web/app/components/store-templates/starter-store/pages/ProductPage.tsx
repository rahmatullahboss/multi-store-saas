import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Heart,
  ChevronRight,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  ZoomIn,
  Facebook,
  Twitter,
  Link2,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddToCartButton } from '~/components/AddToCartButton';
import { StarterProductCard } from '../sections/ProductCard';
import { resolveStarterStoreTheme } from '../theme';

import type {
  SerializedProduct,
  SerializedVariant,
  StoreTemplateTheme,
} from '../../../../templates/store-registry';
import type { ThemeConfig } from '@db/types';

interface StarterProductPageProps {
  product: SerializedProduct;
  currency: string;
  relatedProducts: SerializedProduct[];
  theme?: StoreTemplateTheme;
  config?: ThemeConfig;
  isPreview?: boolean;
}

// Color constants
const COLORS = {
  primary: '#4F46E5',
  accent: '#F59E0B',
};

export function StarterProductPage({
  product,
  currency,
  relatedProducts,
  theme,
  config,
  isPreview = false,
}: StarterProductPageProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(product.imageUrl);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [linkCopied, setLinkCopied] = useState(false);

  // Variant State
  const [selectedVariant, setSelectedVariant] = useState<SerializedVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Reset state when product changes
  useEffect(() => {
    setSelectedImage(product.imageUrl);
    setQuantity(1);
    setSelectedVariant(null);
    setSelectedOptions({});
  }, [product.id, product.imageUrl]);

  // Parse images
  const parseImages = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === 'string');
        }
      } catch {
        return [];
      }
    }
    return [];
  };

  const images = (() => {
    const parsedImages = parseImages(product.images);
    if (parsedImages.length > 0) return parsedImages;
    return product.imageUrl ? [product.imageUrl] : [];
  })();

  const mainImage = selectedImage || images[0];

  // Extract unique options from variants
  const variants = useMemo(() => product.variants || [], [product.variants]);

  const availableOptions = useMemo(() => {
    const optionsMap: Record<string, Set<string>> = {};

    if (variants.length > 0) {
      variants.forEach((v: SerializedVariant) => {
        if (v.option1Name && v.option1Value) {
          if (!optionsMap[v.option1Name]) optionsMap[v.option1Name] = new Set();
          optionsMap[v.option1Name].add(v.option1Value);
        }
        if (v.option2Name && v.option2Value) {
          if (!optionsMap[v.option2Name]) optionsMap[v.option2Name] = new Set();
          optionsMap[v.option2Name].add(v.option2Value);
        }
        if (v.option3Name && v.option3Value) {
          if (!optionsMap[v.option3Name]) optionsMap[v.option3Name] = new Set();
          optionsMap[v.option3Name].add(v.option3Value);
        }
      });
    }

    return Object.entries(optionsMap).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [variants]);

  // Auto-select first variant on load
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const firstVariant = variants[0];
      setSelectedVariant(firstVariant);
      const initialOptions: Record<string, string> = {};
      if (firstVariant.option1Name && firstVariant.option1Value)
        initialOptions[firstVariant.option1Name] = firstVariant.option1Value;
      if (firstVariant.option2Name && firstVariant.option2Value)
        initialOptions[firstVariant.option2Name] = firstVariant.option2Value;
      if (firstVariant.option3Name && firstVariant.option3Value)
        initialOptions[firstVariant.option3Name] = firstVariant.option3Value;
      setSelectedOptions(initialOptions);
    }
  }, [variants, selectedVariant]);

  // Handle Option Selection
  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    const matchingVariant = variants.find((v: SerializedVariant) => {
      let isMatch = true;
      if (v.option1Name && newOptions[v.option1Name] !== v.option1Value) isMatch = false;
      if (v.option2Name && newOptions[v.option2Name] !== v.option2Value) isMatch = false;
      if (v.option3Name && newOptions[v.option3Name] !== v.option3Value) isMatch = false;
      return isMatch;
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  // Pricing based on variant
  const currentPrice = selectedVariant?.price ?? product.price ?? 0;
  const currentComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice ?? 0;
  const discountPercent = currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  // Inventory check
  const variantAvailable = selectedVariant
    ? (selectedVariant.available ?? selectedVariant.inventory ?? 0)
    : 0;
  const productInventory = product.inventory ?? 0;
  const isAvailable = selectedVariant ? variantAvailable > 0 : productInventory > 0;

  // Format Price for BDT
  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('en-BD')}`;
  };

  const colors = resolveStarterStoreTheme(config, theme);
  const primaryColor = colors.primary || COLORS.primary;
  const accentColor = colors.accent || COLORS.accent;

  // Copy link handler
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Mock reviews for demo
  const mockReviews = [
    { id: 1, name: 'Rahim Ahmed', date: '2 days ago', rating: 5, comment: 'Excellent product! Very happy with my purchase. Fast delivery too.' },
    { id: 2, name: 'Fatima Khan', date: '1 week ago', rating: 4, comment: 'Good quality, exactly as described. Would recommend.' },
    { id: 3, name: 'Karim Uddin', date: '2 weeks ago', rating: 5, comment: 'Amazing value for money. Will buy again!' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="text-gray-500 hover:text-gray-700 transition-colors">Home</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="/products" className="text-gray-500 hover:text-gray-700 transition-colors">Products</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900 truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Main Product Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Left - Image Gallery (60% on desktop) */}
            <div className="lg:col-span-3 p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
                
                {/* Zoom indicator */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">Hover to zoom</span>
                </div>

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div
                    className="absolute top-4 left-4 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    -{discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {images.slice(0, 4).map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        mainImage === img
                          ? 'border-indigo-500 ring-2 ring-indigo-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Info (40% on desktop) */}
            <div className="lg:col-span-2 p-4 sm:p-6 lg:p-8 lg:sticky lg:top-4 lg:self-start">
              {/* Category Badge */}
              {product.category && (
                <span
                  className="inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-3"
                  style={{ backgroundColor: `${accentColor}20`, color: '#92400E' }}
                >
                  {product.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4"
                      style={{ color: accentColor, fill: star <= 4 ? accentColor : 'transparent' }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(24 reviews)</span>
                <button className="text-sm font-medium hover:underline" style={{ color: primaryColor }}>
                  Write a Review
                </button>
              </div>

              {/* Price Section */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {formatPrice(currentPrice)}
                </span>
                {currentComparePrice > currentPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(currentComparePrice)}
                    </span>
                    <span
                      className="px-2 py-1 rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      Save {formatPrice(currentComparePrice - currentPrice)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 mb-5">
                <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                  {isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="h-px bg-gray-200 mb-5" />

              {/* Variant Selectors */}
              {availableOptions.length > 0 && (
                <div className="space-y-4 mb-5">
                  {availableOptions.map((option) => (
                    <div key={option.name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {option.name}: <span className="font-normal text-gray-500">{selectedOptions[option.name]}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value: string) => {
                          const isSelected = selectedOptions[option.name] === value;
                          const isColorOption = option.name.toLowerCase().includes('color') || option.name.toLowerCase().includes('colour');
                          
                          if (isColorOption) {
                            return (
                              <button
                                key={value}
                                onClick={() => handleOptionChange(option.name, value)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                  isSelected ? 'ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-110'
                                }`}
                                style={{
                                  backgroundColor: value.toLowerCase(),
                                  borderColor: isSelected ? primaryColor : '#E5E7EB',
                                }}
                                title={value}
                              />
                            );
                          }

                          return (
                            <button
                              key={value}
                              onClick={() => handleOptionChange(option.name, value)}
                              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                                isSelected
                                  ? 'text-white shadow-md'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                              }`}
                              style={{
                                backgroundColor: isSelected ? primaryColor : undefined,
                                borderColor: isSelected ? primaryColor : undefined,
                              }}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <div 
                  className="inline-flex items-center border-2 rounded-xl overflow-hidden"
                  style={{ borderColor: primaryColor }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center font-semibold text-gray-900 border-x-2 py-3 focus:outline-none"
                    style={{ borderColor: primaryColor }}
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-5">
                <AddToCartButton
                  productId={product.id}
                  variantId={selectedVariant?.id}
                  quantity={quantity}
                  currency={currency}
                  productName={product.title}
                  productPrice={currentPrice}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
                  style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px -10px ${primaryColor}80` }}
                  disabled={!isAvailable}
                  isPreview={isPreview}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isAvailable ? t('addToCart') : 'Out of Stock'}
                </AddToCartButton>

                <AddToCartButton
                  productId={product.id}
                  variantId={selectedVariant?.id}
                  quantity={quantity}
                  mode="buy_now"
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
                  style={{ backgroundColor: accentColor, boxShadow: `0 10px 30px -10px ${accentColor}80` }}
                  disabled={!isAvailable}
                  isPreview={isPreview}
                >
                  {t('buyNow')}
                </AddToCartButton>
              </div>

              <div className="h-px bg-gray-200 mb-5" />

              {/* Delivery Info */}
              <div className="space-y-3 mb-5">
                {[
                  { icon: Truck, title: 'Free Delivery', desc: 'On orders over ৳1,000' },
                  { icon: RotateCcw, title: 'Easy Returns', desc: '7 days return policy' },
                  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share & Wishlist */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    isWishlisted
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>
                <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                  <Twitter className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
          {/* Tab Bar */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {(['description', 'specifications', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={activeTab === tab ? { borderColor: primaryColor, color: primaryColor } : {}}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'reviews' && ' (24)'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>No description available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'SKU', value: product.sku || 'N/A' },
                  { label: 'Category', value: product.category || 'N/A' },
                  { label: 'Weight', value: '0.5 kg' },
                  { label: 'Dimensions', value: '20 × 15 × 10 cm' },
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">{spec.label}</span>
                    <span className="font-medium text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-gray-600">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{review.name}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4"
                            style={{
                              color: accentColor,
                              fill: star <= review.rating ? accentColor : 'transparent',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <StarterProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  theme={theme}
                  isPreview={isPreview}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
