import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Interactive Store Demo - "দেখুন কত সহজ - Try It Now"
 *
 * An interactive demo that lets visitors experience creating a store
 * in 30 seconds without signing up. Features:
 * - 3-step wizard (Template → Store Name → Add Product)
 * - Real-time live preview
 * - Template-based theme switching
 * - Progress indicator
 * - Celebration animation on completion
 */
import { useState, useEffect } from 'react';
import { Check, ShoppingCart, Sparkles, ArrowRight, Store, Package } from 'lucide-react';
// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
    primary: '#006A4E', // Bangladesh Green
    accent: '#F9A825', // Golden Yellow
    background: '#0A0A0F',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
};
// ============================================================================
// TEMPLATE OPTIONS
// ============================================================================
const templates = [
    {
        id: 'fashion',
        icon: '👗',
        name: 'Fashion',
        nameBn: 'ফ্যাশন',
        color: '#8B5CF6',
        gradientFrom: '#8B5CF6',
        gradientTo: '#A855F7',
    },
    {
        id: 'food',
        icon: '🍔',
        name: 'Food',
        nameBn: 'খাবার',
        color: '#F59E0B',
        gradientFrom: '#F59E0B',
        gradientTo: '#FBBF24',
    },
    {
        id: 'digital',
        icon: '💻',
        name: 'Digital',
        nameBn: 'ডিজিটাল',
        color: '#3B82F6',
        gradientFrom: '#3B82F6',
        gradientTo: '#60A5FA',
    },
];
// ============================================================================
// CONFETTI ANIMATION COMPONENT - Client-only to prevent hydration mismatch
// ============================================================================
const Confetti = () => {
    const [confettiPieces, setConfettiPieces] = useState([]);
    // Generate confetti pieces only on client side to prevent hydration mismatch
    useEffect(() => {
        if (confettiPieces.length === 0) {
            const colors = ['#8B5CF6', '#F59E0B', '#3B82F6', '#10B981', '#EC4899'];
            const pieces = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * 5)],
                rotateDirection: Math.random() > 0.5 ? 1 : -1,
            }));
            setConfettiPieces(pieces);
        }
    }, [confettiPieces.length]);
    if (confettiPieces.length === 0)
        return null;
    return (_jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: confettiPieces.map((piece) => (_jsx("div", { className: "absolute w-2 h-2 rounded-full", style: {
                left: `${piece.x}%`,
                top: '-10px',
                backgroundColor: piece.color,
            } }, piece.id))) }));
};
const ProgressIndicator = ({ currentStep, totalSteps }) => {
    return (_jsxs("div", { className: "flex items-center gap-2 mb-6", children: [Array.from({ length: totalSteps }, (_, i) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 <= currentStep
                            ? 'bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white'
                            : 'bg-white/10 text-white/40'}`, children: i + 1 <= currentStep ? (i + 1 < currentStep ? (_jsx(Check, { className: "w-4 h-4" })) : (i + 1)) : (i + 1) }), i < totalSteps - 1 && (_jsx("div", { className: "w-8 h-0.5 mx-1", style: {
                            background: i + 1 < currentStep
                                ? 'linear-gradient(90deg, #006A4E, #00875F)'
                                : 'rgba(255, 255, 255, 0.1)',
                        } }))] }, i))), _jsxs("span", { className: "ml-2 text-sm text-white/50", children: [currentStep, "/", totalSteps] })] }));
};
const LivePreview = ({ template, storeName, productName, productPrice, isComplete, }) => {
    const activeColor = template?.color || '#006A4E';
    const displayName = storeName || 'আপনার Store';
    const displayProduct = productName || 'প্রোডাক্ট';
    const displayPrice = productPrice || '০';
    return (_jsxs("div", { className: "relative rounded-2xl overflow-hidden border backdrop-blur-xl", style: {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: `${activeColor}30`,
        }, children: [isComplete && (_jsxs(_Fragment, { children: [_jsx(Confetti, {}), _jsxs("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center", children: [_jsx("div", { className: "w-20 h-20 rounded-full flex items-center justify-center mb-4", style: {
                                    background: `linear-gradient(135deg, ${activeColor}, ${template?.gradientTo || activeColor})`,
                                }, children: _jsx(Check, { className: "w-10 h-10 text-white" }) }), _jsx("p", { className: "text-2xl font-bold text-white mb-2", children: "\uD83C\uDF89 \u09A6\u09C7\u0996\u09B2\u09C7\u09A8? \u098F\u099F\u09C1\u0995\u09C1\u0987!" }), _jsx("p", { className: "text-white/60 mb-6", children: "\u098F\u09A4\u099F\u09C1\u0995\u09C1 \u09B8\u09B9\u099C Store \u09AC\u09BE\u09A8\u09BE\u09A8\u09CB!" }), _jsx("div", { children: _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105", style: {
                                        background: `linear-gradient(135deg, ${activeColor}, ${template?.gradientTo || activeColor})`,
                                        boxShadow: `0 0 30px ${activeColor}60`,
                                    }, children: ["\u098F\u0987 Store \u099F\u09BE Save \u0995\u09B0\u09A4\u09C7 Sign Up \u0995\u09B0\u09C1\u09A8", _jsx(ArrowRight, { className: "w-5 h-5" })] }) })] })] })), _jsxs("div", { className: "flex items-center gap-2 px-4 py-2 border-b", style: { borderColor: 'rgba(255, 255, 255, 0.1)' }, children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-red-500/70" }), _jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-yellow-500/70" }), _jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-green-500/70" })] }), _jsx("span", { className: "text-xs text-white/40 ml-2", children: "\uD83D\uDC46 LIVE PREVIEW" })] }), _jsx("div", { className: "p-4 transition-all duration-500", style: {
                    background: template
                        ? `linear-gradient(135deg, ${activeColor}40, ${activeColor}20)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                }, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center", style: {
                                background: template
                                    ? `linear-gradient(135deg, ${activeColor}, ${template.gradientTo})`
                                    : 'rgba(255, 255, 255, 0.1)',
                            }, children: template ? (_jsx("span", { className: "text-lg", children: template.icon })) : (_jsx(Store, { className: "w-5 h-5 text-white/40" })) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white", children: displayName }, displayName), _jsx("p", { className: "text-sm text-white/50", children: template ? `${template.nameBn} Store` : 'আপনার Store' })] })] }) }), _jsx("div", { className: "p-4", children: productName || productPrice ? (_jsxs("div", { className: "rounded-xl border overflow-hidden", style: {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                    }, children: [_jsx("div", { className: "aspect-square flex items-center justify-center", style: {
                                background: template
                                    ? `linear-gradient(135deg, ${activeColor}20, ${activeColor}10)`
                                    : 'rgba(255, 255, 255, 0.05)',
                            }, children: _jsx(Package, { className: "w-12 h-12", style: { color: activeColor } }) }), _jsxs("div", { className: "p-3", children: [_jsx("p", { className: "font-medium text-white truncate", children: displayProduct }, displayProduct), _jsxs("p", { className: "text-lg font-bold mt-1", style: { color: activeColor }, children: ["\u09F3", displayPrice] }, displayPrice), _jsxs("button", { className: "w-full mt-3 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2", style: {
                                        background: template
                                            ? `linear-gradient(135deg, ${activeColor}, ${template.gradientTo})`
                                            : 'rgba(255, 255, 255, 0.1)',
                                    }, children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), "Add to Cart"] })] })] }, "product-card")) : (_jsx("div", { className: "grid grid-cols-2 gap-3", children: [1, 2].map((i) => (_jsx("div", { className: "aspect-square rounded-xl border flex items-center justify-center", style: {
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                        }, children: _jsxs("div", { className: "text-center text-white/20", children: [_jsx(Package, { className: "w-8 h-8 mx-auto mb-2" }), _jsxs("span", { className: "text-xs", children: ["Product ", i] })] }) }, i))) }, "placeholder")) })] }));
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function InteractiveStoreDemo() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [storeName, setStoreName] = useState('');
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    // Auto-advance steps based on input
    useEffect(() => {
        if (selectedTemplate && currentStep === 1) {
            setTimeout(() => setCurrentStep(2), 500);
        }
    }, [selectedTemplate, currentStep]);
    useEffect(() => {
        if (storeName.length >= 3 && currentStep === 2) {
            setTimeout(() => setCurrentStep(3), 500);
        }
    }, [storeName, currentStep]);
    useEffect(() => {
        if (productName && productPrice && currentStep === 3 && !isComplete) {
            setTimeout(() => setIsComplete(true), 800);
        }
    }, [productName, productPrice, currentStep, isComplete]);
    // Reset demo
    const resetDemo = () => {
        setCurrentStep(1);
        setSelectedTemplate(null);
        setStoreName('');
        setProductName('');
        setProductPrice('');
        setIsComplete(false);
    };
    return (_jsxs("section", { className: "py-16 px-4 relative overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsx("div", { className: "absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20", style: { background: `radial-gradient(circle, ${COLORS.primary}, transparent)` } }), _jsx("div", { className: "absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-15", style: { background: `radial-gradient(circle, ${COLORS.accent}, transparent)` } }), _jsxs("div", { className: "relative max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6", style: {
                                    backgroundColor: `${COLORS.primary}15`,
                                    borderColor: `${COLORS.primary}30`,
                                }, children: [_jsx("span", { className: "text-lg", children: "\uD83C\uDFAE" }), _jsx("span", { className: "text-sm font-medium", style: { color: COLORS.primary }, children: "Interactive Demo" })] }), _jsxs("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u09A8\u09BF\u099C\u09C7 Try \u0995\u09B0\u09C1\u09A8 \u2014 ", _jsx("span", { style: { color: COLORS.accent }, children: "\u09E9\u09E6 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1\u09C7" }), " Store \u09AC\u09BE\u09A8\u09BE\u09A8"] }), _jsx("p", { className: "text-lg text-white/50 max-w-2xl mx-auto", children: "\u0995\u09CB\u09A8\u09CB Sign Up \u09B2\u09BE\u0997\u09AC\u09C7 \u09A8\u09BE, \u09B6\u09C1\u09A7\u09C1 \u09A8\u09BF\u099A\u09C7\u09B0 \u09E9\u099F\u09BF Step Follow \u0995\u09B0\u09C1\u09A8" })] }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-8 lg:gap-12 items-start", children: [_jsxs("div", { className: "p-6 md:p-8 rounded-3xl border backdrop-blur-xl", style: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                }, children: [_jsx(ProgressIndicator, { currentStep: currentStep, totalSteps: 3 }), _jsxs("div", { className: "mb-8", children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 rounded-full bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white text-xs flex items-center justify-center font-bold", children: "1" }), "Template \u09AC\u09BE\u099B\u09C1\u09A8"] }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: templates.map((template) => (_jsxs("button", { className: `relative p-4 rounded-xl border text-center transition-all ${selectedTemplate?.id === template.id
                                                        ? 'border-opacity-100'
                                                        : 'border-white/10 hover:border-white/20'}`, style: {
                                                        borderColor: selectedTemplate?.id === template.id ? template.color : undefined,
                                                        backgroundColor: selectedTemplate?.id === template.id
                                                            ? `${template.color}15`
                                                            : 'rgba(255, 255, 255, 0.02)',
                                                    }, onClick: () => setSelectedTemplate(template), children: [_jsx("span", { className: "text-3xl block mb-2", children: template.icon }), _jsx("span", { className: "text-sm text-white/70", children: template.nameBn }), selectedTemplate?.id === template.id && (_jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center", style: { backgroundColor: template.color }, children: _jsx(Check, { className: "w-3 h-3 text-white" }) }))] }, template.id))) })] }), _jsx(_Fragment, { children: currentStep >= 2 && (_jsxs("div", { className: "mb-8", children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 rounded-full bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white text-xs flex items-center justify-center font-bold", children: "2" }), "\u0986\u09AA\u09A8\u09BE\u09B0 Store \u098F\u09B0 \u09A8\u09BE\u09AE \u09A6\u09BF\u09A8"] }), _jsx("input", { type: "text", value: storeName, onChange: (e) => setStoreName(e.target.value), placeholder: "\u0986\u09AA\u09A8\u09BE\u09B0 Brand \u09A8\u09BE\u09AE...", className: "w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/30 focus:outline-none transition-all", style: {
                                                        borderColor: storeName.length >= 3 ? `${COLORS.primary}50` : 'rgba(255, 255, 255, 0.1)',
                                                    }, autoFocus: true })] })) }), _jsx(_Fragment, { children: currentStep >= 3 && (_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 rounded-full bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white text-xs flex items-center justify-center font-bold", children: "3" }), "\u098F\u0995\u099F\u09BE Product \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8"] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: productName, onChange: (e) => setProductName(e.target.value), placeholder: "Product \u098F\u09B0 \u09A8\u09BE\u09AE...", className: "px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/30 focus:outline-none transition-all", style: {
                                                                borderColor: productName
                                                                    ? `${COLORS.primary}50`
                                                                    : 'rgba(255, 255, 255, 0.1)',
                                                            }, autoFocus: true }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-white/50", children: "\u09F3" }), _jsx("input", { type: "number", value: productPrice, onChange: (e) => setProductPrice(e.target.value), placeholder: "\u09A6\u09BE\u09AE...", className: "w-full pl-8 pr-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/30 focus:outline-none transition-all", style: {
                                                                        borderColor: productPrice
                                                                            ? `${COLORS.primary}50`
                                                                            : 'rgba(255, 255, 255, 0.1)',
                                                                    } })] })] })] })) }), isComplete && (_jsxs("button", { onClick: resetDemo, className: "mt-6 text-sm text-white/40 hover:text-white/60 transition flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4" }), "\u0986\u09AC\u09BE\u09B0 Try \u0995\u09B0\u09C1\u09A8"] }))] }), _jsx("div", { className: "lg:sticky lg:top-24", children: _jsx(LivePreview, { template: selectedTemplate, storeName: storeName, productName: productName, productPrice: productPrice, isComplete: isComplete }) })] })] })] }));
}
export default InteractiveStoreDemo;
