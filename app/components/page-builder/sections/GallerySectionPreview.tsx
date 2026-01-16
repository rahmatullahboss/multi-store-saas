/**
 * Gallery Section Preview - Per-Section Styling Enabled
 */

import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface GalleryProps extends SectionStyleProps {
  title?: string;
  images?: Array<{ url: string; caption?: string }>;
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
        
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {img.url ? (
                  <img 
                    src={img.url} 
                    alt={img.caption || `Image ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
            ))}
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
