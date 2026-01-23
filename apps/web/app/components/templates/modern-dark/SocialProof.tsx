import type { SectionProps } from '../_core/types';

export function ModernDarkSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-24 bg-zinc-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 text-center md:text-left">
          <div className="flex -space-x-5">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="w-20 h-20 rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer hover:scale-110 hover:z-20">
                 <img src={`https://i.pravatar.cc/100?u=dark_${i}`} alt="User" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          
          <div>
            <div className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-2 leading-none">
              <span className="text-orange-500">{socialProof.count.toLocaleString()}+</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-zinc-400 uppercase tracking-tight">
              {socialProof.text}
            </p>
            <div className="flex gap-1 mt-4 justify-center md:justify-start">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-xl text-orange-500">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
    </section>
  );
}
