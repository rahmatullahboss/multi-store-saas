import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  Shield,
  Lock,
  Truck,
  CreditCard,
  Phone,
  Check,
  ChevronDown,
} from 'lucide-react';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import { buildProxyImageUrl } from '~/utils/imageOptimization';
import { OZZYL_PREMIUM_THEME } from '../theme';
import { OzzylPremiumHeader } from '../sections/Header';
import { OzzylPremiumFooter } from '../sections/Footer';

const THEME = OZZYL_PREMIUM_THEME;

function formatPrice(price: number, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: string;
}

export function OzzylPremiumCheckoutPage(props: StoreTemplateProps) {
  const { storeName, logo, config, socialLinks, businessInfo } = props;
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    notes: '',
  });

  // Demo cart items
  const checkoutItems: CheckoutItem[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 4599,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      variant: 'Black',
    },
    {
      id: '2',
      name: 'Luxury Leather Wallet',
      price: 1899,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200',
      variant: 'Brown',
    },
  ];

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingMethod === 'express' ? 250 : subtotal > 1500 ? 0 : 150;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order submitted:', { formData, paymentMethod, shippingMethod, total });
  };

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: '💰', description: 'Pay via bKash Mobile Wallet' },
    { id: 'nagad', name: 'Nagad', icon: '💳', description: 'Pay via Nagad Digital Wallet' },
    { id: 'card', name: 'Card', icon: '💳', description: 'Visa, Mastercard, Amex' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' },
  ];

  const shippingOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      time: '3-5 Business Days',
      price: subtotal > 1500 ? 0 : 150,
    },
    { id: 'express', name: 'Express Delivery', time: '1-2 Business Days', price: 250 },
  ];

  const districts = [
    'Dhaka',
    'Chittagong',
    'Sylhet',
    'Khulna',
    'Rajshahi',
    'Barisal',
    'Rangpur',
    'Mymensingh',
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.background, color: THEME.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Manrope', sans-serif; }
        .gold-gradient {
          background: linear-gradient(135deg, #C8A961 0%, #E5D4A1 50%, #C8A961 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gold-bg-gradient {
          background: linear-gradient(135deg, #C8A961 0%, #E5D4A1 50%, #C8A961 100%);
        }
      `}</style>

      <OzzylPremiumHeader
        storeName={storeName || 'Store'}
        logo={logo}
        categories={[]}
        isMenuOpen={false}
        setIsMenuOpen={() => {}}
        isScrolled={true}
        setIsScrolled={() => {}}
        config={config}
        socialLinks={socialLinks}
      />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm"
              style={{ color: THEME.textMuted }}
            >
              <ArrowLeft size={16} />
              <span>Back to Cart</span>
            </Link>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="gold-gradient">Checkout</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span style={{ color: THEME.primary }}>📞</span>
                    Contact Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-3 rounded-xl outline-none transition-colors"
                      style={{
                        backgroundColor: THEME.surface,
                        border: `1px solid ${THEME.border}`,
                        color: THEME.text,
                      }}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-3 rounded-xl outline-none transition-colors"
                      style={{
                        backgroundColor: THEME.surface,
                        border: `1px solid ${THEME.border}`,
                        color: THEME.text,
                      }}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="md:col-span-2 px-4 py-3 rounded-xl outline-none transition-colors"
                      style={{
                        backgroundColor: THEME.surface,
                        border: `1px solid ${THEME.border}`,
                        color: THEME.text,
                      }}
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="md:col-span-2 px-4 py-3 rounded-xl outline-none transition-colors"
                      style={{
                        backgroundColor: THEME.surface,
                        border: `1px solid ${THEME.border}`,
                        color: THEME.text,
                      }}
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span style={{ color: THEME.primary }}>📍</span>
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <textarea
                      name="address"
                      placeholder="Full Address *"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl outline-none transition-colors resize-none"
                      style={{
                        backgroundColor: THEME.surface,
                        border: `1px solid ${THEME.border}`,
                        color: THEME.text,
                      }}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="Area / City *"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="px-4 py-3 rounded-xl outline-none transition-colors"
                        style={{
                          backgroundColor: THEME.surface,
                          border: `1px solid ${THEME.border}`,
                          color: THEME.text,
                        }}
                      />
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                        className="px-4 py-3 rounded-xl outline-none transition-colors appearance-none"
                        style={{
                          backgroundColor: THEME.surface,
                          border: `1px solid ${THEME.border}`,
                          color: THEME.text,
                        }}
                      >
                        <option value="">Select District *</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      name="notes"
                      placeholder="Order Notes (Optional)"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl outline-none transition-colors resize-none"
                      style={{
                        backgroundColor: THEME.surface,
                        border: `1px solid ${THEME.border}`,
                        color: THEME.text,
                      }}
                    />
                  </div>
                </div>

                {/* Shipping Method */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Truck size={20} style={{ color: THEME.primary }} />
                    Shipping Method
                  </h2>
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                          shippingMethod === option.id ? 'ring-2' : ''
                        }`}
                        style={{
                          backgroundColor: THEME.surface,
                          border: `1px solid ${shippingMethod === option.id ? THEME.primary : THEME.border}`,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={shippingMethod === option.id}
                            onChange={() => setShippingMethod(option.id)}
                            className="w-5 h-5 accent-yellow-500"
                          />
                          <div>
                            <p className="font-semibold">{option.name}</p>
                            <p className="text-sm" style={{ color: THEME.textMuted }}>
                              {option.time}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold" style={{ color: THEME.primary }}>
                          {option.price === 0 ? 'FREE' : formatPrice(option.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard size={20} style={{ color: THEME.primary }} />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === method.id ? 'ring-2' : ''
                        }`}
                        style={{
                          backgroundColor: THEME.surface,
                          border: `1px solid ${paymentMethod === method.id ? THEME.primary : THEME.border}`,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                            className="w-5 h-5 accent-yellow-500"
                          />
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              <span>{method.icon}</span>
                              <span>{method.name}</span>
                            </p>
                            <p className="text-sm" style={{ color: THEME.textMuted }}>
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {paymentMethod === method.id && (
                          <Check size={20} style={{ color: THEME.primary }} />
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Payment Instructions */}
                  {paymentMethod === 'bkash' && (
                    <div
                      className="mt-4 p-4 rounded-xl"
                      style={{
                        backgroundColor: `${THEME.primary}10`,
                        border: `1px solid ${THEME.primary}30`,
                      }}
                    >
                      <p className="text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                        How to pay with bKash:
                      </p>
                      <ol className="text-sm space-y-1" style={{ color: THEME.textMuted }}>
                        <li>1. Go to your bKash app and select "Payment"</li>
                        <li>
                          2. Enter merchant wallet: <strong>01XXXXXXXXX</strong>
                        </li>
                        <li>
                          3. Enter amount: <strong>{formatPrice(total)}</strong>
                        </li>
                        <li>4. Enter PIN and confirm</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div
                  className="sticky top-24 rounded-2xl p-6"
                  style={{
                    backgroundColor: THEME.cardBg,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {checkoutItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={buildProxyImageUrl(item.imageUrl, { width: 100, quality: 80 })}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: THEME.surface }}
                            >
                              <span>📦</span>
                            </div>
                          )}
                          <span
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                            style={{
                              backgroundColor: THEME.primary,
                              color: '#0A0A0C',
                            }}
                          >
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{item.name}</p>
                          {item.variant && (
                            <p className="text-xs" style={{ color: THEME.textMuted }}>
                              {item.variant}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Lines */}
                  <div
                    className="space-y-3 py-4"
                    style={{ borderTop: `1px solid ${THEME.border}` }}
                  >
                    <div className="flex justify-between text-sm">
                      <span style={{ color: THEME.textMuted }}>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: THEME.textMuted }}>Shipping</span>
                      <span style={{ color: shipping === 0 ? THEME.primary : 'inherit' }}>
                        {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: THEME.textMuted }}>Discount</span>
                        <span style={{ color: THEME.primary }}>-{formatPrice(discount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div
                    className="flex justify-between items-center py-4"
                    style={{ borderTop: `1px solid ${THEME.border}` }}
                  >
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold gold-gradient">{formatPrice(total)}</span>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${THEME.primary} 0%, #A68B4B 100%)`,
                      color: '#0A0A0C',
                    }}
                  >
                    <Lock size={18} />
                    <span>Place Order</span>
                  </button>

                  {/* Trust Badges */}
                  <div
                    className="mt-6 pt-4 space-y-2"
                    style={{ borderTop: `1px solid ${THEME.border}` }}
                  >
                    <div
                      className="flex items-center justify-center gap-2 text-xs"
                      style={{ color: THEME.textMuted }}
                    >
                      <Shield size={14} />
                      <span>100% Buyer Protection</span>
                    </div>
                    <div
                      className="flex items-center justify-center gap-2 text-xs"
                      style={{ color: THEME.textMuted }}
                    >
                      <Lock size={14} />
                      <span>Secure SSL Encryption</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: THEME.surface }}
                      >
                        bKash
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: THEME.surface }}
                      >
                        Nagad
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: THEME.surface }}
                      >
                        Visa
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: THEME.surface }}
                      >
                        MC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <OzzylPremiumFooter
        storeName={storeName || 'Store'}
        logo={logo}
        config={config}
        socialLinks={socialLinks}
        businessInfo={businessInfo}
      />

      <FloatingContactButtons
        whatsappEnabled={config?.floatingWhatsappEnabled}
        whatsappNumber={
          config?.floatingWhatsappNumber || socialLinks?.whatsapp || businessInfo?.phone
        }
        whatsappMessage={config?.floatingWhatsappMessage}
        callEnabled={config?.floatingCallEnabled}
        callNumber={config?.floatingCallNumber || businessInfo?.phone}
        storeName={storeName || 'Store'}
      />
    </div>
  );
}

export default OzzylPremiumCheckoutPage;
