/**
 * Floating Action Buttons - WhatsApp and Call buttons
 * 
 * Shared component for all templates to ensure consistent behavior and positioning.
 * - On mobile: Buttons above sticky order bar (bottom-28 = 112px)
 * - On desktop: Buttons at bottom right (bottom-12 = 48px) - more space from content
 * - Call button appears above WhatsApp button
 * 
 * Usage: Just pass whatsappEnabled/callEnabled from LandingConfig
 * All new templates automatically get FloatingButtons when these config options are set
 */

import { Phone } from 'lucide-react';
import { WhatsAppIcon } from '~/components/icons/WhatsAppIcon';

interface FloatingButtonsProps {
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  callEnabled?: boolean;
  callNumber?: string;
  productTitle?: string;
}

export function FloatingButtons({
  whatsappEnabled,
  whatsappNumber,
  whatsappMessage,
  callEnabled,
  callNumber,
  productTitle = 'your product',
}: FloatingButtonsProps) {
  const hasWhatsApp = whatsappEnabled && whatsappNumber;
  const hasCall = callEnabled && callNumber;
  
  if (!hasWhatsApp && !hasCall) return null;

  // Mobile: bottom-28 (112px) above sticky order bar (~80px)
  // Desktop: bottom-12 (48px) for more spacing from content
  // Call button is 56px (w-14) + 8px gap above WhatsApp
  
  return (
    <>
      {/* Call Button - Always above WhatsApp */}
      {hasCall && (
        <a
          href={`tel:${callNumber}`}
          className={`fixed z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 animate-pulse right-4 ${
            hasWhatsApp 
              ? 'bottom-[176px] md:bottom-[120px]'  // Above WhatsApp (112+64=176 mobile, 48+72=120 desktop - 16px gap)
              : 'bottom-28 md:bottom-12'             // Base position if no WhatsApp
          }`}
          title="কল করুন"
        >
          <Phone className="w-7 h-7 text-white" />
        </a>
      )}

      {/* WhatsApp Button - Base position above order bar */}
      {hasWhatsApp && (
        <a
          href={`https://wa.me/${whatsappNumber!.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            whatsappMessage || `Hi, I'm interested in ${productTitle}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-28 md:bottom-12 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          title="Chat on WhatsApp"
        >
          <WhatsAppIcon className="w-7 h-7 text-white" />
        </a>
      )}
    </>
  );
}

export default FloatingButtons;
