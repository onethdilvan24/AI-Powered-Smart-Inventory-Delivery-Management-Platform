import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle, Package, Truck, BarChart3 } from 'lucide-react';
import { assistantService } from '../services/assistant.service';
import type { ChatMessage } from '../types';

const QUICK_PROMPTS = [
  { icon: <AlertTriangle className="w-4 h-4" />, label: 'Low Stock Alert', prompt: 'Which items are low in stock?' },
  { icon: <Package className="w-4 h-4" />, label: 'Expiry Check', prompt: 'Are there any expired or expiring products?' },
  { icon: <Truck className="w-4 h-4" />, label: 'Delivery Status', prompt: 'What deliveries are delayed or in transit?' },
  { icon: <BarChart3 className="w-4 h-4" />, label: 'Order Summary', prompt: 'Summarize current order status.' },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: "Hello! I'm your FoodFlow AI assistant. I have access to your live inventory, orders, deliveries, and supplier data. How can I help you today?",
  timestamp: new Date().toISOString(),
};

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await assistantService.query(text.trim());
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I couldn't process your request right now. (${err instanceof Error ? err.message : 'Unknown error'})`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" /> AI Assistant
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Ask questions about your live inventory, orders, and deliveries.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="xl:w-64 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Prompts</p>
          <div className="space-y-2">
            {QUICK_PROMPTS.map(q => (
              <button
                key={q.label}
                onClick={() => sendMessage(q.prompt)}
                disabled={loading}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-xl text-sm text-gray-600 transition-colors text-left group"
              >
                <span className="text-gray-400 group-hover:text-primary-600 transition-colors">{q.icon}</span>
                {q.label}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Data Sources</p>
            <div className="space-y-1.5 text-xs text-gray-500">
              {['Live Inventory', 'Orders Database', 'Delivery Tracking', 'Supplier Records'].map(s => (
                <p key={s} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {s}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-gray-600" />
                  }
                </div>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'assistant'
                      ? 'bg-gray-50 text-gray-800 rounded-tl-none'
                      : 'bg-primary-600 text-white rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <form
              onSubmit={e => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about inventory, orders, deliveries..."
                disabled={loading}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Responses are generated from your live database. Results may vary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
