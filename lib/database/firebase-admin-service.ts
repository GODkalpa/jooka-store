// Firebase Admin Database service for server-side operations
import { getAdminDb } from '@/lib/firebase/admin';
import { convertObjectDates } from '@/lib/utils/date';
import { FieldValue } from 'firebase-admin/firestore';
import type {
  User,
  UserProfile,
  Product,
  Category,
  Order,
  OrderItem,
  ProductWithCategory,
  OrderWithItems,
  UserWithProfile,
  CreateProductData,
  CreateOrderData,
  ApiResponse,
  PaginatedResponse
} from '@/types/firebase';

export class FirebaseAdminDatabaseService {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    this.db = getAdminDb();
  }

  /**
   * Convert Firebase Admin SDK timestamp to ISO string
   * @param timestamp - Firestore timestamp from Admin SDK
   * @returns ISO string or original value if not a timestamp
   */
  private convertTimestamp(timestamp: any): string | null {
    if (!timestamp) return null;
    
    try {
      // Handle Firestore Admin SDK timestamp
      if (timestamp._seconds !== undefined) {
        const date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
        return date.toISOString();
      }
      
      if (timestamp.seconds !== undefined) {
        const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
        return date.toISOString();
      }
      
      // If it has a toDate method (client SDK)
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
      }
      
      // If it's already a Date
      if (timestamp instanceof Date) {
        return timestamp.toISOString();
      }
      
      // If it's a string
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
      
      console.warn('Unknown timestamp format:', timestamp);
      return null;
    } catch (error) {
      console.error('Error converting timestamp:', error, timestamp);
      return null;
    }
  }

  // Analytics and reporting methods for admin dashboard
  async getSalesAnalytics(): Promise<ApiResponse<{
    summary: {
      total_orders: number;
      total_revenue: number;
      avg_order_value: number;
    };
    daily_sales: any[];
    top_products: any[];
  }>> {
    try {
      console.log('Getting sales analytics with Admin SDK...');
      
      // Get all orders for analytics
      const ordersSnapshot = await this.db.collection('orders').get();
      const orders = ordersSnapshot.docs.map(doc => 
        convertObjectDates({ id: doc.id, ...doc.data() })
      ) as Order[];

      // Calculate summary statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      console.log(`Analytics calculated: ${totalOrders} orders, $${totalRevenue} revenue`);

      const analytics = {
        summary: {
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          avg_order_value: avgOrderValue
        },
        daily_sales: [], // Placeholder for daily sales data
        top_products: [] // Placeholder for top products data
      };

      return { data: analytics, success: true };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      return { error: (error as Error).message, success: false };
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<ApiResponse<ProductWithCategory[]>> {
    try {
      console.log('Getting low stock products with Admin SDK...');
      
      // Get all products
      const productsSnapshot = await this.db.collection('products').get();
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

      // Filter products with low stock - need to handle variant-based products differently
      const lowStockProducts: Product[] = [];

      for (const product of products) {
        if (product.track_variants) {
          // For variant-based products, check if any variants are low stock
          try {
            const variantsSnapshot = await this.db
              .collection('product_variants')
              .where('product_id', '==', product.id)
              .get();

            const variants = variantsSnapshot.docs.map(doc => doc.data());
            
            // Check if any variants are low stock (but not completely out of stock)
            const hasLowStockVariants = variants.some(variant => {
              const stock = variant.inventory_count || 0;
              const variantThreshold = variant.low_stock_threshold || threshold;
              return stock <= variantThreshold && stock > 0;
            });

            if (hasLowStockVariants) {
              lowStockProducts.push(product);
            }
          } catch (error) {
            console.warn(`Failed to check variants for product ${product.id}:`, error);
            // Fallback to product inventory if variant check fails
            if ((product.inventory_count || 0) <= threshold && (product.inventory_count || 0) > 0) {
              lowStockProducts.push(product);
            }
          }
        } else {
          // For non-variant products, use the product's inventory_count
          if ((product.inventory_count || 0) <= threshold && (product.inventory_count || 0) > 0) {
            lowStockProducts.push(product);
          }
        }
      }

      // Get categories for products
      const productsWithCategories: ProductWithCategory[] = await Promise.all(
        lowStockProducts.map(async (product) => {
          let category = undefined;
          if (product.category_id) {
            try {
              const categoryDoc = await this.db.collection('categories').doc(product.category_id).get();
              if (categoryDoc.exists) {
                category = { id: categoryDoc.id, ...categoryDoc.data() } as Category;
              }
            } catch (error) {
              console.warn(`Failed to get category ${product.category_id}:`, error);
            }
          }
          return {
            ...product,
            category
          };
        })
      );

      console.log(`Found ${productsWithCategories.length} low stock products`);
      return { data: productsWithCategories, success: true };
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return { error: (error as Error).message, success: false };
    }
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      console.log('Getting orders with Admin SDK...', params);

      const limit = params?.limit || 20;
      const status = params?.status;

      // Get orders with limit and optional status filter
      let query = this.db.collection('orders').orderBy('created_at', 'desc');

      if (status && status !== 'all') {
        query = query.where('status', '==', status) as any;
      }

      if (limit) {
        query = query.limit(limit) as any;
      }

      const ordersSnapshot = await query.get();
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Explicitly handle timestamps from Firebase Admin SDK
        const processedData = {
          id: doc.id,
          ...data,
          // Convert timestamps explicitly
          created_at: data.created_at ? this.convertTimestamp(data.created_at) : null,
          updated_at: data.updated_at ? this.convertTimestamp(data.updated_at) : null,
          shipped_at: data.shipped_at ? this.convertTimestamp(data.shipped_at) : null,
          delivered_at: data.delivered_at ? this.convertTimestamp(data.delivered_at) : null,
        };
        
        return processedData;
      }) as any[];

      // Get order items and user email for each order
      const ordersWithItems: OrderWithItems[] = await Promise.all(
        orders.map(async (order) => {
          try {
            // Get order items
            const orderItemsSnapshot = await this.db.collection('order_items')
              .where('order_id', '==', order.id)
              .get();

            const orderItems = orderItemsSnapshot.docs.map((doc: any) => 
              convertObjectDates({ id: doc.id, ...doc.data() })
            ) as OrderItem[];

            // Get user email and profile information
            let userEmail = 'Unknown';
            let userProfile: any = null;
            let customerName = 'Unknown Customer';
            let customerPhone = '';

            try {
              const userDoc = await this.db.collection('users').doc(order.user_id).get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                userEmail = userData?.email || 'Unknown';

                // Get user profile for name and phone
                try {
                  const profileSnapshot = await this.db.collection('profiles')
                    .where('user_id', '==', order.user_id)
                    .limit(1)
                    .get();

                  if (!profileSnapshot.empty) {
                    userProfile = profileSnapshot.docs[0].data();
                    const firstName = userProfile?.first_name || '';
                    const lastName = userProfile?.last_name || '';
                    customerName = firstName && lastName ? `${firstName} ${lastName}` :
                                  userProfile?.full_name || firstName || lastName || 'Unknown Customer';
                    customerPhone = userProfile?.phone || '';
                  }
                } catch (profileError) {
                  console.warn(`Failed to get user profile for order ${order.id}:`, profileError);
                }
              }
            } catch (userError) {
              console.warn(`Failed to get user data for order ${order.id}:`, userError);
            }

            return {
              ...order,
              items: orderItems,
              items_count: orderItems.length,
              user_email: userEmail,
              customer_name: customerName,
              customer_phone: customerPhone,
              customer_profile: userProfile
            };
          } catch (error) {
            console.warn(`Failed to get items for order ${order.id}:`, error);
            return {
              ...order,
              items: [],
              items_count: 0,
              user_email: 'Unknown'
            };
          }
        })
      );

      console.log(`Retrieved ${ordersWithItems.length} orders`);

      return {
        data: ordersWithItems,
        total: ordersWithItems.length,
        page: params?.page || 1,
        limit,
        hasMore: ordersWithItems.length === limit
      };
    } catch (error) {
      console.error('Error getting orders:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
        error: (error as Error).message
      };
    }
  }

  async getUsers(params?: { limit?: number }): Promise<PaginatedResponse<UserWithProfile>> {
    try {
      console.log('Getting users with Admin SDK...');
      
      const limit = params?.limit || 100;
      
      // Get users with limit
      let query = this.db.collection('users').orderBy('created_at', 'desc');
      if (limit) {
        query = query.limit(limit) as any;
      }
      
      const usersSnapshot = await query.get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];

      // Get profiles for all users
      const usersWithProfiles: UserWithProfile[] = await Promise.all(
        users.map(async (user) => {
          try {
            const profilesSnapshot = await this.db.collection('profiles')
              .where('user_id', '==', user.id)
              .get();
            
            const profiles = profilesSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            })) as UserProfile[];
            
            return {
              ...user,
              profile: profiles[0] || undefined
            };
          } catch (error) {
            console.warn(`Failed to get profile for user ${user.id}:`, error);
            return {
              ...user,
              profile: undefined
            };
          }
        })
      );

      console.log(`Retrieved ${usersWithProfiles.length} users`);

      return {
        data: usersWithProfiles,
        total: usersWithProfiles.length,
        page: 1,
        limit,
        hasMore: usersWithProfiles.length === limit
      };
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        hasMore: false,
        error: (error as Error).message
      };
    }
  }

  // User operations
  async updateUserRole(userId: string, role: 'admin' | 'customer'): Promise<ApiResponse<void>> {
    try {
      console.log(`Updating user ${userId} role to ${role} with Admin SDK...`);
      
      // Update user role in Firestore
      await this.db.collection('users').doc(userId).update({
        role: role,
        updated_at: new Date()
      });

      console.log(`User ${userId} role updated to ${role} successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Error updating user ${userId} role:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      console.log(`Deleting user ${userId} with Admin SDK...`);
      
      // Import Firebase Admin Auth
      const { getAdminAuth } = await import('@/lib/firebase/admin');
      const auth = getAdminAuth();
      
      // Delete user from Firebase Authentication
      try {
        await auth.deleteUser(userId);
        console.log(`User ${userId} deleted from Firebase Auth`);
      } catch (authError: any) {
        // If user doesn't exist in Auth, that's okay - continue with Firestore cleanup
        if (authError.code !== 'auth/user-not-found') {
          console.warn(`Failed to delete user from Auth: ${authError.message}`);
        }
      }

      // Delete user data from Firestore using batch operations
      const batch = this.db.batch();

      // Delete user document
      const userRef = this.db.collection('users').doc(userId);
      batch.delete(userRef);

      // Delete user profile
      const profilesSnapshot = await this.db.collection('profiles')
        .where('user_id', '==', userId)
        .get();
      
      profilesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete user addresses
      const addressesSnapshot = await this.db.collection('addresses')
        .where('user_id', '==', userId)
        .get();
      
      addressesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete user cart items
      const cartItemsSnapshot = await this.db.collection('cart_items')
        .where('user_id', '==', userId)
        .get();
      
      cartItemsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Note: We don't delete orders as they are important for business records
      // Instead, we could anonymize them or mark them as deleted
      
      // Execute batch delete
      await batch.commit();

      console.log(`User ${userId} and related data deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  async getUser(userId: string): Promise<ApiResponse<UserWithProfile>> {
    try {
      console.log('Getting user with Admin SDK:', userId);
      
      const userDoc = await this.db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return { error: 'User not found', success: false };
      }

      const user = { id: userDoc.id, ...userDoc.data() } as User;
      
      // Get user profile
      const profilesSnapshot = await this.db.collection('profiles')
        .where('user_id', '==', userId)
        .limit(1)
        .get();

      const profile = profilesSnapshot.docs.length > 0 
        ? { id: profilesSnapshot.docs[0].id, ...profilesSnapshot.docs[0].data() } as UserProfile
        : undefined;

      const userWithProfile: UserWithProfile = {
        ...user,
        profile
      };

      return { data: userWithProfile, success: true };
    } catch (error) {
      console.error('Error getting user:', error);
      return { error: (error as Error).message, success: false };
    }
  }

  // Product CRUD operations
  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    try {
      console.log(`Getting product ${productId} with Admin SDK...`);
      
      const productDoc = await this.db.collection('products').doc(productId).get();
      
      if (!productDoc.exists) {
        return { error: 'Product not found', success: false };
      }

      const product = { id: productDoc.id, ...productDoc.data() } as Product;
      console.log(`Product retrieved successfully: ${product.name}`);

      return { data: product, success: true };
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    try {
      console.log('Creating product with Admin SDK...');
      
      // Generate slug if not provided
      if (!productData.slug) {
        productData.slug = productData.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Filter out undefined values to avoid Firestore errors
      const cleanProductData = Object.fromEntries(
        Object.entries(productData).filter(([_, value]) => value !== undefined)
      );

      // Add timestamps
      const productWithTimestamps = {
        ...cleanProductData,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      };

      const docRef = await this.db.collection('products').add(productWithTimestamps);
      const productDoc = await docRef.get();
      
      if (!productDoc.exists) {
        throw new Error('Failed to create product');
      }

      const product = { id: productDoc.id, ...productDoc.data() } as Product;
      console.log('Product created successfully:', product.id);

      return { data: product, success: true };
    } catch (error) {
      console.error('Error creating product:', error);
      return { error: (error as Error).message, success: false };
    }
  }

  async getProducts(params?: {
    categoryId?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      console.log('Getting products with Admin SDK...');
      
      let query: any = this.db.collection('products');
      
      // Apply filters
      if (params?.categoryId) {
        query = query.where('category_id', '==', params.categoryId);
      }
      if (params?.status) {
        query = query.where('status', '==', params.status);
      }
      if (params?.featured !== undefined) {
        query = query.where('featured', '==', params.featured);
      }
      
      // Apply pagination
      const limit = params?.limit || 20;
      const page = params?.page || 1;
      const offset = (page - 1) * limit;
      
      if (offset > 0) {
        query = query.offset(offset);
      }
      query = query.limit(limit);
      
      const productsSnapshot = await query.get();
      const products = productsSnapshot.docs.map((doc: any) => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Product[];

      // Apply search filter (client-side for now)
      let filteredProducts = products;
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.slug.toLowerCase().includes(searchTerm)
        );
      }

      console.log(`Retrieved ${filteredProducts.length} products`);

      return {
        data: filteredProducts,
        total: filteredProducts.length,
        page,
        limit,
        hasMore: filteredProducts.length === limit
      };
    } catch (error) {
      console.error('Error getting products:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
        error: (error as Error).message
      };
    }
  }

  async updateProduct(productId: string, updateData: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      console.log(`Updating product ${productId} with Admin SDK...`);
      
      // Filter out undefined values to avoid Firestore errors
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      // Add updated timestamp
      const updateWithTimestamp = {
        ...cleanUpdateData,
        updated_at: FieldValue.serverTimestamp()
      };

      await this.db.collection('products').doc(productId).update(updateWithTimestamp);
      
      // Get the updated product
      const productDoc = await this.db.collection('products').doc(productId).get();
      
      if (!productDoc.exists) {
        return { error: 'Product not found after update', success: false };
      }

      const product = { id: productDoc.id, ...productDoc.data() } as Product;
      console.log(`Product ${productId} updated successfully`);

      return { data: product, success: true };
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      console.log(`Deleting product ${productId} with Admin SDK...`);
      
      // First, delete all related variants
      const variantsSnapshot = await this.db.collection('product_variants')
        .where('product_id', '==', productId)
        .get();

      const batch = this.db.batch();

      // Add variants to batch delete
      variantsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete any cart items with this product
      const cartItemsSnapshot = await this.db.collection('cart_items')
        .where('product_id', '==', productId)
        .get();

      cartItemsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add product to batch delete
      const productRef = this.db.collection('products').doc(productId);
      batch.delete(productRef);

      // Execute batch delete
      await batch.commit();

      console.log(`Product ${productId} and related data deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  // Helper function to remove undefined values
  private cleanUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedValues(item));
    }
    
    // Preserve Date objects and other special objects
    if (typeof obj === 'object') {
      // Don't process Date objects, Firestore Timestamps, FieldValues, or other special objects
      if (obj instanceof Date || 
          obj.constructor.name === 'Timestamp' ||
          obj.constructor.name === 'FieldValue' ||
          obj.constructor.name === 'ServerTimestampTransform' ||
          obj.constructor.name === 'FieldTransform' ||
          typeof obj.toDate === 'function' ||
          typeof obj.seconds === 'number' ||
          obj._methodName === 'FieldValue.serverTimestamp') {
        return obj;
      }
      
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  // Order operations
  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<OrderWithItems>> {
    try {
      console.log('Creating order with Admin SDK...');

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Add timestamps and order number
      const orderWithTimestamps = this.cleanUndefinedValues({
        ...orderData,
        order_number: orderNumber,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp()
      });

      // Create order document
      const orderRef = await this.db.collection('orders').add(orderWithTimestamps);
      const orderId = orderRef.id;

      // Create order items
      const orderItems: OrderItem[] = [];
      for (const item of orderData.items) {
        const orderItemData = this.cleanUndefinedValues({
          ...item,
          order_id: orderId,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        });

        const orderItemRef = await this.db.collection('order_items').add(orderItemData);
        orderItems.push({
          id: orderItemRef.id,
          ...orderItemData
        } as OrderItem);
      }

      // Get the created order
      const orderDoc = await orderRef.get();
      const order = { id: orderDoc.id, ...orderDoc.data() } as Order;

      console.log(`Order created successfully: ${order.order_number}`);

      return {
        data: {
          ...order,
          items: orderItems
        },
        success: true
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return { error: (error as Error).message, success: false };
    }
  }

  async getOrder(orderId: string): Promise<ApiResponse<OrderWithItems>> {
    try {
      console.log(`Getting order ${orderId} with Admin SDK...`);

      // Get order document
      const orderDoc = await this.db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return { error: 'Order not found', success: false };
      }

      const orderData = orderDoc.data();
      if (!orderData) {
        return { error: 'Order data not found', success: false };
      }
      
      const order = {
        id: orderDoc.id,
        ...orderData,
        // Convert timestamps explicitly
        created_at: orderData.created_at ? this.convertTimestamp(orderData.created_at) : null,
        updated_at: orderData.updated_at ? this.convertTimestamp(orderData.updated_at) : null,
        shipped_at: orderData.shipped_at ? this.convertTimestamp(orderData.shipped_at) : null,
        delivered_at: orderData.delivered_at ? this.convertTimestamp(orderData.delivered_at) : null,
      } as any;

      // Get order items
      const orderItemsSnapshot = await this.db.collection('order_items')
        .where('order_id', '==', orderId)
        .get();

      const orderItems = orderItemsSnapshot.docs.map(doc => {
        const itemData = doc.data();
        return {
          id: doc.id,
          ...itemData,
          // Convert Firestore Timestamps to ISO strings
          created_at: itemData?.created_at?.toDate?.() ? itemData.created_at.toDate().toISOString() : itemData?.created_at,
          updated_at: itemData?.updated_at?.toDate?.() ? itemData.updated_at.toDate().toISOString() : itemData?.updated_at,
        };
      }) as OrderItem[];

      // Get user email and profile information
      let userEmail = 'Unknown';
      let userProfile: any = null;
      let customerName = 'Unknown Customer';
      let customerPhone = '';

      try {
        const userDoc = await this.db.collection('users').doc(order.user_id).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userEmail = userData?.email || 'Unknown';

          // Get user profile for name and phone
          try {
            const profileSnapshot = await this.db.collection('profiles')
              .where('user_id', '==', order.user_id)
              .limit(1)
              .get();

            if (!profileSnapshot.empty) {
              userProfile = profileSnapshot.docs[0].data();
              const firstName = userProfile?.first_name || '';
              const lastName = userProfile?.last_name || '';
              customerName = firstName && lastName ? `${firstName} ${lastName}` :
                            userProfile?.full_name || firstName || lastName || 'Unknown Customer';
              customerPhone = userProfile?.phone || '';
            }
          } catch (profileError) {
            console.warn(`Failed to get user profile for order ${order.id}:`, profileError);
          }
        }
      } catch (userError) {
        console.warn(`Failed to get user data for order ${order.id}:`, userError);
      }

      return {
        data: {
          ...order,
          items: orderItems,
          user_email: userEmail,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_profile: userProfile
        } as any,
        success: true
      };
    } catch (error) {
      console.error(`Error getting order ${orderId}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    adminNotes?: string,
    trackingNumber?: string,
    trackingUrl?: string
  ): Promise<ApiResponse<void>> {
    try {
      console.log(`Updating order ${orderId} status to ${status} with Admin SDK...`);

      const updateData: any = {
        status,
        updated_at: new Date()
      };

      // Automatically update payment status based on order status
      if (status === 'delivered') {
        updateData.payment_status = 'paid';
        updateData.delivered_at = new Date();
        console.log(`Setting payment status to 'paid' for delivered order ${orderId}`);
      } else if (status === 'cancelled') {
        updateData.payment_status = 'cancelled';
        console.log(`Setting payment status to 'cancelled' for cancelled order ${orderId}`);
      } else if (status === 'shipped' || status === 'sent for delivery') {
        updateData.shipped_at = new Date();
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      if (trackingUrl) {
        updateData.tracking_url = trackingUrl;
      }

      await this.db.collection('orders').doc(orderId).update(updateData);

      console.log(`Order ${orderId} status updated successfully. Payment status: ${updateData.payment_status || 'unchanged'}`);
      return { success: true };
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      console.log(`Deleting order ${orderId} with Admin SDK...`);

      // First, delete all order items
      const orderItemsSnapshot = await this.db.collection('order_items')
        .where('order_id', '==', orderId)
        .get();

      const batch = this.db.batch();

      // Add order items to batch delete
      orderItemsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add order to batch delete
      const orderRef = this.db.collection('orders').doc(orderId);
      batch.delete(orderRef);

      // Execute batch delete
      await batch.commit();

      console.log(`Order ${orderId} and its items deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }
}