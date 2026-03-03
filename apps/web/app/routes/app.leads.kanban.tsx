import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions } from '@db/schema';
import { eq, desc, and, type InferSelectModel } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { KanbanBoard, type Column, type KanbanItem } from '~/components/lead-gen/KanbanBoard';
import type { DragEndEvent } from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const db = drizzle(context.cloudflare.env.DB);
  
  // Fetch all leads
  const leads = await db
    .select()
    .from(leadSubmissions)
    .where(eq(leadSubmissions.storeId, storeId))
    .orderBy(desc(leadSubmissions.createdAt));

  return json({ leads });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'update_status') {
    const leadId = Number(formData.get('leadId'));
    const newStatus = formData.get('status') as string;

    if (!leadId || !newStatus) return json({ error: 'Invalid data' }, { status: 400 });

    const db = drizzle(context.cloudflare.env.DB);
    await db
      .update(leadSubmissions)
      .set({ status: newStatus as "new" | "contacted" | "qualified" | "converted" | "lost", updatedAt: new Date() })
      .where(and(eq(leadSubmissions.id, leadId), eq(leadSubmissions.storeId, storeId)));

    return json({ success: true });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

const COLUMNS: Column[] = [
  { id: 'new', title: 'New' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'converted', title: 'Converted' },
  { id: 'lost', title: 'Lost' },
];

export default function LeadKanbanPage() {
  const { leads } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // Optimistic state
  const [items, setItems] = useState<KanbanItem[]>(() => 
    leads.map(l => ({
      id: String(l.id),
      columnId: l.status || 'new',
      content: null, // Rendered dynamically
      data: l
    }))
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overColumnId = String(over.id); // In our board implementation, dropping on a column puts it there

    // We only care if the column changed
    const currentItem = items.find(i => i.id === activeId);
    if (!currentItem || currentItem.columnId === overColumnId) return;

    // Is it a valid status column?
    if (!COLUMNS.find(c => c.id === overColumnId)) return;

    // Optimistic Update
    setItems(prev => prev.map(item => 
      item.id === activeId ? { ...item, columnId: overColumnId } : item
    ));

    // Server Update
    fetcher.submit(
      { intent: 'update_status', leadId: activeId, status: overColumnId },
      { method: 'post' }
    );

  }, [items, fetcher]);

  const renderItem = (item: KanbanItem) => {
    const lead = item.data as InferSelectModel<typeof leadSubmissions>;
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/app/leads/${lead.id}`} className="font-medium text-gray-900 hover:text-violet-600 line-clamp-1">
            {lead.name}
          </Link>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {format(new Date(lead.createdAt), 'MMM d')}
          </span>
        </div>
        
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center text-xs text-gray-500 gap-1.5 truncate">
              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-xs text-gray-500 gap-1.5 truncate">
              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
             <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {lead.source === 'contact_form' ? 'Form' : lead.source}
             </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
       <div className="flex items-center gap-4 mb-6">
          <Link to="/app/leads" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
            <p className="text-sm text-gray-500">Drag and drop to update status</p>
          </div>
       </div>

       <div className="flex-1 overflow-hidden">
          <KanbanBoard 
            columns={COLUMNS} 
            items={items} 
            onDragOver={() => {}} // Simple sortable implementation
            onDragEnd={handleDragEnd}
            renderItem={renderItem}
          />
       </div>
    </div>
  );
}
