/**
 * Infrastructure Section - Enterprise Speed, Startup Price
 * 
 * Showcases Cloudflare CDN's global infrastructure with:
 * - Animated world map with pulsing server locations
 * - Data packet animations flowing from Bangladesh to edge servers
 * - Real-time latency counter
 * - Brand trust bar with infinite scroll
 * 
 * Design: Dark mode with Bangladesh-inspired accents
 */

import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Globe, Zap, Shield, Clock, Server, Activity } from 'lucide-react';

// ============================================================================
// DESIGN TOKENS - Matching Hero theme
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  primaryLight: '#00875F',
  primaryDark: '#004D38',
  accent: '#F9A825',       // Golden Yellow
  accentLight: '#FFB74D',
  cyan: '#22D3EE',         // Data flow color
  purple: '#A855F7',       // Secondary accent
  background: '#0A0F0D',
  backgroundAlt: '#0D1512',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
};

// ============================================================================
// SERVER LOCATIONS DATA
// ============================================================================
const SERVER_LOCATIONS = [
  // Asia Pacific
  { id: 'dhaka', x: 68, y: 42, name: 'Dhaka', isHome: true },
  { id: 'singapore', x: 72, y: 55, name: 'Singapore', delay: 0.2 },
  { id: 'tokyo', x: 82, y: 35, name: 'Tokyo', delay: 0.4 },
  { id: 'sydney', x: 85, y: 72, name: 'Sydney', delay: 0.6 },
  { id: 'mumbai', x: 60, y: 45, name: 'Mumbai', delay: 0.1 },
  { id: 'hongkong', x: 75, y: 43, name: 'Hong Kong', delay: 0.3 },
  
  // Europe
  { id: 'london', x: 45, y: 28, name: 'London', delay: 0.5 },
  { id: 'frankfurt', x: 48, y: 30, name: 'Frankfurt', delay: 0.7 },
  { id: 'paris', x: 46, y: 32, name: 'Paris', delay: 0.8 },
  { id: 'amsterdam', x: 47, y: 27, name: 'Amsterdam', delay: 0.9 },
  
  // Americas
  { id: 'newyork', x: 25, y: 35, name: 'New York', delay: 0.3 },
  { id: 'sanfran', x: 12, y: 38, name: 'San Francisco', delay: 0.4 },
  { id: 'saopaulo', x: 30, y: 68, name: 'São Paulo', delay: 0.6 },
  { id: 'toronto', x: 22, y: 32, name: 'Toronto', delay: 0.5 },
  
  // Middle East & Africa
  { id: 'dubai', x: 55, y: 42, name: 'Dubai', delay: 0.2 },
  { id: 'johannesburg', x: 52, y: 70, name: 'Johannesburg', delay: 0.8 },
];

// ============================================================================
// BRAND LOGOS (Companies using Cloudflare)
// ============================================================================
const TRUSTED_BRANDS = [
  { name: 'Discord', logo: 'discord' },
  { name: 'Shopify', logo: 'shopify' },
  { name: 'Canva', logo: 'canva' },
  { name: 'DHL', logo: 'dhl' },
  { name: 'IBM', logo: 'ibm' },
  { name: 'Zendesk', logo: 'zendesk' },
  { name: 'Udemy', logo: 'udemy' },
  { name: 'OkCupid', logo: 'okcupid' },
];

