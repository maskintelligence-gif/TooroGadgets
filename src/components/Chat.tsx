import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Phone, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCustomer } from '../hooks/useCustomer';

interface Message {
  message_id: string;
  sender_type: 'customer' | 'admin';
  content: string;
  created_at: string;
  read_at: string | null;
}

function IdentityForm({ onSubmit }: { onSubmit: (name: string, phone: string) => void }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^(\+256|0)7\d{8}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid Uganda phone number';
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(form.name.trim(), form.phone.replace(/\s/g, ''));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageCircle size={28} className="text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start a Conversation</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Enter your details to chat with us. We typically reply within minutes.</p>
      <div className="text-left space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            <User size={13} className="inline mr-1" />Full Name
          </label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Mwesigye"
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${errors.name ? 'border-rose-400' : 'border-gray-200 dark:border-gray-700'}`} />
          {errors.name && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            <Phone size={13} className="inline mr-1" />Phone Number
          </label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+256701234567"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${errors.phone ? 'border-rose-400' : 'border-gray-200 dark:border-gray-700'}`} />
          {errors.phone && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.phone}</p>}
        </div>
        <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">Start Chat</button>
      </div>
    </div>
  );
}

export function Chat() {
  const { customer, saveCustomer } = useCustomer();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(customer?.customer_id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [identity, setIdentity] = useState<{ name: string; phone: string } | null>(
    customer ? { name: customer.name, phone: customer.phone } : null
  );

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Initialize conversation
  const initConversation = async (name: string, phone: string) => {
    setInitializing(true);
    try {
      // Find or create customer
      let custId = customerId;
      if (!custId) {
        const { data: existing } = await supabase.from('customers').select('customer_id').eq('phone', phone).maybeSingle();
        if (existing) {
          custId = existing.customer_id;
        } else {
          const { data: newCust, error } = await supabase.from('customers').insert({ name, phone }).select('customer_id').single();
          if (error) throw error;
          custId = newCust.customer_id;
        }
        setCustomerId(custId);
        if (customer) saveCustomer({ ...customer, customer_id: custId });
      }

      // Find or create conversation
      const { data: existingConv } = await supabase.from('conversations').select('conversation_id').eq('customer_id', custId).maybeSingle();
      let convId: string;
      if (existingConv) {
        convId = existingConv.conversation_id;
      } else {
        const { data: newConv, error } = await supabase.from('conversations').insert({ customer_id: custId, status: 'active' }).select('conversation_id').single();
        if (error) throw error;
        convId = newConv.conversation_id;
      }
      setConversationId(convId);

      // Load messages
      const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(100);
      setMessages((msgs as Message[]) ?? []);

    } catch (err) {
      console.error('Failed to init conversation:', err);
    } finally {
      setInitializing(false);
    }
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.message_id === newMsg.message_id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Handle identity submission
  const handleIdentitySubmit = (name: string, phone: string) => {
    setIdentity({ name, phone });
    if (customer) saveCustomer({ ...customer, name, phone });
    initConversation(name, phone);
  };

  useEffect(() => {
    if (identity && customerId) initConversation(identity.name, identity.phone);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId || loading) return;
    const text = inputText.trim();
    setInputText('');
    setLoading(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'customer',
        sender_id: customerId,
        message_type: 'text',
        content: text,
      });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(text); // restore on failure
    } finally {
      setLoading(false);
    }
  };

  if (!identity) return <IdentityForm onSubmit={handleIdentitySubmit} />;

  if (initializing) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />Chat with Us
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">We typically reply within a few minutes.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                <p className="text-sm text-gray-900 dark:text-white">
                  Hello {identity.name.split(' ')[0]}! 👋 How can we help you today?
                </p>
                <p className="text-[10px] mt-1 text-gray-400">TooroGadgets</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.message_id} className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.sender_type === 'customer'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.sender_type === 'customer' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.sender_type === 'customer' && msg.read_at && ' · Read'}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || loading}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
