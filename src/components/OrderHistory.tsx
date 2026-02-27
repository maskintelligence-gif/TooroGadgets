import { useState } from 'react';
import { ShoppingBag, Calendar, ChevronRight, Package, CheckCircle2 } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  items: number;
}

export function OrderHistory() {
  const [orders] = useState<Order[]>([
    { id: 'ORD-2024-001', date: 'Feb 24, 2026', total: 450000, status: 'Processing', items: 2 },
    { id: 'ORD-2024-002', date: 'Feb 15, 2026', total: 150000, status: 'Delivered', items: 1 },
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Package className="w-6 h-6" />
        Order History
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{order.id}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    {order.date}
                  </div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                order.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                order.status === 'Processing' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                {order.status}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Items</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.items}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Total</span>
                  <span className="font-medium text-gray-900 dark:text-white">UGX {order.total.toLocaleString()}</span>
                </div>
              </div>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">When you place an order, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
