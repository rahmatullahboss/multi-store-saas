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
  // 5. YouTube Video Block
  Blocks.add('bd-video', {
    label: 'YouTube Video',
    category: 'High Conversion',
    content: `
      <section class="py-10 bg-gray-50">
        <div class="max-w-4xl mx-auto px-6">
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">আমাদের পণ্যের ভিডিওটি দেখুন</h2>
          <div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-red-600" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="4" /><path d="M10 9l5 3-5 3V9z" fill="currentColor" /></svg>',
  });

  // 6. Dual Column Order (Product + Form)
  Blocks.add('bd-dual-order', {
    label: 'Dual Order Section',
    category: 'High Conversion',
    content: `
      <section class="py-12 bg-white px-4">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <!-- Left: Product Details -->
          <div class="space-y-6">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" alt="Product" class="w-full rounded-2xl shadow-lg border border-gray-100" />
            <h3 class="text-2xl font-bold text-gray-900 border-b pb-2">প্যাকেজে যা যা থাকছে:</h3>
            <ul class="space-y-3">
              <li class="flex items-center gap-3 text-lg font-medium text-gray-700">
                <span class="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✓</span>
                মিনিমাম ১ বছর ওয়ারেন্টি
              </li>
              <li class="flex items-center gap-3 text-lg font-medium text-gray-700">
                <span class="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✓</span>
                ৭ দিনের মানি ব্যাক গ্যারান্টি
              </li>
              <li class="flex items-center gap-3 text-lg font-medium text-gray-700">
                <span class="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✓</span>
                ফ্রি ডেলিভারি (সীমিত সময়ের জন্য)
              </li>
            </ul>
          </div>
          
          <!-- Right: Order Form -->
          <div class="bg-gray-50 p-6 md:p-8 rounded-3xl border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
             <div class="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
             <h2 class="text-2xl font-black text-gray-900 mb-6 text-center">অর্ডার কনফার্ম করতে তথ্য দিন</h2>
             <form class="space-y-4">
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">আপনার নাম</label>
                  <input type="text" placeholder="এখানে নাম লিখুন" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition" />
               </div>
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">মোবাইল নাম্বার</label>
                  <input type="tel" placeholder="017XXXXXXXX" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition" />
               </div>
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">ঠিকানা</label>
                  <textarea placeholder="বাসা নং, রোড নং, এলাকা..." class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition h-20"></textarea>
               </div>
               
               <div class="bg-white p-3 rounded-xl border border-dashed border-gray-300">
                  <div class="flex justify-between items-center mb-2">
                     <span class="text-sm font-bold text-gray-500">প্রোডাক্টের নাম</span>
                     <span class="text-sm font-bold text-gray-900">৳৯৫০</span>
                  </div>
                  <div class="flex justify-between items-center text-emerald-600">
                     <span class="text-xs font-bold uppercase">ডেলিভারি চার্জ</span>
                     <span class="text-xs font-bold">ফ্রি</span>
                  </div>
                  <div class="border-t border-gray-100 my-2 pt-2 flex justify-between items-center text-xl font-black text-gray-900">
                     <span>সর্বমোট</span>
                     <span>৳৯৫০</span>
                  </div>
               </div>

               <button type="button" class="w-full bg-gray-900 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all">অর্ডার কনফার্ম করুন</button>
             </form>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-gray-600" stroke-width="1.5"><rect x="2" y="4" width="10" height="16" rx="2" /><rect x="14" y="4" width="8" height="16" rx="2" /><path d="M16 8h4M16 12h4" stroke="currentColor" /></svg>',
  });

  // 7. Feature List (Grid)
  Blocks.add('bd-features-grid', {
    label: 'Feature Grid',
    category: 'BD Landing',
    content: `
      <section class="py-12 px-4 bg-white">
        <div class="max-w-5xl mx-auto">
           <h2 class="text-3xl font-bold text-center text-gray-900 mb-10">কেন এই পণ্যটি আপনার জন্য সেরা?</h2>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-lg transition">
                 <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">💎</div>
                 <h3 class="text-xl font-bold text-gray-900 mb-2">প্রিমিয়াম কোয়ালিটি</h3>
                 <p class="text-gray-600 leading-relaxed">আমরা দিচ্ছি ১০০% অরিজিনাল এবং হাই কোয়ালিটি ম্যাটেরিয়াল এনশিওর করা প্রোডাক্ট।</p>
              </div>
              <div class="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-lg transition">
                 <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">🚀</div>
                 <h3 class="text-xl font-bold text-gray-900 mb-2">সুপার ফাস্ট ডেলিভারি</h3>
                 <p class="text-gray-600 leading-relaxed">অর্ডার করার ২৪-৪৮ ঘন্টার মধ্যে আপনার ঠিকানায় পৌঁছে যাবে আপনার পণ্য।</p>
              </div>
              <div class="p-6 bg-purple-50 rounded-2xl border border-purple-100 hover:shadow-lg transition">
                 <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">💯</div>
                 <h3 class="text-xl font-bold text-gray-900 mb-2">সেটিসফ্যাকশন গ্যারান্টি</h3>
                 <p class="text-gray-600 leading-relaxed">প্রোডাক্ট হাতে পেয়ে চেক করে পেমেন্ট করার সুবিধা, তাই কোনো রিস্ক নেই।</p>
              </div>
           </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-blue-500" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>',
  });

  // 8. Mobile Sticky Footer
  Blocks.add('bd-sticky-footer', {
    label: 'Mobile Sticky Footer',
    category: 'High Conversion',
    content: `
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex gap-3 md:hidden z-50">
         <a href="tel:01XXXXXXXXX" class="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            কল করুন
         </a>
         <button onclick="document.querySelector('form').scrollIntoView({behavior: 'smooth'})" class="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 transition animate-pulse">
            অর্ডার করুন
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-emerald-600" stroke-width="1.5"><rect x="4" y="16" width="16" height="6" rx="2" /><path d="M12 4v4m0 4v4" stroke="currentColor" stroke-dasharray="2 2" /></svg>',
  });
};
