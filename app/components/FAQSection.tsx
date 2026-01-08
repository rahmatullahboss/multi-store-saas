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

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '~/components/animations';

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

// ============================================================================
// FAQ DATA - BENGALI
// ============================================================================
interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Free প্ল্যান কি সত্যিই চিরকাল ফ্রি?',
    answer: 'হ্যাঁ! আপনি ১টি Product লিস্ট করতে পারবেন এবং মাসে ৫০টি Sales করতে পারবেন — সম্পূর্ণ বিনামূল্যে। কোনো Hidden Fee নেই, কোনো Credit Card লাগবে না।',
  },
  {
    question: 'কোন Payment Method সাপোর্ট করে?',
    answer: 'আমরা বিকাশ, নগদ এবং Cash on Delivery (COD) সাপোর্ট করি। সব Built-in, আলাদা কোনো Setup করতে হবে না। Customer Payment করলে সরাসরি আপনার Account এ যাবে।',
  },
  {
    question: 'নিজের Domain ব্যবহার করতে পারব?',
    answer: 'হ্যাঁ! Starter Plan থেকে আপনি Custom Domain কানেক্ট করতে পারবেন। Free Plan এ আপনি yourstore.digitalcare.site সাবডোমেইন পাবেন।',
  },
  {
    question: 'Store Setup করতে কতক্ষণ লাগে?',
    answer: 'মাত্র ৫ মিনিট! Sign up করুন, Template বাছুন, Product Add করুন — ব্যস! আপনার Store Ready। কোনো Technical Knowledge লাগবে না।',
  },
  {
    question: 'আমার টাকা কবে পাব?',
    answer: 'বিকাশ/নগদ Payment সরাসরি আপনার Account এ যায়। COD Order এ Customer থেকে আপনিই টাকা নেবেন। আমরা কখনো আপনার টাকা Hold করি না।',
  },
  {
    question: 'কোনো সমস্যা হলে কার সাথে কথা বলব?',
    answer: 'আমাদের Bangla Support Team ২৪/৭ Available। WhatsApp, Phone বা Email — যেভাবে চান যোগাযোগ করুন। আমরা সবসময় সাহায্য করতে Ready!',
  },
];

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
    <motion.div
      className={`bg-white/[0.03] backdrop-blur-xl border rounded-2xl overflow-hidden transition-colors duration-300 ${
        isOpen ? 'border-[#006A4E]/50' : 'border-white/10 hover:border-white/20'
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              isOpen 
                ? 'bg-gradient-to-br from-[#006A4E] to-[#00875F]' 
                : 'bg-white/5'
            }`}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className={`text-lg font-bold ${isOpen ? 'text-white' : 'text-white/40'}`}>
              {index + 1}
            </span>
          </motion.div>
          <h3 
            className={`text-lg font-semibold transition-colors duration-300 ${
              isOpen ? 'text-white' : 'text-white/80'
            }`}
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            {faq.question}
          </h3>
        </div>
        
        <motion.div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
            isOpen ? 'bg-[#006A4E]/20' : 'bg-white/5'
          }`}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-[#006A4E]' : 'text-white/40'}`} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// MAIN FAQ SECTION
// ============================================================================
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent}10 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
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
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{ 
                backgroundColor: `${COLORS.primary}10`,
                borderColor: `${COLORS.primary}30`,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <HelpCircle className="w-4 h-4" style={{ color: COLORS.accent }} />
              <span className="text-sm" style={{ color: COLORS.accent }}>
                প্রশ্ন আছে?
              </span>
            </motion.div>
            
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              সাধারণ{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
                }}
              >
                জিজ্ঞাসা
              </span>
            </h2>
            <p 
              className="text-lg text-white/50 max-w-2xl mx-auto"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
            >
              আমাদের সম্পর্কে সবচেয়ে জনপ্রিয় প্রশ্নের উত্তর
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
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/50 mb-4" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
            আরো প্রশ্ন আছে?
          </p>
          <a
            href="mailto:support@digitalcare.site"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#006A4E]/50 rounded-xl text-white/70 hover:text-white transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-[#F9A825]" />
            <span style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>আমাদের সাথে যোগাযোগ করুন</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default FAQSection;
