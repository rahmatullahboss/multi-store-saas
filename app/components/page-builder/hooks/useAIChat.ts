/**
 * useAIChat Hook
 * 
 * Manages AI chat conversation, action execution,
 * and undo/redo functionality.
 */

import { useState, useCallback, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { toast } from 'sonner';
import { ActionValidator, ActionExecutor } from '~/lib/grapesjs/services';
import type { 
  ChatMessage, 
  AIResponse, 
  HistoryEntry, 
  SelectedComponent 
} from '~/lib/grapesjs/types';

interface UseAIChatReturn {
  messages: ChatMessage[];
  history: HistoryEntry[];
  isLoading: boolean;
  pendingResponse: AIResponse | null;
  sendMessage: (content: string) => void;
  applyAction: () => Promise<void>;
  rejectAction: () => void;
  revertToPoint: (entry: HistoryEntry) => void;
  clearChat: () => void;
}

export function useAIChat(
  editor: any, 
  selectedComponent: SelectedComponent | null
): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hi! একটি element সিলেক্ট করুন, তারপর বলুন কি করতে চান।',
      timestamp: new Date(),
      status: 'success',
    }
  ]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pendingResponse, setPendingResponse] = useState<AIResponse | null>(null);
  
  const actionExecutorRef = useRef<ActionExecutor | null>(null);
  const fetcher = useFetcher<{ success: boolean; data?: any; error?: string }>();

  // Initialize ActionExecutor
  if (editor && !actionExecutorRef.current) {
    actionExecutorRef.current = new ActionExecutor(editor);
  }

  const isLoading = fetcher.state !== 'idle';

  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || !selectedComponent) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      context: {
        selectedElementId: selectedComponent.id,
        selectedElementType: selectedComponent.type,
      },
      status: 'success',
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    fetcher.submit(
      JSON.stringify({
        action: 'STRICT_EDIT',
        selectedComponent,
        userCommand: content,
      }),
      { method: 'post', action: '/api/ai/action', encType: 'application/json' }
    );
  }, [selectedComponent, fetcher]);

  // Process AI response
  const processResponse = useCallback((data: any) => {
    if (!data || !selectedComponent) return;

    const validator = new ActionValidator(selectedComponent.id);
    const validation = validator.validate({
      success: true,
      actions: data.actions || [data],
      explanation: data.explanation || data.message || 'পরিবর্তন করা হবে',
    });

    if (validation.valid && validation.sanitizedResponse) {
      setPendingResponse(validation.sanitizedResponse);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: validation.sanitizedResponse!.explanation,
        timestamp: new Date(),
        status: 'preview',
      }]);
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ ${validation.errors.join(', ')}`,
        timestamp: new Date(),
        status: 'error',
      }]);
    }
  }, [selectedComponent]);

  const applyAction = useCallback(async () => {
    if (!pendingResponse || !actionExecutorRef.current || !selectedComponent) return;

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
          targetComponentId: selectedComponent.id,
          targetComponentType: selectedComponent.type,
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
      setPendingResponse(null);
    }
  }, [pendingResponse, selectedComponent, messages]);

  const rejectAction = useCallback(() => {
    setPendingResponse(null);
    setMessages(prev => prev.map((msg, idx) => 
      idx === prev.length - 1 
        ? { ...msg, status: 'error' as const, content: '🔄 Cancelled' } 
        : msg
    ));
  }, []);

  const revertToPoint = useCallback((entry: HistoryEntry) => {
    if (!actionExecutorRef.current) return;

    const undoneCount = actionExecutorRef.current.undoToPoint(entry.undoCount);
    if (undoneCount > 0) {
      setHistory(prev => prev.filter(h => h.undoCount <= entry.undoCount));
      toast.success(`↩️ ${undoneCount}টি পরিবর্তন undo হয়েছে`);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: '👋 Hi! একটি element সিলেক্ট করুন, তারপর বলুন কি করতে চান।',
      timestamp: new Date(),
      status: 'success',
    }]);
    setHistory([]);
    setPendingResponse(null);
  }, []);

  return {
    messages,
    history,
    isLoading,
    pendingResponse,
    sendMessage,
    applyAction,
    rejectAction,
    revertToPoint,
    clearChat,
  };
}
