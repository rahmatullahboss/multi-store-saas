import type { SectionProps } from '../_core/types';

export function MobileFirstSocialProof({ config }: SectionProps) {
  const socialProof = config.socialProof;

  if (!socialProof || (!socialProof.count && !socialProof.text)) return null;

  return (
    <section className="py-16 bg-blue-600 text-white overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex -space-x-3">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-14 h-14 rounded-full border-2 border-white bg-blue-500 overflow-hidden shadow-lg">
                 <img src={`https://i.pravatar.cc/100?u=mob_${i}`} alt="Happy User" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          
          <div className="max-w-xs">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              <span className="text-yellow-400">{socialProof.count.toLocaleString()}+</span> জন ব্যবহারকারী
            </h2>
            <p className="text-sm font-bold text-blue-50 leading-relaxed italic">
              "{socialProof.text}"
            </p>
            <div className="flex gap-1 mt-6 justify-center">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-yellow-300">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
