import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '~/contexts/LanguageContext';
import { Shirt, Utensils, Laptop, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Link } from '@remix-run/react';

export function UseCaseScenariosSection() {
  const { lang } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const TEXT = {
    en: {
      title: 'Perfect for Any Industry',
      subtitle: 'Tailored features for your specific business needs.',
      cta: 'View Template',
      cases: [
        {
          id: 'fashion',
          title: 'Fashion & Clothing',
          icon: Shirt,
          desc: 'Manage sizes, colors, and seasonal collections effortlessly.',
          features: ['Size/Color Variants', 'Multiple Product Images', 'Seasonal Discount Codes'],
          color: 'from-pink-500 to-rose-500'
        },
        {
          id: 'food',
          title: 'Food & Restaurant',
          icon: Utensils,
          desc: 'Quick ordering and zone-based delivery for hungry customers.',
          features: ['Menu Categories', 'Quick Add to Cart', 'Zone-based Delivery'],
          color: 'from-orange-500 to-amber-500'
        },
        {
          id: 'digital',
          title: 'Digital Products',
          icon: Laptop,
          desc: 'Sell courses, ebooks, and software with instant delivery.',
          features: ['One-page Landing Pages', 'International Payments', 'High-converting Templates'],
          color: 'from-blue-500 to-cyan-500'
        },
        {
          id: 'general',
          title: 'General E-commerce',
          icon: ShoppingBag,
          desc: 'Scalable solution for electronics, gadgets, and more.',
          features: ['Multiple Categories', 'Inventory Management', 'Customer Segmentation'],
          color: 'from-emerald-500 to-teal-500'
        }
      ]
    },
    bn: {
      title: 'যেকোনো বিজনেসের জন্য',
      subtitle: 'আপনার ব্যবসার ধরণ অনুযায়ী বিশেষ ফিচার।',
      cta: 'টেমপ্লেট দেখুন',
      cases: [
        {
          id: 'fashion',
          title: 'ফ্যাশন ও ক্লোদিং',
          icon: Shirt,
          desc: 'সাইজ, কালার এবং সিজনাল কালেকশন ম্যানেজ করুন সহজে।',
          features: ['সাইজ/কালার ভেরিয়েন্ট', 'মাল্টিপল ছবি', 'সিজনাল ডিসকাউন্ট কোড'],
          color: 'from-pink-500 to-rose-500'
        },
        {
          id: 'food',
          title: 'ফুড ও রেস্টুরেন্ট',
          icon: Utensils,
          desc: 'ক্ষুদার্থ কাস্টমারদের জন্য দ্রুত অর্ডার এবং জোন-ভিত্তিক ডেলিভারি।',
          features: ['মেনু ক্যাটাগরি', 'কুইক অ্যাড টু কার্ট', 'জোন-ভিত্তিক ডেলিভারি চার্জ'],
          color: 'from-orange-500 to-amber-500'
        },
        {
          id: 'digital',
          title: 'ডিজিটাল প্রোডাক্ট',
          icon: Laptop,
          desc: 'কোর্স, ইবুক এবং সফটওয়্যার বিক্রি করুন ইন্সট্যান্ট ডেলিভারিতে।',
          features: ['এক-পেজের ল্যান্ডিং পেজ', 'ইন্টারন্যাশনাল পেমেন্ট', 'কনভার্সন ফোকাসড টেমপ্লেট'],
          color: 'from-blue-500 to-cyan-500'
        },
        {
          id: 'general',
          title: 'জেনারেল ই-কমার্স',
          icon: ShoppingBag,
          desc: 'ইলেকট্রনিক্স, গ্যাজেট সহ সব ধরণের পণ্যের জন্য স্কেলেবল সমাধান।',
          features: ['মাল্টিপল ক্যাটাগরি', 'ইনভেন্টরি ম্যানেজমেন্ট', 'কাস্টমার সেগমেন্টেশন'],
          color: 'from-emerald-500 to-teal-500'
        }
      ]
    }
  }[lang === 'bn' ? 'bn' : 'en'];

  return (
    <section ref={containerRef} className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div style={{ opacity }} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{TEXT.title}</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">{TEXT.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEXT.cases.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-2xl p-6 transition-colors duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-white/60 text-sm mb-6 min-h-[40px]">
                {item.desc}
              </p>

              <ul className="space-y-3 mb-8">
                {item.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to={`/templates?category=${item.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white transition-colors group-hover:translate-x-1 duration-300"
              >
                {TEXT.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
