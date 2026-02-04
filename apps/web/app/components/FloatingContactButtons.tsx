/**
 * Floating Contact Buttons Component
 * 
 * Reusable component for WhatsApp and Call floating buttons
 * Used in store templates when enabled in settings
 */
import { Phone, MessageCircle } from 'lucide-react';

interface FloatingContactButtonsProps {
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  callEnabled?: boolean;
  callNumber?: string;
  storeName?: string;
  bottomOffset?: string; // For mobile with sticky footer
}

export function FloatingContactButtons({
  whatsappEnabled,
  whatsappNumber,
  callEnabled,
  callNumber,
  whatsappMessage,
  storeName = 'Store',
  bottomOffset = 'bottom-20 md:bottom-8',
}: FloatingContactButtonsProps) {
  // Format WhatsApp number (remove any spaces or dashes)
  const formatWhatsAppNumber = (num: string) => {
    // Remove all non-digits
    let cleaned = num.replace(/\D/g, '');
    // Add Bangladesh country code if not present
    if (cleaned.startsWith('01')) {
      cleaned = '88' + cleaned;
    }
    return cleaned;
  };

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${formatWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(whatsappMessage || `হ্যালো ${storeName}, আমি আপনার প্রোডাক্ট সম্পর্কে জানতে চাই।`)}`
    : '';

  const phoneLink = callNumber ? `tel:${callNumber}` : '';

  // Backward compatibility:
  // - explicit false => disabled
  // - true/undefined + number => enabled
  const hasWhatsApp = Boolean(whatsappNumber) && whatsappEnabled !== false;
  const hasCall = Boolean(callNumber) && callEnabled !== false;

  // Don't render if no buttons are enabled
  if (!(hasWhatsApp || hasCall)) {
    return null;
  }

  return (
    <>
      {/* WhatsApp Floating Button */}
      {hasWhatsApp && whatsappNumber && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed ${bottomOffset} right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
          title="WhatsApp এ মেসেজ করুন"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          {/* Pulse animation ring */}
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
        </a>
      )}

      {/* Call Floating Button */}
      {hasCall && callNumber && (
        <a
          href={phoneLink}
          className={`fixed ${bottomOffset} ${hasWhatsApp ? 'right-20' : 'right-4'} z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110`}
          title="কল করুন"
          aria-label="Call Us"
        >
          <Phone className="w-7 h-7 text-white" />
          {/* Pulse animation ring */}
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
        </a>
      )}
    </>
  );
}
