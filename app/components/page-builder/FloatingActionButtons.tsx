/**
 * Floating Action Buttons Component
 * 
 * Renders floating WhatsApp, Call, and Order Now buttons on the page.
 * These buttons stick to the bottom of the screen for easy access.
 * Layout: WhatsApp/Call vertical on top, Order button at bottom.
 */

import { Phone, MessageCircle, ShoppingCart } from 'lucide-react';
import { scrollToOrderForm } from './OrderNowButton';

interface FloatingActionButtonsProps {
  /** WhatsApp settings */
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  
  /** Call settings */
  callEnabled?: boolean;
  callNumber?: string;
  
  /** Order button settings */
  orderEnabled?: boolean;
  orderText?: string;
  
  /** Custom colors */
  whatsappColor?: string;
  callColor?: string;
  orderColor?: string;
  
  /** Position */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function FloatingActionButtons({
  whatsappEnabled = true,
  whatsappNumber = '',
  whatsappMessage = 'হ্যালো! আমি অর্ডার করতে চাই।',
  callEnabled = true,
  callNumber = '',
  orderEnabled = true,
  orderText = 'অর্ডার করুন',
  whatsappColor = '#25D366',
  callColor = '#3B82F6',
  orderColor = '#6366F1',
  position = 'bottom-right',
}: FloatingActionButtonsProps) {
  // Build WhatsApp URL
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : '';
  
  // Build Call URL
  const callUrl = callNumber ? `tel:${callNumber.replace(/[^0-9+]/g, '')}` : '';
  
  // Position classes
  const positionClasses = {
    'bottom-right': 'right-4',
    'bottom-left': 'left-4',
    'bottom-center': 'left-1/2 -translate-x-1/2',
  };
  
  // Check if any button is enabled
  const hasButtons = (whatsappEnabled && whatsappNumber) || (callEnabled && callNumber) || orderEnabled;
  
  if (!hasButtons) return null;
  
  return (
    <div 
      className={`fixed bottom-4 ${positionClasses[position]} z-50 flex flex-col items-end gap-2`}
      style={{ 
        // Add safe area inset for mobile
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* WhatsApp/Call buttons vertically stacked on top */}
      <div className="flex flex-col items-center gap-2">
        {/* Call Button */}
        {callEnabled && callNumber && (
          <a
            href={callUrl}
            className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
            style={{ backgroundColor: callColor }}
            title="Call"
          >
            <Phone className="w-6 h-6 text-white" />
          </a>
        )}
        
        {/* WhatsApp Button */}
        {whatsappEnabled && whatsappNumber && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
            style={{ backgroundColor: whatsappColor }}
            title="WhatsApp"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </a>
        )}
      </div>
      
      {/* Order Now Button - at bottom */}
      {orderEnabled && (
        <button
          onClick={scrollToOrderForm}
          className="flex items-center gap-2 px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 font-bold text-white animate-pulse"
          style={{ backgroundColor: orderColor }}
          title="Order Now"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{orderText}</span>
        </button>
      )}
    </div>
  );
}

export default FloatingActionButtons;

