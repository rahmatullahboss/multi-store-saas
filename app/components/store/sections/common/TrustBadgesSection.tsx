/**
 * Trust Badges Section
 * 
 * Displays trust and guarantee badges.
 */

import { Shield, Truck, RefreshCw, Phone, CreditCard, Clock } from 'lucide-react';
import type { RenderContext } from '~/lib/template-resolver.server';

interface TrustBadgesSectionProps {
  sectionId: string;
  props: {
    badges?: Array<{
      icon: string;
      text: string;
      description?: string;
    }>;
    layout?: 'row' | 'grid';
  };
  context: RenderContext;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <Shield className="w-6 h-6" />,
  truck: <Truck className="w-6 h-6" />,
  refresh: <RefreshCw className="w-6 h-6" />,
  phone: <Phone className="w-6 h-6" />,
  credit: <CreditCard className="w-6 h-6" />,
  clock: <Clock className="w-6 h-6" />,
  '🔒': <span className="text-2xl">🔒</span>,
  '🚚': <span className="text-2xl">🚚</span>,
  '↩️': <span className="text-2xl">↩️</span>,
};

export default function TrustBadgesSection({ sectionId, props, context }: TrustBadgesSectionProps) {
  const {
    badges = [
      { icon: '🔒', text: 'Secure Checkout' },
      { icon: '🚚', text: 'Free Shipping' },
      { icon: '↩️', text: 'Easy Returns' },
    ],
    layout = 'row',
  } = props;

  const themeColors = context.theme;

  return (
    <section 
      id={sectionId}
      className="py-8 px-4 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className={`
          ${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'flex flex-wrap justify-center gap-8'}
        `}>
          {badges.map((badge, index) => (
            <div 
              key={index}
              className={`
                flex items-center gap-3
                ${layout === 'grid' ? 'flex-col text-center p-4 bg-white rounded-xl' : ''}
              `}
            >
              <div style={{ color: themeColors.accentColor }}>
                {ICON_MAP[badge.icon] || <span className="text-2xl">{badge.icon}</span>}
              </div>
              <div>
                <p 
                  className="font-medium"
                  style={{ color: themeColors.textColor }}
                >
                  {badge.text}
                </p>
                {badge.description && (
                  <p className="text-sm text-gray-500">{badge.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
