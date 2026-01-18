/**
 * Collection List Section for Store Homepage
 * 
 * Displays store collections/categories in a grid layout.
 */

import { Link } from '@remix-run/react';
import { Folder } from 'lucide-react';
import type { HomeContext } from '~/lib/template-resolver.server';

interface CollectionListSectionProps {
  sectionId: string;
  props: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'slider';
    columns?: number;
  };
  context: HomeContext;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export default function CollectionListSection({ sectionId, props, context }: CollectionListSectionProps) {
  const {
    title = 'Shop by Category',
    subtitle,
    layout = 'grid',
    columns = 3,
  } = props;

  const collections = (context.collections as Collection[]) || [];
  const themeColors = context.theme;

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  if (collections.length === 0) {
    return null;
  }

  return (
    <section 
      id={sectionId}
      className="py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-2xl md:text-3xl font-bold"
            style={{ 
              color: themeColors.textColor,
              fontFamily: themeColors.headingFont,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>

        {/* Collection Grid */}
        <div className={`grid ${columnClasses[columns as keyof typeof columnClasses] || columnClasses[3]} gap-4 md:gap-6`}>
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              themeColors={themeColors}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Collection Card Sub-component
// ============================================================================

function CollectionCard({
  collection,
  themeColors,
}: {
  collection: Collection;
  themeColors: any;
}) {
  const collectionUrl = `/collections/${collection.slug}`;

  return (
    <Link
      to={collectionUrl}
      className="group relative aspect-[4/3] md:aspect-square rounded-xl overflow-hidden"
    >
      {/* Background */}
      {collection.image ? (
        <img
          src={collection.image}
          alt={collection.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: themeColors.accentColor + '20' }}
        >
          <Folder className="w-16 h-16" style={{ color: themeColors.accentColor }} />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-lg md:text-xl font-bold group-hover:underline">
          {collection.name}
        </h3>
        {collection.productCount !== undefined && (
          <p className="text-sm opacity-80 mt-1">
            {collection.productCount} products
          </p>
        )}
      </div>
    </Link>
  );
}
