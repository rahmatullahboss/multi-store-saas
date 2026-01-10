import { useState, useEffect } from 'react';
import { Palette, Type } from 'lucide-react';

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
  { name: 'Hind Siliguri', value: 'Hind Siliguri' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Noto Sans Bengali', value: 'Noto Sans Bengali' },
];

export default function ThemePanel({ config, onChange }: ThemePanelProps) {
  const handleChange = (key: keyof ThemeConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Global Theme</h3>
        <p className="text-[10px] text-gray-400">Apply brand colors & fonts across the entire page.</p>
      </div>

      {/* Colors Section */}
      <div className="space-y-4 mb-8">
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase border-b pb-2">
          <Palette size={12} className="text-blue-500" />
          Brand Colors
        </h4>
        
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Primary Color (Buttons/Links)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 text-gray-600 font-mono uppercase focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Secondary Color (Accents)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 text-gray-600 font-mono uppercase focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-800 uppercase border-b pb-2">
          <Type size={12} className="text-purple-500" />
          Typography
        </h4>
        
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Heading Font</label>
            <select 
              value={config.fontHeading}
              onChange={(e) => handleChange('fontHeading', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none bg-white font-medium"
            >
              {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Body Font</label>
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
          <strong>Note:</strong> Changes apply instantly to all "Smart Blocks". Custom elements might need manual updates.
        </p>
      </div>
    </div>
  );
}
