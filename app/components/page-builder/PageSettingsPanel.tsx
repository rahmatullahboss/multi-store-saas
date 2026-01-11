import { useState, useEffect } from 'react';
import { Settings2, Phone, ShoppingBag, Timer, Users, MessageSquare } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

interface PageConfig {
  featuredProductId?: number;
  featuredProductName?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  timerEndDate?: string;
  socialProofCount?: number;
  socialProofText?: string;
}

interface PageSettingsPanelProps {
  config: PageConfig;
  onChange: (newConfig: PageConfig) => void;
}

export default function PageSettingsPanel({ config, onChange }: PageSettingsPanelProps) {
  const { t, lang } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json() as { products: any[] };
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleChange = (key: keyof PageConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      onChange({
        ...config,
        featuredProductId: product.id,
        featuredProductName: product.title
      });
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar animate-in slide-in-from-right-4 duration-300 bg-white">
      <div className="mb-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{t('pageSettings')}</h3>
        <p className="text-[10px] text-gray-400">{t('pageSettingsDesc')}</p>
      </div>

      {/* Featured Product Section */}
      <div className="space-y-4 mb-8">
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase border-b pb-2">
          <ShoppingBag size={12} className="text-blue-500" />
          {t('featuredProduct')}
        </h4>
        
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('selectProduct')}</label>
            <select
              value={config.featuredProductId || ''}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all shadow-sm"
              disabled={loading}
            >
              <option value="">{t('chooseProduct')}</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.title}</option>
              ))}
            </select>
            {loading && <p className="text-[9px] text-gray-400 animate-pulse">{t('loadingProducts')}</p>}
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-[10px] text-blue-700 leading-relaxed italic">
              {t('smartBlockTip')}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-4 mb-8">
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase border-b pb-2">
          <MessageSquare size={12} className="text-emerald-500" />
          {t('whatsappConfig')}
        </h4>
        
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('phoneNumber')}</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={config.whatsappNumber || ''}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-gray-600 focus:ring-2 focus:ring-emerald-100 outline-none bg-white transition-all shadow-sm"
                placeholder="017XXXXXXXX"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('defaultMessage')}</label>
            <textarea
              value={config.whatsappMessage || ''}
              onChange={(e) => handleChange('whatsappMessage', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 focus:ring-2 focus:ring-emerald-100 outline-none bg-white transition-all shadow-sm min-h-[80px]"
              placeholder={t('whatsappPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* Conversion Tools */}
      <div className="space-y-4 mb-8">
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase border-b pb-2">
          <Timer size={12} className="text-orange-500" />
          {t('conversionTools')}
        </h4>
        
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('offerEndDate')}</label>
            <input
              type="datetime-local"
              value={config.timerEndDate || ''}
              onChange={(e) => handleChange('timerEndDate', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 focus:ring-2 focus:ring-orange-100 outline-none bg-white transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('socialProofCountLabel')}</label>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{config.socialProofCount || 0}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="5"
              value={config.socialProofCount || 0}
              onChange={(e) => handleChange('socialProofCount', parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <p className="text-[9px] text-gray-400 italic">{t('socialProofHint')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
