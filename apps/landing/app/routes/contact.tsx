import type { MetaFunction } from '@remix-run/cloudflare';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { ClientOnly } from '@/components/LazySection';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { Mail, MessageCircle, Phone, MapPin } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'যোগাযোগ - Ozzyl | আমাদের সাথে যোগাযোগ করুন' },
  { name: 'description', content: 'Ozzyl টিমের সাথে যোগাযোগ করুন। আমরা আপনার প্রতিটি প্রশ্নের উত্তর দিতে প্রস্তুত।' },
];

function ContactCard({ icon, title, detail, link }: { icon: React.ReactNode; title: string; detail: string; link?: string }) {
  const content = (
    <div className="flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#006A4E]/50 transition">
      <div className="text-[#006A4E] mt-1">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-white/70">{detail}</p>
      </div>
    </div>
  );
  if (link) return <a href={link} target="_blank" rel="noopener noreferrer">{content}</a>;
  return content;
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">যোগাযোগ করুন</h1>
            <p className="text-xl text-white/60">আমরা সবসময় আপনার সাহায্যের জন্য প্রস্তুত</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">মেসেজ পাঠান</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-white/70 mb-2">আপনার নাম</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#006A4E] focus:outline-none" placeholder="আপনার পুরো নাম" />
                </div>
                <div>
                  <label className="block text-white/70 mb-2">ইমেইল</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#006A4E] focus:outline-none" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-white/70 mb-2">ফোন নম্বর</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#006A4E] focus:outline-none" placeholder="০১৭ ×× ××× ×××" />
                </div>
                <div>
                  <label className="block text-white/70 mb-2">বিষয়</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#006A4E] focus:outline-none" placeholder="কিভাবে সাহায্য করতে পারি?" />
                </div>
                <div>
                  <label className="block text-white/70 mb-2">মেসেজ</label>
                  <textarea rows={5} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#006A4E] focus:outline-none resize-none" placeholder="আপনার মেসেজ লিখুন..." />
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#006A4E] text-white rounded-lg font-semibold hover:bg-[#00875F] transition">পাঠান</button>
              </form>
            </div>
            <div className="space-y-6">
              <ContactCard icon={<Mail />} title="ইমেইল" detail="hello@ozzyl.com" link="mailto:hello@ozzyl.com" />
              <ContactCard icon={<MessageCircle />} title="হোয়াটসঅ্যাপ" detail="Support Chat" link="https://wa.me/8801739416661" />
              <ContactCard icon={<Phone />} title="সাপোর্ট ফোন" detail="01570-260118" link="tel:+8801570260118" />
              <ContactCard icon={<MapPin />} title="ঠিকানা" detail="ঢাকা, বাংলাদেশ" />
              <div className="p-6 rounded-xl bg-gradient-to-r from-[#006A4E] to-[#00875F]">
                <h3 className="text-xl font-bold text-white mb-2">তাৎক্ষণিক সাহায্য চান?</h3>
                <p className="text-white/90 mb-4">আমাদের AI চ্যাটবট আপনার প্রশ্নের উত্তর দিতে প্রস্তুত</p>
                <button className="px-6 py-2 bg-white text-[#006A4E] rounded-lg font-semibold hover:bg-white/90 transition">চ্যাট শুরু করুন</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ClientOnly><OzzylAIChatWidget /></ClientOnly>
    </div>
  );
}
