import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from './types';

export function GallerySection({
  config,
  lang = 'bn',
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        photoGallery: '📸 পণ্যের ছবি গ্যালারি',
        everyAngle: 'বিস্তারিত দেখুন প্রতিটি এঙ্গেল থেকে',
      },
      en: {
        photoGallery: '📸 Product Photo Gallery',
        everyAngle: 'See details from every angle',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.galleryImages || config.galleryImages.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            {t('photoGallery')}
          </h2>
          <p className="text-xl text-gray-600">{t('everyAngle')}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {config.galleryImages.slice(0, 8).map((url, idx) => (
            <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition-transform duration-300">
              <OptimizedImage 
                src={url} 
                alt={`Product photo ${idx + 1}`} 
                className="w-full h-full object-cover"
                width={300}
                height={300}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
