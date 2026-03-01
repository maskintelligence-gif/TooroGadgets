import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageCircle, User, Phone, ChevronRight, Bell, BellOff, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  message_id: string;
  sender_type: 'customer' | 'admin';
  content: string;
  created_at: string;
  read_at: string | null;
}

interface CustomerIdentity {
  customer_id: string;
  name: string;
  phone: string;
  conversation_id: string;
}

const STORAGE_KEY = 'tg_customer_identity';

function loadIdentity(): CustomerIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveIdentity(id: CustomerIdentity) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(id)); } catch {}
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    if (date !== lastDate) {
      groups.push({ date, messages: [] });
      lastDate = date;
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
}

// ─── Identity Setup ───────────────────────────────────────────────────────────

function IdentitySetup({ onDone }: { onDone: (id: CustomerIdentity) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: existing } = await supabase
        .from('customers').select('customer_id').eq('phone', phone.trim()).maybeSingle();

      let customerId: string;
      if (existing) {
        customerId = existing.customer_id;
        await supabase.from('customers').update({ name: name.trim() }).eq('customer_id', customerId);
      } else {
        const { data: newCust, error: e } = await supabase
          .from('customers').insert({ name: name.trim(), phone: phone.trim(), location: 'Fort Portal' })
          .select('customer_id').single();
        if (e) throw new Error(e.message);
        customerId = newCust.customer_id;
      }

      const { data: existingConv } = await supabase
        .from('conversations').select('conversation_id').eq('customer_id', customerId).maybeSingle();

      let conversationId: string;
      if (existingConv) {
        conversationId = existingConv.conversation_id;
      } else {
        const { data: newConv, error: ce } = await supabase
          .from('conversations').insert({ customer_id: customerId, unread_count: 0 })
          .select('conversation_id').single();
        if (ce) throw new Error(ce.message);
        conversationId = newConv.conversation_id;
      }

      const identity = { customer_id: customerId, name: name.trim(), phone: phone.trim(), conversation_id: conversationId };
      saveIdentity(identity);
      onDone(identity);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-blue-600 shadow-lg shadow-blue-500/25">
        <Zap size={28} className="text-white" fill="white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Start a Conversation</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs">
        We typically reply within a few minutes. Enter your details to get started.
      </p>
      <div className="w-full max-w-sm space-y-3">
        <div className="relative">
          <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleStart()} placeholder="Your name" autoFocus
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all
              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
              border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
        </div>
        <div className="relative">
          <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleStart()} placeholder="Phone (e.g. 0701234567)" inputMode="tel"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all
              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
              border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
        </div>
        {error && <p className="text-xs text-rose-500 px-1">{error}</p>}
        <button onClick={handleStart} disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600
            hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60
            flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Setting up…</> : <>Start Chat <ChevronRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Main Chat ─────────────────────────────────────────────────────────────────

interface ChatProps {
  isActive: boolean;
  onUnreadChange: (count: number) => void;
}

