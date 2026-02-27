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
    id: 'p1',
    name: 'iPhone 15 Pro Max Case - MagSafe',
    description: 'Ultra-thin, clear protective case with built-in MagSafe magnets for seamless charging.',
    price: 150000,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    specs: ['MagSafe Compatible', 'Military Grade Protection', 'Anti-Yellowing Technology', 'Raised Bezels'],
    stock: 45,
  },
  {
    id: 'p2',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life.',
    price: 1300000,
    originalPrice: 1500000,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews: 842,
    isFeatured: true,
    specs: ['30-hour Battery Life', 'Quick Charging (3 min for 3 hours)', 'Speak-to-Chat Technology', 'Multipoint Connection'],
    stock: 12,
  },
  {
    id: 'p3',
    name: 'MacBook Pro 14" M3 Pro',
    description: 'Apple M3 Pro chip with 11‑core CPU, 14‑core GPU, 18GB Unified Memory, 512GB SSD Storage.',
    price: 7500000,
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews: 315,
    specs: ['Liquid Retina XDR Display', 'Up to 18 hours battery life', '1080p FaceTime HD camera', 'Six-speaker sound system'],
    stock: 8,
  },
  {
    id: 'p4',
    name: 'Dyson V15 Detect Absolute',
    description: 'The most powerful, intelligent cordless vacuum. Reveals invisible dust.',
    price: 2600000,
    originalPrice: 2800000,
    category: 'Home Appliances',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviews: 512,
    specs: ['Laser Slim Fluffy cleaner head', 'Digital Motorbar cleaner head', 'Hair screw tool', 'Up to 60 minutes run time'],
    stock: 15,
  },
  {
    id: 'p5',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Titanium exterior, 200MP camera, and Galaxy AI features built-in.',
    price: 4800000,
    category: 'Phones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews: 210,
    isNew: true,
    isFeatured: true,
    specs: ['6.8" QHD+ Dynamic AMOLED 2X', 'Snapdragon 8 Gen 3', 'Built-in S Pen', '5000mAh Battery'],
    stock: 22,
  },
  {
    id: 'p6',
    name: 'Anker 737 Power Bank',
    description: '24,000mAh 3-Port Portable Charger with 140W Output, Smart Digital Display.',
    price: 550000,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviews: 89,
    specs: ['140W Two-Way Fast Charging', 'Smart Digital Display', 'GaNPrime Technology', 'ActiveShield 2.0'],
    stock: 56,
  },
  {
    id: 'p7',
    name: 'AirPods Pro (2nd generation)',
    description: 'Rich audio quality, up to 2x more Active Noise Cancellation, Adaptive Transparency.',
    price: 950000,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews: 1543,
    specs: ['H2 Apple Silicon', 'Personalized Spatial Audio', 'MagSafe Charging Case (USB-C)', 'IP54 Dust, Sweat, and Water Resistant'],
    stock: 34,
  },
  {
    id: 'p8',
    name: 'Breville Barista Express',
    description: 'Create third wave specialty coffee at home from bean to espresso in less than a minute.',
    price: 2600000,
    category: 'Home Appliances',
    image: 'https://images.unsplash.com/photo-1517246281011-843a013e54f1?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviews: 632,
    isFeatured: true,
    specs: ['Integrated Conical Burr Grinder', 'Digital Temperature Control (PID)', 'Manual Microfoam Milk Texturing', 'Grind Size Dial'],
    stock: 5,
  },
];
