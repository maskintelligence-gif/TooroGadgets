import { useState, useMemo, useEffect } from 'react';
import { Product, products } from '../data/products';
import { ProductCard } from './ProductCard';
import { ArrowLeft, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Download, Share2, Maximize2, X, Check } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, openCart?: boolean) => void;
  onSelectProduct: (product: Product) => void;
  backLabel?: string;
}

export function ProductDetails({ product, onClose, onAddToCart, onSelectProduct, backLabel = 'Back to Catalog' }: ProductDetailsProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product.id]);

  const relatedProducts = useMemo(() => {
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  const handleDownload = async () => {
    const fileName = `${product.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    
    try {
      // Try fetching with CORS
      const response = await fetch(product.image, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback 1: Try opening in new tab with download attribute (might work in some browsers)
      const link = document.createElement('a');
      link.href = product.image;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = fileName;
      link.click();
      
      // Fallback 2: Alert the user if it's a known CORS issue
      alert('Due to browser security restrictions, we opened the image in a new tab. Please right-click the image and select "Save Image As..." to download it.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Navigation Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              {backLabel}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors ${
                  isCopied ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Share product"
              >
                {isCopied ? <Check size={20} /> : <Share2 size={20} />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Download image"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative group bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 sm:p-12 flex items-center justify-center aspect-square lg:aspect-auto lg:h-[600px] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal cursor-zoom-in"
                onClick={() => setIsPreviewOpen(true)}
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="absolute bottom-6 right-6 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                {product.category}
              </span>
              {product.isNew && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                  New Arrival
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="fill-current w-6 h-6" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{product.rating}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-700 text-2xl font-light">|</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-lg">{product.reviews} Verified Reviews</span>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">UGX {product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">UGX {product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {product.stock && product.stock < 10 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-bold mt-4">
                  <div className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-500 animate-pulse" />
                  Only {product.stock} left in stock
                </div>
              )}
            </div>

            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.specs && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Technical Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.specs.map((spec, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="font-medium">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Truck className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <ShieldCheck className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase">2yr Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <RotateCcw className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase">30-Day Return</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${
                isAdded 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/20' 
                  : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-blue-600 dark:hover:bg-gray-200 hover:shadow-blue-500/20 dark:hover:shadow-white/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={24} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={24} />
                  Add to Shopping Cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-wider">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={onAddToCart}
                  onClick={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Image Preview */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
            >
              <Download size={20} />
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
