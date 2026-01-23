import { OptimizedImage } from '~/components/OptimizedImage';
import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function FlashSaleGallery({
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
      <section className={`py-16 md:py-24 ${theme.bgPrimary}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} text-center mb-12 uppercase italic tracking-tighter`}>
            📸 পণ্যের ছবি
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img: string, i: number) => (
              <div 
                key={i} 
                className={`aspect-square rounded-2xl overflow-hidden border-2 ${theme.cardBorder} hover:border-yellow-500 transition-all group`}
              >
                <OptimizedImage
                  src={img}
                  alt={`Product image ${i + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
