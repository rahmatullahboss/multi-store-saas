import { ClipboardList, PhoneCall, Truck, Banknote } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function HowToOrder({ theme }: SectionProps) {
  const steps = [
    {
      icon: <ClipboardList size={32} />,
      title: "ফর্ম পূরণ করুন",
      description: "উপরের অর্ডার ফর্মে আপনার নাম, ফোন ও ঠিকানা দিন"
    },
    {
      icon: <PhoneCall size={32} />,
      title: "কল কনফার্মেশন",
      description: "আমাদের টিম আপনাকে কল করে অর্ডার কনফার্ম করবে"
    },
    {
      icon: <Truck size={32} />,
      title: "দ্রুত ডেলিভারি",
      description: "ঢাকায় ২৪ ঘণ্টায়, সারাদেশে ৩-৫ দিনে ডেলিভারি"
    },
    {
      icon: <Banknote size={32} />,
      title: "টাকা দিন",
      description: "প্রোডাক্ট হাতে পেয়ে চেক করে টাকা দিন"
    }
  ];

  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#1D3557] mb-3">
            কিভাবে <span className="text-[#E63946]">অর্ডার করবেন?</span>
          </h2>
          <p className="text-[#6C757D]">মাত্র ৪টি সহজ ধাপে অর্ডার করুন</p>
        </div>

        <div className="relative grid md:grid-cols-4 gap-8">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[50px] left-[12%] right-[12%] h-1 bg-[#E5E5E5] z-0" />

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-white border-4 border-[#E63946] text-[#E63946] rounded-full flex items-center justify-center shadow-md">
                {step.icon}
              </div>
              <div className="inline-block px-3 py-1 bg-[#E63946] text-white text-xs font-bold rounded-full mb-3">ধাপ {index + 1}</div>
              <h4 className="text-xl font-bold text-[#1D3557] mb-2">{step.title}</h4>
              <p className="text-[#6C757D] text-sm leading-relaxed px-4">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
