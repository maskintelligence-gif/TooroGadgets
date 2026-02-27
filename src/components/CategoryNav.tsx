import { Category, categories } from '../data/products';

interface CategoryNavProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
}

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-20 bg-gray-50/95 backdrop-blur-sm py-2 -mx-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200/50 mb-6">
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeCategory === category
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
            }`}
          >
            <span className="relative z-10">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