export function Chat({ isActive, onUnreadChange }: ChatProps) {
  const [identity, setIdentity] = useState<CustomerIdentity | null>(() => loadIdentity());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission);
  }, []);

  const scrollDown = (smooth = true) => {
    endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  };

  const loadMessages = useCallback(async (convId: string) => {
    setLoading(true);
    const { data } = await supabase.from('messages').select('*')
      .eq('conversation_id', convId).order('created_at', { ascending: true }).limit(100);
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }, []);

  const markRead = useCallback(async (convId: string) => {
    await supabase.from('messages').update({ read_at: new Date().toISOString() })
      .eq('conversation_id', convId).eq('sender_type', 'admin').is('read_at', null);
    await supabase.from('conversations').update({ unread_count: 0 }).eq('conversation_id', convId);
    onUnreadChange(0);
  }, [onUnreadChange]);

  useEffect(() => {
    if (identity) loadMessages(identity.conversation_id);
  }, [identity?.conversation_id]);

  useEffect(() => {
    if (!loading && messages.length > 0) scrollDown(false);
  }, [loading]);

  useEffect(() => {
    if (isActive && identity) markRead(identity.conversation_id);
  }, [isActive, identity?.conversation_id]);

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const showNotification = useCallback((content: string) => {
    if (notifPermission !== 'granted') return;
    if (isActive && document.visibilityState === 'visible') return;
    new Notification('TooroGadgets Support', {
      body: content.length > 80 ? content.slice(0, 80) + '…' : content,
      icon: '/favicon.ico',
      tag: 'tg-chat',
    });
  }, [notifPermission, isActive]);

  // Real-time
  useEffect(() => {
    if (!identity) return;
    const ch = supabase.channel(`customer-chat-${identity.conversation_id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${identity.conversation_id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.find(m => m.message_id === msg.message_id) ? prev : [...prev, msg]);

        if (msg.sender_type === 'admin') {
          if (isActive && document.visibilityState === 'visible') {
            supabase.from('messages').update({ read_at: new Date().toISOString() })
              .eq('message_id', msg.message_id).then(() => {});
          } else {
            onUnreadChange(1); // signal unread
            showNotification(msg.content);
          }
        }
        setTimeout(() => scrollDown(), 80);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [identity?.conversation_id, isActive, showNotification, onUnreadChange]);

  const send = async () => {
    if (!input.trim() || sending || !identity) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      await supabase.from('messages').insert({
        conversation_id: identity.conversation_id,
        sender_type: 'customer',
        message_type: 'text',
        content: text,
      });
      await supabase.from('conversations').update({
        last_message_preview: text.slice(0, 100),
        updated_at: new Date().toISOString(),
        unread_count: 1,
      }).eq('conversation_id', identity.conversation_id);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (!identity) {
    return (
      <div className="max-w-lg mx-auto h-[calc(100vh-140px)]">
        <IdentitySetup onDone={setIdentity} />
      </div>
    );
  }

  const grouped = groupByDate(messages);

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-130px)]">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl flex-shrink-0
        bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">TooroGadgets Support</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Online · replies in minutes</p>
          </div>
        </div>
        {'Notification' in window && (
          <button onClick={requestNotifications}
            className={`p-2 rounded-xl transition-all active:scale-90 ${notifPermission === 'granted' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            title={notifPermission === 'granted' ? 'Notifications on' : 'Enable notifications'}>
            {notifPermission === 'granted'
              ? <Bell size={16} className="text-blue-600 dark:text-blue-400" />
              : <BellOff size={16} className="text-gray-400" />}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3
        bg-gray-50 dark:bg-gray-950 border-x border-gray-100 dark:border-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <MessageCircle size={24} className="text-blue-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800 dark:text-white text-sm">Hi {identity.name}! 👋</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send us a message and we'll reply shortly.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {grouped.map(group => (
              <div key={group.date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group.date}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                </div>

                {group.messages.map((msg, i) => {
                  const isCustomer = msg.sender_type === 'customer';
                  const nextMsg = group.messages[i + 1];
                  const isLastInGroup = !nextMsg || nextMsg.sender_type !== msg.sender_type;

                  return (
                    <div key={msg.message_id} className={`flex mb-0.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      {!isCustomer && (
                        <div className={`w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 mr-2 self-end mb-1
                          flex items-center justify-center ${isLastInGroup ? 'opacity-100' : 'opacity-0'}`}>
                          <Zap size={10} className="text-white" fill="white" />
                        </div>
                      )}
                      <div className={`max-w-[75%] ${!isCustomer && !isLastInGroup ? 'ml-8' : ''}`}>
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          isCustomer
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-700 shadow-sm'
                        } ${isLastInGroup ? '' : isCustomer ? 'rounded-br-2xl' : 'rounded-bl-2xl'}`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {isLastInGroup && (
                          <p className={`text-[10px] mt-1 px-1 text-gray-400 dark:text-gray-500 ${isCustomer ? 'text-right' : ''}`}>
                            {formatTime(msg.created_at)}
                            {isCustomer && (msg.read_at
                              ? <span className="ml-1 text-blue-500"> ✓✓</span>
                              : <span className="ml-1 text-gray-300 dark:text-gray-600"> ✓</span>)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Notification prompt */}
      {'Notification' in window && notifPermission === 'default' && (
        <button onClick={requestNotifications}
          className="flex items-center gap-2.5 px-4 py-2.5 flex-shrink-0 transition-all active:scale-[0.99]
            bg-blue-50 dark:bg-blue-900/20 border-x border-blue-100 dark:border-blue-800/50">
          <Bell size={14} className="text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">Enable notifications to get alerted when we reply</p>
          <span className="text-xs font-semibold text-blue-600">Enable →</span>
        </button>
      )}

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2 flex-shrink-0 no-scrollbar
        bg-white dark:bg-gray-900 border-x border-gray-100 dark:border-gray-800">
        {['What are your prices? 💰', 'Do you deliver? 🛵', 'Is this in stock? 📦', 'Payment options? 💳'].map(r => (
          <button key={r} onClick={() => { setInput(r); inputRef.current?.focus(); }}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all active:scale-95
              bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
              hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600
              border border-gray-200 dark:border-gray-700">
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 flex-shrink-0 rounded-b-2xl
        bg-white dark:bg-gray-900 border border-t-0 border-gray-100 dark:border-gray-800">
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Message TooroGadgets…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all
            bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
            border border-gray-200 dark:border-gray-700
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
        <button onClick={send} disabled={!input.trim() || sending}
          className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
          style={{ background: input.trim() ? '#2563eb' : '#e5e7eb' }}>
          {sending
            ? <Loader2 size={16} className="animate-spin text-white" />
            : <Send size={16} className={input.trim() ? 'text-white' : 'text-gray-400'} />}
        </button>
      </div>
    </div>
  );
}
