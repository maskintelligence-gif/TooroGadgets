import { Product } from '../data/products';
import { ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product, openCart?: boolean) => void;
  onClick: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, onAddToCart, onClick, viewMode = 'grid' }: ProductCardProps) {
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onClick(product)}
        className="group relative bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
      >
        <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{product.category}</span>
            {product.isNew && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">New</span>}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
            <Star className="fill-current w-3 h-3" />
            <span className="font-medium text-gray-700">{product.rating}</span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex flex-col items-end">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-base font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, false);
            }}
            className="p-2 bg-gray-900 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(product)}
      className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-tight">
            New
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center gap-0.5 text-[10px] text-amber-500">
            <Star className="fill-current w-3 h-3" />
            <span className="font-bold text-gray-700">{product.rating}</span>
          </div>
        </div>
        
        <h2 className="text-xs font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-tight min-h-[2rem]">
          {product.name}
        </h2>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-sm font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, false);
            }}
            className="p-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
