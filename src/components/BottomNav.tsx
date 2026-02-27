import { Home, ShoppingCart, Clock, MessageCircle } from 'lucide-react';

export type Tab = 'home' | 'cart' | 'chat' | 'history' | 'privacy' | 'terms' | 'contact' | 'shipping' | 'returns';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  cartCount: number;
}

export function BottomNav({ activeTab, onTabChange, cartCount }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => onTabChange('cart')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'cart' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <ShoppingCart size={24} strokeWidth={activeTab === 'cart' ? 2.5 : 2} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'chat' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Chat</span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Clock size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">History</span>
        </button>
      </div>
    </div>
  );
}
