/**
 * Collection Header Section
 * 
 * Title, description, and image for collection pages.
 */

import type { CollectionContext } from '~/lib/template-resolver.server';

interface CollectionHeaderSectionProps {
  sectionId: string;
  props: {
    showImage?: boolean;
    showDescription?: boolean;
    showProductCount?: boolean;
    alignment?: 'left' | 'center' | 'right';
  };
  context: CollectionContext;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export default function CollectionHeaderSection({ sectionId, props, context }: CollectionHeaderSectionProps) {
  const {
    showImage = true,
    showDescription = true,
    showProductCount = true,
    alignment = 'center',
  } = props;

  const collection = context.collection as Collection;
  const products = context.products || [];
  const themeColors = context.theme;

  if (!collection) return null;

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <section 
      id={sectionId}
      className="relative py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      {/* Background Image */}
      {showImage && collection.image && (
        <>
          <img
            src={collection.image}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}

      <div className={`relative z-10 max-w-4xl mx-auto ${alignmentClasses[alignment]}`}>
        <h1 
          className="text-3xl md:text-4xl font-bold"
          style={{ 
            color: collection.image ? '#ffffff' : themeColors.textColor,
            fontFamily: themeColors.headingFont,
          }}
        >
          {collection.name}
        </h1>

        {showDescription && collection.description && (
          <p 
            className="mt-3 text-lg max-w-2xl mx-auto opacity-90"
            style={{ 
              color: collection.image ? '#ffffff' : themeColors.textColor,
            }}
          >
            {collection.description}
          </p>
        )}

        {showProductCount && (
          <p 
            className="mt-2 text-sm opacity-75"
            style={{ 
              color: collection.image ? '#ffffff' : themeColors.textColor,
            }}
          >
            {products.length} products
          </p>
        )}
      </div>
    </section>
  );
}
