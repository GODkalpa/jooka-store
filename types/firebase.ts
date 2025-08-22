// Firebase types for JOOKA E-commerce Platform
import { Timestamp } from 'firebase/firestore';

// Base types
export type UserRole = 'admin' | 'customer';
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type AddressType = 'shipping' | 'billing';

// Base document interface
export interface BaseDocument {
  id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// User interfaces
export interface User extends BaseDocument {
  email: string;
  role: UserRole;
  email_verified: boolean;
}

export interface UserProfile extends BaseDocument {
  user_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string; // For enhanced registration
  phone?: string;
  avatar_url?: string;
  date_of_birth?: Timestamp;
}

// Product interfaces
export interface Category extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  secure_url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  color?: string;
  is_primary: boolean;
  alt_text?: string;
  order?: number;
}

export interface ProductVariant extends BaseDocument {
  product_id: string;
  color: string;
  size: string;
  sku?: string; // Unique SKU for this variant
  inventory_count: number;
  low_stock_threshold: number;
  price_adjustment?: number; // Optional price difference from base price
  weight_adjustment?: number; // Optional weight difference
  is_active: boolean;
}

export interface Product extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  category_id?: string;
  inventory_count: number; // Total inventory (calculated from variants or manual)
  track_inventory: boolean;
  track_variants: boolean; // Whether to use variant-level inventory tracking
  allow_backorder: boolean;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images: ProductImage[];
  colors: string[];
  sizes: string[];
  tags: string[];
  sku?: string;
  barcode?: string;
  status: ProductStatus;
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  seo_keywords: string[];
}

// Address interface
export interface Address extends BaseDocument {
  user_id: string;
  type: AddressType;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code?: string; // Made optional for some regions
  country: string;
  phone?: string;
  delivery_instructions?: string; // For COD delivery notes
  is_default: boolean;
}

// Order interfaces
export interface Order extends BaseDocument {
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: 'cod'; // Only COD supported
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: Address;
  billing_address?: Address;
  notes?: string;
  tracking_number?: string;
  shipped_at?: Timestamp;
  delivered_at?: Timestamp;
}

export interface OrderItem extends BaseDocument {
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
  selected_color?: string;
  selected_size?: string;
}

// Cart interface
export interface CartItem extends BaseDocument {
  user_id: string;
  product_id: string;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
}

// Notification interface
export interface Notification extends BaseDocument {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
}

// Messaging system interfaces
export type ConversationStatus = 'open' | 'in-progress' | 'closed';
export type ConversationPriority = 'low' | 'medium' | 'high';
export type MessageSenderType = 'customer' | 'admin';

export interface Conversation extends BaseDocument {
  customer_id: string;
  admin_id?: string;
  subject: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  last_message?: string;
  last_message_time?: Timestamp;
  unread_count: {
    customer: number;
    admin: number;
  };
  order_id?: string; // Optional link to specific order
  category: 'general' | 'order' | 'technical' | 'billing';
}

export interface Message extends BaseDocument {
  conversation_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  content: string;
  read: boolean;
  attachments?: string[]; // URLs to uploaded files
  reply_to?: string; // ID of message being replied to
}

// Extended types for UI components
export interface ConversationWithMessages extends Conversation {
  messages?: Message[];
  customer_email?: string;
  admin_email?: string;
  messages_count?: number;
}

export interface MessageWithSender extends Message {
  sender_email?: string;
  sender_name?: string;
}

// Audit log interface
export interface AuditLog extends BaseDocument {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// Joined types for complex queries
export interface ProductWithCategory extends Product {
  category?: Category;
}

export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
  category?: Category;
}

export interface ProductVariantWithStock extends ProductVariant {
  available_stock: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  items_count?: number;
  user_email?: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  error?: string;
}

// Analytics types
export interface SalesAnalytics {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  period_start: Timestamp;
  period_end: Timestamp;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku?: string;
  inventory_count: number;
  threshold: number;
}

// Search and filter types
export interface ProductFilters {
  categoryId?: string;
  status?: ProductStatus;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'created_at' | 'featured';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Timestamp;
  endDate?: Timestamp;
  page?: number;
  limit?: number;
}

// Form types for creating/updating
export interface CreateUserData {
  email: string;
  role?: UserRole;
}

// Enhanced registration data
export interface EnhancedRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

// Registration form data (client-side)
export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  full_name?: string; // For enhanced profile updates
  phone?: string;
  avatar_url?: string;
  date_of_birth?: Timestamp;
}

// Address creation data
export interface CreateAddressData {
  user_id: string;
  type: AddressType;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  phone?: string;
  delivery_instructions?: string;
  is_default: boolean;
}

// Address update data
export interface UpdateAddressData {
  type?: AddressType;
  first_name?: string;
  last_name?: string;
  company?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  delivery_instructions?: string;
  is_default?: boolean;
}

export interface CreateProductData extends Omit<Product, 'id' | 'created_at' | 'updated_at' | 'slug'> {
  slug?: string;
}

export interface CreateProductVariantData extends Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateProductVariantData extends Partial<Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'product_id'>> {}

export interface CreateOrderData extends Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'> {
  items: Omit<OrderItem, 'id' | 'created_at' | 'updated_at' | 'order_id'>[];
}

// Messaging form data types
export interface CreateConversationData {
  subject: string;
  category: 'general' | 'order' | 'technical' | 'billing';
  priority?: ConversationPriority;
  initial_message: string;
  order_id?: string;
}

export interface CreateMessageData {
  conversation_id: string;
  content: string;
  attachments?: string[];
  reply_to?: string;
}

export interface UpdateConversationData {
  status?: ConversationStatus;
  priority?: ConversationPriority;
  admin_id?: string;
}

// Variant inventory management types
export interface VariantInventoryUpdate {
  product_id: string;
  color: string;
  size: string;
  quantity_change: number;
  transaction_type: 'restock' | 'adjustment' | 'return' | 'sale';
  notes?: string;
}

export interface VariantStockCheck {
  product_id: string;
  color: string;
  size: string;
  requested_quantity: number;
}

// Messaging filters and pagination
export interface ConversationFilters {
  status?: ConversationStatus;
  priority?: ConversationPriority;
  category?: string;
  customer_id?: string;
  admin_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'last_message_time' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface MessageFilters {
  conversation_id: string;
  sender_type?: MessageSenderType;
  page?: number;
  limit?: number;
}
