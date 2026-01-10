
import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { SectionSettings } from './registry';

interface ProductGallerySectionProps {
  settings: SectionSettings;
  product?: {
    title: string;
    images?: string | null;
    imageUrl?: string | null;
  };
  theme?: {
    cardBg?: string;
    isDarkTheme?: boolean;
    borderColor?: string;
  };
}

export function ProductGallerySection({ settings, product, theme }: ProductGallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  // Parse images logic
  const images: string[] = product.images 
    ? JSON.parse(product.images) 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  const cardBg = theme?.cardBg || 'bg-white';
  const isDarkTheme = theme?.isDarkTheme || false;

  return (
    <div className="space-y-4">
      <div className={`aspect-square rounded-2xl overflow-hidden border ${cardBg} ${theme?.borderColor || 'border-gray-200'}`}>
        {images[selectedImage] ? (
          <img
            src={images[selectedImage]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <ShoppingBag className={`w-24 h-24 ${isDarkTheme ? 'text-gray-700' : 'text-gray-300'}`} />
          </div>
        )}
      </div>
      
      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === i 
                  ? 'border-amber-500' 
                  : `${isDarkTheme ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
