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
import { ProductGridSectionPreview } from './sections/ProductGridSectionPreview';
import { CustomHtmlSectionPreview } from './sections/CustomHtmlSectionPreview';
import { OrderButtonSectionPreview } from './sections/OrderButtonSectionPreview';
import { HeaderSectionPreview } from './sections/HeaderSectionPreview';
import { CountdownSectionPreview } from './sections/CountdownSectionPreview';
import { StatsSectionPreview } from './sections/StatsSectionPreview';
import { ContactSectionPreview } from './sections/ContactSectionPreview';
import { FooterSectionPreview } from './sections/FooterSectionPreview';
import { PlaceholderSection } from './sections/PlaceholderSection';

// Product type for order form
interface ProductData {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  description?: string | null;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

interface SectionRendererProps {
  sections: BuilderSection[];
  activeSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  // For order submission on live pages
  storeId?: number;
  productId?: number;
  product?: ProductData | null;
  // Multiple products for product-grid section
  selectedProducts?: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    imageUrl?: string | null;
  }>;
  // Real data for urgency/social proof (from DB - no fake numbers!)
  realData?: {
    stockCount: number | null;
    recentOrderCount: number;
  };
}

export function SectionRenderer({ 
  sections, 
  activeSectionId, 
  onSelectSection,
  storeId,
  productId,
  product,
  selectedProducts = [],
  realData,
}: SectionRendererProps) {
  // Sort by sortOrder
  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Determine if we're in editor mode (onSelectSection is provided)
  const isEditorMode = !!onSelectSection;
  
  return (
    <div className="min-h-full">
      {sortedSections.map((section) => (
        <SectionWrapper
          key={section.id}
          section={section}
          isActive={activeSectionId === section.id}
          onClick={() => onSelectSection?.(section.id)}
          isEditorMode={isEditorMode}
          storeId={storeId}
          productId={productId}
          product={product}
          selectedProducts={selectedProducts}
          realData={realData}
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
  isEditorMode: boolean;
  storeId?: number;
  productId?: number;
  product?: ProductData | null;
  selectedProducts?: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    imageUrl?: string | null;
  }>;
  realData?: {
    stockCount: number | null;
    recentOrderCount: number;
  };
}

function SectionWrapper({ section, isActive, onClick, isEditorMode, storeId, productId, product, selectedProducts = [], realData }: SectionWrapperProps) {
  const meta = getSectionMeta(section.type);
  
  // Only apply editor styling when in editor mode
  if (!isEditorMode) {
    return <SectionContent section={section} storeId={storeId} productId={productId} product={product} selectedProducts={selectedProducts} realData={realData} />;
  }
  
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
      <SectionContent section={section} storeId={storeId} productId={productId} product={product} selectedProducts={selectedProducts} realData={realData} />
    </div>
  );
}

interface SectionContentProps {
  section: BuilderSection;
  storeId?: number;
  productId?: number;
  product?: ProductData | null;
  selectedProducts?: Array<{
    id: number;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    imageUrl?: string | null;
  }>;
  realData?: {
    stockCount: number | null;
    recentOrderCount: number;
  };
}

function SectionContent({ section, storeId, productId, product, selectedProducts = [], realData }: SectionContentProps) {
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
      return <CTASectionPreview props={props} storeId={storeId} productId={productId} product={product} selectedProducts={selectedProducts} realData={realData} />;
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
    case 'product-grid':
      // Merge selectedProducts into props for real data display
      const productGridProps = {
        ...props,
        products: selectedProducts.length > 0 ? selectedProducts.map(p => ({
          id: p.id,
          name: p.title,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          image: p.imageUrl,
        })) : props.products,
      };
      return <ProductGridSectionPreview props={productGridProps} />;
    case 'custom-html':
      return <CustomHtmlSectionPreview {...props as any} />;
    case 'order-button':
      return <OrderButtonSectionPreview props={props} />;
    case 'header':
      return <HeaderSectionPreview props={props} />;
    case 'countdown':
      return <CountdownSectionPreview props={props} />;
    case 'stats':
      return <StatsSectionPreview props={props} />;
    case 'contact':
      return <ContactSectionPreview props={props} />;
    case 'footer':
      return <FooterSectionPreview props={props} />;
    default:
      return <PlaceholderSection type={type} />;
  }
}

