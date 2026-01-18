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
          <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight product-name">আপনার পণ্যের আকর্ষণীয় হেডলাইন এখানে লিখুন</h1>
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
                আপনার স্টাইলের নতুন <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 product-name">সংজ্ঞা</span>
              </h1>
              <p class="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                সেরা মানের মেটেরিয়াল এবং আধুনিক ডিজাইনের সংমিশ্রণ। আজই অর্ডার করুন এবং উপভোগ করুন বিশেষ ছাড়।
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#order" class="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition transform hover:-translate-y-1 shadow-lg">
                  এখনই কিনুন
                </a>
                <a href="https://wa.me/8801XXXXXXXXX" class="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-100 font-bold rounded-xl hover:bg-emerald-50 transition flex items-center justify-center gap-2 whatsapp-link shadow-sm">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  ওয়াটসঅ্যাপ করুন
                </a>
              </div>
            </div>
            <div class="order-1 md:order-2 relative">
              <div class="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop" alt="Product" class="relative w-full h-auto rounded-3xl shadow-2xl transform hover:scale-[1.02] transition duration-500" />
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
               অর্ডার করুন - <span class="product-price">১২৫০৳</span>
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
                 <span class="text-primary product-price">৳ ১৯৫০</span>
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
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" alt="Product" class="w-full rounded-2xl shadow-lg border border-gray-100 product-image" />
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
            গত ২৪ ঘন্টায় <span class="text-yellow-400 font-black text-2xl mx-1 social-proof-count">১২৫</span> জন এই পণ্যটি অর্ডার করেছেন!
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
          <div class="flex items-center gap-2 font-mono font-black text-xl md:text-2xl" data-gjs-type="countdown">
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
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80" class="w-full h-full object-cover rounded-xl product-image" />
                  </div>
                  <div>
                    <h4 class="text-xl font-black text-gray-900 mb-2">প্রিমিয়াম কোয়ালিটি পণ্য</h4>
                    <div class="flex items-center gap-3">
                      <span class="text-emerald-600 font-black text-3xl product-price">৳৯৫০</span>
                      <span class="text-gray-400 line-through text-lg product-compare-price">৳১,৯৫০</span>
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
                   <span>পণ্যের নাম:</span>
                   <span class="font-bold text-gray-900 text-xl product-name">প্রিমিয়াম পণ্য</span>
                </div>
                <div class="flex justify-between items-center text-emerald-600 font-medium">
                  <span>ডেলিভারি চার্জ:</span>
                  <span class="font-bold text-lg">ফ্রি</span>
                </div>
                <div class="pt-3 border-t border-gray-200 flex justify-between items-center text-gray-900">
                  <span class="text-xl font-black">সর্বমোট মূল্য:</span>
                  <span class="text-3xl font-black text-emerald-600 product-price">৳৯৫০</span>
                </div>
              </div>

              <div class="flex flex-col gap-4">
                <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-2xl py-6 rounded-3xl shadow-2xl shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-95 transition-all">অর্ডার কনফার্ম করুন</button>
                <a href="https://wa.me/8801XXXXXXXXX" class="w-full bg-white text-emerald-600 border-2 border-emerald-100 font-bold py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition whatsapp-link">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  সরাসরি কথা বলুন
                </a>
              </div>
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
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-green-400" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 8v8m-4-4h8" /></svg>',
  });

  // 22. Gadget Neon Showcase (Cyberpunk)
  Blocks.add('gadget-neon-showcase', {
    label: 'Neon Showcase',
    category: 'World Class UI',
    content: `
      <section class="py-20 bg-black overflow-hidden relative">
         <!-- Neon Background Elements -->
         <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent opacity-50"></div>
         <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent box-shadow-[0_0_20px_#ec4899]"></div>
         
         <div class="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div class="w-full md:w-1/2">
               <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <img src="https://images.unsplash.com/photo-1592842232655-e5d3451ea1cd?w=800&q=80" alt="Cyber Gadget" class="relative w-full rounded-3xl border border-white/10 shadow-2xl z-10" />
                  
                  <!-- Floating specs -->
                  <div class="absolute -right-4 top-10 bg-black/80 backdrop-blur-md border border-pink-500/50 p-4 rounded-xl z-20 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse">
                     <div class="text-pink-400 font-bold text-xs uppercase tracking-widest">Processor</div>
                     <div class="text-white font-black text-xl">M2 Ultra</div>
                  </div>
               </div>
            </div>
            
            <div class="w-full md:w-1/2 text-left">
               <h2 class="text-5xl md:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter" style="font-family: 'Orbitron', sans-serif;">
                  Level <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-400">Up.</span>
               </h2>
               <p class="text-slate-400 text-lg mb-8 border-l-4 border-pink-500 pl-6">
                  Dominate the competition with hardware forged for victory. Ultra-responsive inputs and zero-latency transmission.
               </p>
               
               <div class="grid grid-cols-2 gap-4 mb-10">
                  <div class="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition">
                     <div class="text-yellow-400 font-bold text-2xl mb-1">1ms</div>
                     <div class="text-slate-500 text-xs uppercase">Response Time</div>
                  </div>
                  <div class="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition">
                     <div class="text-pink-400 font-bold text-2xl mb-1">RGB</div>
                     <div class="text-slate-500 text-xs uppercase">Chroma Sync</div>
                  </div>
               </div>
               
               <a href="#order" class="inline-block w-full text-center py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-none border border-white/20 hover:border-white/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition clip-path-polygon">
                  Deploy System
               </a>
            </div>
         </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-pink-500" stroke-width="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>',
  });

  // 23. Luxe Elegant Hero (Minimalist)
  Blocks.add('luxe-elegant-hero', {
    label: 'Elegant Hero',
    category: 'World Class UI',
    content: `
      <section class="py-20 bg-[#faf9f6] text-[#1a1a1a]">
         <div class="max-w-7xl mx-auto px-6">
            <div class="flex flex-col md:flex-row items-stretch min-h-[600px]">
               <!-- Text Content -->
               <div class="w-full md:w-5/12 flex flex-col justify-center pr-0 md:pr-12 mb-10 md:mb-0">
                  <div class="w-16 h-px bg-[#1a1a1a] mb-8"></div>
                  <h1 class="text-5xl md:text-7xl font-serif leading-tight mb-8">
                     Timeless <br/> 
                     <span class="italic text-[#8b8b8b]">Elegance</span>
                  </h1>
                  <p class="text-lg text-[#555] leading-relaxed mb-12 font-light">
                     Discover the new collection defined by subtle hues and impeccable craftsmanship. Defining modern luxury for the discerning individual.
                  </p>
                  <a href="#collection" class="group flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] hover:opacity-70 transition">
                     View Collection
                     <span class="w-12 h-px bg-[#1a1a1a] group-hover:w-20 transition-all duration-300"></span>
                  </a>
               </div>
               
               <!-- Image Grid -->
               <div class="w-full md:w-7/12 grid grid-cols-2 gap-4">
                  <div class="mt-12">
                     <img src="https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&q=80" class="w-full h-full object-cover rounded-tl-[4rem] shadow-sm transform hover:translate-y-2 transition duration-700" />
                  </div>
                  <div class="-mb-12">
                     <img src="https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=600&q=80" class="w-full h-full object-cover rounded-br-[4rem] shadow-sm transform hover:-translate-y-2 transition duration-700" />
                  </div>
               </div>
            </div>
         </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-slate-800" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
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
  // 19. Premium Hero (Glassmorphism)
  Blocks.add('bd-premium-hero', {
    label: 'Premium Hero',
    category: 'Premium Designs',
    content: `
      <section class="relative py-20 md:py-32 px-6 overflow-hidden bg-slate-950 text-white">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-xs font-bold tracking-widest uppercase text-emerald-400">Limited Collection Available</span>
            </div>
            <h1 class="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              স্মার্ট জীবনের জন্য <span class="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">স্মার্ট চয়েস</span>
            </h1>
            <p class="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
              সেরা কোয়ালিটি এবং আধুনিক ফিচারের সমন্বয়ে তৈরি আমাদের এই প্রোডাক্টটি আপনার দৈনন্দিন কাজকে করবে আরও সহজ এবং আরামদায়ক।
            </p>
            <div class="flex flex-wrap gap-5">
              <a href="#order" class="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300">
                অর্ডার দিন এখনই
              </a>
              <a href="#features" class="px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                ফিচারগুলো দেখুন
              </a>
            </div>
          </div>
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 blur-[100px] -z-10 animate-pulse"></div>
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200" alt="Premium Product" class="w-full h-auto rounded-[2.5rem] shadow-2xl border border-white/10" />
            <div class="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-2xl hidden md:block">
               <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <div class="text-sm font-black text-white">#1 Choice in 2024</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer Satisfaction</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-indigo-400" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  });

  // 20. Modern Icon Grid
  Blocks.add('bd-modern-grid', {
    label: 'Modern Features',
    category: 'Premium Designs',
    content: `
      <section class="py-24 bg-white px-6">
        <div class="max-w-7xl mx-auto">
          <div class="text-center max-w-3xl mx-auto mb-20">
            <h2 class="text-4xl md:text-5xl font-black text-slate-900 mb-6">বিশেষ কেন এই পন্যটি?</h2>
            <div class="w-20 h-2 bg-blue-600 mx-auto rounded-full mb-8"></div>
            <p class="text-lg text-slate-500 font-medium">আমরা আমাদের পন্যের গুনগত মানের ক্ষেত্রে কোনো আপোষ করি না। এক নজরে দেখে নিন আমাদের বিশেষ ফিচারগুলো।</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <!-- Feature 1 -->
            <div class="group p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
              <div class="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">🛡️</div>
              <h3 class="text-2xl font-black text-slate-900 mb-4 tracking-tight">অরিজিনাল গ্যারান্টি</h3>
              <p class="text-slate-600 leading-relaxed font-medium">আমরা সরাসরি ইম্পোর্টার থেকে পন্য সংগ্রহ করি, তাই আপনি পাচ্ছেন ১০০% অরিজিনাল পন্যের নিশ্চয়তা।</p>
            </div>
            <!-- Feature 2 -->
            <div class="group p-10 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 hover:bg-white hover:border-white hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-500">
              <div class="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">🚀</div>
              <h3 class="text-2xl font-black text-slate-900 mb-4 tracking-tight">দ্রুততম ডেলিভারি</h3>
              <p class="text-slate-600 leading-relaxed font-medium">সারা বাংলাদেশে ২৪-৭২ ঘণ্টার মধ্যে হোম ডেলিভারি নিশ্চিত করি আমরা। কোনো অগ্রিম পেমেন্ট ছাড়াই।</p>
            </div>
            <!-- Feature 3 -->
            <div class="group p-10 rounded-[2.5rem] bg-purple-50 border border-purple-100 hover:bg-white hover:border-white hover:shadow-2xl hover:shadow-purple-200 transition-all duration-500">
              <div class="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-sm">🎧</div>
              <h3 class="text-2xl font-black text-slate-900 mb-4 tracking-tight">লাইফ টাইম সাপোর্ট</h3>
              <p class="text-slate-600 leading-relaxed font-medium">পন্য কেনার পরেও যেকোনো প্রয়োজনে আমাদের এক্সপার্ট টিম সবসময় আপনার পাশে থাকবে।</p>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-emerald-500" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  });

  // 21. Video Showcase
  Blocks.add('bd-video-showcase', {
    label: 'Modern Video',
    category: 'Premium Designs',
    content: `
      <section class="py-24 bg-slate-50 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="relative group rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white">
            <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000" alt="Video Cover" class="w-full aspect-video object-cover brightness-75 group-hover:scale-105 transition-all duration-1000" />
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-500 px-6 text-center">
              <button class="w-24 h-24 md:w-32 md:h-32 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 mb-8 overflow-hidden group/btn">
                 <svg class="w-10 h-10 md:w-16 md:h-16 fill-current relative z-10" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <h3 class="text-white text-3xl md:text-5xl font-black mb-4 drop-shadow-lg">আমাদের পন্যের গুনগতমান দেখুন</h3>
              <p class="text-white/80 text-lg font-bold max-w-xl drop-shadow-md">পন্যের আসল রূপ এবং ফিচারগুলো ভিডিওতে দেখে নিন</p>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-red-500" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>',
  });

  // 22. Professional Pricing
  Blocks.add('bd-pricing-modern', {
    label: 'Premium Pricing',
    category: 'Premium Designs',
    content: `
      <section class="py-24 bg-white px-6">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <!-- Normal Offer -->
            <div class="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200">
               <div class="flex items-center gap-4 mb-8">
                  <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">📦</div>
                  <div>
                    <h3 class="text-xl font-bold text-slate-900">একক প্যাকেজ</h3>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">Normal Delivery</p>
                  </div>
               </div>
               <div class="mb-8">
                  <div class="text-5xl font-black text-slate-900 mb-2">৳১২৫০</div>
                  <div class="text-slate-400 font-medium line-through">৳১৫০০</div>
               </div>
               <ul class="space-y-4 mb-10">
                  <li class="flex items-center gap-3 font-bold text-slate-700">
                    <span class="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px]">✓</span> 
                    ১ পিস মর্ডান পণ্য
                  </li>
                  <li class="flex items-center gap-3 font-bold text-slate-700">
                    <span class="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px]">✓</span> 
                    ৭ দিনের রিপ্লেসমেন্ট সুবিধা
                  </li>
                  <li class="flex items-center text-slate-300 font-medium">
                    <span class="w-6 h-6 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-[10px] mr-3 font-black">×</span> 
                    ফ্রি ডেলিভারি নেই
                  </li>
               </ul>
               <a href="#order" class="block w-full py-5 bg-slate-900 text-white text-center font-black rounded-2xl hover:bg-slate-800 transition shadow-xl">বেছে নিন এই অফার</a>
            </div>
            
            <!-- Best Offer -->
            <div class="p-1 right-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] shadow-2xl shadow-indigo-200 group transform hover:-translate-y-2 transition duration-500">
               <div class="bg-white p-10 rounded-[2.3rem] h-full relative overflow-hidden">
                  <div class="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl">BEST CHOICE</div>
                  <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎁</div>
                    <div>
                      <h3 class="text-xl font-bold text-indigo-900">ফ্যামিলি কম্বো প্যাকেজ</h3>
                      <p class="text-xs text-indigo-500 font-bold uppercase tracking-widest">Save Extra 500 Taka</p>
                    </div>
                  </div>
                  <div class="mb-8">
                    <div class="text-5xl font-black text-indigo-600 mb-2">৳২০০০</div>
                    <div class="text-slate-400 font-medium line-through">৳২৫০০</div>
                  </div>
                  <ul class="space-y-4 mb-10 relative z-10">
                    <li class="flex items-center gap-3 font-bold text-slate-700">
                      <span class="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px]">✓</span> 
                      ২ পিস প্রিমিয়াম পণ্য
                    </li>
                    <li class="flex items-center gap-3 font-bold text-slate-700">
                      <span class="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px]">✓</span> 
                      লাইফ টাইম সাপোর্ট সুবিধা
                    </li>
                    <li class="flex items-center gap-3 font-bold text-emerald-600">
                      <span class="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px]">✓</span> 
                      সারা বাংলাদেশে ফ্রি ডেলিভারি
                    </li>
                  </ul>
                  <a href="#order" class="block w-full py-5 bg-indigo-600 text-white text-center font-black rounded-2xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200">অর্ডার করুন এখনই</a>
                  <div class="absolute bottom-[-5%] right-[-5%] w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
               </div>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-blue-600" stroke-width="2"><path d="M12 2v20m-7-3l7-3 7 3m-14-10l7-3 7 3"/></svg>',
  });

  // 23. High Conversion Gradient CTA
  Blocks.add('bd-cta-gradient', {
    label: 'Modern CTA',
    category: 'High Conversion',
    content: `
      <section class="py-20 px-6">
        <div class="max-w-7xl mx-auto bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-300">
          <div class="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div class="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          
          <div class="relative z-10 max-w-3xl mx-auto">
            <h2 class="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight">আপনার ব্যবসা পরিবর্তনের সময় <span class="text-yellow-300">এখনি!</span></h2>
            <p class="text-blue-100 text-lg md:text-xl mb-12 font-medium">৫০০০+ সফল কাস্টমারদের সাথে আপনিও যোগ দিন এবং উপভোগ করুন প্রিমিয়াম সার্ভিস।</p>
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="#order" class="px-12 py-6 bg-white text-indigo-700 text-xl font-black rounded-2xl hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300">অর্ডার কনফার্ম করুন</a>
              <a href="tel:01XXXXXXXXX" class="px-12 py-6 bg-indigo-800 text-white text-xl font-black rounded-2xl border border-white/20 hover:bg-indigo-900 transition-all flex items-center justify-center gap-3">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                 সহযোগিতা নিন
              </a>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-yellow-400" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  });

  // AI Placeholder Block
  Blocks.add('bd-ai-placeholder', {
    label: 'AI Design Me',
    category: 'High Conversion',
    content: `
      <section class="py-20 px-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-3xl m-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 transition-all group min-h-[400px]" data-ai-placeholder="true">
        <div class="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
           <svg viewBox="0 0 24 24" fill="none" class="w-10 h-10 text-indigo-600" stroke="currentColor" stroke-width="2">
             <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
           </svg>
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-3">Magic AI Design</h3>
        <p class="text-gray-500 max-w-sm mb-8 font-medium">Click this block or use the floating toolbar's sparkle icon to design a custom section with AI.</p>
        <button class="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition" onclick="editor.runCommand('open-ai-design-modal')">
           START DESIGNING
        </button>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 text-indigo-500" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>',
  });

  // 22. WhatsApp Floating Button (Smart Sync)
  Blocks.add('bd-whatsapp-float', {
    label: 'WhatsApp Floating',
    category: 'High Conversion',
    content: `
      <div class="fixed bottom-6 right-6 z-[100] md:bottom-10 md:right-10">
        <a href="https://wa.me/8801XXXXXXXXX" class="w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 whatsapp-link group">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span class="absolute right-full mr-3 bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap hidden md:block">অর্ডার করতে সাহায্য নিন</span>
        </a>
      </div>
    `,
    media: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" class="w-12 h-12 text-emerald-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  });

  // 24. BD Hero Minimal
  Blocks.add('bd-hero-minimal', {
    label: 'Hero Minimal (BD)',
    category: 'BD Landing',
    content: `
      <section class="py-16 bg-white border-b border-gray-100">
         <div class="max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
            <h1 class="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
               আপনার সমস্যার <span class="text-primary product-name">একমাত্র সমাধান</span>
            </h1>
            <p class="text-lg text-gray-600 mb-8 max-w-2xl">
               অযথা সময় নষ্ট না করে আজই বেছে নিন আমাদের প্রিমিয়াম কোয়ালিটি পণ্য। ১০০% অরিজিনাল এবং গ্যারান্টিযুক্ত।
            </p>
            <div class="w-full max-w-2xl mb-10 overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
               <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80" alt="Product" class="w-full h-auto hover:scale-105 transition duration-700" />
            </div>
            <a href="#order" class="px-10 py-4 bg-primary text-white font-bold text-xl rounded-full shadow-lg hover:bg-red-700 transition animate-bounce">
               অর্ডার করুন - ১২৫০৳
            </a>
         </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-gray-500" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 14h16"/></svg>',
  });

  // 25. BD Features List (Checkmarks)
  Blocks.add('bd-features-list', {
    label: 'Feature List',
    category: 'BD Landing',
    content: `
      <section class="py-12 bg-gray-50 px-4">
         <div class="max-w-4xl mx-auto bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 class="text-2xl font-bold text-center text-gray-900 mb-8 pb-4 border-b border-gray-100">
               এই পণ্যটি কিনলে যা যা পাচ্ছেন
            </h2>
            <ul class="space-y-4">
               <li class="flex items-start gap-3">
                  <span class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span class="text-lg text-gray-700">উন্নত মানের ম্যাটেরিয়ালে তৈরি, তাই দীর্ঘদিন ব্যবহার করা যাবে।</span>
               </li>
               <li class="flex items-start gap-3">
                  <span class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span class="text-lg text-gray-700">ওয়াটারপ্রুফ এবং ডাস্টপ্রুফ টেকনোলজি।</span>
               </li>
               <li class="flex items-start gap-3">
                  <span class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span class="text-lg text-gray-700">আমরা দিচ্ছি ১ বছরের রিপ্লেসমেন্ট গ্যারান্টি।</span>
               </li>
               <li class="flex items-start gap-3">
                  <span class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span class="text-lg text-gray-700">ফাস্ট চার্জিং সাপোর্ট (Type-C)।</span>
               </li>
               <li class="flex items-start gap-3">
                  <span class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span class="text-lg text-gray-700">সাথে পাচ্ছেন একটি আকর্ষণীয় গিফট বক্স।</span>
               </li>
            </ul>
         </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-green-500" stroke-width="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  });

  // 26. BD Video Gallery (Reviews)
  Blocks.add('bd-video-gallery', {
    label: 'Video Review Grid',
    category: 'BD Landing',
    content: `
      <section class="py-12 bg-white px-4">
         <div class="max-w-6xl mx-auto">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-10">কাস্টমার রিভিউ ভিডিও</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div class="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg">
                  <iframe class="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Customer Review 1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
               </div>
               <div class="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg">
                  <iframe class="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Customer Review 2" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
               </div>
            </div>
         </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-red-500" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M10 9l5 3-5 3V9z"/><path d="M2 12h20"/></svg>',
  });

  // 27. BD Order Form Simple (Compact)
  Blocks.add('bd-order-form-simple', {
    label: 'Order Form (Simple)',
    category: 'BD Landing',
    content: `
      <section id="order" class="py-12 bg-blue-50 px-4">
         <div class="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-xl">
            <h2 class="text-xl font-bold text-center text-gray-900 mb-6">দ্রুত অর্ডার করুন</h2>
            <form action="/api/create-order" method="POST" class="space-y-4">
               <input type="text" name="customer_name" placeholder="আপনার নাম" class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary outline-none" required />
               <input type="tel" name="phone" placeholder="ফোন নম্বর" class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary outline-none" required />
               <textarea name="address" placeholder="ঠিকানা (এলাকা, থানা, জেলা)" class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary outline-none h-20" required></textarea>
               
               <div class="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg">
                  <span class="text-sm font-bold text-gray-500">মোট বিল</span>
                  <span class="text-lg font-black text-primary product-price">১২৫০ টাকা</span>
               </div>
               
               <button type="submit" class="w-full bg-primary text-white text-lg font-bold py-3 rounded-xl shadow hover:bg-red-700 transition">অর্ডার কনফার্ম করুন</button>
            </form>
         </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-blue-500" stroke-width="1.5"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>',
  });

  // 28. BD Footer Detailed
  Blocks.add('bd-footer-detailed', {
    label: 'Footer (Detailed)',
    category: 'BD Landing',
    content: `
      <footer class="bg-gray-900 text-gray-300 py-12 px-6">
         <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
               <h4 class="text-white font-bold text-lg mb-4">আমাদের সম্পর্কে</h4>
               <p class="text-sm leading-relaxed text-gray-400">
                  আমরা দিচ্ছি বাংলাদেশের সেরা মানের গ্যাজেট এবং এক্সেসরিজ। আমাদের লক্ষ্য গ্রাহকের সন্তুষ্টি এবং বিশ্বাস অর্জন।
               </p>
            </div>
            <div>
               <h4 class="text-white font-bold text-lg mb-4">যোগাযোগ</h4>
               <ul class="space-y-2 text-sm">
                  <li class="flex items-center gap-2"><span class="text-primary">📞</span> 017XXXXXXXX</li>
                  <li class="flex items-center gap-2"><span class="text-primary">📧</span> support@example.com</li>
                  <li class="flex items-center gap-2"><span class="text-primary">📍</span> বাড়ি-১২, রোড-৫, উত্তরা, ঢাকা</li>
               </ul>
            </div>
            <div>
               <h4 class="text-white font-bold text-lg mb-4">গুরুত্বপূর্ণ লিঙ্ক</h4>
               <ul class="space-y-2 text-sm">
                  <li><a href="/privacy" class="hover:text-white transition">প্রাইভেসি পলিসি</a></li>
                  <li><a href="/terms" class="hover:text-white transition">শর্তাবলী</a></li>
                  <li><a href="/refund" class="hover:text-white transition">রিফান্ড পলিসি</a></li>
               </ul>
            </div>
         </div>
         <div class="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
            &copy; 2025 All rights reserved. Designed with ❤️ in Bangladesh.
         </div>
      </footer>
    `,
    media: '<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-gray-400" stroke-width="1.5"><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M2 14h20"/><path d="M6 18h2M10 18h8"/></svg>',
  });
};
