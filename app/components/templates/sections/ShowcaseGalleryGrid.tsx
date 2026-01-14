import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import type { SectionProps } from './types';

export function ShowcaseGalleryGrid({
  config,
  product,
}: SectionProps) {
  const [activeImage, setActiveImage] = useState(product.imageUrl);

  // Gallery Images - Fallback to product image if no extra images
  const galleryImages = [
    product.imageUrl,
    ...(config.productImages || []),
    ...(config.features?.map(f => f.icon).filter(i => i?.startsWith('http')) || [])
  ].filter(Boolean).slice(0, 4);

  return (
    <section className="py-20 bg-[#0f0f0f] relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-rose-500 tracking-[0.2em] uppercase text-xs font-bold">Visual Perspective</span>
          <h2 className="font-heading text-3xl md:text-4xl text-white mt-4">In Detail</h2>
        </div>

        {/* Featured Image Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px] mb-12">
          <div className="md:col-span-8 relative group overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={activeImage || product.imageUrl || ''}
                alt="Product Detail"
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-2xl font-heading text-white mb-2">{product.title}</h3>
              <p className="text-zinc-400 line-clamp-2">{product.description}</p>
            </div>
          </div>

          {/* Thumbnails / Grid */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 h-full">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative rounded-lg overflow-hidden border transition-all duration-300 h-full min-h-[150px] group ${
                  activeImage === img ? 'border-rose-500 opacity-100 ring-2 ring-rose-500/20' : 'border-zinc-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img || ''} alt={`View ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                {activeImage === img && (
                  <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
                    <BadgeCheck className="text-rose-500 drop-shadow-md" size={32} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
