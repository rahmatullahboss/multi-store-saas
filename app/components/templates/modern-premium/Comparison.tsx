import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function ModernPremiumComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-32 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Seeing is <span className="text-indigo-600">believing.</span>
              </h2>
               {comparison.description && (
                <p className="text-slate-500 font-medium text-lg mt-6 tracking-tight">
                  {comparison.description}
                </p>
              )}
            </div>
            <div className="flex gap-4">
               <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-300">←</div>
               <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center text-slate-900">→</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Before */}
            <div className="relative group">
              <div className="rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200 aspect-[4/5] bg-white p-4">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden grayscale">
                  {comparison.beforeImage ? (
                    <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">Base</div>
                  )}
                </div>
              </div>
              <div className="absolute top-10 left-10 bg-slate-100 text-slate-400 font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] shadow-sm">
                {comparison.beforeLabel || 'Standard'}
              </div>
            </div>

            {/* After */}
            <div className="relative group">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-indigo-100 aspect-[4/5] bg-white p-4">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden shadow-2xl shadow-indigo-200/50">
                  {comparison.afterImage ? (
                    <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-200">Elite</div>
                  )}
                </div>
              </div>
              <div className="absolute top-10 left-10 bg-indigo-600 text-white font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] shadow-xl">
                {comparison.afterLabel || 'Pro'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
