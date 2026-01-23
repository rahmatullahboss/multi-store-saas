
import { Link, useSearchParams } from '@remix-run/react';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import type { SectionSettings } from './registry';
import { useTranslation } from '~/contexts/LanguageContext';
import { withAISchema } from '~/utils/ai-editable';

interface HeroSectionProps {
  settings: SectionSettings;
  theme: any;
  categories?: string[];
}


export const HERO_AI_SCHEMA = {
  component: 'HeroSection',
  version: '1.0.0',
  type: 'hero',
  properties: {
    heading: {
      type: 'string',
      maxLength: 100,
      description: 'The main headline of the hero section',
      aiAction: 'enhance'
    },
    subheading: {
      type: 'string',
      maxLength: 200,
      description: 'A supporting subtitle or description',
      aiAction: 'enhance'
    },
    image: {
      type: 'image',
      description: 'Hero background image URL',
      aiAction: 'generate-image'
    },
    primaryAction: {
      type: 'object',
      properties: {
        label: { type: 'string', maxLength: 30, description: 'Button text' },
        url: { type: 'string', description: 'Button link URL' }
      }
    },
    alignment: {
      type: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment'
    }
  }
};

function HeroSectionBase({ settings, theme, categories = [] }: HeroSectionProps) {
// ... existing component ...
}

const HeroSection = withAISchema(HeroSectionBase, HERO_AI_SCHEMA as any); // Type assertion to bypass strict generic constraint if needed for now
export default HeroSection;

