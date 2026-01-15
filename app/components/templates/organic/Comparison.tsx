import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function OrganicComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-24 bg-emerald-50/20 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-4">
            {config.comparisonTitle || 'প্রকৃতির পার্থক্য দেখুন'}
          </h2>
          {comparison.description && (
            <p className="text-slate-500 font-medium max-w-xl mx-auto">
              {comparison.description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center">
          {/* Before */}
          <div className="relative group">
            <div className="rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white aspect-square">
              {comparison.beforeImage ? (
                <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Standard</div>
              )}
            </div>
            <div className="absolute top-6 left-6 bg-slate-800 text-white font-bold px-5 py-2 rounded-full text-xs uppercase shadow-xl">
              {comparison.beforeLabel || 'সাধারণ'}
            </div>
          </div>

          {/* After */}
          <div className="relative group">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-emerald-500 aspect-square">
              {comparison.afterImage ? (
                <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-300 font-bold uppercase tracking-widest">Organic</div>
              )}
            </div>
            <div className="absolute top-6 left-6 bg-emerald-600 text-white font-bold px-5 py-2 rounded-full text-xs uppercase shadow-xl">
              {comparison.afterLabel || 'অরগানিক'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
