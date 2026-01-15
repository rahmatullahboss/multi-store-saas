import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function PremiumBDComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 underline decoration-orange-500 decoration-4 underline-offset-8">
            পার্থক্য নিজেই দেখুন
          </h2>
          {comparison.description && (
            <p className="text-gray-600 font-bold max-w-2xl mx-auto mt-6">
              {comparison.description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before */}
          <div className="relative group">
            <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-gray-100 aspect-square">
              {comparison.beforeImage ? (
                <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-red-600 text-white font-black px-6 py-2 rounded-full uppercase italic tracking-widest text-sm shadow-xl">
              {comparison.beforeLabel || 'Before'}
            </div>
          </div>

          {/* After */}
          <div className="relative group">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-500 aspect-square">
              {comparison.afterImage ? (
                <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover shadow-[0_0_40px_rgba(249,115,22,0.3)]" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-orange-500 text-white font-black px-6 py-2 rounded-full uppercase italic tracking-widest text-sm shadow-xl">
              {comparison.afterLabel || 'After'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
