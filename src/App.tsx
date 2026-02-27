import { useState, useRef, useLayoutEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
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
import { products, Category } from './data/products';
import { Product } from './data/products';
import { LayoutGrid, List } from 'lucide-react';

interface CartItem extends Product {
  quantity: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [returnToCart, setReturnToCart] = useState(false);
  
  // Store scroll position to restore it when returning from product details
  const scrollPositionRef = useRef(0);
  const footerRef = useRef<HTMLElement>(null);
  const shouldScrollToFooter = useRef(false);

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

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
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Show main content only if no product is selected */}
      {!selectedProduct ? (
        <>
          <Header cartCount={cartCount} onCartClick={() => setActiveTab('cart')} />
          
          <main className="pb-24">
            {activeTab === 'home' && (
              <>
                {/* Compact Promo Banner */}
                <div className="bg-blue-600 text-white py-2 px-4 text-center text-xs font-medium tracking-wide uppercase">
                  ⚡ Flash Sale: Up to 40% off on all Phone Accessories. Limited time only!
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <CategoryNav
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                  />

                  <div className="flex items-center justify-between my-6">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">
                      {activeCategory} <span className="text-gray-400 font-normal ml-2">({filteredProducts.length} items)</span>
                    </h2>
                    
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <List size={18} />
                      </button>
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
                <PrivacyPolicy />
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="pt-6">
                <TermsOfService />
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
            <footer ref={footerRef} className="bg-white border-t border-gray-100 mt-24 pb-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="font-bold text-xl tracking-tight text-gray-900">
                        TOOROGADGETS
                      </span>
                    </div>
                    <p className="text-gray-500 max-w-sm leading-relaxed">
                      Your premier destination for the latest electronic appliances and premium phone accessories. Quality guaranteed.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
                    <ul className="space-y-3 text-gray-500">
                      <li><button onClick={() => setActiveTab('home')} className="hover:text-blue-600 transition-colors text-left">All Products</button></li>
                      <li><button onClick={() => setActiveTab('home')} className="hover:text-blue-600 transition-colors text-left">New Arrivals</button></li>
                      <li><button onClick={() => setActiveTab('home')} className="hover:text-blue-600 transition-colors text-left">Special Offers</button></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                    <ul className="space-y-3 text-gray-500">
                      <li><button onClick={() => setActiveTab('contact')} className="hover:text-blue-600 transition-colors text-left">Contact Us</button></li>
                      <li><button onClick={() => setActiveTab('shipping')} className="hover:text-blue-600 transition-colors text-left">Shipping Policy</button></li>
                      <li><button onClick={() => setActiveTab('returns')} className="hover:text-blue-600 transition-colors text-left">Returns & Exchanges</button></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm">
                  <p>&copy; 2026 TOOROGADGETS. All rights reserved.</p>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <button onClick={() => setActiveTab('privacy')} className="hover:text-gray-900 transition-colors">Privacy Policy</button>
                    <button onClick={() => setActiveTab('terms')} className="hover:text-gray-900 transition-colors">Terms of Service</button>
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
    </div>
  );
}
