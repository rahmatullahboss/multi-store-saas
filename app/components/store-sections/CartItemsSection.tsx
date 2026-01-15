
import { Link } from '@remix-run/react';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useTranslation, useFormatPrice } from '~/contexts/LanguageContext';
import type { SectionSettings } from './registry';

interface CartItemsSectionProps {
  settings: SectionSettings;
  theme: any;
  currency?: string;
}

export function CartItemsSection({ settings, theme, currency = 'BDT' }: CartItemsSectionProps) {
  const { t } = useTranslation();
  const formatPrice = useFormatPrice();
  const primaryColor = settings.primaryColor || theme.primary || '#000000';
  const backgroundColor = settings.backgroundColor || 'transparent';

  // Note: Actual cart state is managed client-side via localStorage in a separate script/hook
  // This component provides the structural markup that the client-side logic attaches to.
  // In a full React hydration model, we'd pass cart items as props, but the current cart.tsx 
  // uses a hybrid approach with client-side vanilla JS for localStorage.
  
  // For the purpose of the generic section, we'll render the container structure.
  // The existing cart.tsx logic (which we will preserve/adapt) operates on DOM elements with specific IDs.

  return (
    <section className="py-8 px-4" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold mb-8" style={{ color: theme.text }}>
          {settings.heading || t('yourCart')}
        </h1>

        <div className="lg:col-span-2 space-y-4" id="cart-items">
          {/* Empty Cart Placeholder - items loaded client-side from localStorage */}
          <div className="rounded-xl border border-gray-200 p-8 text-center bg-white">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <ShoppingBag className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <p className="text-lg font-medium mb-2" style={{ color: theme.text }}>{settings.emptyText || t('cartEmpty')}</p>
            <p className="text-gray-500 mb-6">Add some products to get started!</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {settings.continueShoppingText || t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
