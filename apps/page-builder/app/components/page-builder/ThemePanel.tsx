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
        
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <p className="text-[10px] text-gray-400 italic">These colors are available globally in the editor.</p>

          {/* Primary Color */}
          <div className="flex flex-col gap-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">{t('primaryColor')}</label>
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <input 
                type="color" 
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm appearance-none bg-transparent overflow-hidden"
              />
              <div className="flex-1">
                <input 
                  type="text" 
                  value={config.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-full text-xs font-mono bg-transparent border-none focus:ring-0 text-gray-700 uppercase p-0"
                />
                <span className="text-[9px] text-gray-400">Main brand color (Buttons, Highlights)</span>
              </div>
            </div>
          </div>

          {/* Secondary Color */}
          <div className="flex flex-col gap-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">{t('secondaryColor')}</label>
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <input 
                type="color" 
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm appearance-none bg-transparent overflow-hidden"
              />
              <div className="flex-1">
                <input 
                  type="text" 
                  value={config.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-full text-xs font-mono bg-transparent border-none focus:ring-0 text-gray-700 uppercase p-0"
                />
                 <span className="text-[9px] text-gray-400">Accent color (Borders, Secondary Actions)</span>
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
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <p className="text-[10px] text-gray-400 italic">Set global fonts for consistent typography.</p>
          
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">{t('headingFont')}</label>
            <div className="relative">
                <select 
                value={config.fontHeading}
                onChange={(e) => handleChange('fontHeading', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none bg-gray-50 font-medium appearance-none"
                style={{ fontFamily: config.fontHeading }}
                >
                {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</div>
            </div>
             <span className="text-[9px] text-gray-400 mt-1 block">Applied to H1, H2, H3, H4, H5, H6</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">{t('bodyFont')}</label>
            <div className="relative">
                <select 
                value={config.fontBody}
                onChange={(e) => handleChange('fontBody', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none bg-gray-50 font-medium appearance-none"
                style={{ fontFamily: config.fontBody }}
                >
                {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</div>
            </div>
             <span className="text-[9px] text-gray-400 mt-1 block">Applied to paragraphs and body text</span>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-8 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
           💡 Tip: Use Global Colors in your designs to ensure consistency. Changing a color here updates it everywhere instantly.
        </p>
      </div>
    </div>
  );
}
