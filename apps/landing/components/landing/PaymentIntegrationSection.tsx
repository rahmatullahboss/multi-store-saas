import { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, Smartphone, CheckCircle2, Lock, Zap, ArrowRight, Globe } from 'lucide-react';

export function PaymentIntegrationSection() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-animate the payment flow
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const gateways = [
    { name: 'bKash', icon: <Smartphone className="w-5 h-5" />, color: '#E2136E' },
    { name: 'Nagad', icon: <Smartphone className="w-5 h-5" />, color: '#ED0A24' },
    { name: 'Rocket', icon: <Smartphone className="w-5 h-5" />, color: '#8C3494' },
    { name: 'Stripe', icon: <Globe className="w-5 h-5" />, color: '#635BFF' },
  ];

  const steps = [
    { title: 'অর্ডার প্লেস', desc: 'কাস্টমার প্রোডাক্ট কিনলে অটোমেটিক পেমেন্ট পেজে যাবে', icon: CreditCard },
    { title: 'পেমেন্ট মেথড', desc: 'বিকাশ, নগদ বা কার্ড থেকে পছন্দের মেথড সিলেক্ট করবে', icon: Smartphone },
    { title: 'ভেরিফিকেশন', desc: 'নিরাপদভাবে OTP বা পাসওয়ার্ড দিয়ে পেমেন্ট কনফার্ম হবে', icon: Lock },
    { title: 'সাফল্য!', desc: 'পেমেন্ট সাকসেস হলে সাথে সাথে অর্ডার কনফার্ম হবে', icon: CheckCircle2 },
  ];

  return (
    <section className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-8"
            >
              <CreditCard className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-400">Payment Integration</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              পেমেন্ট নিয়ে নেই কোন টেনশন,<br />
              সাফল্যের সাথে প্রতিটি <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Transaction</span>
            </h2>
            
            <p className="text-lg text-gray-400 mb-10 max-w-xl">
              বিকাশ, নগদ থেকে শুরু করে ইন্টারন্যাশনাল কার্ড পেমেন্ট — সবকিছু এক প্ল্যাটফর্মে। ১টি ক্লিকেই পেমেন্ট গেটওয়ে সেটআপ করুন আপনার স্টোরে।
            </p>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <div
                  key={i} className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 ${
                    activeStep === i ? 'bg-white/10 border border-white/20' : 'opacity-50'
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-xl ${activeStep === i ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 ${activeStep === i ? 'text-white' : 'text-gray-400'}`}>{step.title}</h4>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Mockup */}
          <div className="relative">
            {/* Payment Phone Mockup */}
            <div className="relative mx-auto w-[300px] h-[600px] rounded-[3rem] border-8 border-white/10 bg-[#121212] shadow-2xl overflow-hidden"
            >
              {/* Screen Content */}
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 bg-white/5 border-b border-white/5 text-center">
                   <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-4" />
                   <p className="text-xs text-gray-500 uppercase tracking-widest">Secure Checkout</p>
                </div>

                <div className="flex-1 p-6">
                  {/* Order Summary */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <div className="text-2xl font-bold text-white">৳১২,৫০০.০০</div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3 mb-8">
                    {gateways.map((gate, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                          i === 0 ? 'bg-white/10 border-pink-500/50' : 'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg`} style={{ backgroundColor: `${gate.color}20` }}>
                            <span style={{ color: gate.color }}>{gate.icon}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{gate.name}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${i === 0 ? 'border-pink-500 bg-pink-500' : 'border-white/20'}`}>
                           {i === 0 && <div className="w-full h-full flex items-center justify-center text-[10px] text-white">✓</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button className="w-full py-4 rounded-xl bg-pink-500 text-white font-bold shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
                  >
                    পেমেন্ট কনফার্ম করুন <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-500">
                    <Lock className="w-3 h-3" /> 256-bit Encrypted SSL Secure
                  </div>
                </div>
              </div>

              {/* Success Overlay (Step 3) */}
              
                {activeStep === 3 && (
                  <div className="absolute inset-0 bg-[#0A0A0F] flex flex-col items-center justify-center p-8 z-20"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">পেমেন্ট সফল হয়েছে!</h3>
                    <p className="text-sm text-center text-gray-400">অর্ডার কনফার্মেশনের জন্য কাস্টমারকে একটি এসএমএস পাঠানো হয়েছে।</p>
                  </div>
                )}
              
            </div>

            {/* Floating Trust Badges */}
            <div className="absolute -right-8 top-1/4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-emerald-500" />
                 <div>
                    <p className="text-white text-xs font-bold">Fraud Protection</p>
                    <p className="text-gray-500 text-[10px]">Real-time detection</p>
                 </div>
              </div>
            </div>

            <div className="absolute -left-12 bottom-1/4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                 <Zap className="w-6 h-6 text-yellow-500" />
                 <div>
                    <p className="text-white text-xs font-bold">Instantly Credited</p>
                    <p className="text-gray-500 text-[10px]">Direct to balance</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
