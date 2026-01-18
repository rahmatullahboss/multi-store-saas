/**
 * Scroll to Order Form Utility
 * 
 * Reusable function and button component for scrolling to the order form section.
 * Can be used from any section or component in the page builder.
 */

/**
 * Scrolls to the order form section with smooth animation
 */
export function scrollToOrderForm() {
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Props for OrderNowButton component
 */
interface OrderNowButtonProps {
  /** Button text - default: "অর্ডার করুন" */
  text?: string;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class names */
  className?: string;
  /** Custom background color */
  bgColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Show arrow icon */
  showArrow?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Reusable Order Now Button
 * 
 * Place this anywhere and it will scroll to the order form on click.
 */
export function OrderNowButton({
  text = 'অর্ডার করুন',
  variant = 'primary',
  size = 'md',
  className = '',
  bgColor,
  textColor,
  showArrow = true,
  fullWidth = false,
}: OrderNowButtonProps) {
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: bgColor || '#6366F1',
          color: textColor || '#FFFFFF',
        };
      case 'secondary':
        return {
          background: bgColor || '#F3F4F6',
          color: textColor || '#374151',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: textColor || '#6366F1',
          border: `2px solid ${bgColor || '#6366F1'}`,
        };
      case 'gradient':
        return {
          background: bgColor || 'linear-gradient(to right, #6366F1, #8B5CF6)',
          color: textColor || '#FFFFFF',
        };
      default:
        return {
          background: bgColor || '#6366F1',
          color: textColor || '#FFFFFF',
        };
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToOrderForm}
      className={`
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        font-bold rounded-xl shadow-lg hover:shadow-xl 
        transition-all transform hover:-translate-y-1 
        cursor-pointer inline-flex items-center justify-center gap-2
        ${className}
      `}
      style={getVariantStyles()}
    >
      {text}
      {showArrow && (
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      )}
    </button>
  );
}

export default OrderNowButton;
