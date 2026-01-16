/**
 * Template Preview Renderer
 * 
 * Renders template sections as a visual preview during template selection.
 * Uses the same section components as the main builder.
 */

import type { TemplatePreset, TemplateSection } from '~/lib/page-builder/templates';
import type { BuilderSection } from '~/lib/page-builder/types';

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

interface TemplatePreviewRendererProps {
  template: TemplatePreset;
  scale?: number; // Scale down for thumbnail view
}

export function TemplatePreviewRenderer({ 
  template,
  scale = 1 
}: TemplatePreviewRendererProps) {
  // Convert template sections to BuilderSection format for rendering
  const sections: BuilderSection[] = template.sections.map((section, index) => ({
    id: `preview-${template.id}-${index}`,
    pageId: 'preview',
    type: section.type,
    props: section.props,
    enabled: true,
    sortOrder: index,
    version: 1,
  }));

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
        <div className="text-center p-8">
          <div className="text-4xl mb-2">📄</div>
          <p className="font-medium">খালি টেমপ্লেট</p>
          <p className="text-sm">আপনি নিজে সেকশন যোগ করতে পারবেন</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white"
      style={{ 
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        width: scale !== 1 ? `${100 / scale}%` : undefined,
      }}
    >
      {sections.map((section) => (
        <SectionContent key={section.id} section={section} />
      ))}
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
