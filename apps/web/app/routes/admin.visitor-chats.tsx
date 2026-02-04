import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { desc, sql, eq } from 'drizzle-orm';
import { visitors, visitorMessages } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { MessageCircle, User, Phone, Clock, ChevronRight } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'Visitor Chats - Super Admin' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);
  const url = new URL(request.url);
  const selectedVisitorId = Number(url.searchParams.get('visitorId') || '0');
  
  // Require Super Admin
  await requireSuperAdmin(request, env, env.DB);

  // Fetch visitors with message count and latest activity
  // Note: D1/SQLite doesn't support complex joins with counts easily in Drizzle significantly without raw SQL or subqueries.
  // We'll fetch visitors and their messages. For a large app, we'd paginate and optimize.

  const allVisitors = await db
    .select()
    .from(visitors)
    .orderBy(desc(visitors.createdAt))
    .limit(50); // Limit to last 50 for now

  // Fetch messages for these visitors to get counts and preview
  // This is a naive N+1 approach but okay for low volume admin panel. 
  // Optimization: Use a single query with grouping if Drizzle supported it better for SQLite.
  
  const visitorsWithData = await Promise.all(allVisitors.map(async (v) => {
    const messages = await db
        .select()
        .from(visitorMessages)
        .where(eq(visitorMessages.visitorId, v.id))
        .orderBy(desc(visitorMessages.createdAt))
        .limit(1); // Just get last message

    const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(visitorMessages)
        .where(eq(visitorMessages.visitorId, v.id));

    return {
        ...v,
        lastMessage: messages[0]?.content || 'No messages',
        lastActive: messages[0]?.createdAt || v.createdAt,
        messageCount: countResult[0]?.count || 0
    };
  }));

  // Sort by last active
  visitorsWithData.sort((a, b) => {
      const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return dateB - dateA;
  });

  let selectedVisitor: typeof visitorsWithData[number] | null = null;
  let selectedMessages: Array<{
    id: number;
    role: string;
    content: string;
    createdAt: string | number | Date | null;
  }> = [];

  if (selectedVisitorId > 0) {
    selectedVisitor = visitorsWithData.find((v) => v.id === selectedVisitorId) ?? null;
    if (selectedVisitor) {
      selectedMessages = await db
        .select({
          id: visitorMessages.id,
          role: visitorMessages.role,
          content: visitorMessages.content,
          createdAt: visitorMessages.createdAt,
        })
        .from(visitorMessages)
        .where(eq(visitorMessages.visitorId, selectedVisitorId))
        .orderBy(desc(visitorMessages.createdAt))
        .limit(200);

      selectedMessages.reverse();
    }
  }

  return json({ visitors: visitorsWithData, selectedVisitorId, selectedVisitor, selectedMessages });
}

export default function VisitorChats() {
  const { visitors, selectedVisitorId, selectedVisitor, selectedMessages } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-green-500" />
          Visitor Chats / Leads
        </h1>
        <div className="text-sm text-slate-400">
          Total Leads: <span className="text-white font-bold">{visitors.length}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase text-slate-400 font-medium">
                <th className="px-6 py-4">Visitor / Lead</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4">Messages</th>
                <th className="px-6 py-4">Latest Message</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No visitor chats yet.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{visitor.name}</div>
                          <div className="text-xs text-slate-500">ID: {visitor.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-slate-500" />
                        {visitor.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {visitor.lastActive ? new Date(visitor.lastActive).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {visitor.messageCount} msgs
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-slate-400 truncate" title={visitor.lastMessage}>
                        {visitor.lastMessage}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/visitor-chats?visitorId=${visitor.id}`}
                        className={`text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1 ${
                          selectedVisitorId === visitor.id ? 'underline' : ''
                        }`}
                      >
                        View Chat <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVisitor && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold">Chat History: {selectedVisitor.name}</h2>
              <p className="text-xs text-slate-400">Visitor ID: {selectedVisitor.id} • {selectedVisitor.phone}</p>
            </div>
            <Link to="/admin/visitor-chats" className="text-xs text-slate-400 hover:text-slate-200">
              Close
            </Link>
          </div>

          <div className="max-h-[540px] overflow-y-auto p-4 space-y-3">
            {selectedMessages.length === 0 ? (
              <div className="text-sm text-slate-500">No messages found for this visitor.</div>
            ) : (
              selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                        : 'bg-slate-800 border border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] opacity-70 mb-1">
                      {msg.role === 'user' ? 'Visitor' : 'AI'} • {msg.createdAt ? new Date(msg.createdAt as any).toLocaleString() : 'N/A'}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
