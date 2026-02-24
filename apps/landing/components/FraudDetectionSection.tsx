'use client';

/**
 * Fraud Detection Section — Improved
 * 
 * - No numeric score shown (delivery rate % based)
 * - Foreign IP = flag only, not block
 * - COD auto-confirm for trusted customers
 * - Prepaid = skip fraud check
 */

import { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Database,
  Activity,
  Lock,
  AlertTriangle,
  TrendingUp,
  Globe,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';

const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#DC2626',
  accentLight: '#EF4444',
  background: '#0A0F0D',
  backgroundCard: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  textSubtle: 'rgba(255, 255, 255, 0.5)',
  success: '#10B981',
  warning: '#F59E0B',
};

// IntersectionObserver hook for scroll-triggered animations
const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
};

// Simulated order flow for the live demo card
const DEMO_ORDERS = [
  {
    phone: '017XX-XXXXXX',
    deliveryRate: 92,
    returnRate: 8,
    status: 'safe',
    label: 'নিরাপদ',
    action: 'অটো-কনফার্ম ✅',
    color: '#10B981',
    signal: null,
  },
  {
    phone: '018XX-XXXXXX',
    deliveryRate: 38,
    returnRate: 62,
    status: 'high',
    label: 'হাই রিস্ক',
    action: 'ম্যানুয়াল ভেরিফাই 🔍',
    color: '#EF4444',
    signal: 'Return Rate ৬২% — পেন্ডিং রাখা হয়েছে',
  },
  {
    phone: '019XX-XXXXXX',
    deliveryRate: 71,
    returnRate: 29,
    status: 'medium',
    label: 'মিডিয়াম রিস্ক',
    action: 'রিভিউ করুন ⚠️',
    color: '#F59E0B',
    signal: 'Delivery Rate মাঝারি — মনিটর করুন',
  },
  {
    phone: '015XX-XXXXXX (Abroad)',
    deliveryRate: 88,
    returnRate: 12,
    status: 'flagged',
    label: 'ফ্ল্যাগড',
    action: 'একসেপ্ট করুন (বিদেশী IP) 🌍',
    color: '#8B5CF6',
    signal: 'Foreign IP — ব্লক না, শুধু ফ্ল্যাগ',
  },
];

// Animated progress bar using CSS transitions
const ProgressBar = ({ value, color }: { value: number; color: string }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 50);
    return () => clearTimeout(timer);
  }, [value]);
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: color,
          transition: 'width 0.6s ease-out',
        }}
      />
    </div>
  );
};

