import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function FlashSaleComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-20 bg-black overflow-hidden relative">
      {/* Caution tape background */}
      <div className="absolute top-0 w-full h-8 bg-yellow-400 flex items-center overflow-hidden whitespace-nowrap opacity-20 rotate-1">
        {[...Array(20)].map((_, i) => (
          <span key={i} className="text-black font-black text-xs uppercase mx-4">CAUTION ⚠ DON'T BUY FAKES ⚠ </span>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 mt-8">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
             Fake vs <span className="text-yellow-400">Authentic</span>
          </h2>
          {comparison.description && (
            <p className="text-zinc-400 font-bold text-sm max-w-lg mx-auto uppercase tracking-wide">
              {comparison.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-12 max-w-4xl mx-auto">
          {/* Before */}
          <div className="relative group">
            <div className="rounded-xl overflow-hidden border-2 border-zinc-800 aspect-square">
              {comparison.beforeImage ? (
                <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover grayscale opacity-50" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">Fake</div>
              )}
            </div>
            <div className="absolute top-2 left-2 bg-red-600 text-white font-black px-4 py-1.5 rounded text-[10px] uppercase italic shadow-2xl">
              ❌ {comparison.beforeLabel || 'Ordinary'}
            </div>
          </div>

          {/* After */}
          <div className="relative group">
            <div className="rounded-xl overflow-hidden border-2 border-yellow-400 aspect-square shadow-[0_0_30px_rgba(250,204,21,0.2)]">
              {comparison.afterImage ? (
                <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">Real</div>
              )}
            </div>
            <div className="absolute top-2 left-2 bg-yellow-400 text-black font-black px-4 py-1.5 rounded text-[10px] uppercase italic shadow-2xl">
              ✅ {comparison.afterLabel || 'Authentic'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
