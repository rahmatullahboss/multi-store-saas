/**
 * Page Builder v2 - Comparison Section Preview
 */

interface ComparisonProps {
  title?: string;
  beforeTitle?: string;
  afterTitle?: string;
  beforeItems?: string[];
  afterItems?: string[];
}

export function ComparisonSectionPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'আগে vs পরে',
    beforeTitle = '❌ আগে',
    afterTitle = '✅ এখন',
    beforeItems = ['সমস্যা ১', 'সমস্যা ২', 'সমস্যা ৩'],
    afterItems = ['সমাধান ১', 'সমাধান ২', 'সমাধান ৩'],
  } = props as ComparisonProps;
  
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{title}</h2>
        )}
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before Column */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <h3 className="text-lg font-bold text-red-700 mb-4">{beforeTitle}</h3>
            <ul className="space-y-3">
              {beforeItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-red-800">
                  <span className="text-red-500">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* After Column */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-bold text-green-700 mb-4">{afterTitle}</h3>
            <ul className="space-y-3">
              {afterItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-green-800">
                  <span className="text-green-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
