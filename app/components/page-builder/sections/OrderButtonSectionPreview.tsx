/**
 * Order Button Section Preview
 * 
 * A placeable CTA button that can be added anywhere on the page.
 * Scrolls to the order form when clicked.
 */

import { ShoppingCart, ArrowDown } from 'lucide-react';
import type { SectionTheme } from '~/lib/page-builder/types';
import { scrollToOrderForm } from '../OrderNowButton';

interface OrderButtonProps {
  text?: string;
  subtext?: string;
  bgColor?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
  fullWidth?: boolean;
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animation?: 'none' | 'pulse' | 'bounce' | 'shake';
  containerPadding?: 'none' | 'sm' | 'md' | 'lg';
}

interface OrderButtonSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function OrderButtonSectionPreview({ props, theme }: OrderButtonSectionPreviewProps) {
  const {
    text = 'এখনই অর্ডার করুন',
    subtext = '',
    bgColor = '#6366F1',
    textColor = '#FFFFFF',
    size = 'lg',
    alignment = 'center',
    fullWidth = false,
    showIcon = true,
    iconPosition = 'right',
    borderRadius = 'lg',
    animation = 'pulse',
    containerPadding = 'md',
  } = props as OrderButtonProps;

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  // Radius classes
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  // Animation classes
  const animationClasses = {
    none: '',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    shake: 'hover:animate-[shake_0.5s_ease-in-out]',
  };

  // Alignment classes
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Padding classes
  const paddingClasses = {
    none: 'py-0',
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12',
  };

  // Icon size based on button size
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };

  const Icon = showIcon ? (
    <ShoppingCart size={iconSizes[size]} />
  ) : null;

  return (
    <section 
      className={`px-6 ${paddingClasses[containerPadding]}`}
      style={{ backgroundColor: theme?.bgColor || 'transparent' }}
    >
      <div className={`max-w-4xl mx-auto flex ${alignmentClasses[alignment]}`}>
        <button
          onClick={scrollToOrderForm}
          className={`
            ${sizeClasses[size]}
            ${radiusClasses[borderRadius]}
            ${animationClasses[animation]}
            ${fullWidth ? 'w-full' : ''}
            font-bold shadow-lg hover:shadow-xl 
            transition-all transform hover:-translate-y-1 
            cursor-pointer inline-flex items-center justify-center gap-3
          `}
          style={{
            backgroundColor: bgColor,
            color: textColor,
          }}
        >
          {iconPosition === 'left' && Icon}
          <div className="flex flex-col items-center">
            <span>{text}</span>
            {subtext && (
              <span className="text-xs opacity-80 font-normal">{subtext}</span>
            )}
          </div>
          {iconPosition === 'right' && Icon}
        </button>
      </div>
    </section>
  );
}

export default OrderButtonSectionPreview;
