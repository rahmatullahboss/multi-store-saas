import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function ShowcaseComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-none mb-6">
            {config.comparisonTitle || 'পার্থক্য নিজেই দেখুন'}
          </h2>
          {comparison.description && (
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              {comparison.description}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto items-stretch">
          {/* Before */}
          <div className="flex-1 relative group">
            <div className="rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white aspect-[3/4] h-full">
              {comparison.beforeImage ? (
                <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover grayscale" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">আগে</div>
              )}
            </div>
            <div className="absolute top-8 left-8 bg-black/80 backdrop-blur-md text-white font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em]">
              {comparison.beforeLabel || 'আগের সংস্করণ'}
            </div>
          </div>

          <div className="flex items-center justify-center -my-4 md:my-0 relative z-10 scale-150 md:scale-100">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl border border-gray-100 font-black italic">
               VS
             </div>
          </div>

          {/* After */}
          <div className="flex-1 relative group">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-rose-500 aspect-[3/4] h-full">
              {comparison.afterImage ? (
                <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-rose-50 flex items-center justify-center text-rose-200 font-bold uppercase tracking-widest text-xs">পরে</div>
              )}
            </div>
            <div className="absolute top-8 left-8 bg-rose-500 text-white font-bold px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] shadow-xl">
              {comparison.afterLabel || 'প্রিমিয়াম এডিশন'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
