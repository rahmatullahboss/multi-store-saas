import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Type, Image as ImageIcon, MousePointer2, LayoutTemplate, Smartphone, Eye, RotateCcw, Copy, Save, Square, FileText, BarChart3, Video, Star, Move } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/useIsMobile';
export function DragDropBuilderShowcase() {
    const { t } = useTranslation();
    const [activeDrop, setActiveDrop] = useState(null);
    const [canvasElements, setCanvasElements] = useState([
        { id: 1, type: 'header', height: 'h-16' },
        { id: 2, type: 'hero', height: 'h-48' }
    ]);
    // Animation sequence state
    const [animationStep, setAnimationStep] = useState(0);
    const isMobile = useIsMobile();
    const widgets = [
        { id: 'text', icon: Type, label: t('landingDragDrop_widgetText') },
        { id: 'image', icon: ImageIcon, label: t('landingDragDrop_widgetImage') },
        { id: 'button', icon: Square, label: t('landingDragDrop_widgetButton') },
        { id: 'form', icon: FileText, label: t('landingDragDrop_widgetForm') },
        { id: 'chart', icon: BarChart3, label: t('landingDragDrop_widgetChart') },
        { id: 'video', icon: Video, label: t('landingDragDrop_widgetVideo') },
        { id: 'review', icon: Star, label: t('landingDragDrop_widgetReview') },
    ];
    const features = [
        {
            icon: LayoutTemplate,
            title: t('landingDragDrop_pixelPerfect'),
            desc: t('landingDragDrop_placeAnywhere'),
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
        },
        {
            icon: Smartphone,
            title: t('landingDragDrop_responsive'),
            desc: t('landingDragDrop_perfectEverywhere'),
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            icon: Eye,
            title: t('landingDragDrop_livePreview'),
            desc: t('landingDragDrop_seeRealTime'),
            color: 'text-orange-400',
            bg: 'bg-orange-500/10'
        },
        {
            icon: Save,
            title: t('landingDragDrop_autoSave'),
            desc: t('landingDragDrop_nothingLost'),
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            icon: RotateCcw,
            title: t('landingDragDrop_undoRedo'),
            desc: t('landingDragDrop_backToPrevious'),
            color: 'text-red-400',
            bg: 'bg-red-500/10'
        },
        {
            icon: Copy,
            title: t('landingDragDrop_copyPaste'),
            desc: t('landingDragDrop_sectionCopyPaste'),
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10'
        }
    ];
    useEffect(() => {
        let mounted = true;
        const sequence = async () => {
            // Disable animation on mobile
            if (isMobile)
                return;
            while (mounted) {
                // Reset
                setActiveDrop(null);
                setAnimationStep(0); // Idle
                await new Promise(r => setTimeout(r, 1000));
                if (!mounted)
                    break;
                // Start Drag (Pick "Review" widget)
                setAnimationStep(1); // Cursor moves to widget
                await new Promise(r => setTimeout(r, 1000));
                if (!mounted)
                    break;
                setAnimationStep(2); // Dragging starts
                await new Promise(r => setTimeout(r, 800)); // Moving to canvas
                if (!mounted)
                    break;
                setActiveDrop(2); // Highlight drop zone
                await new Promise(r => setTimeout(r, 400)); // Hovering
                if (!mounted)
                    break;
                setAnimationStep(3); // Drop
                const newId = Date.now(); // Unique ID for this animation cycle
                setCanvasElements(prev => [...prev, { id: newId, type: 'review', height: 'h-32' }]);
                setActiveDrop(null);
                await new Promise(r => setTimeout(r, 2000)); // Show result
                if (!mounted)
                    break;
                // Reset canvas for next loop - remove any review elements
                setCanvasElements(prev => prev.filter(el => el.type !== 'review'));
            }
        };
        sequence();
        return () => { mounted = false; };
    }, [isMobile]);
    return (_jsxs("section", { className: "relative py-24 overflow-hidden bg-[#0A0F0D]", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-40" }), _jsxs("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6", children: [_jsx(Move, { className: "w-4 h-4 text-purple-400" }), _jsx("span", { className: "text-sm font-medium text-purple-300", children: t('landingDragDrop_title') })] }), _jsxs("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-6", children: ["\uD83C\uDFA8 ", t('landingDragDrop_title'), " \u2014 ", _jsx("span", { className: "text-purple-400", children: t('landingDragDrop_customizeAsYouWish') })] }), _jsx("p", { className: "text-lg text-white/60 max-w-2xl mx-auto", children: t('landingDragDrop_builderDesc') })] }), _jsxs("div", { className: "relative mx-auto max-w-5xl mb-24", children: [_jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 blur-lg" }), _jsxs("div", { className: "relative bg-[#1a1f1d] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex h-[600px]", children: [_jsxs("div", { className: "w-64 bg-[#111] border-r border-white/5 flex flex-col", children: [_jsx("div", { className: "p-4 border-b border-white/5", children: _jsx("span", { className: "text-xs font-bold text-white/40 uppercase tracking-widest", children: t('landingDragDrop_widgets') }) }), _jsx("div", { className: "p-4 grid grid-cols-2 gap-3 overflow-y-auto", children: widgets.map((w) => (_jsxs("div", { className: "aspect-square bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center justify-center cursor-move border border-white/5 hover:border-purple-500/30 transition-colors group relative", children: [_jsx(w.icon, { className: "w-6 h-6 text-white/50 group-hover:text-purple-400 mb-2" }), _jsx("span", { className: "text-xs text-white/50 group-hover:text-white", children: w.label }), w.id === 'review' && animationStep >= 2 && animationStep < 3 && (_jsx("div", { className: "absolute inset-0 bg-purple-600 rounded-lg z-50 flex items-center justify-center shadow-2xl opacity-80", children: _jsx(w.icon, { className: "w-8 h-8 text-white" }) }))] }, w.id))) })] }), _jsxs("div", { className: "flex-1 bg-[#0f1211] p-8 relative overflow-y-auto overflow-x-hidden", children: [_jsxs("div", { className: "h-2 w-full flex gap-1.5 mb-6 opacity-30", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-red-500" }), _jsx("div", { className: "w-2 h-2 rounded-full bg-yellow-500" }), _jsx("div", { className: "w-2 h-2 rounded-full bg-green-500" })] }), _jsxs("div", { className: "space-y-4 max-w-2xl mx-auto", children: [canvasElements.map((el) => (_jsxs("div", { className: `w-full rounded-lg border-2 border-dashed transition-colors duration-300 relative group
                         ${el.type === 'review' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}
                       `, children: [_jsxs("div", { className: `p-6 ${el.height} flex items-center justify-center`, children: [el.type === 'header' && (_jsxs("div", { className: "w-full flex justify-between items-center px-4", children: [_jsx("div", { className: "w-20 h-4 bg-white/10 rounded" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "w-12 h-3 bg-white/5 rounded" }), _jsx("div", { className: "w-12 h-3 bg-white/5 rounded" }), _jsx("div", { className: "w-20 h-8 bg-purple-600/50 rounded-md" })] })] })), el.type === 'hero' && (_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-3/4 h-8 bg-white/10 rounded mx-auto" }), _jsx("div", { className: "w-1/2 h-4 bg-white/5 rounded mx-auto" }), _jsxs("div", { className: "flex justify-center gap-4 mt-6", children: [_jsx("div", { className: "w-32 h-10 bg-white/10 rounded-md" }), _jsx("div", { className: "w-32 h-10 border border-white/10 rounded-md" })] })] })), el.type === 'review' && (_jsx("div", { className: "grid grid-cols-3 gap-4 w-full px-4", children: [1, 2, 3].map(i => (_jsxs("div", { className: "bg-[#1a1f1d] p-4 rounded-lg border border-white/5", children: [_jsxs("div", { className: "flex gap-1 mb-2 text-yellow-500", children: [_jsx(Star, { className: "w-3 h-3 fill-current" }), _jsx(Star, { className: "w-3 h-3 fill-current" }), _jsx(Star, { className: "w-3 h-3 fill-current" }), _jsx(Star, { className: "w-3 h-3 fill-current" }), _jsx(Star, { className: "w-3 h-3 fill-current" })] }), _jsx("div", { className: "w-full h-2 bg-white/10 rounded mb-2" }), _jsx("div", { className: "w-2/3 h-2 bg-white/10 rounded" })] }, `review-star-${i}`))) }))] }), _jsx("div", { className: "absolute inset-0 bg-transparent group-hover:border-blue-500/50 border-2 border-transparent rounded-lg pointer-events-none transition-colors" })] }, `${el.type}-${el.id}`))), _jsx("div", { className: "w-full rounded-lg border-2 border-dashed border-purple-500 bg-purple-500/10 flex items-center justify-center overflow-hidden", children: _jsx("span", { className: "text-purple-400 text-sm font-medium", children: t('landingDragDrop_dropHere') }) })] }), animationStep > 0 && (_jsx("div", { className: "absolute z-[60] pointer-events-none transition-all duration-500", style: {
                                                    left: animationStep === 2 ? 400 : animationStep === 3 ? 450 : 50,
                                                    top: animationStep === 2 ? 450 : animationStep === 3 ? 500 : 300,
                                                    opacity: animationStep === 3 ? 0 : 1,
                                                }, children: _jsx(MousePointer2, { className: "w-6 h-6 text-white fill-black drop-shadow-xl" }) }))] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: features.map((feature, i) => (_jsxs("div", { className: "bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors group", children: [_jsx("div", { className: `w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`, children: _jsx(feature.icon, { className: `w-6 h-6 ${feature.color}` }) }), _jsx("h3", { className: "text-xl font-bold text-white mb-2", children: feature.title }), _jsx("p", { className: "text-white/60", children: feature.desc })] }, i))) })] })] }));
}
