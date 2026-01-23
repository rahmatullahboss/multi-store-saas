
import type { SectionSettings } from './registry';
import { FileText } from 'lucide-react';

interface ProductDescriptionSectionProps {
  settings: SectionSettings;
  product?: {
    description?: string | null;
  };
  theme?: {
    primary?: string;
    accent?: string;
    text?: string;
    muted?: string;
    background?: string;
  };
}

export function ProductDescriptionSection({ settings, product, theme }: ProductDescriptionSectionProps) {
  if (!product?.description && !settings.text) return null;
  
  const content = product?.description || settings.text || '';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }[settings.alignment || 'left'];

  const primaryColor = theme?.primary || '#000000';
  const textColor = theme?.text || '#1f2937';
  const mutedColor = theme?.muted || '#6b7280';
  const backgroundColor = settings.backgroundColor || 'transparent';

  return (
    <section 
      className={`py-12 px-4 sm:px-6 lg:px-8 ${settings.paddingTop === 'none' ? 'pt-0' : ''} ${settings.paddingBottom === 'none' ? 'pb-0' : ''}`} 
      style={{ backgroundColor }}
    >
      <div className={`max-w-4xl ${alignmentClass}`}>
        {settings.heading && (
          <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
            {settings.heading}
          </h2>
        )}
        
        <div className="prose prose-lg max-w-none" style={{ color: mutedColor }}>
           {/* Simple rendering for now, could be dangerouslySetInnerHTML if description is HTML */}
           <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </section>
  );
}
