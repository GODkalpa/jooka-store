// Database types for JOOKA E-commerce Platform
// Generated from Supabase schema

export type UserRole = 'admin' | 'customer';
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type AddressType = 'shipping' | 'billing';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: UserRole;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          price: number;
          compare_price: number | null;
          cost_price: number | null;
          category_id: string | null;
          inventory_count: number;
          track_inventory: boolean;
          allow_backorder: boolean;
          weight: number | null;
          dimensions: any | null; // JSONB
          images: any; // JSONB array
          colors: string[] | null;
          sizes: string[] | null;
          tags: string[] | null;
          meta_title: string | null;
          meta_description: string | null;
          status: ProductStatus;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          price: number;
          compare_price?: number | null;
          cost_price?: number | null;
          category_id?: string | null;
          inventory_count?: number;
          track_inventory?: boolean;
          allow_backorder?: boolean;
          weight?: number | null;
          dimensions?: any | null;
          images?: any;
          colors?: string[] | null;
          sizes?: string[] | null;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          status?: ProductStatus;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          price?: number;
          compare_price?: number | null;
          cost_price?: number | null;
          category_id?: string | null;
          inventory_count?: number;
          track_inventory?: boolean;
          allow_backorder?: boolean;
          weight?: number | null;
          dimensions?: any | null;
          images?: any;
          colors?: string[] | null;
          sizes?: string[] | null;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          status?: ProductStatus;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          type: AddressType;
          first_name: string;
          last_name: string;
          company: string | null;
          street_address_1: string;
          street_address_2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: AddressType;
          first_name: string;
          last_name: string;
          company?: string | null;
          street_address_1: string;
          street_address_2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: AddressType;
          first_name?: string;
          last_name?: string;
          company?: string | null;
          street_address_1?: string;
          street_address_2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          provider: string | null;
          provider_payment_method_id: string | null;
          last_four: string | null;
          brand: string | null;
          exp_month: number | null;
          exp_year: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          provider?: string | null;
          provider_payment_method_id?: string | null;
          last_four?: string | null;
          brand?: string | null;
          exp_month?: number | null;
          exp_year?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          provider?: string | null;
          provider_payment_method_id?: string | null;
          last_four?: string | null;
          brand?: string | null;
          exp_month?: number | null;
          exp_year?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          email: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          discount_amount: number;
          total_amount: number;
          currency: string;
          shipping_address: any; // JSONB
          billing_address: any; // JSONB
          payment_method: any | null; // JSONB
          payment_intent_id: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          notes: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          email: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal: number;
          tax_amount?: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount: number;
          currency?: string;
          shipping_address: any;
          billing_address: any;
          payment_method?: any | null;
          payment_intent_id?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          email?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal?: number;
          tax_amount?: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          currency?: string;
          shipping_address?: any;
          billing_address?: any;
          payment_method?: any | null;
          payment_intent_id?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_slug: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          product_snapshot: any | null; // JSONB
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_slug?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          product_snapshot?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          product_slug?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          product_snapshot?: any | null;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          product_id: string;
          type: string;
          quantity_change: number;
          quantity_after: number;
          reference_id: string | null;
          reference_type: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          type: string;
          quantity_change: number;
          quantity_after: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: string;
          quantity_change?: number;
          quantity_after?: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: any | null; // JSONB
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: any | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: any | null;
          read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_values: any | null; // JSONB
          new_values: any | null; // JSONB
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: string;
          old_values?: any | null;
          new_values?: any | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_values?: any | null;
          new_values?: any | null;
          user_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      update_product_inventory: {
        Args: {
          product_uuid: string;
          quantity_change: number;
          transaction_type: string;
          reference_uuid?: string;
          reference_type?: string;
          notes?: string;
          user_uuid?: string;
        };
        Returns: boolean;
      };
      calculate_order_totals: {
        Args: {
          order_uuid: string;
        };
        Returns: any; // JSONB
      };
      create_order_with_items: {
        Args: {
          user_uuid: string;
          user_email: string;
          shipping_address: any; // JSONB
          billing_address: any; // JSONB
          payment_method: any; // JSONB
          cart_items: any; // JSONB array
        };
        Returns: string;
      };
      update_order_status: {
        Args: {
          order_uuid: string;
          new_status: OrderStatus;
          admin_notes?: string;
          tracking_number?: string;
          tracking_url?: string;
        };
        Returns: boolean;
      };
      get_low_stock_products: {
        Args: {
          threshold?: number;
        };
        Returns: {
          id: string;
          name: string;
          inventory_count: number;
          category_name: string;
        }[];
      };
      get_sales_analytics: {
        Args: {
          start_date?: string;
          end_date?: string;
        };
        Returns: any; // JSONB
      };
    };
    Enums: {
      user_role: UserRole;
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      address_type: AddressType;
    };
  };
}

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type User = Tables<'users'>;
export type UserProfile = Tables<'profiles'>;
export type Category = Tables<'categories'>;
export type Product = Tables<'products'>;
export type Address = Tables<'addresses'>;
export type PaymentMethod = Tables<'payment_methods'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type CartItem = Tables<'cart_items'>;
export type InventoryTransaction = Tables<'inventory_transactions'>;
export type Notification = Tables<'notifications'>;
export type AuditLog = Tables<'audit_logs'>;

// Insert types
export type UserInsert = TablesInsert<'users'>;
export type UserProfileInsert = TablesInsert<'profiles'>;
export type CategoryInsert = TablesInsert<'categories'>;
export type ProductInsert = TablesInsert<'products'>;
export type AddressInsert = TablesInsert<'addresses'>;
export type PaymentMethodInsert = TablesInsert<'payment_methods'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderItemInsert = TablesInsert<'order_items'>;
export type CartItemInsert = TablesInsert<'cart_items'>;
export type NotificationInsert = TablesInsert<'notifications'>;

// Update types
export type UserUpdate = TablesUpdate<'users'>;
export type UserProfileUpdate = TablesUpdate<'profiles'>;
export type CategoryUpdate = TablesUpdate<'categories'>;
export type ProductUpdate = TablesUpdate<'products'>;
export type AddressUpdate = TablesUpdate<'addresses'>;
export type PaymentMethodUpdate = TablesUpdate<'payment_methods'>;
export type OrderUpdate = TablesUpdate<'orders'>;
export type OrderItemUpdate = TablesUpdate<'order_items'>;
export type CartItemUpdate = TablesUpdate<'cart_items'>;
export type NotificationUpdate = TablesUpdate<'notifications'>;

// Extended types with relations
export interface ProductWithCategory extends Product {
  category?: Category;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  user?: User;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Analytics types
export interface SalesAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
  };
  top_products: {
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }[];
  daily_sales: {
    date: string;
    orders: number;
    revenue: number;
  }[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  inventory_count: number;
  category_name: string;
}