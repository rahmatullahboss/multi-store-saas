/**
 * Shared Checkout Page Component (Theme-Aware) - Shopify Standard
 *
 * A world-class checkout page that dynamically adapts to any template's theme.
 * Built to Shopify standards with all premium e-commerce features.
 *
 * Features:
 * - Express checkout (bKash, Nagad)
 * - Contact info with email + phone
 * - Shipping address with validation
 * - Multiple shipping methods
 * - Multiple payment methods with icons
 * - Order notes
 * - Terms & conditions
 * - Collapsible order summary (mobile)
 * - Order success with timeline
 * - Fully theme-aware
 * - Preview/Live mode support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from '@remix-run/react';
import {
  Shield,
  Truck,
  CreditCard,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Check,
  Package,
  MapPin,
  Mail,
  Clock,
  Zap,
  AlertCircle,
  Smartphone,
  User,
  MessageSquare,
} from 'lucide-react';
import type { StoreTemplateTheme } from '~/templates/store-registry';
import { DEMO_PRODUCTS } from '~/utils/store-preview-data';
import { DISTRICTS, getUpazilasByDistrict, getShippingZone } from '~/data/bd-locations';
import { SearchableSelect } from '~/components/SearchableSelect';

interface CartItem {
  productId: number;
  quantity: number;
  title?: string;
  price?: number;
  imageUrl?: string;
  image?: string;
  variantName?: string;
}

interface FormErrors {
  email?: string;
  phone?: string;
  fullName?: string;
  address?: string;
  district?: string;
  upazila?: string;
  area?: string;
  terms?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ReactNode;
}

interface SharedCheckoutPageProps {
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
  templateId?: string; // Optional: Pass template ID for preview mode navigation
  onNavigate?: (path: string) => void; // Optional: Callback for internal navigation
}

// Bangladesh Cities - REMOVED in favor of DISTRICTS from bd-locations.ts

// Shipping Methods
const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Regular courier service',
    price: 60,
    estimatedDays: '3-5 business days',
    icon: <Truck className="w-5 h-5" />,
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Priority handling & faster delivery',
    price: 120,
    estimatedDays: '1-2 business days',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'same-day',
    name: 'Same Day Delivery',
    description: 'Available for Dhaka city only',
    price: 200,
    estimatedDays: 'Today (order before 2 PM)',
    icon: <Clock className="w-5 h-5" />,
  },
];

// Payment Methods
const PAYMENT_METHODS = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: <Truck className="w-6 h-6" />,
    color: '#22c55e',
    enabled: true,
  },
  {
    id: 'bkash',
    name: 'bKash',
    description: 'Pay with bKash mobile wallet',
    icon: <Smartphone className="w-6 h-6" />,
    color: '#e2136e',
    enabled: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    description: 'Pay with Nagad mobile wallet',
    icon: <Smartphone className="w-6 h-6" />,
    color: '#f26922',
    enabled: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'VISA, MasterCard, AMEX',
    icon: <CreditCard className="w-6 h-6" />,
    color: '#1a1f71',
    enabled: false,
    comingSoon: true,
  },
];

export default function SharedCheckoutPage({
  theme,
  isPreview = false,
  templateId: propTemplateId,
  onNavigate,
}: SharedCheckoutPageProps) {
  const params = useParams();
  // Use prop templateId first, fallback to URL params
  const templateId = propTemplateId || params.templateId;

  // Default theme if not provided
  const colors = theme || {
    primary: '#1a1a1a',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1a1a1a',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1a1a1a',
    footerText: '#ffffff',
  };

  const currencySymbol = '৳';

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  // const [city, setCity] = useState('Dhaka'); // Removed legacy city state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<string>('');
  const [area, setArea] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Derived state for available Upazilas
  const availableUpazilas = React.useMemo(() => {
    if (!selectedDistrictId) return [];
    return getUpazilasByDistrict(selectedDistrictId);
  }, [selectedDistrictId]);

  // Effect: Update shipping charge and reset Upazila when District changes
  useEffect(() => {
    setSelectedUpazilaId(''); // Reset upazila
    
    if (selectedDistrictId) {
      getShippingZone(selectedDistrictId);
      // Determine shipping method based on zone
      // Note: This logic overrides the manual selection if not careful. 
      // Current behavior: Auto-select standard shipping price based on zone.
      // Ideally we should update the PRICE of the standard/express methods dynamically, 
      // but for now we'll simulate it by auto-switching or updating a cost multiplier if needed.
      // Since SHIPPING_METHODS are static consts, we might need a dynamic cost calculation.
      
      // Simpler approach for this specific checkout:
      // If zone is Dhaka -> Standard is 60.
      // If zone is Outside -> Standard is 120.
      // We'll trust the backend/order logic to validate, but here we can visually update if needed.
      // However, the requested task is just the address selector. 
      // For shipping cost updates, let's assume the SHIPPING_METHODS array needs to be dynamic or we update a state.
      // Let's stick to the visible address selector implementation first.
    }
  }, [selectedDistrictId]);
  
  // Use dynamic shipping cost
  const calculatedShippingCost = React.useMemo(() => {
    const baseMethod = SHIPPING_METHODS.find(m => m.id === shippingMethod);
    if (!baseMethod) return 60;
    
    // Override standard shipping price based on location
    if (shippingMethod === 'standard') {
      const zone = selectedDistrictId ? getShippingZone(selectedDistrictId) : 'dhaka'; // Default to dhaka/inside charge if unknown
      return zone === 'dhaka' ? 60 : 120;
    }
    
    return baseMethod.price;
  }, [shippingMethod, selectedDistrictId]);



  // UI State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load Cart Data
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        if (Array.isArray(items)) {
          if (isPreview) {
            const hydratedItems = items
              .map((item: CartItem) => {
                const pId = Number(item.productId);
                const demoProduct = DEMO_PRODUCTS.find((p) => p.id === pId);
                return demoProduct
                  ? {
                      ...item,
                      title: demoProduct.title,
                      price: demoProduct.price,
                      imageUrl: demoProduct.imageUrl,
                    }
                  : null;
              })
              .filter(Boolean) as CartItem[];
            setCartItems(hydratedItems);
          } else {
            setCartItems(items);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    setHydrated(true);
  }, [isPreview]);

  // Validation Functions
  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email';
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value) return 'Phone number is required';
    if (!/^01[3-9]\d{8}$/.test(value.replace(/\D/g, '')))
      return 'Enter a valid Bangladesh phone (01XXXXXXXXX)';
    return undefined;
  };

  const validateRequired = (value: string, fieldName: string): string | undefined => {
    if (!value.trim()) return `${fieldName} is required`;
    return undefined;
  };

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = useCallback(
    (field: string) => {
      let error: string | undefined;
      switch (field) {
        case 'email':
          error = validateEmail(email);
          break;
        case 'phone':
          error = validatePhone(phone);
          break;
        case 'fullName':
          error = validateRequired(fullName, 'Full name');
          break;
        case 'address':
          error = validateRequired(address, 'Address');
          break;
        case 'district':
          error = !selectedDistrictId ? 'District is required' : undefined;
          break;
        case 'upazila':
          // Only validate upazila if available for the district
          error = (availableUpazilas.length > 0 && !selectedUpazilaId) ? 'Upazila/Thana is required' : undefined;
          break;
        case 'area':
          error = validateRequired(area, 'Area/Zone');
          break;
      }
      setErrors((prev) => ({ ...prev, [field]: error }));
      return error;
    },
    [email, phone, fullName, address, area, selectedDistrictId, selectedUpazilaId, availableUpazilas.length]
  );

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {
      email: validateEmail(email),
      phone: validatePhone(phone),
      fullName: validateRequired(fullName, 'Full name'),
      address: validateRequired(address, 'Address'),
      district: !selectedDistrictId ? 'District is required' : undefined,
      upazila: (availableUpazilas.length > 0 && !selectedUpazilaId) ? 'Upazila is required' : undefined,
      area: validateRequired(area, 'Area/Zone'),
      terms: !acceptTerms ? 'You must accept the terms' : undefined,
    };

    setErrors(newErrors);
    setTouched({
      email: true,
      phone: true,
      fullName: true,
      address: true,
      district: true,
      upazila: true,
      area: true,
      terms: true,
    });

    return !Object.values(newErrors).some(Boolean);
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Use dynamic shipping cost
  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shippingMethod);
  const shippingCost = calculatedShippingCost;
  const total = subtotal + shippingCost;

  // Get delivery date
  const getDeliveryDate = () => {
    const today = new Date();
    let minDays = 3;
    let maxDays = 5;

    if (shippingMethod === 'express') {
      minDays = 1;
      maxDays = 2;
    } else if (shippingMethod === 'same-day') {
      return 'Today';
    }

    const minDate = new Date(today);
    const maxDate = new Date(today);
    minDate.setDate(minDate.getDate() + minDays);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  // Helper for preview-safe links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path === '/cart') return `/store-template-preview/${templateId}/cart`;
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  // Navigation handler - uses callback if provided, otherwise URL navigation
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  // Handle express checkout
  const handleExpressCheckout = (method: string) => {
    setPaymentMethod(method);
    // Scroll to payment section
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle place order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsProcessing(true);

    // Construct full address for submission
    const districtName = DISTRICTS.find(d => d.id === selectedDistrictId)?.name || '';
    const upazilaName = availableUpazilas.find(u => u.id === selectedUpazilaId)?.name || '';
    const fullAddress = `${address}, ${upazilaName}, ${districtName}`;
    
    // In a real app, you would send { address: fullAddress, district: selectedDistrictId, upazila: selectedUpazilaId }
    console.warn('Submitting Order:', {
      fullName,
      phone,
      email,
      address: fullAddress, // legacy support
      structuredAddress: {
        street: address,
        district: selectedDistrictId,
        upazila: selectedUpazilaId,
        area
      },
      paymentMethod,
      shippingMethod,
      items: cartItems,
      total
    });

    // Simulate API call
    setTimeout(() => {
      const newOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(newOrderNumber);

      // Clear cart
      if (!isPreview) {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
      }

      setIsProcessing(false);
      setOrderPlaced(true);
    }, 2000);
  };

  // Order Success Page
  if (orderPlaced) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="max-w-lg w-full text-center p-8 rounded-2xl shadow-lg"
          style={{ backgroundColor: colors.cardBg }}
        >
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Order Placed Successfully!
          </h2>
          <p className="mb-6" style={{ color: colors.muted }}>
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          {/* Order Details Card */}
          <div
            className="p-4 rounded-xl mb-6 text-left"
            style={{ backgroundColor: colors.background }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: colors.muted }}>
                Order Number
              </span>
              <span className="font-bold" style={{ color: colors.text }}>
                {orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: colors.muted }}>
                Total Amount
              </span>
              <span className="font-bold" style={{ color: colors.accent }}>
                {currencySymbol}
                {total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.muted }}>
                Payment Method
              </span>
              <span className="font-medium" style={{ color: colors.text }}>
                {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
              </span>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-left" style={{ color: colors.text }}>
              What happens next?
            </h3>
            <div className="space-y-4">
              {[
                { icon: Mail, text: 'Confirmation email sent', done: true },
                { icon: Package, text: 'Order being prepared', done: false },
                { icon: Truck, text: `Delivery: ${getDeliveryDate()}`, done: false },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-left">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.done ? 'bg-green-100' : ''
                    }`}
                    style={{ backgroundColor: step.done ? undefined : colors.background }}
                  >
                    <step.icon
                      className={`w-4 h-4 ${step.done ? 'text-green-600' : ''}`}
                      style={{ color: step.done ? undefined : colors.muted }}
                    />
                  </div>
                  <span
                    className={step.done ? 'font-medium' : ''}
                    style={{ color: step.done ? colors.text : colors.muted }}
                  >
                    {step.text}
                  </span>
                  {step.done && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to={getLink('/')}
              onClick={(e) => handleNavigation(e, '/')}
              className="block w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Continue Shopping
            </Link>
            {!isPreview && (
              <Link
                to="/account/orders"
                className="block w-full py-3 rounded-xl font-medium border transition-opacity hover:opacity-80"
                style={{ borderColor: colors.muted + '40', color: colors.text }}
              >
                View Order Details
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-12" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: colors.muted }}>
          <Link
            to={getLink('/cart')}
            onClick={(e) => handleNavigation(e, '/cart')}
            className="hover:underline"
          >
            Cart
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold" style={{ color: colors.text }}>
            Checkout
          </span>
        </div>

        {/* Express Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 rounded-xl shadow-sm mb-6" style={{ backgroundColor: colors.cardBg }}>
            <p className="text-sm font-medium mb-4 text-center" style={{ color: colors.muted }}>
              Express Checkout
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleExpressCheckout('bkash')}
                className="py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: '#e2136e' }}
              >
                <Smartphone className="w-5 h-5" />
                bKash
              </button>
              <button
                type="button"
                onClick={() => handleExpressCheckout('nagad')}
                className="py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: '#f26922' }}
              >
                <Smartphone className="w-5 h-5" />
                Nagad
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.muted + '30' }} />
              <span className="text-xs" style={{ color: colors.muted }}>
                OR CONTINUE BELOW
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.muted + '30' }} />
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5" style={{ color: colors.accent }} />
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  Contact Information
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.email && touched.email ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor: errors.email && touched.email ? '#ef4444' : colors.muted + '40',
                      color: colors.text,
                    }}
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="01XXXXXXXXX"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.phone && touched.phone ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor: errors.phone && touched.phone ? '#ef4444' : colors.muted + '40',
                      color: colors.text,
                    }}
                  />
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" style={{ color: colors.accent }} />
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  Shipping Address
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: colors.muted }}
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                        errors.fullName && touched.fullName ? 'border-red-500' : ''
                      }`}
                      style={{
                        backgroundColor: colors.background,
                        borderColor:
                          errors.fullName && touched.fullName ? '#ef4444' : colors.muted + '40',
                        color: colors.text,
                      }}
                    />
                  </div>
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => handleBlur('address')}
                    rows={2}
                    placeholder="House no, Road, Block, Area..."
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none ${
                      errors.address && touched.address ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor:
                        errors.address && touched.address ? '#ef4444' : colors.muted + '40',
                      color: colors.text,
                    }}
                  />
                  {errors.address && touched.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    District <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    options={DISTRICTS}
                    value={selectedDistrictId}
                    onChange={(id) => {
                      setSelectedDistrictId(id);
                      setTouched(prev => ({ ...prev, district: true }));
                      setErrors(prev => ({ ...prev, district: !id ? 'District is required' : undefined }));
                    }}
                    placeholder="Select District"
                    label=""
                    inputBg={colors.background}
                    inputBorder={errors.district && touched.district ? '#ef4444' : colors.muted + '40'}
                    inputText={colors.text}
                    primaryColor={colors.accent}
                    mutedColor={colors.muted}
                  />
                  {errors.district && touched.district && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                      <AlertCircle className="w-3 h-3" />
                      {errors.district}
                    </p>
                  )}
                </div>

                {availableUpazilas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Upazila/Thana <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      options={availableUpazilas}
                      value={selectedUpazilaId}
                      onChange={(id) => {
                        setSelectedUpazilaId(id);
                        setTouched(prev => ({ ...prev, upazila: true }));
                        setErrors(prev => ({ ...prev, upazila: !id ? 'Upazila is required' : undefined }));
                      }}
                      placeholder="Select Upazila"
                      label=""
                      inputBg={colors.background}
                      inputBorder={errors.upazila && touched.upazila ? '#ef4444' : colors.muted + '40'}
                      inputText={colors.text}
                      primaryColor={colors.accent}
                      mutedColor={colors.muted}
                    />
                    {errors.upazila && touched.upazila && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                        <AlertCircle className="w-3 h-3" />
                        {errors.upazila}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                    Area / Zone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    onBlur={() => handleBlur('area')}
                    placeholder="Gulshan, Dhanmondi, Mirpur..."
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.area && touched.area ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor: errors.area && touched.area ? '#ef4444' : colors.muted + '40',
                      color: colors.text,
                    }}
                  />
                  {errors.area && touched.area && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-message">
                      <AlertCircle className="w-3 h-3" />
                      {errors.area}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5" style={{ color: colors.accent }} />
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  Shipping Method
                </h2>
              </div>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const isDisabled = method.id === 'same-day' && selectedDistrictId !== 'dhaka';
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-opacity-100'
                      }`}
                      style={{
                        borderColor:
                          shippingMethod === method.id ? colors.accent : colors.muted + '40',
                        backgroundColor:
                          shippingMethod === method.id ? colors.accent + '10' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={shippingMethod === method.id}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        disabled={isDisabled}
                        className="w-5 h-5"
                        style={{ accentColor: colors.accent }}
                      />
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: colors.accent + '15', color: colors.accent }}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold block" style={{ color: colors.text }}>
                          {method.name}
                        </span>
                        <span className="text-sm" style={{ color: colors.muted }}>
                          {method.description}
                          {isDisabled && ' (Dhaka only)'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold" style={{ color: colors.accent }}>
                          {currencySymbol}
                          {method.price}
                        </span>
                        <span className="text-xs block" style={{ color: colors.muted }}>
                          {method.estimatedDays}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div
              id="payment-section"
              className="p-6 rounded-xl shadow-sm"
              style={{ backgroundColor: colors.cardBg }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" style={{ color: colors.accent }} />
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  Payment Method
                </h2>
              </div>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl transition-all ${
                      method.enabled
                        ? 'cursor-pointer hover:border-opacity-100'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{
                      borderColor:
                        paymentMethod === method.id ? colors.accent : colors.muted + '40',
                      backgroundColor:
                        paymentMethod === method.id ? colors.accent + '10' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!method.enabled}
                      className="w-5 h-5"
                      style={{ accentColor: colors.accent }}
                    />
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: method.color }}
                    >
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold block" style={{ color: colors.text }}>
                        {method.name}
                        {method.comingSoon && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </span>
                      <span className="text-sm" style={{ color: colors.muted }}>
                        {method.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5" style={{ color: colors.accent }} />
                <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                  Order Notes
                  <span className="font-normal text-sm ml-2" style={{ color: colors.muted }}>
                    (Optional)
                  </span>
                </h2>
              </div>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                placeholder="Special instructions for delivery, gift message, etc."
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.muted + '40',
                  color: colors.text,
                }}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (e.target.checked) {
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                    }
                  }}
                  className="w-5 h-5 mt-0.5 rounded"
                  style={{ accentColor: colors.accent }}
                />
                <span className="text-sm" style={{ color: colors.text }}>
                  I agree to the{' '}
                  <Link
                    to={getLink('/policies/terms')}
                    onClick={(e) => handleNavigation(e, '/policies/terms')}
                    className="underline font-medium"
                    style={{ color: colors.accent }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to={getLink('/policies/privacy')}
                    onClick={(e) => handleNavigation(e, '/policies/privacy')}
                    className="underline font-medium"
                    style={{ color: colors.accent }}
                  >
                    Privacy Policy
                  </Link>
                  . <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.terms && touched.terms && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1 error-message">
                  <AlertCircle className="w-3 h-3" />
                  {errors.terms}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            {/* Mobile: Collapsible */}
            <div className="lg:hidden mb-6">
              <button
                type="button"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="w-full p-4 rounded-xl shadow-sm flex items-center justify-between"
                style={{ backgroundColor: colors.cardBg }}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" style={{ color: colors.accent }} />
                  <span className="font-medium" style={{ color: colors.text }}>
                    Order Summary ({cartItems.length} items)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: colors.accent }}>
                    {currencySymbol}
                    {total.toLocaleString()}
                  </span>
                  {showOrderSummary ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.muted }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.muted }} />
                  )}
                </div>
              </button>
            </div>

            {/* Order Summary Content */}
            <div
              className={`${showOrderSummary ? 'block' : 'hidden'} lg:block`}
              style={{ position: 'sticky', top: '1.5rem' }}
            >
              <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.cardBg }}>
                <h2
                  className="text-xl font-bold mb-6 hidden lg:block"
                  style={{ color: colors.text }}
                >
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div
                  className="space-y-4 mb-6 max-h-64 overflow-y-auto border-b pb-6"
                  style={{ borderColor: colors.muted + '20' }}
                >
                  {hydrated && cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          <div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                            style={{ backgroundColor: colors.accent }}
                          >
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </p>
                          {item.variantName && (
                            <p className="text-xs" style={{ color: colors.muted }}>
                              {item.variantName}
                            </p>
                          )}
                        </div>
                        <div className="font-medium text-sm" style={{ color: colors.text }}>
                          {currencySymbol}
                          {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center py-4" style={{ color: colors.muted }}>
                      Your cart is empty
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm" style={{ color: colors.muted }}>
                    <span>Subtotal</span>
                    <span style={{ color: colors.text }}>
                      {currencySymbol}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: colors.muted }}>
                    <span>Shipping ({selectedShipping?.name})</span>
                    <span style={{ color: colors.text }}>
                      {currencySymbol}
                      {shippingCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6" style={{ borderColor: colors.muted + '20' }}>
                  <div className="flex justify-between items-end">
                    <span className="font-medium" style={{ color: colors.text }}>
                      Total
                    </span>
                    <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                      {currencySymbol}
                      {total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.muted }}>
                    Estimated delivery: {getDeliveryDate()}
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Place Order - {currencySymbol}
                      {total.toLocaleString()}
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div
                  className="mt-4 flex items-center justify-center gap-2 text-xs"
                  style={{ color: colors.muted }}
                >
                  <Shield className="w-4 h-4" style={{ color: colors.accent }} />
                  <span>Secure & encrypted checkout</span>
                </div>

                {/* Payment Icons */}
                <div className="mt-4 flex justify-center gap-2">
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: '#e2136e' }}
                  >
                    bKash
                  </div>
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: '#f26922' }}
                  >
                    Nagad
                  </div>
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: '#1a1f71' }}
                  >
                    VISA
                  </div>
                  <div
                    className="h-6 px-2 rounded text-[10px] font-bold flex items-center justify-center border"
                    style={{ borderColor: colors.muted + '40', color: colors.text }}
                  >
                    COD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
