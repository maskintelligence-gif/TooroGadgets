import { useState } from 'react';
import { ShoppingCart, Search, Menu, User, Zap, X, Home, Clock, MessageCircle, Phone, Truck, RotateCcw, ChevronRight, Moon, Sun, LayoutGrid } from 'lucide-react';
import { Tab } from './BottomNav';
import { Category, categories } from '../data/products';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTabChange?: (tab: Tab) => void;
  onCategoryChange?: (category: Category) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function Header({ cartCount, onCartClick, searchQuery, onSearchChange, onTabChange, onCategoryChange, theme, onThemeChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: Tab) => {
    onTabChange?.(tab);
    setIsMenuOpen(false);
  };

  const handleCategoryClick = (category: Category) => {
    onCategoryChange?.(category);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleTabClick('home')}
            >
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Zap size={20} className="fill-current" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden sm:block">
                TOOROGADGETS
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl px-4 sm:px-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="Search products, brands and categories..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:block">
                <User size={20} />
              </button>
              <button 
                onClick={onCartClick}
                className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span 
                    className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors sm:hidden"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <Zap size={20} className="fill-current" />
                </div>
                <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                  TOOROGADGETS
                </span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex-1">
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Theme</h3>
                <div className="flex items-center gap-2 px-3">
                  <button 
                    onClick={() => onThemeChange('light')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-colors font-medium ${
                      theme === 'light' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Sun size={18} />
                    Light
                  </button>
                  <button 
                    onClick={() => onThemeChange('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-colors font-medium ${
                      theme === 'dark' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Moon size={18} />
                    Dark
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <button onClick={() => handleTabClick('home')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                  <Home size={20} />
                  Home
                </button>
                <button onClick={() => handleTabClick('categories')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                  <LayoutGrid size={20} />
                  Categories
                </button>
                <button onClick={() => handleTabClick('cart')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                  <ShoppingCart size={20} />
                  Cart
                  {cartCount > 0 && <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}
                </button>
                <button onClick={() => handleTabClick('history')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                  <Clock size={20} />
                  Order History
                </button>
                <button onClick={() => handleTabClick('chat')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                  <MessageCircle size={20} />
                  Live Chat
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button 
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full flex items-center justify-between p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left"
                    >
                      {category}
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Support</h3>
                <div className="space-y-1">
                  <button onClick={() => handleTabClick('contact')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                    <Phone size={20} />
                    Contact Us
                  </button>
                  <button onClick={() => handleTabClick('shipping')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                    <Truck size={20} />
                    Shipping Policy
                  </button>
                  <button onClick={() => handleTabClick('returns')} className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium text-left">
                    <RotateCcw size={20} />
                    Returns & Exchanges
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
