import { X, Check, XCircle, CheckCircle } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function ProblemSolution({ theme, config }: SectionProps) {
  const defaultProblems = [
    "বাজারে নকল প্রোডাক্ট পাওয়া যায়, আসল চেনা কঠিন",
    "অনলাইনে অর্ডার করে প্রতারণার শিকার হওয়ার ভয়",
    "ভালো মানের প্রোডাক্ট অনেক দামি",
    "ডেলিভারিতে অনেক সময় লাগে",
    "প্রোডাক্ট পছন্দ না হলে রিটার্ন করা কঠিন"
  ];

  const defaultSolutions = [
    "১০০% অরিজিনাল প্রোডাক্ট, অথেনটিসিটি গ্যারান্টি",
    "ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে টাকা দিন",
    "সেরা প্রাইস গ্যারান্টি - কোথাও কম পেলে জানান",
    "ঢাকায় ২৪ ঘণ্টায়, সারাদেশে ৩-৫ দিনে ডেলিভারি",
    "৭ দিনের ইজি রিটার্ন পলিসি"
  ];

  const problems = config.problems?.length ? config.problems : defaultProblems;
  const solutions = config.solutions?.length ? config.solutions : defaultSolutions;

  return (
    <section className="py-16 md:py-20 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1D3557] mb-3">
            আপনার সমস্যার <span className="text-[#E63946]">সেরা সমাধান</span>
          </h2>
          <p className="text-[#6C757D]">এই সমস্যাগুলো কি আপনার সাথে হচ্ছে?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Problem Card */}
          <div className="bg-gradient-to-br from-[#FFF5F5] to-[#FED7D7] border-2 border-[#FC8181] rounded-3xl p-8 md:p-10 h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#FC8181] rounded-2xl flex items-center justify-center text-white shrink-0">
                <X size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#C53030]">সমস্যা যা আপনি ফেস করছেন</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-black/10 pb-3 last:border-0 last:pb-0">
                  <XCircle className="text-[#C53030] mt-1 shrink-0" size={18} />
                  <span className="text-[#1A1A2E]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-gradient-to-br from-[#F0FFF4] to-[#C6F6D5] border-2 border-[#68D391] rounded-3xl p-8 md:p-10 h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#68D391] rounded-2xl flex items-center justify-center text-white shrink-0">
                <Check size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#276749]">আমাদের সমাধান</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-black/10 pb-3 last:border-0 last:pb-0">
                  <CheckCircle className="text-[#276749] mt-1 shrink-0" size={18} />
                  <span className="text-[#1A1A2E]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
