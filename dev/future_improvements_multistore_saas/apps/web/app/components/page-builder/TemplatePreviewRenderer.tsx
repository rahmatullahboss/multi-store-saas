/**
 * Template Preview Renderer - Theme-enabled
 * 
 * Renders template sections as a visual preview with theme support.
 */

import type { TemplatePreset } from '~/lib/page-builder/templates';
import type { BuilderSection, SectionTheme } from '~/lib/page-builder/types';
import { getThemeForTemplate } from '~/lib/page-builder/types';

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
import { ProductGridSectionPreview } from './sections/ProductGridSectionPreview';
import { StatsSectionPreview } from './sections/StatsSectionPreview';
import { PlaceholderSection } from './sections/PlaceholderSection';

interface TemplatePreviewRendererProps {
  template: TemplatePreset;
  scale?: number;
}

export function TemplatePreviewRenderer({ 
  template,
  scale = 1 
}: TemplatePreviewRendererProps) {
  // Get the theme for this template
  const theme = getThemeForTemplate(template.id);
  
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
        <SectionContent key={section.id} section={section} theme={theme} />
      ))}
    </div>
  );
}

interface SectionContentProps {
  section: BuilderSection;
  theme: SectionTheme;
}

function SectionContent({ section, theme }: SectionContentProps) {
  const { type, props } = section;
  
  // Pass theme to all sections that support it
  switch (type) {
    case 'hero':
      return <HeroSectionPreview props={props} theme={theme} />;
    case 'features':
      return <FeaturesSectionPreview props={props} theme={theme} />;
    case 'faq':
      return <FAQSectionPreview props={props} theme={theme} />;
    case 'testimonials':
      return <TestimonialsSectionPreview props={props} theme={theme} />;
    case 'trust-badges':
      return <TrustBadgesSectionPreview props={props} theme={theme} />;
    case 'cta':
      return <CTASectionPreview props={props} theme={theme} />;
    case 'video':
      return <VideoSectionPreview props={props} />;
    case 'guarantee':
      return <GuaranteeSectionPreview props={props} theme={theme} />;
    case 'gallery':
      return <GallerySectionPreview props={props} />;
    case 'benefits':
      return <BenefitsSectionPreview props={props} theme={theme} />;
    case 'comparison':
      return <ComparisonSectionPreview props={props} />;
    case 'delivery':
      return <DeliverySectionPreview props={props} />;
    case 'problem-solution':
      return <ProblemSolutionPreview props={props} theme={theme} />;
    case 'pricing':
      return <PricingSectionPreview props={props} />;
    case 'how-to-order':
      return <HowToOrderPreview props={props} />;
    case 'showcase':
      return <ShowcaseSectionPreview props={props} />;
    case 'product-grid':
      return <ProductGridSectionPreview props={props} />;
    case 'order-form':
      return <CTASectionPreview props={props} theme={theme} />;
    case 'social-proof':
      return <StatsSectionPreview props={props} />;
    case 'newsletter':
      return <CTASectionPreview props={props} theme={theme} />;
    default:
      return <PlaceholderSection type={type} />;
  }
}
