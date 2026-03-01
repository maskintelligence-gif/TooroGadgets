import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Phone, User, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
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
    <div className="h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start a Conversation</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your details to chat with us</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <User size={14} className="inline mr-1" /> Full Name
            </label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. John Mwesigye"
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`} 
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Phone size={14} className="inline mr-1" /> Phone Number
            </label>
            <input 
              type="tel" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              placeholder="+256 701 234567"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                errors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`} 
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.phone}
              </p>
            )}
          </div>
          
          <button 
            onClick={handleSubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Start Chat
          </button>
        </div>
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [identity, setIdentity] = useState<{ name: string; phone: string } | null>(
    customer ? { name: customer.name, phone: customer.phone } : null
  );

  // Scroll to bottom function
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Auto-scroll to bottom on new messages if user is near bottom
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom) {
      scrollToBottom('auto');
    }
  }, [messages]);

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
      
      // Scroll to bottom after loading messages
      setTimeout(() => scrollToBottom('auto'), 100);

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
      
      // Scroll to bottom after sending
      scrollToBottom('smooth');
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
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header - Fixed */}
      <div className="flex-none bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900 dark:text-white">Customer Support</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Typically replies instantly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="max-w-3xl mx-auto w-full space-y-3">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[70%] bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-900 dark:text-white">
                  Hello {identity.name.split(' ')[0]}! 👋 How can we help you today?
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, index) => {
            const isCustomer = msg.sender_type === 'customer';
            const showAvatar = !isCustomer && (index === 0 || messages[index - 1]?.sender_type === 'customer');
            
            return (
              <div key={msg.message_id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] sm:max-w-[70%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar for admin messages */}
                  {!isCustomer && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">CS</span>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`flex-1 ${!isCustomer && !showAvatar ? 'ml-10' : ''}`}>
                    <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      isCustomer
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    
                    {/* Timestamp and read status */}
                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${
                      isCustomer ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                      {isCustomer && (
                        <span>
                          {msg.read_at ? '· Read' : '· Delivered'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Invisible element for scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-20 right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Input Area - Fixed */}
      <div className="flex-none bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <textarea
                ref={inputRef as any}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none max-h-32"
                style={{ overflow: 'hidden' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || loading}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
