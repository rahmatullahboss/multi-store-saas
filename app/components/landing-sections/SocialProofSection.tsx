/**
 * Social Proof Section Component
 * 
 * Shows order/visitor count
 */

import type { BaseSectionProps } from './types';

export function SocialProofSection({ config }: BaseSectionProps) {
  if (!config.socialProof || (config.socialProof.count <= 0 && !config.socialProof.text)) {
    return null;
  }

  return (
    <section className="py-8 bg-emerald-600">
      <div className="container max-w-4xl mx-auto px-4 text-center text-white">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl md:text-5xl font-bold">{config.socialProof.count}+</span>
          <span className="text-xl md:text-2xl">{config.socialProof.text}</span>
        </div>
      </div>
    </section>
  );
}
