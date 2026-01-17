/**
 * Trust-First Section Renderer
 */

import { TrustFirstHero } from './Hero';
import { TrustFirstOrderForm } from './OrderForm';
import type { SectionProps } from '../_core/types';
import { DEFAULT_SECTION_ORDER } from '../../landing-builder/SectionManager';
import { SectionWrapper, getSectionDisplayName, isRequiredSection } from '../_core/SectionWrapper';

// For now, we only have Hero and OrderForm. Other sections use fallback.
const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionProps>> = {
  hero: TrustFirstHero,
  'order-form': TrustFirstOrderForm,
  cta: TrustFirstOrderForm,
};

interface TrustFirstSectionRendererProps extends SectionProps {
  sectionOrder?: string[];
  hiddenSections?: string[];
  selectedSection?: string | null;
}

export function TrustFirstSectionRenderer({
  sectionOrder,
  hiddenSections = [],
  selectedSection,
  ...props
}: TrustFirstSectionRendererProps) {
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER;
  
  // Only render sections we have components for
  const visibleSections = order.filter(
    sectionId => !hiddenSections.includes(sectionId) && SECTION_COMPONENTS[sectionId]
  );

  return (
    <>
      {visibleSections.map((sectionId, index) => {
        const Component = SECTION_COMPONENTS[sectionId];
        if (!Component) return null;

        const sectionNames = getSectionDisplayName(sectionId);

        return (
          <SectionWrapper
            key={sectionId}
            sectionId={sectionId}
            sectionName={sectionNames.name}
            sectionNameEn={sectionNames.nameEn}
            isPreview={props.isPreview}
            isSelected={selectedSection === sectionId}
            isRequired={isRequiredSection(sectionId)}
            canMoveUp={index > 0}
            canMoveDown={index < visibleSections.length - 1}
            lang={props.config.landingLanguage || 'bn'}
          >
            <Component {...props} />
          </SectionWrapper>
        );
      })}
    </>
  );
}
