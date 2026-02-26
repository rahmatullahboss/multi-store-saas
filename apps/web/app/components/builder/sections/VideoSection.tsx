/**
 * VideoSection — Video embed section with YouTube support
 * Variants: player | hero-bg | side-by-side
 * Client component for play/pause state
 */

'use client';

import { useState } from 'react';
import { VideoPropsSchema, type VideoProps } from '~/lib/page-builder/schemas';

interface VideoSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function PlayIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-8 w-8' : 'h-12 w-12';
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

export function VideoSection({ props, isPreview = false }: VideoSectionProps) {
  const p: VideoProps = VideoPropsSchema.parse(props);
  const [playing, setPlaying] = useState(false);

  const videoId = p.videoUrl ? extractYouTubeId(p.videoUrl) : null;
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  const defaultThumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1280&q=80';

  const thumbnail = p.thumbnailUrl || defaultThumbnail;

  // ── Player variant (default) ─────────────────────────────────────────────
  const variant = 'player'; // VideoPropsSchema only has title/videoUrl/thumbnailUrl/badgeText

  return (
    <section data-section-type="video" className="w-full bg-gradient-to-b from-slate-900 to-gray-900 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          {p.badgeText && (
            <span className="mb-3 inline-block rounded-full bg-red-500/20 px-4 py-1 text-sm font-semibold text-red-400">
              🎬 {p.badgeText}
            </span>
          )}
          {p.title && (
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{p.title}</h2>
          )}
        </div>

        {/* Video player */}
        <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/50 ring-1 ring-white/10">
          {/* Aspect ratio container 16:9 */}
          <div className="relative aspect-video w-full">
            {playing && embedUrl ? (
              <iframe
                src={embedUrl}
                title={p.title || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <>
                {/* Thumbnail */}
                <img
                  src={thumbnail}
                  alt={p.title || 'Video thumbnail'}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Play button */}
                <button
                  type="button"
                  onClick={() => !isPreview && setPlaying(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition hover:scale-105"
                  aria-label="ভিডিও চালু করুন"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-900/60 transition hover:bg-red-500">
                    <PlayIcon size="md" />
                  </div>
                  {!isPreview && (
                    <span className="rounded-full bg-black/50 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      ভিডিও দেখুন
                    </span>
                  )}
                </button>

                {/* View count badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  ১০,০০০+ ভিউ
                </div>
              </>
            )}
          </div>
        </div>

        {/* No video URL fallback */}
        {!p.videoUrl && (
          <p className="mt-4 text-center text-sm text-gray-500">
            ভিডিও URL সেট করুন — YouTube লিংক সাপোর্ট করে
          </p>
        )}

        {/* CTA below video */}
        <div className="mt-8 text-center">
          <a
            href="#order"
            className="inline-block rounded-full bg-red-600 px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 hover:shadow-xl"
          >
            🛒 এখনই অর্ডার করুন
          </a>
          <p className="mt-3 text-sm text-gray-400">ক্যাশ অন ডেলিভারি · বিকাশ · নগদ</p>
        </div>
      </div>
    </section>
  );
}
