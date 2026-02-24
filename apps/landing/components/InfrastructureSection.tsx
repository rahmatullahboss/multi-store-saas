'use client';

/**
 * UI/UX Pro Max - Infrastructure Section
 *
 * Showcases Cloudflare CDN's global infrastructure with:
 * - "Liquid Glass" World Map
 * - Hover Tilt Cards for Stats
 * - Interactive Server Nodes
 */

import { useRef, useEffect, useState, type MouseEvent } from 'react';
import { Zap, Shield, Clock, Server, type LucideIcon } from 'lucide-react';
import { ClientOnly } from '@/components/LazySection';
import { ScrollReveal } from '@/components/animations';

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

// ============================================================================
// MAP VISUALIZATION - LIQUID GLASS STYLE
// ============================================================================
const WorldMap = () => {
  // Simplified World Map Pattern (Abstract Representation)
  const DOTS = [
    // North America
    { x: 15, y: 25 },
    { x: 18, y: 28 },
    { x: 22, y: 32 },
    { x: 12, y: 35 },
    { x: 25, y: 35 },
    { x: 28, y: 38 },
    // South America
    { x: 28, y: 60 },
    { x: 32, y: 65 },
    { x: 30, y: 72 },
    // Europe
    { x: 48, y: 25 },
    { x: 52, y: 28 },
    { x: 50, y: 32 },
    { x: 45, y: 28 },
    // Africa
    { x: 50, y: 50 },
    { x: 55, y: 55 },
    { x: 52, y: 65 },
    { x: 48, y: 58 },
    // Asia
    { x: 65, y: 25 },
    { x: 70, y: 28 },
    { x: 75, y: 32 },
    { x: 80, y: 35 },
    { x: 68, y: 42 },
    { x: 72, y: 45 },
    // Australia
    { x: 85, y: 70 },
    { x: 88, y: 75 },
  ];

  const SERVERS = [
    { id: 'dhaka', x: 68, y: 42, name: 'Dhaka (Edge)', type: 'edge' },
    { id: 'singapore', x: 72, y: 55, name: 'Singapore', type: 'relay' },
    { id: 'london', x: 45, y: 28, name: 'London', type: 'relay' },
    { id: 'newyork', x: 25, y: 35, name: 'New York', type: 'relay' },
  ];

  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[2/1] bg-white/5 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm"
    >
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00DDA2]/10 via-transparent to-blue-500/10 mix-blend-overlay" />

      {/* Map Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.3,
        }}
      />

      {/* Dots */}
      {DOTS.map((dot, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white/20"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
        />
      ))}

      {/* Server Nodes */}
      {SERVERS.map((server) => (
        <div
          key={server.id}
          className="absolute"
          style={{
            left: `${server.x}%`,
            top: `${server.y}%`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'scale(1)' : 'scale(0)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          }}
        >
          {/* Ping Wave — CSS keyframe animation */}
          <div
            className={`absolute -inset-4 rounded-full border ${server.type === 'edge' ? 'border-[#00DDA2]' : 'border-blue-500'}`}
            style={{ animation: 'ping-wave 2s ease-out infinite' }}
          />
          {/* Core */}
          <div
            className={`w-3 h-3 rounded-full relative z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${server.type === 'edge' ? 'bg-[#00DDA2]' : 'bg-blue-500'}`}
          />

          {/* Label */}
          <div
            className={`absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-2 py-0.5 rounded ${server.type === 'edge' ? 'bg-[#00DDA2] text-black' : 'bg-black/50 text-white backdrop-blur-md'}`}
          >
            {server.name}
          </div>
        </div>
      ))}

      {/* Connection Lines (Simulated) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <path
          d="M 68 42 L 72 55 M 68 42 L 45 28 M 68 42 L 25 35"
          stroke="#00DDA2"
          strokeWidth="0.5"
          fill="none"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: inView ? 0 : 200,
            transition: 'stroke-dashoffset 2s ease-out',
          }}
        />
      </svg>

      {/* CSS keyframe for ping wave */}
      <style>{`
        @keyframes ping-wave {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// STAT CARD WITH CSS HOVER TILT EFFECT
// ============================================================================
const StatCard3D = ({
  icon: Icon,
  value,
  label,
  sublabel,
  color,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  sublabel: string;
  color: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 10;
    const rotateY = (x / rect.width) * 10;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden group"
      style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
    >
      {/* Glare Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color}15, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>

        <div className="text-4xl font-bold text-white mb-2 tracking-tight">{value}</div>
        <div className="text-white/70 font-medium mb-1">{label}</div>
        <div className="text-white/30 text-xs mt-auto">{sublabel}</div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function InfrastructureSection() {
  const { ref: badgeRef, inView: badgeInView } = useInView(0.1);

  return (
    <section className="py-24 relative bg-[#050807] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#00DDA2]/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00DDA2]/30 bg-[#00DDA2]/10 backdrop-blur-sm mb-6"
              style={{
                opacity: badgeInView ? 1 : 0,
                transform: badgeInView ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
              }}
            >
              <Zap className="w-4 h-4 text-[#00DDA2]" />
              <span className="text-sm font-bold text-[#00DDA2] uppercase tracking-wider">
                Enterprise Grade
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              বিশ্বমানের <span className="text-[#00DDA2]">ইনফ্রাস্ট্রাকচার</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Cloudflare CDN এর মাধ্যমে আপনার ওয়েবসাইট লোড হবে চোখের পলকে, বিশ্বের যেকোনো প্রান্ত
              থেকে।
            </p>
          </div>
        </ScrollReveal>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Map Area (Spans 8 cols) */}
          <div className="lg:col-span-8">
            <ClientOnly
              fallback={<div className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />}
            >
              <WorldMap />
            </ClientOnly>
          </div>

          {/* Key Stats (Spans 4 cols - Vertical Stack) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <StatCard3D
              icon={Server}
              value="330+"
              label="Global Cities"
              sublabel="Data Centers Worldwide"
              color="#00DDA2"
            />
            <StatCard3D
              icon={Clock}
              value="<50ms"
              label="Latency (Dhaka)"
              sublabel="Blazing Fast Local Access"
              color="#22D3EE"
            />
            <StatCard3D
              icon={Shield}
              value="100%"
              label="DDoS Protected"
              sublabel="Enterprise Security Standard"
              color="#F9A825"
            />
          </div>
        </div>

        {/* Brands Ticker */}
        <div className="border-t border-white/5 pt-12">
          <p className="text-center text-white/30 text-sm font-medium uppercase tracking-widest mb-8">
            Trusted Technology Partners
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale mix-blend-screen">
            {/* Simple Text Logos for Cleanliness */}
            <h3 className="text-xl font-bold text-white">Cloudflare</h3>
            <h3 className="text-xl font-bold text-white">Remix</h3>
            <h3 className="text-xl font-bold text-white">React</h3>
            <h3 className="text-xl font-bold text-white">PostgreSQL</h3>
            <h3 className="text-xl font-bold text-white">Prisma</h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InfrastructureSection;
