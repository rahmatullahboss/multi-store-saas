import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { CheckCircle, ShoppingCart, Phone } from 'lucide-react';

export function Hero({ config, product, theme, formatPrice }: SectionProps) {
  const scrollToOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
      orderForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={`py-12 md:py-16 relative overflow-hidden bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF]`}>
      {/* Background Circle Decoration */}
      <div className="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(230,57,70,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <div className="inline-block bg-[#F4A261] text-white px-5 py-2 rounded-full text-sm font-bold mb-5 animate-bounce shadow-sm">
              <span className="flex items-center gap-2">
                <span className="text-lg">🔥</span> সবচেয়ে বিক্রিত প্রোডাক্ট
              </span>
            </div>

            <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-6 text-[#1D3557]`}>
              {config.headline || "আপনার জীবনকে আরো সহজ ও সুন্দর করুন আমাদের প্রিমিয়াম প্রোডাক্ট দিয়ে"}
            </h1>

            <p className="text-lg text-[#6C757D] mb-8 leading-relaxed">
              {config.subheadline || product.description || "১০,০০০+ সন্তুষ্ট গ্রাহক আমাদের উপর ভরসা করেছেন। ১০০% অরিজিনাল প্রোডাক্ট, ক্যাশ অন ডেলিভারি সুবিধা সহ সারা বাংলাদেশে দ্রুত ডেলিভারি।"}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
              <button 
                onClick={scrollToOrder}
                className={`flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-xl text-white transition-all transform hover:-translate-y-1 hover:shadow-xl shadow-lg bg-gradient-to-r from-[#E63946] to-[#C1121F] shadow-[#E63946]/40`}
              >
                <ShoppingCart size={20} />
                {config.ctaText || "এখনই অর্ডার করুন"}
              </button>

              {config.callEnabled && config.callNumber && (
                <a 
                  href={`tel:${config.callNumber}`}
                  className="flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-xl text-white transition-all transform hover:-translate-y-1 hover:shadow-xl shadow-lg bg-[#1D3557] shadow-[#1D3557]/40"
                >
                  <Phone size={20} />
                  কল করুন
                </a>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-5 text-sm md:text-base text-[#6C757D]">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#2A9D8F]" />
                <span>১০০% অরিজিনাল</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#2A9D8F]" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#2A9D8F]" />
                <span>৭ দিনে রিটার্ন</span>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="order-1 md:order-2 relative text-center">
            <div className="relative inline-block rounded-2xl shadow-2xl overflow-hidden">
             {product.imageUrl ? (
                <OptimizedImage 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="max-w-full h-auto rounded-2xl hover:scale-105 transition-transform duration-500"
                />
             ) : (
                <img 
                  src="https://via.placeholder.com/600x600/E8E8E8/999999?text=Product+Image" 
                  alt="Placeholder" 
                  className="max-w-full h-auto rounded-2xl"
                />
             )}
              
              <div className="absolute top-5 right-5 bg-[#E63946] text-white px-5 py-3 rounded-2xl shadow-lg font-bold text-center">
                <span className="block text-2xl leading-none">৫০%</span>
                <span className="text-xs font-normal">ছাড়</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
