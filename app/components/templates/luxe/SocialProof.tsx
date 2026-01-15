import type { SectionProps } from '../_core/types';

export function LuxeSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-32 bg-stone-900 text-white relative overflow-hidden text-center">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-12">
          <div className="flex -space-x-4">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-20 h-20 rounded-full border-2 border-stone-800 bg-stone-900 overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
                 <img src={`https://i.pravatar.cc/100?u=luxe_${i}`} alt="Connoisseur" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-7xl font-serif italic tracking-tight mb-8">
              The choice of <span className="text-amber-500 font-sans font-black">{socialProof.count.toLocaleString()}</span> connoisseurs.
            </h2>
            <p className="text-xl font-light text-stone-400 leading-relaxed max-w-2xl mx-auto italic">
              "{socialProof.text}"
            </p>
            <div className="h-px w-24 bg-amber-800 mx-auto mt-12 mb-8"></div>
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-xs text-amber-500 tracking-[0.3em]">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
