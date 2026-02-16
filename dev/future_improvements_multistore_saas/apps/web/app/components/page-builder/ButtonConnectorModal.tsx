/**
 * Button Connector Modal
 * 
 * Detects buttons in HTML and allows users to connect them to backend functionality:
 * - Order Now → Show order form with selected product
 * - Add to Cart → Add product to cart
 * - WhatsApp → Open WhatsApp chat
 * - Call Now → Dial phone number
 */

import { useState, useEffect, useMemo } from 'react';
import { X, Link2, ShoppingCart, Phone, MessageCircle, Package, Check, AlertCircle, Search, Loader2 } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine'
import { useTranslation } from '~/contexts/LanguageContext';

// Button detection patterns (supports English and Bengali)
const BUTTON_PATTERNS = {
  order: [
    'order now', 'order', 'buy now', 'buy', 'purchase', 'get now', 'get it',
    'অর্ডার করুন', 'এখনই অর্ডার', 'কিনুন', 'এখনই কিনুন', 'অর্ডার'
  ],
  cart: [
    'add to cart', 'add to bag', 'add', 'cart',
    'কার্টে যোগ', 'ব্যাগে যোগ', 'কার্ট', 'যোগ করুন'
  ],
  whatsapp: [
    'whatsapp', 'chat', 'message us', 'chat with us', 'contact us',
    'হোয়াটসঅ্যাপ', 'চ্যাট', 'মেসেজ', 'যোগাযোগ'
  ],
  call: [
    'call now', 'call us', 'call', 'phone', 'contact',
    'কল করুন', 'ফোন', 'কল'
  ]
};

type ButtonActionType = 'order' | 'cart' | 'whatsapp' | 'call' | 'unknown';

interface DetectedButton {
  id: string;
  text: string;
  tagName: string;
  type: ButtonActionType;
  selector: string;
  connected: boolean;
  productId?: number;
  phoneNumber?: string;
}

interface Product {
  id: number;
  title: string;
  imageUrl?: string;
  price: number;
  isPublished: boolean;
}

interface ButtonConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  defaultPhoneNumber?: string;
  onApply: (connections: ButtonConnection[]) => void;
}

export interface ButtonConnection {
  selector: string;
  actionType: ButtonActionType;
  productId?: number;
  phoneNumber?: string;
  messageTemplate?: string;
}

