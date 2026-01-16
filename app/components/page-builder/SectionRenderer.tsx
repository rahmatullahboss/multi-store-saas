/**
 * Page Builder v2 - Section Renderer
 * 
 * Renders sections dynamically based on type.
 * Supports click-to-select in editor mode.
 */

import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';

// Import section components
import { HeroSectionPreview } from './sections/HeroSectionPreview';
import { FeaturesSectionPreview } from './sections/FeaturesSectionPreview';
import { FAQSectionPreview } from './sections/FAQSectionPreview';
import { TestimonialsSectionPreview } from './sections/TestimonialsSectionPreview';
import { TrustBadgesSectionPreview } from './sections/TrustBadgesSectionPreview';
import { CTASectionPreview } from './sections/CTASectionPreview';
import { VideoSectionPreview } from './sections/VideoSectionPreview';
import { GuaranteeSectionPreview } from './sections/GuaranteeSectionPreview';
import { GallerySectionPreview } from './sections/GallerySectionPreview';
import { BenefitsSectionPreview } from './sections/BenefitsSectionPreview';
import { ComparisonSectionPreview } from './sections/ComparisonSectionPreview';
import { DeliverySectionPreview } from './sections/DeliverySectionPreview';
import { ProblemSolutionPreview } from './sections/ProblemSolutionPreview';
import { PricingSectionPreview } from './sections/PricingSectionPreview';
import { HowToOrderPreview } from './sections/HowToOrderPreview';
import { ShowcaseSectionPreview } from './sections/ShowcaseSectionPreview';
import { PlaceholderSection } from './sections/PlaceholderSection';

interface SectionRendererProps {
  sections: BuilderSection[];
  activeSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

export function SectionRenderer({ 
  sections, 
  activeSectionId, 
  onSelectSection 
}: SectionRendererProps) {
  // Sort by sortOrder
  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  
  return (
    <div className="min-h-full">
      {sortedSections.map((section) => (
        <SectionWrapper
          key={section.id}
          section={section}
          isActive={activeSectionId === section.id}
          onClick={() => onSelectSection?.(section.id)}
        />
      ))}
      
      {sortedSections.length === 0 && (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <p>No sections to display</p>
        </div>
      )}
    </div>
  );
}

interface SectionWrapperProps {
  section: BuilderSection;
  isActive: boolean;
  onClick: () => void;
}

function SectionWrapper({ section, isActive, onClick }: SectionWrapperProps) {
  const meta = getSectionMeta(section.type);
  
  return (
    <div
      className={`
        relative transition-all cursor-pointer
        ${isActive ? 'ring-2 ring-indigo-500 ring-inset' : 'hover:ring-2 hover:ring-indigo-300 hover:ring-inset'}
      `}
      onClick={onClick}
    >
      {/* Section type label on hover */}
      <div className={`
        absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-medium rounded
        transition-opacity
        ${isActive ? 'bg-indigo-500 text-white opacity-100' : 'bg-gray-800 text-white opacity-0 group-hover:opacity-100'}
      `}>
        {meta?.name || section.type}
      </div>
      
      {/* Actual section content */}
      <SectionContent section={section} />
    </div>
  );
}

function SectionContent({ section }: { section: BuilderSection }) {
  const { type, props } = section;
  
  switch (type) {
    case 'hero':
      return <HeroSectionPreview props={props} />;
    case 'features':
      return <FeaturesSectionPreview props={props} />;
    case 'faq':
      return <FAQSectionPreview props={props} />;
    case 'testimonials':
      return <TestimonialsSectionPreview props={props} />;
    case 'trust-badges':
      return <TrustBadgesSectionPreview props={props} />;
    case 'cta':
      return <CTASectionPreview props={props} />;
    case 'video':
      return <VideoSectionPreview props={props} />;
    case 'guarantee':
      return <GuaranteeSectionPreview props={props} />;
    case 'gallery':
      return <GallerySectionPreview props={props} />;
    case 'benefits':
      return <BenefitsSectionPreview props={props} />;
    case 'comparison':
      return <ComparisonSectionPreview props={props} />;
    case 'delivery':
      return <DeliverySectionPreview props={props} />;
    case 'problem-solution':
      return <ProblemSolutionPreview props={props} />;
    case 'pricing':
      return <PricingSectionPreview props={props} />;
    case 'how-to-order':
      return <HowToOrderPreview props={props} />;
    case 'showcase':
      return <ShowcaseSectionPreview props={props} />;
    default:
      return <PlaceholderSection type={type} />;
  }
}

