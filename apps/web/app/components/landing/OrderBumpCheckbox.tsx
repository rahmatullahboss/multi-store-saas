/**
 * Order Bump Checkbox Component
 *
 * Displays add-on product offers during checkout with attractive styling
 * and animations to increase average order value (AOV).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Gift, Sparkles } from 'lucide-react';
import { OptimizedImage } from '~/components/OptimizedImage';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/lib/theme-engine';

interface OrderBumpProduct {
  id: number;
  title: string;
  price: number;
  imageUrl?: string | null;
}

interface OrderBumpProps {
  bump: {
    id: number;
    title: string;
    description?: string | null;
    discount: number;
    bumpProduct: OrderBumpProduct;
  };
  currency: string;
  isSelected: boolean;
  onToggle: (bumpId: number, selected: boolean) => void;
}

export function OrderBumpCheckbox({ bump, currency, isSelected, onToggle }: OrderBumpProps) {
  const { t, lang } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // Calculate discounted price
  const originalPrice = bump.bumpProduct.price;
  const discountedPrice =
    bump.discount > 0 ? originalPrice * (1 - bump.discount / 100) : originalPrice;
  const savings = originalPrice - discountedPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onToggle(bump.id, !isSelected)}
      className={`
        relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300
        ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
            : 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 hover:border-amber-500 hover:shadow-md'
        }
      `}
    >
      {/* Animated Border Pulse for Attention */}
      {!isSelected && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-amber-400"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Gift Badge */}
      <div className="absolute -top-3 left-4">
        <motion.div
          animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md"
        >
          <Gift className="h-3 w-3" />
          <span>{t('landingOrderBump_specialOffer')}</span>
          <Sparkles className="h-3 w-3" />
        </motion.div>
      </div>

      <div className="mt-2 flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <motion.div
            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
            className={`
              flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all
              ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'}
            `}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Product Image */}
        {bump.bumpProduct.imageUrl && (
          <div className="flex-shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <OptimizedImage
                src={bump.bumpProduct.imageUrl}
                alt={bump.bumpProduct.title}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {t('landingOrderBump_yesIWant')}
            </span>
            <span className="font-semibold text-amber-700">{bump.title}</span>
          </div>

          {bump.description && <p className="mt-1 text-sm text-gray-600">{bump.description}</p>}

          {/* Pricing */}
          <div className="mt-2 flex items-center gap-3">
            {bump.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-emerald-600">
              {formatPrice(discountedPrice)}
            </span>
            {bump.discount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                {t('landingOrderBump_offDiscount', { discount: bump.discount })}
              </span>
            )}
          </div>

          {savings > 0 && (
            <p className="mt-1 text-xs text-emerald-600">
              {t('landingOrderBump_youAreSaving', { savings: formatPrice(savings) })}
            </p>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -right-2 -top-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
            <Check className="h-5 w-5 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Order Bumps Container
 * Displays multiple order bump offers
 */
interface OrderBumpsContainerProps {
  bumps: Array<{
    id: number;
    title: string;
    description?: string | null;
    discount: number;
    bumpProduct: OrderBumpProduct;
  }>;
  currency: string;
  selectedBumpIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

export function OrderBumpsContainer({
  bumps,
  currency,
  selectedBumpIds,
  onSelectionChange,
}: OrderBumpsContainerProps) {
  const { t } = useTranslation();
  if (!bumps || bumps.length === 0) return null;

  const handleToggle = (bumpId: number, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedBumpIds, bumpId]);
    } else {
      onSelectionChange(selectedBumpIds.filter((id) => id !== bumpId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-700">
        <Gift className="h-5 w-5" />
        <h3 className="font-semibold">{t('landingOrderBump_addAndSave')}</h3>
      </div>

      <div className="space-y-3">
        {bumps.map((bump) => (
          <OrderBumpCheckbox
            key={bump.id}
            bump={bump}
            currency={currency}
            isSelected={selectedBumpIds.includes(bump.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
