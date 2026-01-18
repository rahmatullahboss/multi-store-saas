/**
 * Features Section
 * 
 * Display features or trust signals in a grid.
 */

import type { RenderContext } from '~/lib/template-resolver.server';

interface FeaturesSectionProps {
  sectionId: string;
  props: {
    heading?: string;
    subheading?: string;
    features?: Array<{
      icon: string;
      title: string;
      description?: string;
    }>;
    columns?: number;
  };
  context: RenderContext;
}

export default function FeaturesSection({ sectionId, props, context }: FeaturesSectionProps) {
  const {
    heading = 'Why Choose Us',
    subheading,
    features = [
      { icon: '🚚', title: 'Free Shipping', description: 'On orders over ৳999' },
      { icon: '↩️', title: 'Easy Returns', description: '30-day return policy' },
      { icon: '🔒', title: 'Secure Payment', description: '100% secure checkout' },
    ],
    columns = 3,
  } = props;

  const themeColors = context.theme;

  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <section 
      id={sectionId}
      className="py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(heading || subheading) && (
          <div className="text-center mb-10">
            {heading && (
              <h2 
                className="text-2xl md:text-3xl font-bold"
                style={{ 
                  color: themeColors.textColor,
                  fontFamily: themeColors.headingFont,
                }}
              >
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-2 text-gray-600">{subheading}</p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className={`grid ${columnClasses[columns as keyof typeof columnClasses] || columnClasses[3]} gap-6 md:gap-8`}>
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: themeColors.textColor }}
              >
                {feature.title}
              </h3>
              {feature.description && (
                <p className="text-gray-600 text-sm">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
