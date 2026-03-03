/**
 * AI Conversations Dashboard
 * 
 * Shows all AI chat conversations for merchants to review and monitor.
 * Displays customer name, phone, timestamps, and full message history.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql } from 'drizzle-orm';
import { aiConversations, messages } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { useState } from 'react';
import { MessageSquare, User, Phone, Clock, ChevronDown, ChevronUp, Bot, ArrowLeft } from 'lucide-react';

export const meta: MetaFunction = () => [{ title: 'AI Conversations | Dashboard' }];

interface Conversation {
  id: number;
  customerName: string | null;
  customerPhone: string | null;
  status: 'active' | 'closed' | 'transferred' | null;
  createdAt: string | null;
  lastMessageAt: string | null;
  messageCount: number;
}

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string | null;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });

  const db = drizzle(env.DB);

  // AI Assistant is now available to all stores via credit system
  // No longer checking isCustomerAiEnabled - all stores can use it

  // Get all conversations for this store with message count
  const conversationsResult = await db
    .select({
      id: aiConversations.id,
      customerName: aiConversations.customerName,
      customerPhone: aiConversations.customerPhone,
      status: aiConversations.status,
      createdAt: aiConversations.createdAt,
      lastMessageAt: aiConversations.lastMessageAt,
    })
    .from(aiConversations)
    .where(eq(aiConversations.storeId, storeId))
    .orderBy(desc(aiConversations.lastMessageAt));

  // Get message counts for each conversation
  const conversationsWithCounts: Conversation[] = await Promise.all(
    conversationsResult.map(async (conv) => {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(eq(messages.conversationId, conv.id));

      // D1/Drizzle may materialize timestamp columns as Date objects.
      // Normalize to ISO strings for consistent JSON + UI typing.
      const createdAt =
        conv.createdAt instanceof Date ? conv.createdAt.toISOString() : conv.createdAt;
      const lastMessageAt =
        conv.lastMessageAt instanceof Date ? conv.lastMessageAt.toISOString() : conv.lastMessageAt;

      return {
        ...conv,
        createdAt: createdAt ?? null,
        lastMessageAt: lastMessageAt ?? null,
        messageCount: countResult[0]?.count || 0,
      };
    })
  );

  return json({ conversations: conversationsWithCounts, aiEnabled: true });
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = async () => {
    if (conversationMessages.length > 0) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ai-conversations/${conversation.id}/messages`);
      if (response.ok) {
        const data = await response.json() as { messages?: Message[] };
        setConversationMessages(data.messages || []);
      }
    } catch {
      console.error('Failed to load messages');
    } finally {
      setIsLoading(false);
      setIsExpanded(true);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Conversation Header */}
      <button
        onClick={loadMessages}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">
              {conversation.customerName || 'Anonymous Customer'}
            </p>
            {conversation.customerPhone && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {conversation.customerPhone}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1 justify-end">
              <MessageSquare className="w-3 h-3" />
              {conversation.messageCount} messages
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <Clock className="w-3 h-3" />
              {formatDate(conversation.lastMessageAt)}
            </div>
          </div>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Messages */}
      {isExpanded && conversationMessages.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3 max-h-[400px] overflow-y-auto">
          {conversationMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-gray-600' : 'bg-indigo-600'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIConversationsPage() {
  const { conversations, aiEnabled } = useLoaderData<typeof loader>();

  if (!aiEnabled) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">AI Sales Agent Not Enabled</h2>
          <p className="text-gray-500 mb-4">
            Enable AI Sales Agent to start collecting customer conversations.
          </p>
          <Link
            to="/app/settings"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/app/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Conversations</h1>
          <p className="text-sm text-gray-500">
            View all customer conversations with your AI Sales Agent
          </p>
        </div>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No Conversations Yet</h3>
          <p className="text-sm text-gray-500">
            Customer conversations will appear here once they start chatting with your AI.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </div>
      )}
    </div>
  );
}
