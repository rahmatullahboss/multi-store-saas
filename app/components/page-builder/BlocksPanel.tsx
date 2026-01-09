import { BlocksProvider } from '@grapesjs/react';

export default function BlocksPanel() {
  return (
    <BlocksProvider>
      {({ blocks, dragStart, dragStop }) => {
        // Group blocks by category manually if categories prop is missing
        const categories: Record<string, any[]> = {};
        blocks.forEach((block) => {
          const cat = block.getCategoryLabel() || 'Uncategorized';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(block);
        });

        return (
          <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/30">
              <h3 className="font-bold text-gray-900">Content Blocks</h3>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Drag onto canvas</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.entries(categories).map(([catLabel, catBlocks]) => (
                  <div key={catLabel}>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                       {catLabel}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {catBlocks.map((block) => (
                        <div
                          key={block.getId()}
                          draggable
                          onDragStart={(ev) => dragStart(block, ev.nativeEvent)}
                          onDragEnd={() => dragStop()}
                          className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-emerald-500 hover:shadow-md transition cursor-grab group bg-gray-50/30"
                        >
                          <div 
                            className="text-gray-400 group-hover:text-emerald-600 mb-2 transition transform group-hover:scale-110"
                            dangerouslySetInnerHTML={{ __html: block.getMedia() || `
                              <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor"/></svg>
                            ` }}
                          />
                          <span className="text-[9px] font-bold text-gray-500 group-hover:text-emerald-700 text-center line-clamp-1">
                            {block.getLabel()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      }}
    </BlocksProvider>
  );
}
