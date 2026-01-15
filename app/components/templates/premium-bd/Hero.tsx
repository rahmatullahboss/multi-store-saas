import { motion } from 'framer-motion';
import { Phone, CheckCircle2, ShoppingCart, ShieldCheck } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function PremiumBDHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
  storeName,
}: SectionProps & { formatPrice: (price: number) => string }) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Hero Section"
      data={{ headline: config.headline, subheadline: config.subheadline }}
      onUpdate={(data) => onUpdate?.('hero', data)}
      isEditable={isEditMode}
    >
      <header className="relative bg-white pt-10 pb-20 px-4 overflow-hidden font-sans">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Top Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 py-3 border-y border-gray-100">
            {config.heroFeatures && config.heroFeatures.length > 0 ? (
              config.heroFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-blue-800 text-sm font-bold uppercase tracking-wide">
                    {feature.icon ? <span className="text-blue-600">{feature.icon}</span> : <CheckCircle2 size={16} className="text-blue-600" />}
                    {feature.text}
                  </div>
                  {config.heroFeatures && i < config.heroFeatures.length - 1 && <div className="w-px h-4 bg-gray-200 hidden md:block" />}
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2 text-blue-800 text-sm font-bold uppercase tracking-wide">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  ক্যাশ অন ডেলিভারি
                </div>
                <div className="w-px h-4 bg-gray-200 hidden md:block" />
                <div className="flex items-center gap-2 text-blue-800 text-sm font-bold uppercase tracking-wide">
                  <CheckCircle2 size={16} className="text- blue-600" />
                  সরাসরি আমদানিকৃত পণ্য
                </div>
                <div className="w-px h-4 bg-gray-200 hidden md:block" />
                <div className="flex items-center gap-2 text-blue-800 text-sm font-bold uppercase tracking-wide">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  ৭ দিনের সহজ রিটার্ন
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Image with Discount Badge */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-50">
                {product.imageUrl && (
                  <OptimizedImage src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                )}
                
                {/* Save Badge */}
                {discount > 0 && (
                  <div className="absolute top-6 left-6 z-20 bg-red-600 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white animate-pulse">
                    <span className="text-2xl font-black">{discount}%</span>
                    <span className="text-[10px] uppercase font-bold">{config.heroBadgeText || 'DISCOUNT'}</span>
                  </div>
                )}
              </div>
              
              {/* Trust Badge Floating */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-blue-50">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Original Product</p>
                  <p className="text-sm font-black text-blue-900">100% Genuine</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: High Conversion Content */}
            <div className="space-y-8 order-1 lg:order-2 text-center lg:text-left">
              <div className="space-y-4">
                <p className="text-blue-600 font-black uppercase tracking-widest text-sm italic">{storeName} Exclusive</p>
                <h1 className="text-4xl lg:text-6xl font-black text-blue-950 leading-[1.1] mb-6">
                  {config.headline}
                </h1>
                <p className="text-gray-500 text-lg lg:text-xl leading-relaxed">
                  {config.subheadline}
                </p>
              </div>

              <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 space-y-6">
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <span className="text-4xl lg:text-6xl font-black text-blue-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-xl lg:text-2xl text-gray-400 line-through font-bold">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#order-form"
                    className="flex-1 flex items-center justify-center gap-3 py-5 bg-blue-700 text-white font-black text-xl rounded-2xl transition-all hover:bg-blue-800 hover:shadow-2xl shadow-lg active:scale-95"
                  >
                    <ShoppingCart size={22} />
                    {config.heroCtaText || 'অর্ডার করতে ক্লিক করুন'}
                  </a>
                  {config.callNumber && (
                    <a
                      href={`tel:${config.callNumber}`}
                      className="flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-blue-100 text-blue-700 font-black text-xl rounded-2xl transition-all hover:bg-blue-50 active:scale-95"
                    >
                      <Phone size={22} className="fill-current" />
                      {config.heroPriceLabel || 'কল দিন'}
                    </a>
                  )}
                </div>
                
                <p className="text-center lg:text-left text-sm text-gray-500 font-medium">
                  ✓ সরাসরি কল করে অর্ডার করার সুবিধা রয়েছে
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </MagicSectionWrapper>
  );
}
