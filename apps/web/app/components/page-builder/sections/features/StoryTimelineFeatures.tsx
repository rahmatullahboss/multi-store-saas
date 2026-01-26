import { motion } from 'framer-motion';
import type { BaseFeaturesProps } from './types';
import * as LucideIcons from 'lucide-react';

export function StoryTimelineFeatures({ title, features }: BaseFeaturesProps) {
  // Split features to create a zig-zag or timeline flow
  // Ideally, we want "Problem" on left, "Solution" on right, or a journey
  
  return (
    <section className="relative py-32 bg-stone-100 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
        />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
                    {title}
                </h2>
                <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full" />
            </motion.div>

            <div className="relative">
                {/* Central Line for Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 -translate-x-1/2" />

                <div className="space-y-24">
                {features?.map((feature: any, index: number) => {
                    const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.Star;
                    const isEven = index % 2 === 0;

                    return (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`relative flex items-center gap-8 md:gap-16 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col`}
                        >
                            {/* Content Side */}
                            <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'} text-center`}>
                                <h3 className="text-2xl font-bold text-stone-800 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-stone-600 leading-relaxed" style={{ fontFamily: '"Lato", sans-serif' }}>
                                    {feature.description}
                                </p>
                            </div>

                            {/* Center Icon */}
                            <div className="relative flex-shrink-0 z-10">
                                <div className="w-16 h-16 rounded-full bg-white border-4 border-amber-100 flex items-center justify-center shadow-xl text-amber-600">
                                    <Icon size={28} />
                                </div>
                                {/* Pulse Effect */}
                                <div className="absolute inset-0 rounded-full bg-amber-400 opacity-20 animate-ping" />
                            </div>

                            {/* Empty Side for Balance */}
                            <div className="flex-1 hidden md:block" />
                        </motion.div>
                    );
                })}
                </div>
            </div>
        </div>
    </section>
  );
}
