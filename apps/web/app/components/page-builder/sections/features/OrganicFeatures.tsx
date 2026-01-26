import { motion } from 'framer-motion';
import { FeaturesVariantProps } from './types';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as Record<string, any>)[name] || LucideIcons.Star;
  return <Icon className={className} />;
};

export function OrganicFeatures({ title, features }: FeaturesVariantProps) {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3f6212]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#a3e635]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-block"
          >
            <span className="px-4 py-1 rounded-full bg-[#ecfccb] text-[#3f6212] text-sm font-bold tracking-wide mb-4 inline-block">
              Why Choose Us
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3f6212] mb-4">
              {title}
            </h2>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative p-8 rounded-[2rem] bg-white/40 backdrop-blur-md border border-white/60 shadow-xl shadow-[#3f6212]/5 hover:shadow-2xl hover:bg-white/60 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#ecfccb] flex items-center justify-center text-[#3f6212] mb-6 group-hover:scale-110 transition-transform duration-300">
                <DynamicIcon name={feature.icon} className="w-8 h-8" />
              </div>
              
              <h3 className="font-serif text-2xl font-bold text-[#3f6212] mb-3">
                {feature.title}
              </h3>
              
              <p className="text-[#3f6212]/70 leading-relaxed group-hover:text-[#3f6212]/90">
                {feature.description}
              </p>
              
              {/* Decorative corner */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <LucideIcons.ArrowUpRight className="w-5 h-5 text-[#3f6212]/40" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Wave - Transition to next section (White -> White for Video) */}
      {/* Bottom Wave - Transition to next section (White -> Cream for Video) */}
      <div className="absolute bottom-[-2px] left-0 w-full overflow-hidden leading-[0] z-20">
        <svg className="relative block w-[calc(100%+1.3px)] h-[120px] md:h-[160px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            {/* Background Rect (Next Section Color - Cream) */}
            <rect width="100%" height="100%" fill="#fefce8" />
            
            {/* Layer 3 - Solid (Current Section Color - White) */}
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff"></path>
        </svg>
      </div>
    </section>
  );
}
