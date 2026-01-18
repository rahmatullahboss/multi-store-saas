/**
 * Page Builder v2 - Showcase Section Preview
 */

interface ShowcaseProps {
  title?: string;
  description?: string;
  images?: string[];
  specs?: Array<{ label: string; value: string }>;
}

export function ShowcaseSectionPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'প্রোডাক্ট ডিটেইলস',
    description = 'এখানে আপনার প্রোডাক্টের বিস্তারিত বর্ণনা লিখুন। গ্রাহকদের জানান কেন এই প্রোডাক্টটি তাদের জন্য সেরা।',
    images = [],
    specs = [
      { label: 'ম্যাটেরিয়াল', value: 'প্রিমিয়াম কোয়ালিটি' },
      { label: 'সাইজ', value: 'ফ্রি সাইজ' },
      { label: 'ওজন', value: '২০০ গ্রাম' },
    ],
  } = props as ShowcaseProps;
  
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
              {images[0] ? (
                <img src={images[0]} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Main Image
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  {images[i] ? (
                    <img src={images[i]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      {i}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Details */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
            
            {/* Specs */}
            {specs.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-4">স্পেসিফিকেশন</h3>
                {specs.map((spec, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-600">{spec.label}</span>
                    <span className="font-medium text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
