/**
 * Interactive Store Demo - "দেখুন কত সহজ - Try It Now"
 * 
 * An interactive demo that lets visitors experience creating a store
 * in 30 seconds without signing up. Features:
 * - 3-step wizard (Template → Store Name → Add Product)
 * - Real-time live preview
 * - Template-based theme switching
 * - Progress indicator
 * - Celebration animation on completion
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { 
  Check, 
  ShoppingCart, 
  Sparkles, 
  ArrowRight,
  Store,
  Package
} from 'lucide-react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
  primary: '#006A4E',      // Bangladesh Green
  accent: '#F9A825',       // Golden Yellow
  background: '#0A0A0F',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.1)',
};

// ============================================================================
// TEMPLATE OPTIONS
// ============================================================================
const templates = [
  { 
    id: 'fashion', 
    icon: '👗', 
    name: 'Fashion', 
    nameBn: 'ফ্যাশন',
    color: '#8B5CF6', 
    gradientFrom: '#8B5CF6',
    gradientTo: '#A855F7',
  },
  { 
    id: 'food', 
    icon: '🍔', 
    name: 'Food', 
    nameBn: 'খাবার',
    color: '#F59E0B', 
    gradientFrom: '#F59E0B',
    gradientTo: '#FBBF24',
  },
  { 
    id: 'digital', 
    icon: '💻', 
    name: 'Digital', 
    nameBn: 'ডিজিটাল',
    color: '#3B82F6', 
    gradientFrom: '#3B82F6',
    gradientTo: '#60A5FA',
  },
];

// ============================================================================
// CONFETTI ANIMATION COMPONENT
// ============================================================================
const Confetti = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#8B5CF6', '#F59E0B', '#3B82F6', '#10B981', '#EC4899'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            left: `${piece.x}%`, 
            top: '-10px',
            backgroundColor: piece.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: 0,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{ 
            duration: piece.duration, 
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i + 1 <= currentStep 
                ? 'bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white' 
                : 'bg-white/10 text-white/40'
            }`}
            animate={i + 1 === currentStep ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {i + 1 <= currentStep ? (
              i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1
            ) : i + 1}
          </motion.div>
          {i < totalSteps - 1 && (
            <motion.div 
              className="w-8 h-0.5 mx-1"
              style={{
                background: i + 1 < currentStep 
                  ? 'linear-gradient(90deg, #006A4E, #00875F)' 
                  : 'rgba(255, 255, 255, 0.1)',
              }}
              animate={i + 1 < currentStep ? { scaleX: [0, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-white/50">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
};

// ============================================================================
// LIVE PREVIEW COMPONENT
// ============================================================================
interface LivePreviewProps {
  template: typeof templates[0] | null;
  storeName: string;
  productName: string;
  productPrice: string;
  isComplete: boolean;
}

const LivePreview = ({ template, storeName, productName, productPrice, isComplete }: LivePreviewProps) => {
  const activeColor = template?.color || '#006A4E';
  const displayName = storeName || 'আপনার Store';
  const displayProduct = productName || 'প্রোডাক্ট';
  const displayPrice = productPrice || '০';

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden border backdrop-blur-xl"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: `${activeColor}30`,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {isComplete && (
          <>
            <Confetti />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: `linear-gradient(135deg, ${activeColor}, ${template?.gradientTo || activeColor})` }}
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                🎉 দেখলেন? এটুকুই!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 mb-6"
              >
                এতটুকু সহজ Store বানানো!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${activeColor}, ${template?.gradientTo || activeColor})`,
                    boxShadow: `0 0 30px ${activeColor}60`,
                  }}
                >
                  এই Store টা Save করতে Sign Up করুন
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview label */}
      <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs text-white/40 ml-2">👆 LIVE PREVIEW</span>
      </div>

      {/* Store header */}
      <motion.div 
        className="p-4 transition-all duration-500"
        style={{ 
          background: template 
            ? `linear-gradient(135deg, ${activeColor}40, ${activeColor}20)` 
            : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        }}
        layout
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ 
              background: template 
                ? `linear-gradient(135deg, ${activeColor}, ${template.gradientTo})` 
                : 'rgba(255, 255, 255, 0.1)',
            }}
            animate={template ? { scale: [0.8, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {template ? (
              <span className="text-lg">{template.icon}</span>
            ) : (
              <Store className="w-5 h-5 text-white/40" />
            )}
          </motion.div>
          <div>
            <motion.h3 
              className="text-lg font-bold text-white"
              key={displayName}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {displayName}
            </motion.h3>
            <p className="text-sm text-white/50">
              {template ? `${template.nameBn} Store` : 'আপনার Store'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Product grid */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {(productName || productPrice) ? (
            <motion.div
              key="product-card"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <div 
                className="aspect-square flex items-center justify-center"
                style={{ 
                  background: template 
                    ? `linear-gradient(135deg, ${activeColor}20, ${activeColor}10)` 
                    : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Package className="w-12 h-12" style={{ color: activeColor }} />
              </div>
              <div className="p-3">
                <motion.p 
                  className="font-medium text-white truncate"
                  key={displayProduct}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                >
                  {displayProduct}
                </motion.p>
                <motion.p 
                  className="text-lg font-bold mt-1"
                  style={{ color: activeColor }}
                  key={displayPrice}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                >
                  ৳{displayPrice}
                </motion.p>
                <motion.button
                  className="w-full mt-3 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                  style={{ 
                    background: template 
                      ? `linear-gradient(135deg, ${activeColor}, ${template.gradientTo})` 
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              {[1, 2].map((i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-xl border flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="text-center text-white/20">
                    <Package className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-xs">Product {i}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function InteractiveStoreDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [storeName, setStoreName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Auto-advance steps based on input
  useEffect(() => {
    if (selectedTemplate && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 500);
    }
  }, [selectedTemplate, currentStep]);

  useEffect(() => {
    if (storeName.length >= 3 && currentStep === 2) {
      setTimeout(() => setCurrentStep(3), 500);
    }
  }, [storeName, currentStep]);

  useEffect(() => {
    if (productName && productPrice && currentStep === 3 && !isComplete) {
      setTimeout(() => setIsComplete(true), 800);
    }
  }, [productName, productPrice, currentStep, isComplete]);

  // Reset demo
  const resetDemo = () => {
    setCurrentStep(1);
    setSelectedTemplate(null);
    setStoreName('');
    setProductName('');
    setProductPrice('');
    setIsComplete(false);
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: COLORS.background }}>
      {/* Background gradient orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, ${COLORS.primary}, transparent)` }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
        style={{ background: `radial-gradient(circle, ${COLORS.accent}, transparent)` }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ 
              backgroundColor: `${COLORS.primary}15`,
              borderColor: `${COLORS.primary}30`,
            }}
          >
            <span className="text-lg">🎮</span>
            <span className="text-sm font-medium" style={{ color: COLORS.primary }}>
              Interactive Demo
            </span>
          </motion.div>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
          >
            নিজে Try করুন — <span style={{ color: COLORS.accent }}>৩০ সেকেন্ডে</span> Store বানান
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            কোনো Sign Up লাগবে না, শুধু নিচের ৩টি Step Follow করুন
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Interactive Form */}
          <motion.div
            className="p-6 md:p-8 rounded-3xl border backdrop-blur-xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <ProgressIndicator currentStep={currentStep} totalSteps={3} />

            {/* Step 1: Template Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white text-xs flex items-center justify-center font-bold">1</span>
                Template বাছুন
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {templates.map((template) => (
                  <motion.button
                    key={template.id}
                    className={`relative p-4 rounded-xl border text-center transition-all ${
                      selectedTemplate?.id === template.id 
                        ? 'border-opacity-100' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ 
                      borderColor: selectedTemplate?.id === template.id ? template.color : undefined,
                      backgroundColor: selectedTemplate?.id === template.id ? `${template.color}15` : 'rgba(255, 255, 255, 0.02)',
                    }}
                    onClick={() => setSelectedTemplate(template)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span 
                      className="text-3xl block mb-2"
                      animate={selectedTemplate?.id === template.id ? { scale: [1, 1.2, 1] } : {}}
                    >
                      {template.icon}
                    </motion.span>
                    <span className="text-sm text-white/70">{template.nameBn}</span>
                    {selectedTemplate?.id === template.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: template.color }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 2: Store Name */}
            <AnimatePresence>
              {currentStep >= 2 && (
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white text-xs flex items-center justify-center font-bold">2</span>
                    আপনার Store এর নাম দিন
                  </h3>
                  <motion.input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="আপনার Brand নাম..."
                    className="w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/30 focus:outline-none transition-all"
                    style={{ 
                      borderColor: storeName.length >= 3 ? `${COLORS.primary}50` : 'rgba(255, 255, 255, 0.1)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Add Product */}
            <AnimatePresence>
              {currentStep >= 3 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white text-xs flex items-center justify-center font-bold">3</span>
                    একটা Product যোগ করুন
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Product এর নাম..."
                      className="px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/30 focus:outline-none transition-all"
                      style={{ 
                        borderColor: productName ? `${COLORS.primary}50` : 'rgba(255, 255, 255, 0.1)',
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      autoFocus
                    />
                    <motion.div 
                      className="relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">৳</span>
                      <input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="দাম..."
                        className="w-full pl-8 pr-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/30 focus:outline-none transition-all"
                        style={{ 
                          borderColor: productPrice ? `${COLORS.primary}50` : 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset button */}
            {isComplete && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={resetDemo}
                className="mt-6 text-sm text-white/40 hover:text-white/60 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                আবার Try করুন
              </motion.button>
            )}
          </motion.div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-24">
            <LivePreview
              template={selectedTemplate}
              storeName={storeName}
              productName={productName}
              productPrice={productPrice}
              isComplete={isComplete}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveStoreDemo;
