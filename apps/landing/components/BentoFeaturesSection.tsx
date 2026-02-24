'use client';

/**
 * Bento Grid Features Section - UI/UX Pro Max
 * 
 * Showcases platform capabilities in an engaging bento-grid layout
 * with "Liquid Glass" styling and interactive animations.
 */

import { useRef, useState, useEffect } from 'react';
import { 
  GripVertical, ArrowRight, Layout, Type, Image as LucideImage, Star, Bell, Check
} from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ASSETS } from '@/config/assets';
import { LottieIcon } from '@/components/ui/LottieIcon';
import { LOTTIE_ANIMATIONS } from '@/lib/lottie-animations';

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
};

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

// ============================================================================
// TEMPLATE LIBRARY CARD (Large)
// ============================================================================
const TemplateLibraryCard = () => {
  const templates = [
    { name: 'Minimal', color: '#10B981', icon: Layout },
    { name: 'Luxe', color: '#F9A825', icon: Star },
    { name: 'Bold', color: '#EF4444', icon: Type },
    { name: 'Fresh', color: '#3B82F6', icon: LucideImage },
  ];
  
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % templates.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [templates.length]);

  return (
    <div
      className="group relative h-full p-6 md:p-8 rounded-[32px] overflow-hidden cursor-pointer flex flex-col border border-white/10 transition-transform duration-300 hover:scale-[1.01]"
      style={{ backgroundColor: COLORS.card }}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-xl" />
      
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 blur-[100px] group-hover:bg-emerald-500/30 transition-all duration-700" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
          <LottieIcon 
            src={LOTTIE_ANIMATIONS.palette} 
            size={24} 
            loop={true}
            className="text-emerald-400"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white font-bengali">{t('bentoTemplateLibrary_title')}</h3>
          <p className="text-sm text-white/50 font-bengali">{t('bentoTemplateLibrary_desc')}</p>
        </div>
      </div>

      {/* Animated Templates Stack */}
      <div className="relative flex-1 min-h-[260px] perspective-[1000px]">
        {templates.map((template, i) => {
          const Icon = template.icon;
          const isActive = i === activeIndex;
          const indexDiff = (i - activeIndex + templates.length) % templates.length;
          const isVisible = indexDiff < 3;

          return (
            <div
              key={template.name}
              className="absolute inset-x-0 top-0 h-[240px] rounded-2xl border overflow-hidden shadow-2xl origin-bottom transition-all duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ 
                backgroundColor: '#1E1E24',
                borderColor: isActive ? template.color : 'rgba(255,255,255,0.1)',
                zIndex: templates.length - indexDiff,
                transform: `translateY(${indexDiff * 15}px) scale(${1 - indexDiff * 0.05}) rotateX(${indexDiff * 5}deg)`,
                opacity: isVisible ? 1 - indexDiff * 0.2 : 0,
              }}
            >
              {/* Card Content */}
              <div className="h-full flex flex-col">
                {/* Mock Header */}
                <div className="h-10 border-b border-white/5 bg-black/20 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                  </div>
                </div>
                
                {/* Mock Body */}
                <div className="flex-1 p-6 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 blur-2xl rounded-full`} style={{ backgroundColor: template.color }} />
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${template.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: template.color }} />
                    </div>
                    {isActive && (
                      <div className="transition-all duration-300 opacity-100 translate-x-0">
                        <div className="font-bold text-white text-lg">{template.name}</div>
                        <div className="text-xs text-white/40">Theme</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 opacity-50">
                     <div className="h-2 w-3/4 rounded-full bg-white/10" />
                     <div className="h-2 w-1/2 rounded-full bg-white/10" />
                     <div className="h-2 w-full rounded-full bg-white/10" />
                  </div>

                  {isActive && (
                    <div 
                      className="absolute bottom-6 right-6 px-3 py-1.5 rounded-lg text-xs font-bold text-black transition-transform duration-300 scale-100"
                      style={{ backgroundColor: template.color }}
                    >
                      Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// LIVE PREVIEW CARD
// ============================================================================
const LivePreviewCard = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('Welcome');
  const [textIndex, setTextIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const texts = ['Welcome', 'স্বাগতম', 'Hello'];
    const interval = setInterval(() => {
      setTextVisible(false);
      setTimeout(() => {
        const next = (textIndex + 1) % texts.length;
        setTextIndex(next);
        setText(texts[next]);
        setTextVisible(true);
      }, 150);
    }, 2500);
    return () => clearInterval(interval);
  }, [textIndex]);

  return (
    <div
      className="group relative h-full p-6 rounded-[32px] overflow-hidden cursor-pointer border border-white/10 bg-white/[0.03] transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <LottieIcon 
            src={LOTTIE_ANIMATIONS.eye} 
            size={20} 
            loop={true}
          />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{t('bentoLivePreview_title')}</h3>
          <p className="text-xs text-white/50 font-bengali">{t('bentoLivePreview_desc')}</p>
        </div>
      </div>

      <div className="flex gap-4 h-28">
        {/* Editor */}
        <div className="flex-1 rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col justify-center">
          <div className="text-[10px] text-white/30 mb-1 font-mono uppercase">Input</div>
          <div className="font-mono text-sm text-blue-300 typing-cursor relative">
            {text}<span className="animate-pulse">|</span>
          </div>
        </div>
        
        {/* Arrow */}
        <div className="flex flex-col justify-center">
          <ArrowRight className="w-4 h-4 text-white/20" />
        </div>

        {/* Preview */}
        <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-3 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-sm" />
          <div className="relative z-10 text-center">
            <div 
              className="text-lg font-bold text-white transition-all duration-150"
              style={{ opacity: textVisible ? 1 : 0, transform: textVisible ? 'scale(1)' : 'scale(0.8)' }}
            >
              {text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION REARRANGE CARD
// ============================================================================
const SectionRearrangeCard = () => {
  const { t } = useTranslation();
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
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const sections = [
    { name: 'Hero', color: '#10B981', w: '100%' },
    { name: 'Products', color: '#3B82F6', w: '100%' },
    { name: 'Review', color: '#F9A825', w: '60%' },
  ];

  return (
    <div
      className="group relative h-full p-6 rounded-[32px] overflow-hidden cursor-pointer border border-white/10 bg-white/[0.03] transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <GripVertical className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{t('bentoDragDrop_title')}</h3>
          <p className="text-xs text-white/50 font-bengali">{t('bentoDragDrop_desc')}</p>
        </div>
      </div>

      <div className="space-y-3 relative">
        {order.map((idx) => (
          <div
            key={idx}
            className="h-8 rounded-lg border flex items-center px-3 gap-3 transition-all duration-500"
            style={{ 
              backgroundColor: `${sections[idx].color}10`,
              borderColor: `${sections[idx].color}30`,
              width: sections[idx].w
            }}
          >
            <GripVertical className="w-3 h-3 text-white/30 cursor-grab" />
            <div className="h-1.5 rounded-full bg-white/20 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// BANGLA SUPPORT CARD
// ============================================================================
const BanglaSupportCard = () => {
  const { t } = useTranslation();
  return (
    <div
      className="group relative h-full p-6 rounded-[32px] overflow-hidden cursor-pointer border border-white/10 bg-white/[0.03] transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 blur-[50px] rounded-full" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center border border-green-600/20">
          <LottieIcon 
            src={LOTTIE_ANIMATIONS.languages} 
            size={20} 
            loop={true}
          />
        </div>
        <h3 className="text-base font-bold text-white">{t('bentoBanglaSupport_title')}</h3>
      </div>

      <div className="text-center py-6 relative">
         <div className="text-2xl font-bold text-white/90 font-bengali mb-1 animate-pulse">
           {t('bentoBanglaSupport_main')}
         </div>
         <p className="text-sm text-green-400/60 font-bengali">{t('bentoBanglaSupport_sub')}</p>
      </div>
    </div>
  );
};

// ============================================================================
// MOBILE RESPONSIVE CARD
// ============================================================================
const MobileResponsiveCard = () => {
  const { t } = useTranslation();
  return (
    <div
      className="group relative h-full p-6 rounded-[32px] overflow-hidden cursor-pointer border border-white/10 bg-white/[0.03] transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <LottieIcon 
            src={LOTTIE_ANIMATIONS.smartphone} 
            size={20} 
            loop={true}
          />
        </div>
        <h3 className="text-base font-bold text-white">{t('bentoMobileReady_title')}</h3>
      </div>

      <div className="flex justify-center items-end h-[100px] gap-2 pb-2">
        <div className="w-10 h-16 border-2 border-white/20 rounded-md bg-white/5 animate-[mobileWidth_4s_ease-in-out_infinite]" />
        <div className="w-16 h-12 border-2 border-white/20 rounded-md bg-white/5 mb-2" />
      </div>
    </div>
  );
};

// ============================================================================
// COMBO CARD
// ============================================================================
const ComboPlatformCard = () => {
  const { t } = useTranslation();
  return (
    <div
      className="group relative p-8 rounded-[32px] border border-white/10 bg-white/[0.03] overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 opacity-50" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#006A4E]/20 blur-xl rounded-full opacity-50" />
              <img 
                src={ASSETS.brand.logoWhite} 
                alt="Ozzyl" 
                className="h-12 w-auto relative z-10"
              />
            </div>
          </div>
          
          <div className="h-12 w-px bg-white/10 hidden md:block" />
          
          <div>
            <h3 className="text-xl font-bold text-white mb-1 font-bengali">{t('bentoAllInOne_title')}</h3>
            <p className="text-white/50 font-bengali">{t('bentoAllInOne_desc')}</p>
          </div>
        </div>

        <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold backdrop-blur-md">
          {t('bentoAllInOne_badge')}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMING SOON TEASER
// ============================================================================
const ComingSoonTeaser = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div
      className="group relative p-8 rounded-[32px] border border-amber-500/20 bg-amber-500/[0.03] overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <LottieIcon 
              src={LOTTIE_ANIMATIONS.sparkles} 
              size={16} 
              loop={true}
            />
            <span className="text-sm font-bold uppercase tracking-wider">{t('bentoComingSoon_badge')}</span>
          </div>
          <p className="text-white/60 text-sm font-bengali max-w-md">
            {t('bentoComingSoon_desc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto relative">
          <input 
            type="email" 
            placeholder={t('bentoComingSoon_placeholder')} 
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={status !== 'idle'}
            className="bg-black/20 border border-amber-500/20 rounded-xl px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 w-full md:w-64"
          />
          <button 
            disabled={status !== 'idle'}
            className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? <Bell className="w-4 h-4 animate-spin" /> : status === 'success' ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function BentoFeaturesSection() {
  const { t } = useTranslation();
  const { ref: headingRef, inView: headingInView } = useInView(0.15);
  const { ref: topLeftRef, inView: topLeftInView } = useInView(0.1);
  const { ref: topRightRef, inView: topRightInView } = useInView(0.1);
  const { ref: midLeftRef, inView: midLeftInView } = useInView(0.1);
  const { ref: midRightRef, inView: midRightInView } = useInView(0.1);
  const { ref: bottomRow1Ref, inView: bottomRow1InView } = useInView(0.1);
  const { ref: bottomRow2Ref, inView: bottomRow2InView } = useInView(0.1);
  
  return (
    <section className="py-20 px-4 relative overflow-hidden bg-[#0A0A12]">
      {/* Liquid Background */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div 
          ref={headingRef}
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            headingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm">
            <LottieIcon 
              src={LOTTIE_ANIMATIONS.sparkles} 
              size={16} 
              loop={true}
            />
            <span className="text-sm font-medium text-emerald-300">{t('bentoBadge')}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white font-bengali leading-tight mb-4">
            {t('bentoMainTitle_part1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{t('bentoMainTitle_part2')}</span>
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* TOP ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[440px]">
            {/* Left: Template Library (Large) */}
            <div 
              ref={topLeftRef}
              className={`h-full transition-all duration-700 ease-out ${
                topLeftInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
              }`}
            >
              <TemplateLibraryCard />
            </div>

            {/* Right: Stacked Cards */}
            <div 
              ref={topRightRef}
              className={`flex flex-col gap-6 transition-all duration-700 ease-out ${
                topRightInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'
              }`}
            >
              <div className="flex-1 min-h-[200px]"><LivePreviewCard /></div>
              <div className="flex-1 min-h-[200px]"><SectionRearrangeCard /></div>
            </div>
          </div>

          {/* MIDDLE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 h-[220px]">
            <div
              ref={midLeftRef}
              className={`transition-all duration-700 ease-out ${
                midLeftInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <BanglaSupportCard />
            </div>
            <div
              ref={midRightRef}
              className={`transition-all duration-700 ease-out ${
                midRightInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <MobileResponsiveCard />
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div
            ref={bottomRow1Ref}
            className={`transition-all duration-700 ease-out ${
              bottomRow1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <ComboPlatformCard />
          </div>

          <div
            ref={bottomRow2Ref}
            className={`transition-all duration-700 ease-out ${
              bottomRow2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <ComingSoonTeaser />
          </div>

        </div>
      </div>
    </section>
  );
}

export default BentoFeaturesSection;
