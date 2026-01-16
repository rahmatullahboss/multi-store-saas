/**
 * Page Builder v2 - Benefits Section Preview
 */

interface BenefitsProps {
  title?: string;
  benefits?: Array<{ icon?: string; title: string; description?: string }>;
}

export function BenefitsSectionPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'কেন আমাদের থেকে কিনবেন?', 
    benefits = [] 
  } = props as BenefitsProps;
  
  const defaultBenefits = [
    { icon: '✓', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের পণ্য' },
    { icon: '✓', title: 'দ্রুত ডেলিভারি', description: 'সারাদেশে দ্রুত পৌঁছে যাবে' },
    { icon: '✓', title: 'মানি ব্যাক গ্যারান্টি', description: 'সন্তুষ্ট না হলে টাকা ফেরত' },
  ];
  
  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;
  
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{title}</h2>
        )}
        
        <div className="space-y-6">
          {displayBenefits.map((benefit, i) => (
            <div 
              key={i} 
              className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border border-green-100"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl text-green-600">{benefit.icon || '✓'}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{benefit.title}</h3>
                {benefit.description && (
                  <p className="text-gray-600 mt-1">{benefit.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
