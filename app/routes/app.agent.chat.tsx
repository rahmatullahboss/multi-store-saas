import { useState, useRef, useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { getStoreId } from '~/services/auth.server';
import { Send, User, Bot, Trash2 } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response("Unauthorized", { status: 401 });
  const db = drizzle(context.cloudflare.env.DB, { schema });

  const agent = await db.query.agents.findFirst({
    where: eq(schema.agents.storeId, storeId)
  });

  return json({ agent });
};

export default function AgentChatSimulator() {
  const { agent } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a temporary conversation ID for testing
  const [conversationId] = useState(() => Math.floor(Math.random() * 100000));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agent || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          agentId: agent.id,
          conversationId
        }),
      });

      if (res.ok) {
        const data = await res.json() as { text?: string, error?: string };
        
        if (data.text) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.text! }]);
        } else if (data.error) {
           setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
        }
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('connectionError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  if (!agent) {
    return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">{t('agentNotConfigured')}</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl h-[600px] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{agent.name} ({t('simulator')})</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {t('online')}
                    </p>
                </div>
            </div>
            <button 
                onClick={clearChat}
                className="text-gray-400 hover:text-red-500 transition p-2"
                title={t('clearChat')}
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                    <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>{t('testAgentDesc')}</p>
                </div>
            )}
            
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        max-w-[80%] rounded-2xl px-4 py-3 text-sm
                        ${msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}
                    `}>
                        {msg.content}
                    </div>
                </div>
            ))}
            
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('typeMessage')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    autoFocus
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
    </div>
  );
}
