import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Link, useSearchParams } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { desc, sql, eq, inArray } from 'drizzle-orm';
import { visitors, visitorMessages } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { MessageCircle, User, Phone, Clock, Search, ChevronRight } from 'lucide-react';
import { ChatViewModal } from '~/components/admin/ChatViewModal';

export const meta: MetaFunction = () => {
  return [{ title: 'Visitor Chats - Super Admin' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);
  
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
  // ⚡ Bolt: Batch queries to avoid N+1 problem and network latency on Cloudflare D1
  
  const visitorIds = allVisitors.map(v => v.id);

  let counts: { visitorId: number; count: number }[] = [];
  let lastMessages: { visitorId: number; content: string; createdAt: Date | number }[] = [];

  if (visitorIds.length > 0) {
    [counts, lastMessages] = await Promise.all([
      db
        .select({
            visitorId: visitorMessages.visitorId,
            count: sql<number>`count(*)`
        })
        .from(visitorMessages)
        .where(inArray(visitorMessages.visitorId, visitorIds))
        .groupBy(visitorMessages.visitorId),
      db
        .select({
            visitorId: visitorMessages.visitorId,
            content: visitorMessages.content,
            createdAt: sql<number>`max(${visitorMessages.createdAt})`
        })
        .from(visitorMessages)
        .where(inArray(visitorMessages.visitorId, visitorIds))
        .groupBy(visitorMessages.visitorId)
    ]);
  }

  const countsMap = new Map(counts.map(c => [c.visitorId, c.count]));
  const messagesMap = new Map(lastMessages.map(m => [m.visitorId, m]));

  const visitorsWithData = allVisitors.map(v => {
    const msg = messagesMap.get(v.id);
    // Drizzle returns aggregate timestamps as epoch numbers, so we must rehydrate to Date
    const lastActiveDate = msg?.createdAt ? new Date(msg.createdAt) : v.createdAt;

    return {
        ...v,
        lastMessage: msg?.content || 'No messages',
        lastActive: lastActiveDate,
        messageCount: countsMap.get(v.id) || 0
    };
  });

  // Sort by last active
  visitorsWithData.sort((a, b) => {
      const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return dateB - dateA;
  });

  // Handle selected chat fetch
  const url = new URL(request.url);
  const chatId = url.searchParams.get('chatId');
  let selectedMessages: typeof visitorMessages.$inferSelect[] = [];
  let selectedVisitor = null;

  if (chatId) {
    const visitorIdNum = Number(chatId);
    if (!isNaN(visitorIdNum)) {
      selectedVisitor = visitorsWithData.find(v => v.id === visitorIdNum) || null;
      selectedMessages = await db
        .select()
        .from(visitorMessages)
        .where(eq(visitorMessages.visitorId, visitorIdNum))
        .orderBy(visitorMessages.createdAt);
    }
  }

  return json({
    visitors: visitorsWithData,
    selectedMessages,
    selectedVisitor
  });
}

export default function VisitorChats() {
  const { visitors, selectedMessages, selectedVisitor } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');

  const handleCloseModal = () => {
    setSearchParams((prev) => {
      prev.delete('chatId');
      return prev;
    }, { replace: true, preventScrollReset: true });
  };

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
                        to={`?chatId=${visitor.id}`}
                        preventScrollReset
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1 transition-colors"
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

      <ChatViewModal
        isOpen={!!chatId && !!selectedVisitor}
        visitor={selectedVisitor ? {
          ...selectedVisitor,
          createdAt: new Date(selectedVisitor.createdAt)
        } : null}
        messages={selectedMessages.map(msg => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        }))}
        onClose={handleCloseModal}
      />
    </div>
  );
}
