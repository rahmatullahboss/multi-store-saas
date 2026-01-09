import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { 
  Store, 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Search,
  Zap,
  HardDrive,
  Ticket,
  Radio,
  History,
  BookOpen,
  Globe,
  Bot
} from 'lucide-react';

interface StoreItem {
  id: number;
  name: string;
  subdomain: string;
}

interface CommandMenuProps {
  stores: StoreItem[];
}

export function CommandMenu({ stores }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[9999]"
      // Note: cmdk's Dialog doesn't support overlayClassName directly in all versions, 
      // but commonly handled by wrapper or global css. If overlay is missing, we might need a Portal wrapper.
      // But let's assume standard behavior for now.
    >
      <div className="flex items-center border-b border-slate-800 px-4">
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <Command.Input 
          className="w-full bg-transparent py-4 text-lg text-white placeholder-slate-500 focus:outline-none"
          placeholder="Search stores, settings, or commands..."
        />
        <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded kbd">ESC</span>
        </div>
      </div>
      
      <Command.List className="max-h-[400px] overflow-y-auto p-2 scroll-py-2">
        <Command.Empty className="py-6 text-center text-slate-500">
          No results found.
        </Command.Empty>

        <Command.Group heading="Navigation" className="text-xs font-semibold text-slate-500 mb-2 px-2">
          <Command.Item 
            onSelect={() => runCommand(() => navigate('/admin'))}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Command.Item>
          <Command.Item 
             onSelect={() => runCommand(() => navigate('/admin/analytics'))}
             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
          >
            <Zap className="w-4 h-4" />
            Analytics
          </Command.Item>
          <Command.Item 
             onSelect={() => runCommand(() => navigate('/admin/stores'))}
             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
          >
            <Store className="w-4 h-4" />
            All Stores
          </Command.Item>
          <Command.Item 
             onSelect={() => runCommand(() => navigate('/admin/billing'))}
             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
          >
            <CreditCard className="w-4 h-4" />
            Billing
          </Command.Item>
          <Command.Item 
             onSelect={() => runCommand(() => navigate('/admin/team'))}
             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
          >
            <Users className="w-4 h-4" />
            Team & Access
          </Command.Item>
          <Command.Item 
             onSelect={() => runCommand(() => navigate('/admin/audit-logs'))}
             className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
          >
            <History className="w-4 h-4" />
            Audit Logs
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Stores" className="text-xs font-semibold text-slate-500 mb-2 mt-4 px-2">
          {stores.map(store => (
            <Command.Item
              key={store.id}
              value={`${store.name} ${store.subdomain}`}
              onSelect={() => runCommand(() => {
                // Navigate to admin stores with search param to locate/filter this store
                navigate(`/admin/stores?search=${store.subdomain}`);
              })}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 opacity-50" />
                <span>{store.name}</span>
              </div>
              <span className="text-xs opacity-50">{store.subdomain}</span>
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
