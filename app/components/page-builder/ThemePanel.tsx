import { useState, useEffect } from 'react';
import { Palette, Type } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
}

interface ThemePanelProps {
  config: ThemeConfig;
  onChange: (newConfig: ThemeConfig) => void;
}

const FONTS = [
  // Bengali Fonts
  { name: 'Hind Siliguri (Standard)', value: 'Hind Siliguri' },
  { name: 'Noto Sans Bengali', value: 'Noto Sans Bengali' },
  { name: 'Galada (Stylish)', value: 'Galada' },
  { name: 'Tiro Bangla (Serif)', value: 'Tiro Bangla' },
  { name: 'Mina', value: 'Mina' },
  { name: 'Atma (Playful)', value: 'Atma' },
  // English Fonts
  { name: 'Inter (Modern)', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Oswald (Bold)', value: 'Oswald' },
  { name: 'Playfair Display (Serif)', value: 'Playfair Display' },
];

export default function ThemePanel({ config, onChange }: ThemePanelProps) {
  const { t } = useTranslation();
  const handleChange = (key: keyof ThemeConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{t('globalTheme')}</h3>
        <p className="text-[10px] text-gray-400">{t('globalThemeDesc')}</p>
      </div>

      {/* Colors Section */}
      <div className="space-y-4 mb-8">
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase border-b pb-2">
          <Palette size={12} className="text-primary" />
          {t('brandColors')}
        </h4>
        
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-5">
          <div className="flex flex-col gap-3">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('primaryColor')}</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg shadow-primary/20 appearance-none bg-transparent overflow-hidden transition-transform active:scale-95"
                title={t('pickPrimaryColor')}
              />
              <div className="flex-1">
                <input 
                  type="text" 
                  value={config.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 font-mono uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all shadow-sm"
                  placeholder="#059669"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('secondaryColor')}</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-lg shadow-secondary/20 appearance-none bg-transparent overflow-hidden transition-transform active:scale-95"
                title={t('pickSecondaryColor')}
              />
              <div className="flex-1">
                <input 
                  type="text" 
                  value={config.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 font-mono uppercase focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none bg-white transition-all shadow-sm"
                  placeholder="#2563eb"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase border-b pb-2">
          <Type size={12} className="text-purple-500" />
          {t('typography')}
        </h4>
        
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">{t('headingFont')}</label>
            <select 
              value={config.fontHeading}
              onChange={(e) => handleChange('fontHeading', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none bg-white font-medium"
            >
              {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">{t('bodyFont')}</label>
            <select 
              value={config.fontBody}
              onChange={(e) => handleChange('fontBody', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none bg-white font-medium"
            >
              {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-8 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-[10px] text-blue-700 leading-relaxed">
          {t('themeNote')}
        </p>
      </div>
    </div>
  );
}