export default function ButtonConnectorModal({
  isOpen,
  onClose,
  htmlContent,
  defaultPhoneNumber = '',
  onApply
}: ButtonConnectorModalProps) {
  const { t, lang } = useTranslation();
  
  const [detectedButtons, setDetectedButtons] = useState<DetectedButton[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [whatsappMessage, setWhatsappMessage] = useState(
    lang === 'bn' 
      ? 'হ্যালো, আমি এই প্রোডাক্ট সম্পর্কে জানতে চাই।' 
      : 'Hello, I want to know about this product.'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Detect button type from text
  const detectButtonType = (text: string): ButtonActionType => {
    const lowerText = text.toLowerCase().trim();
    
    for (const pattern of BUTTON_PATTERNS.order) {
      if (lowerText.includes(pattern)) return 'order';
    }
    for (const pattern of BUTTON_PATTERNS.cart) {
      if (lowerText.includes(pattern)) return 'cart';
    }
    for (const pattern of BUTTON_PATTERNS.whatsapp) {
      if (lowerText.includes(pattern)) return 'whatsapp';
    }
    for (const pattern of BUTTON_PATTERNS.call) {
      if (lowerText.includes(pattern)) return 'call';
    }
    
    return 'unknown';
  };

  // Scan HTML for buttons
  useEffect(() => {
    if (!isOpen || !htmlContent) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Find all buttons, anchors, and floating action elements
      // Extended selectors to catch floating WhatsApp, call buttons, etc.
      const elements = doc.querySelectorAll(
        'button, a, [role="button"], .btn, [class*="button"], ' +
        '.whatsapp-link, [data-whatsapp], a[href*="wa.me"], a[href*="whatsapp"], ' +
        'a[href^="tel:"], .floating-btn, [class*="floating"], [class*="whatsapp"], ' +
        '[class*="call-btn"], [class*="order-btn"], [data-action]'
      );
      const buttons: DetectedButton[] = [];
      
      elements.forEach((el, index) => {
        const text = el.textContent?.trim() || '';
        if (!text || text.length > 50) return; // Skip empty or very long text
        
        const tagName = el.tagName.toLowerCase();
        
        // Check for existing connections
        const existingAction = el.getAttribute('data-ozzyl-action') as ButtonActionType | null;
        const existingProduct = el.getAttribute('data-ozzyl-product');
        const existingPhone = el.getAttribute('data-ozzyl-phone');
        
        const type = existingAction || detectButtonType(text);
        
        // Generate a selector
        let selector = '';
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ').filter(c => c && !c.includes(':') && !c.includes('[') && !c.includes(']'));
          if (classes.length > 0) {
            selector = `${tagName}.${classes.slice(0, 2).join('.')}`;
          }
        }
        if (!selector) {
          selector = `${tagName}:nth-of-type(${index + 1})`;
        }
        
        buttons.push({
          id: `btn-${index}`,
          text,
          tagName,
          type,
          selector,
          connected: !!existingAction,
          productId: existingProduct ? parseInt(existingProduct) : undefined,
          phoneNumber: existingPhone || undefined
        });
      });

      setDetectedButtons(buttons);
    } catch (err) {
      console.error('Failed to parse HTML:', err);
      setError(lang === 'bn' ? 'HTML পার্স করতে সমস্যা হয়েছে' : 'Failed to parse HTML');
    }
  }, [isOpen, htmlContent, lang]);

  // Fetch products
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch('/api/bootstrap');
        const data = await response.json() as { products?: Product[] };
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, [isOpen]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => p.title.toLowerCase().includes(query));
  }, [products, searchQuery]);

  // Update button connection
  const updateButton = (buttonId: string, updates: Partial<DetectedButton>) => {
    setDetectedButtons(prev => 
      prev.map(btn => 
        btn.id === buttonId 
          ? { ...btn, ...updates, connected: true }
          : btn
      )
    );
  };

  // Get icon for button type
  const getTypeIcon = (type: ButtonActionType) => {
    switch (type) {
      case 'order': return <Package size={14} className="text-emerald-500" />;
      case 'cart': return <ShoppingCart size={14} className="text-blue-500" />;
      case 'whatsapp': return <MessageCircle size={14} className="text-green-500" />;
      case 'call': return <Phone size={14} className="text-orange-500" />;
      default: return <Link2 size={14} className="text-gray-400" />;
    }
  };

  // Get label for button type
  const getTypeLabel = (type: ButtonActionType) => {
    switch (type) {
      case 'order': return lang === 'bn' ? 'অর্ডার' : 'Order';
      case 'cart': return lang === 'bn' ? 'কার্ট' : 'Cart';
      case 'whatsapp': return 'WhatsApp';
      case 'call': return lang === 'bn' ? 'কল' : 'Call';
      default: return lang === 'bn' ? 'অজানা' : 'Unknown';
    }
  };

  // Handle apply
  const handleApply = () => {
    const connections: ButtonConnection[] = detectedButtons
      .filter(btn => btn.connected && btn.type !== 'unknown')
      .map(btn => ({
        selector: btn.selector,
        actionType: btn.type,
        productId: btn.productId,
        phoneNumber: btn.phoneNumber || phoneNumber,
        messageTemplate: whatsappMessage
      }));
    
    onApply(connections);
    onClose();
  };

  const connectedCount = detectedButtons.filter(b => b.connected).length;
  const orderCartButtons = detectedButtons.filter(b => b.type === 'order' || b.type === 'cart');
  const phoneButtons = detectedButtons.filter(b => b.type === 'whatsapp' || b.type === 'call');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Link2 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {lang === 'bn' ? 'বাটন কানেক্টর' : 'Connect with Backend'}
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'bn' 
                  ? `${detectedButtons.length}টি বাটন পাওয়া গেছে` 
                  : `${detectedButtons.length} buttons detected`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {detectedButtons.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 size={24} className="text-gray-300" />
              </div>
              <h4 className="text-gray-900 font-bold mb-2">
                {lang === 'bn' ? 'কোনো বাটন পাওয়া যায়নি' : 'No Buttons Detected'}
              </h4>
              <p className="text-gray-500 text-sm">
                {lang === 'bn' 
                  ? 'আপনার HTML এ button বা link element যোগ করুন' 
                  : 'Add button or link elements to your HTML'}
              </p>
            </div>
          ) : (
            <>
              {/* Order/Cart Buttons Section */}
              {orderCartButtons.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Package size={14} />
                    {lang === 'bn' ? 'অর্ডার / কার্ট বাটন' : 'Order / Cart Buttons'}
                  </h4>
                  
                  {/* Product Selector */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === 'bn' ? 'প্রোডাক্ট খুঁজুন...' : 'Search products...'}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                  
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-indigo-500" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orderCartButtons.map(btn => (
                        <div key={btn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getTypeIcon(btn.type)}
                            <span className="font-medium text-gray-900 truncate">{btn.text}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-white rounded-full text-gray-500 border">
                              &lt;{btn.tagName}&gt;
                            </span>
                          </div>
                          <select
                            value={btn.productId || ''}
                            onChange={(e) => updateButton(btn.id, { productId: parseInt(e.target.value) })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-[200px]"
                          >
                            <option value="">{lang === 'bn' ? 'প্রোডাক্ট সিলেক্ট করুন' : 'Select Product'}</option>
                            {filteredProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.title} - {formatPrice(p.price)}
                              </option>
                            ))}
                          </select>
                          {btn.connected && (
                            <Check size={16} className="text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp/Call Buttons Section */}
              {phoneButtons.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} />
                    {lang === 'bn' ? 'WhatsApp / কল বাটন' : 'WhatsApp / Call Buttons'}
                  </h4>
                  
                  {/* Phone Number Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      {lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="01712345678"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                  
                  {/* WhatsApp Message (only if whatsapp buttons exist) */}
                  {phoneButtons.some(b => b.type === 'whatsapp') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        {lang === 'bn' ? 'WhatsApp মেসেজ টেমপ্লেট' : 'WhatsApp Message Template'}
                      </label>
                      <textarea
                        value={whatsappMessage}
                        onChange={(e) => setWhatsappMessage(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-sm resize-none"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {phoneButtons.map(btn => (
                      <div key={btn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getTypeIcon(btn.type)}
                          <span className="font-medium text-gray-900 truncate">{btn.text}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-white rounded-full text-gray-500 border">
                            {getTypeLabel(btn.type)}
                          </span>
                        </div>
                        <button
                          onClick={() => updateButton(btn.id, { phoneNumber })}
                          disabled={!phoneNumber}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                            btn.connected 
                              ? 'bg-emerald-100 text-emerald-700'
                              : phoneNumber 
                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {btn.connected 
                            ? (lang === 'bn' ? 'কানেক্টেড ✓' : 'Connected ✓')
                            : (lang === 'bn' ? 'কানেক্ট করুন' : 'Connect')
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unknown Buttons */}
              {detectedButtons.filter(b => b.type === 'unknown').length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle size={14} />
                    {lang === 'bn' ? 'অচেনা বাটন (ম্যানুয়ালি টাইপ সেট করুন)' : 'Unknown Buttons (Set type manually)'}
                  </h4>
                  <div className="space-y-2">
                    {detectedButtons.filter(b => b.type === 'unknown').map(btn => (
                      <div key={btn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-medium text-gray-900 truncate flex-1">{btn.text}</span>
                        <select
                          value={btn.type}
                          onChange={(e) => updateButton(btn.id, { type: e.target.value as ButtonActionType })}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="unknown">{lang === 'bn' ? 'টাইপ সিলেক্ট করুন' : 'Select Type'}</option>
                          <option value="order">{lang === 'bn' ? 'অর্ডার' : 'Order'}</option>
                          <option value="cart">{lang === 'bn' ? 'কার্ট' : 'Cart'}</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="call">{lang === 'bn' ? 'কল' : 'Call'}</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {connectedCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" />
                {lang === 'bn' 
                  ? `${connectedCount}টি বাটন কানেক্ট করা হয়েছে`
                  : `${connectedCount} button(s) connected`
                }
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button 
              onClick={handleApply}
              disabled={connectedCount === 0}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Link2 size={16} />
              {lang === 'bn' ? 'কানেকশন প্রয়োগ করুন' : 'Apply Connections'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
