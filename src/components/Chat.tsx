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
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
      // Auto-trigger notification permission if not decided yet
      if (Notification.permission === 'default') {
        setTimeout(() => {
          requestNotifications();
        }, 1000);
      }
    }
  }, []);

  // Lock body scroll when chat is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const scrollDown = (smooth = true) => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'nearest' });
    }, 100);
  };

  const loadMessages = useCallback(async (convId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, []);

  const markRead = useCallback(async (convId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .eq('sender_type', 'admin')
        .is('read_at', null);
      
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('conversation_id', convId);
      
      onUnreadChange(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    if (identity) {
      loadMessages(identity.conversation_id);
    }
  }, [identity?.conversation_id]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollDown(false);
    }
  }, [loading, messages.length]);

  useEffect(() => {
    if (isActive && identity) {
      markRead(identity.conversation_id);
    }
  }, [isActive, identity?.conversation_id]);

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      
      if (result === 'granted') {
        new Notification('✅ Notifications Enabled', {
          body: 'You will now receive notifications when we reply.',
          icon: '/favicon.ico',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const showNotification = useCallback((content: string) => {
    if (notifPermission !== 'granted') return;
    if (isActive && document.visibilityState === 'visible') return;
    
    try {
      new Notification('TooroGadgets Support', {
        body: content.length > 80 ? content.slice(0, 80) + '…' : content,
        icon: '/favicon.ico',
        tag: 'tg-chat',
        requireInteraction: true,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [notifPermission, isActive]);

  // Real-time subscription
  useEffect(() => {
    if (!identity) return;

    const subscription = supabase
      .channel(`messages:${identity.conversation_id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${identity.conversation_id}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Check if message already exists
          setMessages(prev => {
            if (prev.some(msg => msg.message_id === newMessage.message_id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Handle admin messages
          if (newMessage.sender_type === 'admin') {
            if (isActive && document.visibilityState === 'visible') {
              // Mark as read immediately
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('message_id', newMessage.message_id)
                .then(() => {});
            } else {
              onUnreadChange(1);
              showNotification(newMessage.content);
            }
          }
          
          scrollDown();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [identity?.conversation_id, isActive, showNotification, onUnreadChange]);

  const send = async () => {
    if (!input.trim() || sending || !identity) return;
    
    const text = input.trim();
    setInput('');
    setSending(true);
    
    try {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: identity.conversation_id,
          sender_type: 'customer',
          message_type: 'text',
          content: text,
        });

      if (messageError) throw messageError;

      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          last_message: text,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('conversation_id', identity.conversation_id);

      if (conversationError) throw conversationError;

    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error to user
    } finally {
      setSending(false);
    }
  };

  if (!identity) {
    return (
      <div className="flex flex-col items-center w-full h-full px-0">
        <div className="w-full max-w-lg flex flex-col h-full">
          <IdentitySetup onDone={setIdentity} />
        </div>
      </div>
    );
  }

  const grouped = groupByDate(messages);

  return (
    <div className="flex flex-col items-center w-full h-full px-0">
      <div className="w-full max-w-lg flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">TooroGadgets Support</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
          {'Notification' in window && (
            <button 
              onClick={requestNotifications}
              className={`p-2 rounded-full ${notifPermission === 'granted' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            >
              {notifPermission === 'granted' 
                ? <Bell size={18} className="text-blue-600 dark:text-blue-400" />
                : <BellOff size={18} className="text-gray-400" />
              }
            </button>
          )}
        </div>

        {/* Messages Area - Takes remaining space */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-950">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <MessageCircle size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Hi {identity.name}! 👋</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                Send a message to start chatting
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="flex justify-center mb-4">
                    <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                      {group.date}
                    </span>
                  </div>
                  {group.messages.map((msg) => {
                    const isCustomer = msg.sender_type === 'customer';
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex mb-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCustomer && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                            <Zap size={12} className="text-white" fill="white" />
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isCustomer ? 'mr-2' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isCustomer
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isCustomer && (
                              <span>{msg.read_at ? '✓✓' : '✓'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['Prices?', 'Delivery?', 'Stock?', 'Payment?'].map((text) => (
              <button
                key={text}
                onClick={() => setInput(text)}
                className="flex-shrink-0 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
