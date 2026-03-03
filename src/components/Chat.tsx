import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Phone, User, AlertCircle, Loader2, ChevronDown, ArrowLeft } from 'lucide-react';
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
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: 'var(--accent)', opacity: 0.1 }}>
            <MessageCircle size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Start a Conversation</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Enter your details to chat with us</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text2)' }}>
              <User size={14} className="inline mr-1" /> Full Name
            </label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. John Mwesigye"
              className="w-full px-4 py-3 rounded-xl focus:outline-none"
              style={{ 
                background: 'var(--surface2)', 
                color: 'var(--text)', 
                border: '1px solid',
                borderColor: errors.name ? 'var(--rose)' : 'var(--border)'
              }} 
            />
            {errors.name && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--rose)' }}>
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text2)' }}>
              <Phone size={14} className="inline mr-1" /> Phone Number
            </label>
            <input 
              type="tel" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              placeholder="+256 701 234567"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 rounded-xl focus:outline-none"
              style={{ 
                background: 'var(--surface2)', 
                color: 'var(--text)', 
                border: '1px solid',
                borderColor: errors.phone ? 'var(--rose)' : 'var(--border)'
              }} 
            />
            {errors.phone && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--rose)' }}>
                <AlertCircle size={12} /> {errors.phone}
              </p>
            )}
          </div>
          
          <button 
            onClick={handleSubmit} 
            className="w-full py-3 rounded-xl font-semibold transition-all active:scale-95"
            style={{ background: 'var(--accent)', color: 'white' }}
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [identity, setIdentity] = useState<{ name: string; phone: string } | null>(
    customer ? { name: customer.name, phone: customer.phone } : null
  );

  // Handle keyboard appearance on mobile
  useEffect(() => {
    const handleResize = () => {
      // Visual Viewport API gives actual visible area dimensions
      if (window.visualViewport) {
        const windowHeight = window.innerHeight;
        const visualViewportHeight = window.visualViewport.height;
        const keyboardVisible = windowHeight - visualViewportHeight > 100;
        
        if (keyboardVisible) {
          setKeyboardHeight(windowHeight - visualViewportHeight);
          // Scroll to bottom when keyboard opens
          setTimeout(() => scrollToBottom('auto'), 100);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

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

  // Focus input when conversation loads
  useEffect(() => {
    if (conversationId && !initializing) {
      inputRef.current?.focus();
    }
  }, [conversationId, initializing]);

  if (!identity) return <IdentityForm onSubmit={handleIdentitySubmit} />;

  if (initializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
           style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
             style={{ background: 'var(--accent)', opacity: 0.1 }}>
          <MessageCircle size={18} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Customer Support</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
            <span className="text-xs" style={{ color: 'var(--text3)' }}>Typically replies instantly</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ paddingBottom: keyboardHeight > 0 ? '8px' : '16px' }}
      >
        <div className="space-y-3">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3"
                   style={{ 
                     background: 'var(--surface)',
                     color: 'var(--text)',
                     borderBottomLeftRadius: '4px',
                     border: '1px solid var(--border)'
                   }}>
                <p className="text-sm whitespace-pre-wrap">
                  Hello {identity.name.split(' ')[0]}! 👋 How can we help you today?
                </p>
                <p className="text-[10px] mt-1" style={{ opacity: 0.6, textAlign: 'right' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, index) => {
            const isCustomer = msg.sender_type === 'customer';
            const showAvatar = !isCustomer && (index === 0 || messages[index - 1]?.sender_type === 'customer');
            
            return (
              <div key={msg.message_id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar for admin messages */}
                  {!isCustomer && showAvatar && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium"
                         style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                      CS
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`flex-1 ${!isCustomer && !showAvatar ? 'ml-10' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      isCustomer 
                        ? '' 
                        : ''
                    }`}
                         style={{
                           background: isCustomer ? 'var(--accent)' : 'var(--surface)',
                           color: isCustomer ? 'white' : 'var(--text)',
                           borderBottomRightRadius: isCustomer ? '4px' : '16px',
                           borderBottomLeftRadius: isCustomer ? '16px' : '4px',
                           border: !isCustomer ? '1px solid var(--border)' : 'none'
                         }}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    
                    {/* Timestamp and read status */}
                    <div className={`flex items-center gap-1 mt-1 text-[10px]`}
                         style={{ color: 'var(--text3)', justifyContent: isCustomer ? 'flex-end' : 'flex-start' }}>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isCustomer && msg.read_at && <span>✓✓</span>}
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

      {/* Scroll to bottom button - adjusted for keyboard */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute right-4 rounded-full p-2 shadow-lg transition-all active:scale-90 z-10"
          style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)',
            bottom: keyboardHeight > 0 ? keyboardHeight + 16 : 80
          }}
        >
          <ChevronDown size={20} style={{ color: 'var(--text2)' }} />
        </button>
      )}

      {/* Input Area - Now with keyboard awareness */}
      <div 
        className="flex-shrink-0 transition-all duration-200"
        style={{ 
          background: 'var(--surface)', 
          borderTop: '1px solid var(--border)',
          transform: `translateY(${keyboardHeight > 0 ? 0 : 0}px)`,
          paddingBottom: keyboardHeight > 0 ? '8px' : '12px'
        }}
      >
        <div className="px-4 py-3">
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || loading}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
              style={{ background: inputText.trim() ? 'var(--accent)' : 'var(--surface2)' }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" style={{ color: inputText.trim() ? 'white' : 'var(--text3)' }} />
              ) : (
                <Send size={16} style={{ color: inputText.trim() ? 'white' : 'var(--text3)' }} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
