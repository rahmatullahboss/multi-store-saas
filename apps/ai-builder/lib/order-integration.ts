export interface OrderConfig {
  storeId: number;
  productId: number;
  apiUrl: string;
  productTitle?: string;
  productPrice?: number;
}

/**
 * Generate the order form component code that will be injected into landing pages.
 * This form submits to the main system's /api/create-order endpoint.
 */
export function generateOrderFormCode(config: OrderConfig): string {
  return `
{/* Order Form - Auto-integrated with main system */}
<div id="order-form" className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
  <h3 className="text-2xl font-bold text-center mb-6">অর্ডার করুন</h3>
  <form 
    onSubmit={async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      
      const orderData = {
        store_id: ${config.storeId},
        product_id: ${config.productId},
        customer_name: formData.get('customer_name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        division: formData.get('division'),
        quantity: parseInt(formData.get('quantity') || '1'),
        payment_method: 'cod',
      };
      
      try {
        const res = await fetch('${config.apiUrl}/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        const data = await res.json();
        if (data.success) {
          alert('অর্ডার সফল হয়েছে! অর্ডার নম্বর: ' + data.orderNumber);
          form.reset();
        } else {
          alert('ত্রুটি: ' + (data.error || 'অর্ডার করতে সমস্যা হয়েছে'));
        }
      } catch (err) {
        alert('নেটওয়ার্ক ত্রুটি! আবার চেষ্টা করুন।');
      }
    }}
    className="space-y-4"
  >
    <div>
      <label className="block text-sm font-medium mb-2">আপনার নাম *</label>
      <input
        type="text"
        name="customer_name"
        required
        minLength={2}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
        placeholder="আপনার নাম লিখুন"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">মোবাইল নম্বর *</label>
      <input
        type="tel"
        name="phone"
        required
        pattern="^(\\+880|880|0)?1[3-9]\\d{8}$"
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
        placeholder="01XXXXXXXXX"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">এলাকা *</label>
      <select
        name="division"
        required
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
      >
        <option value="dhaka">ঢাকার ভেতরে</option>
        <option value="outside_dhaka">ঢাকার বাইরে</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">সম্পূর্ণ ঠিকানা *</label>
      <textarea
        name="address"
        required
        minLength={5}
        rows={3}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-none"
        placeholder="বিস্তারিত ঠিকানা লিখুন"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">পরিমাণ</label>
      <input
        type="number"
        name="quantity"
        defaultValue={1}
        min={1}
        max={10}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
      />
    </div>
    
    <button
      type="submit"
      className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
    >
      অর্ডার কনফার্ম করুন
    </button>
    
    <p className="text-center text-sm text-gray-400 mt-4">
      ক্যাশ অন ডেলিভারি • ৩-৫ দিনে ডেলিভারি
    </p>
  </form>
</div>`;
}

/**
 * Inject the order form into generated landing page code
 */
export function injectOrderForm(code: string, config: OrderConfig): string {
  const orderFormCode = generateOrderFormCode(config);
  
  // Replace {ORDER_FORM} placeholder with actual order form
  if (code.includes('{ORDER_FORM}')) {
    return code.replace('{ORDER_FORM}', orderFormCode);
  }
  
  // If placeholder not found, try to inject before closing </div> before footer
  const footerMatch = code.match(/<footer/i);
  if (footerMatch && footerMatch.index) {
    const insertPosition = footerMatch.index;
    return (
      code.slice(0, insertPosition) +
      `\n{/* Order Form Section */}\n<section className="py-16 px-4">\n${orderFormCode}\n</section>\n\n` +
      code.slice(insertPosition)
    );
  }
  
  // Fallback: append before last closing tag
  const lastClosingDiv = code.lastIndexOf('</div>');
  if (lastClosingDiv > -1) {
    return (
      code.slice(0, lastClosingDiv) +
      `\n\n{/* Order Form Section */}\n<section className="py-16 px-4">\n${orderFormCode}\n</section>\n` +
      code.slice(lastClosingDiv)
    );
  }
  
  return code;
}

/**
 * Extract code from AI response (handles code fences if present)
 */
export function extractCode(response: string): string {
  // Remove markdown code fences if present
  const codeBlockMatch = response.match(/```(?:jsx?|tsx?|react)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code block, assume the entire response is code
  return response.trim();
}
