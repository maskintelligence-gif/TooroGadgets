import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductDetails } from '../components/ProductDetails';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../data/products';

export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Wait for Supabase to finish fetching
    if (productsLoading) return;

    // Now we have the real data from Supabase
    const found = products.find(p => p.id === productId);
    
    if (found) {
      setProduct(found);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  }, [productId, products, productsLoading]);

  // Handle redirect separately with cleanup
  useEffect(() => {
    if (notFound) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notFound, navigate]);

  const handleAddToCart = (product: Product, openCart?: boolean) => {
    const event = new CustomEvent('addToCart', { 
      detail: { product, openCart } 
    });
    window.dispatchEvent(event);
    
    if (openCart) {
      navigate('/#/cart');
    }
  };

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleClose = () => {
    navigate('/');
  };

  // Show loading while fetching from Supabase
  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // Show not found only after Supabase confirms it doesn't exist
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Redirecting to home in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  // Should never happen, but just in case
  if (!product) return null;

  return (
    <ProductDetails
      product={product}
      onClose={handleClose}
      onAddToCart={handleAddToCart}
      onSelectProduct={handleSelectProduct}
    />
  );
}
