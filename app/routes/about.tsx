/**
 * About Page
 * 
 * Real company info with founder story and mission.
 * Premium dark theme matching landing page.
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, Heart, Rocket, Users, Globe, Target, Zap, ArrowRight, Check, Sparkles, MessageCircle, Phone, Mail } from 'lucide-react';
import { useLanguage } from '~/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MarketingFooter } from '~/components/MarketingFooter';

export const meta: MetaFunction = () => [
  { title: 'আমাদের সম্পর্কে - Multi-Store | বাংলাদেশী ই-কমার্স প্ল্যাটফর্ম' },
  { name: 'description', content: 'Multi-Store - বাংলাদেশী উদ্যোক্তাদের জন্য তৈরি সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। আমাদের মিশন ও ভিশন জানুন।' },
];

export default function AboutPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white hidden sm:block">
                Multi-Store
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className="hidden sm:block text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
              >
                হোমে ফিরে যান
              </Link>
              <Link 
                to="/auth/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25"
              >
                ফ্রি শুরু করুন
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#006A4E]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Newsreader, Georgia, serif' }}
          >
            আমাদের সম্পর্কে
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-white/60 max-w-2xl mx-auto"
          >
            বাংলাদেশী ই-কমার্স উদ্যোক্তাদের শক্তিশালী করছি
          </motion.p>
        </div>
      </section>

      {/* Founder Section - Real Info */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0, 106, 78, 0.05))',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: 'radial-gradient(#006A4E 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
              {/* Founder Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative flex-shrink-0"
              >
                <div
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden"
                  style={{
                    border: '3px solid rgba(0, 106, 78, 0.4)',
                    boxShadow: '0 0 40px rgba(0, 106, 78, 0.2)',
                  }}
                >
                  <img
                    src="/images/founder.jpg"
                    alt="Rahmatullah Zisan - Founder"
                    className="w-full h-full object-cover"
                  />
                  {/* Verified Badge */}
                  <div
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #006A4E, #00875F)',
                      boxShadow: '0 4px 12px rgba(0, 106, 78, 0.5)',
                    }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
                {/* Name & Title */}
                <div className="text-center mt-4">
                  <h3 className="text-xl font-bold text-white">রহমতুল্লাহ জিসান</h3>
                  <p className="text-sm text-white/50">
                    Founder & Developer
                  </p>
                </div>
              </motion.div>

              {/* Message Content */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                    style={{
                      background: 'rgba(0, 106, 78, 0.15)',
                      color: '#006A4E',
                      border: '1px solid rgba(0, 106, 78, 0.3)',
                    }}
                  >
                    💬 Founder এর কথা
                  </span>
                  
                  <p className="text-lg md:text-xl leading-relaxed text-white/70">
                    আমি <span className="text-white font-semibold">রহমতুল্লাহ জিসান</span>, এই Platform এর Founder।
                    বাংলাদেশে Small Business শুরু করা কতটা কঠিন আমি নিজে দেখেছি। তাই এই Platform
                    বানাচ্ছি — যেন যেকেউ <span className="text-white font-semibold">৫ মিনিটে Online Business</span> শুরু করতে পারে।
                  </p>

                  {/* Honest Status */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{
                      background: 'rgba(249, 168, 37, 0.15)',
                      border: '1px solid rgba(249, 168, 37, 0.3)',
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-[#F9A825]" />
                    <span className="text-sm font-medium text-[#F9A825]">
                      আমরা MVP Stage এ আছি। Perfect না। কিন্তু প্রতিদিন Better হচ্ছি।
                    </span>
                  </div>

                  <p className="text-base leading-relaxed text-white/70">
                    🤝 <span className="text-white">Early Adopter</span> রা আমাদের সাথে Product Build করার সুযোগ পাবেন।
                    আপনার Feedback সরাসরি Feature হবে।
                  </p>
                </motion.div>

                {/* Contact Options */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8"
                >
                  <a
                    href="mailto:rahmatullahzisan@gmail.com"
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300"
                    style={{
                      background: 'rgba(0, 106, 78, 0.1)',
                      border: '1px solid rgba(0, 106, 78, 0.3)',
                    }}
                  >
                    <Mail className="w-4 h-4 transition-transform group-hover:scale-110 text-[#006A4E]" />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      Email করুন
                    </span>
                  </a>

                  <a
                    href="https://wa.me/8801739416661"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300"
                    style={{
                      background: 'rgba(37, 211, 102, 0.1)',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                    }}
                  >
                    <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110 text-[#25D366]" />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      WhatsApp
                    </span>
                  </a>

                  <a
                    href="tel:+8801739416661"
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <Phone className="w-4 h-4 transition-transform group-hover:scale-110 text-[#3B82F6]" />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      01739-416661
                    </span>
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border border-[#006A4E]/30 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-[#006A4E]/20 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-[#00875F]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">আমাদের মিশন</h2>
              <p className="text-white/60 leading-relaxed">
                পুরান ঢাকার রাস্তার বিক্রেতা থেকে সিলেটের উচ্চাকাঙ্ক্ষী ব্র্যান্ড মালিক — প্রতিটি বাংলাদেশী উদ্যোক্তার কাছে ই-কমার্স পৌঁছে দেওয়া।
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border border-[#006A4E]/30 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-[#006A4E]/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#00875F]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">আমাদের ভিশন</h2>
              <p className="text-white/60 leading-relaxed">
                এমন একটি বাংলাদেশ যেখানে যে কেউ স্বপ্ন নিয়ে মাস নয়, মিনিটে অনলাইনে বিক্রি শুরু করতে পারে। যেখানে প্রযুক্তি ভয় দেখায় না, শক্তি দেয়।
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            আমরা যা বিশ্বাস করি
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'কাস্টমার প্রথম', description: 'প্রতিটি সিদ্ধান্ত শুরু হয়: "এটা কি আমাদের মার্চেন্টদের সফল হতে সাহায্য করবে?"', color: '#EF4444' },
              { icon: Zap, title: 'সহজ > জটিল', description: 'আপনার দাদী যদি ব্যবহার করতে না পারেন, তাহলে আমরা যথেষ্ট সহজ করিনি।', color: '#F59E0B' },
              { icon: Users, title: 'লোকাল এক্সপার্টিজ', description: 'বাংলাদেশে তৈরি, বাংলাদেশের জন্য। আমরা বাজার চিনি।', color: '#3B82F6' },
              { icon: Target, title: 'সৎ মূল্য', description: 'কোনো লুকানো ফি নেই। ডলার প্রাইসিং নেই। সৎ টাকার অঙ্ক।', color: '#10B981' },
            ].map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#006A4E]/50 transition-all"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${value.color}20` }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-white/50">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              আমাদের সাথে যোগ দিন
            </h2>
            <p className="text-white/60 mb-8">
              আজই আপনার অনলাইন ব্যবসা শুরু করুন।
            </p>
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-bold rounded-2xl text-lg shadow-xl shadow-[#006A4E]/30 transition-all"
            >
              ফ্রি শুরু করুন
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
