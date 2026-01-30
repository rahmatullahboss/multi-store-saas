/**
 * Checkout Modal Component for Quick Builder v2
 *
 * Embedded checkout modal for landing pages
 * - Mobile: Full-screen bottom sheet
 * - Desktop: Centered modal
 * - COD priority checkout
 * - Minimal fields for fast conversion
 */

import { useState, useEffect } from 'react';
import { formatPrice } from '~/lib/theme-engine';
import { useFetcher } from '@remix-run/react';
import {
  X,
  ShoppingBag,
  Truck,
  CreditCard,
  Phone,
  MapPin,
  User,
  Check,
  Loader2,
  Shield,
  Clock,
  ChevronDown,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '~/utils/cn';

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  variants?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
}

interface ShippingOption {
  id: string;
  name: string;
  fee: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  storeId: number;
  storeName?: string;
  shippingOptions?: ShippingOption[];
  whatsappNumber?: string;
  whatsappEnabled?: boolean;
  onSuccess?: (orderId: string) => void;
}

// Default shipping options for Bangladesh
const DEFAULT_SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'dhaka', name: 'ঢাকার ভিতরে', fee: 60 },
  { id: 'outside', name: 'ঢাকার বাইরে', fee: 120 },
];

// Trust badges component
function TrustBadges() {
  return (
    <div className="flex items-center justify-center gap-4 py-3 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        নিরাপদ
      </span>
      <span className="flex items-center gap-1">
        <Truck className="w-3.5 h-3.5 text-emerald-500" />
        দ্রুত ডেলিভারি
      </span>
      <span className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-emerald-500" />
        ২-৩ দিন
      </span>
    </div>
  );
}

