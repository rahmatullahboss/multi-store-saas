/**
 * StatusTabs - Horizontal status filter tabs
 * Shopify-inspired design for filtering by status
 */

interface StatusTab {
  id: string;
  label: string;
  count?: number;
}

interface StatusTabsProps {
  tabs: StatusTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function StatusTabs({ tabs, activeTab, onChange }: StatusTabsProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-100
            ${activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === tab.id 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
