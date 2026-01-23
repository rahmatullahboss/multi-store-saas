import type { SectionProps } from '../_core/types';

export function PremiumBDSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-20 bg-gray-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex -space-x-4">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-16 h-16 rounded-full border-4 border-gray-950 bg-gray-800 flex items-center justify-center overflow-hidden">
                 <img src={`https://i.pravatar.cc/64?u=${i}`} alt="Avatar" className="w-full h-full object-cover" />
               </div>
             ))}
             <div className="w-16 h-16 rounded-full border-4 border-gray-950 bg-orange-500 flex items-center justify-center text-xs font-black italic">
               +{socialProof.count}
             </div>
          </div>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-6">
          <span className="text-orange-500">{socialProof.count}+</span> {socialProof.text}
        </h2>
        
        <div className="flex justify-center gap-1">
          {[1,2,3,4,5].map(i => (
            <span key={i} className="text-3xl text-orange-500">★</span>
          ))}
        </div>
        <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Rated 4.9/5 by our verify customers</p>
      </div>
    </section>
  );
}
