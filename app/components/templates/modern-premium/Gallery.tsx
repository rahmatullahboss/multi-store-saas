import { OptimizedImage } from '~/components/OptimizedImage';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ModernPremiumGallery({
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
      sectionLabel="গ্যালারি"
      data={{ galleryImages: images }}
      onUpdate={(data) => onUpdate?.('gallery', data)}
      isEditable={isEditMode}
    >
      <section className={`py-12 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                className="relative aspect-square overflow-hidden rounded-[4rem] border-[12px] border-gray-50 shadow-2xl group"
              >
                <OptimizedImage
                  src={img}
                  alt={`Modern view ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
