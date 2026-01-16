/**
 * Testimonials Section Preview
 */

interface TestimonialsProps {
  title?: string;
  testimonials?: Array<{ name: string; text?: string; imageUrl?: string }>;
}

export function TestimonialsSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = 'কাস্টমারদের মতামত',
    testimonials = [],
  } = props as TestimonialsProps;
  
  return (
    <section className="py-12 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {title}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                {testimonial.imageUrl ? (
                  <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div className="font-medium text-gray-900">{testimonial.name}</div>
              </div>
              {testimonial.text && (
                <p className="text-gray-600 text-sm italic">
                  "{testimonial.text}"
                </p>
              )}
            </div>
          ))}
        </div>
        
        {testimonials.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No testimonials added yet
          </p>
        )}
      </div>
    </section>
  );
}
