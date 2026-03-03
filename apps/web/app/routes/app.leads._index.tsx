/**
 * Unified Lead Management Dashboard
 * Combines Registered Users (Students) and Lead Form Submissions
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form, useSearchParams, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions } from '@db/schema';
import { eq, desc, and, sql, or, like } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Mail,
  Megaphone,
  Phone,
  Search,
  Settings2,
  Users,
} from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

// --- Types ---

export type UnifiedLead = {
  id: string; // "l_456"
  originalId: number;
  type: 'submission';
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  createdAt: string; // ISO string
  docCount: number;
  details?: unknown; // Extra info
};

// --- Loader ---

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });
  const db = drizzle(context.cloudflare.env.DB);
  const url = new URL(request.url);

  // Params
  const search = url.searchParams.get('q') || '';
  const status = url.searchParams.get('status') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('size') || '20');
  const sort = url.searchParams.get('sort') || 'createdAt';
  const order = url.searchParams.get('order') || 'desc';

  // --- Fetch Leads ---
  const leadConditions = [eq(leadSubmissions.storeId, storeId)];
  if (search) {
    const searchCondition = or(
      like(leadSubmissions.name, `%${search}%`),
      like(leadSubmissions.email, `%${search}%`),
      like(leadSubmissions.phone, `%${search}%`)
    );
    if (searchCondition) {
      leadConditions.push(searchCondition);
    }
  }

// ... imports

  if (status !== 'all') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leadConditions.push(eq(leadSubmissions.status, status as any));
  }

  // Execute Queries (Parallel)
  const [leadResults, stats] = await Promise.all([
    // 1. Leads
    db
      .select()
      .from(leadSubmissions)
      .where(and(...leadConditions))
      .orderBy(desc(leadSubmissions.createdAt))
      .limit(pageSize * 2),
      
    // 2. Stats
    db
    .select({
      totalLeads: sql<number>`count(*)`,
      converted: sql<number>`sum(case when status = 'converted' then 1 else 0 end)`,
    })
    .from(leadSubmissions)
    .where(eq(leadSubmissions.storeId, storeId))
  ]);
  
  // Transform
  const unifiedLeads: UnifiedLead[] = leadResults.map(l => ({
    id: `l_${l.id}`,
    originalId: l.id,
    type: 'submission',
    name: l.name,
    email: l.email,
    phone: l.phone,
    source: l.source === 'contact_form' ? `Form: ${l.formId || 'Global'}` : (l.source || 'Form'),
    status: l.status || 'new',
    createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
    docCount: 0, // Leads don't have docs yet
  }));

  const allItems = unifiedLeads;

  // Client-side Sort
  allItems.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Manual Pagination Slice
  const paginatedItems = allItems.slice(0, pageSize);

  return json({
    leads: paginatedItems,
    stats: stats[0] || { totalLeads: 0, converted: 0 },
    filters: { search, status, sort, order },
    pagination: { page, pageSize, hasNext: allItems.length > pageSize }
  });
}

// --- Component ---

const columnHelper = createColumnHelper<UnifiedLead>();

export default function UnifiedLeadsPage() {
  const { leads, stats, filters, pagination } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  // Columns definition
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
        </div>
      )
    }),
    columnHelper.accessor('email', {
      header: 'Contact',
      cell: info => {
        const row = info.row.original;
        return (
          <div className="flex flex-col gap-1">
            {row.email && (
               <a href={`mailto:${row.email}`} className="text-sm text-gray-600 hover:text-violet-600 flex items-center gap-1">
                 <Mail className="w-3 h-3" /> {row.email}
               </a>
            )}
            {row.phone && (
               <a href={`tel:${row.phone}`} className="text-sm text-gray-600 hover:text-violet-600 flex items-center gap-1">
                 <Phone className="w-3 h-3" /> {row.phone}
               </a>
            )}
          </div>
        );
      }
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: () => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium border bg-white border-gray-200 text-gray-500">
          Lead
        </span>
      )
    }),
    columnHelper.accessor('source', {
       header: 'Source',
       cell: info => <span className="text-gray-500 text-sm">{info.getValue()}</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('docCount', {
      header: 'Docs',
      cell: info => info.getValue() > 0 ? (
        <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
          <FileText className="w-4 h-4" />
          {info.getValue()}
        </div>
      ) : <span className="text-gray-300">-</span>
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: info => (
        <div className="text-sm text-gray-500">
          {new Date(info.getValue()).toLocaleDateString()}
          <div className="text-xs text-gray-400">{new Date(info.getValue()).toLocaleTimeString()}</div>
        </div>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: props => (
        <div className="flex justify-end gap-2">
            <Link 
              to={`/app/leads/${props.row.original.originalId}`}
              className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-violet-600"
            >
             <Eye className="w-4 h-4" />
           </Link>
        </div>
      )
    })
  ];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchParams(prev => {
      prev.set('q', formData.get('q') as string);
      return prev;
    });
  };

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Megaphone className="w-6 h-6 text-violet-600" />
             Inbox
           </h1>
           <p className="text-gray-500 mt-1">Unified view of all leads and registered students</p>
         </div>
         <div className="flex gap-3">
             <Link
               to="/app/settings/lead-gen"
               className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition font-medium text-gray-700 shadow-sm"
             >
               <Settings2 className="w-4 h-4" />
               Settings
             </Link>
         </div>
       </div>

       {/* Stats Overview */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-500">Total Leads</p>
             <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
           </div>
           <div className="p-3 bg-blue-50 rounded-lg"><Users className="w-6 h-6 text-blue-600"/></div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-500">Converted</p>
             <p className="text-3xl font-bold text-gray-900">{stats.converted}</p>
           </div>
           <div className="p-3 bg-green-50 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600"/></div>
         </div>
       </div>

       {/* Filters & Search */}
       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
         <Form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              name="q" 
              defaultValue={filters.search} 
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
         </Form>
         

       </div>

       {/* Table */}
       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

         {/* Mobile Card View */}
         <div className="md:hidden divide-y divide-gray-100">
           {table.getRowModel().rows.length === 0 ? (
             <div className="py-12 text-center text-gray-500 text-sm">No leads found.</div>
           ) : (
             table.getRowModel().rows.map(row => {
               const lead = row.original as any;
               return (
                 <div key={row.id} className="p-4 hover:bg-gray-50">
                   <div className="flex items-start justify-between gap-3">
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-gray-900 text-sm truncate">{lead.name}</p>
                       <p className="text-xs text-gray-500 mt-0.5">{lead.email}</p>
                       {lead.phone && <p className="text-xs text-gray-500">{lead.phone}</p>}
                     </div>
                     <div className="flex flex-col items-end gap-1.5">
                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                         lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                         lead.status === 'interested' ? 'bg-blue-100 text-blue-700' :
                         lead.status === 'lost' ? 'bg-red-100 text-red-700' :
                         'bg-yellow-100 text-yellow-700'
                       }`}>{lead.status || 'New'}</span>
                       {lead.source && <span className="text-xs text-gray-400">{lead.source}</span>}
                     </div>
                   </div>
                   {lead.notes && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{lead.notes}</p>}
                   <div className="flex items-center justify-between mt-3">
                     <span className="text-xs text-gray-400">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('bn-BD') : ''}</span>
                     <div className="flex gap-2">
                       <button className="text-xs text-violet-600 font-medium px-2 py-1 rounded hover:bg-violet-50">View</button>
                       <button className="text-xs text-gray-500 font-medium px-2 py-1 rounded hover:bg-gray-100">Edit</button>
                     </div>
                   </div>
                 </div>
               );
             })
           )}
         </div>

         {/* Desktop Table View */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-4">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition duration-150">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
         </div>

         {/* Pagination Controls */}
         <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
            <button 
              onClick={() => setSearchParams(prev => { prev.set('page', String(pagination.page - 1)); return prev })}
              disabled={pagination.page <= 1 || isLoading}
              className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page}
            </span>
            <button 
              onClick={() => setSearchParams(prev => { prev.set('page', String(pagination.page + 1)); return prev })}
              disabled={!pagination.hasNext || isLoading}
              className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
         </div>
       </div>
    </div>
  );
}
