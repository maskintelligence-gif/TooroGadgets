import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { products as hardcodedProducts, Product, Category } from '../data/products';

function isNewProduct(createdAt: string): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(createdAt) > thirtyDaysAgo;
}

function specsToArray(specs: unknown): string[] {
  if (!specs) return [];
  if (Array.isArray(specs)) return specs.map(String);
  if (typeof specs === 'object') {
    return Object.entries(specs as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${v}`
    );
  }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbProduct(p: any): Product {
  const images: { image_url: string; display_order: number }[] =
    p.product_images || [];
  const sortedImages = [...images].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const image =
    p.primary_image_url ||
    sortedImages[0]?.image_url ||
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800';

  return {
    id: p.product_id,
    name: p.product_name,
    description: p.description || '',
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    category: (p.category as Category) || 'Accessories',
    image,
    rating: Number(p.rating) || 4.5,
    reviews: p.review_count || 0,
    isNew: p.created_at ? isNewProduct(p.created_at) : false,
    isFeatured: p.featured || false,
    specs: specsToArray(p.specs),
    stock: p.stock_quantity ?? 0,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(hardcodedProducts);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(
            `*, product_images(image_url, thumbnail_url, display_order, alt_text)`
          )
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setProducts(data.map(mapDbProduct));
          setIsLive(true);
        }
        // If DB empty, keep hardcoded products as fallback
      } catch (err) {
        console.warn('Using hardcoded products:', (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, isLive };
}
