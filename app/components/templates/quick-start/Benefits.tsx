import { Medal, ShieldCheck, Coins, Truck, Undo2, Users, CheckCircle } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function Benefits({ theme, config }: SectionProps) {
  const defaultBenefits = [
    {
      icon: <Medal size={36} />,
      title: "প্রিমিয়াম কোয়ালিটি",
      description: "বিশ্বমানের প্রোডাক্ট যা দীর্ঘদিন টেকসই এবং আপনার প্রত্যাশা পূরণ করবে।"
    },
    {
      icon: <ShieldCheck size={36} />,
      title: "১০০% গ্যারান্টি",
      description: "প্রোডাক্টে কোনো সমস্যা থাকলে সম্পূর্ণ টাকা ফেরত অথবা প্রোডাক্ট চেঞ্জ।"
    },
    {
      icon: <Coins size={36} />,
      title: "সাশ্রয়ী মূল্য",
      description: "মিডলম্যান ছাড়া সরাসরি আপনার কাছে, তাই দাম কম।"
    },
    {
      icon: <Truck size={36} />,
      title: "নিরাপদ প্যাকেজিং",
      description: "প্রিমিয়াম প্যাকেজিং এ প্রোডাক্ট ডেলিভারি, ক্ষতির কোনো ভয় নেই।"
    },
    {
      icon: <Undo2 size={36} />,
      title: "ইজি রিটার্ন",
      description: "৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই রিটার্ন করতে পারবেন।"
    },
    {
      icon: <Users size={36} />,
      title: "১০,০০০+ খুশি গ্রাহক",
      description: "হাজারো গ্রাহক আমাদের উপর বিশ্বাস রাখেন এবং বারবার কেনেন।"
    }
  ];

  const benefits = config.benefits?.length ? config.benefits.map((b: any) => ({
      ...b,
      icon: <CheckCircle size={36} className="text-[#E63946]" /> // Fallback icon for dynamic data
  })) : defaultBenefits;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1D3557] mb-3">
            কেন আমাদের থেকে <span className="text-[#E63946]">কিনবেন?</span>
          </h2>
          <p className="text-[#6C757D]">আমরা নিশ্চিত করি আপনার সেরা অভিজ্ঞতা</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((item, index) => (
            <div 
              key={index}
              className="group bg-[#F8F9FA] p-8 rounded-3xl text-center border-2 border-transparent hover:border-[#E63946] hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-[#E63946] to-[#C1121F] rounded-2xl text-white shadow-lg">
                {item.icon}
              </div>
              <h4 className="text-xl font-bold text-[#1D3557] mb-3">{item.title}</h4>
              <p className="text-[#6C757D] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
