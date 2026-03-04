import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Order Bump Checkbox Component
 *
 * Displays add-on product offers during checkout with attractive styling
 * and animations to increase average order value (AOV).
 */
import { useState } from 'react';
import { Check, Gift, Sparkles } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useTranslation } from '@/app/contexts/LanguageContext';
export function OrderBumpCheckbox({ bump, currency, isSelected, onToggle }) {
    const { t, lang } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    // Calculate discounted price
    const originalPrice = bump.bumpProduct.price;
    const discountedPrice = bump.discount > 0 ? originalPrice * (1 - bump.discount / 100) : originalPrice;
    const savings = originalPrice - discountedPrice;
    const formatPrice = (price) => {
        if (currency === 'BDT' || currency === '৳') {
            return lang === 'bn'
                ? `৳${price.toLocaleString('bn-BD')}`
                : `৳${price.toLocaleString('en-IN')}`;
        }
        return `${currency}${price.toFixed(2)}`;
    };
    return (_jsxs("div", { onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onClick: () => onToggle(bump.id, !isSelected), className: `
        relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300
        ${isSelected
            ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
            : 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 hover:border-amber-500 hover:shadow-md'}
      `, children: [!isSelected && _jsx("div", { className: "absolute inset-0 rounded-xl border-2 border-amber-400" }), _jsx("div", { className: "absolute -top-3 left-4", children: _jsxs("div", { className: "flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md", children: [_jsx(Gift, { className: "h-3 w-3" }), _jsx("span", { children: t('landingOrderBump_specialOffer') }), _jsx(Sparkles, { className: "h-3 w-3" })] }) }), _jsxs("div", { className: "mt-2 flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0 pt-1", children: _jsx("div", { className: `
              flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all
              ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'}
            `, children: isSelected && (_jsx("div", { children: _jsx(Check, { className: "h-4 w-4 text-white" }) })) }) }), bump.bumpProduct.imageUrl && (_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white", children: _jsx(OptimizedImage, { src: bump.bumpProduct.imageUrl, alt: bump.bumpProduct.title, width: 64, height: 64, className: "h-full w-full object-cover" }) }) })), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-bold text-gray-900", children: t('landingOrderBump_yesIWant') }), _jsx("span", { className: "font-semibold text-amber-700", children: bump.title })] }), bump.description && _jsx("p", { className: "mt-1 text-sm text-gray-600", children: bump.description }), _jsxs("div", { className: "mt-2 flex items-center gap-3", children: [bump.discount > 0 && (_jsx("span", { className: "text-sm text-gray-400 line-through", children: formatPrice(originalPrice) })), _jsx("span", { className: "text-lg font-bold text-emerald-600", children: formatPrice(discountedPrice) }), bump.discount > 0 && (_jsx("span", { className: "rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600", children: t('landingOrderBump_offDiscount', { discount: bump.discount }) }))] }), savings > 0 && (_jsx("p", { className: "mt-1 text-xs text-emerald-600", children: t('landingOrderBump_youAreSaving', { savings: formatPrice(savings) }) }))] })] }), isSelected && (_jsx("div", { className: "absolute -right-2 -top-2", children: _jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg", children: _jsx(Check, { className: "h-5 w-5 text-white" }) }) }))] }));
}
export function OrderBumpsContainer({ bumps, currency, selectedBumpIds, onSelectionChange, }) {
    const { t } = useTranslation();
    if (!bumps || bumps.length === 0)
        return null;
    const handleToggle = (bumpId, selected) => {
        if (selected) {
            onSelectionChange([...selectedBumpIds, bumpId]);
        }
        else {
            onSelectionChange(selectedBumpIds.filter((id) => id !== bumpId));
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-amber-700", children: [_jsx(Gift, { className: "h-5 w-5" }), _jsx("h3", { className: "font-semibold", children: t('landingOrderBump_addAndSave') })] }), _jsx("div", { className: "space-y-3", children: bumps.map((bump) => (_jsx(OrderBumpCheckbox, { bump: bump, currency: currency, isSelected: selectedBumpIds.includes(bump.id), onToggle: handleToggle }, bump.id))) })] }));
}
