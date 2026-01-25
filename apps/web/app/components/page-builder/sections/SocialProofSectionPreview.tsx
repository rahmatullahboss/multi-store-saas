import { Users, ShoppingBag, Star, Award, Truck, Headphones, MessageCircle, Image as ImageIcon } from 'lucide-react';
import type { SocialProofProps } from '~/lib/page-builder/schemas';

interface Props {
  props: SocialProofProps;
}

export function SocialProofSectionPreview({ props }: Props) {
  // Defaults handled by Zod, but safe fallbacks here just in case
  const { 
    display = { social: true, features: true, testimonials: true, gallery: true },
    style = 'default',
    customColors,
    socialTitle = 'Trusted by thousands',
    socialStats = [],
    featuresTitle = 'Why Buy From Us?',
    features = [],
    testimonialsTitle = 'Customer Stories',
    testimonials = [],
    galleryTitle = 'Customer Photos',
    galleryImages = []
  } = props as SocialProofProps; // Cast until prop drilling is strictly typed

  // Theme Colors based on style preset
  const getTheme = () => {
    switch (style) {
      case 'dark': return { bg: 'bg-gray-900', text: 'text-white', accent: 'text-purple-400', card: 'bg-gray-800', border: 'border-gray-700' };
      case 'brand': return { bg: 'bg-indigo-600', text: 'text-white', accent: 'text-indigo-200', card: 'bg-white/10', border: 'border-white/20' };
      case 'green': return { bg: 'bg-emerald-50', text: 'text-emerald-900', accent: 'text-emerald-600', card: 'bg-white', border: 'border-emerald-100' };
      case 'red': return { bg: 'bg-rose-50', text: 'text-rose-900', accent: 'text-rose-600', card: 'bg-white', border: 'border-rose-100' };
      default: return { bg: 'bg-white', text: 'text-gray-900', accent: 'text-indigo-600', card: 'bg-gray-50', border: 'border-gray-100' };
    }
  };

  const theme = getTheme();
  const customStyle = customColors?.background ? { backgroundColor: customColors.background } : undefined;
  const customTextStyle = customColors?.text ? { color: customColors.text } : undefined;

  const IconMap: Record<string, any> = { Users, ShoppingBag, Star, Award, Truck, Headphones, MessageCircle, ImageIcon };

  return (
    <div className={`flex flex-col gap-12 py-16 ${theme.bg} transition-colors duration-300`} style={customStyle}>
      
      {/* 1. SOCIAL STATS */}
      {display.social && (
        <section className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className={`text-2xl font-bold mb-2 ${theme.text}`} style={customTextStyle}>{socialTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            {socialStats.map((stat, i) => {
              const Icon = stat.icon ? IconMap[stat.icon] : Users;
              return (
                <div key={i} className={`p-6 rounded-xl ${theme.card} ${theme.border} border shadow-sm`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${style === 'brand' || style === 'dark' ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    {Icon && <Icon className="w-6 h-6" />}
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${theme.text}`} style={customTextStyle}>{stat.value}</div>
                  <div className={`text-sm opacity-80 ${theme.text}`} style={customTextStyle}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. FEATURES */}
      {display.features && (
        <section className="container mx-auto px-4">
           {/* Divider if previous section exists */}
           {display.social && <div className={`w-full max-w-xl mx-auto h-px ${theme.border} mb-12 opacity-50`} />}
           
           <div className="text-center mb-10">
             <h2 className={`text-2xl font-bold ${theme.text}`} style={customTextStyle}>{featuresTitle}</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, i) => {
                const Icon = feature.icon ? IconMap[feature.icon] : Award;
                return (
                  <div key={i} className="text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${style === 'brand' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-900'}`}>
                       {Icon && <Icon className="w-7 h-7" />}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${theme.text}`} style={customTextStyle}>{feature.title}</h3>
                    <p className={`text-sm opacity-70 ${theme.text}`} style={customTextStyle}>{feature.description}</p>
                  </div>
                )
              })}
           </div>
        </section>
      )}

      {/* 3. TESTIMONIALS */}
      {display.testimonials && (
        <section className="container mx-auto px-4">
           {(display.social || display.features) && <div className={`w-full max-w-xl mx-auto h-px ${theme.border} mb-12 opacity-50`} />}
           
           <div className="text-center mb-10">
             <h2 className={`text-2xl font-bold ${theme.text}`} style={customTextStyle}>{testimonialsTitle}</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonials.map((t, i) => (
                <div key={i} className={`p-6 rounded-xl ${theme.card} border ${theme.border}`}>
                   <div className="flex gap-1 mb-3 text-amber-400">
                      {[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                   </div>
                   <p className={`mb-4 opacity-90 ${theme.text}`} style={customTextStyle}>"{t.text}"</p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                         {t.avatar ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover"/> : t.name.charAt(0)}
                      </div>
                      <div>
                         <p className={`font-bold text-sm ${theme.text}`} style={customTextStyle}>{t.name}</p>
                         <p className={`text-xs opacity-60 ${theme.text}`} style={customTextStyle}>Verified Customer</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* 4. GALLERY */}
      {display.gallery && (
        <section className="container mx-auto px-4">
           {(display.social || display.features || display.testimonials) && <div className={`w-full max-w-xl mx-auto h-px ${theme.border} mb-12 opacity-50`} />}
           
           <div className="text-center mb-10">
             <h2 className={`text-2xl font-bold ${theme.text}`} style={customTextStyle}>{galleryTitle}</h2>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {galleryImages.map((img, i) => (
                 <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
              ))}
           </div>
        </section>
      )}

    </div>
  );
}
