/**
 * Gallery Section Preview - Per-Section Styling Enabled
 */

import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface GalleryProps extends SectionStyleProps {
  title?: string;
  // Images can be either string[] (from schema) or {url, caption}[] (legacy)
  images?: string[] | Array<{ url: string; caption?: string }>;
}

export function GallerySectionPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'ইমেজ গ্যালারি', 
    images = [],
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as GalleryProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalHeadingColor = headingColor || textColor || '#111827';
  
  // Normalize images to always get the URL string
  const normalizeImageUrl = (img: string | { url: string; caption?: string }): string => {
    if (typeof img === 'string') return img;
    return img.url || '';
  };
  
  // Filter out empty images
  const validImages = images.filter((img) => {
    const url = normalizeImageUrl(img);
    return url && url.length > 0;
  });
  
  return (
    <section 
      className="py-12 px-4" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#FFFFFF',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-8"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        {validImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {validImages.map((img, i) => {
              const url = normalizeImageUrl(img);
              const caption = typeof img === 'object' ? img.caption : undefined;
              
              return (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={url} 
                    alt={caption || `Image ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Image {i}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

