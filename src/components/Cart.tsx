import { Product } from '../data/products';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose?: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onProductClick: (product: Product) => void;
  variant?: 'modal' | 'inline';
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onProductClick, variant = 'modal' }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen && variant === 'modal') return null;

  const content = (
    <div className={`flex flex-col h-full ${variant === 'inline' ? 'bg-transparent' : 'bg-white shadow-2xl'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b border-gray-100 ${variant === 'inline' ? 'px-0' : ''}`}>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" />
          Your Cart
        </h2>
        {variant === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Items */}
      <div className={`flex-1 overflow-y-auto p-6 ${variant === 'inline' ? 'px-0' : ''}`}>
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
              <p className="text-gray-500 mt-1">Looks like you haven't added anything yet.</p>
            </div>
            {variant === 'modal' && onClose && (
              <button
                onClick={onClose}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-6">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div 
                  className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-2 cursor-pointer hover:border-blue-200 transition-colors"
                  onClick={() => onProductClick(item)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <h3 
                      className="text-sm font-medium text-gray-900 line-clamp-2 pr-4 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => onProductClick(item)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.category}</p>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className={`border-t border-gray-100 p-6 bg-gray-50 ${variant === 'inline' ? 'rounded-xl mx-0 mb-6' : ''}`}>
          <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
            <p>Subtotal</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Shipping and taxes calculated at checkout.
          </p>
          <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
            Checkout Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );

  if (variant === 'inline') {
    return <div className="max-w-3xl mx-auto px-4">{content}</div>;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50"
      />

      {/* Slide-over panel */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        {content}
      </div>
    </>
  );
}
