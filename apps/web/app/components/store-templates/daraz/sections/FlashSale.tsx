/**
 * Daraz Flash Sale Section
 *
 * Horizontal scrollable flash sale section matching Daraz Bangladesh
 * Features:
 * - "Flash Sale" header with "On Sale Now" indicator
 * - "SHOP ALL PRODUCTS" CTA button
 * - Horizontally scrollable product cards
 * - Discount badges and countdown timers (optional)
 */

import { Link } from '@remix-run/react';
import { ChevronLeft, ChevronRight, Zap, Clock } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { DARAZ_THEME } from '../theme';
import type { SerializedProduct } from '~/templates/store-registry';
import { formatPrice } from '~/lib/theme-engine';

type Product = SerializedProduct;

interface FlashSaleProps {
  products?: Product[];
  currency?: string;
  title?: string;
  showTimer?: boolean;
  endTime?: Date;
}

export function DarazFlashSale({
  products = [],
  currency = 'BDT',
  title = 'Flash Sale',
  showTimer = true,
  endTime,
}: FlashSaleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Timer logic
  useEffect(() => {
    if (!showTimer || !endTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [showTimer, endTime]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    ref?.addEventListener('scroll', checkScroll);
    return () => ref?.removeEventListener('scroll', checkScroll);
  }, [products]);

  if (products.length === 0) return null;

  return (
    <section className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: DARAZ_THEME.primary }} />
            <h2 className="text-lg font-bold" style={{ color: DARAZ_THEME.text }}>
              {title}
            </h2>
          </div>

          {/* Timer or "On Sale Now" */}
          {showTimer && endTime ? (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4" style={{ color: DARAZ_THEME.textSecondary }} />
              <span className="font-mono font-medium" style={{ color: DARAZ_THEME.primary }}>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium" style={{ color: DARAZ_THEME.primary }}>
              On Sale Now
            </span>
          )}
        </div>

        <Link
          to="/?category=flash-sale"
          className="px-4 py-1.5 text-sm font-semibold border-2 rounded transition-colors cursor-pointer"
          style={{
            borderColor: DARAZ_THEME.primary,
            color: DARAZ_THEME.primary,
          }}
        >
          SHOP ALL PRODUCTS
        </Link>
      </div>

      {/* Product Scroll */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Products */}
        <div
          ref={scrollRef}
          className="flex gap-3 p-4 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.slice(0, 20).map((product) => {
            const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
            const discountPercent = hasDiscount
              ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
              : 0;

            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex-shrink-0 w-[140px] group cursor-pointer"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={product.imageUrl || '/placeholder-product.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasDiscount && (
                    <span
                      className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
                      style={{ backgroundColor: DARAZ_THEME.primary }}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3
                    className="text-xs line-clamp-2 group-hover:text-orange-500 transition-colors"
                    style={{ color: DARAZ_THEME.text }}
                  >
                    {product.title}
                  </h3>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold" style={{ color: DARAZ_THEME.priceOrange }}>
                      ৳{formatPrice(product.price, currency)}
                    </span>
                    {hasDiscount && (
                      <span
                        className="text-[10px] line-through"
                        style={{ color: DARAZ_THEME.muted }}
                      >
                        ৳{formatPrice(product.compareAtPrice!, currency)}
                      </span>
                    )}
                  </div>

                  {/* Sold indicator (simulated) */}
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(85, Math.random() * 50 + 35)}%`,
                        backgroundColor: DARAZ_THEME.primary,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
