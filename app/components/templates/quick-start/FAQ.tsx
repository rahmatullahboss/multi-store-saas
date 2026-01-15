import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function FAQ({ theme, config }: SectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs = [
    {
      q: "ডেলিভারি কতদিনে পাবো?",
      a: "ঢাকার ভেতরে সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি দেওয়া হয়। ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে প্রোডাক্ট পৌঁছে যায়।"
    },
    {
      q: "ক্যাশ অন ডেলিভারি (COD) আছে?",
      a: "জি, অবশ্যই! আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা দিই। প্রোডাক্ট হাতে পেয়ে দেখে-বুঝে টাকা দিতে পারবেন।"
    },
    {
      q: "প্রোডাক্ট কি ১০০% অরিজিনাল?",
      a: "আমরা ১০০% অরিজিনাল এবং অথেনটিক প্রোডাক্ট গ্যারান্টি দিই। প্রতিটি প্রোডাক্ট কোয়ালিটি চেক করে পাঠানো হয়।"
    },
    {
      q: "রিটার্ন/এক্সচেঞ্জ পলিসি কি?",
      a: "প্রোডাক্ট রিসিভ করার ৭ দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জ করতে পারবেন। প্রোডাক্টে কোনো ত্রুটি থাকলে আমরা ফ্রি-তে চেঞ্জ করে দিবো।"
    },
    {
      q: "ডেলিভারি চার্জ কত?",
      a: "ডেলিভারি চার্জ লোকেশন ভেদে ভিন্ন হতে পারে, তবে সাধারণত ঢাকার ভিতরে ৬০ টাকা এবং বাইরে ১২০ টাকা।"
    },
    {
      q: "কিভাবে যোগাযোগ করবো?",
      a: "যেকোনো প্রয়োজনে আমাদের হটলাইন নম্বরে কল করুন অথবা হোয়াটসঅ্যাপে মেসেজ দিন।"
    }
  ];

  const faqs = config.faq?.length ? config.faq : defaultFaqs;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1D3557] mb-3">
            সাধারণ <span className="text-[#E63946]">জিজ্ঞাসা</span>
          </h2>
          <p className="text-[#6C757D]">আপনার প্রশ্নের উত্তর এখানে পাবেন</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-[#E63946] bg-[#FFF5F5]/30' : 'border-transparent bg-[#F8F9FA] hover:border-[#F4A261]/30'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
           <span className={`font-bold text-lg ${openIndex === index ? 'text-[#E63946]' : 'text-[#1D3557]'}`}>
                  {'question' in faq ? faq.question : (faq as any).q}
                </span>
                <ChevronDown 
                  className={`text-[#E63946] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48' : 'max-h-0'}`}
              >
                <div className="p-6 pt-0 text-[#6C757D] leading-relaxed">
                  {'answer' in faq ? faq.answer : (faq as any).a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
