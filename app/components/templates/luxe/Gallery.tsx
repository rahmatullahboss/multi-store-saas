import { OptimizedImage } from '~/components/OptimizedImage';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function LuxeGallery({
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
      sectionLabel="Gallery"
      data={{ galleryImages: images }}
      onUpdate={(data) => onUpdate?.('gallery', data)}
      isEditable={isEditMode}
    >
      <section className={`py-24 bg-black`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                className={`group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 ${i % 2 === 1 ? 'lg:translate-y-12' : ''}`}
              >
                <OptimizedImage
                  src={img}
                  alt={`Collection ${i + 1}`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
