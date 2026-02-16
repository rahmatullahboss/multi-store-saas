import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import type { GuaranteeProps } from './types';

export function WorldClassGuarantee({ title, text, badgeLabel }: GuaranteeProps) {
  return (
    <section className="py-24 bg-stone-50 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-amber-100 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-stone-200 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block relative mb-10"
            >
                {/* Rotating badge effect */}
                <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg mx-auto">
                    <ShieldCheck size={48} className="text-white" />
                </div>
            </motion.div>

            <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-stone-900 mb-6"
                style={{ fontFamily: '"Playfair Display", serif' }}
            >
                {title || 'Satisfaction Guaranteed'}
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto mb-10"
            >
                {text}
            </motion.p>
            
            {badgeLabel && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full shadow-sm text-sm font-bold text-amber-800 tracking-wide uppercase"
                >
                   <span>★</span> {badgeLabel} <span>★</span>
                </motion.div>
            )}
        </div>
    </section>
  );
}
