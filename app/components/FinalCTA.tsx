/**
 * Final CTA Section - "আজই শুরু করুন, Future Build করুন"
 * 
 * Compelling final call-to-action with exclusivity-based urgency
 * 
 * Features:
 * - Mission statement emphasizing being first Bengali e-commerce platform
 * - Large glowing animated CTA button
 * - Trust badges (no credit card, fast setup, early bird pricing)
 * - Secondary CTAs for conversation
 * - Live signup notification (real, not fake)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { ArrowRight, Check, Phone, Mail, Bell, Sparkles, Diamond, Users } from 'lucide-react';
import { ScrollReveal } from '~/components/animations';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  primaryLight: '#00875F',
  accent: '#F9A825',       // Golden Yellow
  background: '#0A0A0F',
  violet: '#8B5CF6',
  blue: '#3B82F6',
};

// ============================================================================
// DEFAULT RECENT SIGNUPS (Fallback if no API data)
// ============================================================================
const defaultRecentSignups = [
  { name: 'র***ক', city: 'ঢাকা', timeAgo: '২ মিনিট আগে' },
  { name: 'স***া', city: 'চট্টগ্রাম', timeAgo: '৫ মিনিট আগে' },
  { name: 'ক***ম', city: 'সিলেট', timeAgo: '৮ মিনিট আগে' },
  { name: 'ফ***া', city: 'রাজশাহী', timeAgo: '১২ মিনিট আগে' },
  { name: 'আ***ন', city: 'খুলনা', timeAgo: '১৫ মিনিট আগে' },
];

// Stats prop interface
interface FinalCTAProps {
  stats?: {
    totalUsers?: number;
    totalStores?: number;
    recentSignups?: Array<{
      name: string;
      city: string;
      timeAgo: string;
    }>;
  };
}

// ============================================================================
// LIVE NOTIFICATION COMPONENT
// ============================================================================
const LiveNotification = ({ recentSignups }: { recentSignups: typeof defaultRecentSignups }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (recentSignups.length === 0) return;
    
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % recentSignups.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [recentSignups.length]);

  if (recentSignups.length === 0) return null;
  const current = recentSignups[currentIndex];

  return (
    <motion.div
      className="inline-flex items-center gap-3 px-5 py-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="w-10 h-10 rounded-full bg-[#006A4E]/20 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Bell className="w-5 h-5 text-[#006A4E]" />
      </motion.div>
      
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm"
          >
            <span className="text-white/60">Live: </span>
            <span className="text-white font-medium">{current.name}</span>
            <span className="text-white/60"> from </span>
            <span className="text-[#F9A825]">{current.city}</span>
            <span className="text-white/40"> just signed up!</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Live indicator */}
      <motion.div
        className="w-2 h-2 rounded-full bg-green-500"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
};

// ============================================================================
// GLOWING CTA BUTTON
// ============================================================================
const GlowingCTAButton = () => {
  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-1 rounded-2xl blur-xl opacity-60"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.accent})`,
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Button */}
      <Link
        to="/auth/register"
        className="relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold text-xl rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-[#006A4E]/50"
        style={{
          boxShadow: `0 0 40px ${COLORS.primary}40`,
        }}
      >
        <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
          ফ্রিতে শুরু করুন
        </span>
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight className="w-6 h-6" />
        </motion.span>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// TRUST BADGES
// ============================================================================
const TrustBadges = () => {
  const badges = [
    { icon: Check, text: 'Credit Card লাগবে না' },
    { icon: Check, text: '১ মিনিটে Setup' },
    { icon: Sparkles, text: 'Lifetime Early Bird Pricing' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2 text-white/60 text-sm"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <badge.icon className="w-4 h-4 text-[#006A4E]" />
          <span>{badge.text}</span>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// DECORATIVE DIAMONDS
// ============================================================================
const DecorativeDiamonds = () => {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          <Diamond 
            className={`w-3 h-3 ${
              i % 4 === 0 ? 'text-[#006A4E]' : 
              i % 4 === 1 ? 'text-[#F9A825]' : 
              i % 4 === 2 ? 'text-[#8B5CF6]' : 
              'text-white/20'
            }`} 
            fill="currentColor"
          />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN FINAL CTA COMPONENT
// ============================================================================
export function FinalCTA({ stats }: FinalCTAProps) {
  // Only use real data - don't show fake signups
  const recentSignups = stats?.recentSignups ?? [];
  const totalUsers = stats?.totalUsers || 0;
  
  return (
    <section 
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orb - top left */}
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Gradient orb - bottom right */}
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.violet}15 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Dotted grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Decorative Diamonds */}
        <DecorativeDiamonds />

        {/* Main Headline */}
        <ScrollReveal>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            আজই শুরু করুন,{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
              }}
            >
              Future Build
            </span>{' '}
            করুন
          </h2>
        </ScrollReveal>

        {/* Mission Statement Card */}
        <motion.div
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p 
            className="text-xl md:text-2xl text-white/80 leading-relaxed mb-6"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            আমরা Bangladesh এর প্রথম সত্যিকারের বাংলা E-commerce Platform বানাচ্ছি।
          </p>
          <p 
            className="text-lg text-white/60"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            আপনি কি আমাদের সাথে এই Journey তে থাকতে চান?
          </p>
        </motion.div>

        {/* Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <GlowingCTAButton />
        </motion.div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 my-10">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-white/40 text-sm">অথবা</span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Secondary CTAs */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="tel:+8801570260118"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Phone className="w-4 h-4" />
            <span>📞 আমাদের সাথে কথা বলুন</span>
          </Link>
          
          <Link
            to="/contact"
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
            <span>📧 Question আছে?</span>
          </Link>
        </motion.div>

        {/* Live Notification - Only show when real signups exist */}
        {recentSignups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <LiveNotification recentSignups={recentSignups} />
          </motion.div>
        )}

      </div>
    </section>
  );
}

export default FinalCTA;