// Order summary component
function OrderSummary({
  product,
  selectedVariant,
  quantity,
  shippingFee,
}: {
  product: Product;
  selectedVariant?: string;
  quantity: number;
  shippingFee: number;
}) {
  const variant = product.variants?.find((v) => v.id === selectedVariant);
  const unitPrice = variant?.price ?? product.price;
  const subtotal = unitPrice * quantity;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      {/* Product Info */}
      <div className="flex gap-3">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
          {variant && <p className="text-sm text-gray-500">{variant.name}</p>}
          <p className="text-sm text-emerald-600 font-semibold">{formatPrice(unitPrice)}</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">x{quantity}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>সাবটোটাল</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>ডেলিভারি চার্জ</span>
          <span>{formatPrice(shippingFee)}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
          <span>মোট</span>
          <span className="text-emerald-600">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

// Success state component
function OrderSuccess({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">অর্ডার সফল হয়েছে! 🎉</h3>
      <p className="text-gray-600 mb-2">
        আপনার অর্ডার নম্বর: <span className="font-semibold">{orderId}</span>
      </p>
      <p className="text-sm text-gray-500 mb-6">শীঘ্রই আমরা আপনার সাথে যোগাযোগ করবো।</p>
      <button
        onClick={onClose}
        className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
      >
        ঠিক আছে
      </button>
    </div>
  );
}

// Main Checkout Modal
export function CheckoutModal({
  isOpen,
  onClose,
  product,
  storeId,
  storeName,
  shippingOptions = DEFAULT_SHIPPING_OPTIONS,
  whatsappNumber,
  whatsappEnabled,
  onSuccess,
}: CheckoutModalProps) {
  const fetcher = useFetcher<{ success: boolean; orderId?: string; error?: string }>();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState(shippingOptions[0]?.id || 'dhaka');
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get shipping fee
  const shippingFee = shippingOptions.find((o) => o.id === deliveryArea)?.fee || 60;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPhone('');
      setAddress('');
      setNote('');
      setErrors({});
      setOrderSuccess(null);
    }
  }, [isOpen]);

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.orderId) {
      setOrderSuccess(fetcher.data.orderId);
      onSuccess?.(fetcher.data.orderId);
    }
  }, [fetcher.data, onSuccess]);

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'নাম দিন';
    }

    if (!phone.trim()) {
      newErrors.phone = 'ফোন নম্বর দিন';
    } else if (!/^01[3-9]\d{8}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'সঠিক ফোন নম্বর দিন';
    }

    if (!address.trim()) {
      newErrors.address = 'ঠিকানা দিন';
    } else if (address.trim().length < 10) {
      newErrors.address = 'সম্পূর্ণ ঠিকানা দিন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const variant = product.variants?.find((v) => v.id === selectedVariant);
    const unitPrice = variant?.price ?? product.price;

    fetcher.submit(
      {
        storeId: String(storeId),
        productId: String(product.id),
        variantId: selectedVariant || '',
        quantity: String(quantity),
        customerName: name.trim(),
        customerPhone: phone.replace(/\D/g, ''),
        customerAddress: address.trim(),
        deliveryArea,
        note: note.trim(),
        source: 'landing_page_modal',
        unitPrice: String(unitPrice),
        shippingFee: String(shippingFee),
      },
      { method: 'POST', action: '/api/create-order' }
    );
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = () => {
    if (!whatsappNumber) return;

    const variant = product.variants?.find((v) => v.id === selectedVariant);
    const message = encodeURIComponent(
      `🛒 অর্ডার করতে চাই:\n\n` +
        `📦 প্রোডাক্ট: ${product.name}\n` +
        (variant ? `🏷️ ভ্যারিয়েন্ট: ${variant.name}\n` : '') +
        `💰 দাম: ${formatPrice(variant?.price ?? product.price)}\n` +
        `📍 এলাকা: ${shippingOptions.find((o) => o.id === deliveryArea)?.name || deliveryArea}\n\n` +
        `আমার তথ্য:\n` +
        `নাম: ${name || '(দিন)'}\n` +
        `ফোন: ${phone || '(দিন)'}\n` +
        `ঠিকানা: ${address || '(দিন)'}`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  const isSubmitting = fetcher.state === 'submitting';

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full">
        {/* Modal Content */}
        <div className="bg-white rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900">
                {orderSuccess ? 'অর্ডার সম্পন্ন' : 'অর্ডার করুন'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {orderSuccess ? (
              <OrderSuccess orderId={orderSuccess} onClose={onClose} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Order Summary */}
                <OrderSummary
                  product={product}
                  selectedVariant={selectedVariant}
                  quantity={quantity}
                  shippingFee={shippingFee}
                />

                {/* Variant Selector */}
                {product.variants && product.variants.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ভ্যারিয়েন্ট
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v.id)}
                          className={cn(
                            'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                            selectedVariant === v.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-emerald-300'
                          )}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <User className="w-4 h-4 inline mr-1" />
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="সম্পূর্ণ নাম"
                    className={cn(
                      'w-full px-4 py-2.5 border rounded-lg transition-colors',
                      'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="w-4 h-4 inline mr-1" />
                    ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={cn(
                      'w-full px-4 py-2.5 border rounded-lg transition-colors',
                      'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Delivery Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Truck className="w-4 h-4 inline mr-1" />
                    ডেলিভারি এলাকা *
                  </label>
                  <div className="relative">
                    <select
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {shippingOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name} - {formatPrice(option.fee)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    সম্পূর্ণ ঠিকানা *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বাসা/ফ্ল্যাট নম্বর, রোড, এলাকা, থানা"
                    rows={2}
                    className={cn(
                      'w-full px-4 py-2.5 border rounded-lg transition-colors resize-none',
                      'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    )}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Note (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    অতিরিক্ত তথ্য (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="যেমন: সন্ধ্যায় কল করবেন"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Payment Info */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>ক্যাশ অন ডেলিভারি</strong> - প্রোডাক্ট হাতে পেয়ে পেমেন্ট করুন
                  </p>
                </div>

                {/* Trust Badges */}
                <TrustBadges />

                {/* Error from API */}
                {fetcher.data?.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {fetcher.data.error}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'w-full py-3 rounded-xl font-semibold text-white transition-all',
                      'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200',
                      isSubmitting && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        অর্ডার হচ্ছে...
                      </span>
                    ) : (
                      'অর্ডার কনফার্ম করুন'
                    )}
                  </button>

                  {/* WhatsApp Option */}
                  {whatsappEnabled && whatsappNumber && (
                    <button
                      type="button"
                      onClick={handleWhatsAppOrder}
                      className="w-full py-3 rounded-xl font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp এ অর্ডার করুন
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
