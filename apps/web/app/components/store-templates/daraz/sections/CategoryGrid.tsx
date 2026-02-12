/**
 * Daraz Category Grid
 * 
 * 2-row category icon grid matching Daraz Bangladesh homepage
 * Features:
 * - Square/circular category icons with labels
 * - 8 categories per row (responsive)
 * - Hover effects
 */

import { Link } from '@remix-run/react';
import { DARAZ_THEME } from '../theme';
import type { StoreCategory } from '~/templates/store-registry';
import { 
  Shirt, Home, Smartphone, Tv, Gift, Heart, Car, Utensils,
  Baby, Dumbbell, BookOpen, Gamepad2, Laptop, Watch, ShoppingBag, Package
} from 'lucide-react';

interface CategoryGridProps {
  categories?: (string | StoreCategory | null)[];
  categoryImages?: Record<string, string>;
  maxCategories?: number;
}

// Icon mapping for common category names
const CATEGORY_ICONS: Record<string, typeof Shirt> = {
  'fashion': Shirt,
  'clothing': Shirt,
  'apparel': Shirt,
  'womens fashion': Shirt,
  'mens fashion': Shirt,
  'home': Home,
  'home & living': Home,
  'furniture': Home,
  'phones': Smartphone,
  'mobile': Smartphone,
  'electronics': Tv,
  'tv': Tv,
  'appliances': Tv,
  'beauty': Heart,
  'health': Heart,
  'health & beauty': Heart,
  'automotive': Car,
  'motors': Car,
  'food': Utensils,
  'groceries': Utensils,
  'grocery': Utensils,
  'baby': Baby,
  'kids': Baby,
  'toys': Baby,
  'sports': Dumbbell,
  'fitness': Dumbbell,
  'books': BookOpen,
  'stationery': BookOpen,
  'gaming': Gamepad2,
  'computers': Laptop,
  'laptops': Laptop,
  'watches': Watch,
  'accessories': Watch,
  'bags': ShoppingBag,
  'gift': Gift,
  'gifts': Gift,
};

function getCategoryIcon(category: string) {
  const lowerCategory = category.toLowerCase();
  
  // Try exact match first
  if (CATEGORY_ICONS[lowerCategory]) {
    return CATEGORY_ICONS[lowerCategory];
  }
  
  // Try partial match
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return icon;
    }
  }
  
  // Default icon
  return Package;
}

// Generate placeholder image for category
function getCategoryImage(category: string, index: number): string {
  const images = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop',
  ];
  return images[index % images.length];
}

export function DarazCategoryGrid({
  categories = [],
  categoryImages = {},
  maxCategories = 16
}: CategoryGridProps) {
  const validCategories = categories
    .filter((category): category is string | StoreCategory => Boolean(category))
    .slice(0, maxCategories)
    .map((category) => {
      if (typeof category === 'string') {
        return {
          id: category,
          title: category,
          imageUrl: categoryImages[category] || null,
        };
      }
      return {
        id: category.id ?? category.slug ?? category.title,
        title: category.title,
        imageUrl: category.imageUrl ?? null,
      };
    });

  if (validCategories.length === 0) return null;

  return (
    <section className="bg-white rounded-lg shadow-sm mb-6 p-4">
      <h2 
        className="text-lg font-bold mb-4"
        style={{ color: DARAZ_THEME.text }}
      >
        Categories
      </h2>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 md:gap-4">
        {validCategories.map((category) => {
          const IconComponent = getCategoryIcon(category.title);
          
          return (
            <Link
              key={String(category.id)}
              to={`/?category=${encodeURIComponent(category.title)}`}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              {/* Category Image/Icon Container */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <IconComponent 
                    className="w-7 h-7 md:w-8 md:h-8 transition-transform group-hover:scale-110"
                    style={{ color: DARAZ_THEME.primary }}
                  />
                )}
              </div>
              
              {/* Category Name */}
              <span 
                className="text-[10px] md:text-xs text-center line-clamp-2 transition-colors group-hover:text-orange-500"
                style={{ color: DARAZ_THEME.text }}
              >
                {category.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Alternative: Category grid with images (for stores with category images)
 */
export function DarazCategoryGridWithImages({
  categories = [],
  categoryImages = {},
  maxCategories = 16
}: CategoryGridProps & { categoryImages?: Record<string, string> }) {
  const validCategories = categories.filter(Boolean).slice(0, maxCategories) as string[];

  if (validCategories.length === 0) return null;

  return (
    <section className="bg-white rounded-lg shadow-sm mb-6 p-4">
      <h2 
        className="text-lg font-bold mb-4"
        style={{ color: DARAZ_THEME.text }}
      >
        Categories
      </h2>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 md:gap-4">
        {validCategories.map((category, index) => (
          <Link
            key={category}
            to={`/?category=${encodeURIComponent(category)}`}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            {/* Category Image */}
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 group-hover:shadow-md transition-shadow">
              <img
                src={categoryImages[category] || getCategoryImage(category, index)}
                alt={category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            
            {/* Category Name */}
            <span 
              className="text-[10px] md:text-xs text-center line-clamp-2 transition-colors group-hover:text-orange-500"
              style={{ color: DARAZ_THEME.text }}
            >
              {category}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
