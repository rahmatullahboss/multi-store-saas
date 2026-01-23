/**
 * Delivery Section Preview - Per-Section Styling Enabled
 */

import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface DeliveryProps extends SectionStyleProps {
  title?: string;
  areas?: Array<{ name: string; time: string; cost?: string }>;
  note?: string;
}

export function DeliverySectionPreview({ props }: { props: Record<string, unknown> }) {
  const { 
    title = 'ডেলিভারি তথ্য',
    areas = [
      { name: 'ঢাকার ভেতর', time: '১-২ দিন', cost: '৳৬০' },
      { name: 'ঢাকার বাইরে', time: '৩-৫ দিন', cost: '৳১২০' },
    ],
    note = 'সকল ডেলিভারি Cash on Delivery তে পাওয়া যাবে',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as DeliveryProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  const finalHeadingColor = headingColor || textColor || '#111827';
  const finalTextColor = textColor || '#6B7280';
  
  return (
    <section 
      className="py-12 px-4" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#EEF2FF',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-8"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">এলাকা</th>
                <th className="px-6 py-3 text-left">সময়</th>
                <th className="px-6 py-3 text-left">চার্জ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {areas.map((area, i) => (
                <tr key={i} className="hover:bg-blue-50">
                  <td className="px-6 py-4 font-medium">{area.name}</td>
                  <td className="px-6 py-4 text-gray-600">{area.time}</td>
                  <td className="px-6 py-4 text-blue-600 font-semibold">{area.cost || 'ফ্রি'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {note && (
          <p className="text-center mt-4 text-sm" style={{ color: finalTextColor }}>
            💡 {note}
          </p>
        )}
      </div>
    </section>
  );
}
