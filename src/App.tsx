import { useState, useRef, useLayoutEffect } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { ProductDetails } from './components/ProductDetails';
import { BottomNav, Tab } from './components/BottomNav';
import { OrderHistory } from './components/OrderHistory';
import { Chat } from './components/Chat';
import { Checkout } from './components/Checkout';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ContactUs } from './components/ContactUs';
import { ShippingPolicy } from './components/ShippingPolicy';
import { ReturnsExchanges } from './components/ReturnsExchanges';
import { Category, categories } from './data/products';
import { Product } from './data/products';
import { LayoutGrid, List, ArrowLeft } from 'lucide-react';
import { useProducts } from './hooks/useProducts';

interface CartItem extends Product {
  quantity: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [filterType, setFilterType] = useState<'all' | 'new' | 'sale'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating-desc'>('featured');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [returnToCart, setReturnToCart] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showCheckout, setShowCheckout] = useState(false);

  // Live products from Supabase (falls back to hardcoded)
  const { products, isLive } = useProducts();

  const scrollPositionRef = useRef(0);
  const footerRef = useRef<HTMLElement>(null);
  const shouldScrollToFooter = useRef(false);

  useLayoutEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const filteredProducts = products.filter(p => {
    const categoryMatch = activeCategory === 'All' || p.category === activeCategory;
    const filterMatch =
      filterType === 'all' ||
      (filterType === 'new' && p.isNew) ||
      (filterType === 'sale' && p.originalPrice && p.originalPrice > p.price);
    const searchMatch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && filterMatch && searchMatch;
  }).sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'rating-desc') return b.rating - a.rating;
    return 0;
  });

  useLayoutEffect(() => {
    if (!selectedProduct && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [selectedProduct]);

  useLayoutEffect(() => {
    if (shouldScrollToFooter.current && activeTab === 'home') {
      footerRef.current?.scrollIntoView();
      shouldScrollToFooter.current = false;
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  const handleProductSelect = (product: Product) => {
    scrollPositionRef.current = window.scrollY;
    setSelectedProduct(product);
    setReturnToCart(false);
  };

  const handleBackToFooter = () => {
    shouldScrollToFooter.current = true;
    setActiveTab('home');
  };

  const handleFilterChange = (type: 'all' | 'new' | 'sale') => {
    setFilterType(type);
    setActiveCategory('All');
    setActiveTab('home');
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    setFilterType('all');
    setSelectedProduct(null);
  };

  const handleCartProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setReturnToCart(true);
    setIsCartOpen(false);
  };

  const handleBack = () => {
    setSelectedProduct(null);
    if (returnToCart) {
      if (activeTab === 'cart') return;
      setIsCartOpen(true);
      setReturnToCart(false);
    }
  };

  const handleAddToCart = (product: Product, openCart = true) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    if (openCart) {
      setActiveTab('cart');
      setSelectedProduct(null);
    } else {
      setToastMessage(`Added ${product.name} to cart`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      setToastMessage(`Removed ${item.name} from cart`);
      setTimeout(() => setToastMessage(null), 3000);
    }
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOrderSuccess = () => {
    setCartItems([]); // Clear cart
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ─── Checkout overlay ────────────────────────────────────────────────────────
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors pb-8">
        <Checkout
          cartItems={cartItems}
          onBack={() => setShowCheckout(false)}
          onOrderSuccess={() => {
            handleOrderSuccess();
            setShowCheckout(false);
          }}
          onGoToHistory={() => {
            handleOrderSuccess();
            setShowCheckout(false);
            setActiveTab('history');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 pb-20 transition-colors">
      {!selectedProduct ? (
        <>
          <Header
            cartCount={cartCount}
            onCartClick={() => setActiveTab('cart')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onTabChange={setActiveTab}
            onCategoryChange={handleCategoryChange}
            theme={theme}
            onThemeChange={setTheme}
          />

          <main className="pb-24">
            {activeTab === 'home' && (
              <>
                <div className="bg-blue-600 text-white py-2 px-4 text-center text-xs font-medium tracking-wide uppercase">
                  ⚡ Flash Sale: Up to 40% off on all Phone Accessories. Limited time only!
                </div>

                {/* Live data indicator */}
                {isLive && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 py-1.5 px-4 text-center">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      ✓ Showing live products from TooroGadgets store
                    </span>
                  </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center justify-between my-6">
                    <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                      {filterType === 'new' ? 'New Arrivals' : filterType === 'sale' ? 'Special Offers' : activeCategory === 'All' ? 'All Products' : activeCategory}
                    </h2>
                    <div className="flex items-center gap-4">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-desc">Top Rated</option>
                      </select>
                      <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm transition-colors">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                          <LayoutGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                          <List size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'flex flex-col gap-2'}`}>
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onClick={handleProductSelect} viewMode={viewMode} />
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-24">
                      <p className="text-gray-500 text-lg">No products found in this category.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'categories' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeCategory === 'All' ? (
                  <>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categories.filter(c => c !== 'All').map((category) => (
                        <button key={category} onClick={() => handleCategoryChange(category)}
                          className="p-6 rounded-2xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm transition-all flex flex-col items-center justify-center gap-4 text-center">
                          <span className="font-bold">{category}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setActiveCategory('All')} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                      </button>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">{activeCategory}</h2>
                    </div>
                    <div className={`mt-6 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'flex flex-col gap-2'}`}>
                      {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onClick={handleProductSelect} viewMode={viewMode} />
                      ))}
                    </div>
                    {filteredProducts.length === 0 && <div className="text-center py-24"><p className="text-gray-500 text-lg">No products found.</p></div>}
                  </>
                )}
              </div>
            )}

            {activeTab === 'cart' && (
              <div className="pt-6">
                <Cart
                  isOpen={true}
                  items={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onProductClick={handleCartProductSelect}
                  onCheckout={() => setShowCheckout(true)}
                  variant="inline"
                />
              </div>
            )}

            {activeTab === 'chat' && <div className="pt-6"><Chat /></div>}
            {activeTab === 'history' && <div className="pt-6"><OrderHistory /></div>}
            {activeTab === 'privacy' && <div className="pt-6"><PrivacyPolicy onBack={handleBackToFooter} /></div>}
            {activeTab === 'terms' && <div className="pt-6"><TermsOfService onBack={handleBackToFooter} /></div>}
            {activeTab === 'contact' && <div className="pt-6"><ContactUs onBack={handleBackToFooter} /></div>}
            {activeTab === 'shipping' && <div className="pt-6"><ShippingPolicy onBack={handleBackToFooter} /></div>}
            {activeTab === 'returns' && <div className="pt-6"><ReturnsExchanges onBack={handleBackToFooter} /></div>}
          </main>

          {activeTab === 'home' && (
            <footer ref={footerRef} className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-24 pb-20 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">TOOROGADGETS</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                      Your premier destination for genuine electronics in Fort Portal & Western Uganda. Quality guaranteed.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shop</h3>
                    <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                      <li><button onClick={() => handleFilterChange('all')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">All Products</button></li>
                      <li><button onClick={() => handleFilterChange('new')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">New Arrivals</button></li>
                      <li><button onClick={() => handleFilterChange('sale')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Special Offers</button></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
                    <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                      <li><button onClick={() => setActiveTab('contact')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Contact Us</button></li>
                      <li><button onClick={() => setActiveTab('shipping')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Shipping Policy</button></li>
                      <li><button onClick={() => setActiveTab('returns')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Returns & Exchanges</button></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm">
                  <p>&copy; 2026 TOOROGADGETS. All rights reserved.</p>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <button onClick={() => setActiveTab('privacy')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</button>
                    <button onClick={() => setActiveTab('terms')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</button>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </>
      ) : (
        <ProductDetails
          product={selectedProduct}
          onClose={handleBack}
          onAddToCart={handleAddToCart}
          onSelectProduct={handleProductSelect}
          backLabel={returnToCart ? 'Back to Cart' : 'Back to Catalog'}
        />
      )}

      {!selectedProduct && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} cartCount={cartCount} />
      )}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full shadow-lg text-xs font-medium transition-colors">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
