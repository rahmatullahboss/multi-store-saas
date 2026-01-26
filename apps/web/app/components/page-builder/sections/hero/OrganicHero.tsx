import { motion } from 'framer-motion';
import { BaseHeroProps } from './types';

// SVG Assets for organic feel
const LeafIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M21.0002 3C21.0002 3 21.0002 12 14.0002 17C7.00017 22 2.00017 21 2.00017 21C2.00017 21 4.00017 19 8.00017 14C12.0002 9 12.0002 3 12.0002 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3C12 3 13 8 18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function OrganicHero({ 
  headline, subheadline, badgeText 
}: BaseHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#fefce8] pt-20 pb-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%233f6212\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} 
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            {badgeText && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ecfccb] text-[#3f6212] text-sm font-bold tracking-wide mb-6">
                <LeafIcon className="w-4 h-4" />
                {badgeText}
              </span>
            )}
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#3f6212] leading-[1.1] mb-6">
              {headline}
            </h1>
            
            <p className="text-xl text-[#3f6212]/80 leading-relaxed mb-10 max-w-lg">
              {subheadline}
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  const orderSection = document.getElementById('order-form');
                  orderSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-12 py-5 bg-[#3f6212] text-[#fefce8] rounded-tl-[2rem] rounded-br-[2rem] font-bold text-xl shadow-xl shadow-[#3f6212]/20 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 w-full md:w-auto"
              >
                Order Now
              </button>
            </div>
          </motion.div>

          {/* Right Image / Blob */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Organic Blob SVG behind image */}
            <div className="absolute inset-0 bg-[#d9f99d] blur-3xl opacity-30 transform scale-110 rounded-full animate-pulse" />
            
            <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-[#3f6212]/10 border-8 border-white/50 bg-[#e7e5e4] flex items-center justify-center">
              {/* Placeholder for Product Image */}
               <img 
                 src="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                 alt="Organic Product" 
                 className="w-full h-full object-cover"
               />
               
               {/* Floating elements */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute top-10 right-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40"
               >
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ecfccb] flex items-center justify-center text-[#3f6212]">
                      <LeafIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[#3f6212]/60 font-bold uppercase tracking-wider">Natural</p>
                      <p className="text-sm font-bold text-[#3f6212]">100% Organic</p>
                    </div>
                 </div>
               </motion.div>
            </div>
          </motion.div>
        
        </div>
      </div>

      {/* Wave Separator - Premium Multi-Layered organic transition */}
      <div className="absolute bottom-[-2px] left-0 w-full overflow-hidden leading-[0] z-20">
        <svg className="relative block w-[calc(100%+1.3px)] h-[120px] md:h-[160px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            {/* Layer 1 - Opacity 0.25 */}
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#FFFFFF" opacity=".25"></path>
            {/* Layer 2 - Opacity 0.5 */}
            <path d="M0,0V15.81C13,36.92,54.55,50.1,82,58.5c51.27,15.7,106.8,11.51,162.2,4.8,96.39-11.69,173.35-46.86,269-50.6,90.9-3.56,163.5,23.33,247,46.85,73.49,20.69,150.3,31.7,227.1,13.36,66.6-15.89,142.3-46.7,212.7-52.6V0Z" fill="#FFFFFF" opacity=".5"></path>
            {/* Layer 3 - Solid White (Main Transition) */}
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#FFFFFF"></path>
            {/* Bottom Fill ensuring no gaps */}
            <rect x="0" y="80" width="1200" height="40" fill="#FFFFFF"></rect>
        </svg>
      </div>
    </section>
  );
}
