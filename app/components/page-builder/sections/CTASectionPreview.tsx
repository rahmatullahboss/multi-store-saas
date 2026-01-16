/**
 * CTA / Order Form Section Preview
 */

interface CTAProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  nameLabel?: string;
  phoneLabel?: string;
  addressLabel?: string;
}

export function CTASectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    headline = 'এখনই অর্ডার করুন',
    subheadline = '',
    buttonText = 'অর্ডার কনফার্ম করুন',
    nameLabel = 'আপনার নাম',
    phoneLabel = 'মোবাইল নম্বর',
    addressLabel = 'ঠিকানা',
  } = props as CTAProps;
  
  return (
    <section className="py-12 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-center text-gray-600 mb-6">{subheadline}</p>
          )}
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {nameLabel}
              </label>
              <input
                type="text"
                placeholder="আপনার নাম লিখুন"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {phoneLabel}
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {addressLabel}
              </label>
              <textarea
                placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                disabled
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
