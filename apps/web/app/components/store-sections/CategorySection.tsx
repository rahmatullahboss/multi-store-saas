import { Link, useSearchParams } from '@remix-run/react';
import type { SectionSettings } from './registry';
import { Smartphone, Shirt, Watch, Laptop, Home as HomeIcon, Car, Baby, Dumbbell, Sparkles, ShoppingBag, Grid3X3, type LucideIcon } from 'lucide-react';
import { buildProxyImageUrl } from '~/utils/imageOptimization';
import type { StoreCategory } from '~/templates/store-registry';

interface CategorySectionProps {
  settings: SectionSettings;
  theme: Record<string, string>;
  categories: (string | StoreCategory)[];
}

// Map strings to Lucide icons
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Electronics': Smartphone,
  'Fashion': Shirt,
  'Watches': Watch,
  'Computers': Laptop,
  'Home': HomeIcon,
  'Automotive': Car,
  'Babies': Baby,
  'Sports': Dumbbell,
  'Beauty': Sparkles,
  'Groceries': ShoppingBag,
  'default': ShoppingBag,
};

const getCategoryIcon = (category: string) => {
  const normalized = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return CATEGORY_ICONS[normalized] || CATEGORY_ICONS['default'];
};

import { withAISchema, type AISchema } from '~/utils/ai-editable';

export const CATEGORY_AI_SCHEMA: AISchema = {
  component: 'CategorySection',
  version: '1.0.0',
  properties: {
    heading: { type: 'string', maxLength: 50, aiAction: 'enhance' },
    limit: { type: 'number', aiAction: 'select', options: [4, 8, 12, 16] },
    layout: { type: 'string', aiEnum: ['grid', 'tabs', 'pills', 'scroll'], aiAction: 'select' }
  }
};

function CategorySectionBase({ settings, theme, categories }: CategorySectionProps) {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');
  const validCategories = categories.filter(Boolean).slice(0, settings.limit || 8);
  const layout = settings.layout || 'grid'; // 'grid' | 'tabs' | 'pills' | 'scroll'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryImageMap = ((settings as any)?.categoryImageMap || {}) as Record<string, string>;

  // Helper to extract category data
  const getCategoryData = (cat: string | StoreCategory) => {
    const isObject = typeof cat === 'object' && cat !== null;
    return {
      title: isObject ? ((cat as StoreCategory).title ?? '') : (cat as string),
      imageUrl: isObject
        ? (cat as StoreCategory).imageUrl
        : categoryImageMap[cat as string] || null,
      id: isObject ? ((cat as StoreCategory).id ?? '') : (cat as string),
      slug: isObject ? (cat as StoreCategory).slug : null
    };
  };

  // Styles for different layouts
  
  // 1. TABS LAYOUT (TechModern style)
  if (layout === 'tabs') {
    return (
      <section className="bg-white border-b border-gray-100 sticky top-16 lg:top-20 z-40 shadow-sm" style={{ backgroundColor: theme.headerBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            <Link
              to="/"
              className="flex-shrink-0 px-6 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: !currentCategory ? theme.accent : 'transparent',
                color: !currentCategory ? 'white' : theme.muted,
              }}
            >
              All
            </Link>
            {validCategories.map((cat) => {
              const { title, id } = getCategoryData(cat);
              return (
                <Link
                  key={id}
                  to={`/?category=${encodeURIComponent(title)}`}
                  className="flex-shrink-0 px-6 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                  style={{
                    backgroundColor: currentCategory === title ? theme.accent : 'transparent',
                    color: currentCategory === title ? 'white' : theme.muted,
                  }}
                >
                  {title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 2. PILLS LAYOUT (ArtisanMarket style)
  if (layout === 'pills') {
    return (
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all"
              style={{
                backgroundColor: !currentCategory ? theme.accent : 'transparent',
                color: !currentCategory ? 'white' : theme.primary,
                borderColor: !currentCategory ? theme.accent : '#d6d3d1',
              }}
            >
              All Products
            </Link>
            {validCategories.map((cat) => {
              const { title, id } = getCategoryData(cat);
              return (
                <Link
                  key={id}
                  to={`/?category=${encodeURIComponent(title)}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all"
                  style={{
                    backgroundColor: currentCategory === title ? theme.accent : 'transparent',
                    color: currentCategory === title ? 'white' : theme.primary,
                    borderColor: currentCategory === title ? theme.accent : '#d6d3d1',
                  }}
                >
                  {title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 3. SCROLL LAYOUT (ModernPremium style chips)
  if (layout === 'scroll') {
    return (
      <section className="relative z-10 max-w-7xl mx-auto px-4 lg:px-10 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            to="/"
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 sm:px-6 font-medium text-sm transition-all border"
            style={{
              backgroundColor: !currentCategory ? theme.primary : theme.cardBg,
              color: !currentCategory ? 'white' : theme.text,
              borderColor: !currentCategory ? theme.primary : '#e5e7eb'
            }}
          >
            <Grid3X3 className="h-4 w-4" />
            All
          </Link>
          {validCategories.map((cat) => {
             const { title, imageUrl, id } = getCategoryData(cat);
             const Icon = getCategoryIcon(title);
             const isActive = currentCategory === title;
             return (
               <Link
                 key={id}
                 to={`/?category=${encodeURIComponent(title)}`}
                 className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 sm:px-6 font-medium text-sm transition-all border hover:border-blue-300"
                 style={{
                   backgroundColor: isActive ? theme.primary : theme.cardBg,
                   color: isActive ? 'white' : theme.text,
                   borderColor: isActive ? theme.primary : '#e5e7eb'
                 }}
               >
                 {imageUrl ? (
                   <img 
                     src={buildProxyImageUrl(imageUrl, { width: 40, height: 40 })} 
                     alt={title} 
                     className="h-6 w-6 rounded-full object-cover" 
                   />
                 ) : (
                   <Icon className="h-4 w-4" />
                 )}
                 {title}
               </Link>
             );
          })}
        </div>
      </section>
    );
  }

  // 4. GRID LAYOUT (Marketplace icons) - Default
  return (
    <section className="py-6 px-4 bg-white shadow-sm mb-4 rounded-lg max-w-7xl mx-auto">
      <h2 className="font-bold text-lg mb-4" style={{ color: theme.text }}>{settings.heading || 'Categories'}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {validCategories.map((cat) => {
          const { title, imageUrl, id } = getCategoryData(cat);
          const Icon = getCategoryIcon(title);
          return (
            <Link
              key={id}
              to={`/?category=${encodeURIComponent(title)}`}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition group"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden"
                style={{ backgroundColor: `${theme.primary}10` }}
              >
                {imageUrl ? (
                  <img 
                    src={buildProxyImageUrl(imageUrl, { width: 100, height: 100 })} 
                    alt={title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Icon className="w-7 h-7" style={{ color: theme.primary }} />
                )}
              </div>
              <span className="text-xs text-center font-medium line-clamp-2" style={{ color: theme.text }}>
                {title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const CategorySection = withAISchema(CategorySectionBase, CATEGORY_AI_SCHEMA);
export default CategorySection;
