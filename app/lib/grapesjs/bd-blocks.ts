/**
 * Custom Bangladesh-specific blocks for GrapesJS
 */

import type { Editor } from 'grapesjs';

export const bdBlocksPlugin = (editor: Editor) => {
  const { Blocks } = editor;

  // 0. Header
  Blocks.add('bd-header', {
    label: 'Header / Navbar',
    category: 'BD Landing',
    content: `
      <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
           <div class="font-black text-2xl text-primary flex items-center gap-2">
             <span class="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">S</span>
             STORE
           </div>
           
           <nav class="hidden md:flex items-center gap-8 font-medium text-gray-600">
             <a href="#features" class="hover:text-primary transition">ফিচার</a>
             <a href="#reviews" class="hover:text-primary transition">রিভিউ</a>
             <a href="#faq" class="hover:text-primary transition">প্রশ্নোত্তৰ</a>
           </nav>
           
           <a href="#order" class="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition">অর্ডার করুন</a>
        </div>
      </header>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="6" rx="1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
  });

  // 1. Hero Section (Classic)
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
          <a href="#order" class="inline-block bg-primary text-white text-xl font-bold px-12 py-5 rounded-full shadow-lg hover:opacity-90 transition transform hover:scale-105">অর্ডার করতে এখানে ক্লিক করুন</a>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12"><rect width="20" height="14" x="2" y="5" rx="2" stroke="currentColor"/><path d="M7 10h10M7 14h5" stroke="currentColor" stroke-linecap="round"/></svg>',
  });

  // 1.1 Hero Section (Modern Split)
  Blocks.add('bd-hero-modern', {
    label: 'Hero Modern',
    category: 'BD Landing',
    content: `
      <section class="py-12 md:py-20 bg-gray-50 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="order-2 md:order-1 text-center md:text-left">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6">
                <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                নতুন কালেকশন ২০২৫
              </div>
              <h1 class="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                আপনার স্টাইলের নতুন <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">সংজ্ঞা</span>
              </h1>
              <p class="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                সেরা মানের মেটেরিয়াল এবং আধুনিক ডিজাইনের সংমিশ্রণ। আজই অর্ডার করুন এবং উপভোগ করুন বিশেষ ছাড়।
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#order" class="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition transform hover:-translate-y-1 shadow-lg">
                  এখনই কিনুন
                </a>
                <a href="#features" class="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition">
                  বিস্তারিত দেখুন
                </a>
              </div>
              <div class="mt-10 flex items-center justify-center md:justify-start gap-6 text-gray-500 text-sm font-medium">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  ফ্রি ডেলিভারি
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  অরিজিনাল পণ্য
                </div>
              </div>
            </div>
            <div class="order-1 md:order-2 relative">
              <div class="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop" alt="Product" class="relative w-full h-auto rounded-3xl shadow-2xl transform hover:scale-[1.02] transition duration-500" />
              <div class="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl hidden md:block animate-bounce" style="animation-duration: 3s;">
                <div class="flex items-center gap-3">
                  <div class="flex -space-x-2">
                    <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div class="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div class="w-10 h-10 rounded-full bg-gray-400 border-2 border-white"></div>
                  </div>
                  <div class="text-xs font-bold">
                    <span class="block text-lg">১০০০+</span>
                    হ্যাপি কাস্টমার
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
  });

  // 1.2 Hero Section (Video/Dark)
  Blocks.add('bd-hero-video', {
    label: 'Hero Video',
    category: 'BD Landing',
    content: `
      <section class="relative py-24 md:py-32 px-6 flex items-center justify-center overflow-hidden bg-gray-900 text-white">
        <!-- Background Image/Video Placeholder -->
        <div class="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop" class="w-full h-full object-cover opacity-30" alt="Background" />
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900"></div>
        </div>
        
        <div class="relative z-10 max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">আপনার গেমিং অভিজ্ঞতা<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">নেক্সট লেভেলে নিয়ে যান</span></h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">আল্ট্রা লো ল্যাটেন্সি এবং ক্রিস্টাল ক্লিয়ার সাউন্ড। প্রফেশনাল গেমারদের প্রথম পছন্দ।</p>
          <div class="flex flex-col sm:flex-row gap-5 justify-center">
             <a href="#order" class="px-10 py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-pink-500/30 hover:scale-105 transition-all">
               অর্ডার করুন - ১২৫০৳
             </a>
             <button class="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold text-lg rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-3">
               <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               ভিডিও দেখুন
             </button>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>',
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
      <section id="order" class="py-12 bg-white px-6">
        <div class="max-w-xl mx-auto bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-xl">
          <h2 class="text-2xl font-bold text-center text-gray-900 mb-8 underline decoration-primary decoration-4 underline-offset-8">অর্ডার করতে নিচের ফর্মটি পূরণ করুন</h2>
          <form action="/api/create-order" method="POST" class="space-y-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">আপনার নাম *</label>
              <input type="text" name="customer_name" placeholder="পুরো নাম লিখুন" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">মোবাইল নাম্বার *</label>
              <input type="tel" name="phone" placeholder="01XXXXXXXXX" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">সম্পূর্ণ ঠিকানা *</label>
              <textarea name="address" placeholder="গ্রাম/মহল্লা, থানা, জেলা লিখুন" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none h-24" required></textarea>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
               <div class="flex justify-between font-bold text-lg">
                 <span>সর্বমোট মূল্য:</span>
                 <span class="text-primary">৳ ১৯৫০</span>
               </div>
            </div>
            <button type="submit" class="w-full bg-primary text-white text-xl font-extrabold py-5 rounded-2xl shadow-lg hover:opacity-90 transition">অর্ডার কনফার্ম করুন</button>
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
        <a href="tel:01XXXXXXXXX" class="inline-flex items-center gap-3 bg-secondary text-white text-2xl font-black px-10 py-5 rounded-2xl shadow-xl hover:shadow-none hover:translate-y-1 transition-all duration-300">
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
                <span class="w-6 h-6 bg-emerald-100 text-primary rounded-full flex items-center justify-center text-xs">✓</span>
                মিনিমাম ১ বছর ওয়ারেন্টি
              </li>
              <li class="flex items-center gap-3 text-lg font-medium text-gray-700">
                <span class="w-6 h-6 bg-emerald-100 text-primary rounded-full flex items-center justify-center text-xs">✓</span>
                ৭ দিনের মানি ব্যাক গ্যারান্টি
              </li>
              <li class="flex items-center gap-3 text-lg font-medium text-gray-700">
                <span class="w-6 h-6 bg-emerald-100 text-primary rounded-full flex items-center justify-center text-xs">✓</span>
                ফ্রি ডেলিভারি (সীমিত সময়ের জন্য)
              </li>
            </ul>
          </div>
          
          <!-- Right: Order Form -->
          <div class="bg-gray-50 p-6 md:p-8 rounded-3xl border-2 border-primary/30 shadow-2xl relative overflow-hidden">
             <div class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
             <h2 class="text-2xl font-black text-gray-900 mb-6 text-center">অর্ডার কনফার্ম করতে তথ্য দিন</h2>
             <form action="/api/create-order" method="POST" class="space-y-4">
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">আপনার নাম</label>
                  <input type="text" name="customer_name" placeholder="এখানে নাম লিখুন" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
               </div>
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">মোবাইল নাম্বার</label>
                  <input type="tel" name="phone" placeholder="017XXXXXXXX" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
               </div>
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">ঠিকানা</label>
                  <textarea name="address" placeholder="বাসা নং, রোড নং, এলাকা..." class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition h-20"></textarea>
               </div>
               
               <div class="bg-white p-3 rounded-xl border border-dashed border-gray-300">
                  <div class="flex justify-between items-center mb-2">
                     <span class="text-sm font-bold text-gray-500">প্রোডাক্টের নাম</span>
                     <span class="text-sm font-bold text-gray-900">৳৯৫০</span>
                  </div>
                  <div class="flex justify-between items-center text-primary">
                     <span class="text-xs font-bold uppercase">ডেলিভারি চার্জ</span>
                     <span class="text-xs font-bold">ফ্রি</span>
                  </div>
                  <div class="border-t border-gray-100 my-2 pt-2 flex justify-between items-center text-xl font-black text-gray-900">
                     <span>সর্বমোট</span>
                     <span>৳৯৫০</span>
                  </div>
               </div>

               <button type="submit" class="w-full bg-gray-900 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all">অর্ডার কনফার্ম করুন</button>
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

  // 7.1 Feature List (Zigzag)
  Blocks.add('bd-features-zigzag', {
    label: 'Feature Zigzag',
    category: 'BD Landing',
    content: `
      <section class="py-16 bg-white overflow-hidden">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">কেন আমরাই সেরা?</h2>
            <div class="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <!-- Item 1 -->
          <div class="flex flex-col md:flex-row items-center gap-10 mb-20">
            <div class="w-full md:w-1/2">
              <div class="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" alt="Feature" class="w-full hover:scale-110 transition duration-700" />
              </div>
            </div>
            <div class="w-full md:w-1/2 md:pl-10">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-6 text-blue-600">🎧</div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">ক্রিস্টাল ক্লিয়ার সাউন্ড</h3>
              <p class="text-gray-600 text-lg leading-relaxed mb-6">
                আমাদের হেডফোনে ব্যবহার করা হয়েছে অত্যাধুনিক নয়েজ ক্যান্সলেশন প্রযুক্তি যা আপনাকে দিবে এক দারুণ অভিজ্ঞতা। বাইরের শব্দ একদমই কানে আসবে না।
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-gray-700 font-medium"><span class="text-green-500 text-xl">✓</span> অ্যাক্টিভ নয়েজ ক্যান্সলেশন</li>
                <li class="flex items-center gap-3 text-gray-700 font-medium"><span class="text-green-500 text-xl">✓</span> ডিপ বেস টেকনোলজি</li>
              </ul>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="flex flex-col md:flex-row-reverse items-center gap-10">
             <div class="w-full md:w-1/2">
              <div class="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform -rotate-2 hover:rotate-0 transition duration-500">
                <img src="https://images.unsplash.com/photo-1572569028738-411a0977d4aa?w=800&q=80" alt="Feature" class="w-full hover:scale-110 transition duration-700" />
              </div>
            </div>
            <div class="w-full md:w-1/2 md:pr-10 text-left md:text-right">
              <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-6 text-purple-600 ml-0 md:ml-auto">🔋</div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">লং লাস্টিং ব্যাটারি</h3>
              <p class="text-gray-600 text-lg leading-relaxed mb-6">
                একবার চার্জ দিলে টানা ৪০ ঘণ্টা পর্যন্ত ব্যবহার করতে পারবেন। তাই চার্জ শেষ হয়ে যাওয়ার কোনো ভয় নেই। ট্রাভেলের জন্য বেস্ট চয়েস।
              </p>
              <ul class="space-y-3 flex flex-col items-start md:items-end">
                <li class="flex items-center gap-3 text-gray-700 font-medium"><span class="text-green-500 text-xl">✓</span> ৪০ ঘণ্টা প্লেব্যাক টাইম</li>
                <li class="flex items-center gap-3 text-gray-700 font-medium"><span class="text-green-500 text-xl">✓</span> ফাস্ট চার্জিং সাপোর্ট</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="8" height="6" rx="1"/><rect x="14" y="14" width="8" height="6" rx="1"/><path d="M2 14h8M14 4h8"/></svg>',
  });

  // 8. Mobile Sticky Footer
  Blocks.add('bd-sticky-footer', {
    label: 'Mobile Sticky Footer',
    category: 'High Conversion',
    content: `
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex gap-3 md:hidden z-50">
         <a href="tel:01XXXXXXXXX" class="flex-1 bg-secondary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            কল করুন
         </a>
         <a href="#order" class="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 transition animate-pulse">
            অর্ডার করুন
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </a>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-emerald-600" stroke-width="1.5"><rect x="4" y="16" width="16" height="6" rx="2" /><path d="M12 4v4m0 4v4" stroke="currentColor" stroke-dasharray="2 2" /></svg>',
  });

  // 10.1 Testimonial Marquee (Scrolling)
  Blocks.add('bd-testimonials-marquee', {
    label: 'Testimonial Scroll',
    category: 'High Conversion',
    content: `
      <section class="py-16 bg-slate-900 overflow-hidden">
         <div class="text-center mb-10 px-4">
            <h2 class="text-3xl font-bold text-white mb-2">বিশ্বাস ও ভালোবাসার গল্প</h2>
            <p class="text-slate-400">আমাদের ৫০০০+ হ্যাপি কাস্টমারদের কিছু মতামত</p>
         </div>
         
         <div class="relative w-full">
            <div class="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
            <div class="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
            
            <div class="flex gap-6 animate-[scroll_20s_linear_infinite] hover:[animation-play-state:paused] w-max px-6">
               <!-- Card 1 -->
               <div class="w-80 p-6 bg-slate-800 rounded-xl border border-slate-700 flex-shrink-0">
                  <div class="flex text-yellow-400 mb-4">★★★★★</div>
                  <p class="text-slate-300 mb-6 italic">"প্রোডাক্ট টি হাতে পেয়ে আমি খুবই খুশি। ছবিতে যেমন দেখেছি বাস্তবে ঠিক তেমনই।"</p>
                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">R</div>
                     <div><div class="font-bold text-white">Rakib Hasan</div><div class="text-xs text-slate-500">Dhaka</div></div>
                  </div>
               </div>
               <!-- Card 2 -->
               <div class="w-80 p-6 bg-slate-800 rounded-xl border border-slate-700 flex-shrink-0">
                  <div class="flex text-yellow-400 mb-4">★★★★★</div>
                  <p class="text-slate-300 mb-6 italic">"খুবই ফাস্ট ডেলিভারি পেয়েছি। ধন্যবাদ সেলারকে।"</p>
                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">S</div>
                     <div><div class="font-bold text-white">Sumaiya Akter</div><div class="text-xs text-slate-500">Chittagong</div></div>
                  </div>
               </div>
               <!-- Card 3 -->
               <div class="w-80 p-6 bg-slate-800 rounded-xl border border-slate-700 flex-shrink-0">
                  <div class="flex text-yellow-400 mb-4">★★★★★</div>
                  <p class="text-slate-300 mb-6 italic">"কম দামে এত ভালো জিনিস পাবো আশা করিনি। বেস্ট ডিল!"</p>
                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">J</div>
                     <div><div class="font-bold text-white">Jamil Ahmed</div><div class="text-xs text-slate-500">Sylhet</div></div>
                  </div>
               </div>
               <!-- Duplicate for loop effect -->
               <div class="w-80 p-6 bg-slate-800 rounded-xl border border-slate-700 flex-shrink-0">
                  <div class="flex text-yellow-400 mb-4">★★★★★</div>
                  <p class="text-slate-300 mb-6 italic">"প্রোডাক্ট টি হাতে পেয়ে আমি খুবই খুশি। ছবিতে যেমন দেখেছি বাস্তবে ঠিক তেমনই।"</p>
                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">R</div>
                     <div><div class="font-bold text-white">Rakib Hasan</div><div class="text-xs text-slate-500">Dhaka</div></div>
                  </div>
               </div>
            </div>
         </div>
         <style>
           @keyframes scroll {
             from { transform: translateX(0); }
             to { transform: translateX(-50%); }
           }
         </style>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><path d="M12 4v16M4 12h16"/><path d="M18 12l-4-4m4 4l-4 4"/></svg>',
  });

  // 9. FAQ Accordion
  Blocks.add('bd-faq', {
    label: 'FAQ Section',
    category: 'BD Landing',
    content: `
      <section class="py-12 bg-gray-50 px-4">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">সচরাচর জিজ্ঞাসিত প্রশ্ন</h2>
          <div class="space-y-4">
             <details class="group bg-white rounded-2xl shadow-sm border border-gray-200">
                <summary class="flex items-center justify-between p-5 font-bold text-lg cursor-pointer list-none">
                   <span>ডেলিভারি চার্জ কত?</span>
                   <span class="transition group-open:rotate-180">
                      <svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9"/></svg>
                   </span>
                </summary>
                <div class="text-gray-600 px-5 pb-5 leading-relaxed">
                   ঢাকার ভিতরে ৭০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা।
                </div>
             </details>
             <details class="group bg-white rounded-2xl shadow-sm border border-gray-200">
                <summary class="flex items-center justify-between p-5 font-bold text-lg cursor-pointer list-none">
                   <span>পণ্যটি কি আসল?</span>
                   <span class="transition group-open:rotate-180">
                      <svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9"/></svg>
                   </span>
                </summary>
                <div class="text-gray-600 px-5 pb-5 leading-relaxed">
                   জি, আমরা ১০০% অরিজিনাল পণ্যের গ্যারান্টি দিচ্ছি।
                </div>
             </details>
             <details class="group bg-white rounded-2xl shadow-sm border border-gray-200">
                <summary class="flex items-center justify-between p-5 font-bold text-lg cursor-pointer list-none">
                   <span>রিটার্ন পলিসি কি?</span>
                   <span class="transition group-open:rotate-180">
                      <svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9"/></svg>
                   </span>
                </summary>
                <div class="text-gray-600 px-5 pb-5 leading-relaxed">
                   পণ্য হাতে পাওয়ার পর যদি কোনো সমস্যা থাকে তবে সাথে সাথে রিটার্ন করতে পারবেন।
                </div>
             </details>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-gray-600" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  });

  // 10. Testimonials (Review)
  Blocks.add('bd-testimonials', {
    label: 'Customer Reviews',
    category: 'High Conversion',
    content: `
      <section class="py-12 bg-white px-4">
        <div class="max-w-6xl mx-auto">
           <h2 class="text-3xl font-bold text-center text-gray-900 mb-10">আমাদের গ্রাহকরা যা বলছেন</h2>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm relative">
                 <div class="text-yellow-400 text-2xl mb-3">★★★★★</div>
                 <p class="text-gray-600 font-medium italic mb-6">"প্রোডাক্টটি খুবই ভালো। ডেলিভারি খুব ফাস্ট পেয়েছি। সেলারের ব্যবহারও চমৎকার।"</p>
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-primary">R</div>
                    <div>
                       <h4 class="font-bold text-gray-900 text-sm">রহিম মিয়া</h4>
                       <p class="text-xs text-gray-500">ঢাকা</p>
                    </div>
                 </div>
              </div>
              <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm relative">
                 <div class="text-yellow-400 text-2xl mb-3">★★★★★</div>
                 <p class="text-gray-600 font-medium italic mb-6">"অরিজিনাল প্রোডাক্ট পেয়েছি। ধন্যবাদ!"</p>
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-secondary">S</div>
                    <div>
                       <h4 class="font-bold text-gray-900 text-sm">সোহেল রানা</h4>
                       <p class="text-xs text-gray-500">চট্টগ্রাম</p>
                    </div>
                 </div>
              </div>
              <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm relative">
                 <div class="text-yellow-400 text-2xl mb-3">★★★★★</div>
                 <p class="text-gray-600 font-medium italic mb-6">"দাম অনুযায়ী মান বেশ ভালো। আমি সন্তুষ্ট।"</p>
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">T</div>
                    <div>
                       <h4 class="font-bold text-gray-900 text-sm">তানিয়া আক্তার</h4>
                       <p class="text-xs text-gray-500">সিলেট</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-yellow-500" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  });

  // 11. Comparison (Before/After)
  Blocks.add('bd-comparison', {
    label: 'Comparison Table',
    category: 'High Conversion',
    content: `
      <section class="py-12 bg-white px-4">
        <div class="max-w-4xl mx-auto">
           <h2 class="text-3xl font-bold text-center text-gray-900 mb-10">সাধারণ প্রোডাক্ট বনাম আমাদের প্রোডাক্ট</h2>
           <div class="grid grid-cols-2 gap-4 md:gap-8">
              <div class="bg-red-50 p-6 rounded-3xl border border-red-100 text-center opacity-70 grayscale-[0.5]">
                 <h3 class="text-xl font-bold text-red-600 mb-4">সাধারণ বাজারজাত পণ্য</h3>
                 <ul class="space-y-3 text-sm font-medium text-gray-600">
                    <li class="flex flex-col items-center gap-1">
                       <span class="text-2xl">❌</span>
                       <span>নিম্নমানের উপাদান</span>
                    </li>
                    <li class="flex flex-col items-center gap-1">
                       <span class="text-2xl">❌</span>
                       <span>কোনো গ্যারান্টি নেই</span>
                    </li>
                    <li class="flex flex-col items-center gap-1">
                       <span class="text-2xl">❌</span>
                       <span>অল্প দিনে নষ্ট হয়</span>
                    </li>
                 </ul>
              </div>
              <div class="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-200 text-center relative shadow-lg transform scale-105">
                 <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">BEST CHOICE</div>
                 <h3 class="text-xl font-bold text-primary mb-4">আমাদের প্রিমিয়াম পণ্য</h3>
                 <ul class="space-y-3 text-sm font-bold text-gray-800">
                    <li class="flex flex-col items-center gap-1">
                       <span class="text-2xl">✅</span>
                       <span>উন্নতমানের উপাদান</span>
                    </li>
                    <li class="flex flex-col items-center gap-1">
                       <span class="text-2xl">✅</span>
                       <span>১০০% কালার গ্যারান্টি</span>
                    </li>
                    <li class="flex flex-col items-center gap-1">
                       <span class="text-2xl">✅</span>
                       <span>দীর্ঘস্থায়ী ও টেকসই</span>
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-gray-600" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
  });
  // 12. Gallery Section
  Blocks.add('bd-gallery', {
    label: 'Image Gallery',
    category: 'BD Landing',
    content: `
      <section class="py-12 bg-white px-4">
        <div class="max-w-6xl mx-auto">
           <h2 class="text-3xl font-bold text-center text-gray-900 mb-10">প্রোডাক্ট গ্যালারি</h2>
           <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" class="rounded-xl shadow-sm hover:scale-105 transition duration-300 w-full h-48 object-cover cursor-pointer" />
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" class="rounded-xl shadow-sm hover:scale-105 transition duration-300 w-full h-48 object-cover cursor-pointer" />
              <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80" class="rounded-xl shadow-sm hover:scale-105 transition duration-300 w-full h-48 object-cover cursor-pointer" />
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" class="rounded-xl shadow-sm hover:scale-105 transition duration-300 w-full h-48 object-cover cursor-pointer" />
           </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-purple-500" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  });

  // 13. Social Proof (Order Count)
  Blocks.add('bd-social-proof', {
    label: 'Social Proof',
    category: 'High Conversion',
    content: `
      <div class="bg-indigo-900 text-white py-4 px-6 text-center animate-pulse">
         <p class="text-lg font-bold flex items-center justify-center gap-2">
            <span class="bg-white text-indigo-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">🔥</span>
            গত ২৪ ঘন্টায় <span class="text-yellow-400 font-black text-2xl mx-1">১২৫</span> জন এই পণ্যটি অর্ডার করেছেন!
         </p>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-indigo-500" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  });

  // 14. Delivery Info
  Blocks.add('bd-delivery-info', {
    label: 'Delivery Info',
    category: 'BD Landing',
    content: `
      <section class="py-8 bg-blue-50 border-y border-blue-100">
         <div class="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12">
            <div class="flex items-center gap-4">
               <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🏍️</div>
               <div>
                  <h4 class="font-bold text-gray-900">ঢাকার ভিতরে</h4>
                  <p class="text-blue-700 font-bold">৭০ টাকা (২৪-৪৮ ঘন্টা)</p>
               </div>
            </div>
            <div class="hidden md:block w-px h-12 bg-blue-200"></div>
            <div class="flex items-center gap-4">
               <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🚛</div>
               <div>
                  <h4 class="font-bold text-gray-900">ঢাকার বাইরে</h4>
                  <p class="text-blue-700 font-bold">১৩০ টাকা (২-৩ দিন)</p>
               </div>
            </div>
         </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-blue-500" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  });

  // 15. Guarantee Section
  Blocks.add('bd-guarantee', {
    label: 'Guarantee Box',
    category: 'High Conversion',
    content: `
      <div class="max-w-3xl mx-auto my-10 p-1 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
         <div class="bg-white rounded-xl p-8 text-center">
            <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🛡️</div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">১০০% মানি ব্যাক গ্যারান্টি</h3>
            <p class="text-gray-600 leading-relaxed">
               আমরা পণ্যের মানের ব্যাপারে আপোষ করি না। পন্য হাতে পাওয়ার পর যদি মনে হয় এটি আপনার জন্য নয়, তবে আমরা কোনো প্রশ্ন ছাড়াই টাকা ফেরত দেব। আপনার সন্তুষ্টিই আমাদের কাম্য।
            </p>
         </div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-orange-500" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  });

  // 16. Why Buy (Pain vs Solution)
  Blocks.add('bd-why-buy', {
    label: 'Why Buy (Problems)',
    category: 'BD Landing',
    content: `
      <section class="py-12 bg-white px-4">
        <div class="max-w-5xl mx-auto">
           <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">কেন এখনই অর্ডার করবেন?</h2>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-red-50 p-8 rounded-3xl border border-red-100">
                 <h3 class="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
                    <span class="bg-red-200 p-1 rounded">🚫</span> সমস্যাগুলো (আপনাদের যা হয়)
                 </h3>
                 <ul class="space-y-4">
                    <li class="flex gap-3 text-gray-700">
                       <span class="text-red-500 font-bold">✖</span>
                       বাজারের নিম্নমানের পণ্যে ঠকে যাওয়া
                    </li>
                    <li class="flex gap-3 text-gray-700">
                       <span class="text-red-500 font-bold">✖</span>
                       অতিরিক্ত দামে পণ্য কেনা
                    </li>
                    <li class="flex gap-3 text-gray-700">
                       <span class="text-red-500 font-bold">✖</span>
                       কোনো ওয়ারেন্টি বা গ্যারান্টি না পাওয়া
                    </li>
                 </ul>
              </div>
              <div class="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 shadow-xl transform md:-translate-y-4">
                 <h3 class="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <span class="bg-emerald-200 p-1 rounded">✅</span> আমাদের সমাধান
                 </h3>
                 <ul class="space-y-4">
                    <li class="flex gap-3 text-gray-800 font-medium">
                       <span class="text-primary font-bold">✔</span>
                       ১০০% প্রিমিয়াম কোয়ালিটি নিশ্চিত করি
                    </li>
                    <li class="flex gap-3 text-gray-800 font-medium">
                       <span class="text-primary font-bold">✔</span>
                       সরাসরি ইম্পোর্টার থেকে কম দামে কেনা
                    </li>
                    <li class="flex gap-3 text-gray-800 font-medium">
                       <span class="text-primary font-bold">✔</span>
                       ১ বছরের ফুল রিপ্লেসমেন্ট গ্যারান্টি
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-red-500" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  });

  // 17. Urgency Countdown Bar (Sticky/Legacy Style)
  Blocks.add('bd-urgency-timer', {
    label: 'Urgency Timer Bar',
    category: 'High Conversion',
    content: `
      <div class="sticky top-0 left-0 right-0 z-[60] bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 py-3 shadow-lg">
        <div class="max-w-4xl mx-auto px-4 flex items-center justify-center gap-4 text-white">
          <span class="text-xl animate-pulse">⚡</span>
          <span class="font-bold text-sm md:text-base uppercase tracking-wider">অফারটি শেষ হতে আর মাত্র:</span>
          <div class="flex items-center gap-2 font-mono font-black text-xl md:text-2xl">
            <div class="bg-black/20 px-2 rounded">02</div>
            <span class="animate-pulse">:</span>
            <div class="bg-black/20 px-2 rounded">45</div>
            <span class="animate-pulse">:</span>
            <div class="bg-black/20 px-2 rounded text-yellow-300">12</div>
          </div>
          <span class="text-xl animate-pulse">⚡</span>
        </div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-red-500" stroke-width="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
  });

  // 18. Glassmorphism Trust Badges
  Blocks.add('bd-trust-glass', {
    label: 'Trust Glassmorphism',
    category: 'BD Landing',
    content: `
      <section class="py-12 bg-gray-50/50">
        <div class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl shadow-gray-200/50 text-center flex flex-col items-center gap-3 transform hover:-translate-y-2 transition duration-500">
            <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 class="font-black text-gray-900 leading-tight">দ্রুত ডেলিভারি</h3>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">সারা বাংলাদেশে</p>
          </div>
          <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl shadow-gray-200/50 text-center flex flex-col items-center gap-3 transform hover:-translate-y-2 transition duration-500">
            <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 class="font-black text-gray-900 leading-tight">ক্যাশ অন ডেলিভারি</h3>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">হাতে পেয়ে পেমেন্ট</p>
          </div>
          <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl shadow-gray-200/50 text-center flex flex-col items-center gap-3 transform hover:-translate-y-2 transition duration-500">
            <div class="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 class="font-black text-gray-900 leading-tight">১০০% গ্যারান্টি</h3>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">অরিজিনাল প্রোডাক্ট</p>
          </div>
          <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl shadow-gray-200/50 text-center flex flex-col items-center gap-3 transform hover:-translate-y-2 transition duration-500">
            <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
            <h3 class="font-black text-gray-900 leading-tight">সহজ রিটার্ন</h3>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">৭ দিনের পলিসি</p>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-indigo-500" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="3"/></svg>',
  });

  // 19. Premium Order Form (2-Column Legacy)
  Blocks.add('bd-order-form-premium', {
    label: 'Order Form Premium',
    category: 'High Conversion',
    content: `
      <section id="order" class="py-16 bg-emerald-50/50 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-10">
            <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-4">অর্ডার কনফার্ম করুন</h2>
            <p class="text-xl text-gray-600 font-medium">নিচের ফর্মটি পূরণ করুন, আমরা আপনাকে কল করবো</p>
          </div>

          <div class="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-emerald-200/50 border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <!-- Product Info Summary -->
            <div class="space-y-8">
              <div class="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 relative overflow-hidden">
                <div class="flex items-center gap-6">
                  <div class="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-md flex-shrink-0 p-1">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80" class="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <h4 class="text-xl font-black text-gray-900 mb-2">প্রিমিয়াম কোয়ালিটি পণ্য</h4>
                    <div class="flex items-center gap-3">
                      <span class="text-emerald-600 font-black text-3xl">৳৯৫০</span>
                      <span class="text-gray-400 line-through text-lg">৳১,৯৫০</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="space-y-4">
                <h5 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                   <span class="w-2 h-8 bg-emerald-500 rounded-full"></span>
                   কেন আপনি আমাদের পণ্যটি কিনবেন?
                </h5>
                <ul class="space-y-3">
                  <li class="flex items-start gap-3 font-medium text-gray-700">
                    <span class="text-emerald-500 text-xl font-bold">✓</span>
                    ১০০% অরিজিনাল কালার গ্যারান্টি।
                  </li>
                  <li class="flex items-start gap-3 font-medium text-gray-700">
                    <span class="text-emerald-500 text-xl font-bold">✓</span>
                    প্রিমিয়াম মেটেরিয়াল দিয়ে তৈরী।
                  </li>
                  <li class="flex items-start gap-3 font-medium text-gray-700">
                    <span class="text-emerald-500 text-xl font-bold">✓</span>
                    ৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি।
                  </li>
                </ul>
              </div>

              <div class="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4 animate-pulse">
                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🔥</div>
                <p class="text-blue-900 font-bold">গত ২৪ ঘণ্টায় ১২৫ জন নতুন গ্রাহক অর্ডার করেছেন!</p>
              </div>
            </div>

            <!-- Form -->
            <form action="/api/create-order" method="POST" class="space-y-6">
              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-500 uppercase tracking-widest px-1">আপনার নাম</label>
                <input type="text" name="customer_name" placeholder="নাম লিখুন" class="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition" required />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-500 uppercase tracking-widest px-1">মোবাইল নাম্বার</label>
                <input type="tel" name="phone" placeholder="017XXXXXXXX" class="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition" required />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-500 uppercase tracking-widest px-1">সম্পূর্ণ ঠিকানা</label>
                <textarea name="address" placeholder="বাসা নং, রোড, থানা, জেলা লিখুন" class="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none h-32 transition resize-none" required></textarea>
              </div>
              
              <div class="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-300 space-y-3">
                <div class="flex justify-between items-center text-gray-600 font-medium">
                  <span>পণ্যের মূল্য:</span>
                  <span class="font-bold text-gray-900 text-xl">৳৯৫০</span>
                </div>
                <div class="flex justify-between items-center text-emerald-600 font-medium">
                  <span>ডেলিভারি চার্জ:</span>
                  <span class="font-bold text-lg">ফ্রি</span>
                </div>
                <div class="pt-3 border-t border-gray-200 flex justify-between items-center text-gray-900">
                  <span class="text-xl font-black">সর্বমোট মূল্য:</span>
                  <span class="text-3xl font-black text-emerald-600">৳৯৫০</span>
                </div>
              </div>

              <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-2xl py-6 rounded-3xl shadow-2xl shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-95 transition-all">অর্ডার কনফার্ম করুন</button>
            </form>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-emerald-600" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
  });

  // 20. Advanced Comparison (Problem/Solution)
  Blocks.add('bd-comparison-advanced', {
    label: 'Rich Comparison',
    category: 'High Conversion',
    content: `
      <section class="py-16 bg-white px-4">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-4">পার্থক্যটি নিজেই দেখুন</h2>
            <div class="w-24 h-2 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div class="bg-red-50/50 p-8 rounded-[3rem] border border-red-100 relative grayscale-[0.5] opacity-80">
              <div class="absolute -top-4 left-8 bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg">সাধারণ বাজারজাত পণ্য</div>
              <div class="aspect-video bg-gray-200 rounded-3xl mb-8 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=50" class="w-full h-full object-cover" />
              </div>
              <ul class="space-y-4 font-bold text-gray-500">
                <li class="flex items-center gap-3"><span class="text-red-500 text-2xl">❌</span> নিম্নমানের পাতলা ফেব্রিক</li>
                <li class="flex items-center gap-3"><span class="text-red-500 text-2xl">❌</span> ধোয়ার পর রং নষ্ট হয়ে যায়</li>
                <li class="flex items-center gap-3"><span class="text-red-500 text-2xl">❌</span> কোনো গ্যারান্টি বা ওয়ারেন্টি নেই</li>
                <li class="flex items-center gap-3"><span class="text-red-500 text-2xl">❌</span> সাইজ ছোট-বড় হওয়ার ভয় থাকে</li>
              </ul>
            </div>
            
            <div class="bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-200 relative shadow-2xl shadow-emerald-200/50 transform md:scale-105">
              <div class="absolute -top-4 left-8 bg-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">আমাদের প্রিমিয়াম পণ্য</div>
              <div class="aspect-video bg-white rounded-3xl mb-8 overflow-hidden shadow-inner">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" class="w-full h-full object-cover" />
              </div>
              <ul class="space-y-4 font-black text-gray-800">
                <li class="flex items-center gap-3"><span class="text-emerald-500 text-2xl">✅</span> ১০০% প্রিমিয়াম কটন ফেব্রিক</li>
                <li class="flex items-center gap-3"><span class="text-emerald-500 text-2xl">✅</span> গ্যারান্টিড কালার ও টেকসই বুনন</li>
                <li class="flex items-center gap-3"><span class="text-emerald-500 text-2xl">✅</span> ৭ দিনের মানি ব্যাক গ্যারান্টি</li>
                <li class="flex items-center gap-3"><span class="text-emerald-500 text-2xl">✅</span> সঠিক এবং স্ট্যান্ডার্ড সাইজিং</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-emerald-500" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  });

  // 21. Benefits Rich Grid
  Blocks.add('bd-benefits-grid-rich', {
    label: 'Benefits Grid Rich',
    category: 'BD Landing',
    content: `
      <section class="py-16 bg-white px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-center text-3xl md:text-4xl font-black mb-12">কেন অর্ডার করবেন?</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            <div class="group bg-gradient-to-br from-emerald-50 to-white p-8 rounded-[2.5rem] border border-emerald-100 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-500 text-center">
              <div class="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-emerald-100 flex items-center justify-center text-4xl mx-auto mb-6 transform group-hover:rotate-12 transition">🛡️</div>
              <h4 class="text-xl font-black text-gray-900 mb-4">মানি ব্যাক গ্যারান্টি</h4>
              <p class="text-gray-600 font-medium leading-relaxed">পণ্য হাতে পেয়ে কোনো সমস্যা থাকলে আমাদের বলুন, ১০০% রিটার্ন গ্যারান্টি।</p>
            </div>
            <div class="group bg-gradient-to-br from-blue-50 to-white p-8 rounded-[2.5rem] border border-blue-100 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 text-center">
              <div class="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-center text-4xl mx-auto mb-6 transform group-hover:rotate-12 transition">🛵</div>
              <h4 class="text-xl font-black text-gray-900 mb-4">দ্রুত হোম ডেলিভারি</h4>
              <p class="text-gray-600 font-medium leading-relaxed">ঢাকার ভিতরে ২৪ ঘণ্টা এবং সারা বাংলাদেশে মাত্র ২-৩ দিনের ডেলিভারি।</p>
            </div>
            <div class="group bg-gradient-to-br from-amber-50 to-white p-8 rounded-[2.5rem] border border-amber-100 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 text-center">
              <div class="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-amber-100 flex items-center justify-center text-4xl mx-auto mb-6 transform group-hover:rotate-12 transition">💎</div>
              <h4 class="text-xl font-black text-gray-900 mb-4">প্রিমিয়াম কোয়ালিটি</h4>
              <p class="text-gray-600 font-medium leading-relaxed">আমরা দিচ্ছি সরাসরি ইম্পোর্টেড হাই কোয়ালিটি পণ্য যা আপনি নিশ্চিত থাকতে পারেন।</p>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-emerald-500" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  });

  // ========================================
  // BASIC BUILDING BLOCKS (Elementor-style)
  // ========================================

  // Section Container
  Blocks.add('basic-section', {
    label: 'Section',
    category: 'Basic',
    content: `
      <section class="py-12 px-4 bg-white">
        <div class="max-w-6xl mx-auto">
          <!-- Add your content here -->
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>',
  });

  // Container/Div
  Blocks.add('basic-container', {
    label: 'Container',
    category: 'Basic',
    content: `
      <div class="p-6 bg-gray-50 rounded-xl">
        <!-- Container content -->
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 2"/></svg>',
  });

  // Flex Row
  Blocks.add('basic-flex-row', {
    label: 'Flex Row',
    category: 'Basic',
    content: `
      <div class="flex gap-4 p-4">
        <div class="flex-1 p-4 bg-gray-100 rounded-lg text-center">Column 1</div>
        <div class="flex-1 p-4 bg-gray-100 rounded-lg text-center">Column 2</div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="9" height="12" rx="1"/><rect x="13" y="6" width="9" height="12" rx="1"/></svg>',
  });

  // Grid Layout
  Blocks.add('basic-grid', {
    label: 'Grid 3x1',
    category: 'Basic',
    content: `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <div class="p-6 bg-gray-100 rounded-xl text-center">Item 1</div>
        <div class="p-6 bg-gray-100 rounded-xl text-center">Item 2</div>
        <div class="p-6 bg-gray-100 rounded-xl text-center">Item 3</div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="6" height="16" rx="1"/><rect x="9" y="4" width="6" height="16" rx="1"/><rect x="16" y="4" width="6" height="16" rx="1"/></svg>',
  });

  // Heading
  Blocks.add('basic-heading', {
    label: 'Heading',
    category: 'Basic',
    content: `<h2 class="text-3xl font-bold text-gray-900 mb-4">Your Heading Here</h2>`,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h12M4 18h8"/></svg>',
  });

  // Paragraph
  Blocks.add('basic-paragraph', {
    label: 'Paragraph',
    category: 'Basic',
    content: `<p class="text-lg text-gray-600 leading-relaxed">এখানে আপনার টেক্সট লিখুন। এটি একটি প্যারাগ্রাফ ব্লক যা আপনি যেকোনো জায়গায় ব্যবহার করতে পারবেন।</p>`,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 10h16M4 14h12M4 18h8"/></svg>',
  });

  // Button
  Blocks.add('basic-button', {
    label: 'Button',
    category: 'Basic',
    content: `<button class="bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:opacity-90 transition">Click Here</button>`,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M8 12h8"/></svg>',
  });

  // Image
  Blocks.add('basic-image', {
    label: 'Image',
    category: 'Basic',
    content: `<img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" alt="Image" class="w-full h-auto rounded-xl shadow-lg" />`,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  });

  // Icon Box
  Blocks.add('basic-icon-box', {
    label: 'Icon Box',
    category: 'Basic',
    content: `
      <div class="flex flex-col items-center text-center p-6">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-4">🚀</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Feature Title</h3>
        <p class="text-gray-600">Short description about this feature goes here.</p>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20h16M8 16h8"/></svg>',
  });

  // Custom HTML Block
  Blocks.add('basic-html', {
    label: 'Custom HTML',
    category: 'Basic',
    content: `
      <div class="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        <p class="text-center text-gray-500 text-sm">
          <!-- Paste your custom HTML here -->
          Custom HTML Block - Edit in code view
        </p>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
  });

  // Spacer
  Blocks.add('basic-spacer', {
    label: 'Spacer',
    category: 'Basic',
    content: `<div class="h-16" aria-hidden="true"></div>`,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><path d="M12 4v16M4 12h16" stroke-dasharray="2 2"/></svg>',
  });

  // Divider
  Blocks.add('basic-divider', {
    label: 'Divider',
    category: 'Basic',
    content: `<hr class="my-8 border-t border-gray-200" />`,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="2"><path d="M4 12h16"/></svg>',
  });

  // Card
  Blocks.add('basic-card', {
    label: 'Card',
    category: 'Basic',
    content: `
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" alt="Card image" class="w-full h-48 object-cover" />
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Card Title</h3>
          <p class="text-gray-600 mb-4">Card description goes here. You can customize this card.</p>
          <button class="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:opacity-90 transition">Learn More</button>
        </div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>',
  });

  // Testimonial Card
  Blocks.add('basic-testimonial', {
    label: 'Testimonial',
    category: 'Basic',
    content: `
      <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div class="text-yellow-400 text-xl mb-3">★★★★★</div>
        <p class="text-gray-700 italic mb-4">"এই প্রোডাক্টটি অসাধারণ! আমি খুবই সন্তুষ্ট।"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">R</div>
          <div>
            <h4 class="font-bold text-gray-900">রহিম আহমেদ</h4>
            <p class="text-sm text-gray-500">ঢাকা</p>
          </div>
        </div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-yellow-500" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  });

  // Price Box
  Blocks.add('basic-price', {
    label: 'Price Box',
    category: 'Basic',
    content: `
      <div class="bg-white p-6 rounded-2xl border-2 border-primary shadow-xl text-center">
        <div class="text-sm text-gray-500 line-through mb-1">৳ ২,৯৯০</div>
        <div class="text-4xl font-black text-primary mb-2">৳ ১,৯৯০</div>
        <div class="text-sm text-emerald-600 font-bold">৩৩% ছাড়!</div>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-emerald-500" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  });

  // CTA Banner
  Blocks.add('basic-cta', {
    label: 'CTA Banner',
    category: 'Basic',
    content: `
      <div class="bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-center text-white">
        <h2 class="text-2xl font-bold mb-3">এখনই অর্ডার করুন!</h2>
        <p class="text-white/80 mb-6">সীমিত সময়ের অফার। মিস করবেন না!</p>
        <a href="#order" class="inline-block bg-white text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-gray-100 transition">অর্ডার করুন</a>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-indigo-500" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 10v4M10 12h4"/></svg>',
  });
  // 17. Simple Footer
  Blocks.add('bd-footer-simple', {
    label: 'Simple Footer',
    category: 'Basic',
    content: `
      <footer class="bg-white border-t border-gray-100 py-12 px-4">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div class="text-center md:text-left">
              <div class="font-black text-xl text-gray-900 mb-2">YOUR STORE</div>
              <p class="text-gray-500 text-sm">© 2024 All rights reserved.</p>
           </div>
           
           <div class="flex gap-4">
              <a href="#" class="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition">f</a>
              <a href="#" class="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition">i</a>
              <a href="#" class="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition">y</a>
           </div>
           
           <div class="flex gap-6 text-sm font-medium text-gray-600">
              <a href="#" class="hover:text-primary">Terms</a>
              <a href="#" class="hover:text-primary">Privacy</a>
              <a href="#" class="hover:text-primary">Refund Policy</a>
           </div>
        </div>
      </footer>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" stroke="currentColor" stroke-width="1.5"><rect x="2" y="16" width="20" height="6" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/></svg>',
  });
};

