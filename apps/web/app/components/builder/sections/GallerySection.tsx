/**
 * GallerySection — Photo gallery with masonry/grid layout and lightbox
 * Variants: masonry | grid | carousel
 * Client component for lightbox state
 */

'use client';

import { useState } from 'react';
import { GalleryPropsSchema, type GalleryProps } from '~/lib/page-builder/schemas';

interface GallerySectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
];

function MagnifierIcon() {
  return (
    <svg className="h-8 w-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

export function GallerySection({ props, isPreview = false }: GallerySectionProps) {
  const p: GalleryProps = GalleryPropsSchema.parse(props);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = p.images.length > 0 ? p.images : PLACEHOLDER_IMAGES;
  const variant = 'grid'; // GalleryPropsSchema only has title + images; default to grid

  const openLightbox = (i: number) => {
    if (!isPreview) setLightboxIndex(i);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const nextImage = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <section data-section-type="gallery" className="w-full bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        {p.title && (
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
              📸 গ্যালারি
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{p.title}</h2>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openLightbox(i)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`ছবি ${i + 1} দেখুন`}
            >
              <img
                src={src}
                alt={`Gallery image ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                <span className="scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <MagnifierIcon />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* View more hint */}
        {images.length > 6 && (
          <div className="mt-8 text-center">
            <span className="text-sm text-gray-500">ছবিতে ক্লিক করুন বড় দেখতে</span>
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Image container */}
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`Gallery image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            aria-label="বন্ধ করুন"
          >
            <CloseIcon />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
              aria-label="আগের ছবি"
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
              aria-label="পরের ছবি"
            >
              <ChevronIcon direction="right" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
