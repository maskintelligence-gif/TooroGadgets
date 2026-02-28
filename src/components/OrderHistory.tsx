import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  Store,
  Clock,
  Loader2,
  Phone,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCustomer } from '../hooks/useCustomer';

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  image?: string;
}

interface Order {
  order_id: string;
  order_number: string;
  fulfillment_type: 'delivery' | 'pickup';
  order_items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  order_status: string;
  delivery_location: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending_confirmation: { label: 'Pending Confirmation', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_delivery: { label: 'In Delivery', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  complete: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function PhonePrompt({ onSubmit }: { onSubmit: (phone: string) => void }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = () => {
    const clean = phone.replace(/\s/g, '');
    if (!clean) { setError('Please enter your phone number'); return; }
    if (!/^(\+256|0)7\d{8}$/.test(clean)) { setError('Enter a valid Uganda phone number'); return; }
    onSubmit(clean);
  };
  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone size={28} className="text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">View Your Orders</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Enter the phone number you used when ordering.</p>
      <div className="text-left">
        <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }}
          placeholder="+256701234567" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors mb-2" />
        {error && <p className="text-rose-500 text-xs mb-3 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
        <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">Find My Orders</button>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.order_status] ?? { label: order.order_status, color: 'bg-gray-100 text-gray-700' };
  const date = new Date(order.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
  const totalItems = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><ShoppingBag size={18} className="text-blue-600" /></div>
            <div>
              <p className="font-black text-blue-600 text-lg tracking-tight">{order.order_number}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={11} />{date}</div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${status.color}`}>{status.label}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            <div><span className="text-gray-400 text-xs block">Items</span><span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span></div>
            <div><span className="text-gray-400 text-xs block">Total</span><span className="font-bold text-gray-900 dark:text-white">UGX {order.total_amount?.toLocaleString()}</span></div>
            <div><span className="text-gray-400 text-xs block">Method</span><span className="font-medium text-gray-900 dark:text-white">{order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}</span></div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-blue-600 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="space-y-3 mb-4">
            {order.order_items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.image && <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 overflow-hidden flex-shrink-0"><img src={item.image} alt={item.product_name} className="w-full h-full object-cover" /></div>}
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product_name}</p><p className="text-xs text-gray-400">× {item.quantity}</p></div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">UGX {item.subtotal?.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>UGX {order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Delivery fee</span><span>{order.delivery_fee === 0 ? 'FREE' : `UGX ${order.delivery_fee?.toLocaleString()}`}</span></div>
            <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1"><span>Total</span><span>UGX {order.total_amount?.toLocaleString()}</span></div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            {order.fulfillment_type === 'delivery' ? <Truck size={13} /> : <Store size={13} />}
            <span className="capitalize font-medium">{order.fulfillment_type}</span>
            {order.delivery_location && <><span>•</span><MapPin size={13} /><span>{order.delivery_location}</span></>}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderHistory() {
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState<string | null>(customer?.phone ?? null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrders = async (searchPhone: string) => {
    setLoading(true); setNotFound(false);
    try {
      const { data: cust } = await supabase.from('customers').select('customer_id').eq('phone', searchPhone).maybeSingle();
      if (!cust) { setNotFound(true); setOrders([]); return; }
      const { data, error } = await supabase.from('orders').select('*').eq('customer_id', cust.customer_id).order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data as Order[]) ?? []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (phone) fetchOrders(phone); }, [phone]);

  if (!phone) return <PhonePrompt onSubmit={(p) => setPhone(p)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Package className="w-6 h-6" />Order History</h1>
        <button onClick={() => { setPhone(null); setOrders([]); }} className="text-xs text-gray-400 hover:text-blue-600 transition-colors">Change number</button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
      ) : notFound ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No account found</h3>
          <p className="text-gray-500 text-sm mt-1">No orders found for <strong>{phone}</strong>.</p>
          <button onClick={() => setPhone(null)} className="mt-4 text-blue-600 text-sm font-medium">Try a different number</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</h3>
          <p className="text-gray-500 text-sm mt-1">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{orders.length} order{orders.length !== 1 ? 's' : ''} for <span className="font-medium text-gray-600 dark:text-gray-300">{phone}</span></p>
          <div className="space-y-4">{orders.map((order) => <OrderCard key={order.order_id} order={order} />)}</div>
        </>
      )}
    </div>
  );
}
