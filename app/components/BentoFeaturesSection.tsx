/**
 * Bento Grid Features Section
 * 
 * Showcases platform capabilities in an engaging bento-grid layout
 * with interactive animations and hover effects
 */

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
  Palette, Eye, Languages, Smartphone, GripVertical, 
  ShoppingCart, FileText, Sparkles, Bell, ArrowRight,
  Check, Layout, Type, Image, Star
} from 'lucide-react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#10B981',
  primaryLight: '#34D399',
  accent: '#F9A825',
  bg: '#0A0A12',
  card: 'rgba(255, 255, 255, 0.03)',
  cardHover: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(16, 185, 129, 0.3)',
  text: 'rgba(255, 255, 255, 0.95)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
};

// ============================================================================
// TEMPLATE SHOWCASE CARD (Large)
// ============================================================================
const TemplateLibraryCard = () => {
  const templates = [
    { name: 'Minimal', color: '#10B981', icon: Layout },
    { name: 'Luxe', color: '#F9A825', icon: Star },
    { name: 'Bold', color: '#EF4444', icon: Type },
    { name: 'Fresh', color: '#3B82F6', icon: Image },
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % templates.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="group relative h-full p-6 md:p-8 rounded-3xl border overflow-hidden cursor-pointer flex flex-col"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: COLORS.cardHover,
        borderColor: COLORS.borderHover,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 blur-3xl" />
      </div>

      {/* Icon & Title */}
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <motion.div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${COLORS.primary}20` }}
          whileHover={{ scale: 1.1 }}
        >
          <Palette className="w-6 h-6" style={{ color: COLORS.primary }} />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-white">Template Library</h3>
          <p className="text-sm text-white/50" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
            Professional Templates একটা ক্লিকে
          </p>
        </div>
      </div>

      {/* Template Cards Showcase */}
      <div className="relative flex-1 min-h-[240px]">
        {templates.map((template, i) => {
          const Icon = template.icon;
          const isActive = i === activeIndex;
          const offset = (i - activeIndex + templates.length) % templates.length;
          
          return (
            <motion.div
              key={template.name}
              className="absolute w-[92%] md:w-[96%] h-[220px] md:h-[240px] rounded-2xl border overflow-hidden"
              style={{ 
                backgroundColor: `${template.color}10`,
                borderColor: `${template.color}30`,
                filter: isActive ? 'none' : `blur(${offset * 2}px)`,
              }}
              animate={{
                x: offset * 18,
                y: offset * 12,
                scale: isActive ? 1 : 0.96 - offset * 0.02,
                zIndex: templates.length - offset,
                opacity: offset > 2 ? 0 : isActive ? 1 : 0.5 - offset * 0.1,
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="p-5 md:p-6 h-full flex flex-col justify-between">
                <div 
                  className="w-16 h-16 md:w-18 md:h-18 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${template.color}30` }}
                >
                  <Icon className="w-8 h-8 md:w-9 md:h-9" style={{ color: template.color }} />
                </div>
                {/* Only show text content on the active card */}
                {isActive && (
                  <div>
                    <p className="text-lg md:text-xl font-bold text-white mb-3">{template.name}</p>
                    <div className="h-3 w-40 md:w-52 rounded bg-white/10 mb-2" />
                    <div className="h-3 w-24 md:w-32 rounded bg-white/5" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ============================================================================
// LIVE PREVIEW CARD
// ============================================================================
const LivePreviewCard = () => {
  const [text, setText] = useState('Welcome');
  const texts = ['Welcome', 'স্বাগতম', 'Hello'];
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % texts.length);
      setText(texts[(textIndex + 1) % texts.length]);
    }, 2500);
    return () => clearInterval(interval);
  }, [textIndex]);

  return (
    <motion.div
      className="group relative h-full p-5 md:p-6 rounded-3xl border overflow-hidden cursor-pointer"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: COLORS.cardHover,
        borderColor: COLORS.borderHover,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon & Title */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${COLORS.primary}20` }}
          whileHover={{ scale: 1.1 }}
        >
          <Eye className="w-5 h-5" style={{ color: COLORS.primary }} />
        </motion.div>
        <h3 className="text-base font-bold text-white">Live Preview</h3>
      </div>

      <p className="text-sm text-white/50 mb-4" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
        যা Edit করবেন, সাথে সাথে দেখবেন
      </p>

      {/* Split Screen Demo */}
      <div className="flex gap-2 h-24">
        {/* Editor Side */}
        <div className="flex-1 rounded-lg bg-black/30 border border-white/10 p-2 overflow-hidden">
          <div className="text-[10px] text-white/30 mb-1">EDITOR</div>
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-white/70 font-mono"
          >
            title: "{text}"
          </motion.div>
        </div>
        
        {/* Preview Side */}
        <div className="flex-1 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-2 overflow-hidden">
          <div className="text-[10px] text-emerald-400/50 mb-1">PREVIEW</div>
          <motion.div
            key={text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm font-bold text-white"
          >
            {text}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// BANGLA SUPPORT CARD
// ============================================================================
const BanglaSupportCard = () => {
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsEnglish(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="group relative h-full p-5 rounded-3xl border overflow-hidden cursor-pointer"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: COLORS.cardHover,
        borderColor: COLORS.borderHover,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Bangladesh flag colors accent */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
        <div className="absolute inset-0 bg-green-600 rounded-bl-full" />
        <div className="absolute top-4 right-4 w-8 h-8 bg-red-600 rounded-full" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#006A4E20' }}
          whileHover={{ scale: 1.1 }}
        >
          <Languages className="w-5 h-5" style={{ color: '#006A4E' }} />
        </motion.div>
        <h3 className="text-base font-bold text-white">🇧🇩 বাংলা Support</h3>
      </div>

      {/* Toggle Animation */}
      <motion.div
        className="text-center py-4"
        key={isEnglish ? 'en' : 'bn'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p 
          className="text-lg font-semibold text-white/80"
          style={{ fontFamily: isEnglish ? 'Inter, sans-serif' : "'Noto Sans Bengali', sans-serif" }}
        >
          {isEnglish ? 'Interface, Support, Everything' : 'সবকিছু বাংলায়'}
        </p>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MOBILE RESPONSIVE CARD
// ============================================================================
const MobileResponsiveCard = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev === 0 ? 90 : 0);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="group relative h-full p-5 rounded-3xl border overflow-hidden cursor-pointer"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: COLORS.cardHover,
        borderColor: COLORS.borderHover,
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${COLORS.primary}20` }}
          whileHover={{ scale: 1.1 }}
        >
          <Smartphone className="w-5 h-5" style={{ color: COLORS.primary }} />
        </motion.div>
        <h3 className="text-base font-bold text-white">📱 Mobile Ready</h3>
      </div>

      <p className="text-sm text-white/50 mb-3" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
        সব Device এ Perfect
      </p>

      {/* Phone Mockup */}
      <div className="flex justify-center">
        <motion.div
          className="w-12 h-20 rounded-lg border-2 border-white/20 bg-black/30 flex items-center justify-center"
          animate={{ rotate: rotation }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="w-8 h-14 rounded bg-gradient-to-b from-emerald-500/20 to-emerald-500/5" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// SECTION REARRANGE CARD
// ============================================================================
const SectionRearrangeCard = () => {
  const [order, setOrder] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder(prev => {
        const newOrder = [...prev];
        const idx1 = Math.floor(Math.random() * 3);
        let idx2 = Math.floor(Math.random() * 3);
        while (idx2 === idx1) idx2 = Math.floor(Math.random() * 3);
        [newOrder[idx1], newOrder[idx2]] = [newOrder[idx2], newOrder[idx1]];
        return newOrder;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sections = [
    { name: 'Hero', color: '#10B981' },
    { name: 'Features', color: '#3B82F6' },
    { name: 'CTA', color: '#F9A825' },
  ];

  return (
    <motion.div
      className="group relative h-full p-5 md:p-6 rounded-3xl border overflow-hidden cursor-pointer"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: COLORS.cardHover,
        borderColor: COLORS.borderHover,
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${COLORS.accent}20` }}
          whileHover={{ scale: 1.1 }}
        >
          <GripVertical className="w-5 h-5" style={{ color: COLORS.accent }} />
        </motion.div>
        <h3 className="text-base font-bold text-white">🔀 Section Rearrange</h3>
      </div>

      <p className="text-sm text-white/50 mb-4" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
        নিজের মতো সাজান
      </p>

      {/* Draggable Sections Demo */}
      <div className="space-y-2">
        {order.map((idx, position) => (
          <motion.div
            key={idx}
            className="flex items-center gap-2 p-2 rounded-lg border"
            style={{ 
              backgroundColor: `${sections[idx].color}10`,
              borderColor: `${sections[idx].color}30`,
            }}
            animate={{ y: 0 }}
            layout
            transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
          >
            <GripVertical className="w-3 h-3 text-white/30" />
            <span className="text-xs text-white/70">{sections[idx].name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// E-COMMERCE + LANDING = ONE PLATFORM CARD (Full Width)
// ============================================================================
const ComboPlatformCard = () => {
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowLanding(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="group relative p-6 md:p-8 rounded-3xl border overflow-hidden cursor-pointer"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
      whileHover={{ 
        scale: 1.01, 
        backgroundColor: COLORS.cardHover,
        borderColor: COLORS.borderHover,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-60 h-40 bg-gradient-to-t from-emerald-500/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Icons */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.primary}20` }}
            animate={{ scale: showLanding ? 0.9 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingCart className="w-7 h-7" style={{ color: COLORS.primary }} />
          </motion.div>
          
          <span className="text-2xl text-white/30">+</span>
          
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.accent}20` }}
            animate={{ scale: showLanding ? 1 : 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="w-7 h-7" style={{ color: COLORS.accent }} />
          </motion.div>
          
          <span className="text-2xl text-white/30">=</span>
          
          <div 
            className="px-4 py-2 rounded-xl font-bold text-white"
            style={{ backgroundColor: `${COLORS.primary}30` }}
          >
            ONE PLATFORM
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <h3 
            className="text-lg md:text-xl font-bold text-white mb-2"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            🛒 E-Commerce + 📄 Landing Page
          </h3>
          <p 
            className="text-sm text-white/60"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            দুইটার দাম দিয়ে দুইটাই পান — একই Platform এ
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMING SOON TEASER
// ============================================================================
const ComingSoonTeaser = () => {
  const [email, setEmail] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-6 md:p-8 rounded-3xl border overflow-hidden"
      style={{ 
        backgroundColor: 'rgba(249, 168, 37, 0.05)',
        borderColor: 'rgba(249, 168, 37, 0.2)',
      }}
    >
      {/* Sparkle accent */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-6 h-6 text-amber-400/40" />
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <p className="text-lg text-white/80 mb-1" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
            🔮 <span className="font-bold">শীঘ্রই আসছে:</span>
          </p>
          <p className="text-sm text-white/50" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
            Drag & Drop Builder, AI Content, Payment Gateway Integration, এবং আরো অনেক কিছু...
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 md:w-56 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-400/40"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2"
            style={{ 
              backgroundColor: COLORS.accent,
              color: '#000',
            }}
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              Notify Me
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function BentoFeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${COLORS.bg} 0%, #0D0D18 100%)` }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-4 h-4" style={{ color: COLORS.primary }} />
            <span className="text-sm text-white/60">Features</span>
          </motion.div>
          
          <h2 
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            সহজ Features,{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` }}
            >
              শক্তিশালী Results
            </span>
          </h2>
        </motion.div>

        {/* BENTO GRID */}
        <div className="space-y-4 md:space-y-6">
          {/* Row 1: Template (large) + Live Preview & Section Rearrange */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Template Library - Large - matches height of right column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <div className="h-full min-h-[400px]">
                <TemplateLibraryCard />
              </div>
            </motion.div>

            {/* Right Column: Live Preview + Section Rearrange - stacked */}
            <div className="flex flex-col gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1"
              >
                <div className="h-full min-h-[180px]">
                  <LivePreviewCard />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1"
              >
                <div className="h-full min-h-[180px]">
                  <SectionRearrangeCard />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Row 2: Bangla + Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <BanglaSupportCard />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <MobileResponsiveCard />
            </motion.div>
          </div>

          {/* Row 3: Full Width Combo Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ComboPlatformCard />
          </motion.div>

          {/* Coming Soon Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ComingSoonTeaser />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BentoFeaturesSection;
