import type { SectionProps } from '../_core/types';

export function ShowcaseSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-32 bg-white text-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          <div className="flex -space-x-6">
             {[1,2,3,4,5,6,7].map(i => (
               <div key={i} className="w-20 h-20 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform cursor-pointer hover:z-20">
                 <img src={`https://i.pravatar.cc/100?u=show_${i}`} alt="Happy Collector" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-gray-900 mb-8 leading-none">
              Trusted by <span className="text-rose-500">{socialProof.count.toLocaleString()}</span> collectors worldwide.
            </h2>
            <div className="h-1.5 w-24 bg-rose-500 mx-auto rounded-full mb-10"></div>
            <p className="text-2xl font-medium text-gray-400 leading-relaxed max-w-2xl mx-auto italic">
              "{socialProof.text}"
            </p>
            <div className="flex gap-2.5 mt-12 justify-center">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-3xl text-yellow-400">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
