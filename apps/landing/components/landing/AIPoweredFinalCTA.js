import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
export function AIPoweredFinalCTA() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([
        { id: 1, type: 'ai', text: t('landingFinalCTA_chatPrompt') },
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(scrollToBottom, [messages]);
    const handleSend = () => {
        if (!inputValue.trim())
            return;
        const userMsg = { id: Date.now(), type: 'user', text: inputValue };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        // Simulated AI Response
        setTimeout(() => {
            let responseText = t('landingFinalCTA_chatResponse1');
            const lowerInput = userMsg.text.toLowerCase();
            if (lowerInput.includes('price') ||
                lowerInput.includes('cost') ||
                lowerInput.includes('দাম') ||
                lowerInput.includes('taka')) {
                responseText = t('landingFinalCTA_chatResponse2');
            }
            else if (lowerInput.includes('feature') ||
                lowerInput.includes('কি কি') ||
                lowerInput.includes('ki ki')) {
                responseText = t('landingFinalCTA_chatResponse3');
            }
            else if (lowerInput.includes('start') ||
                lowerInput.includes('shuru') ||
                lowerInput.includes('register')) {
                responseText = t('landingFinalCTA_chatResponse4');
            }
            setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'ai', text: responseText }]);
        }, 1000);
    };
    return (_jsxs("section", { className: "relative py-24 overflow-hidden bg-[#050A08]", children: [_jsx("div", { className: "absolute inset-0 bg-emerald-900/10 opacity-20 pointer-events-none" }), _jsx("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "grid lg:grid-cols-2 gap-16 items-center", children: [_jsxs("div", { className: "text-center lg:text-left", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6", children: [_jsx(Bot, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { className: "text-sm font-bold text-emerald-400", children: t('landingFinalCTA_limitedOffer') })] }), _jsx("h2", { className: "text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight", children: t('landingFinalCTA_ctaMainTitle') }), _jsx("p", { className: "text-xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0", children: t('landingFinalCTA_ctaSubtitle') }), _jsx("div", { className: "flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10", children: _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "relative group w-full sm:w-auto", children: [_jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse" }), _jsxs("div", { className: "relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold text-lg rounded-xl leading-none shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]", children: [t('landingFinalCTA_startFreeBtn'), _jsx("span", { className: "bg-white/20 px-2 py-0.5 rounded text-xs font-normal", children: t('landingFinalCTA_aiIncluded') })] })] }) }), _jsxs("div", { className: "flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-white/50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-500" }), ' ', t('landingFinalCTA_noCardNeeded')] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-500" }), ' ', t('landingFinalCTA_setupOneMin')] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-500" }), ' ', t('landingFinalCTA_aiFreeAllPlans')] })] }), _jsxs("div", { className: "flex items-center justify-center lg:justify-start gap-4 my-8 opacity-30", children: [_jsx("div", { className: "h-px w-12 bg-white" }), _jsx("span", { className: "text-xs", children: t('landingFinalCTA_orSeparator') }), _jsx("div", { className: "h-px w-12 bg-white" })] }), _jsx("div", { className: "flex items-center justify-center lg:justify-start gap-6", children: _jsxs("a", { href: "mailto:hello@ozzyl.com", className: "flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium", children: [_jsx(Mail, { className: "w-4 h-4" }), " ", t('finalCtaSecondaryMail')] }) })] }), _jsxs("div", { className: "relative max-w-md mx-auto w-full", children: [_jsx("div", { className: "absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" }), _jsxs("div", { className: "relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]", children: [_jsx("div", { className: "p-4 bg-[#1a1f1d] border-b border-white/5 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30", children: _jsx(Bot, { className: "w-6 h-6 text-emerald-400" }) }), _jsxs("div", { children: [_jsx("div", { className: "font-bold text-white text-sm", children: t('landingFinalCTA_aiAssistantName') }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-xs text-emerald-400", children: t('landingFinalCTA_onlineNow') })] })] })] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0F0D]", children: [messages.map((msg) => (_jsx("div", { className: `flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-[85%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                                                            ? 'bg-emerald-600 text-white rounded-br-none'
                                                            : 'bg-white/10 text-white/90 rounded-bl-none'}`, children: msg.text }) }, msg.id))), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "p-4 bg-[#1a1f1d] border-t border-white/5", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: t('landingFinalCTA_typeQuestion'), className: "w-full bg-[#0A0F0D] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-white/20", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSend() }), _jsx("button", { onClick: handleSend, className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors", children: _jsx(Send, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "text-center mt-2", children: _jsx("span", { className: "text-[10px] text-white/30", children: t('landingFinalCTA_tryAiHint') }) })] })] })] })] }) })] }));
}
