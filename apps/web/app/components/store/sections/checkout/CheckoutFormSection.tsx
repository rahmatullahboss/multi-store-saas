/**
 * Checkout Form Section
 * 
 * Bangladesh COD-first checkout with customer info, shipping, and payment.
 * Limited customization for security.
 */

import { useState } from 'react';
import { Loader2, Phone, MapPin, User, Mail } from 'lucide-react';
import type { CheckoutContext } from '~/lib/template-resolver.server';

interface CheckoutFormSectionProps {
  sectionId: string;
  props: {
    showPhoneField?: boolean;
    phoneRequired?: boolean;
    showDistrictSelector?: boolean;
    showUpazilaSelector?: boolean;
    defaultPaymentMethod?: 'cod' | 'online';
    showCodOption?: boolean;
    showOnlinePayment?: boolean;
  };
  context: CheckoutContext;
}

export default function CheckoutFormSection({ sectionId, props, context }: CheckoutFormSectionProps) {
  const {
    showPhoneField = true,
    phoneRequired = true,
    showDistrictSelector = true,
    showCodOption = true,
    showOnlinePayment = true,
    defaultPaymentMethod = 'cod',
  } = props;

  const themeColors = context.theme;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    upazila: '',
    paymentMethod: defaultPaymentMethod,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Submit to API
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cart: JSON.parse(localStorage.getItem('cart') || '[]'),
        }),
      });
      
      if (response.ok) {
        const data = await response.json() as { orderId?: number };
        localStorage.removeItem('cart');
        window.location.href = `/thank-you/${data.orderId}`;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 
          className="text-2xl font-bold mb-6"
          style={{ color: themeColors.textColor }}
        >
          Checkout
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4" style={{ color: themeColors.textColor }}>
              Customer Information
            </h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="আপনার নাম"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Phone */}
              {showPhoneField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number {phoneRequired && '*'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required={phoneRequired}
                      placeholder="01XXXXXXXXX"
                      pattern="01[3-9][0-9]{8}"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4" style={{ color: themeColors.textColor }}>
              Shipping Address
            </h3>
            
            <div className="space-y-4">
              {/* District */}
              {showDistrictSelector && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">জেলা নির্বাচন করুন</option>
                    <option value="dhaka">Dhaka</option>
                    <option value="chittagong">Chittagong</option>
                    <option value="sylhet">Sylhet</option>
                    <option value="rajshahi">Rajshahi</option>
                    <option value="khulna">Khulna</option>
                    <option value="barisal">Barisal</option>
                    <option value="rangpur">Rangpur</option>
                    <option value="mymensingh">Mymensingh</option>
                  </select>
                </div>
              )}

              {/* Full Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="বিস্তারিত ঠিকানা (বাড়ি নম্বর, রাস্তা, এলাকা)"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4" style={{ color: themeColors.textColor }}>
              Payment Method
            </h3>
            
            <div className="space-y-3">
              {showCodOption && (
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="w-5 h-5"
                    style={{ accentColor: themeColors.accentColor }}
                  />
                  <div>
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-500">Pay when you receive</p>
                  </div>
                </label>
              )}

              {showOnlinePayment && (
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleChange}
                    className="w-5 h-5"
                    style={{ accentColor: themeColors.accentColor }}
                  />
                  <div>
                    <span className="font-medium">Online Payment</span>
                    <p className="text-sm text-gray-500">bKash, Nagad, Card</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-lg font-semibold text-white text-lg transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: themeColors.accentColor }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              'Place Order'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
