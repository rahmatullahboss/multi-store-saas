import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function LuxeComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-24 bg-stone-950 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight mb-6">
            The <span className="text-amber-500 italic">Signature</span> Distinction
          </h2>
          {comparison.description && (
            <p className="text-stone-500 font-light text-sm max-w-lg mx-auto italic uppercase tracking-[0.2em]">
              {comparison.description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Before */}
          <div className="relative group">
            <div className="rounded-sm overflow-hidden border border-stone-800 aspect-[4/5] p-1 bg-stone-900">
              <div className="w-full h-full overflow-hidden grayscale">
                {comparison.beforeImage ? (
                  <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-stone-900 flex items-center justify-center text-stone-700">Ordinary</div>
                )}
              </div>
            </div>
            <div className="absolute top-8 left-8 bg-stone-900/80 backdrop-blur-md text-stone-500 font-bold px-6 py-2 rounded-sm text-[10px] uppercase tracking-[0.3em] border border-stone-800">
              {comparison.beforeLabel || 'Prestige'}
            </div>
          </div>

          {/* After */}
          <div className="relative group">
            <div className="rounded-sm overflow-hidden border border-amber-500/30 aspect-[4/5] p-1 bg-stone-900 shadow-2xl shadow-amber-900/10">
              <div className="w-full h-full overflow-hidden">
                {comparison.afterImage ? (
                  <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-stone-900 flex items-center justify-center text-stone-700">Artisan</div>
                )}
              </div>
            </div>
            <div className="absolute top-8 left-8 bg-amber-600 text-white font-bold px-6 py-2 rounded-sm text-[10px] uppercase tracking-[0.3em] shadow-2xl">
              {comparison.afterLabel || 'Masterpiece'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