// Order card that fades in/out via CSS
const OrderCard = ({ order, visible }: { order: typeof DEMO_ORDERS[0]; visible: boolean }) => (
  <div
    className="p-4 rounded-xl border mb-5"
    style={{
      background: `${order.color}08`,
      borderColor: `${order.color}30`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(15px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}
  >
    {/* Phone + Label */}
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs text-gray-400 font-mono">{order.phone}</span>
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
        style={{ background: `${order.color}20`, color: order.color }}
      >
        {order.label}
      </span>
    </div>

    {/* Delivery Rate */}
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400 flex items-center gap-1">
          <PackageCheck className="w-3 h-3" /> Delivery Rate
        </span>
        <span style={{ color: order.deliveryRate >= 80 ? '#10B981' : order.deliveryRate >= 50 ? '#F59E0B' : '#EF4444' }}>
          {order.deliveryRate}%
        </span>
      </div>
      <ProgressBar
        value={order.deliveryRate}
        color={order.deliveryRate >= 80 ? '#10B981' : order.deliveryRate >= 50 ? '#F59E0B' : '#EF4444'}
      />
    </div>

    {/* Return Rate */}
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400 flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Return Rate
        </span>
        <span style={{ color: order.returnRate <= 20 ? '#10B981' : order.returnRate <= 50 ? '#F59E0B' : '#EF4444' }}>
          {order.returnRate}%
        </span>
      </div>
      <ProgressBar
        value={order.returnRate}
        color={order.returnRate <= 20 ? '#10B981' : order.returnRate <= 50 ? '#F59E0B' : '#EF4444'}
      />
    </div>

    {/* Signal (if any) */}
    {order.signal && (
      <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10 mb-3">
        <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
        <span className="text-[10px] text-yellow-400">{order.signal}</span>
      </div>
    )}

    {/* Action */}
    <div
      className="text-center py-2 rounded-lg text-xs font-bold"
      style={{ background: `${order.color}15`, color: order.color }}
    >
      {order.action}
    </div>
  </div>
);

export const FraudDetectionSection = () => {
  const [activeOrder, setActiveOrder] = useState(0);
  const [cardVisible, setCardVisible] = useState(true);
  const { ref, inView } = useInView(0.1);
  const { ref: headerRef, inView: headerInView } = useInView(0.1);
  const { ref: demoRef, inView: demoInView } = useInView(0.1);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out first, then switch order, then fade in
      setCardVisible(false);
      setTimeout(() => {
        setActiveOrder((prev) => (prev + 1) % DEMO_ORDERS.length);
        setCardVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Database,
      titleBn: 'শেয়ার্ড কুরিয়ার ডাটাবেস',
      description: 'Steadfast, Pathao ও RedX — তিনটি কুরিয়ারের ডেলিভারি রেকর্ড থেকে রিয়েল-টাইম কাস্টমার ডাটা।',
      color: COLORS.primaryLight,
    },
    {
      icon: Activity,
      titleBn: 'Steadfast · Pathao · RedX ট্র্যাকিং',
      description: 'ফোন নাম্বার দিয়ে Steadfast, Pathao ও RedX — তিনটি কুরিয়ারের ডেলিভারি ও রিটার্ন রেট একসাথে দেখুন।',
      color: COLORS.warning,
    },
    {
      icon: Globe,
      titleBn: 'Foreign IP — ব্লক না, ফ্ল্যাগ',
      description: 'বিদেশি IP থেকে অর্ডার হলে ব্লক নয়, শুধু ফ্ল্যাগ করা হয় — প্রবাসী কাস্টমারও নিরাপদে কিনতে পারবেন।',
      color: '#8B5CF6',
    },
    {
      icon: ShieldCheck,
      titleBn: 'নিরাপদ COD অটো-কনফার্ম',
      description: 'Delivery Rate ৮০%+ হলে COD অর্ডার অটোমেটিক কনফার্ম — ম্যানুয়াল কাজ কমে।',
      color: COLORS.success,
    },
    {
      icon: Lock,
      titleBn: 'প্রিপেইড = ফ্রড চেক নেই',
      description: 'বিকাশ/নগদ/কার্ডে পেমেন্ট হলে ফ্রড চেক skip — টাকা পেয়ে গেলে ব্লক করার দরকার নেই।',
      color: '#EC4899',
    },
    {
      icon: TrendingUp,
      titleBn: 'Delivery Rate % দেখুন',
      description: 'Numeric score নয়, সহজবোধ্য Delivery Rate % ও Return Rate % দিয়ে রিস্ক বুঝুন।',
      color: COLORS.primaryLight,
    },
  ];

  const order = DEMO_ORDERS[activeOrder];

  return (
    <div
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: COLORS.accent }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{
              background: `${COLORS.accent}15`,
              color: COLORS.accentLight,
              border: `1px solid ${COLORS.accent}30`,
              opacity: headerInView ? 1 : 0,
              transform: headerInView ? 'scale(1)' : 'scale(0.9)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
              display: 'inline-flex',
            }}
          >
            <ShieldAlert className="w-4 h-4" />
            Advanced Fraud Protection
          </span>
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
            আমাদের স্মার্ট ফ্রড ডিটেকশন সিস্টেম COD রিটার্ন কমায়, ভালো কাস্টমারদের অটো-কনফার্ম করে এবং প্রবাসী কাস্টমারদের ব্লক করে না।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.titleBn}
                className="p-5 rounded-2xl border backdrop-blur-sm hover:scale-[1.02] transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.backgroundCard}, ${feature.color}05)`,
                  borderColor: `${feature.color}20`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.5s ease-out ${index * 0.08}s, transform 0.5s ease-out ${index * 0.08}s`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                  {feature.titleBn}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: COLORS.textMuted }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Live Demo Card */}
          <div
            ref={demoRef}
            className="relative"
            style={{
              opacity: demoInView ? 1 : 0,
              transform: demoInView ? 'scale(1)' : 'scale(0.9)',
              transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
            }}
          >
            <div
              className="rounded-2xl p-6 border relative overflow-hidden"
              style={{
                background: '#111',
                borderColor: COLORS.border,
                boxShadow: '0 20px 50px -10px black',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-bold text-white">Fraud Detection — লাইভ</span>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● LIVE
                </span>
              </div>

              {/* Animated Order Card */}
              <OrderCard order={order} visible={cardVisible} />

              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-lg font-bold text-emerald-400">৮৩%</p>
                  <p className="text-[10px] text-gray-500">অটো-কনফার্ম</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-lg font-bold text-yellow-400">১২%</p>
                  <p className="text-[10px] text-gray-500">ম্যানুয়াল রিভিউ</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-lg font-bold text-red-400">৫%</p>
                  <p className="text-[10px] text-gray-500">ব্লক</p>
                </div>
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};
