import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductDetails } from '../components/ProductDetails';
import { products as hardcodedProducts } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../data/products';

export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products: liveProducts } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Combine live products with hardcoded fallback
    const allProducts = [...liveProducts, ...hardcodedProducts];
    // Remove duplicates by ID (live products take precedence)
    const uniqueProducts = Array.from(
      new Map(allProducts.map(p => [p.id, p])).values()
    );
    
    const found = uniqueProducts.find(p => p.id === productId);
    
    if (found) {
      setProduct(found);
    } else {
      // Product not found - redirect to home after a delay
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }
    setLoading(false);
  }, [productId, liveProducts, navigate]);

  const handleAddToCart = (product: Product, openCart?: boolean) => {
    // This will be handled by the App component via localStorage/context
    // For now, we'll use a custom event to communicate with App
    const event = new CustomEvent('addToCart', { 
      detail: { product, openCart } 
    });
    window.dispatchEvent(event);
    
    if (openCart) {
      navigate('/#/cart'); // Navigate to cart tab
    }
  };

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <ProductDetails
      product={product}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
      onSelectProduct={handleSelectProduct}
    />
  );
}
