import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function VideoFocusComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-24 bg-black overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
            {config.comparisonTitle || 'বাস্তবতা বনাম উন্নত অভিজ্ঞতা'}
          </h2>
          {comparison.description && (
            <p className="text-zinc-500 font-bold max-w-xl mx-auto uppercase tracking-widest text-xs">
              {comparison.description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Before */}
          <div className="relative group overflow-hidden rounded-[2.5rem]">
            <div className="aspect-[16/10] bg-zinc-900">
              {comparison.beforeImage ? (
                <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">সাধারণ</div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-bottom p-8">
               <div className="mt-auto">
                 <span className="text-white font-black uppercase text-xl italic tracking-tighter">
                   {comparison.beforeLabel || 'আগের'}
                 </span>
               </div>
            </div>
          </div>

          {/* After */}
          <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-red-600 shadow-2xl shadow-red-900/20">
            <div className="aspect-[16/10] bg-zinc-900">
              {comparison.afterImage ? (
                <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">সেরা</div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/80 to-transparent flex items-bottom p-8">
               <div className="mt-auto">
                 <span className="text-white font-black uppercase text-xl italic tracking-tighter">
                   {comparison.afterLabel || 'সেরা'}
                 </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
