import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from './types';

export function GallerySection({
  config,
  theme,
  lang = 'bn',
  templateId,
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

  const renderLayout = () => {
    switch (templateId) {
      case 'modern-dark':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.galleryImages?.map((image, idx) => (
              <div key={idx} className={`relative aspect-square overflow-hidden rounded-3xl group`}>
                <OptimizedImage 
                  src={image} 
                  alt={`Gallery ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        );

      case 'showcase':
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 aspect-[4/3] rounded-[3rem] overflow-hidden">
              {config.galleryImages?.[0] && (
                <OptimizedImage src={config.galleryImages?.[0]} alt="Featured" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="md:col-span-4 flex flex-col gap-8">
              {config.galleryImages?.slice(1, 3).map((image, idx) => (
                <div key={idx} className="flex-1 aspect-square rounded-[2rem] overflow-hidden">
                  <OptimizedImage src={image} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'flash-sale':
        return (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {config.galleryImages?.map((image, idx) => (
              <div key={idx} className="aspect-square border border-zinc-200">
                <OptimizedImage 
                  src={image} 
                  alt={`Flash ${idx}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        );

      case 'organic':
        return (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {config.galleryImages?.map((image, idx) => (
              <div key={idx} className="aspect-square rounded-[3rem] overflow-hidden shadow-xl shadow-emerald-900/5 group">
                <OptimizedImage 
                  src={image} 
                  alt={`Organic ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        );

      case 'luxury':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-10">
            {config.galleryImages?.map((image, idx) => (
              <div key={idx} className={`space-y-6 ${idx % 2 === 1 ? 'md:mt-24' : ''}`}>
                <div className="aspect-[3/4] border border-white/10 p-4 bg-zinc-900/50 backdrop-blur-3xl rounded-none">
                  <OptimizedImage 
                    src={image} 
                    alt={`Luxury ${idx}`} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                </div>
                <div className="text-center">
                  <span className="text-amber-500/20 text-4xl font-serif-display">0{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.galleryImages?.slice(0, 8).map((url, idx) => (
              <div key={idx} className={`aspect-square rounded-2xl overflow-hidden shadow-lg border-2 ${theme.cardBorder} hover:scale-105 transition-transform duration-300`}>
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
        );
    }
  };

  return (
    <section className={`py-20 md:py-32 ${theme.bgSecondary} overflow-hidden`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`mb-16 ${templateId === 'showcase' ? 'text-left' : 'text-center'}`}>
          <h2 className={`text-4xl md:text-6xl font-black ${theme.textPrimary} uppercase tracking-tighter leading-none mb-4`}>
            {t('photoGallery')}
          </h2>
          <p className={`text-xl ${theme.textSecondary} max-w-2xl ${templateId !== 'showcase' ? 'mx-auto' : ''}`}>
            {t('everyAngle')}
          </p>
        </div>
        
        {renderLayout()}
      </div>
    </section>
  );
}

