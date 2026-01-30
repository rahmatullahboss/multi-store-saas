/**
 * Shared Order Form Fields
 * Reusable form field components for all variants
 */

import { Truck, Package, Loader2, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import { SearchableSelect } from '~/components/SearchableSelect';
import { DISTRICTS } from '~/data/bd-locations';
import type { OrderFormState, OrderFormActions, OrderFormCalculations } from './useOrderForm';
import type { OrderFormProps } from './types';

interface FormFieldsProps {
  state: OrderFormState;
  actions: OrderFormActions;
  calculations: OrderFormCalculations;
  props: OrderFormProps;
  fetcher: any;
  storeId?: number;
  productId?: number;
  // Multi-product cart items
  cartItems?: Array<{ productId: number; quantity: number; variantId?: number }>;
  // Combo discount summary for order preview
  comboSummary?: {
    savings: number;
    rate: number;
    discountedSubtotal: number;
  };
  // Styling
  inputBg: string;
  inputBorder: string;
  inputText: string;
  primaryColor: string;
  mutedColor: string;
  textColor: string;
  cardBorder: string;
  isDark: boolean;
  buttonBg: string;
  buttonTextColor: string;
}

export function OrderFormFields({
  state,
  actions,
  calculations,
  props,
  fetcher,
  storeId,
  productId,
  cartItems,
  comboSummary,
  inputBg,
  inputBorder,
  inputText,
  primaryColor,
  mutedColor,
  textColor,
  cardBorder,
  isDark,
  buttonBg,
  buttonTextColor,
}: FormFieldsProps) {
  const {
    phonePlaceholder = 'আপনার মোবাইল নম্বর',
    addressPlaceholder = 'বাসা নম্বর, রোড, এলাকা',
    buttonText = 'অর্ডার কনফার্ম করুন',
    insideDhakaCharge = 60,
    outsideDhakaCharge = 120,
    insideDhakaLabel = 'ঢাকার ভিতরে',
    outsideDhakaLabel = 'ঢাকার বাইরে',
    subtotalLabel = 'সাবটোটাল',
    deliveryLabel = 'ডেলিভারি চার্জ',
    totalLabel = 'সর্বমোট',
    showDistrictField = true,
    showUpazilaField = true,
    districtLabel = 'জেলা',
    upazilaLabel = 'উপজেলা/থানা',
    addressLabel = 'বিস্তারিত ঠিকানা',
    districtPlaceholder = 'জেলা নির্বাচন করুন',
    upazilaPlaceholder = 'উপজেলা নির্বাচন করুন',
    shippingZoneMode = 'auto',
    showEmailField = false,
    showAltPhoneField = false,
    showNoteField = true,
    namePlaceholder = 'আপনার নাম লিখুন',
    emailPlaceholder = 'আপনার ইমেইল (ঐচ্ছিক)',
    altPhonePlaceholder = 'বিকল্প মোবাইল নম্বর',
    noteLabel = 'অর্ডার নোট',
    notePlaceholder = 'অতিরিক্ত তথ্য/নির্দেশনা (ঐচ্ছিক)',
    showTrustBadges = true,
    codLabel = 'ক্যাশ অন ডেলিভারি',
    secureLabel = '১০০% সিকিউর অর্ডার',
    thankYouHeadline = 'অর্ডার সফল হয়েছে! 🎉',
    thankYouMessage = 'ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।',
    showWhatsAppButton = false,
    whatsAppNumber = '',
  } = props;
  
  const { 
    subtotal, 
    deliveryCharge, 
    total, 
    calculatedShippingZone,
    availableUpazilas,
    formatPrice,
    validateBDPhone,
  } = calculations;
  
  // Success state
  if (state.orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-green-600 mb-2">
          {thankYouHeadline}
        </h3>
        <p className="text-gray-600 mb-4">{thankYouMessage}</p>
        
        {showWhatsAppButton && whatsAppNumber && (
          <a
            href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`অর্ডার সম্পর্কে জানতে চাই`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition mb-4"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp এ যোগাযোগ করুন
          </a>
        )}
        
        <p className="text-sm text-gray-500">আপনাকে ধন্যবাদ পেজে নিয়ে যাওয়া হচ্ছে...</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Error Message */}
      {fetcher.data?.error && !state.orderSuccess && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {fetcher.data.error}
        </div>
      )}
      
      <fetcher.Form 
        method="post" 
        action="/api/create-order"
        className="space-y-4"
      >
        {/* Hidden inputs */}
        <input type="hidden" name="store_id" value={storeId || ''} />
        <input type="hidden" name="product_id" value={cartItems && cartItems.length > 0 ? '' : (productId || '')} />
        <input type="hidden" name="quantity" value={state.quantity} />
        {cartItems && cartItems.length > 0 && (
          <input type="hidden" name="cart_items" value={JSON.stringify(cartItems)} />
        )}
        <input type="hidden" name="payment_method" value="cod" />
        <input type="hidden" name="division" value={calculatedShippingZone === 'dhaka' ? 'dhaka' : 'outside_dhaka'} />
        {/* Combo discount settings are server-authoritative (no client inputs) */}
        <input type="hidden" name="district" value={state.selectedDistrictId} />
        <input type="hidden" name="upazila" value={state.selectedUpazilaId} />
        {state.selectedVariant?.id && (
          <input type="hidden" name="variant_id" value={state.selectedVariant.id} />
        )}
        {/* Honeypot (offscreen, not display:none) */}
        <div className="sr-only" aria-hidden="true">
          <input
            type="text"
            name="website"
            value={state.honeypot}
            onChange={(e) => actions.setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="new-password"
          />
        </div>
        
        {/* Name */}
        <div>
          <input
            type="text"
            name="customer_name"
            value={state.customerName}
            onChange={(e) => actions.setCustomerName(e.target.value)}
            placeholder={namePlaceholder}
            className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2"
            style={{ 
              backgroundColor: inputBg, 
              border: `2px solid ${inputBorder}`,
              color: inputText,
            }}
            required
            disabled={fetcher.state !== 'idle'}
          />
        </div>
        
        {/* Phone */}
        <div>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={state.phone}
              onChange={(e) => actions.handlePhoneChange(e.target.value)}
              placeholder={phonePlaceholder}
              maxLength={14}
              className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2"
              style={{ 
                backgroundColor: inputBg, 
                border: `2px solid ${state.phoneError ? '#EF4444' : (state.phone && validateBDPhone(state.phone) ? '#10B981' : inputBorder)}`,
                color: inputText,
              }}
              required
              disabled={fetcher.state !== 'idle'}
            />
            {state.phone && (
              <span 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: validateBDPhone(state.phone) ? '#10B981' : '#9CA3AF' }}
              >
                {validateBDPhone(state.phone) ? '✓' : `${state.phone.replace(/[\s-]/g, '').length}/11`}
              </span>
            )}
          </div>
          {state.phoneError && (
            <p className="text-red-500 text-xs mt-1">{state.phoneError}</p>
          )}
        </div>
        
        {/* Email (optional) */}
        {showEmailField && (
          <div>
            <input
              type="email"
              name="customer_email"
              value={state.email}
              onChange={(e) => actions.setEmail(e.target.value)}
              placeholder={emailPlaceholder}
              className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2"
              style={{ 
                backgroundColor: inputBg, 
                border: `2px solid ${inputBorder}`,
                color: inputText,
              }}
              disabled={fetcher.state !== 'idle'}
            />
          </div>
        )}
        
        {/* Alt Phone (optional) */}
        {showAltPhoneField && (
          <div>
            <input
              type="tel"
              name="alt_phone"
              value={state.altPhone}
              onChange={(e) => actions.setAltPhone(e.target.value)}
              placeholder={altPhonePlaceholder}
              maxLength={14}
              className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2"
              style={{ 
                backgroundColor: inputBg, 
                border: `2px solid ${inputBorder}`,
                color: inputText,
              }}
              disabled={fetcher.state !== 'idle'}
            />
          </div>
        )}
        
        {/* Address Section */}
        {shippingZoneMode === 'auto' && showDistrictField ? (
          <>
            {/* District Select */}
            <div>
              <SearchableSelect
                options={DISTRICTS}
                value={state.selectedDistrictId}
                onChange={actions.setSelectedDistrictId}
                placeholder={districtPlaceholder}
                label={districtLabel}
                required
                disabled={fetcher.state !== 'idle'}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputText={inputText}
                primaryColor={primaryColor}
                mutedColor={mutedColor}
              />
              <input type="hidden" name="district_select" value={state.selectedDistrictId} />
              {state.selectedDistrictId && (
                <div 
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: calculatedShippingZone === 'dhaka' ? '#10B981' : '#F59E0B' }}
                >
                  <Truck size={12} />
                  <span>
                    {calculatedShippingZone === 'dhaka' 
                      ? `${insideDhakaLabel}: ৳${insideDhakaCharge}` 
                      : `${outsideDhakaLabel}: ৳${outsideDhakaCharge}`
                    }
                  </span>
                </div>
              )}
            </div>
            
            {/* Upazila Select */}
            {showUpazilaField && state.selectedDistrictId && availableUpazilas.length > 0 && (
              <div>
                <SearchableSelect
                  options={availableUpazilas}
                  value={state.selectedUpazilaId}
                  onChange={actions.setSelectedUpazilaId}
                  placeholder={upazilaPlaceholder}
                  label={upazilaLabel}
                  disabled={fetcher.state !== 'idle'}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputText={inputText}
                  primaryColor={primaryColor}
                  mutedColor={mutedColor}
                />
                <input type="hidden" name="upazila_select" value={state.selectedUpazilaId} />
              </div>
            )}
          </>
        ) : (
          /* Manual Mode - Dhaka/Outside Toggle */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => actions.setIsInsideDhaka(true)}
              className="py-3 sm:py-4 px-3 rounded-xl font-bold transition-all flex items-center justify-between sm:justify-center gap-2"
              style={{
                backgroundColor: state.isInsideDhaka ? primaryColor : inputBg,
                color: state.isInsideDhaka ? '#FFFFFF' : textColor,
                border: `2px solid ${state.isInsideDhaka ? primaryColor : inputBorder}`,
              }}
              disabled={fetcher.state !== 'idle'}
            >
              <div className="flex items-center gap-2">
                <Package size={16} className="flex-shrink-0" />
                <span className="text-sm sm:text-base">{insideDhakaLabel}</span>
              </div>
              <span 
                className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0"
                style={{ 
                  backgroundColor: state.isInsideDhaka ? 'rgba(255,255,255,0.2)' : `${primaryColor}20`,
                  color: state.isInsideDhaka ? '#FFFFFF' : primaryColor,
                }}
              >
                ৳{insideDhakaCharge}
              </span>
            </button>
            <button
              type="button"
              onClick={() => actions.setIsInsideDhaka(false)}
              className="py-3 sm:py-4 px-3 rounded-xl font-bold transition-all flex items-center justify-between sm:justify-center gap-2"
              style={{
                backgroundColor: !state.isInsideDhaka ? primaryColor : inputBg,
                color: !state.isInsideDhaka ? '#FFFFFF' : textColor,
                border: `2px solid ${!state.isInsideDhaka ? primaryColor : inputBorder}`,
              }}
              disabled={fetcher.state !== 'idle'}
            >
              <div className="flex items-center gap-2">
                <Truck size={16} className="flex-shrink-0" />
                <span className="text-sm sm:text-base">{outsideDhakaLabel}</span>
              </div>
              <span 
                className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0"
                style={{ 
                  backgroundColor: !state.isInsideDhaka ? 'rgba(255,255,255,0.2)' : `${primaryColor}20`,
                  color: !state.isInsideDhaka ? '#FFFFFF' : primaryColor,
                }}
              >
                ৳{outsideDhakaCharge}
              </span>
            </button>
          </div>
        )}
        
        {/* Detailed Address */}
        <div>
          <label 
            className="block text-sm font-medium mb-1.5"
            style={{ color: mutedColor }}
          >
            {addressLabel} <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={state.address}
            onChange={(e) => actions.setAddress(e.target.value)}
            placeholder={addressPlaceholder}
            rows={2}
            className="w-full px-5 py-4 rounded-xl font-medium outline-none resize-none transition-all focus:ring-2"
            style={{ 
              backgroundColor: inputBg, 
              border: `2px solid ${inputBorder}`,
              color: inputText,
            }}
            required
            disabled={fetcher.state !== 'idle'}
          />
        </div>
        
        {/* Note (optional) */}
        {showNoteField && (
          <div>
            <label 
              className="block text-sm font-medium mb-1.5"
              style={{ color: mutedColor }}
            >
              {noteLabel}
            </label>
            <textarea
              name="notes"
              value={state.note}
              onChange={(e) => actions.setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={2}
              className="w-full px-5 py-4 rounded-xl font-medium outline-none resize-none transition-all focus:ring-2"
              style={{ 
                backgroundColor: inputBg, 
                border: `2px solid ${inputBorder}`,
                color: inputText,
              }}
              disabled={fetcher.state !== 'idle'}
            />
          </div>
        )}
        
        {/* Warning if no product linked */}
        {!productId && storeId && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm mb-2">
            ⚠️ এই পেজে কোনো প্রোডাক্ট সেট করা হয়নি। Page Builder থেকে প্রোডাক্ট সিলেক্ট করুন।
          </div>
        )}
        
        {/* Order Summary Preview */}
        <div 
          className="p-4 rounded-xl space-y-3"
          style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
            border: `1px solid ${cardBorder}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: cardBorder }}>
            <Package size={16} style={{ color: primaryColor }} />
            <span className="font-semibold text-sm" style={{ color: textColor }}>অর্ডার সামারি</span>
          </div>
          
          {/* Customer Info Preview */}
          {(state.customerName || state.phone) && (
            <div className="space-y-1 pb-2 border-b" style={{ borderColor: cardBorder }}>
              {state.customerName && (
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: mutedColor }}>নাম:</span>
                  <span className="font-medium" style={{ color: textColor }}>{state.customerName}</span>
                </div>
              )}
              {state.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: mutedColor }}>ফোন:</span>
                  <span className="font-medium" style={{ color: textColor }}>{state.phone}</span>
                  {state.phoneError ? (
                    <span className="text-red-500">❌</span>
                  ) : state.phone.length >= 11 && validateBDPhone(state.phone) ? (
                    <span className="text-green-500">✓</span>
                  ) : null}
                </div>
              )}
              {state.selectedDistrictId && (
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: mutedColor }}>এলাকা:</span>
                  <span className="font-medium" style={{ color: textColor }}>
                    {DISTRICTS.find(d => d.id === state.selectedDistrictId)?.name || ''} 
                    {state.selectedUpazilaId && availableUpazilas.find(u => u.id === state.selectedUpazilaId)?.name ? 
                      `, ${availableUpazilas.find(u => u.id === state.selectedUpazilaId)?.name}` : ''}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: mutedColor }}>{subtotalLabel}</span>
              <span className="font-semibold" style={{ color: textColor }}>
                {formatPrice(comboSummary?.discountedSubtotal ?? subtotal)}
              </span>
            </div>
            {comboSummary && comboSummary.savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">🎁 কম্বো ছাড় ({comboSummary.rate}%)</span>
                <span className="text-green-600 font-semibold">-{formatPrice(comboSummary.savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span style={{ color: mutedColor }}>
                {deliveryLabel} 
                <span className="text-xs ml-1">
                  ({calculatedShippingZone === 'dhaka' ? insideDhakaLabel : outsideDhakaLabel})
                </span>
              </span>
              <span className="font-semibold" style={{ color: textColor }}>{formatPrice(deliveryCharge)}</span>
            </div>
            
            {/* Free shipping indicator - using configurable threshold */}
            {props.showFreeShippingProgress !== false && props.freeShippingThreshold && subtotal >= props.freeShippingThreshold && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">🎁 ফ্রি ডেলিভারি ছাড়</span>
                <span className="text-green-600 font-semibold">-{formatPrice(deliveryCharge)}</span>
              </div>
            )}
            
            <div 
              className="flex justify-between pt-2 border-t"
              style={{ borderColor: cardBorder }}
            >
              <span className="font-bold" style={{ color: textColor }}>{totalLabel}</span>
              <span 
                className="font-bold text-xl"
                style={{ color: primaryColor }}
              >
                {formatPrice(props.showFreeShippingProgress !== false && props.freeShippingThreshold && subtotal >= props.freeShippingThreshold ? (comboSummary?.discountedSubtotal ?? subtotal) : (comboSummary?.discountedSubtotal ? comboSummary.discountedSubtotal + deliveryCharge : total))}
              </span>
            </div>
          </div>
          
          {/* Payment Method */}
          <div 
            className="flex items-center justify-center gap-2 pt-2 border-t text-xs"
            style={{ borderColor: cardBorder, color: mutedColor }}
          >
            <span>💵</span>
            <span>ক্যাশ অন ডেলিভারি - ডেলিভারি ম্যানকে টাকা দিবেন</span>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={fetcher.state !== 'idle' || !storeId}
          className="w-full py-5 font-bold text-xl rounded-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          style={{ 
            background: buttonBg,
            color: buttonTextColor,
          }}
        >
          {fetcher.state !== 'idle' ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span>অর্ডার প্রক্রিয়াকরণ হচ্ছে...</span>
            </>
          ) : (
            <>
              {buttonText}
              <ArrowRight size={22} className="animate-pulse" />
            </>
          )}
        </button>
        
        {/* Security Note */}
        <p 
          className="text-center text-xs"
          style={{ color: mutedColor }}
        >
          🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে
        </p>
        
        {/* Trust Badges */}
        {showTrustBadges && (
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ 
                backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#D1FAE5',
                color: '#059669',
              }}
            >
              <ShieldCheck size={14} />
              {secureLabel}
            </div>
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ 
                backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#DBEAFE',
                color: '#2563EB',
              }}
            >
              <Truck size={14} />
              {codLabel}
            </div>
          </div>
        )}
      </fetcher.Form>
    </>
  );
}
