import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function MinimalLightComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-24 bg-stone-50/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-light text-stone-900 tracking-tight mb-4">
              The Evolution of <span className="italic font-serif">Consistency</span>
            </h2>
            {comparison.description && (
              <p className="text-stone-500 font-light text-sm max-w-lg mx-auto">
                {comparison.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-12">
            {/* Before */}
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden grayscale border border-stone-200 bg-white aspect-[4/5] p-2">
                <div className="w-full h-full rounded-xl overflow-hidden">
                  {comparison.beforeImage ? (
                    <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300">Before</div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {comparison.beforeLabel || 'Previous'}
                </span>
              </div>
            </div>

            {/* After */}
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden border border-stone-800 bg-white aspect-[4/5] p-2 shadow-2xl shadow-stone-200">
                <div className="w-full h-full rounded-xl overflow-hidden">
                  {comparison.afterImage ? (
                    <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300">After</div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">
                  {comparison.afterLabel || 'Refined'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
