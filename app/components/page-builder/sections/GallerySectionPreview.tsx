/**
 * Page Builder v2 - Gallery Section Preview
 */

interface GalleryProps {
  title?: string;
  images?: Array<{ url: string; caption?: string }>;
}

export function GallerySectionPreview({ props }: { props: Record<string, unknown> }) {
  const { title = 'ইমেজ গ্যালারি', images = [] } = props as GalleryProps;
  
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">{title}</h2>
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
