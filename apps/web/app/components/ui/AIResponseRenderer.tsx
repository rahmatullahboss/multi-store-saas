/**
 * AI Response Renderer
 * 
 * Renders structured AI responses as cards, tables, and alerts
 * Supports: InsightCard, Alert, ActionChips, DataTable, and plain text
 */

import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info, CheckCircle, ArrowRight, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface InsightCardData {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon?: 'sales' | 'orders' | 'products' | 'customers';
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
}

export interface AlertData {
  severity: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ActionChip {
  label: string;
  action?: string;
  url?: string;
}

export interface TableRowData {
  [key: string]: string | number;
}

export interface StructuredResponse {
  type: 'text' | 'insight_card' | 'insight_cards' | 'alert' | 'action_chips' | 'data_table' | 'mixed';
  content?: string;
  data?: InsightCardData | InsightCardData[] | AlertData | ActionChip[] | TableRowData[];
  items?: Array<{ type: string; data: any }>;
}

// ============================================================================
// HELPER: Parse AI Response
// ============================================================================
export function parseAIResponse(response: string): StructuredResponse {
  // Try to parse as JSON first
  try {
    // Check for JSON in response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate it has expected structure
      if (parsed.type && (parsed.data || parsed.content || parsed.items)) {
        return parsed as StructuredResponse;
      }
    }
  } catch {
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

function InsightCard({ data }: { data: InsightCardData }) {
  const color = ColorMap[data.color || 'blue'];
  const IconComponent = IconMap[data.icon || 'sales'];
  
  return (
    <div className={`rounded-xl border ${color.bg} ${color.border} p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{data.title}</p>
          <p className={`text-2xl font-bold ${color.text}`}>{data.value}</p>
          
          {data.trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {data.trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : data.trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-xs font-medium ${data.trend > 0 ? 'text-green-600' : data.trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {data.trend > 0 ? '+' : ''}{data.trend}% {data.trendLabel || ''}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-2 rounded-lg ${color.bg}`}>
          <IconComponent className={`w-5 h-5 ${color.icon}`} />
        </div>
      </div>
    </div>
  );
}

function AlertBox({ data }: { data: AlertData }) {
  const severityStyles = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-500' },
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-500' },
  };
  
  const style = severityStyles[data.severity];
  const IconComponent = style.icon;
  
  return (
    <div className={`rounded-xl border ${style.bg} ${style.border} p-4`}>
      <div className="flex gap-3">
        <IconComponent className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{data.title}</p>
          <p className="text-xs text-gray-600 mt-1">{data.message}</p>
          
          {data.actionLabel && data.actionUrl && (
            <a 
              href={data.actionUrl}
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {data.actionLabel}
              <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionChips({ chips }: { chips: ActionChip[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        chip.url ? (
          <a
            key={i}
            href={chip.url}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
          >
            {chip.label}
          </a>
        ) : (
          <button
            key={i}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
          >
            {chip.label}
          </button>
        )
      ))}
    </div>
  );
}

function DataTable({ rows }: { rows: TableRowData[] }) {
  if (rows.length === 0) return null;
  
  const headers = Object.keys(rows[0]);
  
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-gray-600 capitalize">
                {header.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="bg-white">
              {headers.map((header, j) => (
                <td key={j} className="px-3 py-2 text-gray-700">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
interface AIResponseRendererProps {
  response: string;
  className?: string;
}

export function AIResponseRenderer({ response, className = '' }: AIResponseRendererProps) {
  const parsed = parseAIResponse(response);
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Plain Text */}
      {parsed.type === 'text' && parsed.content && (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {parsed.content}
        </p>
      )}
      
      {/* Single Insight Card */}
      {parsed.type === 'insight_card' && parsed.data && (
        <InsightCard data={parsed.data as InsightCardData} />
      )}
      
      {/* Multiple Insight Cards */}
      {parsed.type === 'insight_cards' && Array.isArray(parsed.data) && (
        <div className="grid grid-cols-2 gap-2">
          {(parsed.data as InsightCardData[]).map((card, i) => (
            <InsightCard key={i} data={card} />
          ))}
        </div>
      )}
      
      {/* Alert */}
      {parsed.type === 'alert' && parsed.data && (
        <AlertBox data={parsed.data as AlertData} />
      )}
      
      {/* Action Chips */}
      {parsed.type === 'action_chips' && Array.isArray(parsed.data) && (
        <ActionChips chips={parsed.data as ActionChip[]} />
      )}
      
      {/* Data Table */}
      {parsed.type === 'data_table' && Array.isArray(parsed.data) && (
        <DataTable rows={parsed.data as TableRowData[]} />
      )}
      
      {/* Mixed Response */}
      {parsed.type === 'mixed' && parsed.items && (
        <>
          {parsed.items.map((item, i) => (
            <div key={i}>
              {item.type === 'text' && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.data}</p>
              )}
              {item.type === 'insight_card' && <InsightCard data={item.data} />}
              {item.type === 'insight_cards' && (
                <div className="grid grid-cols-2 gap-2">
                  {item.data.map((card: InsightCardData, j: number) => (
                    <InsightCard key={j} data={card} />
                  ))}
                </div>
              )}
              {item.type === 'alert' && <AlertBox data={item.data} />}
              {item.type === 'action_chips' && <ActionChips chips={item.data} />}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================================
// DARK THEME VERSION (for OzzylAIChatWidget)
// ============================================================================
export function AIResponseRendererDark({ response, className = '' }: AIResponseRendererProps) {
  const parsed = parseAIResponse(response);
  
  const DarkInsightCard = ({ data }: { data: InsightCardData }) => (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <p className="text-xs font-medium text-white/60 mb-1">{data.title}</p>
      <p className="text-xl font-bold text-white">{data.value}</p>
      {data.trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {data.trend > 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          ) : data.trend < 0 ? (
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-gray-400" />
          )}
          <span className={`text-xs ${data.trend > 0 ? 'text-green-400' : data.trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {data.trend > 0 ? '+' : ''}{data.trend}%
          </span>
        </div>
      )}
    </div>
  );
  
  const DarkAlertBox = ({ data }: { data: AlertData }) => {
    const colors = {
      info: 'border-blue-500/30 bg-blue-500/10',
      warning: 'border-amber-500/30 bg-amber-500/10',
      success: 'border-green-500/30 bg-green-500/10',
      error: 'border-red-500/30 bg-red-500/10',
    };
    
    return (
      <div className={`rounded-xl border ${colors[data.severity]} p-4`}>
        <p className="font-medium text-white text-sm">{data.title}</p>
        <p className="text-xs text-white/70 mt-1">{data.message}</p>
      </div>
    );
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      {parsed.type === 'text' && parsed.content && (
        <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
          {parsed.content}
        </p>
      )}
      
      {parsed.type === 'insight_card' && parsed.data && (
        <DarkInsightCard data={parsed.data as InsightCardData} />
      )}
      
      {parsed.type === 'insight_cards' && Array.isArray(parsed.data) && (
        <div className="grid grid-cols-2 gap-2">
          {(parsed.data as InsightCardData[]).map((card, i) => (
            <DarkInsightCard key={i} data={card} />
          ))}
        </div>
      )}
      
      {parsed.type === 'alert' && parsed.data && (
        <DarkAlertBox data={parsed.data as AlertData} />
      )}
      
      {parsed.type === 'mixed' && parsed.items && (
        <>
          {parsed.items.map((item, i) => (
            <div key={i}>
              {item.type === 'text' && (
                <p className="text-sm text-white/90 whitespace-pre-wrap">{item.data}</p>
              )}
              {item.type === 'insight_card' && <DarkInsightCard data={item.data} />}
              {item.type === 'insight_cards' && (
                <div className="grid grid-cols-2 gap-2">
                  {item.data.map((card: InsightCardData, j: number) => (
                    <DarkInsightCard key={j} data={card} />
                  ))}
                </div>
              )}
              {item.type === 'alert' && <DarkAlertBox data={item.data} />}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
