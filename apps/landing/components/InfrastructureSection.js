import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * UI/UX Pro Max - Infrastructure Section
 *
 * Showcases Cloudflare CDN's global infrastructure with:
 * - "Liquid Glass" World Map
 * - 3D Tilt Cards for Stats
 * - Interactive Server Nodes
 */
import { Zap, Shield, Clock, Server } from 'lucide-react';
import { ClientOnly } from '@/components/LazySection';
import { ScrollReveal } from '@/components/animations';
// COLORS constant removed - using inline values for component portability
// ============================================================================
// MAP VISUALIZATION - LIQUID GLASS STYLE
// ============================================================================
const WorldMap = () => {
    // Simplified World Map Pattern (Abstract Representation)
    const DOTS = [
        // North America
        { x: 15, y: 25 },
        { x: 18, y: 28 },
        { x: 22, y: 32 },
        { x: 12, y: 35 },
        { x: 25, y: 35 },
        { x: 28, y: 38 },
        // South America
        { x: 28, y: 60 },
        { x: 32, y: 65 },
        { x: 30, y: 72 },
        // Europe
        { x: 48, y: 25 },
        { x: 52, y: 28 },
        { x: 50, y: 32 },
        { x: 45, y: 28 },
        // Africa
        { x: 50, y: 50 },
        { x: 55, y: 55 },
        { x: 52, y: 65 },
        { x: 48, y: 58 },
        // Asia
        { x: 65, y: 25 },
        { x: 70, y: 28 },
        { x: 75, y: 32 },
        { x: 80, y: 35 },
        { x: 68, y: 42 },
        { x: 72, y: 45 },
        // Australia
        { x: 85, y: 70 },
        { x: 88, y: 75 },
    ];
    const SERVERS = [
        { id: 'dhaka', x: 68, y: 42, name: 'Dhaka (Edge)', type: 'edge' },
        { id: 'singapore', x: 72, y: 55, name: 'Singapore', type: 'relay' },
        { id: 'london', x: 45, y: 28, name: 'London', type: 'relay' },
        { id: 'newyork', x: 25, y: 35, name: 'New York', type: 'relay' },
    ];
    return (_jsxs("div", { className: "relative w-full aspect-[2/1] bg-white/5 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#00DDA2]/10 via-transparent to-blue-500/10 mix-blend-overlay" }), _jsx("div", { className: "absolute inset-0", style: {
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    opacity: 0.3,
                } }), DOTS.map((dot, i) => (_jsx("div", { className: "absolute w-1.5 h-1.5 rounded-full bg-white/20", style: { left: `${dot.x}%`, top: `${dot.y}%` } }, i))), SERVERS.map((server) => (_jsxs("div", { className: "absolute", style: { left: `${server.x}%`, top: `${server.y}%` }, children: [_jsx("div", { className: `absolute -inset-4 rounded-full border ${server.type === 'edge' ? 'border-[#00DDA2]' : 'border-blue-500'}` }), _jsx("div", { className: `w-3 h-3 rounded-full relative z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${server.type === 'edge' ? 'bg-[#00DDA2]' : 'bg-blue-500'}` }), _jsx("div", { className: `absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-2 py-0.5 rounded ${server.type === 'edge' ? 'bg-[#00DDA2] text-black' : 'bg-black/50 text-white backdrop-blur-md'}`, children: server.name })] }, server.id))), _jsx("svg", { className: "absolute inset-0 w-full h-full pointer-events-none opacity-30", children: _jsx("path", { d: "M 68 42 L 72 55 M 68 42 L 45 28 M 68 42 L 25 35" // Scaled coords to % roughly
                    , stroke: "#00DDA2", strokeWidth: "0.5", fill: "none" }) })] }));
};
// ============================================================================
// 3D STAT CARD
// ============================================================================
const StatCard3D = ({ icon: Icon, value, label, sublabel, color, }) => {
    return (_jsxs("div", { style: { x, y, rotateX, rotateY, z: 100 }, className: "relative p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden group", onMouseMove: (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            x.set(e.clientX - rect.left - rect.width / 2);
            y.set(e.clientY - rect.top - rect.height / 2);
        }, onMouseLeave: () => {
            x.set(0);
            y.set(0);
        }, children: [_jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", style: {
                    background: `radial-gradient(circle at center, ${color}15, transparent 70%)`,
                } }), _jsxs("div", { className: "relative z-10 flex flex-col h-full", children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white", style: { backgroundColor: `${color}20` }, children: _jsx(Icon, { className: "w-6 h-6", style: { color } }) }), _jsx("div", { className: "text-4xl font-bold text-white mb-2 tracking-tight", children: value }), _jsx("div", { className: "text-white/70 font-medium mb-1", children: label }), _jsx("div", { className: "text-white/30 text-xs mt-auto", children: sublabel })] })] }));
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function InfrastructureSection() {
    return (_jsxs("section", { className: "py-24 relative bg-[#050807] overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 pointer-events-none", children: _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#00DDA2]/5 blur-[120px] rounded-full mix-blend-screen" }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 relative z-10", children: [_jsx(ScrollReveal, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00DDA2]/30 bg-[#00DDA2]/10 backdrop-blur-sm mb-6", children: [_jsx(Zap, { className: "w-4 h-4 text-[#00DDA2]" }), _jsx("span", { className: "text-sm font-bold text-[#00DDA2] uppercase tracking-wider", children: "Enterprise Grade" })] }), _jsxs("h2", { className: "text-4xl md:text-6xl font-bold text-white mb-6", children: ["\u09AC\u09BF\u09B6\u09CD\u09AC\u09AE\u09BE\u09A8\u09C7\u09B0 ", _jsx("span", { className: "text-[#00DDA2]", children: "\u0987\u09A8\u09AB\u09CD\u09B0\u09BE\u09B8\u09CD\u099F\u09CD\u09B0\u09BE\u0995\u099A\u09BE\u09B0" })] }), _jsx("p", { className: "text-xl text-white/50 max-w-2xl mx-auto", children: "Cloudflare CDN \u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0993\u09AF\u09BC\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09B2\u09CB\u09A1 \u09B9\u09AC\u09C7 \u099A\u09CB\u0996\u09C7\u09B0 \u09AA\u09B2\u0995\u09C7, \u09AC\u09BF\u09B6\u09CD\u09AC\u09C7\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09A5\u09C7\u0995\u09C7\u0964" })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20", children: [_jsx("div", { className: "lg:col-span-8", children: _jsx(ClientOnly, { fallback: _jsx("div", { className: "h-[400px] bg-white/5 rounded-3xl animate-pulse" }), children: _jsx(WorldMap, {}) }) }), _jsxs("div", { className: "lg:col-span-4 flex flex-col gap-6", children: [_jsx(StatCard3D, { icon: Server, value: "330+", label: "Global Cities", sublabel: "Data Centers Worldwide", color: "#00DDA2" }), _jsx(StatCard3D, { icon: Clock, value: "<50ms", label: "Latency (Dhaka)", sublabel: "Blazing Fast Local Access", color: "#22D3EE" }), _jsx(StatCard3D, { icon: Shield, value: "100%", label: "DDoS Protected", sublabel: "Enterprise Security Standard", color: "#F9A825" })] })] }), _jsxs("div", { className: "border-t border-white/5 pt-12", children: [_jsx("p", { className: "text-center text-white/30 text-sm font-medium uppercase tracking-widest mb-8", children: "Trusted Technology Partners" }), _jsxs("div", { className: "flex flex-wrap justify-center gap-12 opacity-50 grayscale mix-blend-screen", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: "Cloudflare" }), _jsx("h3", { className: "text-xl font-bold text-white", children: "Remix" }), _jsx("h3", { className: "text-xl font-bold text-white", children: "React" }), _jsx("h3", { className: "text-xl font-bold text-white", children: "PostgreSQL" }), _jsx("h3", { className: "text-xl font-bold text-white", children: "Prisma" })] })] })] })] }));
}
export default InfrastructureSection;