// ============================================================================
// DOTTED WORLD MAP - CDN Style Visualization
// ============================================================================
// Each 1 represents a dot, 0 is empty space
// This creates a recognizable world map silhouette
const WORLD_MAP_DOTS = [
  // Row 0-4: Top (Arctic/Northern regions)
  '00000000000000001111110000001111111100000011111100000000000',
  '00000000000000111111111000111111111110000111111110000000000',
  '00000000000001111111111101111111111111001111111111000000000',
  '00000000000011111111111111111111111111111111111111100000000',
  '00000000000111111111111111111111111111111111111111110000000',
  // Row 5-9: North America and Eurasia
  '00000000001111111111111111111111111111111111111111111000000',
  '00000000011111111111111111111111111111111111111111111100000',
  '00000000111111111111111001111111111111111111111111111110000',
  '00000001111111111111100001111111111111111111111111111111000',
  '00000011111111111111000011111111111111111111111111111111100',
  // Row 10-14: Central regions
  '00000111111111111100000111111111111111111111111111111111110',
  '00001111111111111000000011111111111111111111111111111111111',
  '00011111111111110000000001111111111111111111111111111111110',
  '00011111111111100000000000111111111111111111111111111111100',
  '00001111111111000000000000011111111100111111111111111110000',
  // Row 15-19: Central/Tropical regions  
  '00001111111100000000000000111111100000011111111111111000000',
  '00000111111000000000000001111110000000011111111111110000000',
  '00000011110000000000000011111100000000001111111111100000000',
  '00000001100000000000000111111000000000000111111111000000000',
  '00000000100000000000001111110000000000000011111110000000000',
  // Row 20-24: South America and Africa  
  '00000000000000000000011111100000000000000001111100000000000',
  '00000000000000000000111111000000000000000000111000000011100',
  '00000000000000000001111110000000000000000000110000000111110',
  '00000000000000000001111100000000000000000000000000001111110',
  '00000000000000000000111100000000000000000000000000011111110',
  // Row 25-29: Southern regions
  '00000000000000000000011000000000000000000000000000111111100',
  '00000000000000000000001000000000000000000000000001111111000',
  '00000000000000000000000000000000000000000000000011111110000',
  '00000000000000000000000000000000000000000000000011111100000',
  '00000000000000000000000000000000000000000000000001111000000',
];

const WorldMapSVG = () => {
  const dotSize = 0.8;
  const spacing = 1.7;
  
  return (
    <svg
      viewBox="0 0 100 55"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Glow filter for dots */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Gradient for connection lines */}
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.cyan} stopOpacity="0" />
          <stop offset="50%" stopColor={COLORS.cyan} stopOpacity="0.8" />
          <stop offset="100%" stopColor={COLORS.cyan} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Render dotted world map */}
      {WORLD_MAP_DOTS.map((row, rowIndex) => (
        <g key={rowIndex}>
          {row.split('').map((cell, colIndex) => {
            if (cell === '1') {
              // Bangladesh region highlight (around x:65-72, y:8-14)
              const x = colIndex * spacing + 2;
              const y = rowIndex * spacing + 2;
              const isBangladeshRegion = x >= 63 && x <= 75 && y >= 15 && y <= 30;
              
              return (
                <circle
                  key={`${rowIndex}-${colIndex}`}
                  cx={x}
                  cy={y}
                  r={dotSize}
                  fill={isBangladeshRegion ? COLORS.primary : `rgba(34, 211, 238, 0.4)`}
                  opacity={isBangladeshRegion ? 0.8 : 0.5}
                />
              );
            }
            return null;
          })}
        </g>
      ))}
    </svg>
  );
};

// ============================================================================
// PULSING SERVER DOT
// ============================================================================
interface ServerDotProps {
  x: number;
  y: number;
  isHome?: boolean;
  delay?: number;
  name: string;
}

const ServerDot = ({ x, y, isHome, delay = 0, name }: ServerDotProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay + 0.5, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer pulse ring */}
      <motion.div
        className="absolute -inset-3 rounded-full"
        style={{
          background: isHome 
            ? `radial-gradient(circle, ${COLORS.accent}40 0%, transparent 70%)`
            : `radial-gradient(circle, ${COLORS.cyan}30 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          delay: delay,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      
      {/* Main dot */}
      <motion.div
        className="w-2 h-2 rounded-full relative"
        style={{
          background: isHome 
            ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`
            : `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.primary})`,
          boxShadow: isHome
            ? `0 0 10px ${COLORS.accent}80`
            : `0 0 8px ${COLORS.cyan}60`,
        }}
        animate={isHovered ? { scale: 1.5 } : {}}
        transition={{ duration: 0.2 }}
      />
      
      {/* Tooltip */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 rounded bg-black/80 backdrop-blur-sm text-xs text-white whitespace-nowrap border border-white/10"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
      >
        {name}
        {isHome && <span className="ml-1">🇧🇩</span>}
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// DATA FLOW LINE ANIMATION
// ============================================================================
interface DataFlowLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay: number;
}

