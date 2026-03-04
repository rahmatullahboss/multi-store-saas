import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * WhatsApp Order Button
 *
 * Alternative to form-based ordering - very popular in BD
 * Opens WhatsApp with pre-filled order message
 */
import { useState } from 'react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
export function WhatsAppOrderButton({ phoneNumber, productName, price, currency = '৳', quantity = 1, buttonText, fullWidth = false, className = '', }) {
    const { t, lang } = useTranslation();
    const displayButtonText = buttonText || t('landingProduct_whatsappOrder');
    // Format phone for WhatsApp
    const formatPhone = (phone) => {
        let cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('01')) {
            cleaned = '+880' + cleaned.substring(1);
        }
        else if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        return cleaned.replace('+', '');
    };
    const total = price * quantity;
    // Format total based on language
    const formattedTotal = lang === 'bn' && (currency === '৳' || currency === 'BDT')
        ? `${currency}${total.toLocaleString('bn-BD')}`
        : `${currency}${total.toLocaleString()}`;
    // Pre-filled message template
    const message = `${t('landingProduct_orderMsg_greeting')}

${t('landingProduct_orderMsg_iWantToOrder', { productName })}

${t('landingProduct_orderMsg_quantity', { quantity: lang === 'bn' ? quantity.toLocaleString('bn-BD') : quantity })}
${t('landingProduct_orderMsg_price', { total: formattedTotal })}

${t('landingProduct_orderMsg_myInfo')}
${t('landingProduct_orderMsg_name')} 
${t('landingProduct_orderMsg_address')} 
${t('landingProduct_orderMsg_mobile')} 

${t('landingProduct_orderMsg_thanks')}`;
    const whatsappUrl = `https://wa.me/${formatPhone(phoneNumber)}?text=${encodeURIComponent(message)}`;
    const handleClick = () => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };
    return (_jsxs("button", { onClick: handleClick, className: `
        inline-flex items-center justify-center gap-3 
        bg-[#25D366] hover:bg-[#128C7E] 
        text-white font-bold text-lg
        px-6 py-4 rounded-xl
        transition-all duration-300 
        hover:scale-[1.02] hover:shadow-lg
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `, children: [_jsx("svg", { className: "w-7 h-7", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) }), displayButtonText] }));
}
export function ProductGallery({ images, productName, enableZoom = true, className = '', }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    // If no images, show placeholder
    if (!images || images.length === 0) {
        return (_jsx("div", { className: `aspect-square bg-gray-100 rounded-2xl flex items-center justify-center ${className}`, children: _jsx("span", { className: "text-6xl", children: "\uD83D\uDCE6" }) }));
    }
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    return (_jsxs("div", { className: `space-y-4 ${className}`, children: [_jsxs("div", { className: "relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group", children: [_jsx("img", { src: images[currentIndex], alt: `${productName} - Image ${currentIndex + 1}`, className: `w-full h-full object-cover transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`, onClick: () => enableZoom && setIsZoomed(!isZoomed), loading: "lazy", decoding: "async" }), images.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: goToPrevious, className: "absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(ChevronLeft, { className: "w-6 h-6 text-gray-800" }) }), _jsx("button", { onClick: goToNext, className: "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(ChevronRight, { className: "w-6 h-6 text-gray-800" }) })] })), enableZoom && (_jsx("div", { className: "absolute top-3 right-3 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(ZoomIn, { className: "w-5 h-5" }) })), images.length > 1 && (_jsxs("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full", children: [currentIndex + 1, " / ", images.length] }))] }), images.length > 1 && (_jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: images.map((image, index) => (_jsx("button", { onClick: () => setCurrentIndex(index), className: `flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                        ? 'border-orange-500 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-400'}`, children: _jsx("img", { src: image, alt: `${productName} - Thumbnail ${index + 1}`, className: "w-full h-full object-cover", loading: "lazy", decoding: "async" }) }, index))) }))] }));
}
export function VariantSelector({ label, variants, selectedId, onSelect, displayType = 'buttons', className = '', }) {
    const { t, lang } = useTranslation();
    // Color swatches
    if (displayType === 'colors') {
        return (_jsxs("div", { className: className, children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-3", children: label }), _jsx("div", { className: "flex flex-wrap gap-2", children: variants.map((variant) => {
                        const isSelected = variant.id === selectedId;
                        const isOutOfStock = variant.stock === 0;
                        return (_jsx("button", { onClick: () => !isOutOfStock && onSelect(variant), disabled: isOutOfStock, className: `
                  w-10 h-10 rounded-full border-2 transition-all relative
                  ${isSelected ? 'ring-2 ring-offset-2 ring-orange-500' : ''}
                  ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}
                `, style: { backgroundColor: variant.value }, title: variant.name, children: isOutOfStock && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "w-full h-0.5 bg-red-500 rotate-45" }) })) }, variant.id));
                    }) }), selectedId && (_jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [t('landingProduct_selected'), " ", variants.find((v) => v.id === selectedId)?.name] }))] }));
    }
    // Dropdown
    if (displayType === 'dropdown') {
        return (_jsxs("div", { className: className, children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: label }), _jsxs("select", { value: selectedId || '', onChange: (e) => {
                        const variant = variants.find((v) => String(v.id) === e.target.value);
                        if (variant)
                            onSelect(variant);
                    }, className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg", children: [_jsx("option", { value: "", children: t('landingProduct_selectOption') }), variants.map((variant) => (_jsxs("option", { value: variant.id, disabled: variant.stock === 0, children: [variant.name, " ", variant.stock === 0 ? t('landingProduct_outOfStock') : '', variant.price
                                    ? ` (+৳${lang === 'bn' ? variant.price.toLocaleString('bn-BD') : variant.price.toLocaleString()})`
                                    : ''] }, variant.id)))] })] }));
    }
    // Default: Button pills
    return (_jsxs("div", { className: className, children: [_jsx("label", { className: "block text-sm font-bold text-gray-700 mb-3", children: label }), _jsx("div", { className: "flex flex-wrap gap-2", children: variants.map((variant) => {
                    const isSelected = variant.id === selectedId;
                    const isOutOfStock = variant.stock === 0;
                    return (_jsxs("button", { onClick: () => !isOutOfStock && onSelect(variant), disabled: isOutOfStock, className: `
                px-4 py-2 rounded-lg border-2 font-medium transition-all
                ${isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-400 text-gray-700'}
                ${isOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}
              `, children: [variant.name, variant.price ? (_jsxs("span", { className: "text-sm ml-1", children: ["(+\u09F3", lang === 'bn'
                                        ? variant.price.toLocaleString('bn-BD')
                                        : variant.price.toLocaleString(), ")"] })) : ('')] }, variant.id));
                }) })] }));
}
