import type { ThemeConfig } from '@db/types';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  alt?: string;
}

export const HERO_SLIDES_MAX = 6;
const HERO_DELAY_DEFAULT = 4000;
const HERO_DELAY_MIN = 1500;
const HERO_DELAY_MAX = 15000;

function clampDelay(value?: number): number {
  if (!value || Number.isNaN(value)) return HERO_DELAY_DEFAULT;
  return Math.max(HERO_DELAY_MIN, Math.min(HERO_DELAY_MAX, value));
}

function asNonEmpty(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function sanitizeSlide(slide: unknown, index: number): HeroSlide | null {
  if (!slide || typeof slide !== 'object') return null;
  const row = slide as Record<string, unknown>;
  const imageUrl = asNonEmpty(String(row.imageUrl ?? ''));
  if (!imageUrl) return null;

  return {
    id: asNonEmpty(String(row.id ?? '')) || `hero-slide-${index + 1}`,
    imageUrl,
    heading: asNonEmpty(String(row.heading ?? '')),
    subheading: asNonEmpty(String(row.subheading ?? '')),
    ctaText: asNonEmpty(String(row.ctaText ?? '')),
    ctaLink: asNonEmpty(String(row.ctaLink ?? '')),
    alt: asNonEmpty(String(row.alt ?? '')),
  };
}

export function getHeroSlides(config: ThemeConfig | null | undefined): HeroSlide[] {
  const source = Array.isArray(config?.heroSlides) ? config.heroSlides : [];
  const slides = source
    .map((slide, index) => sanitizeSlide(slide, index))
    .filter((slide): slide is HeroSlide => Boolean(slide))
    .slice(0, HERO_SLIDES_MAX);

  if (slides.length > 0) {
    if (config?.heroMode === 'single') return [slides[0]];
    return slides;
  }

  if (config?.bannerUrl) {
    return [
      {
        id: 'hero-banner-fallback',
        imageUrl: config.bannerUrl,
        heading: config.bannerText,
        alt: config.bannerText || 'Hero banner',
      },
    ];
  }

  return [];
}

export function getHeroBehavior(config: ThemeConfig | null | undefined) {
  const slides = getHeroSlides(config);
  const isCarousel = (config?.heroMode === 'carousel' || slides.length > 1) && slides.length > 1;
  return {
    slides,
    isCarousel,
    autoplay: isCarousel ? config?.heroAutoplay !== false : false,
    delayMs: clampDelay(config?.heroDelayMs),
  };
}
