
import type { SectionSettings } from './registry';
import { Leaf } from 'lucide-react';

interface RichTextSectionProps {
  settings: SectionSettings;
  theme: any;
}

import { withAISchema, type AISchema } from '~/utils/ai-editable';

export const RICH_TEXT_AI_SCHEMA: AISchema = {
  component: 'RichTextSection',
  version: '1.0.0',
  properties: {
    heading: { type: 'string', maxLength: 100, aiAction: 'enhance' },
    text: { type: 'string', maxLength: 2000, aiAction: 'enhance' },
    alignment: { type: 'string', aiEnum: ['left', 'center', 'right'], aiAction: 'select' },
    backgroundColor: { type: 'string', maxLength: 20 }
  }
};

function RichTextSectionBase({ settings, theme }: RichTextSectionProps) {
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

const RichTextSection = withAISchema(RichTextSectionBase, RICH_TEXT_AI_SCHEMA);
export default RichTextSection;
