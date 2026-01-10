import { useState } from 'react';
import {  Sparkles, Check } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { TEMPLATE_CONFIGS, type TemplateConfig } from '~/lib/grapesjs/template-configs';

interface TemplatesPanelProps {
  onLoadTemplate: (templateId: string) => void;
}

export default function TemplatesPanel({ onLoadTemplate }: TemplatesPanelProps) {
  const { t, lang } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const templates = Object.values(TEMPLATE_CONFIGS);

  const handleSelect = (templateId: string) => {
    setSelectedId(templateId);
    onLoadTemplate(templateId);
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar animate-in fade-in duration-300">
      <div className="mb-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Templates</h3>
        <p className="text-[10px] text-gray-400">Select a ready-made template and customize</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => {
          const isSelected = selectedId === template.id;
          const isHovered = hoveredId === template.id;
          const name = lang === 'bn' ? template.name : template.nameEn;
          const description = lang === 'bn' ? template.description : template.descriptionEn;

          return (
            <div
              key={template.id}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-200/50'
                  : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
              }`}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelect(template.id)}
            >
              {/* Template Preview Mockup */}
              <div
                className="h-32 relative flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${template.themeColors.primaryColor} 0%, ${template.themeColors.secondaryColor} 100%)`,
                }}
              >
                {/* Mini Preview */}
                <div className="absolute inset-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col p-2 overflow-hidden">
                  {/* Mini Header */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-lg">{template.emoji}</span>
                    <div className="flex-1 h-1.5 rounded bg-white/30" />
                  </div>
                  
                  {/* Mini Content Blocks */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-2 rounded bg-white/40 w-full" />
                    <div className="h-2 rounded bg-white/30 w-3/4" />
                    <div className="flex gap-1 mt-1">
                      <div className="flex-1 h-1 rounded bg-white/25" />
                      <div className="flex-1 h-1 rounded bg-white/25" />
                      <div className="flex-1 h-1 rounded bg-white/25" />
                    </div>
                  </div>
                  
                  {/* Mini CTA */}
                  <div 
                    className="w-full h-4 rounded mt-1 flex items-center justify-center"
                    style={{ backgroundColor: isHovered ? template.themeColors.primaryColor : template.themeColors.secondaryColor }}
                  >
                    <span className="text-[8px] text-white font-bold">ORDER NOW</span>
                  </div>
                </div>

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/40 text-white text-[9px] font-medium rounded-full backdrop-blur-sm">
                  {template.category === 'premium' && '⭐'}
                  {template.category === 'sales' && '🔥'}
                  {template.category === 'minimal' && '✨'}
                  {template.category === 'video' && '🎬'}
                </div>

                {/* Hover Effect */}
                {isHovered && !isSelected && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-2.5 bg-white">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{template.emoji}</span>
                  <h4 className="font-bold text-gray-900 text-xs">{name}</h4>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug">{description}</p>
                
                {/* Block Count */}
                <div className="mt-1.5 text-[9px] text-gray-400 font-medium">
                  {template.blocks.length} blocks • {template.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-[10px] text-blue-700 leading-relaxed">
          <strong>Tip:</strong> Select a template to load it into the canvas. Then customize colors, fonts, and content to match your brand.
        </p>
      </div>
    </div>
  );
}
