/**
 * Benefits Section Preview - Theme-enabled
 */

import type { SectionTheme } from '~/lib/page-builder/types';

interface BenefitsProps {
  title?: string;
  subtitle?: string;
  benefits?: Array<{ icon?: string; title: string; description?: string }>;
}

interface BenefitsSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function BenefitsSectionPreview({ props, theme }: BenefitsSectionPreviewProps) {
  const { 
    title = 'কেন আমাদের থেকে কিনবেন?',
    subtitle = '',
    benefits = [] 
  } = props as BenefitsProps;
  
  const defaultBenefits = [
    { icon: '✓', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের পণ্য' },
    { icon: '✓', title: 'দ্রুত ডেলিভারি', description: 'সারাদেশে দ্রুত পৌঁছে যাবে' },
    { icon: '✓', title: 'মানি ব্যাক গ্যারান্টি', description: 'সন্তুষ্ট না হলে টাকা ফেরত' },
  ];
  
  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const getBgStyle = () => {
    if (isDark) {
      return { backgroundColor: theme?.bgColor || '#18181B' };
    }
    if (theme?.style === 'nature') {
      return { background: 'linear-gradient(to bottom, #F0FDF4, #FFFFFF)' };
    }
    if (theme?.style === 'professional') {
      return { background: 'linear-gradient(to bottom, #F8F9FA, #FFFFFF)' };
    }
    if (theme?.style === 'minimal') {
      return { background: 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)' };
    }
    return { background: 'linear-gradient(to bottom, #F0FDF4, #FFFFFF)' };
  };
  
  const textColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : (theme?.mutedTextColor || '#6B7280');
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#D1FAE5');
  const iconBg = theme?.primaryColor || '#10B981';
  
  return (
    <section className="py-12 px-4" style={getBgStyle()}>
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-2"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p 
            className="text-center mb-10"
            style={{ color: mutedColor }}
          >
            {subtitle}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBenefits.map((benefit, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center text-center p-6 rounded-2xl transition-transform hover:-translate-y-1"
              style={{ 
                backgroundColor: cardBg, 
                border: `1px solid ${cardBorder}`,
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: iconBg }}
              >
                <span className="text-2xl text-white">{benefit.icon || '✓'}</span>
              </div>
              <h3 
                className="font-semibold text-lg mb-2"
                style={{ color: textColor }}
              >
                {benefit.title}
              </h3>
              {benefit.description && (
                <p style={{ color: mutedColor }}>{benefit.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
