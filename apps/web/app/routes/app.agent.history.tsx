import { json, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams, Form, useSubmit, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { getStoreId } from '~/services/auth.server';
import { Bot, User, Clock, Search, MessageSquare, ArrowLeft, Phone } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { ClientDate, ClientTime } from '~/components/ui/ClientDate';

// Helper to parse AI response content
function parseMessageContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    // Handle structured AI responses
    if (parsed.type === 'text' && parsed.content) {
      return parsed.content;
    }
    if (parsed.type === 'product_cards' && parsed.data) {
      const products = parsed.data.map((p: any) => p.title).join(', ');
      return `[Products: ${products}]`;
    }
    if (parsed.type === 'insight_cards' && parsed.data) {
      return parsed.data.map((c: any) => `${c.title}: ${c.value}`).join(', ');
    }
    if (parsed.type === 'action_chips' && parsed.data) {
      return parsed.data.map((a: any) => a.label).join(', ');
    }
    // Return original if no known format
    return content;
  } catch {
    // Not JSON, return as-is
    return content;
  }
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw redirect('/auth/login');
  
  const db = drizzle(context.cloudflare.env.DB, { schema });
  const url = new URL(request.url);
  const selectedConvId = url.searchParams.get('id');

  // 1. Get Agent
  let agent;
  try {
    agent = await db.query.agents.findFirst({
      where: eq(schema.agents.storeId, storeId)
    });
  } catch (error) {
    console.error("Error fetching agent:", error);
    // Be resilient if table doesn't exist yet
    return json({ conversations: [], selectedConversation: null, agent: null });
  }

  if (!agent) {
    return json({ conversations: [], selectedConversation: null, agent: null });
  }

  // 2. Get Conversations List
  let conversations: typeof schema.aiConversations.$inferSelect[] = [];
  try {
    conversations = await db.query.aiConversations.findMany({
      where: eq(schema.aiConversations.agentId, agent.id),
      orderBy: [desc(schema.aiConversations.lastMessageAt)],
      limit: 50,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    conversations = [];
  }

  // 3. Get Selected Conversation Details
  let selectedConversation = null;
  if (selectedConvId) {
    try {
      const conv = await db.query.aiConversations.findFirst({
          where: eq(schema.aiConversations.id, parseInt(selectedConvId)),
          with: {
              messages: {
                  orderBy: (messages, { asc }) => [asc(messages.createdAt)]
              }
          }
      });
      
      if (conv && conv.agentId === agent.id) {
          selectedConversation = conv;
      }
    } catch (error) {
       console.error("Error fetching selected conversation:", error);
       selectedConversation = null;
    }
  }

  return json({ conversations, selectedConversation, agent });
};

export default function AgentHistory() {
  const { conversations, selectedConversation, agent } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  if (!agent) {
      return (
          <div className="text-center py-12">
              <p className="text-gray-500">{t('agentNotConfigured')}</p>
          </div>
      );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[600px] flex">
      {/* Sidebar: Conversation List */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="font-semibold text-gray-900 mb-2">{t('inbox')}</h2>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={t('searchCustomers')} 
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    disabled
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>{t('noConversationsYet')}</p>
                </div>
            ) : (
                conversations.map(conv => (
                    <Link 
                        key={conv.id}
                        to={`?id=${conv.id}`}
                        className={`
                            block p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition
                            ${selectedConversation?.id === conv.id ? 'bg-white border-l-4 border-l-emerald-500 shadow-sm' : 'border-l-4 border-l-transparent'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-900 truncate pr-2">
                                {conv.customerName || `${t('guest')} (${conv.id})`}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                <ClientDate date={conv.lastMessageAt} />
                            </span>
                        </div>
                        {conv.customerPhone && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                <Phone className="w-3 h-3" />
                                <span>{conv.customerPhone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            {conv.status === 'active' ? (
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            ) : (
                                <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                            )}
                            <span className="capitalize">{t(conv.status as any)}</span>
                        </div>
                    </Link>
                ))
            )}
        </div>
      </div>

      {/* Main Content: Chat View */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
            <>
                {/* Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm">
                    <button 
                        onClick={() => setSearchParams({})}
                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold">
                        {(selectedConversation.customerName?.[0] || 'G').toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {selectedConversation.customerName || t('guestUser')}
                        </h3>
                        {selectedConversation.customerPhone && (
                            <p className="text-sm text-gray-700 flex items-center gap-1 font-medium">
                                <Phone className="w-3 h-3" />
                                {selectedConversation.customerPhone}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                           {t('started')} <ClientDate date={selectedConversation.createdAt} />
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className={`
                                        rounded-2xl px-4 py-3 text-sm shadow-sm
                                        ${msg.role === 'user' 
                                            ? 'bg-white text-gray-800 rounded-tl-none border border-gray-200' 
                                            : 'bg-emerald-600 text-white rounded-tr-none'}
                                    `}>
                                        {parseMessageContent(msg.content)}
                                    </div>
                                    <div className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'assistant' ? 'text-right' : ''}`}>
                                        <ClientTime date={msg.createdAt} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer (Read Only) */}
                <div className="p-4 border-t border-gray-200 bg-white text-center text-xs text-gray-400">
                    {t('readOnlyView')}
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <p>{t('selectConversation')}</p>
            </div>
        )}
      </div>
    </div>
  );
}
