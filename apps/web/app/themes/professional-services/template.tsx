/**
 * Professional Services Template
 *
 * A modern lead generation theme for consultants and agencies.
 * Features inline forms, service showcases, and strong CTAs.
 */

import { FloatingContactButtons } from '~/components/FloatingContactButtons';
import type { StoreTemplateProps } from '~/templates/store-registry';
// Import Sections
import ProfessionalHeader from './sections/header';
import HeroWithForm from './sections/hero-with-form';
import StatsCounter from './sections/stats-counter';
import ServicesGrid from './sections/services-grid';
import Testimonials from './sections/testimonials';
import Accreditations from './sections/accreditations';
import ContactCTA from './sections/contact-cta';
import ProfessionalFooter from './sections/footer';

export default function ProfessionalServicesTemplate({
  storeName,
  storeId,
  logo,
  config,
  socialLinks,
  footerConfig,
  businessInfo,
  isPreview = false,
  aiCredits,
  isCustomerAiEnabled,
  customer,
}: StoreTemplateProps) {

  // Mock Context for Section Components
  const context = {
    store: { name: storeName, id: storeId, logo }, 
    page: { title: 'Home', handle: 'home', id: 0 },
    theme: config || {},
    getLink: (handle: string) => `/${handle}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const headerSection = {
    id: 'header-section',
    type: 'header',
    settings: {
      logo_url: logo,
      cta_text: 'Book Appointment',
      cta_url: '/contact',
      ...config, // Pass global config as settings for now
    },
    blocks: [],
  };

  const heroSection = {
    id: 'hero-section',
    type: 'hero-with-form',
    settings: {
      heading: 'Grow Your Business with Expert Consulting',
      subheading: 'We help businesses scale with proven strategies and personalized solutions',
      image: config?.bannerUrl || '',
      ...config,
    },
    blocks: [],
  };

  return (
    <div className="min-h-screen flex flex-col w-full m-0 p-0 bg-white font-sans text-gray-900">
      {/* Header */}
      <ProfessionalHeader 
        section={headerSection} 
        context={context} 
        settings={headerSection.settings}
        blocks={headerSection.blocks}
      />

      <main>
        {/* Hero Section */}
        <HeroWithForm 
          section={heroSection} 
          context={context} 
          settings={heroSection.settings}
          blocks={heroSection.blocks}
        />

        {/* Stats Counter */}
        <StatsCounter 
          section={{
            id: 'stats-section',
            type: 'stats-counter',
            settings: {},
            blocks: [
              { id: 'stat-1', type: 'stat', settings: { number: '150,000+', label: 'Students Counselled' } },
              { id: 'stat-2', type: 'stat', settings: { number: '22,000+', label: 'Visa Success Stories' } },
              { id: 'stat-3', type: 'stat', settings: { number: '98%', label: 'Visa Success Rate' } },
              { id: 'stat-4', type: 'stat', settings: { number: '15+', label: 'Years Experience' } },
            ]
          }}
          context={context} 
          settings={{}}
          blocks={[
            { id: 'stat-1', type: 'stat', settings: { number: '150,000+', label: 'Students Counselled' } },
            { id: 'stat-2', type: 'stat', settings: { number: '22,000+', label: 'Visa Success Stories' } },
            { id: 'stat-3', type: 'stat', settings: { number: '98%', label: 'Visa Success Rate' } },
            { id: 'stat-4', type: 'stat', settings: { number: '15+', label: 'Years Experience' } },
          ]}
        />

        {/* Services / Destinations */}
        <ServicesGrid 
          section={{
            id: 'services-section',
            type: 'services-grid',
            settings: {
              heading: 'Choose Your Study Destination',
              subheading: 'We guide you to the best universities in top destinations.',
            },
            blocks: [
              { 
                id: 'service-1',
                type: 'service', 
                settings: { 
                  title: 'Study in UK', 
                  description: 'World-class education with rich history.',
                  icon: 'MapPin' 
                } 
              },
              { 
                id: 'service-2',
                type: 'service', 
                settings: { 
                  title: 'Study in USA', 
                  description: 'Diverse opportunities and cutting-edge research.',
                  icon: 'MapPin' 
                } 
              },
              { 
                id: 'service-3',
                type: 'service', 
                settings: { 
                  title: 'Study in Canada', 
                  description: 'High quality of life and post-study work options.',
                  icon: 'MapPin' 
                } 
              },
              { 
                id: 'service-4',
                type: 'service', 
                settings: { 
                  title: 'Study in Australia', 
                  description: 'Vibrant cities and excellent student support.',
                  icon: 'MapPin' 
                } 
              },
            ]
          }} 
          context={context}
          settings={{
            heading: 'Choose Your Study Destination',
            subheading: 'We guide you to the best universities in top destinations.',
          }}
          blocks={[
            { 
              id: 'service-1',
              type: 'service', 
              settings: { 
                title: 'Study in UK', 
                description: 'World-class education with rich history.',
                icon: 'MapPin' 
              } 
            },
            { 
              id: 'service-2',
              type: 'service', 
              settings: { 
                title: 'Study in USA', 
                description: 'Diverse opportunities and cutting-edge research.',
                icon: 'MapPin' 
              } 
            },
            { 
              id: 'service-3',
              type: 'service', 
              settings: { 
                title: 'Study in Canada', 
                description: 'High quality of life and post-study work options.',
                icon: 'MapPin' 
              } 
            },
            { 
              id: 'service-4',
              type: 'service', 
              settings: { 
                title: 'Study in Australia', 
                description: 'Vibrant cities and excellent student support.',
                icon: 'MapPin' 
              } 
            },
          ]}
        />

        {/* Testimonials */}
        <Testimonials 
          section={{
            id: 'testimonials-section',
            type: 'testimonials',
            settings: {
              heading: 'Student Success Stories',
              subheading: 'Hear from students who achieved their dreams with us.',
            },
            blocks: [
              {
                id: 'test-1',
                type: 'testimonial',
                settings: {
                  quote: 'The guidance I received was exceptional. From university selection to visa processing, everything was smooth.',
                  author: 'Sarah Johnson',
                  role: 'MSc Student, UK',
                }
              },
              {
                id: 'test-2',
                type: 'testimonial',
                settings: {
                  quote: 'Highly professional team! They helped me get a scholarship I didn\'t think was possible.',
                  author: 'Michael Chen',
                  role: 'MBA Student, Canada',
                }
              }
            ]
          }} 
          context={context} 
          settings={{
            heading: 'Student Success Stories',
            subheading: 'Hear from students who achieved their dreams with us.',
          }}
          blocks={[
            {
              id: 'test-1',
              type: 'testimonial',
              settings: {
                quote: 'The guidance I received was exceptional. From university selection to visa processing, everything was smooth.',
                author: 'Sarah Johnson',
                role: 'MSc Student, UK',
              }
            },
            {
              id: 'test-2',
              type: 'testimonial',
              settings: {
                quote: 'Highly professional team! They helped me get a scholarship I didn\'t think was possible.',
                author: 'Michael Chen',
                role: 'MBA Student, Canada',
              }
            }
          ]}
        />

        {/* Accreditations */}
        <Accreditations
          section={{
            id: 'accreditations-section',
            type: 'accreditations',
             settings: {
               grayscale: true,
               opacity: 70
             },
             blocks: [
               { id: 'logo-1', type: 'logo', settings: { alt: 'British Council' } },
               { id: 'logo-2', type: 'logo', settings: { alt: 'IDP Education' } },
               { id: 'logo-3', type: 'logo', settings: { alt: 'PIER' } },
               { id: 'logo-4', type: 'logo', settings: { alt: 'ICEF' } },
               { id: 'logo-5', type: 'logo', settings: { alt: 'English UK' } },
             ]
          }}
          context={context}
          settings={{
            grayscale: true,
            opacity: 70
          }}
          blocks={[
            { id: 'logo-1', type: 'logo', settings: { alt: 'British Council' } },
            { id: 'logo-2', type: 'logo', settings: { alt: 'IDP Education' } },
            { id: 'logo-3', type: 'logo', settings: { alt: 'PIER' } },
            { id: 'logo-4', type: 'logo', settings: { alt: 'ICEF' } },
            { id: 'logo-5', type: 'logo', settings: { alt: 'English UK' } },
          ]}
        />

        {/* Contact CTA */}
        <ContactCTA 
          section={{
            id: 'cta-section',
            type: 'contact-cta',
            settings: {
              heading: 'Ready to Start Your Journey?',
              subheading: 'Book a free consultation with our experts today.',
              button_text: 'Book Appointment',
              button_url: '/contact',
              phone: businessInfo?.phone || '+880 1234-567890',
              email: businessInfo?.email || 'info@example.com'
            }
          }} 
          context={context} 
          settings={{
            heading: 'Ready to Start Your Journey?',
            subheading: 'Book a free consultation with our experts today.',
            button_text: 'Book Appointment',
            button_url: '/contact',
            phone: businessInfo?.phone || '+880 1234-567890',
            email: businessInfo?.email || 'info@example.com'
          }}
          blocks={[]}
        />
      </main>

      {/* Footer */}
      <ProfessionalFooter
        section={{
          id: 'footer-section',
          type: 'footer',
          settings: {
            footer_logo: logo,
            footer_description: businessInfo?.address || 'Leading education consultancy.',
            copyright_text: `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`,
            ...config,
            ...footerConfig, // Merge footer config
          },
          blocks: []
        }}
        context={context}
        settings={{
            footer_logo: logo,
            footer_description: businessInfo?.address || 'Leading education consultancy.',
            copyright_text: `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`,
            ...config,
            ...footerConfig, 
        }}
        blocks={[]}
      />

      {!isPreview && (
        <FloatingContactButtons
          whatsappEnabled={config?.floatingWhatsappEnabled}
          whatsappNumber={
            config?.floatingWhatsappNumber ||
            socialLinks?.whatsapp ||
            businessInfo?.phone ||
            undefined
          }
          whatsappMessage={config?.floatingWhatsappMessage || undefined}
          callEnabled={config?.floatingCallEnabled}
          callNumber={config?.floatingCallNumber || businessInfo?.phone || undefined}
          storeName={storeName}
          aiEnabled={isCustomerAiEnabled}
          aiCredits={aiCredits}
          storeId={storeId}
          accentColor={config?.primaryColor || '#2563EB'}
        />
      )}
    </div>
  );
}
