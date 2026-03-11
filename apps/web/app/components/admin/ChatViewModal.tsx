import { X, User, Phone, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

interface Visitor {
  id: number;
  name: string;
  phone: string;
  createdAt: Date;
}

interface Message {
  id: number;
  visitorId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatViewModalProps {
  isOpen: boolean;
  visitor: Visitor | null;
  messages: Message[];
  onClose: () => void;
}

export function ChatViewModal({ isOpen, visitor, messages, onClose }: ChatViewModalProps) {
  if (!isOpen || !visitor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {visitor.name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {visitor.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(visitor.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat History Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
              <MessageSquare className="w-8 h-8 opacity-50" />
              <p>No messages in this chat yet.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  msg.role === 'user' ? 'mr-auto items-start' : 'ml-auto items-end'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                      : 'bg-green-600 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Chat is securely stored</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close Chat
          </button>
        </div>

      </div>
    </div>
  );
}
