
import { Truck, Shield, RotateCcw, Headphones, Star, Zap, Lock, CreditCard, Gift, ThumbsUp } from 'lucide-react';
import type { SectionSettings } from './registry';

interface FeaturesSectionProps {
  settings: SectionSettings;
  theme: any;
}

const ICON_MAP: Record<string, any> = {
  Truck, Shield, RotateCcw, Headphones, Star, Zap, Lock, CreditCard, Gift, ThumbsUp
};

import { withAISchema, type AISchema } from '~/utils/ai-editable';

export const FEATURES_AI_SCHEMA: AISchema = {
  component: 'FeaturesSection',
  version: '1.0.0',
  properties: {
    heading: { type: 'string', maxLength: 100, aiAction: 'enhance' },
    subheading: { type: 'string', maxLength: 200, aiAction: 'enhance' },
    backgroundColor: { type: 'string', maxLength: 20 },
    // Array support to be added to validator later
    features: { type: 'array', aiAction: 'generate-array' } 
  }
};

function FeaturesSectionBase({ settings, theme }: FeaturesSectionProps) {
  const features = settings.features || [
    { icon: 'Truck', title: 'Free Delivery', description: 'On all orders' },
    { icon: 'Shield', title: 'Secure Payment', description: '100% secure' },
    { icon: 'RotateCcw', title: 'Easy Returns', description: '30 day returns' },
    { icon: 'Headphones', title: '24/7 Support', description: 'Friendly support' },
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div 
        className="bg-white rounded-2xl shadow-sm p-8"
        style={{  backgroundColor: settings.backgroundColor || 'white' }}
      >
        {settings.heading && (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>{settings.heading}</h2>
            {settings.subheading && <p className="text-gray-500">{settings.subheading}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature: any, index: number) => {
            const Icon = ICON_MAP[feature.icon] || Truck;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  <Icon className="w-8 h-8" style={{ color: theme.primary }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: theme.text }}>{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const FeaturesSection = withAISchema(FeaturesSectionBase, FEATURES_AI_SCHEMA);
export default FeaturesSection;
