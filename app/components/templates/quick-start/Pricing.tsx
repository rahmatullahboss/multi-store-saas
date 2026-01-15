import { useState, useEffect } from 'react';
import { Tag, CheckCircle, AlertTriangle, ShoppingCart } from 'lucide-react';
import type { SectionProps } from '../_core/types';
import { calculateDiscountPercentage } from '~/utils/price';

export function Pricing({ product, theme, formatPrice, config }: SectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 }; // Reset loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
      orderForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? calculateDiscountPercentage(product.price, product.compareAtPrice!) 
    : 0;
  const savings = hasDiscount ? (product.compareAtPrice! - product.price) : 0;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-[#1D3557] mb-3">
          স্পেশাল <span className="text-[#E63946]">অফার প্রাইস</span>
        </h2>
        <p className="text-[#6C757D] mb-10">সীমিত সময়ের জন্য বিশেষ ছাড়</p>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#FFF5F5] to-white border-[3px] border-[#E63946] rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-xl">
            {/* Top Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E63946] to-[#C1121F]" />
            
            {/* Corner Badge */}
            <div className="absolute top-8 -right-12 bg-[#E63946] text-white py-2 px-12 rotate-45 font-bold text-sm shadow-md">
              সীমিত অফার
            </div>

            {/* Countdown */}
            <div className="bg-[#1D3557] text-white p-6 rounded-2xl mb-8 max-w-lg mx-auto shadow-lg">
              <p className="mb-4 font-medium opacity-90">⏰ অফার শেষ হতে বাকি:</p>
              <div className="flex justify-center gap-4">
                {[
                  { val: timeLeft.hours, label: 'ঘণ্টা' },
                  { val: timeLeft.minutes, label: 'মিনিট' },
                  { val: timeLeft.seconds, label: 'সেকেন্ড' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 p-4 rounded-xl min-w-[80px]">
                    <span className="block text-3xl font-bold">{item.val.toString().padStart(2, '0')}</span>
                    <span className="text-xs opacity-70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Info */}
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-[#1D3557] mb-2">প্রিমিয়াম প্যাকেজ</h3>
              <p className="text-[#6C757D] mb-6">সম্পূর্ণ প্রোডাক্ট + ফ্রি গিফট</p>
              
              <div className="flex flex-col items-center gap-2">
                {hasDiscount && (
                  <div className="text-2xl text-[#6C757D] line-through decoration-2 decoration-[#E63946]/50">
                    {formatPrice(product.compareAtPrice!)}
                  </div>
                )}
                <div className="text-6xl font-black text-[#E63946] tracking-tight">
                  {formatPrice(product.price)}
                </div>
                {hasDiscount && (
                  <div className="inline-flex items-center gap-2 bg-[#2A9D8F] text-white px-6 py-2 rounded-full font-bold mt-2 animate-pulse">
                    <Tag size={18} />
                    {discountPercent}% সেভ করছেন - {formatPrice(savings)} বাঁচছে!
                  </div>
                )}
              </div>
            </div>

            {/* Features List */}
            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-10">
              {((config as any).pricingData?.features?.length ? (config as any).pricingData.features : [
                `প্রিমিয়াম প্রোডাক্ট (১ পিস)`,
                "ফ্রি গিফট আইটেম",
                "প্রিমিয়াম প্যাকেজিং",
                "ঢাকায় ফ্রি ডেলিভারি",
                "১ বছর ওয়ারেন্টি",
                "৭ দিনে রিটার্ন গ্যারান্টি"
              ]).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-[#1A1A2E] font-medium">
                  <CheckCircle className="text-[#2A9D8F] shrink-0" size={20} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <button 
                onClick={scrollToOrder}
                className="w-full py-4 text-xl font-bold rounded-xl text-white transition-all transform hover:-translate-y-1 hover:shadow-xl shadow-lg bg-gradient-to-r from-[#E63946] to-[#C1121F] shadow-[#E63946]/30 flex items-center justify-center gap-3"
              >
                <ShoppingCart size={22} />
                এখনই অর্ডার করুন
              </button>
            </div>

            {/* Stock Warning */}
            <div className="mt-8 flex items-center justify-center gap-2 text-[#E63946] font-bold animate-pulse">
              <AlertTriangle size={20} />
              স্টক সীমিত! মাত্র ২৩টি বাকি আছে
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
