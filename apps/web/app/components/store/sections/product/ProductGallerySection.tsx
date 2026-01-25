/**
 * Product Gallery Section
 * 
 * Displays product images in a gallery format with thumbnails.
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { ProductContext } from '~/lib/template-resolver.server';

interface ProductGallerySectionProps {
  sectionId: string;
  props: {
    showThumbnails?: boolean;
    thumbnailPosition?: 'bottom' | 'left';
    enableZoom?: boolean;
    aspectRatio?: 'square' | '4:3' | '16:9';
  };
  context: ProductContext;
}

export default function ProductGallerySection({ sectionId, props, context }: ProductGallerySectionProps) {
  const {
    showThumbnails = true,
    thumbnailPosition = 'bottom',
    enableZoom = true,
    aspectRatio = 'square',
  } = props;

  const product = context.product as any;
  const images: string[] = product?.images || [];
  
  // Add main image if no images array
  if (images.length === 0 && product?.imageUrl) {
    images.push(product.imageUrl);
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  const aspectRatioClass = {
    'square': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
  }[aspectRatio];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <section id={sectionId} className="py-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className={`${aspectRatioClass} bg-gray-100 rounded-lg flex items-center justify-center`}>
            <span className="text-gray-400">No image available</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={sectionId} className="py-4">
      <div className={`max-w-2xl mx-auto px-4 ${thumbnailPosition === 'left' ? 'flex gap-4' : ''}`}>
        {/* Thumbnails on left */}
        {showThumbnails && thumbnailPosition === 'left' && images.length > 1 && (
          <div className="flex flex-col gap-2 w-20">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                  index === currentIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 relative group">
          <div className={`${aspectRatioClass} bg-gray-100 rounded-lg overflow-hidden`}>
            <img
              src={images[currentIndex]}
              alt={product?.title || 'Product image'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom icon */}
          {enableZoom && (
            <button className="absolute right-2 bottom-2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Thumbnails on bottom */}
        {showThumbnails && thumbnailPosition === 'bottom' && images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                  index === currentIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
