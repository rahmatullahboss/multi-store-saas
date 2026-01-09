/**
 * Custom Bangladesh-specific blocks for GrapesJS
 */

import type { Editor } from 'grapesjs';

export const bdBlocksPlugin = (editor: Editor) => {
  const { Blocks } = editor;

  // 1. Hero Section
  Blocks.add('bd-hero', {
    label: 'Hero Section',
    category: 'BD Landing',
    content: `
      <section class="py-12 px-6 text-center bg-white border-b border-gray-100">
        <div class="max-w-4xl mx-auto">
          <span class="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-4 uppercase">অফারটি সীমিত সময়ের জন্য</span>
          <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">আপনার পণ্যের আকর্ষণীয় হেডলাইন এখানে লিখুন</h1>
          <p class="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">পণ্যের মূল বৈশিষ্ট্য বা কেন এটি সেরা তা ১-২ লাইনে এখানে সংক্ষেপে বর্ণনা করুন।</p>
          <div class="mb-10">
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" alt="Product" class="mx-auto rounded-2xl shadow-2xl max-w-full h-auto" />
          </div>
          <button class="bg-emerald-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-lg hover:bg-emerald-700 transition transform hover:scale-105">অর্ডার করতে এখানে ক্লিক করুন</button>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12"><rect width="20" height="14" x="2" y="5" rx="2" stroke="currentColor"/><path d="M7 10h10M7 14h5" stroke="currentColor" stroke-linecap="round"/></svg>',
  });

  // 2. Trust Badges
  Blocks.add('bd-trust', {
    label: 'Trust Badges',
    category: 'BD Landing',
    content: `
      <div class="py-10 bg-gray-50">
        <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">🚚</div>
            <h4 class="font-bold text-gray-800 text-sm">সারা দেশে ডেলিভারি</h4>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">💸</div>
            <h4 class="font-bold text-gray-800 text-sm">ক্যাশ অন ডেলিভারি</h4>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">🛡️</div>
            <h4 class="font-bold text-gray-800 text-sm">অরিজিনাল প্রোডাক্ট</h4>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">🔄</div>
            <h4 class="font-bold text-gray-800 text-sm">রিটার্ন পলিসি</h4>
          </div>
        </div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12"><circle cx="12" cy="12" r="9" stroke="currentColor"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  });

  // 3. Order Form (Bangla)
  Blocks.add('bd-order-form', {
    label: 'Order Form',
    category: 'BD Landing',
    content: `
      <section class="py-12 bg-white px-6">
        <div class="max-w-xl mx-auto bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-xl">
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-8 underline decoration-emerald-500 decoration-4 underline-offset-8">অর্ডার করতে নিচের ফর্মটি পূরণ করুন</h2>
          <form class="space-y-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">আপনার নাম *</label>
              <input type="text" placeholder="পুরো নাম লিখুন" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">মোবাইল নাম্বার *</label>
              <input type="tel" placeholder="01XXXXXXXXX" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">সম্পূর্ণ ঠিকানা *</label>
              <textarea placeholder="গ্রাম/মহল্লা, থানা, জেলা লিখুন" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none h-24" required></textarea>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
               <div class="flex justify-between font-bold text-lg">
                 <span>সর্বমোট মূল্য:</span>
                 <span class="text-emerald-600">৳ ১৯৫০</span>
               </div>
            </div>
            <button type="submit" class="w-full bg-emerald-600 text-white text-xl font-extrabold py-5 rounded-2xl shadow-lg hover:bg-emerald-700 transition">অর্ডার কনফার্ম করুন</button>
          </form>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12"><rect width="14" height="18" x="5" y="3" rx="2" stroke="currentColor"/><path d="M10 8h4M10 12h4" stroke="currentColor" stroke-linecap="round"/></svg>',
  });

  // 4. Call Now (High Conversion)
  Blocks.add('bd-call-now', {
    label: 'Call Now Button',
    category: 'High Conversion',
    content: `
      <div class="py-8 px-6 text-center">
        <a href="tel:01XXXXXXXXX" class="inline-flex items-center gap-3 bg-blue-600 text-white text-2xl font-black px-10 py-5 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-none hover:translate-y-1 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          এখনই কল করুন
        </a>
        <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest">ক্লিক করলেই কল যাবে</p>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-12 h-12 text-blue-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
  });
};
