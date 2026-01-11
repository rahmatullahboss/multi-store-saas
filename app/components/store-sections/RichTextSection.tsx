
import type { SectionSettings } from './registry';
import { Leaf } from 'lucide-react';

interface RichTextSectionProps {
  settings: SectionSettings;
  theme: any;
}

export default function RichTextSection({ settings, theme }: RichTextSectionProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }[settings.alignment || 'center'];

  return (
    <section className="py-16 px-4" style={{ backgroundColor: settings.backgroundColor || 'transparent' }}>
      <div className={`max-w-4xl ${alignmentClass}`}>
        <Leaf className="w-8 h-8 mb-6 mx-auto opacity-50" style={{ color: theme.accent }} />
        {settings.heading && (
          <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary, fontFamily: "'Newsreader', serif" }}>
            {settings.heading}
          </h2>
        )}
        {settings.text && (
          <div className="prose prose-lg leading-relaxed" style={{ color: theme.muted }}>
             {settings.text}
          </div>
        )}
      </div>
    </section>
  );
}
