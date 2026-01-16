/**
 * Hero Section Preview
 */

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  badgeText?: string;
  backgroundImage?: string;
}

export function HeroSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    headline = 'আপনার পণ্যের শিরোনাম',
    subheadline = '',
    ctaText = 'অর্ডার করুন',
    badgeText = '',
    backgroundImage = '',
  } = props as HeroProps;
  
  return (
    <section 
      className="relative py-16 px-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(79, 70, 229, 0.85), rgba(126, 34, 206, 0.85)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      <div className="max-w-3xl mx-auto text-center">
        {badgeText && (
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium bg-white/20 rounded-full">
            {badgeText}
          </span>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {headline}
        </h1>
        
        {subheadline && (
          <p className="text-lg md:text-xl opacity-90 mb-8">
            {subheadline}
          </p>
        )}
        
        <button className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          {ctaText}
        </button>
      </div>
    </section>
  );
}
