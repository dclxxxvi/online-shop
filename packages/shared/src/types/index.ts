// Block types
export type BlockType =
  | 'header'
  | 'footer'
  | 'hero'
  | 'product-card'
  | 'product-grid'
  | 'product-carousel'
  | 'cart'
  | 'checkout'
  | 'text'
  | 'image'
  | 'gallery'
  | 'categories'
  | 'search'
  | 'contacts'
  | 'map'
  | 'social-links'
  | 'reviews'
  | 'faq';

export interface BlockStyles {
  desktop: React.CSSProperties;
  tablet?: React.CSSProperties;
  mobile?: React.CSSProperties;
}

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  styles: BlockStyles;
  children?: Block[];
  order: number;
}

// Page types
export interface Page {
  id: string;
  storeId: string;
  slug: string;
  title: string;
  blocks: Block[];
  isHome: boolean;
  createdAt: string;
  updatedAt: string;
}

// Store types
export interface StoreSettings {
  currency: string;
  language: string;
  timezone: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: number;
}

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  userId: string;
  pages: Page[];
  settings: StoreSettings;
  theme: StoreTheme;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  storeId: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  inventory: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  products?: Product[];
}

// Order types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderCustomer {
  email: string;
  phone?: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  storeId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  customer: OrderCustomer;
  createdAt: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  pages: Omit<Page, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>[];
  theme: StoreTheme;
  category: string;
  isPremium: boolean;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  stores: Store[];
  createdAt: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
