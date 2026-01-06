/**
 * WhatsApp Floating Button Component
 * 
 * Shows a floating WhatsApp button on the bottom-right corner of the storefront.
 * When clicked, opens WhatsApp chat with the store's number.
 * 
 * Bangladesh-focused: Most SMEs communicate with customers via WhatsApp.
 */

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string; // WhatsApp number (e.g., "+8801712345678" or "01712345678")
  message?: string; // Pre-filled message (optional)
  storeName?: string; // Used in default message
  showTooltip?: boolean;
}

export function WhatsAppButton({ 
  phoneNumber, 
  message, 
  storeName = 'Store',
  showTooltip = true 
}: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  
  // Animate in after page load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Hide bubble after first interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 10000);
    return () => clearTimeout(timer);
  }, []);
  
  // Format phone number for WhatsApp (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Add Bangladesh country code if not present
    if (cleaned.startsWith('01')) {
      cleaned = '+880' + cleaned.substring(1);
    } else if (cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '+880' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };
  
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  
  // Default message in Bengali
  const defaultMessage = message || `আসসালামু আলাইকুম! আমি ${storeName} থেকে কিছু কিনতে চাই।`;
  
  // WhatsApp click-to-chat URL
  const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(defaultMessage)}`;
  
  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  if (!phoneNumber) return null;
  
  return (
    <>
      {/* Floating WhatsApp Button */}
      <div 
        className={`fixed bottom-6 right-6 z-50 flex items-end gap-3 transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        {/* Chat Bubble */}
        {showBubble && showTooltip && (
          <div className="relative animate-float hidden sm:block">
            <div className="bg-white rounded-2xl shadow-xl p-4 pr-8 max-w-[200px] border border-gray-100">
              <button
                onClick={() => setShowBubble(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-700 font-medium">
                👋 হ্যালো! কোন প্রশ্ন আছে? আমাদের মেসেজ করুন!
              </p>
            </div>
            {/* Tail */}
            <div className="absolute bottom-3 -right-2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100" />
          </div>
        )}
        
        {/* WhatsApp Button */}
        <button
          onClick={handleClick}
          className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Chat on WhatsApp"
        >
          {/* Ripple effect */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          
          {/* WhatsApp Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="w-7 h-7 sm:w-8 sm:h-8 fill-white"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
          
          {/* Tooltip on hover */}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            WhatsApp এ মেসেজ করুন
          </span>
        </button>
      </div>
      
      {/* Keyframe animation for floating effect */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
