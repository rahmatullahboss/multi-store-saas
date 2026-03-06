import type { SerializedProduct, StoreTemplateTheme } from '~/templates/store-registry';
import { ProductCardMarketplace } from './ProductCardMarketplace';

interface ProductGridSectionProps {
  products: SerializedProduct[];
  currency?: string;
  theme: StoreTemplateTheme;
  title?: string;
  variant?: 'default' | 'minimal' | 'bold' | 'marketplace' | 'luxury';
  columns?: 4 | 5 | 6;
}

export function ProductGridSection({
  products = [],
  currency = 'BDT',
  theme,
  title,
  variant = 'default',
  columns = 6,
}: ProductGridSectionProps) {
  if (products.length === 0) return null;

  const gridCols = {
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  if (variant === 'marketplace') {
    return (
      <section className="bg-white rounded-lg shadow-sm mb-6 p-4" style={{ backgroundColor: theme.cardBg }}>
        {title && (
          <h2 className="text-lg font-bold mb-4" style={{ color: theme.text }}>
            {title}
          </h2>
        )}

        <div className={`grid ${gridCols[columns]} gap-3 md:gap-4`}>
          {products.map((product) => (
            <ProductCardMarketplace 
              key={product.id} 
              product={product} 
              currency={currency} 
              theme={theme} 
            />
          ))}
        </div>
      </section>
    );
  }

  // Fallback / Default layout
  return (
    <section className="py-12">
       <div className="max-w-7xl mx-auto px-4">
        {title && (
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: theme.text }}>
            {title}
          </h2>
        )}
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder || '#e5e7eb' }}>
               <img src={product.imageUrl || '/placeholder-product.svg'} alt={product.name} className="w-full aspect-square object-cover mb-4 rounded"/>
               <h3 className="font-medium text-sm mb-2 truncate" style={{ color: theme.text }}>{product.name}</h3>
               <p className="font-bold" style={{ color: theme.primary }}>{currency} {product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
