import { OptimizedImage } from '~/components/OptimizedImage';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function VideoFocusGallery({
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
      <section className={`py-16 bg-[#0A0A0A]`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                className="relative aspect-video overflow-hidden rounded-3xl border border-white/5 bg-black group"
              >
                <OptimizedImage
                  src={img}
                  alt={`Product view ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
