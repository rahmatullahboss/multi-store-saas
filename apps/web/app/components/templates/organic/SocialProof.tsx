import type { SectionProps } from '../_core/types';

export function OrganicSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-24 bg-emerald-600 text-white overflow-hidden relative">
       {/* Leaf patterns */}
      <div className="absolute top-0 left-0 p-8 opacity-10 animate-pulse">🍃</div>
      <div className="absolute bottom-0 right-0 p-8 opacity-10 rotate-180">🍃</div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center gap-10">
          <div className="flex -space-x-4">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="w-20 h-20 rounded-full border-4 border-emerald-500 bg-white overflow-hidden shadow-xl hover:scale-110 transition-transform cursor-pointer hover:z-20">
                 <img src={`https://i.pravatar.cc/100?u=org_${i}`} alt="Happy Customer" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-emerald-200">{socialProof.count.toLocaleString()}+</span> earth-loving souls have joined us.
            </h2>
            <p className="text-xl font-medium text-emerald-50 leading-relaxed italic font-serif">
              "{socialProof.text}"
            </p>
            <div className="flex gap-1.5 mt-10 justify-center">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-2xl text-yellow-300">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
