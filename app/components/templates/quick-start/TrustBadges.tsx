import { Truck, Award, ShieldCheck, Headset } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function TrustBadges({ theme, config }: SectionProps) {
  const defaultBadges = [
    {
      icon: <Award size={28} className="text-[#2A9D8F]" />,
      title: "ক্যাশ অন ডেলিভারি",
      description: "পণ্য হাতে পেয়ে টাকা দিন"
    },
    {
      icon: <Truck size={28} className="text-[#F4A261]" />,
      title: "দ্রুত ডেলিভারি",
      description: "ঢাকায় ২৪ ঘণ্টা, সারাদেশে ৩-৫ দিন"
    },
    {
      icon: <ShieldCheck size={28} className="text-[#E63946]" />,
      title: "১০০% অরিজিনাল",
      description: "গুণগত মান নিশ্চিত"
    },
    {
      icon: <Headset size={28} className="text-[#1D3557]" />,
      title: "২৪/৭ সাপোর্ট",
      description: "যেকোনো সমস্যায় কল করুন"
    }
  ];

  const badges = config.trustBadges?.length ? config.trustBadges.map((b: any) => ({
      ...b,
      icon: <ShieldCheck size={28} className="text-[#E63946]" /> 
  })) : defaultBadges;

  return (
    <section className="bg-white py-8 border-b border-[#E5E5E5]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="flex flex-col md:flex-row items-center gap-4 p-5 bg-[#F8F9FA] rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md text-center md:text-left"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-sm shrink-0">
                {badge.icon}
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1A1A2E] mb-1">{badge.title}</h4>
                <p className="text-sm text-[#6C757D]">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
