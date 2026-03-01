export type Category = 'All' | 'Phones' | 'Laptops' | 'Audio' | 'Accessories' | 'Home Appliances';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
  specs?: string[];
  stock?: number;
}

export const categories: Category[] = [
  'All',
  'Phones',
  'Laptops',
  'Audio',
  'Accessories',
  'Home Appliances',
];

export const products: Product[] = [
  {
    id: 'p2',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with Auto NC Optimizer, 6-hour battery life.',
    price: 49000,
    originalPrice: 54000,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews: 842,
    isFeatured: true,
    specs: ['6-hour Battery Life', 'Quick Charging (3 min for 3 hours)', 'Speak-to-Chat Technology', 'Multipoint Connection'],
    stock: 12,
  },
];
