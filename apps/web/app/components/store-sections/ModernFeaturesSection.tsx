import type { SectionSettings } from './registry';

interface ModernFeaturesSectionProps {
  settings: SectionSettings;
  theme: any;
}

export default function ModernFeaturesSection({ settings, theme }: ModernFeaturesSectionProps) {
  const primaryColor = theme.primary;
  
  // Use settings or defaults
  const features = settings.features || [
    { icon: '✨', title: 'Premium Quality', description: 'We carefully select each product to ensure the highest quality standards.' },
    { icon: '⚡', title: 'Fast Delivery', description: 'Quick and reliable delivery to your doorstep within 24-48 hours.' },
    { icon: '💬', title: '24/7 Support', description: 'Our customer support team is always ready to help you.' },
  ];

  return (
    <section className="relative z-10 py-16 bg-white dark:bg-gray-900" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          {settings.heading && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{settings.heading}</h2>
          )}
          {settings.subheading && (
            <p className="text-gray-600 dark:text-gray-400 text-lg">{settings.subheading}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => (
            <div key={index} className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div 
                className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
