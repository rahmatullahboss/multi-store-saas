'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle2,
  ArrowRight,
  Globe,
  ShieldCheck,
  Zap,
  Building2,
  Store,
  Settings2,
} from 'lucide-react';

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

// Payment gateway data with real branding colors
const GATEWAYS = [
  {
    name: 'bKash',
    type: 'gateway',
    color: '#E2136E',
    desc: 'Tokenized Gateway API',
    badge: 'পেইড প্ল্যান',
    badgeColor: '#E2136E',
  },
  {
    name: 'Nagad',
    type: 'gateway',
    color: '#ED0A24',
    desc: 'Direct Gateway API',
    badge: 'পেইড প্ল্যান',
    badgeColor: '#ED0A24',
  },
  {
    name: 'SSLCommerz',
    type: 'card',
    color: '#1B4F8A',
    desc: 'Card, Net Banking, MFS',
    badge: 'সব প্ল্যান',
    badgeColor: '#10B981',
  },
  {
    name: 'Rocket',
    type: 'manual',
    color: '#8C3494',
    desc: 'Manual Payment',
    badge: 'ফ্রি',
    badgeColor: '#6B7280',
  },
  {
    name: 'COD',
    type: 'cod',
    color: '#F59E0B',
    desc: 'Cash on Delivery',
    badge: 'সব প্ল্যান',
    badgeColor: '#10B981',
  },
  {
    name: 'Stripe',
    type: 'card',
    color: '#635BFF',
    desc: 'International Cards',
    badge: 'পেইড প্ল্যান',
    badgeColor: '#8B5CF6',
  },
];

const FEATURES = [
  {
    icon: Building2,
    titleBn: 'Platform Gateway',
    description: 'SSLCommerz সেটআপ ছাড়াই ব্যবহার করুন — প্ল্যাটফর্মের account দিয়ে সব merchant কাজ করতে পারবে।',
    color: '#1B4F8A',
  },
  {
    icon: Store,
    titleBn: 'Per-Store Gateway',
    description: 'নিজের bKash Merchant, Nagad বা SSLCommerz account যুক্ত করুন — সরাসরি আপনার account এ পেমেন্ট আসবে।',
    color: '#E2136E',
  },
  {
    icon: ShieldCheck,
    titleBn: 'Webhook Verification',
    description: 'Redirect শুধু UI — আসল confirmation আসে webhook থেকে। Payment কখনো miss হয় না।',
    color: '#10B981',
  },
  {
    icon: Lock,
    titleBn: 'Encrypted Credentials',
    description: 'Merchant এর Gateway credentials encrypted ভাবে store হয়। কেউ দেখতে পাবে না।',
    color: '#F59E0B',
  },
  {
    icon: Zap,
    titleBn: 'Instant Confirmation',
    description: 'পেমেন্ট সফল হলে সাথে সাথে order confirm, SMS যায়, inventory update হয়।',
    color: '#8B5CF6',
  },
  {
    icon: Settings2,
    titleBn: '১ ক্লিকে Setup',
    description: 'Settings > Payment এ গিয়ে API key দিন — ব্যস, আপনার স্টোরে gateway active।',
    color: '#EC4899',
  },
];

const STEPS = [
  { title: 'অর্ডার প্লেস', desc: 'কাস্টমার প্রোডাক্ট কিনলে checkout এ যাবে', icon: CreditCard },
  { title: 'পেমেন্ট মেথড', desc: 'bKash, Nagad, SSLCommerz বা COD বেছে নেবে', icon: Smartphone },
  { title: 'নিরাপদ ভেরিফাই', desc: 'Webhook দিয়ে double-confirm — কোনো fraud নেই', icon: Lock },
  { title: 'অর্ডার কনফার্ম!', desc: 'সাথে সাথে SMS + inventory update', icon: CheckCircle2 },
];

