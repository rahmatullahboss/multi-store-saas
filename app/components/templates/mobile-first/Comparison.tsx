import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function MobileFirstComparison({ config }: SectionProps) {
  const comparison = config.comparison;

  if (!comparison || (!comparison.beforeImage && !comparison.afterImage)) return null;

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">পার্থক্য দেখুন</h2>
        </div>

        <div className="flex flex-col gap-6 max-w-sm mx-auto">
          {/* Before */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-md border-2 border-gray-100 aspect-video">
              {comparison.beforeImage ? (
                <OptimizedImage src={comparison.beforeImage} alt="Before" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Before</div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-gray-900 text-white font-black px-4 py-1.5 rounded-full text-[10px] uppercase shadow-xl">
              {comparison.beforeLabel || 'অর্ডিনারি'}
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
             <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
               VS
             </div>
          </div>

          {/* After */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-500 aspect-video">
              {comparison.afterImage ? (
                <OptimizedImage src={comparison.afterImage} alt="After" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-200 font-bold uppercase tracking-widest text-[10px]">After</div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-blue-500 text-white font-black px-4 py-1.5 rounded-full text-[10px] uppercase shadow-xl">
              {comparison.afterLabel || 'প্রিমিয়াম'}
            </div>
          </div>
        </div>

        {comparison.description && (
          <p className="text-gray-500 font-bold text-center mt-8 px-4 text-sm">
            {comparison.description}
          </p>
        )}
      </div>
    </section>
  );
}
