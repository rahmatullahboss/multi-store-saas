
import { Link } from '@remix-run/react';
import { ChevronLeft, ChevronRight, Zap, ShoppingBag } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import type { SectionSettings } from './registry';
import { useFormatPrice } from '~/contexts/LanguageContext';

interface ProductScrollSectionProps {
  settings: SectionSettings;
  theme: any;
  products: any[];
  currency: string;
}

export default function ProductScrollSection({ settings, theme, products, currency }: ProductScrollSectionProps) {
  const formatPrice = useFormatPrice();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Flash Sale Timer Logic
  const isFlashSale = settings.mode === 'flash-sale';
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 32, seconds: 48 });

  useEffect(() => {
    if (!isFlashSale) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFlashSale]);

  const displayProducts = settings.collection 
    ? products.filter(p => p.category === settings.collection) // Simplified, ideally collection is an ID
    : products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price); // Default to discounted products for scroll

  const items = displayProducts.slice(0, settings.limit || 10);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-6 max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: isFlashSale ? '#FF6B6B' : 'white', borderBottom: isFlashSale ? 'none' : '1px solid #eee' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isFlashSale && <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />}
              <h2 className={`font-bold text-lg ${isFlashSale ? 'text-white' : 'text-gray-900'}`}>
                {settings.heading || (isFlashSale ? 'Flash Sale' : 'Featured Products')}
              </h2>
            </div>
            
            {isFlashSale && (
              <div className="flex items-center gap-1 text-white hidden sm:flex">
                <span className="text-xs opacity-80 mr-1">Ending in:</span>
                <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            )}
          </div>
          
          <Link 
            to="/products"
            className={`text-sm font-medium flex items-center gap-1 hover:underline ${isFlashSale ? 'text-white' : 'text-blue-600'}`}
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scroll Container */}
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-white/90 shadow-lg items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-4 p-4 overflow-x-auto scrollbar-hide snap-x"
          >
            {items.map((product) => {
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
              const discountPercent = hasDiscount 
                ? Math.round((1 - product.price / product.compareAtPrice!) * 100) 
                : 0;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="min-w-[160px] max-w-[160px] md:min-w-[200px] md:max-w-[200px] bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition snap-center relative"
                >
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="text-gray-300 w-8 h-8" />
                      </div>
                    )}
                    
                    {hasDiscount && (
                      <span 
                        className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded"
                        style={{ backgroundColor: theme.accent || 'red' }}
                      >
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <p className="font-bold text-sm md:text-base mb-1" style={{ color: theme.primary }}>
                      {formatPrice(product.price)}
                    </p>
                    {hasDiscount && (
                      <p className="text-xs text-gray-400 line-through mb-1">
                        {formatPrice(product.compareAtPrice)}
                      </p>
                    )}
                    <h3 className="text-xs md:text-sm text-gray-700 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-20 bg-white/90 shadow-lg items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 duration-200"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>
    </section>
  );
}
