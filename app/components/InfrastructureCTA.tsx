/**
 * Infrastructure CTA Section
 * 
 * Final call-to-action for the infrastructure showcase.
 * "এই Enterprise Technology ব্যবহার করুন — FREE!"
 */

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from '@remix-run/react';
import { ArrowRight, Sparkles, Zap, Shield, Globe, Clock } from 'lucide-react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  accent: '#F9A825',
  cyan: '#22D3EE',
  green: '#10B981',
  background: '#0A0F0D',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
};

// ============================================================================
// BENEFIT PILL
// ============================================================================
const BenefitPill = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <motion.div
    className="flex items-center gap-2 px-4 py-2 rounded-full"
    style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}
    whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.2)' }}
  >
    <Icon className="w-4 h-4 text-green-400" />
    <span className="text-sm text-white/80">{text}</span>
  </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function InfrastructureCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.background} 50%, ${COLORS.cyan}10 100%)`,
      }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
        style={{ background: `${COLORS.primary}20` }}
        animate={{ 
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
        style={{ background: `${COLORS.cyan}20` }}
        animate={{ 
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Sparkle badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent}20 0%, ${COLORS.accent}10 100%)`,
            border: `1px solid ${COLORS.accent}40`,
          }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
          </motion.div>
          <span className="text-sm font-medium" style={{ color: COLORS.accent }}>
            Enterprise Technology, Startup Price
          </span>
        </motion.div>
        
        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
        >
          যে Technology তে{' '}
          <span 
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${COLORS.cyan} 0%, ${COLORS.green} 100%)`,
            }}
          >
            বড়রা Millions খরচ করে
          </span>
          {' '}—
          <br />
          সেটা আপনার জন্য{' '}
          <motion.span
            className="inline-block"
            animate={{ 
              scale: [1, 1.1, 1],
              textShadow: [
                `0 0 10px ${COLORS.accent}00`,
                `0 0 30px ${COLORS.accent}80`,
                `0 0 10px ${COLORS.accent}00`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: COLORS.accent }}
          >
            FREE!
          </motion.span>
        </motion.h2>
        
        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          Facebook, Google, Shopify যে Infrastructure ব্যবহার করে — 
          সেই একই Cloudflare Technology আপনার Store এ আজই Activate করুন।
        </motion.p>
        
        {/* Benefit pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          <BenefitPill icon={Zap} text="<10ms Latency" />
          <BenefitPill icon={Shield} text="Enterprise Security" />
          <BenefitPill icon={Globe} text="310+ Global Servers" />
          <BenefitPill icon={Clock} text="99.99% Uptime" />
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/auth/register"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                boxShadow: `0 0 40px ${COLORS.primary}60`,
              }}
            >
              {/* Glow animation */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.accent} 100%)`,
                }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <span className="relative text-white" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                ফ্রিতে শুরু করুন
              </span>
              <motion.span
                className="relative"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </motion.span>
            </Link>
          </motion.div>
          
          {/* Secondary CTA */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link
              to="#demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white/80 hover:text-white transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>ডেমো দেখুন</span>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-sm mt-8"
          style={{ color: COLORS.textMuted }}
        >
          ✓ No credit card required &nbsp;•&nbsp; ✓ Setup in 5 minutes &nbsp;•&nbsp; ✓ Free forever plan
        </motion.p>
      </div>
    </section>
  );
}

export default InfrastructureCTA;
