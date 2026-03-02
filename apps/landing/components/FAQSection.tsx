/**
 * FAQ Section - "সাধারণ জিজ্ঞাসা"
 * 
 * Frequently Asked Questions section with Bengali text
 * Following the established design system
 * 
 * Features:
 * - Accordion-style FAQ items
 * - Bangladesh Green color scheme
 * - Animated expand/collapse
 * - Glassmorphism effects
 */

import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations';
import { useTranslation } from '@/app/contexts/LanguageContext';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  primaryLight: '#00875F',
  accent: '#F9A825',       // Golden Yellow
  background: '#0A0F0D',
  backgroundAlt: '#0D1512',
};

// FAQ data will be generated inside the component to support translation

// ============================================================================
// FAQ ITEM COMPONENT
// ============================================================================
const FAQItemComponent = ({ faq, index, isOpen, onToggle }: { 
  faq: FAQItem; 
  index: number; 
  isOpen: boolean; 
  onToggle: () => void;
}) => {
  return (
    <div
      className={`bg-white/[0.03] backdrop-blur-xl border rounded-2xl overflow-hidden transition-colors duration-300 ${
        isOpen ? 'border-[#006A4E]/50' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              isOpen 
                ? 'bg-gradient-to-br from-[#006A4E] to-[#00875F]' 
                : 'bg-white/5'
            }`}
          >
            <span className={`text-lg font-bold ${isOpen ? 'text-white' : 'text-white/40'}`}>
              {index + 1}
            </span>
          </div>
          <h3 
            className={`text-lg font-semibold transition-colors duration-300 ${
              isOpen ? 'text-white' : 'text-white/80'
            }`}
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            {faq.question}
          </h3>
        </div>
        
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
            isOpen ? 'bg-[#006A4E]/20' : 'bg-white/5'
          }`}
        >
          <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-[#006A4E]' : 'text-white/40'}`} />
        </div>
      </button>
      
      
        {isOpen && (
          <div
          >
            <div className="px-6 pb-5">
              <div className="pl-14">
                <p 
                  className="text-white/60 leading-relaxed"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        )}
      
    </div>
  );
};

interface FAQItem {
  question: string;
  answer: string;
}

// ============================================================================
// MAIN FAQ SECTION
// ============================================================================
export function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3Q_custom') }, // Custom key for FAQ3 as it was slightly different
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
    { question: t('faq6Q'), answer: t('faq6A') },
    // New objection-handling FAQs (Direct Response Copy methodology)
    { question: t('faq7Q'), answer: t('faq7A') },
    { question: t('faq8Q'), answer: t('faq8A') },
    { question: t('faq9Q'), answer: t('faq9A') },
    { question: t('faq10Q'), answer: t('faq10A') },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent}10 0%, transparent 70%)`,
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

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{ 
                backgroundColor: `${COLORS.primary}10`,
                borderColor: `${COLORS.primary}30`,
              }}
            >
              <HelpCircle className="w-4 h-4" style={{ color: COLORS.accent }} />
              <span className="text-sm" style={{ color: COLORS.accent }}>
                {t('faqBadge')}
              </span>
            </div>
            
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {t('faqTitlePart1')}{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
                }}
              >
                {t('faqTitlePart2')}
              </span>
            </h2>
            <p 
              className="text-lg text-white/50 max-w-2xl mx-auto"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              {t('faqSubtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <FAQItemComponent
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Still have questions? */}
        <div
          className="mt-12 text-center"
        >
          <p className="text-white/50 mb-4" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
            {t('faqStillQuestions')}
          </p>
          <a
            href="mailto:contact@ozzyl.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#006A4E]/50 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-[#F9A825]" />
            <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>{t('faqContactUs')}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
