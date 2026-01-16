/**
 * Trust Badges Section Preview
 */

interface TrustBadgesProps {
  title?: string;
  badges?: Array<{ icon: string; text: string }>;
}

export function TrustBadgesSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = '',
    badges = [],
  } = props as TrustBadgesProps;
  
  return (
    <section className="py-6 px-6 bg-gray-50 border-y border-gray-100">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h3 className="text-lg font-semibold text-center text-gray-900 mb-4">
            {title}
          </h3>
        )}
        
        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-gray-700"
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
        
        {badges.length === 0 && (
          <p className="text-center text-gray-400 py-4">
            No trust badges added yet
          </p>
        )}
      </div>
    </section>
  );
}
