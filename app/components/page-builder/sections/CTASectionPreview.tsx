/**
 * CTA / Order Form Section Preview - Theme-enabled
 */

import type { SectionTheme } from '~/lib/page-builder/types';

interface CTAProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  nameLabel?: string;
  phoneLabel?: string;
  addressLabel?: string;
}

interface CTASectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function CTASectionPreview({ props, theme }: CTASectionPreviewProps) {
  const {
    headline = 'এখনই অর্ডার করুন',
    subheadline = '',
    buttonText = 'অর্ডার কনফার্ম করুন',
    nameLabel = 'আপনার নাম',
    phoneLabel = 'মোবাইল নম্বর',
    addressLabel = 'ঠিকানা',
  } = props as CTAProps;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const getBgStyle = () => {
    if (isDark) {
      return { backgroundColor: theme?.bgColor || '#18181B' };
    }
    if (theme?.style === 'nature') {
      return { background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' };
    }
    if (theme?.style === 'professional') {
      return { background: 'linear-gradient(135deg, #F8F9FA, #E9ECEF)' };
    }
    if (theme?.style === 'urgent') {
      return { background: 'linear-gradient(135deg, #7F1D1D, #450A0A)' };
    }
    return { background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' };
  };
  
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  const textColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const labelColor = isDark ? 'rgba(255,255,255,0.8)' : '#374151';
  const inputBg = isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB';
  const inputText = isDark ? '#FFFFFF' : '#111827';
  const primaryColor = theme?.primaryColor || '#6366F1';
  const buttonBg = theme?.buttonBg || primaryColor;
  const buttonTextColor = theme?.buttonText || '#FFFFFF';
  
  return (
    <section className="py-12 px-6" style={getBgStyle()}>
      <div className="max-w-md mx-auto">
        <div 
          className="rounded-2xl p-6"
          style={{ 
            backgroundColor: cardBg, 
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? 'none' : '0 25px 50px -12px rgba(0,0,0,0.1)',
          }}
        >
          <h2 
            className="text-2xl font-bold text-center mb-2"
            style={{ color: textColor }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p className="text-center mb-6" style={{ color: mutedColor }}>{subheadline}</p>
          )}
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: labelColor }}
              >
                {nameLabel}
              </label>
              <input
                type="text"
                placeholder="আপনার নাম লিখুন"
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{ 
                  backgroundColor: inputBg, 
                  border: `1px solid ${inputBorder}`,
                  color: inputText,
                }}
                disabled
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: labelColor }}
              >
                {phoneLabel}
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{ 
                  backgroundColor: inputBg, 
                  border: `1px solid ${inputBorder}`,
                  color: inputText,
                }}
                disabled
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: labelColor }}
              >
                {addressLabel}
              </label>
              <textarea
                placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                rows={3}
                className="w-full px-4 py-3 rounded-lg outline-none resize-none transition-colors"
                style={{ 
                  backgroundColor: inputBg, 
                  border: `1px solid ${inputBorder}`,
                  color: inputText,
                }}
                disabled
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-4 font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ 
                background: buttonBg,
                color: buttonTextColor,
              }}
            >
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
