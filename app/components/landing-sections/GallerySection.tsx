/**
 * Gallery Section Component
 * 
 * Product image gallery grid
 */

import { OptimizedImage } from '~/components/OptimizedImage';
import type { BaseSectionProps } from './types';

export function GallerySection({ config }: BaseSectionProps) {
  if (!config.galleryImages || config.galleryImages.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">পণ্যের ছবি গ্যালারি</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {config.galleryImages.map((url, idx) => (
            <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
              <OptimizedImage 
                src={url} 
                alt={`Gallery ${idx + 1}`} 
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
