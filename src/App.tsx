import { useState, useRef, useLayoutEffect } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { ProductDetails } from './components/ProductDetails';
import { BottomNav, Tab } from './components/BottomNav';
import { OrderHistory } from './components/OrderHistory';
import { Chat } from './components/Chat';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ContactUs } from './components/ContactUs';
import { ShippingPolicy } from './components/ShippingPolicy';
import { ReturnsExchanges } from './components/ReturnsExchanges';
import { products, Category, categories } from './data/products';
import { Product } from './data/products';
import { LayoutGrid, List, ArrowLeft } from 'lucide-react';

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
  
  // Store scroll position to restore it when returning from product details
  const scrollPositionRef = useRef(0);
  const footerRef = useRef<HTMLElement>(null);
  const shouldScrollToFooter = useRef(false);

  // Apply theme to document
  useLayoutEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const filteredProducts = products.filter(p => {
    const categoryMatch = activeCategory === 'All' || p.category === activeCategory;
    const filterMatch = 
      filterType === 'all' || 
      (filterType === 'new' && p.isNew) || 
      (filterType === 'sale' && p.originalPrice && p.originalPrice > p.price);
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && filterMatch && searchMatch;
  }).sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'rating-desc') return b.rating - a.rating;
    return 0; // featured
  });

  // Restore scroll position when returning to catalog
  useLayoutEffect(() => {
    if (!selectedProduct && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [selectedProduct]);

  // Scroll to top (or footer) when changing tabs
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
    // If we are on home, we stay on home. If we are on categories, we stay on categories.
    // The previous forced setActiveTab('home') was causing the issue.
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
      // If we were in the cart tab, we just go back to the cart view
      if (activeTab === 'cart') {
        return;
      }
      setIsCartOpen(true);
      setReturnToCart(false);
    }
  };

  const handleAddToCart = (product: Product, openCart = true) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // If we are in 'home' tab and openCart is true, we can either switch to cart tab or open modal
    // Let's switch to cart tab if openCart is true
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
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      setToastMessage(`Removed ${item.name} from cart`);
      setTimeout(() => setToastMessage(null), 3000);
    }
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 pb-20 transition-colors">
      {/* Show main content only if no product is selected */}
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
                {/* Compact Promo Banner */}
                <div className="bg-blue-600 text-white py-2 px-4 text-center text-xs font-medium tracking-wide uppercase">
                  ⚡ Flash Sale: Up to 40% off on all Phone Accessories. Limited time only!
                </div>
                
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
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                          <LayoutGrid size={18} />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                          <List size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 ${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' 
                      : 'flex flex-col gap-2'
                  }`}>
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onClick={handleProductSelect}
                        viewMode={viewMode}
                      />
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
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`p-6 rounded-2xl border transition-all flex flex-col items-center justify-center gap-4 text-center ${
                            activeCategory === category
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm'
                          }`}
                        >
                          <span className="font-bold">{category}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <button 
                        onClick={() => setActiveCategory('All')}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">{activeCategory}</h2>
                    </div>

                    <div className={`mt-6 ${
                      viewMode === 'grid' 
                        ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' 
                        : 'flex flex-col gap-2'
                    }`}>
                      {filteredProducts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onClick={handleProductSelect}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                    
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-24">
                        <p className="text-gray-500 text-lg">No products found in this category.</p>
                      </div>
                    )}
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
                  variant="inline"
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="pt-6">
                <Chat />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="pt-6">
                <OrderHistory />
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="pt-6">
                <PrivacyPolicy onBack={handleBackToFooter} />
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="pt-6">
                <TermsOfService onBack={handleBackToFooter} />
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="pt-6">
                <ContactUs onBack={handleBackToFooter} />
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="pt-6">
                <ShippingPolicy onBack={handleBackToFooter} />
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="pt-6">
                <ReturnsExchanges onBack={handleBackToFooter} />
              </div>
            )}
          </main>

          {/* Footer - Only show on Home tab */}
          {activeTab === 'home' && (
            <footer ref={footerRef} className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-24 pb-20 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                        TOOROGADGETS
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                      Your premier destination for the latest electronic appliances and premium phone accessories. Quality guaranteed.
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

      {/* Bottom Navigation */}
      {!selectedProduct && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          cartCount={cartCount}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full shadow-lg text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-300 transition-colors">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
