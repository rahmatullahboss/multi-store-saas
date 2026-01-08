/**
 * Award-Winning Hero Section
 * 
 * Inspired by: Stripe, Linear, Vercel
 * Style: Awwwards/FWA winning aesthetic
 * 
 * Features:
 * - Dark mode with purple/blue gradient accents
 * - Glassmorphism cards with blur
 * - 3D floating elements with parallax
 * - Grain texture overlay
 * - Particle system background
 * - Magnetic cursor effects
 * - Animated dashboard mockup
 */

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { ArrowRight, Sparkles, TrendingUp, ShoppingCart, Users, Zap, Star, ChevronDown } from 'lucide-react';

// ============================================================================
// NOISE/GRAIN TEXTURE OVERLAY
// ============================================================================
const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

// ============================================================================
// PARTICLE SYSTEM BACKGROUND
// ============================================================================
const ParticleField = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// GRADIENT ORB BACKGROUND
// ============================================================================
const GradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Primary purple orb */}
    <motion.div
      className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
      }}
      animate={{
        scale: [1, 1.1, 1],
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Secondary blue orb */}
    <motion.div
      className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
      }}
      animate={{
        scale: [1.1, 1, 1.1],
        x: [0, -30, 0],
        y: [0, -50, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Accent cyan orb */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
      }}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

// ============================================================================
// MAGNETIC BUTTON COMPONENT
// ============================================================================
interface MagneticProps {
  children: ReactNode;
  className?: string;
}

const Magnetic = ({ children, className = '' }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// ANIMATED COUNTER
// ============================================================================
const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * value));
            
            if (progress < 1) requestAnimationFrame(animate);
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ============================================================================
// FLOATING 3D CARD
// ============================================================================
interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  offsetX?: number;
  offsetY?: number;
}

const FloatingCard = ({ children, className = '', delay = 0, offsetX = 0, offsetY = 0 }: FloatingCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, delay }}
    className={className}
    style={{ x: offsetX, y: offsetY }}
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ============================================================================
// GLASSMORPHISM STAT CARD
// ============================================================================
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  color: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, label, value, suffix, color, delay = 0 }: StatCardProps) => (
  <FloatingCard delay={delay}>
    <div className="group relative">
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
        style={{ background: color }}
      />
      
      {/* Card */}
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              <AnimatedNumber value={value} suffix={suffix} />
            </p>
            <p className="text-xs text-white/50">{label}</p>
          </div>
        </div>
      </div>
    </div>
  </FloatingCard>
);

// ============================================================================
// ANIMATED DASHBOARD MOCKUP
// ============================================================================
const DashboardMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.5 }}
    className="relative"
  >
    {/* Main dashboard card */}
    <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/60">Live</span>
        </div>
      </div>
      
      {/* Revenue chart mockup */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-white/40 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">৳<AnimatedNumber value={847520} /></p>
          </div>
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            +23.5%
          </div>
        </div>
        
        {/* Chart bars */}
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-500/50 to-blue-500/50"
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: 0.8 + i * 0.05 }}
            />
          ))}
        </div>
      </div>
      
      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Orders', value: '1,247', change: '+12%' },
          { label: 'Customers', value: '8,432', change: '+8%' },
          { label: 'Conversion', value: '4.2%', change: '+0.8%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-3">
            <p className="text-white/40 text-xs mb-1">{stat.label}</p>
            <p className="text-white font-semibold">{stat.value}</p>
            <p className="text-green-400 text-xs">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
    
    {/* Floating notification card */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2 }}
      className="absolute -right-4 top-1/4"
    >
      <FloatingCard delay={1.5}>
        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">New Order!</p>
              <p className="text-white/50 text-xs">৳2,450 from Dhaka</p>
            </div>
          </div>
        </div>
      </FloatingCard>
    </motion.div>
  </motion.div>
);

// ============================================================================
// MAIN HERO COMPONENT
// ============================================================================
interface AwardWinningHeroProps {
  content: {
    badge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    getStarted: string;
    talkExpert: string;
    noCreditCard: string;
    statsStores: string;
    statsOrders: string;
    statsMerchants: string;
  };
}

export function AwardWinningHero({ content }: AwardWinningHeroProps) {
  return (
    <section className="relative min-h-screen bg-[#0A0A0F] overflow-hidden flex items-center">
      {/* Background layers */}
      <GrainOverlay />
      <ParticleField />
      <GradientOrbs />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
              </motion.div>
              <span className="text-white/70 text-sm">{content.badge}</span>
              <div className="flex -space-x-1.5">
                {['🇧🇩', '💼', '🚀'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs"
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
            
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              <span className="text-white">{content.heroTitle1}</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                {content.heroTitle2}
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-white/50 mb-10 max-w-xl leading-relaxed"
            >
              {content.heroSubtitle}
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Magnetic>
                <Link
                  to="/auth/register"
                  className="group relative px-8 py-4 rounded-xl font-semibold text-black bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 flex items-center gap-2"
                >
                  {content.getStarted}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </Magnetic>
              
              <Magnetic>
                <Link
                  to="#demo"
                  className="px-8 py-4 rounded-xl font-semibold text-white border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {content.talkExpert}
                </Link>
              </Magnetic>
            </motion.div>
            
            {/* Trust text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/30 text-sm"
            >
              {content.noCreditCard}
            </motion.p>
            
            {/* Floating stats */}
            <div className="flex flex-wrap gap-4 mt-12">
              <StatCard
                icon={ShoppingCart}
                label={content.statsStores}
                value={500}
                suffix="+"
                color="#8B5CF6"
                delay={1}
              />
              <StatCard
                icon={TrendingUp}
                label={content.statsOrders}
                value={50}
                suffix="K+"
                color="#3B82F6"
                delay={1.2}
              />
              <StatCard
                icon={Users}
                label={content.statsMerchants}
                value={1}
                suffix="K+"
                color="#06B6D4"
                delay={1.4}
              />
            </div>
          </div>
          
          {/* Right: Dashboard mockup */}
          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white/30"
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </div>
      
      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </section>
  );
}

export default AwardWinningHero;
