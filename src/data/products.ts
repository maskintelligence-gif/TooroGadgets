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
