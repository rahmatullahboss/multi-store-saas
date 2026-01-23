
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import type { SectionSettings } from './registry';

interface NewsletterSectionProps {
  settings: SectionSettings;
  theme: any;
  storeId?: number;
}

import { withAISchema, type AISchema } from '~/utils/ai-editable';

export const NEWSLETTER_AI_SCHEMA: AISchema = {
  component: 'NewsletterSection',
  version: '1.0.0',
  properties: {
    heading: { type: 'string', description: 'Main heading', maxLength: 100, aiAction: 'enhance' },
    subheading: { type: 'string', description: 'Descriptive text', maxLength: 200, aiAction: 'enhance' },
    buttonText: { type: 'string', description: 'Subscribe button text', maxLength: 30, aiAction: 'enhance' },
    placeholderText: { type: 'string', description: 'Input placeholder', maxLength: 50 },
    successMessage: { type: 'string', description: 'Message shown after success', maxLength: 100, aiAction: 'enhance' },
  }
};

function NewsletterSectionBase({ settings, theme, storeId }: NewsletterSectionProps) {
  const fetcher = useFetcher<any>();
  const formRef = useRef<HTMLFormElement>(null);
  const isSuccess = fetcher.data?.success;
  
  useEffect(() => {
    if (isSuccess && formRef.current) {
      formRef.current.reset();
    }
  }, [isSuccess]);

  const paddingTop = settings.paddingTop === 'large' ? 'py-20' : settings.paddingTop === 'medium' ? 'py-12' : settings.paddingTop === 'small' ? 'py-8' : 'pt-0';
  const paddingBottom = settings.paddingBottom === 'large' ? 'pb-20' : settings.paddingBottom === 'medium' ? 'pb-12' : settings.paddingBottom === 'small' ? 'pb-8' : 'pb-0';
  
  // Use theme footer colors if generic settings are not overridden
  const bgColor = settings.backgroundColor || theme.footerBg;
  const textColor = settings.textColor || theme.footerText;

  return (
    <section className={`${paddingTop} ${paddingBottom}`} style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {settings.heading && (
          <h3 
            className="text-2xl font-semibold mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {settings.heading}
          </h3>
        )}
        
        {settings.subheading && (
          <p className="opacity-70 mb-6 max-w-md mx-auto">
            {settings.subheading}
          </p>
        )}
        
        <fetcher.Form 
          ref={formRef}
          method="post" 
          action="/api/newsletter/subscribe" 
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input type="hidden" name="storeId" value={storeId} />
          
          <div className="flex-1 relative">
            <input
              type="email"
              name="email"
              required
              placeholder={settings.placeholderText || 'Enter your email'}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 placeholder-white/50 focus:outline-none focus:border-[#c9a961]"
              style={{ color: textColor }}
            />
          </div>
          
          <button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="px-6 py-3 font-medium uppercase text-sm tracking-wider transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.primary }}
          >
            {fetcher.state !== 'idle' ? '...' : (settings.buttonText || 'Subscribe')}
          </button>
        </fetcher.Form>

        {isSuccess && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-500 text-sm">
            {settings.successMessage || 'Thanks for subscribing!'}
          </div>
        )}
        
        {fetcher.data?.error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                {fetcher.data.error}
            </div>
        )}
      </div>
    </section>
  );
}

const NewsletterSection = withAISchema(NewsletterSectionBase, NEWSLETTER_AI_SCHEMA);
export default NewsletterSection;
