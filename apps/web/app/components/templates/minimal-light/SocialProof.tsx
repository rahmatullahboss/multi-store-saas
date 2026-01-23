import type { SectionProps } from '../_core/types';

export function MinimalLightSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-24 bg-white text-stone-900 border-y border-stone-100">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex -space-x-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-16 h-16 rounded-full border-4 border-white bg-stone-100 overflow-hidden grayscale">
                 <img src={`https://i.pravatar.cc/100?u=light_${i}`} alt="User" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              Join <span className="font-serif italic">{socialProof.count.toLocaleString()}</span> others.
            </h2>
            <p className="text-stone-500 text-lg font-light leading-relaxed italic">
              — {socialProof.text}
            </p>
            <div className="flex gap-1 mt-6 justify-center">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-stone-300 text-sm italic">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