const DataFlowLine = ({ from, to, delay }: DataFlowLineProps) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <motion.line
        x1={`${from.x}%`}
        y1={`${from.y}%`}
        x2={`${to.x}%`}
        y2={`${to.y}%`}
        stroke={COLORS.cyan}
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 1.5, ease: 'easeOut' }}
      />
      
      {/* Animated data packet */}
      <motion.circle
        r="2"
        fill={COLORS.cyan}
        filter="url(#glow)"
        initial={{ opacity: 0 }}
        animate={{
          cx: [`${from.x}%`, `${to.x}%`],
          cy: [`${from.y}%`, `${to.y}%`],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          delay: delay + 1,
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
        style={{
          filter: `drop-shadow(0 0 4px ${COLORS.cyan})`,
        }}
      />
    </svg>
  );
};

// ============================================================================
// STAT CARD
// ============================================================================
interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  sublabel?: string;
  delay: number;
  color?: string;
}

const StatCard = ({ icon: Icon, value, label, sublabel, delay, color = COLORS.primary }: StatCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
    >
      <div 
        className="relative p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 group-hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
          }}
        />
        
        {/* Icon */}
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </motion.div>
        
        {/* Value */}
        <motion.div
          className="text-3xl md:text-4xl font-bold text-white mb-1"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: delay + 0.2, duration: 0.5, type: 'spring' }}
        >
          {value}
        </motion.div>
        
        {/* Label */}
        <p className="text-white/70 font-medium">{label}</p>
        {sublabel && (
          <p className="text-white/40 text-sm mt-1">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// BRAND LOGO (SVG icons for trusted brands)
// ============================================================================
const BrandLogo = ({ name }: { name: string }) => {
  // Simple text-based logos with styling
  return (
    <div className="flex items-center justify-center h-12 px-6 grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100">
      <span 
        className="text-xl font-bold tracking-tight"
        style={{ 
          fontFamily: "'Inter', sans-serif",
          color: COLORS.textMuted,
        }}
      >
        {name}
      </span>
    </div>
  );
};

// ============================================================================
// INFINITE SCROLL BRAND BAR
// ============================================================================
const BrandTrustBar = () => {
  const duplicatedBrands = [...TRUSTED_BRANDS, ...TRUSTED_BRANDS];
  
  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0F0D] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0F0D] to-transparent z-10" />
      
      {/* Scrolling container */}
      <motion.div
        className="flex items-center gap-12"
        animate={{ x: [0, -50 * TRUSTED_BRANDS.length] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          },
        }}
      >
        {duplicatedBrands.map((brand, index) => (
          <BrandLogo key={`${brand.name}-${index}`} name={brand.name} />
        ))}
      </motion.div>
    </div>
  );
};

