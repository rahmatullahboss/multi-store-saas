/**
 * Trust Section - স্বচ্ছতাই আমাদের শক্তি
 * 
 * A transparent trust-building section that avoids fake testimonials
 * and focuses on authenticity.
 * 
 * Sections:
 * 1. Founder's Message - Real photo, honest message about MVP stage
 * 2. Live Transparency Dashboard - Real-time stats from database
 * 3. Early Adopter Benefits - Clear value proposition
 * 4. Public Roadmap - Transparent progress tracking
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Link } from '@remix-run/react';
import {
  Mail,
  MessageCircle,
  Phone,
  TrendingUp,
  Store,
  Activity,
  Sparkles,
  Target,
  Gift,
  Users,
  Check,
  Clock,
  Wrench,
  Calendar,
  ChevronRight,
  ExternalLink,
  MessageSquarePlus,
  ArrowRight,
} from 'lucide-react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#F9A825',
  accentLight: '#FFB74D',
  background: '#0A0F0D',
  backgroundAlt: '#0D1512',
  backgroundCard: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(0, 106, 78, 0.5)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  textSubtle: 'rgba(255, 255, 255, 0.5)',
};

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================
const AnimatedNumber = ({ 
  value, 
  suffix = '', 
  prefix = '' 
}: { 
  value: number; 
  suffix?: string; 
  prefix?: string; 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// ============================================================================
// SECTION 1: FOUNDER'S MESSAGE
// ============================================================================
const FoundersMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{
            background: `${COLORS.primary}15`,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primary}30`,
          }}
        >
          💬 Founder এর কথা
        </motion.span>
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          "আমরা নতুন, কিন্তু আমাদের{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Vision পরিষ্কার
          </span>
          "
        </h2>
      </div>

      {/* Founder Card */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-12"
        style={{
          background: `linear-gradient(135deg, ${COLORS.backgroundCard}, rgba(0, 106, 78, 0.05))`,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(${COLORS.primary} 1px, transparent 1px)`,
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
                border: `3px solid ${COLORS.primary}40`,
                boxShadow: `0 0 40px ${COLORS.primary}20`,
              }}
            >
              <img
                src="/images/founder.webp"
                alt="Rahmatullah Zisan - Founder"
                className="w-full h-full object-cover"
              />
              {/* Verified Badge */}
              <div
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                  boxShadow: `0 4px 12px ${COLORS.primary}50`,
                }}
              >
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            {/* Name & Title */}
            <div className="text-center mt-4">
              <h3 className="text-xl font-bold text-white">রহমতুল্লাহ জিসান</h3>
              <p style={{ color: COLORS.textSubtle }} className="text-sm">
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
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              <p
                className="text-lg md:text-xl leading-relaxed"
                style={{ color: COLORS.textMuted }}
              >
                আমি <span className="text-white font-semibold">রহমতুল্লাহ জিসান</span>, এই Platform এর Founder।
                বাংলাদেশে Small Business শুরু করা কতটা কঠিন আমি নিজে দেখেছি। তাই এই Platform
                বানাচ্ছি — যেন যেকেউ <span className="text-white font-semibold">৫ মিনিটে Online Business</span> শুরু করতে পারে।
              </p>

              {/* Honest Status */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{
                  background: `${COLORS.accent}15`,
                  border: `1px solid ${COLORS.accent}30`,
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
                <span style={{ color: COLORS.accent }} className="text-sm font-medium">
                  আমরা MVP Stage এ আছি। Perfect না। কিন্তু প্রতিদিন Better হচ্ছি।
                </span>
              </div>

              <p
                className="text-base leading-relaxed"
                style={{ color: COLORS.textMuted }}
              >
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
                  background: `${COLORS.primary}10`,
                  border: `1px solid ${COLORS.primary}30`,
                }}
              >
                <Mail className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: COLORS.primary }} />
                <span style={{ color: COLORS.textMuted }} className="text-sm group-hover:text-white transition-colors">
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
                <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: '#25D366' }} />
                <span style={{ color: COLORS.textMuted }} className="text-sm group-hover:text-white transition-colors">
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
                <Phone className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: '#3B82F6' }} />
                <span style={{ color: COLORS.textMuted }} className="text-sm group-hover:text-white transition-colors">
                  01739-416661
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// SECTION 2: LIVE TRANSPARENCY DASHBOARD
// ============================================================================
interface LiveStats {
  totalUsers: number;
  totalStores: number;
  uptime: number;
}

const LiveTransparencyDashboard = ({ stats }: { stats?: LiveStats }) => {
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalUsers: stats?.totalUsers || 0,
    totalStores: stats?.totalStores || 0,
    uptime: stats?.uptime || 99.9,
  });

  const [pulseSignup, setPulseSignup] = useState(false);

  // Update stats when props change (real data from API)
  useEffect(() => {
    if (stats) {
      setLiveStats({
        totalUsers: stats.totalUsers,
        totalStores: stats.totalStores,
        uptime: stats.uptime || 99.9,
      });
    }
  }, [stats]);

  const statItems = [
    {
      label: 'Signups',
      labelBn: 'সাইনআপ',
      value: liveStats.totalUsers,
      icon: TrendingUp,
      color: COLORS.primary,
      suffix: '',
      isPulsing: pulseSignup,
    },
    {
      label: 'Stores Created',
      labelBn: 'স্টোর তৈরি',
      value: liveStats.totalStores,
      icon: Store,
      color: '#3B82F6',
      suffix: '',
      isPulsing: false,
    },
    {
      label: 'Uptime (30d)',
      labelBn: 'আপটাইম',
      value: liveStats.uptime,
      icon: Activity,
      color: '#10B981',
      suffix: '%',
      isPulsing: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="mt-20"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{
            background: `${COLORS.primary}15`,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primary}30`,
          }}
        >
          📊 Live Stats
        </motion.span>
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          স্বচ্ছতাই আমাদের{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            শক্তি
          </span>
        </h2>
        <p style={{ color: COLORS.textSubtle }} className="max-w-xl mx-auto">
          এগুলো Real Numbers — Fake কিছু না। Real-time আপডেট হচ্ছে।
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-2xl p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${COLORS.backgroundCard}, ${stat.color}08)`,
              border: `1px solid ${stat.isPulsing ? stat.color : COLORS.border}`,
              boxShadow: stat.isPulsing ? `0 0 30px ${stat.color}30` : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Pulse Animation */}
            <AnimatePresence>
              {stat.isPulsing && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: stat.color }}
                  transition={{ duration: 1 }}
                />
              )}
            </AnimatePresence>

            {/* Icon */}
            <div
              className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
            </div>

            {/* Value */}
            <motion.div
              className="text-4xl md:text-5xl font-bold text-white mb-2"
              animate={stat.isPulsing ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </motion.div>

            {/* Label with Live Indicator */}
            <div className="flex items-center justify-center gap-2">
              {stat.label === 'Signups' && (
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#10B981' }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span style={{ color: COLORS.textSubtle }} className="text-sm">
                {stat.labelBn}
              </span>
              {stat.label !== 'Signups' && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.label === 'Uptime (30d)' ? 'Last 30d' : 'Live'}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transparency Note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8"
      >
        <p
          className="inline-flex items-center gap-2 text-sm"
          style={{ color: COLORS.textSubtle }}
        >
          💡 এগুলো Real Numbers — Fake কিছু না
        </p>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// SECTION 3: EARLY ADOPTER BENEFITS
// ============================================================================
const EarlyAdopterBenefits = () => {
  const benefits = [
    {
      icon: Sparkles,
      title: 'LIFETIME EARLY BIRD PRICING',
      titleBn: 'চিরকালের জন্য Early Bird দাম',
      description: 'এখন যে Price এ নেবেন, সেটাই Forever থাকবে',
      color: COLORS.accent,
    },
    {
      icon: Target,
      title: 'SHAPE THE PRODUCT',
      titleBn: 'প্রোডাক্ট তৈরিতে অংশ নিন',
      description: 'আপনার Feedback সরাসরি Feature হবে',
      color: '#3B82F6',
    },
    {
      icon: Gift,
      title: 'EXCLUSIVE BETA FEATURES',
      titleBn: 'এক্সক্লুসিভ বিটা ফিচার',
      description: 'নতুন Features সবার আগে পাবেন',
      color: '#8B5CF6',
    },
    {
      icon: Users,
      title: 'DIRECT FOUNDER ACCESS',
      titleBn: 'সরাসরি Founder এর সাথে',
      description: 'সরাসরি Founder এর সাথে কথা বলতে পারবেন',
      color: '#10B981',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="mt-20"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{
            background: `${COLORS.accent}15`,
            color: COLORS.accent,
            border: `1px solid ${COLORS.accent}30`,
          }}
        >
          🚀 Early Adopter হওয়ার সুবিধা
        </motion.span>
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          প্রথমে থাকুন,{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            সুবিধা পান
          </span>
        </h2>
      </div>

      {/* Benefits Grid */}
      <div
        className="rounded-3xl p-8 md:p-10"
        style={{
          background: `linear-gradient(135deg, ${COLORS.backgroundCard}, rgba(249, 168, 37, 0.03))`,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-300"
              style={{
                background: `${benefit.color}08`,
                border: `1px solid ${benefit.color}20`,
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: `${benefit.color}15` }}
              >
                <benefit.icon className="w-6 h-6" style={{ color: benefit.color }} />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xs font-bold tracking-wide mb-1" style={{ color: benefit.color }}>
                  ✨ {benefit.title}
                </h3>
                <p
                  className="text-white font-semibold mb-1"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  {benefit.titleBn}
                </p>
                <p style={{ color: COLORS.textMuted }} className="text-sm">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to="/auth/register"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-black transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
              boxShadow: `0 0 30px ${COLORS.accent}40`,
              fontFamily: "'Noto Sans Bengali', sans-serif",
            }}
          >
            🎉 Early Adopter হিসেবে Join করুন
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// SECTION 4: PUBLIC ROADMAP
// ============================================================================
interface RoadmapItem {
  name: string;
  status: 'done' | 'building' | 'planned';
}

const PublicRoadmap = () => {
  const roadmapItems: RoadmapItem[] = [
    // Done - Full E-commerce Store Features
    { name: 'Template System', status: 'done' },
    { name: 'Live Editor', status: 'done' },
    { name: 'Bangla Support', status: 'done' },
    { name: 'Section Rearrange', status: 'done' },
    { name: 'Analytics Dashboard', status: 'done' },
    { name: 'Inventory Management', status: 'done' },
    { name: 'Order Management', status: 'done' },
    { name: 'Customer Management', status: 'done' },
    // Building Now
    { name: 'Payment Gateway Integration', status: 'building' },
    { name: 'More Templates', status: 'building' },
    { name: 'Mobile App', status: 'building' },
    // Planned
    { name: 'Drag & Drop Builder', status: 'planned' },
    { name: 'AI Content Writer', status: 'planned' },
    { name: 'Multi-channel Selling', status: 'planned' },
    { name: 'Advanced Reports', status: 'planned' },
  ];

  const doneItems = roadmapItems.filter(item => item.status === 'done');
  const buildingItems = roadmapItems.filter(item => item.status === 'building');
  const plannedItems = roadmapItems.filter(item => item.status === 'planned');

  const statusConfig = {
    done: {
      icon: Check,
      label: '✅ DONE',
      labelBn: 'সম্পন্ন',
      color: '#10B981',
    },
    building: {
      icon: Wrench,
      label: '🔨 BUILDING NOW',
      labelBn: 'তৈরি হচ্ছে',
      color: COLORS.accent,
    },
    planned: {
      icon: Calendar,
      label: '📋 PLANNED',
      labelBn: 'পরিকল্পিত',
      color: '#8B5CF6',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="mt-20"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{
            background: `${COLORS.primary}15`,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primary}30`,
          }}
        >
          🗺️ আমাদের ROADMAP
        </motion.span>
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          স্বচ্ছভাবে আমাদের{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            পরিকল্পনা
          </span>
        </h2>
      </div>

      {/* Roadmap Grid */}
      <div
        className="rounded-3xl p-8 md:p-10"
        style={{
          background: COLORS.backgroundCard,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Done Column */}
          <RoadmapColumn
            items={doneItems}
            config={statusConfig.done}
            index={0}
          />

          {/* Building Column */}
          <RoadmapColumn
            items={buildingItems}
            config={statusConfig.building}
            index={1}
          />

          {/* Planned Column */}
          <RoadmapColumn
            items={plannedItems}
            config={statusConfig.planned}
            index={2}
          />
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <a
            href="https://github.com/yourrepo/roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
            style={{
              background: `${COLORS.primary}10`,
              border: `1px solid ${COLORS.primary}30`,
            }}
          >
            <ExternalLink className="w-4 h-4" style={{ color: COLORS.primary }} />
            <span style={{ color: COLORS.textMuted }} className="group-hover:text-white transition-colors">
              Full Roadmap দেখুন
            </span>
          </a>

          <a
            href="mailto:rahmatullahzisan@gmail.com?subject=Feature Request"
            className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
            style={{
              background: `${COLORS.accent}10`,
              border: `1px solid ${COLORS.accent}30`,
            }}
          >
            <MessageSquarePlus className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span style={{ color: COLORS.textMuted }} className="group-hover:text-white transition-colors">
              Feature Request করুন
            </span>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Roadmap Column Component
const RoadmapColumn = ({
  items,
  config,
  index,
}: {
  items: RoadmapItem[];
  config: {
    icon: React.ElementType;
    label: string;
    labelBn: string;
    color: string;
  };
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-4">
        <config.icon className="w-5 h-5" style={{ color: config.color }} />
        <span className="font-bold text-sm" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/5"
            style={{
              background: `${config.color}08`,
              border: `1px solid ${config.color}15`,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${config.color}20` }}
            >
              {config.label.includes('DONE') ? (
                <Check className="w-3.5 h-3.5" style={{ color: config.color }} />
              ) : config.label.includes('BUILDING') ? (
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: config.color }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ) : (
                <Clock className="w-3.5 h-3.5" style={{ color: config.color }} />
              )}
            </div>
            <span style={{ color: COLORS.textMuted }} className="text-sm">
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN TRUST SECTION COMPONENT
// ============================================================================
export interface TrustSectionProps {
  stats?: LiveStats;
}

export function TrustSection({ stats }: TrustSectionProps) {
  return (
    <section
      id="trust"
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ background: COLORS.background }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div
          className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent}30 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section 1: Founder's Message */}
        <FoundersMessage />

        {/* Section 2: Live Transparency Dashboard */}
        <LiveTransparencyDashboard stats={stats} />

        {/* Section 3: Early Adopter Benefits */}
        <EarlyAdopterBenefits />

        {/* Section 4: Public Roadmap */}
        <PublicRoadmap />
      </div>
    </section>
  );
}

export default TrustSection;
