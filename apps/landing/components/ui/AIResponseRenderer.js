import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * AI Response Renderer
 *
 * Renders structured AI responses as cards, tables, and alerts
 * Supports: InsightCard, Alert, ActionChips, DataTable, and plain text
 */
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, CheckCircle, ArrowRight, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
// ============================================================================
// HELPER: Parse AI Response
// ============================================================================
export function parseAIResponse(response) {
    // Try to parse as JSON first
    try {
        // Parse only if the whole payload is JSON-like, avoid substring extraction.
        let cleaned = response.trim();
        if (cleaned.startsWith('```json'))
            cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```'))
            cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```'))
            cleaned = cleaned.slice(0, -3);
        cleaned = cleaned.trim();
        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
            const parsed = JSON.parse(cleaned);
            // Validate it has expected structure
            if (parsed.type && (parsed.data || parsed.content || parsed.items || parsed.text?.content)) {
                if (!parsed.content && parsed.text?.content) {
                    return { type: 'text', content: parsed.text.content };
                }
                return parsed;
            }
        }
    }
    catch {
        // Not JSON, return as plain text
    }
    // Return as plain text
    return {
        type: 'text',
        content: response
    };
}
// ============================================================================
// SUB-COMPONENTS
// ============================================================================
const IconMap = {
    sales: DollarSign,
    orders: ShoppingCart,
    products: Package,
    customers: Users,
};
const ColorMap = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500' },
};
function InsightCard({ data }) {
    const color = ColorMap[data.color || 'blue'];
    const IconComponent = IconMap[data.icon || 'sales'];
    return (_jsx("div", { className: `rounded-xl border ${color.bg} ${color.border} p-4`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 mb-1", children: data.title }), _jsx("p", { className: `text-2xl font-bold ${color.text}`, children: data.value }), data.trend !== undefined && (_jsxs("div", { className: "flex items-center gap-1 mt-2", children: [data.trend > 0 ? (_jsx(TrendingUp, { className: "w-4 h-4 text-green-500" })) : data.trend < 0 ? (_jsx(TrendingDown, { className: "w-4 h-4 text-red-500" })) : (_jsx(Minus, { className: "w-4 h-4 text-gray-400" })), _jsxs("span", { className: `text-xs font-medium ${data.trend > 0 ? 'text-green-600' : data.trend < 0 ? 'text-red-600' : 'text-gray-500'}`, children: [data.trend > 0 ? '+' : '', data.trend, "% ", data.trendLabel || ''] })] }))] }), _jsx("div", { className: `p-2 rounded-lg ${color.bg}`, children: _jsx(IconComponent, { className: `w-5 h-5 ${color.icon}` }) })] }) }));
}
function AlertBox({ data }) {
    const severityStyles = {
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500' },
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
        success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-500' },
        error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-500' },
    };
    const style = severityStyles[data.severity];
    const IconComponent = style.icon;
    return (_jsx("div", { className: `rounded-xl border ${style.bg} ${style.border} p-4`, children: _jsxs("div", { className: "flex gap-3", children: [_jsx(IconComponent, { className: `w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5` }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900 text-sm", children: data.title }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: data.message }), data.actionLabel && data.actionUrl && (_jsxs("a", { href: data.actionUrl, className: "inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 hover:text-blue-700", children: [data.actionLabel, _jsx(ArrowRight, { className: "w-3 h-3" })] }))] })] }) }));
}
function ActionChips({ chips }) {
    return (_jsx("div", { className: "flex flex-wrap gap-2", children: chips.map((chip, i) => (chip.url ? (_jsx("a", { href: chip.url, className: "px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors", children: chip.label }, i)) : (_jsx("button", { className: "px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors", children: chip.label }, i)))) }));
}
function DataTable({ rows }) {
    if (rows.length === 0)
        return null;
    const headers = Object.keys(rows[0]);
    return (_jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-200", children: _jsxs("table", { className: "w-full text-xs", children: [_jsx("thead", { className: "bg-gray-50", children: _jsx("tr", { children: headers.map((header, i) => (_jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600 capitalize", children: header.replace(/_/g, ' ') }, i))) }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: rows.map((row, i) => (_jsx("tr", { className: "bg-white", children: headers.map((header, j) => (_jsx("td", { className: "px-3 py-2 text-gray-700", children: row[header] }, j))) }, i))) })] }) }));
}
export function AIResponseRenderer({ response, className = '' }) {
    const parsed = parseAIResponse(response);
    return (_jsxs("div", { className: `space-y-3 ${className}`, children: [parsed.type === 'text' && parsed.content && (_jsx("p", { className: "text-sm text-gray-700 whitespace-pre-wrap leading-relaxed", children: parsed.content })), parsed.type === 'insight_card' && parsed.data && (_jsx(InsightCard, { data: parsed.data })), parsed.type === 'insight_cards' && Array.isArray(parsed.data) && (_jsx("div", { className: "grid grid-cols-2 gap-2", children: parsed.data.map((card, i) => (_jsx(InsightCard, { data: card }, i))) })), parsed.type === 'alert' && parsed.data && (_jsx(AlertBox, { data: parsed.data })), parsed.type === 'action_chips' && Array.isArray(parsed.data) && (_jsx(ActionChips, { chips: parsed.data })), parsed.type === 'data_table' && Array.isArray(parsed.data) && (_jsx(DataTable, { rows: parsed.data })), parsed.type === 'mixed' && parsed.items && (_jsx(_Fragment, { children: parsed.items.map((item, i) => (_jsxs("div", { children: [item.type === 'text' && (_jsx("p", { className: "text-sm text-gray-700 whitespace-pre-wrap", children: item.data })), item.type === 'insight_card' && _jsx(InsightCard, { data: item.data }), item.type === 'insight_cards' && (_jsx("div", { className: "grid grid-cols-2 gap-2", children: item.data.map((card, j) => (_jsx(InsightCard, { data: card }, j))) })), item.type === 'alert' && _jsx(AlertBox, { data: item.data }), item.type === 'action_chips' && _jsx(ActionChips, { chips: item.data })] }, i))) }))] }));
}
// ============================================================================
// DARK THEME VERSION (for OzzylAIChatWidget)
// ============================================================================
export function AIResponseRendererDark({ response, className = '' }) {
    const parsed = parseAIResponse(response);
    const supportedTypes = new Set(['text', 'insight_card', 'insight_cards', 'alert', 'mixed']);
    const DarkInsightCard = ({ data }) => (_jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4", children: [_jsx("p", { className: "text-xs font-medium text-white/60 mb-1", children: data.title }), _jsx("p", { className: "text-xl font-bold text-white", children: data.value }), data.trend !== undefined && (_jsxs("div", { className: "flex items-center gap-1 mt-2", children: [data.trend > 0 ? (_jsx(TrendingUp, { className: "w-3.5 h-3.5 text-green-400" })) : data.trend < 0 ? (_jsx(TrendingDown, { className: "w-3.5 h-3.5 text-red-400" })) : (_jsx(Minus, { className: "w-3.5 h-3.5 text-gray-400" })), _jsxs("span", { className: `text-xs ${data.trend > 0 ? 'text-green-400' : data.trend < 0 ? 'text-red-400' : 'text-gray-400'}`, children: [data.trend > 0 ? '+' : '', data.trend, "%"] })] }))] }));
    const DarkAlertBox = ({ data }) => {
        const colors = {
            info: 'border-blue-500/30 bg-blue-500/10',
            warning: 'border-amber-500/30 bg-amber-500/10',
            success: 'border-green-500/30 bg-green-500/10',
            error: 'border-red-500/30 bg-red-500/10',
        };
        return (_jsxs("div", { className: `rounded-xl border ${colors[data.severity]} p-4`, children: [_jsx("p", { className: "font-medium text-white text-sm", children: data.title }), _jsx("p", { className: "text-xs text-white/70 mt-1", children: data.message })] }));
    };
    return (_jsxs("div", { className: `space-y-3 ${className}`, children: [parsed.type === 'text' && parsed.content && (_jsx("p", { className: "text-sm text-white/90 whitespace-pre-wrap leading-relaxed", children: parsed.content })), parsed.type === 'insight_card' && parsed.data && (_jsx(DarkInsightCard, { data: parsed.data })), parsed.type === 'insight_cards' && Array.isArray(parsed.data) && (_jsx("div", { className: "grid grid-cols-2 gap-2", children: parsed.data.map((card, i) => (_jsx(DarkInsightCard, { data: card }, i))) })), parsed.type === 'alert' && parsed.data && (_jsx(DarkAlertBox, { data: parsed.data })), parsed.type === 'mixed' && parsed.items && (_jsx(_Fragment, { children: parsed.items.map((item, i) => (_jsxs("div", { children: [item.type === 'text' && (_jsx("p", { className: "text-sm text-white/90 whitespace-pre-wrap", children: item.data })), item.type === 'insight_card' && _jsx(DarkInsightCard, { data: item.data }), item.type === 'insight_cards' && (_jsx("div", { className: "grid grid-cols-2 gap-2", children: item.data.map((card, j) => (_jsx(DarkInsightCard, { data: card }, j))) })), item.type === 'alert' && _jsx(DarkAlertBox, { data: item.data })] }, i))) })), !supportedTypes.has(parsed.type) && (_jsx("p", { className: "text-sm text-white/90 whitespace-pre-wrap leading-relaxed", children: response }))] }));
}