// ============================================================================
// LIVE LATENCY COUNTER
// ============================================================================
const LiveLatencyCounter = () => {
  const [latency, setLatency] = useState(5);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate latency fluctuation between 3-8ms for Dhaka edge
      setLatency(3 + Math.floor(Math.random() * 6));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border"
      style={{
        background: `${COLORS.primary}10`,
        borderColor: `${COLORS.primary}30`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ background: COLORS.primary }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="text-sm" style={{ color: COLORS.textMuted }}>
        Live Latency:{' '}
        <motion.span
          className="font-mono font-bold"
          style={{ color: COLORS.primary }}
          key={latency}
          initial={{ opacity: 0.5, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {latency}ms
        </motion.span>
      </span>
    </motion.div>
  );
};

// ============================================================================
// MAIN INFRASTRUCTURE SECTION
// ============================================================================
export function InfrastructureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  // Find Dhaka location for data flow lines
  const dhakaLocation = SERVER_LOCATIONS.find(s => s.id === 'dhaka')!;
  const nearbyServers = SERVER_LOCATIONS.filter(s => 
    ['singapore', 'mumbai', 'hongkong', 'dubai'].includes(s.id)
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${COLORS.primary}15 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6"
            style={{ 
              backgroundColor: `${COLORS.cyan}10`,
              borderColor: `${COLORS.cyan}30`,
            }}
          >
            <Zap className="w-4 h-4" style={{ color: COLORS.cyan }} />
            <span style={{ color: COLORS.cyan }} className="text-sm font-medium">
              WORLD-CLASS INFRASTRUCTURE
            </span>
          </motion.div>
          
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }}
          >
            Facebook-Google এর Technology,{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.cyan} 100%)`,
              }}
            >
              আপনার হাতের মুঠোয়
            </span>
          </motion.h2>
          
          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto mb-6"
            style={{ color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            Cloudflare CDN দিয়ে আপনার Store, বিশ্বের যেকোনো জায়গা থেকে 
            <span className="text-white font-semibold"> ১ সেকেন্ডের কম সময়ে</span> লোড হবে।
          </motion.p>
          
          {/* Live latency indicator */}
          <div className="flex justify-center">
            <LiveLatencyCounter />
          </div>
        </div>
        
        {/* World Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative rounded-3xl overflow-hidden mb-16 mx-auto max-w-5xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Map container */}
          <div className="relative aspect-[2/1] p-8">
            {/* SVG World Map Background */}
            <div className="absolute inset-8 opacity-60">
              <WorldMapSVG />
            </div>
            
            {/* Data flow lines from Bangladesh to nearby servers */}
            {nearbyServers.map((server, index) => (
              <DataFlowLine
                key={server.id}
                from={{ x: dhakaLocation.x, y: dhakaLocation.y }}
                to={{ x: server.x, y: server.y }}
                delay={0.5 + index * 0.3}
              />
            ))}
            
            {/* Server location dots */}
            {SERVER_LOCATIONS.map((location) => (
              <ServerDot
                key={location.id}
                x={location.x}
                y={location.y}
                name={location.name}
                isHome={location.isHome}
                delay={location.delay || 0}
              />
            ))}
            
            {/* Legend */}
            <motion.div
              className="absolute bottom-4 left-4 flex items-center gap-6 text-xs"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: COLORS.accent }}
                />
                <span style={{ color: COLORS.textMuted }}>আপনার অবস্থান (BD)</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: COLORS.cyan }}
                />
                <span style={{ color: COLORS.textMuted }}>Edge Servers</span>
              </div>
            </motion.div>
            
            {/* Connection info badge */}
            <motion.div
              className="absolute top-4 right-4 px-3 py-2 rounded-lg backdrop-blur-sm border"
              style={{
                background: 'rgba(0,0,0,0.5)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4" style={{ color: COLORS.primary }} />
                <span style={{ color: COLORS.textMuted }}>
                  Nearest: <span className="text-white font-medium">Dhaka Edge (~5ms) 🇧🇩</span>
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatCard
            icon={Server}
            value="310+"
            label="Global Servers"
            sublabel="৬ মহাদেশে ছড়িয়ে"
            delay={0.4}
            color={COLORS.primary}
          />
          <StatCard
            icon={Clock}
            value="<10ms"
            label="Loading Time"
            sublabel="ঢাকা Edge Server থেকে"
            delay={0.5}
            color={COLORS.cyan}
          />
          <StatCard
            icon={Shield}
            value="99.99%"
            label="Uptime Guarantee"
            sublabel="এন্টারপ্রাইজ রিলায়েবিলিটি"
            delay={0.6}
            color={COLORS.accent}
          />
        </div>
        
        {/* Brand Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p 
            className="text-sm mb-4 flex items-center justify-center gap-2"
            style={{ color: COLORS.textSubtle, fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            <Globe className="w-4 h-4" />
            যারা Cloudflare ব্যবহার করে:
          </p>
          
          <BrandTrustBar />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
            className="text-xs mt-4"
            style={{ color: COLORS.textSubtle }}
          >
            এবং আরো ৪০+ মিলিয়ন ওয়েবসাইট
          </motion.p>
        </motion.div>
        
        {/* Bottom message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}10 0%, ${COLORS.cyan}10 100%)`,
              borderColor: `${COLORS.primary}30`,
            }}
          >
            <Zap className="w-5 h-5" style={{ color: COLORS.accent }} />
            <span style={{ color: COLORS.text, fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              <span className="font-semibold">Enterprise Speed</span>,{' '}
              <span style={{ color: COLORS.accent }}>Startup Price</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default InfrastructureSection;
