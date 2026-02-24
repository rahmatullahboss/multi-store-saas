'use client';

/**
 * ServerSideTrackingSection
 *
 * Marketing section for Server-Side Tracking & Facebook Conversions API feature.
 * Inspired by best-in-class SaaS landing pages (Northbeam, Triple Whale, Segment).
 *
 * Key messaging pillars:
 * 1. Ad blocker bypass — never miss a conversion
 * 2. iOS 14+ / privacy-first world — server sends data directly
 * 3. Better ROAS — accurate data = smarter ad spend
 * 4. Zero setup complexity — one click in dashboard
 */

import { useRef, useState } from 'react';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Eye,
  Server,
  Globe,
  BarChart3,
  Lock,
  CheckCircle2,
  ArrowRight,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

// ─── tiny helpers ────────────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
      {children}
    </span>
  );
}

function SectionHeading({ title, subtitle }: { title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Comparison diagram: Browser Pixel vs Server CAPI ───────────────────────

function TrackingComparisonDiagram() {
  const [activeTab, setActiveTab] = useState<'browser' | 'server'>('browser');

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('browser')}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
            activeTab === 'browser'
              ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <WifiOff className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
          Browser Pixel (পুরনো পদ্ধতি)
        </button>
        <button
          onClick={() => setActiveTab('server')}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
            activeTab === 'server'
              ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Server className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
          Server-Side CAPI (Ozzyl পদ্ধতি)
        </button>
      </div>

      <div className="p-5 md:p-6 min-h-[220px]">
        {activeTab === 'browser' ? (
          <div className="space-y-3">
            {[
              { icon: WifiOff, color: 'text-red-400', label: 'Ad blocker ব্লক করে', blocked: true },
              { icon: WifiOff, color: 'text-red-400', label: 'iOS 14+ ITP কুকি মুছে দেয়', blocked: true },
              { icon: WifiOff, color: 'text-red-400', label: 'Slow JS → conversion miss', blocked: true },
              { icon: WifiOff, color: 'text-red-400', label: 'Browser crash = ডেটা হারায়', blocked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                <span className="text-white/60 text-sm">{item.label}</span>
                <span className="ml-auto text-xs text-red-400 font-bold">BLOCKED</span>
              </div>
            ))}
            <p className="text-center text-red-400/80 text-xs mt-2 font-medium">
              গড়ে ৪০–৬০% conversion miss হয় 😞
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Customer order করে', step: '1' },
              { label: 'Ozzyl server সাথে সাথে Meta-তে পাঠায়', step: '2' },
              { label: 'Ad blocker? iOS? — কোনো বাধা নেই', step: '3' },
              { label: 'আপনার ROAS সঠিকভাবে দেখায়', step: '4' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </span>
                <span className="text-white/70 text-sm">{item.label}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />
              </div>
            ))}
            <p className="text-center text-emerald-400/80 text-xs mt-2 font-medium">
              ৯৮%+ conversion accuracy ✅
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stats row ───────────────────────────────────────────────────────────────

const STATS = [
  { value: '40–60%', label: 'Conversion miss হয় ব্রাউজার পিক্সেলে', color: 'text-red-400' },
  { value: '98%+', label: 'Accuracy আমাদের server tracking-এ', color: 'text-emerald-400' },
  { value: '3x', label: 'Better ROAS accurate data দিয়ে', color: 'text-blue-400' },
];

// ─── Feature cards ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    title: 'Ad Blocker Bypass',
    desc: 'আপনার customer ad blocker use করলেও purchase event সরাসরি Meta server-এ পৌঁছায়। একটা conversion-ও miss হয় না।',
  },
  {
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'iOS 14+ Privacy Ready',
    desc: 'Apple-এর ITP এবং ATT framework আপনার tracking ভাঙতে পারবে না। Server থেকে সরাসরি data পাঠানো হয়।',
  },
  {
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    title: 'উন্নত Match Rate',
    desc: 'Email, phone, city — সব data SHA-256 hash করে Meta-তে পাঠানো হয়। Event Match Quality (EMQ) score অনেক বেশি।',
  },
  {
    icon: RefreshCw,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    title: 'Deduplication বিল্ট-ইন',
    desc: 'Browser pixel এবং server CAPI একই সাথে চলে। Unique event_id দিয়ে duplicate গণনা আটকানো হয় automatically।',
  },
  {
    icon: BarChart3,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    title: 'সঠিক ROAS রিপোর্ট',
    desc: 'Facebook Ads Manager-এ সঠিক conversion data দেখুন। সঠিক data মানে সঠিক বিজ্ঞাপনে বিনিয়োগ — বেশি profit।',
  },
  {
    icon: Lock,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    title: '১ ক্লিকে সেটআপ',
    desc: 'Pixel ID এবং Access Token বসান। Ozzyl বাকি সব করবে। কোনো code লাগবে না, কোনো developer লাগবে না।',
  },
];

// ─── Event flow visual ───────────────────────────────────────────────────────

