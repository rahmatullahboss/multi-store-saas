/**
 * Floating Button Settings Panel
 * 
 * Allows users to configure floating WhatsApp, Call, and Order buttons
 * for the page builder.
 */

import { useState } from 'react';
import { X, MessageCircle, Phone, ShoppingCart, MapPin } from 'lucide-react';

interface FloatingButtonSettings {
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  callEnabled: boolean;
  callNumber: string;
  orderEnabled: boolean;
  orderText: string;
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

interface FloatingButtonSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FloatingButtonSettings;
  onSave: (settings: FloatingButtonSettings) => void;
}

export function FloatingButtonSettingsPanel({
  isOpen,
  onClose,
  settings,
  onSave,
}: FloatingButtonSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<FloatingButtonSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateSetting = <K extends keyof FloatingButtonSettings>(
    key: K,
    value: FloatingButtonSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">ফ্লোটিং বাটন সেটিংস</h3>
            <p className="text-xs text-gray-500">Floating Button Settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* WhatsApp Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">WhatsApp</h4>
                  <p className="text-xs text-gray-500">হোয়াটসঅ্যাপ বাটন</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.whatsappEnabled}
                  onChange={(e) => updateSetting('whatsappEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            
            {localSettings.whatsappEnabled && (
              <div className="ml-10 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    নম্বর (Phone Number)
                  </label>
                  <input
                    type="text"
                    value={localSettings.whatsappNumber}
                    onChange={(e) => updateSetting('whatsappNumber', e.target.value)}
                    placeholder="8801712345678"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-100 focus:border-green-300 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">দেশের কোড সহ লিখুন (880...)</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ডিফল্ট মেসেজ
                  </label>
                  <textarea
                    value={localSettings.whatsappMessage}
                    onChange={(e) => updateSetting('whatsappMessage', e.target.value)}
                    placeholder="হ্যালো! আমি অর্ডার করতে চাই।"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-100 focus:border-green-300 outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Call Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">কল বাটন</h4>
                  <p className="text-xs text-gray-500">Call Button</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.callEnabled}
                  onChange={(e) => updateSetting('callEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            {localSettings.callEnabled && (
              <div className="ml-10">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  ফোন নম্বর
                </label>
                <input
                  type="text"
                  value={localSettings.callNumber}
                  onChange={(e) => updateSetting('callNumber', e.target.value)}
                  placeholder="+8801712345678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Order Button Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">অর্ডার বাটন</h4>
                  <p className="text-xs text-gray-500">Order Now Button</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.orderEnabled}
                  onChange={(e) => updateSetting('orderEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            
            {localSettings.orderEnabled && (
              <div className="ml-10">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  বাটন টেক্সট
                </label>
                <input
                  type="text"
                  value={localSettings.orderText}
                  onChange={(e) => updateSetting('orderText', e.target.value)}
                  placeholder="অর্ডার করুন"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Position Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">পজিশন</h4>
                <p className="text-xs text-gray-500">Button Position</p>
              </div>
            </div>
            
            <div className="ml-10 grid grid-cols-3 gap-2">
              {[
                { value: 'bottom-left' as const, label: 'বাম', labelEn: 'Left' },
                { value: 'bottom-center' as const, label: 'মাঝে', labelEn: 'Center' },
                { value: 'bottom-right' as const, label: 'ডান', labelEn: 'Right' },
              ].map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => updateSetting('position', pos.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    localSettings.position === pos.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800">{pos.label}</div>
                  <div className="text-xs text-gray-500">{pos.labelEn}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            সেভ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloatingButtonSettingsPanel;
