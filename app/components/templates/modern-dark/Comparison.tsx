import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function ModernDarkComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-24 bg-zinc-950 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
          <div className="md:w-1/3 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 italic leading-none">
              {config.comparisonTitle || 'সেরা আপডেট দেখুন'}
            </h2>
            <div className="h-1.5 w-24 bg-orange-500 mb-8 rounded-full hidden md:block"></div>
            {comparison.description && (
              <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                {comparison.description}
              </p>
            )}
          </div>

          <div className="md:w-2/3 grid grid-cols-2 gap-4 md:gap-8">
            {/* Before */}
            <div className="relative group">
              <div className="rounded-2xl overflow-hidden grayscale border border-zinc-800 aspect-[3/4]">
                {comparison.beforeImage ? (
                  <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">Old</div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/90 backdrop-blur-sm text-zinc-400 font-bold px-4 py-2 rounded-xl uppercase text-[10px] tracking-widest text-center border border-zinc-800">
                {comparison.beforeLabel || 'আগে'}
              </div>
            </div>

            {/* After */}
            <div className="relative group">
              <div className="rounded-2xl overflow-hidden border-2 border-orange-500 aspect-[3/4] shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                {comparison.afterImage ? (
                  <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">New</div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-orange-500 text-white font-black px-4 py-2 rounded-xl uppercase text-[10px] tracking-widest text-center shadow-2xl">
                {comparison.afterLabel || 'পরে'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
