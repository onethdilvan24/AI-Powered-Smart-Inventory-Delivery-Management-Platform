import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Package, ShoppingCart, Truck, AlertTriangle } from 'lucide-react';
import { products } from '../data/products';
import { orders } from '../data/orders';
import { deliveries } from '../data/deliveries';
import type { ChatMessage } from '../types';
import { formatCurrency } from '../lib/utils';

const SUGGESTED_PROMPTS = [
  { icon: <AlertTriangle className="w-4 h-4" />, text: 'Which products are low in stock?' },
  { icon: <ShoppingCart className="w-4 h-4" />, text: 'How many pending deliveries today?' },
  { icon: <Truck className="w-4 h-4" />, text: 'Show delayed orders.' },
  { icon: <Package className="w-4 h-4" />, text: 'What products are expired?' },
  { icon: <Sparkles className="w-4 h-4" />, text: 'Give me an inventory summary.' },
];

function generateResponse(input: string): string {
  const q = input.toLowerCase();

  if (q.includes('low') && (q.includes('stock') || q.includes('inventory'))) {
    const lowItems = products.filter(p => p.status === 'low' || p.status === 'critical');
    if (lowItems.length === 0) return 'Great news — all products are currently well-stocked!';
    return `You have **${lowItems.length} products** with low or critical stock levels:\n\n${lowItems.map(p =>
      `• **${p.name}** — ${p.quantity} ${p.unit} remaining (min: ${p.minStock} ${p.unit})`
    ).join('\n')}\n\nI recommend placing restock orders for these items soon.`;
  }

  if (q.includes('expired') || q.includes('expiry')) {
    const expired = products.filter(p => p.status === 'expired');
    if (expired.length === 0) return 'No products are currently expired. All items are within their expiry dates.';
    return `There are **${expired.length} expired product(s)**:\n\n${expired.map(p =>
      `• **${p.name}** — expired ${p.expiryDate}`
    ).join('\n')}\n\nPlease remove these from inventory to maintain food safety standards.`;
  }

  if (q.includes('pending') || (q.includes('order') && q.includes('today'))) {
    const pending = orders.filter(o => o.status === 'pending');
    if (pending.length === 0) return 'There are no pending orders at the moment.';
    return `There are **${pending.length} pending orders** today:\n\n${pending.map(o =>
      `• **${o.orderNumber}** from ${o.supplierName} — ${formatCurrency(o.total)}`
    ).join('\n')}\n\nWould you like me to help track any of these?`;
  }

  if (q.includes('delayed') || q.includes('delay')) {
    const delayed = deliveries.filter(d => d.status === 'delayed');
    if (delayed.length === 0) return 'Good news — there are no delayed deliveries right now!';
    return `**${delayed.length} delivery/deliveries** are currently delayed:\n\n${delayed.map(d =>
      `• **${d.orderNumber}** — Driver: ${d.driver.name}, ETA: ${d.eta}`
    ).join('\n')}\n\nConsider contacting the drivers or suppliers to get updates.`;
  }

  if (q.includes('delivery') || q.includes('deliveries') || q.includes('in transit') || q.includes('truck')) {
    const inTransit = deliveries.filter(d => d.status === 'in_transit');
    const scheduled = deliveries.filter(d => d.status === 'scheduled');
    return `Current fleet status:\n\n• **${inTransit.length}** delivery/deliveries in transit\n• **${scheduled.length}** scheduled\n• **${deliveries.filter(d => d.status === 'delivered').length}** delivered today\n\nWould you like details on a specific delivery?`;
  }

  if (q.includes('summary') || q.includes('overview') || q.includes('status')) {
    const totalValue = products.reduce((s, p) => s + p.quantity * p.costPerUnit, 0);
    const lowStock = products.filter(p => p.status === 'low' || p.status === 'critical').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
    return `Here's your **current inventory summary**:\n\n📦 **Inventory**\n• Total products: ${products.length}\n• Inventory value: ${formatCurrency(totalValue)}\n• Low/critical stock: ${lowStock} items\n\n🛒 **Orders**\n• Pending orders: ${pending}\n• Delivered today: ${orders.filter(o => o.status === 'delivered').length}\n\n🚚 **Deliveries**\n• In transit: ${inTransit}\n• Delayed: ${deliveries.filter(d => d.status === 'delayed').length}`;
  }

  if (q.includes('supplier') || q.includes('vendors')) {
    return `You have **6 suppliers** in total — 5 active and 1 inactive.\n\nTop performers:\n• **Fresh Farms Co.** — 4.8★, 96% on-time\n• **Meat Masters** — 4.7★, 94% on-time\n• **Dairy Best Ltd.** — 4.5★, 92% on-time\n\nWould you like to place a new order with any supplier?`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return "Hello! 👋 I'm FoodFlow's AI assistant. I can help you with:\n\n• Inventory status and low-stock alerts\n• Order tracking and summaries\n• Delivery tracking updates\n• Supplier performance insights\n\nWhat would you like to know?";
  }

  if (q.includes('restock') || q.includes('order more') || q.includes('replenish')) {
    const critical = products.filter(p => p.status === 'critical');
    return `Based on current stock levels, I recommend restocking **${critical.length} critical items**:\n\n${critical.map(p =>
      `• **${p.name}** — only ${p.quantity} ${p.unit} left (supplier: ${p.supplier})`
    ).join('\n')}\n\nWould you like me to create draft orders for these?`;
  }

  return `I understand you're asking about "${input}". I can help you with inventory levels, orders, deliveries, and supplier information.\n\nTry asking:\n• "Which products are low in stock?"\n• "How many pending orders today?"\n• "Show me an inventory summary"\n• "Are there any delayed deliveries?"`;
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm FoodFlow's AI warehouse assistant. Ask me about inventory, orders, deliveries, or suppliers — I'm here to help!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    const q = text.trim();
    if (!q) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(q);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  }

  function renderContent(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i} className="block leading-relaxed">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
              : part
          )}
        </span>
      );
    });
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ask me anything about your inventory, orders, or deliveries.</p>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">FoodFlow Assistant</p>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" /> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-3.5 h-3.5 text-white" />
                    : <User className="w-3.5 h-3.5 text-gray-600" />
                  }
                </div>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-gray-50 text-gray-800 rounded-tl-none'
                      : 'bg-primary-600 text-white rounded-tr-none'
                  }`}>
                    {renderContent(msg.content)}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-3.5 border-t border-gray-100">
            <form
              onSubmit={e => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about inventory, orders, deliveries..."
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Suggested prompts sidebar */}
        <div className="w-64 hidden lg:flex flex-col gap-3">
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Suggested</p>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.text)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-primary-50 hover:text-primary-700 text-sm text-gray-700 transition-colors group"
                >
                  <span className="text-gray-400 group-hover:text-primary-500 shrink-0">{p.icon}</span>
                  <span className="leading-tight">{p.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-primary-50 border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <p className="text-xs font-semibold text-primary-700">AI Powered</p>
            </div>
            <p className="text-xs text-primary-600 leading-relaxed">
              This assistant uses real-time mock data from your inventory, orders, and fleet to answer questions intelligently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
