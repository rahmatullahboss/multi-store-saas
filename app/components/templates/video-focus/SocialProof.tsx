import type { SectionProps } from '../_core/types';

export function VideoFocusSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-24 bg-zinc-900 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center gap-10">
          <div className="flex -space-x-5">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="w-20 h-20 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-2xl hover:scale-110 transition-transform cursor-pointer hover:z-20 grayscale hover:grayscale-0">
                 <img src={`https://i.pravatar.cc/100?u=vid_${i}`} alt="Viewer" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none mb-6">
              Join the <span className="text-red-600">{socialProof.count.toLocaleString()}+</span> squad.
            </h2>
            <p className="text-2xl font-bold text-zinc-500 uppercase tracking-tight italic">
              "{socialProof.text}"
            </p>
            <div className="flex gap-1.5 mt-10 justify-center">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-red-600 text-2xl">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
