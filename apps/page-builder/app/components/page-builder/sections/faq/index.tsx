/**
 * FAQ Section - Main Router
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import type { FAQProps, FAQSectionPreviewProps, FAQItem } from './types';

import { AccordionFAQ } from './AccordionFAQ';
import { GlassmorphismFAQ } from './GlassmorphismFAQ';
import { NeubrutalistFAQ } from './NeubrutalistFAQ';
import { CardsFAQ } from './CardsFAQ';

export type FAQVariant = 
  | 'accordion' 
  | 'glassmorphism' 
  | 'neubrutalism'
  | 'cards';

export function FAQSectionPreview({ props, theme }: FAQSectionPreviewProps) {
  const {
    title = 'সাধারণ জিজ্ঞাসা',
    subtitle = '',
    items = [],
    variant = 'accordion',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as FAQProps & { variant?: FAQVariant };

  const styleProps = {
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  };

  const commonProps = {
    title,
    subtitle: subtitle || '',
    items: items as FAQItem[],
    theme,
    styleProps,
  };

  switch (variant) {
    case 'glassmorphism':
      return <GlassmorphismFAQ {...commonProps} />;
    case 'neubrutalism':
      return <NeubrutalistFAQ {...commonProps} />;
    case 'cards':
      return <CardsFAQ {...commonProps} />;
    case 'accordion':
    default:
      return <AccordionFAQ {...commonProps} />;
  }
}

export type { FAQProps, FAQSectionPreviewProps, FAQItem };
