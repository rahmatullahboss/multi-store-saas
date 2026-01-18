/**
 * Page Builder v2 - Pricing Section Preview
 */

interface PricingProps {
  title?: string;
  packages?: Array<{
    name: string;
    price: string;
    originalPrice?: string;
    features?: string[];
    isPopular?: boolean;
  }>;
}

export function PricingSectionPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'আমাদের প্যাকেজ',
    packages = [
      { 
        name: 'স্ট্যান্ডার্ড', 
        price: '৳৯৯৯', 
        originalPrice: '৳১৪৯৯',
        features: ['১টি পণ্য', 'ফ্রি ডেলিভারি', '৭ দিন গ্যারান্টি'],
        isPopular: false,
      },
      { 
        name: 'প্রিমিয়াম', 
        price: '৳১৯৯৯', 
        originalPrice: '৳২৯৯৯',
        features: ['২টি পণ্য', 'ফ্রি ডেলিভারি', '১৫ দিন গ্যারান্টি', 'ফ্রি গিফট'],
        isPopular: true,
      },
    ],
  } = props as PricingProps;
  
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{title}</h2>
        )}
        
        <div className="grid md:grid-cols-2 gap-6">
          {packages.map((pkg, i) => (
            <div 
              key={i} 
              className={`rounded-xl p-6 border-2 relative ${
                pkg.isPopular 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {pkg.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                  সবচেয়ে জনপ্রিয়
                </span>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-indigo-600">{pkg.price}</span>
                {pkg.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">{pkg.originalPrice}</span>
                )}
              </div>
              
              <ul className="space-y-2 mb-6">
                {(pkg.features || []).map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  pkg.isPopular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                অর্ডার করুন
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
