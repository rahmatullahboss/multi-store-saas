/**
 * WhatsApp Configuration Component
 * 
 * Settings for WhatsApp integration on landing pages:
 * - Toggle floating button
 * - Configure phone number
 * - Set pre-filled message template
 */

import { useState } from 'react';
import { MessageCircle, Phone, FileText, Eye, Check } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

interface WhatsAppConfigProps {
  enabled: boolean;
  phoneNumber: string;
  messageTemplate: string;
  onEnabledChange: (enabled: boolean) => void;
  onPhoneChange: (phone: string) => void;
  onMessageChange: (message: string) => void;
}

export function WhatsAppConfig({
  enabled,
  phoneNumber,
  messageTemplate,
  onEnabledChange,
  onPhoneChange,
  onMessageChange,
}: WhatsAppConfigProps) {
  const { lang: language } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add Bangladesh country code if needed
    if (digits.startsWith('01') && digits.length === 11) {
      return `+880${digits.substring(1)}`;
    }
    if (digits.startsWith('880')) {
      return `+${digits}`;
    }
    return phone;
  };

  // Generate WhatsApp link for preview
  const getWhatsAppLink = () => {
    const phone = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(messageTemplate || 'হ্যালো, আমি এই প্রোডাক্ট সম্পর্কে জানতে চাই।');
    return `https://wa.me/${phone.startsWith('880') ? phone : '880' + phone.substring(1)}?text=${message}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">
            {language === 'bn' ? 'WhatsApp সেটিংস' : 'WhatsApp Settings'}
          </h3>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-white' : 'bg-green-400'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
              enabled ? 'translate-x-6 bg-green-600' : 'translate-x-1 bg-white'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className={`p-4 space-y-4 ${!enabled && 'opacity-50 pointer-events-none'}`}>
        {/* Phone Number */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <Phone className="w-4 h-4" />
            {language === 'bn' ? 'WhatsApp নম্বর' : 'WhatsApp Number'}
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="01712345678"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'bn' 
              ? 'বাংলাদেশি নম্বর (যেমন: 01712345678)' 
              : 'Bangladesh number (e.g., 01712345678)'}
          </p>
        </div>

        {/* Message Template */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <FileText className="w-4 h-4" />
            {language === 'bn' ? 'প্রি-ফিল্ড মেসেজ' : 'Pre-filled Message'}
          </label>
          <textarea
            value={messageTemplate}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={language === 'bn' 
              ? 'হ্যালো, আমি এই প্রোডাক্ট সম্পর্কে জানতে চাই।' 
              : 'Hello, I want to know about this product.'}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'bn' 
              ? 'কাস্টমার যখন বাটনে ক্লিক করবে তখন এই মেসেজ অটো-ফিল হবে' 
              : 'This message will be auto-filled when customer clicks the button'}
          </p>
        </div>

        {/* Preview */}
        {phoneNumber && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
            >
              <Eye className="w-4 h-4" />
              {language === 'bn' ? 'প্রিভিউ দেখুন' : 'Show Preview'}
            </button>

            {showPreview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'bn' ? 'লিংক প্রিভিউ:' : 'Link Preview:'}
                </p>
                <div className="flex items-center gap-3">
                  {/* Floating Button Preview */}
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatPhoneNumber(phoneNumber)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {messageTemplate || 'হ্যালো, আমি এই প্রোডাক্ট সম্পর্কে জানতে চাই।'}
                    </p>
                  </div>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                  >
                    {language === 'bn' ? 'টেস্ট করুন' : 'Test'}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {enabled && phoneNumber && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center gap-2 text-sm text-green-700">
          <Check className="w-4 h-4" />
          {language === 'bn' 
            ? 'WhatsApp বাটন আপনার পেজে দেখাবে' 
            : 'WhatsApp button will appear on your page'}
        </div>
      )}
    </div>
  );
}

// Default message templates for different product types
export const WHATSAPP_MESSAGE_TEMPLATES = {
  general: {
    bn: 'হ্যালো, আমি {{product_name}} প্রোডাক্টটি অর্ডার করতে চাই।',
    en: 'Hello, I want to order {{product_name}}.',
  },
  inquiry: {
    bn: 'আসসালামু আলাইকুম, {{product_name}} সম্পর্কে কিছু জানতে চাই। এটা কি available আছে?',
    en: 'Hello, I want to know about {{product_name}}. Is it available?',
  },
  bulk: {
    bn: 'হ্যালো, আমি {{product_name}} বড় পরিমাণে কিনতে চাই। দাম কত হবে?',
    en: 'Hello, I want to buy {{product_name}} in bulk. What would be the price?',
  },
};
