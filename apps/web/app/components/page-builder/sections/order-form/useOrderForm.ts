/**
 * Shared Order Form Hooks
 * Common logic used across all order form variants
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { DISTRICTS, getShippingZone, getUpazilasByDistrict } from '~/data/bd-locations';
import { formatCurrency } from '~/utils/money';
import type { OrderFormProps, ProductVariant, ProductInfo } from './types';

export interface OrderFormState {
  customerName: string;
  phone: string;
  phoneError: string;
  email: string;
  altPhone: string;
  address: string;
  note: string;
  selectedVariant: ProductVariant | null;
  quantity: number;
  isInsideDhaka: boolean;
  orderSuccess: boolean;
  honeypot: string;
  selectedDistrictId: string;
  selectedUpazilaId: string;
  couponCode: string;
  couponDiscount: number;
  couponError: string;
  couponSuccess: string;
  isApplyingCoupon: boolean;
  appliedCouponCode: string | null;
  couponRule: { type: string, value: number, maxDiscountAmount: number | null, minOrderAmount: number | null } | null;
}

export interface OrderFormActions {
  setCustomerName: (value: string) => void;
  handlePhoneChange: (value: string) => void;
  setEmail: (value: string) => void;
  setAltPhone: (value: string) => void;
  setAddress: (value: string) => void;
  setNote: (value: string) => void;
  setSelectedVariant: (variant: ProductVariant | null) => void;
  setQuantity: (quantity: number) => void;
  setIsInsideDhaka: (value: boolean) => void;
  setHoneypot: (value: string) => void;
  setSelectedDistrictId: (id: string) => void;
  setSelectedUpazilaId: (id: string) => void;
  setCouponCode: (value: string) => void;
  applyCoupon: (storeId: number, currentSubtotal: number) => Promise<void>;
  removeCoupon: () => void;
}

export interface OrderFormCalculations {
  basePrice: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  calculatedShippingZone: 'dhaka' | 'outside';
  availableUpazilas: Array<{ id: string; name: string; nameEn: string; districtId: string }>;
  actualPrice: number;
  actualComparePrice: number;
  actualVariants: ProductVariant[];
  actualProductImage: string | null;
  actualProductTitle: string | null;
  formatPrice: (price: number) => string;
  validateBDPhone: (value: string) => boolean;
}

export function useOrderForm(
  props: Record<string, unknown>,
  product?: ProductInfo | null,
) {
  const fetcher = useFetcher<{ success: boolean; orderId?: number; orderNumber?: string; error?: string }>();
  const navigate = useNavigate();
  
  const typedProps = props as OrderFormProps;
  
  // Defaults
  const {
    discountedPrice = 1490,
    productPrice = 1990,
    insideDhakaCharge = 60,
    outsideDhakaCharge = 120,
    variants = [
      { id: '1', name: '১ পিস', price: 1490 },
      { id: '2', name: '২ পিস (সেভ ৳২০০)', price: 2780 },
      { id: '3', name: '৩ পিস (সেভ ৳৫০০)', price: 3970 },
    ],
    shippingZoneMode = 'auto' as 'auto' | 'manual',
    thankYouRedirectUrl,
  } = typedProps;
  
  // Use product data if available
  const actualPrice = product?.price ?? discountedPrice;
  const actualComparePrice = product?.compareAtPrice ?? productPrice;
  const actualVariants = (product?.variants && product.variants.length > 0) 
    ? product.variants.map(v => ({ id: String(v.id), name: v.name, price: v.price }))
    : variants;
  const actualProductImage = product?.images?.[0] || typedProps.productImage || null;
  const actualProductTitle = product?.title || typedProps.productTitle || null;
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(actualVariants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isInsideDhaka, setIsInsideDhaka] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponRule, setCouponRule] = useState<{ type: string, value: number, maxDiscountAmount: number | null, minOrderAmount: number | null } | null>(null);
  
  // BD Phone validation
  const validateBDPhone = useCallback((value: string): boolean => {
    const cleaned = value.replace(/[\s-]/g, '');
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    return bdPhoneRegex.test(cleaned);
  }, []);
  
  const handlePhoneChange = useCallback((value: string) => {
    const cleanedValue = value.replace(/[^0-9\s-]/g, '');
    setPhone(cleanedValue);
    
    if (cleanedValue.length > 0) {
      const cleaned = cleanedValue.replace(/[\s-]/g, '');
      if (cleaned.length >= 11) {
        if (!validateBDPhone(cleanedValue)) {
          setPhoneError('সঠিক নম্বর দিন (01XXXXXXXXX)');
        } else {
          setPhoneError('');
        }
      } else if (cleaned.length > 3 && !cleaned.startsWith('01')) {
        setPhoneError('নম্বর 01 দিয়ে শুরু করুন');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  }, [validateBDPhone]);
  
  // Get upazilas for selected district
  const availableUpazilas = useMemo(() => {
    if (!selectedDistrictId) return [];
    return getUpazilasByDistrict(selectedDistrictId);
  }, [selectedDistrictId]);
  
  // Reset upazila when district changes
  useEffect(() => {
    setSelectedUpazilaId('');
  }, [selectedDistrictId]);
  
  // Calculate shipping zone from district
  const calculatedShippingZone = useMemo(() => {
    if (shippingZoneMode === 'manual') {
      return isInsideDhaka ? 'dhaka' : 'outside';
    }
    if (!selectedDistrictId) return 'dhaka';
    return getShippingZone(selectedDistrictId);
  }, [shippingZoneMode, selectedDistrictId, isInsideDhaka]);
  
  // Reset selectedVariant when variants change
  useEffect(() => {
    setSelectedVariant(actualVariants[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, actualVariants.length]);
  
  // Handle successful order
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.orderId) {
      setOrderSuccess(true);
      const orderId = fetcher.data.orderId;
      setTimeout(() => {
        if (thankYouRedirectUrl) {
          if (thankYouRedirectUrl.startsWith('http')) {
            window.location.href = thankYouRedirectUrl;
          } else {
            navigate(thankYouRedirectUrl);
          }
        } else {
          navigate(`/thank-you/${orderId}`);
        }
      }, 2000);
    }
  }, [fetcher.data, navigate, thankYouRedirectUrl]);
  
  const applyCoupon = useCallback(async (storeId: number, currentSubtotal: number) => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          storeId,
          orderAmount: currentSubtotal
        })
      });

      const data = await response.json() as any;

      if (data.valid) {
        setCouponDiscount(data.discount);
        setAppliedCouponCode(data.code || couponCode.toUpperCase());
        setCouponRule({
          type: data.type,
          value: data.value,
          maxDiscountAmount: data.maxDiscountAmount,
          minOrderAmount: data.minOrderAmount
        });
        setCouponSuccess(data.message || 'Coupon applied!');
        setCouponError('');
      } else {
        setCouponDiscount(0);
        setAppliedCouponCode(null);
        setCouponRule(null);
        setCouponError(data.message || 'Invalid coupon');
        setCouponSuccess('');
      }
    } catch (err) {
      setCouponError('কুপন যাচাই করতে সমস্যা হয়েছে (Failed to validate coupon)');
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode]);

  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCouponCode(null);
    setCouponRule(null);
    setCouponDiscount(0);
    setCouponError('');
    setCouponSuccess('');
  }, []);

  // Calculate prices
  const basePrice = selectedVariant?.price || actualPrice;
  const subtotal = basePrice * quantity;
  const deliveryCharge = calculatedShippingZone === 'dhaka' ? insideDhakaCharge : outsideDhakaCharge;

  // Dynamically recalculate coupon discount based on the rule and current subtotal
  // NOTE: If combo is used, the OrderFormFields passes comboSummary.discountedSubtotal here instead of subtotal.
  // Wait, useOrderForm calculates its own subtotal. OrderFormFields uses comboSummary?.discountedSubtotal.
  // To avoid circular dependency, we will just provide couponRule in state so OrderFormFields can calculate the final discount correctly.

  // Apply coupon discount (cap it to subtotal just in case - basic fallback)
  let actualCouponDiscount = couponDiscount;
  if (couponRule) {
    if (couponRule.minOrderAmount && subtotal < couponRule.minOrderAmount) {
      actualCouponDiscount = 0; // Order amount is too low now
    } else if (couponRule.type === 'percentage') {
      actualCouponDiscount = subtotal * (couponRule.value / 100);
      if (couponRule.maxDiscountAmount && actualCouponDiscount > couponRule.maxDiscountAmount) {
        actualCouponDiscount = couponRule.maxDiscountAmount;
      }
    } else {
      actualCouponDiscount = couponRule.value;
    }
  }
  actualCouponDiscount = Math.min(actualCouponDiscount, subtotal);

  const total = subtotal - actualCouponDiscount + deliveryCharge;
  
  // Format price using central utility
  // Note: Landing page configs store prices in taka (not cents), so no fromCents conversion
  const formatPrice = useCallback(
    (price: number, currencyCode: string = (typedProps.currency as string) || 'BDT') => formatCurrency(price, currencyCode),
    [typedProps.currency]
  );
  
  const state: OrderFormState = {
    customerName,
    phone,
    phoneError,
    email,
    altPhone,
    address,
    note,
    selectedVariant,
    quantity,
    isInsideDhaka,
    orderSuccess,
    honeypot,
    selectedDistrictId,
    selectedUpazilaId,
    couponCode,
    couponDiscount,
    couponError,
    couponSuccess,
    isApplyingCoupon,
    appliedCouponCode,
    couponRule,
  };
  
  const actions: OrderFormActions = {
    setCustomerName,
    handlePhoneChange,
    setEmail,
    setAltPhone,
    setAddress,
    setNote,
    setSelectedVariant,
    setQuantity,
    setIsInsideDhaka,
    setHoneypot,
    setSelectedDistrictId,
    setSelectedUpazilaId,
    setCouponCode,
    applyCoupon,
    removeCoupon,
  };
  
  const calculations: OrderFormCalculations = {
    basePrice,
    subtotal,
    deliveryCharge,
    total,
    calculatedShippingZone: calculatedShippingZone as 'dhaka' | 'outside',
    availableUpazilas,
    actualPrice,
    actualComparePrice,
    actualVariants,
    actualProductImage,
    actualProductTitle,
    formatPrice,
    validateBDPhone,
  };
  
  return {
    fetcher,
    state,
    actions,
    calculations,
    props: typedProps,
    districts: DISTRICTS,
  };
}
