
import type { SectionSettings } from './registry';

interface NewsletterSectionProps {
  settings: SectionSettings;
  theme: any;
}

export default function NewsletterSection({ settings, theme }: NewsletterSectionProps) {
  const paddingTop = settings.paddingTop === 'large' ? 'py-20' : settings.paddingTop === 'medium' ? 'py-12' : settings.paddingTop === 'small' ? 'py-8' : 'pt-0';
  const paddingBottom = settings.paddingBottom === 'large' ? 'pb-20' : settings.paddingBottom === 'medium' ? 'pb-12' : settings.paddingBottom === 'small' ? 'pb-8' : 'pb-0';
  
  // Use theme footer colors if generic settings are not overridden, otherwise use settings or theme defaults
  const bgColor = settings.backgroundColor || theme.footerBg;
  const textColor = settings.textColor || theme.footerText;

  return (
    <section className={`${paddingTop} ${paddingBottom}`} style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Newsletter */}
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
        
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 placeholder-white/50 focus:outline-none focus:border-[#c9a961]"
            style={{ color: textColor }}
          />
          <button
            type="submit"
            className="px-6 py-3 font-medium uppercase text-sm tracking-wider transition-colors"
            style={{ backgroundColor: theme.accent, color: theme.primary }}
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
