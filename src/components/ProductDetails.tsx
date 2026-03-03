import { useState, useMemo, useEffect } from 'react';
import { Product, products } from '../data/products';
import { ProductCard } from './ProductCard';
import { ArrowLeft, Star, ShoppingCart, Download, Share2, Maximize2, X, Check, BadgeCheck, Bike, Banknote, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Use product.images if available, otherwise fallback to single image array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  useEffect(() => { window.scrollTo(0, 0); }, [product.id]);

  const relatedProducts = useMemo(() => products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4), [product]);

  const handleDownload = async () => {
    const fileName = `${product.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    const currentImage = productImages[selectedImageIndex];
    try {
      const response = await fetch(currentImage, { method: 'GET', mode: 'cors', headers: { 'Content-Type': 'image/jpeg' } });
      if (!response.ok) throw new Error('failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileName;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); window.URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement('a');
      link.href = currentImage; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.download = fileName; link.click();
      alert('Due to browser security restrictions, we opened the image in a new tab. Right-click and "Save Image As..." to download.');
    }
  };

  export function ProductDetails({ product, onClose, onAddToCart, onSelectProduct, backLabel = 'Back to Catalog' }: ProductDetailsProps) {
  console.log('Product received in ProductDetails:', product);
  console.log('Product images array:', product.images);
  
  // Use product.images if available, otherwise fallback to single image array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];
  
  console.log('Final productImages used:', productImages);
  
}

  const handleShare = async () => {
    const productUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/product/${product.id}`;
    
    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: product.name, 
          text: product.description, 
          url: productUrl
        }); 
      } catch {}
    } else {
      try { 
        await navigator.clipboard.writeText(productUrl); 
        setIsCopied(true); 
        setTimeout(() => setIsCopied(false), 2000); 
      } catch {}
    }
  };

  const handleAddToCart = () => { onAddToCart(product, false); setIsAdded(true); setTimeout(() => setIsAdded(false), 2000); };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-medium">
              <ArrowLeft size={20} />{backLabel}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className={`p-2 rounded-full transition-colors ${isCopied ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {isCopied ? <Check size={20} /> : <Share2 size={20} />}
              </button>
              <button onClick={handleDownload} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Gallery Section */}
          <div className="w-full lg:w-1/2">
            {/* Main Image Container */}
            <div className="relative group bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden h-[500px] mb-4">
              <img 
                src={productImages[selectedImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover cursor-zoom-in" 
                onClick={() => setIsPreviewOpen(true)} 
                referrerPolicy="no-referrer" 
              />
              
              {/* Navigation Arrows (only show if multiple images) */}
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image Counter (only show if multiple images) */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              )}

              {/* Zoom Button */}
              <button 
                onClick={() => setIsPreviewOpen(true)} 
                className="absolute bottom-4 right-4 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 size={20} />
              </button>
            </div>

            {/* Thumbnail Strip (only show if multiple images) */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-600 opacity-100' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - view ${index + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section (unchanged) */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">{product.category}</span>
              {product.isNew && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">New Arrival</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h1>

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
                {product.originalPrice && <span className="text-2xl text-gray-400 line-through">UGX {product.originalPrice.toLocaleString()}</span>}
              </div>

              {product.stock && product.stock < 10 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-bold mt-4">
                  <div className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-500 animate-pulse" />
                  Only {product.stock} left in stock
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-900 dark:text-white">Fort Portal CBD</span> — Same day delivery</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-900 dark:text-white">Outside town</span> — Our team will call to arrange delivery</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-900 dark:text-white">Pick up in-store</span> — Ready within the hour</span>
                </div>
              </div>
            </div>

            <div className="space-y-8 mb-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{product.description}</p>
              </div>
              {product.specs && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Specifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.specs.map((spec, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">{spec}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <BadgeCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">100% Genuine</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Bike className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Boda Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Banknote className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Headphones className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Customer Support</span>
              </div>
            </div>

            <button onClick={handleAddToCart} className={`w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${isAdded ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-blue-600 dark:hover:bg-gray-200'}`}>
              {isAdded ? <><Check size={24} />Added to Cart!</> : <><ShoppingCart size={24} />Add to Shopping Cart</>}
            </button>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-wider">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onClick={onSelectProduct} />)}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal - Updated to show current selected image */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
            <X size={24} />
          </button>
          
          <img 
            src={productImages[selectedImageIndex]} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain" 
            referrerPolicy="no-referrer" 
          />
          
          {/* Preview Modal Navigation */}
          {productImages.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronRight size={32} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white text-sm rounded-full">
                {selectedImageIndex + 1} / {productImages.length}
              </div>
            </>
          )}
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <button onClick={handleDownload} className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
              <Download size={20} />Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
