import { OptimizedImage } from '~/components/OptimizedImage';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function PremiumBDGallery({
  config,
  product,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  const images = config.galleryImages || (product.imageUrl ? [product.imageUrl] : []);
  if (images.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="gallery"
      sectionLabel="ছবি গ্যালারি"
      data={{ galleryImages: images }}
      onUpdate={(data) => onUpdate?.('gallery', data)}
      isEditable={isEditMode}
    >
      <section className={`py-12 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                className="relative aspect-square overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 group"
              >
                <OptimizedImage
                  src={img}
                  alt={`Product view ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
