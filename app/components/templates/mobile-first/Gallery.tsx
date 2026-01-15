import { OptimizedImage } from '~/components/OptimizedImage';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function MobileFirstGallery({
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
      sectionLabel="প্রোডাক্ট ছবি"
      data={{ galleryImages: images }}
      onUpdate={(data) => onUpdate?.('gallery', data)}
      isEditable={isEditMode}
    >
      <section className={`py-8 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar scroll-smooth snap-x">
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                className={`relative flex-shrink-0 w-72 aspect-square overflow-hidden rounded-3xl border-2 border-indigo-50 snap-center`}
              >
                <OptimizedImage
                  src={img}
                  alt={`Mobile view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
