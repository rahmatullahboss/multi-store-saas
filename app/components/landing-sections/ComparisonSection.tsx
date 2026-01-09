/**
 * Comparison Section Component
 * 
 * Before/After comparison
 */

import { OptimizedImage } from '~/components/OptimizedImage';
import type { BaseSectionProps } from './types';

export function ComparisonSection({ config }: BaseSectionProps) {
  if (!config.comparison || (!config.comparison.beforeImage && !config.comparison.afterImage)) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-900">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-4">🔄 দেখুন পার্থক্য</h2>
        {config.comparison.description && (
          <p className="text-gray-400 text-center mb-8">{config.comparison.description}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.comparison.beforeImage && (
            <div className="text-center">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-red-500/50 shadow-lg mb-4">
                <OptimizedImage 
                  src={config.comparison.beforeImage} 
                  alt="Before" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="inline-block px-4 py-2 bg-red-500 text-white font-bold rounded-full shadow">
                ❌ {config.comparison.beforeLabel || 'আগে'}
              </span>
            </div>
          )}
          {config.comparison.afterImage && (
            <div className="text-center">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-emerald-500/50 shadow-lg mb-4">
                <OptimizedImage 
                  src={config.comparison.afterImage} 
                  alt="After" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="inline-block px-4 py-2 bg-emerald-500 text-white font-bold rounded-full shadow">
                ✅ {config.comparison.afterLabel || 'পরে'}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
