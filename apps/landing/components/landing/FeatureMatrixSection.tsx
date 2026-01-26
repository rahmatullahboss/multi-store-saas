import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { Check, ChevronDown, ChevronUp, Clock } from 'lucide-react';

export function FeatureMatrixSection() {
  const { lang } = useTranslation();
  const [openCategory, setOpenCategory] = useState<string | null>('store_setup');

  const TEXT = {
    en: {
      title: 'Complete Feature Matrix',
      subtitle: 'Everything included in the platform.',
      available: 'Available Now',
      soon: 'Coming Soon',
      categories: [
        {
          id: 'store_setup',
          title: 'Store Setup & Infrastructure',
          items: [
            { text: 'Multi-store Architecture', status: 'available' },
            { text: 'Custom Subdomain', status: 'available' },
            { text: 'Custom Domain', status: 'available' },
            { text: 'Cloudflare CDN & Security', status: 'available' }
          ]
        },
        {
          id: 'product_mgmt',
          title: 'Product Management',
          items: [
            { text: 'Unlimited Products', status: 'available' },
            { text: 'Product Variants (Size/Color)', status: 'available' },
            { text: 'Image Upload (R2 Storage)', status: 'available' },
            { text: 'CSV Import/Export', status: 'available' },
            { text: 'Inventory Dashboard', status: 'available' },
            { text: 'Low Stock Alerts', status: 'available' }
          ]
        },
        {
          id: 'payments',
          title: 'Payments & Checkout',
          items: [
            { text: 'bKash Integration', status: 'available' },
            { text: 'Nagad Integration', status: 'available' },
            { text: 'Stripe (International Cards)', status: 'available' },
            { text: 'Payment Status Tracking', status: 'available' }
          ]
        },
        {
          id: 'marketing',
          title: 'Marketing & Growth',
          items: [
            { text: 'Discount Codes', status: 'available' },
            { text: 'Abandoned Cart Recovery', status: 'available' },
            { text: 'A/B Testing', status: 'soon' },
            { text: 'Loyalty & Rewards', status: 'soon' }
          ]
        }
      ]
    },
    bn: {
      title: 'সম্পূর্ণ ফিচার লিস্ট',
      subtitle: 'প্ল্যাটফর্মে যা যা পাচ্ছেন এক নজরে।',
      available: 'এখনই ব্যবহারযোগ্য',
      soon: 'খুব শীঘ্রই আসছে',
      categories: [
        {
          id: 'store_setup',
          title: 'স্টোর সেটআপ ও ইনফ্রাস্ট্রাকচার',
          items: [
            { text: 'মাল্টি-স্টোর আর্কিটেকচার', status: 'available' },
            { text: 'কাস্টম সাবডোমেইন', status: 'available' },
            { text: 'কাস্টম ডোমেইন', status: 'available' },
            { text: 'ক্লাউডফ্লেয়ার সিডিএন ও সিকিউরিটি', status: 'available' }
          ]
        },
        {
          id: 'product_mgmt',
          title: 'প্রোডাক্ট ম্যানেজমেন্ট',
          items: [
            { text: 'আনলিমিটেড প্রোডাক্ট', status: 'available' },
            { text: 'প্রোডাক্ট ভেরিয়েন্ট (সাইজ/কালার)', status: 'available' },
            { text: 'ইমেজ আপলোড (R2 স্টোরেজ)', status: 'available' },
            { text: 'CSV ইম্পোর্ট/এক্সপোর্ট', status: 'available' },
            { text: 'ইনভেন্টরি ড্যাশবোর্ড', status: 'available' },
            { text: 'লো-স্টক অ্যালার্ট', status: 'available' }
          ]
        },
        {
          id: 'payments',
          title: 'পেমেন্ট ও চেকআউট',
          items: [
            { text: 'বিকাশ ইন্টিগ্রেশন', status: 'available' },
            { text: 'নগদ ইন্টিগ্রেশন', status: 'available' },
            { text: 'স্ট্রাইপ (ইন্টারন্যাশনাল কার্ড)', status: 'available' },
            { text: 'পেমেন্ট স্ট্যাটাস ট্র্যাকিং', status: 'available' }
          ]
        },
        {
          id: 'marketing',
          title: 'মার্কেটিং ও গ্রোথ',
          items: [
            { text: 'ডিসকাউন্ট কোড', status: 'available' },
            { text: 'অ্যাবান্ডন্ড কার্ট রিকভারি', status: 'available' },
            { text: 'A/B টেস্টিং', status: 'soon' },
            { text: 'লয়ালটি ও রিওয়ার্ডস', status: 'soon' }
          ]
        }
      ]
    }
  }[lang === 'bn' ? 'bn' : 'en'];

  return (
    <section className="py-24 bg-[#0A0F0D] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-relaxed py-2">{TEXT.title}</h2>
          <p className="text-white/60 text-lg">{TEXT.subtitle}</p>
        </div>

        <div className="space-y-4">
          {TEXT.categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]"
            >
              <button
                onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-xl font-semibold text-white">{cat.title}</span>
                {openCategory === cat.id ? (
                  <ChevronUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/50" />
                )}
              </button>

              <AnimatePresence>
                {openCategory === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-6 grid md:grid-cols-2 gap-4">
                      {cat.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {item.status === 'available' ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                          )}
                          <span className={`${item.status === 'soon' ? 'text-white/50' : 'text-white/80'}`}>
                            {item.text}
                          </span>
                          {item.status === 'soon' && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded ml-auto">
                              {TEXT.soon}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
