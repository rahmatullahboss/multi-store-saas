'use client';

/**
 * Fraud Detection Section
 * 
 * Highlights the AI-powered fraud detection capabilities.
 */

import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Database, 
  Activity, 
  Lock, 
  Smartphone,
  AlertTriangle,
  FileWarning
} from 'lucide-react';

// ============================================================================
// DESIGN TOKENS (Consistent with TrustSection)
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#DC2626', // Red for alert/warning
  accentLight: '#EF4444',
  background: '#0A0F0D',
  backgroundCard: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  textSubtle: 'rgba(255, 255, 255, 0.5)',
  success: '#10B981',
  warning: '#F59E0B'
};

export const FraudDetectionSection = () => {
  const features = [
    {
      icon: Database,
      title: "Shared Blacklist Database",
      titleBn: "শেয়ার্ড ব্ল্যাকলিস্ট ডাটাবেস",
      description: "আমাদের সেন্ট্রাল ডাটাবেস থেকে অটোমেটিক ব্ল্যাকলিস্টেড বা সাসপিশাস কাস্টমার ডিটেক্ট করে।",
      color: COLORS.primaryLight
    },
    {
      icon: Activity,
      title: "AI Risk Scoring",
      titleBn: "AI রিস্ক স্কোরিং",
      description: "অর্ডারের ধরণ, ভেলোসিটি এবং পূর্বের রেকর্ড বিশ্লেষণ করে ০-১০০ রিস্ক স্কোর দেয়।",
      color: COLORS.warning
    },
    {
      icon: Lock,
      title: "Auto-Block High Risk",
      titleBn: "অটো-ব্লক হাই রিস্ক",
      description: "অতিরিক্ত রিস্কি অর্ডারগুলো অটোমেটিক ব্লক করে আপনার কুরিয়ার চার্জ বাঁচায়।",
      color: COLORS.accent
    },
    {
      icon: Smartphone,
      title: "Courier Integration Check",
      titleBn: "কুরিয়ার ইন্টিগ্রেশন চেক",
      description: "পাঠাও বা স্টেডফাস্টে বুকিং দেওয়ার আগেই ফ্রড চেক করে ওয়ার্নিং দেয়।",
      color: COLORS.success
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="relative py-24 overflow-hidden"
    >
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: COLORS.accent }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{
              background: `${COLORS.accent}15`,
              color: COLORS.accentLight,
              border: `1px solid ${COLORS.accent}30`,
            }}
          >
            <ShieldAlert className="w-4 h-4" />
            Advanced Protection
          </motion.span>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            ফেইক অর্ডার ও ফ্রড থেকে{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.warning})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              সুরক্ষা
            </span>
          </h2>
          <p style={{ color: COLORS.textMuted }} className="max-w-2xl mx-auto text-lg">
            আমাদের অ্যাডভান্সড ফ্রড ডিটেকশন সিস্টেম আপনার ব্যবসার ক্ষতি কমাবে এবং প্রফিট বাড়াবে। ফেক অর্ডার আর রিটার্ন রেট কমানোর সেরা সমাধান।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.backgroundCard}, ${feature.color}05)`,
                  borderColor: `${feature.color}20`
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                  {feature.titleBn}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right: Visual Representation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Mock Card */}
            <div 
              className="rounded-2xl p-6 border relative overflow-hidden"
              style={{ 
                background: '#111', 
                borderColor: COLORS.border,
                boxShadow: `0 20px 50px -10px black` 
              }}
            >
              {/* Alert Mockup */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="text-red-400 font-bold text-sm">High Risk Order Detected</h4>
                  <p className="text-red-400/70 text-xs">Risk Score: 85/100 (Blacklisted Phone)</p>
                </div>
                <div className="ml-auto px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                  BLOCKED
                </div>
              </div>

              {/* Stats Mockup */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Order Velocity</span>
                  <span className="text-yellow-500">High (5 orders/day)</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[70%]" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">COD Return Rate</span>
                  <span className="text-red-500">Critical (45%)</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[85%]" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">IP Reputation</span>
                  <span className="text-green-500">Clean</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[100%]" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="py-2 text-center rounded-lg bg-gray-800 text-gray-400 text-xs font-medium cursor-not-allowed">
                  Accept Order
                </div>
                <div className="py-2 text-center rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-medium">
                  Verify via OTP
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
