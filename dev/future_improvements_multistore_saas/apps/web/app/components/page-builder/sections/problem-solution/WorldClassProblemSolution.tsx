import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ProblemSolutionProps } from './types';

export function WorldClassProblemSolution({ 
  problemTitle, 
  problems = [], 
  solutionTitle, 
  solutions = [],
  // variant unused
}: ProblemSolutionProps) {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    
                    {/* Problem Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-red-50/50 p-10 rounded-3xl border border-red-100"
                    >
                        <h3 className="text-3xl font-bold text-stone-900 mb-8 flex items-center gap-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                            <span className="text-red-500 text-4xl">😔</span>
                            {problemTitle || 'The Struggle'}
                        </h3>
                        <div className="space-y-6">
                            {problems.map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <XCircle className="text-red-400 mt-1 flex-shrink-0" size={24} />
                                    <p className="text-lg text-stone-600 font-medium">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Solution Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-emerald-50/50 p-10 rounded-3xl border border-emerald-100 relative"
                    >
                         <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-60" />
                        
                        <h3 className="text-3xl font-bold text-stone-900 mb-8 flex items-center gap-3 relative" style={{ fontFamily: '"Playfair Display", serif' }}>
                            <span className="text-emerald-500 text-4xl">✨</span>
                            {solutionTitle || 'The Solution'}
                        </h3>
                        <div className="space-y-6 relative">
                            {solutions.map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <CheckCircle2 className="text-emerald-500 mt-1 flex-shrink-0" size={24} />
                                    <p className="text-lg text-stone-800 font-bold">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
