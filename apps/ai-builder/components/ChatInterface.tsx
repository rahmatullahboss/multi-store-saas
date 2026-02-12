'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, RefreshCw, Zap, User, Bot, Edit3 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onCodeGenerated: (code: string) => void;
  storeId?: number;
  productId?: number;
}

export function ChatInterface({ onCodeGenerated, storeId = 1, productId = 1 }: ChatInterfaceProps) {
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: prompt.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear prompt
    const currentPrompt = prompt.trim();
    setPrompt('');
    setIsGenerating(true);

    // Add assistant message placeholder
    const assistantId = generateId();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: 'Generating your landing page...',
      timestamp: new Date(),
    }]);

    try {
      // API will handle edit mode automatically based on existingCode
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          images: images.length > 0 ? images : undefined,
          storeId,
          productId,
          existingCode: currentCode || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullCode = '';

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  fullCode += content;
                  setCurrentCode(fullCode);
                  onCodeGenerated(fullCode);
                  
                  // Update assistant message
                  setMessages(prev => prev.map(m => 
                    m.id === assistantId 
                      ? { ...m, content: 'Generated! Click to see preview →', code: fullCode }
                      : m
                  ));
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
      
      // Final update
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: '✨ Landing page generated! You can ask me to modify any part.', code: fullCode }
          : m
      ));
      
      toast.success('Landing page generated!');
    } catch (error) {
      console.error('Generation error:', error);
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: `❌ Error: ${error instanceof Error ? error.message : 'Generation failed'}` }
          : m
      ));
      toast.error(error instanceof Error ? error.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
      setImages([]);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentCode('');
    onCodeGenerated('');
    toast.success('Conversation reset');
  };

  const examplePrompts = [
    '🛒 মধু বিক্রি করার জন্য একটি সুন্দর ল্যান্ডিং পেজ বানাও',
    '👟 Create a shoe product landing page with dark theme',
    '💄 Design a skincare product page with elegant pink colors',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Builder
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Describe your landing page and watch it come to life
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800"
          >
            <RefreshCw className="w-3 h-3" />
            New Chat
          </button>
        )}
      </div>

      {/* Backend Info */}
      <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Zap className="w-3 h-3 text-purple-500" />
          <span>OpenRouter • arcee-ai/trinity-large-preview</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  হাই! 👋 আমি আপনার AI ল্যান্ডিং পেজ বিল্ডার। আপনার পণ্যের বর্ণনা দিন, আমি সাথে সাথে সুন্দর ল্যান্ডিং পেজ তৈরি করে দেব!
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Try an example:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {examplePrompts.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 text-left"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Image Upload */}
            <div className="ml-11">
              <ImageUpload 
                images={images} 
                onImagesChange={setImages} 
                maxImages={2}
              />
            </div>
          </div>
        )}

        {/* Message History */}
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-blue-600' 
                : 'bg-gradient-to-br from-purple-600 to-pink-600'
            }`}>
              {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.content}</p>
              {message.role === 'assistant' && message.code && (
                <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  Ask me to modify any part!
                </p>
              )}
              <p className="text-xs text-gray-600 mt-1">
                {message.timestamp.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900/30">
        {/* Image upload for ongoing chat */}
        {messages.length > 0 && images.length === 0 && (
          <div className="mb-3">
            <ImageUpload 
              images={images} 
              onImagesChange={setImages} 
              maxImages={2}
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={messages.length > 0 ? "বলুন কি পরিবর্তন করতে চান..." : "আপনার পণ্যের বিস্তারিত বলুন..."}
            rows={2}
            className="flex-1 resize-none bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {isGenerating && (
          <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
            <span className="animate-pulse">●</span>
            কোড জেনারেট হচ্ছে...
          </p>
        )}
      </form>
    </div>
  );
}
