/**
 * WhatsApp Order Button
 *
 * Alternative to form-based ordering - very popular in BD
 * Opens WhatsApp with pre-filled order message
 */

import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';

interface WhatsAppOrderButtonProps {
  /** Store's WhatsApp number */
  phoneNumber: string;
  /** Product name */
  productName: string;
  /** Product price */
  price: number;
  /** Currency symbol */
  currency?: string;
  /** Quantity to order */
  quantity?: number;
  /** Button text */
  buttonText?: string;
  /** Full width button */
  fullWidth?: boolean;
  className?: string;
}

export function WhatsAppOrderButton({
  phoneNumber,
  productName,
  price,
  currency = '৳',
  quantity = 1,
  buttonText,
  fullWidth = false,
  className = '',
}: WhatsAppOrderButtonProps) {
  const { t, lang } = useTranslation();
  const displayButtonText = buttonText || t('landingProduct_whatsappOrder');

  // Format phone for WhatsApp
  const formatPhone = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('01')) {
      cleaned = '+880' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    return cleaned.replace('+', '');
  };

  const total = price * quantity;

  // Format total using formatPrice
  const formattedTotal = formatPrice(total);

  // Pre-filled message template
  const message = `${t('landingProduct_orderMsg_greeting')}

${t('landingProduct_orderMsg_iWantToOrder', { productName })}

${t('landingProduct_orderMsg_quantity', { quantity: lang === 'bn' ? quantity.toLocaleString('bn-BD') : quantity })}
${t('landingProduct_orderMsg_price', { total: formattedTotal })}

${t('landingProduct_orderMsg_myInfo')}
${t('landingProduct_orderMsg_name')} 
${t('landingProduct_orderMsg_address')} 
${t('landingProduct_orderMsg_mobile')} 

${t('landingProduct_orderMsg_thanks')}`;

  const whatsappUrl = `https://wa.me/${formatPhone(phoneNumber)}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center gap-3 
        bg-[#25D366] hover:bg-[#128C7E] 
        text-white font-bold text-lg
        px-6 py-4 rounded-xl
        transition-all duration-300 
        hover:scale-[1.02] hover:shadow-lg
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {displayButtonText}
    </button>
  );
}

/**
 * Product Image Gallery
 *
 * Shows multiple product images with thumbnails
 */

interface ProductGalleryProps {
  /** Array of image URLs */
  images: string[];
  /** Product name for alt text */
  productName: string;
  /** Show zoom on hover */
  enableZoom?: boolean;
  className?: string;
}

export function ProductGallery({
  images,
  productName,
  enableZoom = true,
  className = '',
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div
        className={`aspect-square bg-gray-100 rounded-2xl flex items-center justify-center ${className}`}
      >
        <span className="text-6xl">📦</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
        <img
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => enableZoom && setIsZoomed(!isZoomed)}
          loading="lazy"
          decoding="async"
        />

        {/* Navigation Arrows (show if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Zoom Indicator */}
        {enableZoom && (
          <div className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5" />
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails (show if multiple images) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-orange-500 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Product Variant Selector
 *
 * Size/Color selection for products
 */

interface Variant {
  id: string | number;
  name: string;
  value: string;
  price?: number; // Price adjustment
  stock?: number;
  image?: string;
}

interface VariantSelectorProps {
  /** Label for the variant group (e.g., "Size", "Color") */
  label: string;
  /** Available variants */
  variants: Variant[];
  /** Currently selected variant ID */
  selectedId?: string | number;
  /** Callback when variant is selected */
  onSelect: (variant: Variant) => void;
  /** Type of display */
  displayType?: 'buttons' | 'colors' | 'dropdown';
  className?: string;
}

export function VariantSelector({
  label,
  variants,
  selectedId,
  onSelect,
  displayType = 'buttons',
  className = '',
}: VariantSelectorProps) {
  const { t, lang } = useTranslation();

  // Color swatches
  if (displayType === 'colors') {
    return (
      <div className={className}>
        <label className="block text-sm font-bold text-gray-700 mb-3">{label}</label>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = variant.id === selectedId;
            const isOutOfStock = variant.stock === 0;

            return (
              <button
                key={variant.id}
                onClick={() => !isOutOfStock && onSelect(variant)}
                disabled={isOutOfStock}
                className={`
                  w-10 h-10 rounded-full border-2 transition-all relative
                  ${isSelected ? 'ring-2 ring-offset-2 ring-orange-500' : ''}
                  ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}
                `}
                style={{ backgroundColor: variant.value }}
                title={variant.name}
              >
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 rotate-45" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedId && (
          <p className="text-sm text-gray-600 mt-2">
            {t('landingProduct_selected')} {variants.find((v) => v.id === selectedId)?.name}
          </p>
        )}
      </div>
    );
  }

  // Dropdown
  if (displayType === 'dropdown') {
    return (
      <div className={className}>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        <select
          value={selectedId || ''}
          onChange={(e) => {
            const variant = variants.find((v) => String(v.id) === e.target.value);
            if (variant) onSelect(variant);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
        >
          <option value="">{t('landingProduct_selectOption')}</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id} disabled={variant.stock === 0}>
              {variant.name} {variant.stock === 0 ? t('landingProduct_outOfStock') : ''}
              {variant.price ? ` (+${formatPrice(variant.price)})` : ''}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Default: Button pills
  return (
    <div className={className}>
      <label className="block text-sm font-bold text-gray-700 mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const isOutOfStock = variant.stock === 0;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              className={`
                px-4 py-2 rounded-lg border-2 font-medium transition-all
                ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-400 text-gray-700'
                }
                ${isOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}
              `}
            >
              {variant.name}
              {variant.price ? (
                <span className="text-sm ml-1">(+{formatPrice(variant.price)})</span>
              ) : (
                ''
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
