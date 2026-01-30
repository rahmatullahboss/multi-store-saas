/**
 * FAQ Section - Main Router
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import type { FAQProps, FAQSectionPreviewProps, FAQItem } from './types';

import { AccordionFAQ } from './AccordionFAQ';
// import { SimpleFAQ } from './SimpleFAQ'; // Non-existent component
import { WorldClassFAQ } from './WorldClassFAQ';
import { GlassmorphismFAQ } from './GlassmorphismFAQ';
import { NeubrutalistFAQ } from './NeubrutalistFAQ';
import { CardsFAQ } from './CardsFAQ';
import { OrganicFAQ } from './OrganicFAQ';

export type FAQVariant =
  | 'accordion'
  | 'glassmorphism'
  | 'neubrutalism'
  | 'cards'
  | 'organic'
  | 'story-driven'
  | 'story-driven-premium';

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
    case 'organic':
      return (
        <OrganicFAQ
          title={title}
          subtitle={subtitle}
          items={items.map((item) => ({
            question: item.question,
            answer: item.answer,
          }))}
          theme={theme}
          styleProps={styleProps}
        />
      );
    case 'story-driven':
    case 'accordion':
      return <AccordionFAQ {...commonProps} />;

    case 'story-driven-premium':
    default:
      return <WorldClassFAQ {...commonProps} />;
  }
}

export type { FAQProps, FAQSectionPreviewProps, FAQItem };
