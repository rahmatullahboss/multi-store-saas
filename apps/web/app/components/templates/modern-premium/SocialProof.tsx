import type { SectionProps } from '../_core/types';

export function ModernPremiumSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-32 bg-white text-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="w-16 h-16 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm hover:scale-110 transition-transform cursor-pointer hover:z-20">
                   <img src={`https://i.pravatar.cc/100?u=premium_${i}`} alt="User" className="w-full h-full object-cover" />
                 </div>
               ))}
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
               +{socialProof.count.toLocaleString()}
            </div>
          </div>
          
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Loved by a <span className="text-indigo-600">growing</span> community.
            </h2>
            <p className="text-2xl font-medium text-slate-400 leading-relaxed max-w-3xl mx-auto tracking-tight italic">
              — "{socialProof.text}"
            </p>
            <div className="flex gap-1.5 mt-12 justify-center">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-indigo-500">★</span>
              ))}
            </div>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300">Verified Client Reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}
