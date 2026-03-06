import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { UnifiedProductCard } from './UnifiedProductCard';

interface ProductGridSectionProps {
  products: SerializedProduct[];
  currency?: string;
  theme: StoreTemplateTheme;
  title?: string;
  variant?: 'default' | 'minimal' | 'bold' | 'marketplace' | 'luxury';
  props?: {
    columns?: 4 | 5 | 6;
    layout?: 'standard' | 'minimal' | 'bordered';
  };
  storeId?: number;
}

export function ProductGridSection({
  products = [],
  currency = 'BDT',
  theme,
  title,
  variant = 'default',
  props = {},
  storeId = 0,
}: ProductGridSectionProps) {
  if (products.length === 0) return null;

  const columns = props.columns || (variant === 'marketplace' ? 6 : 4);
  const layout = props.layout || (variant === 'luxury' ? 'minimal' : variant === 'marketplace' ? 'bordered' : 'standard');

  const gridCols = {
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  const isLuxury = variant === 'luxury';
  const headingFont = isLuxury ? 'Cormorant Garamond, serif' : 'inherit';

  return (
    <section 
      className={`relative ${isLuxury ? 'py-16 md:py-24' : 'py-12'}`} 
      style={{ backgroundColor: isLuxury ? theme.background : 'transparent' }}
    >
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${variant === 'marketplace' ? 'max-w-[1400px]' : 'max-w-7xl'}`}>
        {/* Marketplace Section Header */}
        {variant === 'marketplace' && (
          <div className="bg-white rounded-t-lg shadow-sm p-4 border-b mb-1" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder || '#e5e7eb' }}>
            {title && (
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Default / Luxury Section Header */}
        {variant !== 'marketplace' && title && (
          <div className={`flex items-end justify-between ${isLuxury ? 'mb-12' : 'mb-8'}`}>
            <div>
              {isLuxury && (
                <span className="text-sm font-medium tracking-widest uppercase mb-2 block" style={{ color: theme.accent }}>
                  Our Collection
                </span>
              )}
              <h2 
                className={`${isLuxury ? 'text-4xl md:text-5xl font-light' : 'text-2xl font-bold text-center'}`} 
                style={{ color: theme.text, fontFamily: headingFont }}
              >
                {title}
              </h2>
            </div>
          </div>
        )}

        <div className={`grid ${gridCols[columns]} gap-4 md:gap-6 ${variant === 'marketplace' ? 'bg-white shadow-sm rounded-b-lg p-4' : ''}`} style={variant === 'marketplace' ? { backgroundColor: theme.cardBg } : {}}>
          {products.map((product) => (
            <UnifiedProductCard 
              key={product.id} 
              product={product} 
              currency={currency} 
              theme={theme}
              variant={variant}
              layout={layout}
              storeId={storeId}
              showAddToCart={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
