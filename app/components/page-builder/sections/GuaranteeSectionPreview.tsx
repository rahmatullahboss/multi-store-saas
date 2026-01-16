/**
 * Guarantee Section Preview - Theme-enabled
 */

import { ShieldCheck } from 'lucide-react';
import type { SectionTheme } from '~/lib/page-builder/types';

interface GuaranteeProps {
  title?: string;
  text?: string;
  badgeLabel?: string;
}

interface GuaranteeSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function GuaranteeSectionPreview({ props, theme }: GuaranteeSectionPreviewProps) {
  const {
    title = 'আমাদের গ্যারান্টি',
    text = '১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।',
    badgeLabel = '',
  } = props as GuaranteeProps;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const getBgStyle = () => {
    if (isDark) {
      return { 
        background: `linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))`,
        backgroundColor: theme?.bgColor || '#18181B',
      };
    }
    if (theme?.style === 'nature') {
      return { background: 'linear-gradient(135deg, #DCFCE7, #F0FDF4)' };
    }
    return { background: 'linear-gradient(135deg, #D1FAE5, #ECFDF5)' };
  };
  
  const textColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.8)' : (theme?.mutedTextColor || '#374151');
  const iconBg = isDark ? 'rgba(16,185,129,0.2)' : (theme?.style === 'nature' ? '#DCFCE7' : '#D1FAE5');
  const iconColor = theme?.primaryColor || '#10B981';
  const badgeBg = isDark ? 'rgba(16,185,129,0.3)' : '#D1FAE5';
  const badgeText = isDark ? '#10B981' : '#065F46';
  
  return (
    <section className="py-12 px-6" style={getBgStyle()}>
      <div className="max-w-2xl mx-auto text-center">
        <div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{ backgroundColor: iconBg }}
        >
          <ShieldCheck size={32} style={{ color: iconColor }} />
        </div>
        
        {title && (
          <h2 
            className="text-2xl font-bold mb-3"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        )}
        
        {text && (
          <p 
            className="text-lg mb-4"
            style={{ color: mutedColor }}
          >
            {text}
          </p>
        )}
        
        {badgeLabel && (
          <span 
            className="inline-block px-4 py-2 font-medium rounded-full text-sm"
            style={{ backgroundColor: badgeBg, color: badgeText }}
          >
            {badgeLabel}
          </span>
        )}
      </div>
    </section>
  );
}
