/**
 * DC Store Checkout Page
 * 
 * Based on the original DC Store design with golden gradient theme.
 * Features clean checkout form with order summary.
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { CreditCard, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { resolveDCStoreTheme } from '../theme';
import type { ThemeConfig } from '@db/types';
import { useTranslation } from 'react-i18next';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

interface DCCheckoutPageProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onSubmitOrder: (data: any) => void;
  isPreview?: boolean;
  config?: ThemeConfig | null;
}

export function DCCheckoutPage({ 
  items, 
  subtotal, 
  shipping = 0, 
  total, 
  onSubmitOrder, 
  isPreview = false,
  config 
}: DCCheckoutPageProps) {
  const theme = resolveDCStoreTheme(config);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cod',
  });

  // Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOrder(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center py-16 px-4">
          <Truck className="w-24 h-24 mx-auto mb-6" style={{ color: theme.muted }} />
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text }}>
            চেকআউটের জন্য কোনো পণ্য নেই
          </h1>
          <p className="text-lg mb-8" style={{ color: theme.muted }}>
            প্রথমে আপনার কার্টে কিছু পণ্য যোগ করুন
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 rounded-xl text-lg font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: theme.primary }}
          >
            পণ্য দেখুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: theme.background }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 mb-8 font-medium hover:underline"
          style={{ color: theme.text }}
        >
          <ArrowLeft className="w-4 h-4" />
          কার্টে ফিরে যান
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-bold mb-8" style={{ color: theme.text }}>
          চেকআউট
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div 
                className="p-6 rounded-2xl space-y-4"
                style={{ 
                  backgroundColor: theme.cardBg,
                  boxShadow: theme.shadowCard,
                }}
              >
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
                  <CheckCircle className="w-6 h-6" style={{ color: theme.primary }} />
                  যোগাযোগ তথ্য
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      পুরো নাম *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: theme.border,
                        '--tw-ring-color': theme.primaryLight,
                      } as React.CSSProperties}
                      placeholder="আপনার পুরো নাম"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      ইমেইল *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: theme.border,
                        '--tw-ring-color': theme.primaryLight,
                      } as React.CSSProperties}
                      placeholder="example@mail.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      ফোন নম্বর *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: theme.border,
                        '--tw-ring-color': theme.primaryLight,
                      } as React.CSSProperties}
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div 
                className="p-6 rounded-2xl space-y-4"
                style={{ 
                  backgroundColor: theme.cardBg,
                  boxShadow: theme.shadowCard,
                }}
              >
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
                  <Truck className="w-6 h-6" style={{ color: theme.primary }} />
                  শিপিং ঠিকানা
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                      ঠিকানা *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: theme.border,
                        '--tw-ring-color': theme.primaryLight,
                      } as React.CSSProperties}
                      placeholder="বাড়ি নং, রোড নং, এলাকা"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        শহর *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                        style={{ 
                          borderColor: theme.border,
                          '--tw-ring-color': theme.primaryLight,
                        } as React.CSSProperties}
                        placeholder="ঢাকা"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                        পোস্ট কোড *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                        style={{ 
                          borderColor: theme.border,
                          '--tw-ring-color': theme.primaryLight,
                        } as React.CSSProperties}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div 
                className="p-6 rounded-2xl space-y-4"
                style={{ 
                  backgroundColor: theme.cardBg,
                  boxShadow: theme.shadowCard,
                }}
              >
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
                  <CreditCard className="w-6 h-6" style={{ color: theme.primary }} />
                  পেমেন্ট পদ্ধতি
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md" style={{ 
                    backgroundColor: formData.paymentMethod === 'cod' ? theme.primaryLight : theme.cardBg,
                    border: `2px solid ${formData.paymentMethod === 'cod' ? theme.primary : theme.border}`,
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="w-4 h-4"
                      style={{ accentColor: theme.primary }}
                    />
                    <span className="font-medium" style={{ color: theme.text }}>
                      ক্যাশ অন ডেলিভারি
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md opacity-50" style={{ 
                    backgroundColor: theme.cardBg,
                    border: `2px solid ${theme.border}`,
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      disabled
                      className="w-4 h-4"
                      style={{ accentColor: theme.primary }}
                    />
                    <span className="font-medium" style={{ color: theme.textSecondary }}>
                      বিকাশ (শীঘ্রই আসছে)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div 
                className="sticky top-24 p-6 rounded-2xl space-y-4"
                style={{ 
                  backgroundColor: theme.cardBg,
                  boxShadow: theme.shadowLg,
                }}
              >
                <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                  অর্ডার সারাংশ
                </h2>

                {/* Products */}
                <div className="space-y-3 pt-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.borderLight }}>
                        <img
                          src={item.imageUrl || '/placeholder-product.svg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: theme.muted }}>
                          পরিমাণ: {item.quantity}
                        </p>
                        <p className="text-sm font-bold" style={{ color: theme.primary }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between text-base" style={{ color: theme.textSecondary }}>
                    <span>সাবটোটাল</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-base" style={{ color: theme.textSecondary }}>
                    <span>শিপিং</span>
                    <span className="font-semibold">{shipping === 0 ? 'ফ্রি' : formatPrice(shipping)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold pt-3 border-t" style={{ borderColor: theme.border, color: theme.text }}>
                    <span>মোট</span>
                    <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl text-lg font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg active:scale-95"
                  style={{ 
                    backgroundColor: theme.primary,
                    boxShadow: theme.shadowMd,
                  }}
                >
                  অর্ডার করুন
                </button>

                {/* Trust Badge */}
                <div className="pt-4 border-t text-center" style={{ borderColor: theme.border }}>
                  <p className="text-xs flex items-center justify-center gap-2" style={{ color: theme.muted }}>
                    <CheckCircle className="w-4 h-4" style={{ color: theme.success }} />
                    নিরাপদ চেকআউট
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
