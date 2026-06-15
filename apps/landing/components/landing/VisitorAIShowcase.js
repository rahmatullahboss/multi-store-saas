import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Zap, Check, Bot, Send, Sparkles } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
export function VisitorAIShowcase() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    // Suggested questions for the demo
    const suggestions = [
        { text: t('landingOzzylChat_suggestWhatIs'), action: 1 },
        { text: t('landingOzzylChat_suggestPricing'), action: 2 },
        { text: t('landingOzzylChat_suggestHowToStart'), action: 3 }
    ];
    // Override AI responses for better demo flow if needed, but using existing keys is better for consistency
    const getAIResponse = (action) => {
        switch (action) {
            case 1: return t('landingOzzylChat_initialMsg');
            case 2: return t('landingOzzylChat_suggestPricing');
            case 3: return t('landingVisitorAi_feature4Desc');
            default: return "";
        }
    };
    const handlSuggestionClick = async (action) => {
        if (isTyping)
            return;
        // Add User Message
        const userText = action === 1 ? t('landingOzzylChat_suggestWhatIs') : action === 2 ? t('landingOzzylChat_suggestPricing') : t('landingOzzylChat_suggestHowToStart');
        setMessages(prev => [...prev, { role: 'user', text: userText, id: Date.now() }]);
        // AI Thinking Delay
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Add AI Response
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'ai', text: getAIResponse(action), id: Date.now() + 1 }]);
    };
    // Initial greeting
    useEffect(() => {
        const timer = setTimeout(() => {
            setMessages([{
                    role: 'ai',
                    text: t('landingOzzylChat_greetingMsg'),
                    id: 1
                }]);
        }, 500);
        return () => clearTimeout(timer);
    }, [t]);
    return (_jsxs("section", { className: "relative py-24 overflow-hidden bg-[#0A0F0D]", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[#006A4E]/5 via-transparent to-[#006A4E]/5" }), _jsxs("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6", children: [_jsx(Sparkles, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { className: "text-sm font-medium text-emerald-300", children: t('landingVisitorAi_newFeature') })] }), _jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-6 leading-relaxed py-2", children: t('landingVisitorAi_askAiTitle') }), _jsx("p", { className: "text-lg text-white/60 max-w-2xl mx-auto", children: t('landingVisitorAi_askAiSubtitle') })] }), _jsxs("div", { className: "flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch", children: [_jsxs("div", { className: "w-full lg:w-5/12 flex flex-col justify-center space-y-8", children: [[
                                        { title: t('landingVisitorAi_feature1Title'), desc: t('landingVisitorAi_feature1Desc') },
                                        { title: t('landingVisitorAi_feature2Title'), desc: t('landingVisitorAi_feature2Desc') },
                                        { title: t('landingVisitorAi_feature3Title'), desc: t('landingVisitorAi_feature3Desc') },
                                        { title: t('landingVisitorAi_feature4Title'), desc: t('landingVisitorAi_feature4Desc') },
                                    ].map((item, i) => (_jsxs("div", { className: "flex gap-4 group", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors", children: _jsx(Check, { className: "w-5 h-5 text-emerald-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-white mb-1", children: item.title }), _jsx("p", { className: "text-white/50", children: item.desc })] })] }, i))), _jsx("div", { className: "pt-8", children: _jsx("div", { className: "inline-block p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-white/10", children: _jsxs("p", { className: "text-sm text-emerald-200 font-medium flex items-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4" }), t('landingVisitorAi_saveSalesCostDesc')] }) }) })] }), _jsxs("div", { className: "w-full lg:w-7/12 relative", children: [_jsx("div", { className: "absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-30" }), _jsxs("div", { className: "relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 h-[600px] flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-white/5 flex items-center gap-4 bg-[#151515]", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center", children: _jsx(Bot, { className: "w-6 h-6 text-white" }) }), _jsx("div", { className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full animate-pulse" })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-white", children: t('landingVisitorAi_aiAssistantName') }), _jsx("p", { className: "text-xs text-white/50", children: t('landingVisitorAi_alwaysActive') })] })] }), _jsxs("div", { className: "flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide", children: [messages.map((msg) => (_jsx("div", { className: `flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`, children: _jsx("div", { className: `max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai'
                                                                ? 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                                                : 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20'}`, children: msg.text }) }, msg.id))), isTyping && (_jsx("div", { className: "flex justify-start", children: _jsxs("div", { className: "bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce", style: { animationDelay: '0ms' } }), _jsx("span", { className: "w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce", style: { animationDelay: '150ms' } }), _jsx("span", { className: "w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce", style: { animationDelay: '300ms' } })] }) })), _jsx("div", { className: "h-4" })] }), _jsx("div", { className: "p-4 pt-2 flex gap-2 overflow-x-auto scrollbar-hide", children: suggestions.map((s, i) => (_jsx("button", { onClick: () => handlSuggestionClick(i + 1), disabled: isTyping, className: "flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-full text-sm text-emerald-400 transition-all cursor-pointer whitespace-nowrap", children: s.text }, i))) }), _jsx("div", { className: "p-4 border-t border-white/5 bg-[#151515]", children: _jsxs("div", { className: "h-12 bg-black/30 rounded-xl border border-white/5 flex items-center px-4 justify-between", children: [_jsx("span", { className: "text-white/30 text-sm", children: t('landingOzzylChat_typeMessage') }), _jsx("div", { className: "p-2 bg-emerald-600/20 rounded-lg", children: _jsx(Send, { className: "w-4 h-4 text-emerald-500" }) })] }) })] })] })] })] })] }));
}
