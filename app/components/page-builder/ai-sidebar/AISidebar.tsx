/**
 * AI Sidebar Component
 * 
 * Lovable-style docked sidebar for AI-powered element editing.
 * Features:
 * - Context display showing selected element
 * - Chat interface for natural language commands
 * - History timeline with revert capability
 * - Quick suggestion chips
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFetcher } from '@remix-run/react';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  MessageSquare, 
  History, 
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '~/contexts/LanguageContext';

// Sub-components
import ContextDisplay from './ContextDisplay';
import SuggestionChips from './SuggestionChips';
import ActionPreview from './ActionPreview';
import MessageBubble from './MessageBubble';

// Services & Types
import { 
  ContextBuilder, 
  ActionValidator, 
  ActionExecutor 
} from '~/lib/grapesjs/services';
import type { 
  SelectedComponent, 
  ChatMessage, 
  AIResponse, 
  HistoryEntry 
} from '~/lib/grapesjs/types';

interface AISidebarProps {
  editor: any;
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
}

export default function AISidebar({ 
  editor, 
  isOpen, 
  onToggle, 
  isLocked = false 
}: AISidebarProps) {
  const { t } = useTranslation();
  
  // State
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<AIResponse | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contextBuilderRef = useRef<ContextBuilder | null>(null);
  const actionExecutorRef = useRef<ActionExecutor | null>(null);
  
  // Fetcher for AI API
  const fetcher = useFetcher<{ success: boolean; data?: any; error?: string }>();

  // Initialize services when editor is available
  useEffect(() => {
    if (editor) {
      contextBuilderRef.current = new ContextBuilder(editor);
      actionExecutorRef.current = new ActionExecutor(editor);
    }
  }, [editor]);

  // Track selection changes
  useEffect(() => {
    if (!editor) return;

    const handleSelect = () => {
      const selected = editor.getSelected();
      if (selected && contextBuilderRef.current) {
        const context = contextBuilderRef.current.buildContext(selected);
        setSelectedComponent(context.selectedComponent);
      }
    };

    const handleDeselect = () => {
      setSelectedComponent(null);
    };

    editor.on('component:selected', handleSelect);
    editor.on('component:deselected', handleDeselect);

    return () => {
      editor.off('component:selected', handleSelect);
      editor.off('component:deselected', handleDeselect);
    };
  }, [editor]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '👋 Hi! একটি element সিলেক্ট করুন, তারপর বলুন কি করতে চান।',
        timestamp: new Date(),
        status: 'success',
      }]);
    }
  }, []);

  // Handle AI response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.success && fetcher.data.data) {
        // Parse response and show preview
        const aiData = fetcher.data.data;
        
        // Validate response
        if (selectedComponent) {
          const validator = new ActionValidator(selectedComponent.id);
          const validation = validator.validate({
            success: true,
            actions: aiData.actions || [aiData],
            explanation: aiData.explanation || aiData.message || 'পরিবর্তন করা হবে',
          });

          if (validation.valid && validation.sanitizedResponse) {
            setPendingResponse(validation.sanitizedResponse);
            
            // Add preview message
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: validation.sanitizedResponse!.explanation,
              timestamp: new Date(),
              status: 'preview',
            }]);
          } else {
            // Validation failed
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: `❌ ${validation.errors.join(', ')}`,
              timestamp: new Date(),
              status: 'error',
            }]);
          }
        }
      } else if (fetcher.data.error) {
        // Error response
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ ${fetcher.data?.error}`,
          timestamp: new Date(),
          status: 'error',
        }]);
      }
    }
  }, [fetcher.state, fetcher.data, selectedComponent]);

  // Submit chat message
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !selectedComponent || fetcher.state !== 'idle') return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      context: {
        selectedElementId: selectedComponent.id,
        selectedElementType: selectedComponent.type,
      },
      status: 'success',
    };
    setMessages(prev => [...prev, userMessage]);
    setActiveTab('chat');

    // Send to AI
    fetcher.submit(
      JSON.stringify({
        action: 'STRICT_EDIT',
        selectedComponent,
        userCommand: input,
      }),
      { method: 'post', action: '/api/ai/action', encType: 'application/json' }
    );

    setInput('');
  }, [input, selectedComponent, fetcher]);

  // Apply pending changes
  const handleApply = useCallback(async () => {
    if (!pendingResponse || !actionExecutorRef.current) return;

    setIsApplying(true);
    try {
      const result = await actionExecutorRef.current.execute(pendingResponse);
      
      if (result.success) {
        // Add to history
        const historyEntry: HistoryEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          actionType: pendingResponse.actions[0]?.action || 'unknown',
          description: pendingResponse.explanation,
          undoCount: actionExecutorRef.current.getUndoStackSize(),
          messageId: messages[messages.length - 1]?.id || '',
          targetComponentId: selectedComponent?.id || '',
          targetComponentType: selectedComponent?.type || 'custom',
        };
        setHistory(prev => [...prev, historyEntry]);

        // Update message status
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, status: 'success' as const } : msg
        ));

        toast.success('✅ পরিবর্তন সফল হয়েছে!');
      } else {
        toast.error('❌ Apply করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      toast.error('❌ Error applying changes');
    } finally {
      setIsApplying(false);
      setPendingResponse(null);
    }
  }, [pendingResponse, selectedComponent, messages]);

  // Reject pending changes
  const handleReject = useCallback(() => {
    setPendingResponse(null);
    setMessages(prev => prev.map((msg, idx) => 
      idx === prev.length - 1 ? { ...msg, status: 'error' as const, content: '🔄 Cancelled' } : msg
    ));
  }, []);

  // Revert to history point
  const handleHistoryRevert = useCallback((entry: HistoryEntry) => {
    if (!actionExecutorRef.current) return;

    const undoneCount = actionExecutorRef.current.undoToPoint(entry.undoCount);
    if (undoneCount > 0) {
      setHistory(prev => prev.filter(h => h.undoCount <= entry.undoCount));
      toast.success(`↩️ ${undoneCount}টি পরিবর্তন undo হয়েছে`);
    }
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  };

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="h-full w-12 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-3">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          title="Open AI Chat"
        >
          <Sparkles size={18} />
        </button>
        <div className="w-6 h-[1px] bg-gray-200" />
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab('history'); }}
          className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-200 transition"
          title="History"
        >
          <History size={16} />
        </button>
        {history.length > 0 && (
          <span className="text-[10px] font-bold text-indigo-600">{history.length}</span>
        )}
      </div>
    );
  }

  // Closed state
  if (!isOpen) return null;

  return (
    <div className="h-full w-[380px] bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right-5 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-40" />
            <Sparkles size={18} className="relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">OZZYL AI</h3>
              {isLocked && (
                <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                  PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Element Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsCollapsed(true)} 
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
            title="Collapse"
          >
            <ChevronRight size={16} />
          </button>
          <button 
            onClick={onToggle} 
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Context Display */}
      <ContextDisplay 
        selectedComponent={selectedComponent} 
        className="border-b border-gray-100"
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors ${
            activeTab === 'chat' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={14} />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors relative ${
            activeTab === 'history' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={14} />
          History
          {history.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] rounded-full leading-none">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 custom-scrollbar">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg}
                showRevert={msg.status === 'success' && msg.role === 'assistant'}
              />
            ))}
            
            {/* Loading State */}
            {fetcher.state !== 'idle' && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                </div>
                <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl shadow-sm">
                  <span className="text-xs text-gray-500">AI চিন্তা করছে...</span>
                </div>
              </div>
            )}

            {/* Action Preview */}
            {pendingResponse && (
              <ActionPreview 
                response={pendingResponse}
                onApply={handleApply}
                onReject={handleReject}
                isApplying={isApplying}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No history yet</p>
                <p className="text-xs text-gray-400 mt-1">AI actions will appear here</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-3">
                  {history.slice().reverse().map((entry, idx) => (
                    <div key={entry.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                        {history.length - idx}
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-gray-900">
                              {entry.actionType.replace(/_/g, ' ')}
                            </span>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{entry.description}</p>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTime(entry.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleHistoryRevert(entry)}
                            className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                          >
                            <RotateCcw size={10} />
                            Revert
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {selectedComponent && !pendingResponse && fetcher.state === 'idle' && (
        <SuggestionChips 
          componentType={selectedComponent.type}
          onClick={handleSuggestionClick}
          className="px-4 py-2 border-t border-gray-100"
        />
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
        {!selectedComponent ? (
          <div className="text-center py-3 text-gray-400 text-sm">
            👆 Canvas থেকে element সিলেক্ট করুন
          </div>
        ) : (
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${selectedComponent.type} এ কি করতে চান?`}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition border border-transparent focus:border-indigo-200"
              disabled={fetcher.state !== 'idle' || isApplying}
            />
            <button 
              type="submit"
              disabled={!input.trim() || fetcher.state !== 'idle' || isApplying}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-md"
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
