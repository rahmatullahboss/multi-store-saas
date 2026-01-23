import type { SectionProps } from '../_core/types';

export function FlashSaleSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-20 bg-red-600 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-10 opacity-20">
         <div className="text-[12rem] font-black italic tracking-tighter leading-none select-none">HOT</div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex -space-x-4">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-16 h-16 rounded-full border-4 border-red-500 bg-white overflow-hidden shadow-2xl">
                 <img src={`https://i.pravatar.cc/100?u=sale_${i}`} alt="User" className="w-full h-full object-cover" />
               </div>
             ))}
             <div className="w-16 h-16 rounded-full border-4 border-red-500 bg-yellow-400 flex items-center justify-center text-black font-black italic text-xs shadow-2xl">
               +{socialProof.count}
             </div>
          </div>
          
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2 leading-none">
              <span className="bg-yellow-400 text-black px-4 rotate-2 inline-block shadow-2xl">{socialProof.count}+ People</span> Reached
            </h2>
            <p className="text-xl font-black uppercase tracking-tight text-white/90">
              {socialProof.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
