
/**
 * ZenithRise Template (2025 World-Class)
 * 
 * A high-conversion, dark-mode SaaS/Digital product template.
 * Features:
 * - Glassmorphism Header
 * - Gradient Hero
 * - Bento Grid Features
 * - Clean Product Grid
 * - Modern Footer
 */

import { ClientOnly } from 'remix-utils/client-only';
import { SkeletonLoader } from '~/components/SkeletonLoader';
import { StoreConfigProvider } from '~/contexts/StoreConfigContext';
import { WishlistProvider } from '~/contexts/WishlistContext';
import type { StoreTemplateProps } from '~/templates/store-registry';
import { SECTION_REGISTRY } from '~/components/store-sections/registry';
import { ZENITH_RISE_THEME } from './styles/tokens';
import { ZenithRiseHeader } from './sections/Header';
import { ZenithRiseFooter } from './sections/Footer';

export function ZenithRiseTemplate({
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  footerConfig,
  businessInfo,
  isPreview,
  planType
}: StoreTemplateProps) {
  
  // Default Sections if none configured (The "World Class" Starting Point)
  const defaultSections = [
    {
      id: 'z-hero',
      type: 'zenith-hero',
      settings: {
        heading: config?.bannerText || 'Build the Future',
        titleHighlight: 'Future',
        subheading: 'Experience the next generation of digital commerce. Fast, secure, and beautiful.',
        primaryAction: { label: 'Get Started', url: '/?category=all' },
        secondaryAction: { label: 'Browse Products', url: '/#products' },
        image: config?.bannerUrl
      }
    },
    {
       id: 'z-text',
       type: 'rich-text',
       settings: {
          heading: 'Trusted by Industry Leaders',
          text: 'Join thousands of companies scaling their business with us.',
          alignment: 'center',
          backgroundColor: 'transparent',
          textColor: '#94A3B8'
       }
    },
    {
      id: 'z-features',
      type: 'zenith-features',
      settings: {
        heading: 'Everything You Need',
        subheading: 'Powerful features to help you grow.'
      }
    },
    {
      id: 'z-products',
      type: 'product-grid',
      settings: {
        heading: 'Trending Products',
        productCount: 8,
        paddingTop: 'large',
        paddingBottom: 'large',
        cardStyle: 'minimal'
      }
    },
    {
      id: 'z-banner',
      type: 'banner',
      settings: {
        heading: 'Early Access Drops',
        subheading: 'Exclusive product launches for subscribers.',
        primaryAction: { label: 'Join Now', url: '/#newsletter' },
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
      }
    },
    {
       id: 'z-faq',
       type: 'faq',
       settings: {
          heading: "Questions? We've got answers.",
          backgroundColor: 'transparent',
          faqs: [
            { question: 'What makes this store different?', answer: 'We focus on premium, curated product collections.' },
            { question: 'Do you offer support?', answer: 'Yes, our team is available 24/7.' },
            { question: 'Can I return products?', answer: 'We offer a 7-day return policy.' }
          ]
       }
    },
    {
       id: 'z-newsletter',
       type: 'newsletter',
       settings: {
          heading: 'Stay Updated',
          subheading: 'Get the latest news and updates directly to your inbox.',
          alignment: 'center'
       }
    }
  ];

  const sectionsToRender = (config?.sections && config.sections.length > 0) 
    ? config.sections 
    : defaultSections;

  return (
    <StoreConfigProvider config={config}>
      <WishlistProvider>
        <ClientOnly fallback={<div className="min-h-screen bg-slate-950"><SkeletonLoader /></div>}>
          {() => (
            <div 
              className="min-h-screen flex flex-col"
              style={{ 
                backgroundColor: ZENITH_RISE_THEME.background,
                color: ZENITH_RISE_THEME.text,
                fontFamily: ZENITH_RISE_THEME.fontFamily
              }}
            >
              <ZenithRiseHeader
                storeName={storeName}
                logo={logo}
                categories={categories}
                currentCategory={currentCategory}
                isPreview={isPreview}
                config={config}
                socialLinks={socialLinks}
              />

              <main className="flex-1">
                {sectionsToRender.map((section: any) => {
                  const SectionComponent = SECTION_REGISTRY[section.type]?.component;
                  
                  // Fallback for unknown sections
                  if (!SectionComponent) {
                    console.warn(`Unknown section type: ${section.type}`);
                    return null;
                  }

                  return (
                    <SectionComponent
                      key={section.id}
                      settings={section.settings}
                      theme={ZENITH_RISE_THEME}
                      products={products}
                      categories={categories}
                      storeId={storeId}
                      currency={currency}
                      store={{
                        name: storeName,
                        email: businessInfo?.email,
                        phone: businessInfo?.phone,
                        address: businessInfo?.address,
                        currency: currency
                      }}
                    />
                  );
                })}
              </main>

              <ZenithRiseFooter
                storeName={storeName}
                logo={logo}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
                businessInfo={businessInfo}
                categories={categories}
                planType={planType}
              />
              
              {/* Global Styles for specific overrides if needed */}
              <style>{`
                ::selection {
                  background: ${ZENITH_RISE_THEME.accent};
                  color: white;
                }
              `}</style>
            </div>
          )}
        </ClientOnly>
      </WishlistProvider>
    </StoreConfigProvider>
  );
}
