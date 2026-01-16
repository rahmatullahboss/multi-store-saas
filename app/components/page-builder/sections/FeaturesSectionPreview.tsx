/**
 * Features Section Preview
 */

interface FeaturesProps {
  title?: string;
  features?: Array<{ icon: string; title: string; description: string }>;
}

export function FeaturesSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = 'প্রধান বৈশিষ্ট্যসমূহ',
    features = [],
  } = props as FeaturesProps;
  
  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {title}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {features.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No features added yet
          </p>
        )}
      </div>
    </section>
  );
}
