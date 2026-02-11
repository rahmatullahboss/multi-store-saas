import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Heart,
  Share2,
  ChevronRight,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddToCartButton } from '~/components/AddToCartButton';
import { StarterProductCard } from '../sections/ProductCard';

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
  const [activeTab, setActiveTab] = useState('description');

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
  const images = product.images
    ? typeof product.images === 'string'
      ? JSON.parse(product.images)
      : product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];

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

    // Find matching variant
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
  const currentPrice = (selectedVariant ? selectedVariant.price : product.price) || 0;
  const currentComparePrice =
    (selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice) || 0;

  // Inventory check
  const variantAvailable = selectedVariant?.available ?? 0;
  const productInventory = product.inventory ?? 0;
  const isAvailable = selectedVariant ? variantAvailable > 0 : productInventory > 0;

  // Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const colors = {
    primary: theme?.primary || '#2563EB',
    text: theme?.text || '#1F2937',
    background: theme?.background || '#FFFFFF',
    accent: theme?.accent || '#F59E0B',
  };

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span>Products</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-gray-900 line-clamp-1">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No Image Available
                </div>
              )}
              {currentComparePrice > currentPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                  -{Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Price Block */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                {formatPrice(currentPrice)}
              </span>
              {currentComparePrice > currentPrice && (
                <span className="text-lg text-gray-400 line-through mb-1">
                  {formatPrice(currentComparePrice)}
                </span>
              )}
            </div>

            <div className="h-px bg-gray-100 my-6" />

            {/* Variants */}
            {availableOptions.length > 0 && (
              <div className="space-y-4 mb-6">
                {availableOptions.map((option: { name: string; values: string[] }) => (
                  <div key={option.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value: string) => {
                        const isSelected = selectedOptions[option.name] === value;
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionChange(option.name, value)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-transparent text-white shadow-md'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={{
                              backgroundColor: isSelected ? colors.primary : undefined,
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

            {/* Controls */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isWishlisted
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <AddToCartButton
                  productId={selectedVariant ? selectedVariant.id : product.id}
                  quantity={quantity}
                  currency={currency}
                  productName={product.title}
                  productPrice={currentPrice}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                  style={{ backgroundColor: colors.primary, color: '#fff' }}
                  disabled={!isAvailable}
                  isPreview={isPreview}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isAvailable ? t('addToCart') : 'Out of Stock'}
                </AddToCartButton>

                <AddToCartButton
                  productId={selectedVariant ? selectedVariant.id : product.id}
                  quantity={quantity}
                  mode="buy_now"
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border-2"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    backgroundColor: 'transparent',
                  }}
                  disabled={!isAvailable}
                  isPreview={isPreview}
                >
                  {t('buyNow')}
                </AddToCartButton>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
              {[
                { 
                  icon: Truck, 
                  label: config?.trustBadge1Title || 'Fast Delivery', 
                  desc: config?.trustBadge1Desc || '2-4 business days' 
                },
                { 
                  icon: ShieldCheck, 
                  label: config?.trustBadge2Title || 'Secure Payment', 
                  desc: config?.trustBadge2Desc || '100% protected' 
                },
                { 
                  icon: RotateCcw, 
                  label: config?.trustBadge3Title || 'Easy Returns', 
                  desc: config?.trustBadge3Desc || '7 days policy' 
                },
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                    <badge.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{badge.label}</h4>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description Tabs - Simplified */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
            </nav>
          </div>
          <div className="py-8 prose max-w-none text-gray-600 leading-relaxed">
            {product.description && (
              <div 
                dangerouslySetInnerHTML={{ __html: product.description }} 
                className="prose max-w-none"
              />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
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
