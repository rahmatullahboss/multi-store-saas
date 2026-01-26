import { motion } from 'framer-motion';
import { Check, X, Zap, Clock, TrendingUp, Smile, Cpu } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';

export function AISocialProofSection() {
  const { t } = useTranslation();
  
  const comparisonData = [
    { name: 'Shopify', visitor: false, merchant: false, customer: false },
    { name: 'WooCommerce', visitor: false, merchant: false, customer: false },
    { name: 'Local Platforms', visitor: false, merchant: false, customer: false },
    { name: 'OZZYL', visitor: true, merchant: true, customer: true, highlight: true },
  ];

  const benefits = [
    {
      icon: Zap,
      title: t('landingSocialProof_saveStaffCost'),
      sub: t('landingSocialProof_noSupportNeeded'),
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10'
    },
    {
      icon: Clock,
      title: t('landingSocialProof_available247'),
      sub: t('landingSocialProof_someoneIsThere'),
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      icon: TrendingUp,
      title: t('landingSocialProof_scaleNoHiring'),
      sub: t('landingSocialProof_handle1000Customers'),
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      icon: Smile,
      title: t('landingSocialProof_happyCustomers'),
      sub: t('landingSocialProof_instantResponseTrust'),
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      <div className="absolute inset-0 bg-emerald-900/10 opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-4">
            {t('landingSocialProof_firstInBD')}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t('landingSocialProof_title')}
          </h2>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-20 overflow-x-auto">
           <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden min-w-[600px]">
             {/* Header Row */}
             <div className="grid grid-cols-4 p-4 border-b border-white/10 bg-white/5 text-sm font-bold text-white/60">
                <div className="pl-4">{t('landingSocialProof_platformCol')}</div>
                <div className="text-center">{t('landingShowcase_visitorTitle')}</div>
                <div className="text-center">{t('landingShowcase_merchantTitle')}</div>
                <div className="text-center">{t('landingShowcase_customerTitle')}</div>
             </div>
             
             {/* Data Rows */}
             {comparisonData.map((item, i) => (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   key={i} 
                   className={`grid grid-cols-4 p-4 items-center border-b border-white/5 last:border-0 ${item.highlight ? 'bg-emerald-900/20' : 'hover:bg-white/5'}`}
                >
                   <div className={`pl-4 font-bold ${item.highlight ? 'text-emerald-400 text-lg flex items-center gap-2' : 'text-white/80'}`}>
                      {item.highlight && <span className="text-xl">🏆</span>}
                      {item.name}
                      {item.highlight && <span className="text-xs font-normal text-emerald-500/70 ml-2 hidden sm:inline">{t('landingSocialProof_allThree')}</span>}
                   </div>
                   <div className="text-center flex justify-center">{item.visitor ? <Check className="w-6 h-6 text-emerald-400" /> : <X className="w-5 h-5 text-white/20" />}</div>
                   <div className="text-center flex justify-center">{item.merchant ? <Check className="w-6 h-6 text-emerald-400" /> : <X className="w-5 h-5 text-white/20" />}</div>
                   <div className="text-center flex justify-center">{item.customer ? <Check className="w-6 h-6 text-emerald-400" /> : <X className="w-5 h-5 text-white/20" />}</div>
                </motion.div>
             ))}
           </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
           {benefits.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors group"
              >
                 <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                 <p className="text-sm text-white/60">{item.sub}</p>
              </motion.div>
           ))}
        </div>

        {/* Powered By */}
        <div className="text-center">
           <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-6">{t('landingSocialProof_poweredBy')}</p>
           <div className="inline-flex items-center gap-8 justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Using text representations/icons as placeholders for logos to keep it clean */}
              <div className="flex items-center gap-2">
                 <Cpu className="w-5 h-5" /> <span className="font-bold text-white">Google</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-2">
                 <Cpu className="w-5 h-5" /> <span className="font-bold text-white">Xiaomi</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-2">
                 <Zap className="w-5 h-5" /> <span className="font-bold text-white">{t('landingSocialProof_advancedNLP')}</span>
              </div>
           </div>
           <p className="text-emerald-500/50 text-xs mt-4">{t('landingSocialProof_bestTech')}</p>
        </div>

      </div>
    </section>
  );
}
