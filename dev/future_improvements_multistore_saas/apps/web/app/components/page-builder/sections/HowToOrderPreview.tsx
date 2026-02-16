/**
 * Page Builder v2 - How To Order Section Preview
 */

interface HowToOrderProps {
  title?: string;
  steps?: Array<{ title: string; description?: string }>;
}

export function HowToOrderPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'কিভাবে অর্ডার করবেন?',
    steps = [
      { title: 'ফর্ম পূরণ করুন', description: 'আপনার নাম, ফোন ও ঠিকানা দিন' },
      { title: 'অর্ডার কনফার্ম করুন', description: 'আমরা ফোন করে কনফার্ম করব' },
      { title: 'পণ্য গ্রহণ করুন', description: 'বাসায় বসে ক্যাশ অন ডেলিভারিতে পেয়ে যান' },
    ],
  } = props as HowToOrderProps;
  
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{title}</h2>
        )}
        
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%-24px)] right-[calc(16.67%-24px)] h-1 bg-purple-200 rounded-full" />
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                {/* Step Number */}
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                  {i + 1}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                {step.description && (
                  <p className="text-gray-600">{step.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
