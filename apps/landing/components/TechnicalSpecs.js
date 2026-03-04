import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Technical Specs Section - "Under the Hood"
 *
 * For tech-savvy users who want to know the technical details.
 *
 * Features:
 * - Accordion-style expandable sections
 * - Terminal/code aesthetic for tech feel
 * - Copy-to-clipboard functionality
 * - Powered by Cloudflare badge
 * - Bengali summary for non-tech users
 */
import { useRef, useState } from 'react';
// Simple useInView (replaces framer-motion)
function useInViewSimple(ref, options) {
    const [inView, setInView] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                if (options?.once !== false)
                    observer.disconnect();
            }
        }, { rootMargin: options?.margin || '0px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return inView;
}
import { Settings, ChevronDown, Radio, Shield, Zap, Server, Lock, Globe, Cpu, Copy, Check, Terminal, Code, Database, Cloud } from 'lucide-react';
// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
    primary: '#006A4E',
    primaryLight: '#00875F',
    accent: '#F9A825',
    cyan: '#22D3EE',
    purple: '#A855F7',
    green: '#10B981',
    orange: '#F97316',
    background: '#0A0F0D',
    cardBg: 'rgba(255, 255, 255, 0.02)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textSubtle: 'rgba(255, 255, 255, 0.4)',
    border: 'rgba(255, 255, 255, 0.08)',
};
// ============================================================================
// TECHNICAL SPECS DATA
// ============================================================================
const TECH_SPECS = [
    {
        id: 'cdn',
        icon: Radio,
        title: 'CDN NETWORK',
        color: COLORS.cyan,
        specs: [
            { label: 'Network', value: 'Cloudflare Global Anycast Network' },
            { label: 'PoPs', value: '310+ Points of Presence worldwide' },
            { label: 'Capacity', value: '100+ Tbps Network Capacity' },
            { label: 'Routing', value: 'Argo Smart Routing enabled' },
            { label: 'Protocol', value: 'Anycast DNS with sub-20ms resolution' },
        ],
        codeSnippet: `# Network Configuration
CDN: Cloudflare Enterprise
Anycast: enabled
PoPs: 310+
Capacity: 100+ Tbps
Smart_Routing: Argo`,
    },
    {
        id: 'security',
        icon: Shield,
        title: 'SECURITY',
        color: COLORS.green,
        specs: [
            { label: 'DDoS Protection', value: 'Enterprise-grade Layer 3, 4, 7' },
            { label: 'WAF', value: 'Web Application Firewall with OWASP rules' },
            { label: 'Bot Protection', value: 'ML-powered Bot Management' },
            { label: 'SSL/TLS', value: 'Free Universal SSL (TLS 1.3)' },
            { label: 'DNSSEC', value: 'Full DNSSEC validation' },
        ],
        codeSnippet: `# Security Configuration
DDoS_Protection: Layer 3,4,7
WAF: OWASP_Core_Ruleset
Bot_Management: ML_Enabled
SSL: TLS_1.3_Universal
DNSSEC: validated`,
    },
    {
        id: 'performance',
        icon: Zap,
        title: 'PERFORMANCE',
        color: COLORS.accent,
        specs: [
            { label: 'Compression', value: 'Brotli + Gzip auto-compression' },
            { label: 'Protocol', value: 'HTTP/3 with QUIC support' },
            { label: 'Caching', value: 'Edge Caching with instant purge' },
            { label: 'Images', value: 'Polish + Mirage optimization' },
            { label: 'Minification', value: 'Auto HTML/CSS/JS minification' },
        ],
        codeSnippet: `# Performance Configuration
Compression: brotli, gzip
Protocol: HTTP/3_QUIC
Cache: edge_optimized
Image_Opt: polish, mirage
Minify: html, css, js`,
    },
    {
        id: 'infrastructure',
        icon: Server,
        title: 'INFRASTRUCTURE',
        color: COLORS.purple,
        specs: [
            { label: 'Hosting', value: 'Cloudflare Pages + Workers' },
            { label: 'Database', value: 'Cloudflare D1 (SQLite)' },
            { label: 'Storage', value: 'Cloudflare R2 Object Storage' },
            { label: 'Edge Compute', value: 'Cloudflare Workers (V8 Isolates)' },
            { label: 'Runtime', value: 'Zero cold-start serverless' },
        ],
        codeSnippet: `# Infrastructure Stack
Hosting: Cloudflare_Pages
Runtime: Workers_V8
Database: D1_SQLite
Storage: R2_S3_Compatible
Cold_Start: 0ms`,
    },
];
const AccordionItem = ({ spec, isOpen, onToggle, index }) => {
    const [copied, setCopied] = useState(false);
    const Icon = spec.icon;
    const handleCopy = async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(spec.codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsxs("div", { className: "rounded-xl overflow-hidden", style: {
            background: isOpen
                ? `linear-gradient(135deg, ${spec.color}08 0%, ${spec.color}02 100%)`
                : COLORS.cardBg,
            border: `1px solid ${isOpen ? `${spec.color}30` : COLORS.border}`,
        }, children: [_jsxs("button", { onClick: onToggle, className: "w-full flex items-center justify-between p-5 text-left transition-colors", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center", style: {
                                    background: `${spec.color}20`,
                                    boxShadow: isOpen ? `0 0 20px ${spec.color}30` : 'none',
                                }, children: _jsx(Icon, { className: "w-5 h-5", style: { color: spec.color } }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-mono font-semibold text-sm tracking-wider", children: spec.title }), _jsxs("p", { className: "text-xs", style: { color: COLORS.textSubtle }, children: [spec.specs.length, " specifications"] })] })] }), _jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: 'rgba(255,255,255,0.05)' }, children: _jsx(ChevronDown, { className: "w-5 h-5", style: { color: COLORS.textMuted } }) })] }), isOpen && (_jsx("div", { className: "overflow-hidden", children: _jsxs("div", { className: "px-5 pb-5", children: [_jsx("div", { className: "space-y-3 mb-4", children: spec.specs.map((item, i) => (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", style: { background: spec.color } }), _jsxs("div", { children: [_jsxs("span", { className: "text-white/80 text-sm font-medium", children: [item.label, ":"] }), _jsx("span", { className: "text-white/50 text-sm ml-2", children: item.value })] })] }, i))) }), _jsxs("div", { className: "relative rounded-lg overflow-hidden", style: {
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }, children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b", style: {
                                        background: 'rgba(0,0,0,0.3)',
                                        borderColor: 'rgba(255,255,255,0.05)',
                                    }, children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500/60" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500/60" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-green-500/60" })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-white/30", children: [_jsx(Terminal, { className: "w-3 h-3" }), _jsx("span", { children: "config.yaml" })] }), _jsx("button", { onClick: handleCopy, className: "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors", style: {
                                                background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                                color: copied ? COLORS.green : COLORS.textMuted,
                                            }, children: copied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-3 h-3" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-3 h-3" }), "Copy"] })) })] }), _jsx("pre", { className: "p-4 text-xs font-mono overflow-x-auto", children: _jsx("code", { style: { color: COLORS.textMuted }, children: spec.codeSnippet.split('\n').map((line, i) => (_jsxs("div", { className: "flex", children: [_jsx("span", { className: "w-6 text-white/20 select-none", children: i + 1 }), _jsx("span", { children: line.startsWith('#') ? (_jsx("span", { style: { color: COLORS.textSubtle }, children: line })) : line.includes(':') ? (_jsxs(_Fragment, { children: [_jsx("span", { style: { color: spec.color }, children: line.split(':')[0] }), _jsx("span", { style: { color: COLORS.textSubtle }, children: ":" }), _jsx("span", { style: { color: COLORS.text }, children: line.split(':').slice(1).join(':') })] })) : (line) })] }, i))) }) })] })] }) }))] }));
};
// ============================================================================
// CLOUDFLARE BADGE
// ============================================================================
const CloudflareBadge = () => (_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full", style: {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
    }, children: [_jsx(Cloud, { className: "w-4 h-4", style: { color: COLORS.orange } }), _jsx("span", { className: "text-sm font-medium", style: { color: COLORS.orange }, children: "Powered by Cloudflare" })] }));
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function TechnicalSpecs() {
    const sectionRef = useRef(null);
    const isInView = useInViewSimple(sectionRef);
    const [openId, setOpenId] = useState('cdn');
    const handleToggle = (id) => {
        setOpenId(openId === id ? null : id);
    };
    return (_jsxs("section", { ref: sectionRef, className: "relative py-16 md:py-20 overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute inset-0 opacity-[0.015]", style: {
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext x='10' y='20' font-family='monospace' font-size='8' fill='white'%3E%7B%7D%3C/text%3E%3Ctext x='50' y='40' font-family='monospace' font-size='8' fill='white'%3E%3C/%3E%3C/text%3E%3Ctext x='30' y='60' font-family='monospace' font-size='8' fill='white'%3E()%3C/text%3E%3Ctext x='70' y='80' font-family='monospace' font-size='8' fill='white'%3E%3D%3E%3C/text%3E%3C/svg%3E")`,
                            backgroundSize: '100px 100px',
                        } }), _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full", style: {
                            background: `radial-gradient(ellipse, ${COLORS.primary}08 0%, transparent 70%)`,
                        } })] }), _jsxs("div", { className: "relative z-10 max-w-4xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6", style: {
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }, children: [_jsx(Settings, { className: "w-4 h-4", style: { color: COLORS.textMuted } }), _jsx("span", { style: { color: COLORS.textMuted }, className: "text-sm font-mono", children: "TECHNICAL SPECS" })] }), _jsxs("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-4 font-mono", children: ["Under the Hood", ' ', _jsx("span", { style: { color: COLORS.textSubtle }, children: "// For the curious" })] }), _jsx("p", { className: "text-lg", style: { color: COLORS.textMuted }, children: "Enterprise-grade infrastructure powering your store" })] }), _jsx("div", { className: "space-y-3 mb-12", children: TECH_SPECS.map((spec, index) => (_jsx(AccordionItem, { spec: spec, isOpen: openId === spec.id, onToggle: () => handleToggle(spec.id), index: index }, spec.id))) }), _jsxs("div", { className: "text-center p-6 rounded-2xl", style: {
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.1)',
                        }, children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-3", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCA1" }), _jsx("span", { className: "text-lg font-semibold text-white", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09B8\u09B9\u099C \u0995\u09A5\u09BE\u09AF\u09BC:" })] }), _jsxs("p", { className: "text-lg", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u0986\u09AA\u09A8\u09BE\u09B0 Store \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u099C\u09BE\u09AF\u09BC\u0997\u09BE\u09AF\u09BC", ' ', _jsx("span", { className: "text-emerald-400 font-semibold", children: "\u09E7 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1\u09C7\u09B0 \u0995\u09AE" }), ' ', "\u09B8\u09AE\u09AF\u09BC\u09C7 Load \u09B9\u09AC\u09C7\u0964"] }), _jsx("p", { className: "text-sm mt-2", style: { color: COLORS.textSubtle, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09B9\u09CD\u09AF\u09BE\u0995\u09BE\u09B0 \u0986\u0995\u09CD\u09B0\u09AE\u09A3 \u09A5\u09C7\u0995\u09C7 \u09B8\u09C1\u09B0\u0995\u09CD\u09B7\u09BF\u09A4, \u09E8\u09EA/\u09ED \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09A5\u09BE\u0995\u09AC\u09C7\u0964" })] }), _jsx("div", { className: "flex justify-center mt-8", children: _jsx(CloudflareBadge, {}) }), _jsx("div", { className: "flex flex-wrap justify-center gap-3 mt-6", children: [
                            { icon: Code, label: 'V8 Runtime' },
                            { icon: Database, label: 'Edge SQL' },
                            { icon: Globe, label: 'Global CDN' },
                            { icon: Lock, label: 'TLS 1.3' },
                            { icon: Cpu, label: 'Zero Cold Start' },
                        ].map((item, index) => (_jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs", style: {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: COLORS.textSubtle,
                            }, children: [_jsx(item.icon, { className: "w-3 h-3" }), _jsx("span", { className: "font-mono", children: item.label })] }, index))) })] })] }));
}
export default TechnicalSpecs;