export function PaymentIntegrationSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeGateway, setActiveGateway] = useState(0);

  const { ref: headerRef, inView: headerInView } = useInView(0.15);
  const { ref: stepsRef, inView: stepsInView } = useInView(0.1);
  const { ref: featuresRef, inView: featuresInView } = useInView(0.1);
  const { ref: phoneRef, inView: phoneInView } = useInView(0.1);
  const { ref: statsRef, inView: statsInView } = useInView(0.1);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    const gwInterval = setInterval(() => {
      setActiveGateway((prev) => (prev + 1) % GATEWAYS.length);
    }, 1800);
    return () => {
      clearInterval(stepInterval);
      clearInterval(gwInterval);
    };
  }, []);

  const currentGateway = GATEWAYS[activeGateway];
  const showSuccess = activeStep === 3;

  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            ref={headerRef}
            className={`transition-all duration-700 ease-out ${
              headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
              <CreditCard className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-400">Payment Integration</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              পেমেন্ট নিয়ে নেই কোনো টেনশন,<br />
              প্রতিটি{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                Transaction
              </span>{' '}
              সুরক্ষিত
            </h2>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              বিকাশ Gateway API, নগদ, SSLCommerz থেকে COD — সব পেমেন্ট এক প্ল্যাটফর্মে। নিজের account দিলে সরাসরি আপনার কাছে টাকা আসবে।
            </p>
          </div>
        </div>

        {/* Top: Gateway Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {GATEWAYS.map((gw, i) => (
            <button
              key={gw.name}
              onClick={() => setActiveGateway(i)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300"
              style={{
                background: activeGateway === i ? `${gw.color}20` : 'rgba(255,255,255,0.03)',
                borderColor: activeGateway === i ? `${gw.color}60` : 'rgba(255,255,255,0.08)',
                color: activeGateway === i ? gw.color : '#9CA3AF',
              }}
            >
              {gw.name}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: `${gw.badgeColor}20`, color: gw.badgeColor }}
              >
                {gw.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">

          {/* Left: Steps + Features */}
          <div>
            {/* Payment Flow Steps */}
            <div ref={stepsRef} className="space-y-3 mb-10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Payment Flow</p>
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-700 ease-out ${
                    stepsInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
                  } ${activeStep === i ? 'bg-white/10 border border-white/20' : 'opacity-40'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                      activeStep === i ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm mb-0.5 ${activeStep === i ? 'text-white' : 'text-gray-400'}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                  {activeStep === i && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feature Grid */}
            <div ref={featuresRef} className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <div
                  key={f.titleBn}
                  className={`p-4 rounded-xl border backdrop-blur-sm hover:scale-[1.02] transition-all duration-700 ease-out ${
                    featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.03), ${f.color}05)`,
                    borderColor: `${f.color}20`,
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: `${f.color}15` }}
                  >
                    <f.icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{f.titleBn}</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="relative flex justify-center">
            <div
              ref={phoneRef}
              className={`relative w-[290px] h-[580px] rounded-[3rem] border-8 border-white/10 bg-[#121212] shadow-2xl overflow-hidden transition-all duration-700 ease-out ${
                phoneInView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-5 bg-white/5 border-b border-white/5 text-center">
                  <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-3" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Secure Checkout</p>
                </div>

                <div className="flex-1 p-5 overflow-hidden">
                  {/* Order Total */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-5">
                    <p className="text-[10px] text-gray-500 mb-1">মোট পরিমাণ</p>
                    <div className="text-2xl font-bold text-white">৳১২,৫০০</div>
                  </div>

                  {/* Gateway List (animated) */}
                  <div className="space-y-2 mb-6">
                    {GATEWAYS.map((gw, i) => (
                      <div
                        key={gw.name}
                        className="p-3 rounded-xl border flex items-center justify-between transition-all duration-300"
                        style={{
                          background: activeGateway === i ? `${gw.color}15` : 'rgba(255,255,255,0.03)',
                          borderColor: activeGateway === i ? `${gw.color}50` : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{
                              background: `${gw.color}20`,
                              color: gw.color,
                            }}
                          >
                            {gw.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white leading-none">{gw.name}</p>
                            <p className="text-[9px] text-gray-500">{gw.desc}</p>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            activeGateway === i ? 'border-transparent' : 'border-white/20'
                          }`}
                          style={activeGateway === i ? { background: gw.color } : {}}
                        >
                          {activeGateway === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pay Button */}
                  <button
                    className="w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
                    style={{
                      background: currentGateway.color,
                      boxShadow: `0 8px 24px -4px ${currentGateway.color}40`,
                    }}
                  >
                    {currentGateway.name} দিয়ে পেমেন্ট <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-gray-600">
                    <Lock className="w-2.5 h-2.5" /> 256-bit SSL Encrypted
                  </div>
                </div>
              </div>

              {/* Success Overlay — CSS show/hide */}
              <div
                className={`absolute inset-0 bg-[#0A0A0F] flex flex-col items-center justify-center p-8 z-20 transition-all duration-300 ${
                  showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-4 transition-transform duration-500 ${
                    showSuccess ? 'scale-100' : 'scale-0'
                  }`}
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">পেমেন্ট সফল! ✅</h3>
                <p className="text-xs text-center text-gray-400">অর্ডার কনফার্ম হয়েছে। SMS পাঠানো হয়েছে।</p>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -right-4 top-1/4 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-[floatUp_4s_ease-in-out_infinite]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-white text-[10px] font-bold">Webhook Verified</p>
                  <p className="text-gray-500 text-[9px]">Double-confirmed</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-6 bottom-1/3 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-[floatDown_4s_ease-in-out_2s_infinite]">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white text-[10px] font-bold">Per-Store Gateway</p>
                  <p className="text-gray-500 text-[9px]">নিজের account</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'পেমেন্ট গেটওয়ে', value: '৬+', color: '#E2136E' },
            { label: 'Webhook Security', value: '১০০%', color: '#10B981' },
            { label: 'Per-store Setup', value: '✅', color: '#8B5CF6' },
            { label: 'COD সাপোর্ট', value: 'ফ্রি', color: '#F59E0B' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`p-5 rounded-2xl border text-center transition-all duration-700 ease-out ${
                statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                background: `${stat.color}08`,
                borderColor: `${stat.color}20`,
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
