/**
 * Shared Order Form Hooks
 * Common logic used across all order form variants
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { 
  DISTRICTS, 
  getUpazilasByDistrict, 
  getShippingZone,
} from '~/data/bd-locations';
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
  
  // Calculate prices
  const basePrice = selectedVariant?.price || actualPrice;
  const subtotal = basePrice * quantity;
  const deliveryCharge = calculatedShippingZone === 'dhaka' ? insideDhakaCharge : outsideDhakaCharge;
  const total = subtotal + deliveryCharge;
  
  // Format price in Bengali
  const formatPrice = useCallback((price: number) => `৳${price.toLocaleString('bn-BD')}`, []);
  
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