const EVENTS_TRACKED = [
  { name: 'PageView', desc: 'প্রতিটি পেজ ভিজিট', color: '#60a5fa' },
  { name: 'ViewContent', desc: 'পণ্য দেখা', color: '#34d399' },
  { name: 'AddToCart', desc: 'কার্টে যোগ', color: '#f59e0b' },
  { name: 'InitiateCheckout', desc: 'চেকআউট শুরু', color: '#a78bfa' },
  { name: 'Purchase', desc: 'অর্ডার সম্পন্ন ✓', color: '#10b981' },
];

function EventFlowVisual() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">
        Tracked Events (Server + Browser)
      </p>
      <div className="flex flex-col gap-2">
        {EVENTS_TRACKED.map((ev, i) => (
          <div key={ev.name} className="flex items-center gap-3">
            {/* connector line */}
            <div className="flex flex-col items-center">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ev.color, boxShadow: `0 0 0 2px #0A0A0F, 0 0 0 4px ${ev.color}` }}
              />
              {i < EVENTS_TRACKED.length - 1 && (
                <div className="w-px h-5 bg-white/10 my-0.5" />
              )}
            </div>
            <div className="flex items-center justify-between flex-1 py-1">
              <span className="font-mono text-sm font-semibold" style={{ color: ev.color }}>
                {ev.name}
              </span>
              <span className="text-white/40 text-xs">{ev.desc}</span>
              <div className="flex gap-1 ml-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono">Browser</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Server</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Setup steps ─────────────────────────────────────────────────────────────

const SETUP_STEPS = [
  { step: '01', title: 'Facebook Pixel ID', desc: 'Events Manager থেকে আপনার Pixel ID কপি করুন' },
  { step: '02', title: 'Access Token', desc: 'Conversions API access token generate করুন' },
  { step: '03', title: 'Ozzyl Dashboard-এ বসান', desc: 'Settings → Analytics → Facebook CAPI-তে paste করুন' },
  { step: '04', title: 'Done! 🎉', desc: 'সব conversion এখন server থেকে track হচ্ছে' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function ServerSideTrackingSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[#0A0A0F]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="text-center mb-14 md:mb-20">
          <Badge>
            <Server className="w-3.5 h-3.5" />
            Server-Side Tracking
          </Badge>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            আর কোনো{' '}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Conversion Miss
            </span>{' '}
            না
          </h2>
          <p className="text-white/50 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            Facebook Conversions API দিয়ে সরাসরি server থেকে Meta-তে data পাঠান।
            Ad blocker, iOS 14+, browser crash — কোনো কিছুই আপনার{' '}
            <span className="text-white/80 font-medium">ROAS</span> নষ্ট করতে পারবে না।
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 max-w-3xl mx-auto">
          {STATS.map((stat) => (
            <div
              key={stat.value}
              className="text-center p-4 rounded-2xl border border-white/8 bg-white/[0.03]"
            >
              <div className={`text-2xl md:text-4xl font-bold mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-white/40 text-xs md:text-sm leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main 2-col: comparison + event flow ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 md:mb-16">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
              পুরনো vs নতুন পদ্ধতি
            </p>
            <TrackingComparisonDiagram />
          </div>
          <div>
            <EventFlowVisual />
          </div>
        </div>

        {/* ── Feature cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 md:mb-20">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className={`group p-5 md:p-6 rounded-2xl border ${feat.border} bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300`}
            >
              <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center mb-4`}>
                <feat.icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{feat.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Setup steps ── */}
        <div className="max-w-3xl mx-auto mb-14">
          <p className="text-center text-white/40 text-xs uppercase tracking-widest font-semibold mb-8">
            মাত্র ৪ ধাপে সক্রিয় করুন
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SETUP_STEPS.map((s) => (
              <div
                key={s.step}
                className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/8"
              >
                <span className="text-2xl font-black text-white/10 font-mono leading-none flex-shrink-0 pt-0.5">
                  {s.step}
                </span>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-0.5">{s.title}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA strip ── */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 p-8 md:p-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-semibold">এখনই সক্রিয়</span>
          </div>
          <h3 className="text-white text-2xl md:text-3xl font-bold mb-3">
            প্রতিটি conversion track করুন — সার্ভার থেকে সরাসরি
          </h3>
          <p className="text-white/50 mb-6 max-w-lg mx-auto text-sm md:text-base">
            Ozzyl-এর সাথে আপনার Facebook Ads আরও স্মার্ট হবে। সঠিক data, সঠিক অপটিমাইজেশন, বেশি profit।
          </p>
          <a
            href="https://app.ozzyl.com/auth/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-full text-sm md:text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-[0.98] transition-all duration-200"
          >
            এখনই শুরু করুন
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-white/25 text-xs mt-4">
            ফ্রি ট্রায়াল • কোনো credit card লাগবে না • ১ মিনিটে সেটআপ
          </p>
        </div>

      </div>
    </section>
  );
}
