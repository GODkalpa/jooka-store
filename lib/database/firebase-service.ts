// Firebase Database service for JOOKA E-commerce Platform
import { 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  getPaginatedDocuments,
  batchWrite,
  COLLECTIONS
} from '@/lib/firebase/firestore';
import type {
  User,
  UserProfile,
  Product,
  Category,
  Order,
  OrderItem,
  CartItem,
  Address,
  Notification,
  ProductWithCategory,
  OrderWithItems,
  CartItemWithProduct,
  UserWithProfile,
  ApiResponse,
  PaginatedResponse,
  ProductFilters,
  OrderFilters,
  CreateUserData,
  UpdateUserProfileData,
  CreateProductData,
  CreateOrderData,
  CreateAddressData,
  UpdateAddressData
} from '@/types/firebase';

export class FirebaseDatabaseService {
  
  // User operations
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    try {
      const userId = await addDocument<User>(COLLECTIONS.USERS, {
        email: userData.email,
        role: userData.role || 'customer',
        email_verified: true // Firebase Auth handles verification
      });
      
      const user = await getDocument<User>(COLLECTIONS.USERS, userId);
      return { data: user!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async getUser(userId: string): Promise<ApiResponse<UserWithProfile>> {
    try {
      const user = await getDocument<User>(COLLECTIONS.USERS, userId);
      if (!user) {
        return { error: 'User not found', success: false };
      }

      // Get user profile
      const profiles = await getDocuments<UserProfile>(
        COLLECTIONS.PROFILES,
        [where('user_id', '==', userId)]
      );
      
      const userWithProfile: UserWithProfile = {
        ...user,
        profile: profiles[0] || undefined
      };

      return { data: userWithProfile, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async updateUserProfile(userId: string, profileData: UpdateUserProfileData): Promise<ApiResponse<UserProfile>> {
    try {
      // Find existing profile
      const profiles = await getDocuments<UserProfile>(
        COLLECTIONS.PROFILES,
        [where('user_id', '==', userId)]
      );

      if (profiles.length === 0) {
        // Create new profile if it doesn't exist
        const profileId = await addDocument<UserProfile>(COLLECTIONS.PROFILES, {
          user_id: userId,
          ...profileData
        });
        
        const newProfile = await getDocument<UserProfile>(COLLECTIONS.PROFILES, profileId);
        return { data: newProfile!, success: true };
      } else {
        // Update existing profile
        await updateDocument<UserProfile>(COLLECTIONS.PROFILES, profiles[0].id, profileData);
        const updatedProfile = await getDocument<UserProfile>(COLLECTIONS.PROFILES, profiles[0].id);
        return { data: updatedProfile!, success: true };
      }
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async getUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserWithProfile>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      
      // Build query constraints
      const constraints = [];
      
      if (params?.role) {
        constraints.push(where('role', '==', params.role));
      }
      
      // Add ordering
      constraints.push(orderBy('created_at', 'desc'));

      // Get paginated users
      const { documents: users, hasMore } = await getPaginatedDocuments<User>(
        COLLECTIONS.USERS,
        limit,
        undefined,
        constraints
      );

      // Get profiles for all users
      const usersWithProfiles: UserWithProfile[] = await Promise.all(
        users.map(async (user) => {
          const profiles = await getDocuments<UserProfile>(
            COLLECTIONS.PROFILES,
            [where('user_id', '==', user.id)]
          );
          return {
            ...user,
            profile: profiles[0] || undefined
          };
        })
      );

      // Filter by search if provided (client-side filtering for email search)
      let filteredUsers = usersWithProfiles;
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredUsers = usersWithProfiles.filter(user => 
          user.email.toLowerCase().includes(searchLower) ||
          user.profile?.first_name?.toLowerCase().includes(searchLower) ||
          user.profile?.last_name?.toLowerCase().includes(searchLower)
        );
      }

      return {
        data: filteredUsers,
        total: filteredUsers.length,
        page,
        limit,
        hasMore
      };
    } catch (error) {
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

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      // Get all related data to delete
      const [profiles, addresses, cartItems, notifications] = await Promise.all([
        getDocuments<UserProfile>(COLLECTIONS.PROFILES, [where('user_id', '==', userId)]),
        getDocuments<Address>(COLLECTIONS.ADDRESSES, [where('user_id', '==', userId)]),
        getDocuments<CartItem>(COLLECTIONS.CART_ITEMS, [where('user_id', '==', userId)]),
        getDocuments<Notification>(COLLECTIONS.NOTIFICATIONS, [where('user_id', '==', userId)])
      ]);

      // Prepare batch operations
      const operations = [];
      
      // Delete profiles
      profiles.forEach(profile => {
        operations.push({ type: 'delete' as const, collection: COLLECTIONS.PROFILES, id: profile.id });
      });
      
      // Delete addresses
      addresses.forEach(address => {
        operations.push({ type: 'delete' as const, collection: COLLECTIONS.ADDRESSES, id: address.id });
      });
      
      // Delete cart items
      cartItems.forEach(item => {
        operations.push({ type: 'delete' as const, collection: COLLECTIONS.CART_ITEMS, id: item.id });
      });
      
      // Delete notifications
      notifications.forEach(notification => {
        operations.push({ type: 'delete' as const, collection: COLLECTIONS.NOTIFICATIONS, id: notification.id });
      });
      
      // Delete user
      operations.push({ type: 'delete' as const, collection: COLLECTIONS.USERS, id: userId });

      // Execute batch delete
      await batchWrite(operations);

      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Category operations
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const categories = await getDocuments<Category>(
        COLLECTIONS.CATEGORIES,
        [where('is_active', '==', true), orderBy('sort_order', 'asc')]
      );
      
      return { data: categories, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async getCategory(categoryId: string): Promise<ApiResponse<Category>> {
    try {
      const category = await getDocument<Category>(COLLECTIONS.CATEGORIES, categoryId);
      if (!category) {
        return { error: 'Category not found', success: false };
      }
      
      return { data: category, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Category>> {
    try {
      const categoryId = await addDocument<Category>(COLLECTIONS.CATEGORIES, categoryData);
      const category = await getDocument<Category>(COLLECTIONS.CATEGORIES, categoryId);
      
      return { data: category!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async updateCategory(categoryId: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      await updateDocument<Category>(COLLECTIONS.CATEGORIES, categoryId, categoryData);
      const category = await getDocument<Category>(COLLECTIONS.CATEGORIES, categoryId);
      
      return { data: category!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDocument(COLLECTIONS.CATEGORIES, categoryId);
      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Product operations
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<ProductWithCategory>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;

      // Build query constraints
      const constraints = [];

      if (filters?.categoryId) {
        constraints.push(where('category_id', '==', filters.categoryId));
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.featured !== undefined) {
        constraints.push(where('featured', '==', filters.featured));
      }

      // Add ordering
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      constraints.push(orderBy(sortBy, sortOrder));

      // Get paginated products
      const { documents: products, hasMore } = await getPaginatedDocuments<Product>(
        COLLECTIONS.PRODUCTS,
        limit,
        undefined,
        constraints
      );

      // Get categories for products
      const productsWithCategories: ProductWithCategory[] = await Promise.all(
        products.map(async (product) => {
          let category = undefined;
          if (product.category_id) {
            const categoryDoc = await getDocument<Category>(COLLECTIONS.CATEGORIES, product.category_id);
            category = categoryDoc || undefined;
          }
          return {
            ...product,
            category
          };
        })
      );

      // Apply client-side filters
      let filteredProducts = productsWithCategories;

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = productsWithCategories.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice!);
      }

      if (filters?.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice!);
      }

      if (filters?.colors && filters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          filters.colors!.some(color => product.colors.includes(color))
        );
      }

      if (filters?.sizes && filters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          filters.sizes!.some(size => product.sizes.includes(size))
        );
      }

      return {
        data: filteredProducts,
        total: filteredProducts.length,
        page,
        limit,
        hasMore
      };
    } catch (error) {
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

  async getProduct(productId: string): Promise<ApiResponse<ProductWithCategory>> {
    try {
      const product = await getDocument<Product>(COLLECTIONS.PRODUCTS, productId);
      if (!product) {
        return { error: 'Product not found', success: false };
      }

      // Get category if exists
      let category: Category | undefined = undefined;
      if (product.category_id) {
        const categoryDoc = await getDocument<Category>(COLLECTIONS.CATEGORIES, product.category_id);
        category = categoryDoc || undefined;
      }

      const productWithCategory: ProductWithCategory = {
        ...product,
        category
      };

      return { data: productWithCategory, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<ProductWithCategory>> {
    try {
      const products = await getDocuments<Product>(
        COLLECTIONS.PRODUCTS,
        [where('slug', '==', slug)]
      );

      if (products.length === 0) {
        return { error: 'Product not found', success: false };
      }

      const product = products[0];

      // Get category if exists
      let category: Category | undefined = undefined;
      if (product.category_id) {
        const categoryDoc = await getDocument<Category>(COLLECTIONS.CATEGORIES, product.category_id);
        category = categoryDoc || undefined;
      }

      const productWithCategory: ProductWithCategory = {
        ...product,
        category
      };

      return { data: productWithCategory, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    try {
      // Generate slug if not provided
      const slug = productData.slug || productData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const productToCreate = {
        ...productData,
        slug
      };

      const productId = await addDocument<Product>(COLLECTIONS.PRODUCTS, productToCreate);
      const product = await getDocument<Product>(COLLECTIONS.PRODUCTS, productId);

      return { data: product!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      await updateDocument<Product>(COLLECTIONS.PRODUCTS, productId, productData);
      const product = await getDocument<Product>(COLLECTIONS.PRODUCTS, productId);

      return { data: product!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDocument(COLLECTIONS.PRODUCTS, productId);
      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Cart operations
  async getCartItems(userId: string): Promise<ApiResponse<CartItemWithProduct[]>> {
    try {
      const cartItems = await getDocuments<CartItem>(
        COLLECTIONS.CART_ITEMS,
        [where('user_id', '==', userId)]
      );

      // Get products for cart items
      const cartItemsWithProducts: CartItemWithProduct[] = await Promise.all(
        cartItems.map(async (item) => {
          const product = await getDocument<Product>(COLLECTIONS.PRODUCTS, item.product_id);
          return {
            ...item,
            product: product!
          };
        })
      );

      return { data: cartItemsWithProducts, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async addToCart(userId: string, productId: string, quantity: number, selectedColor?: string, selectedSize?: string): Promise<ApiResponse<CartItem>> {
    try {
      // Check if item already exists in cart
      const existingItems = await getDocuments<CartItem>(
        COLLECTIONS.CART_ITEMS,
        [
          where('user_id', '==', userId),
          where('product_id', '==', productId),
          where('selected_color', '==', selectedColor || null),
          where('selected_size', '==', selectedSize || null)
        ]
      );

      if (existingItems.length > 0) {
        // Update existing item
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + quantity;

        await updateDocument<CartItem>(COLLECTIONS.CART_ITEMS, existingItem.id, {
          quantity: newQuantity
        });

        const updatedItem = await getDocument<CartItem>(COLLECTIONS.CART_ITEMS, existingItem.id);
        return { data: updatedItem!, success: true };
      } else {
        // Create new cart item
        const cartItemId = await addDocument<CartItem>(COLLECTIONS.CART_ITEMS, {
          user_id: userId,
          product_id: productId,
          quantity,
          selected_color: selectedColor,
          selected_size: selectedSize
        });

        const cartItem = await getDocument<CartItem>(COLLECTIONS.CART_ITEMS, cartItemId);
        return { data: cartItem!, success: true };
      }
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    try {
      await updateDocument<CartItem>(COLLECTIONS.CART_ITEMS, cartItemId, { quantity });
      const cartItem = await getDocument<CartItem>(COLLECTIONS.CART_ITEMS, cartItemId);

      return { data: cartItem!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async removeFromCart(cartItemId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDocument(COLLECTIONS.CART_ITEMS, cartItemId);
      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async clearCart(userId: string): Promise<ApiResponse<void>> {
    try {
      const cartItems = await getDocuments<CartItem>(
        COLLECTIONS.CART_ITEMS,
        [where('user_id', '==', userId)]
      );

      const operations = cartItems.map(item => ({
        type: 'delete' as const,
        collection: COLLECTIONS.CART_ITEMS,
        id: item.id
      }));

      await batchWrite(operations);
      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Order operations
  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<OrderWithItems>> {
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const orderId = await addDocument<Order>(COLLECTIONS.ORDERS, {
        ...orderData,
        order_number: orderNumber
      });

      // Create order items
      const orderItemOperations = orderData.items.map(item => ({
        type: 'add' as const,
        collection: COLLECTIONS.ORDER_ITEMS,
        data: {
          ...item,
          order_id: orderId
        }
      }));

      await batchWrite(orderItemOperations);

      // Get created order with items
      const order = await getDocument<Order>(COLLECTIONS.ORDERS, orderId);
      const orderItems = await getDocuments<OrderItem>(
        COLLECTIONS.ORDER_ITEMS,
        [where('order_id', '==', orderId)]
      );

      const orderWithItems: OrderWithItems = {
        ...order!,
        items: orderItems
      };

      return { data: orderWithItems, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async getOrder(orderId: string): Promise<ApiResponse<OrderWithItems>> {
    try {
      const order = await getDocument<Order>(COLLECTIONS.ORDERS, orderId);
      if (!order) {
        return { error: 'Order not found', success: false };
      }

      const orderItems = await getDocuments<OrderItem>(
        COLLECTIONS.ORDER_ITEMS,
        [where('order_id', '==', orderId)]
      );

      const orderWithItems: OrderWithItems = {
        ...order,
        items: orderItems
      };

      return { data: orderWithItems, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<OrderWithItems>> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;

      // Build query constraints
      const constraints = [];

      if (filters?.userId) {
        constraints.push(where('user_id', '==', filters.userId));
      }

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.paymentStatus) {
        constraints.push(where('payment_status', '==', filters.paymentStatus));
      }

      // Add ordering
      constraints.push(orderBy('created_at', 'desc'));

      // Get paginated orders
      const { documents: orders, hasMore } = await getPaginatedDocuments<Order>(
        COLLECTIONS.ORDERS,
        limit,
        undefined,
        constraints
      );

      // Get order items for each order
      const ordersWithItems: OrderWithItems[] = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await getDocuments<OrderItem>(
            COLLECTIONS.ORDER_ITEMS,
            [where('order_id', '==', order.id)]
          );
          return {
            ...order,
            items: orderItems
          };
        })
      );

      return {
        data: ordersWithItems,
        total: ordersWithItems.length,
        page,
        limit,
        hasMore
      };
    } catch (error) {
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

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    try {
      const updateData: Partial<Order> = { status };

      // Automatically update payment status based on order status
      if (status === 'delivered') {
        updateData.payment_status = 'paid';
        updateData.delivered_at = Timestamp.now();
      } else if (status === 'cancelled') {
        updateData.payment_status = 'cancelled';
      } else if (status === 'shipped') {
        updateData.shipped_at = Timestamp.now();
      }

      await updateDocument<Order>(COLLECTIONS.ORDERS, orderId, updateData);
      const order = await getDocument<Order>(COLLECTIONS.ORDERS, orderId);

      return { data: order!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Address operations
  async getUserAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    try {
      const addresses = await getDocuments<Address>(
        COLLECTIONS.ADDRESSES,
        [where('user_id', '==', userId), orderBy('created_at', 'desc')]
      );

      return { data: addresses, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async createAddress(addressData: CreateAddressData): Promise<ApiResponse<Address>> {
    try {
      // If this is set as default, unset all other default addresses for this user
      if (addressData.is_default) {
        const existingAddresses = await getDocuments<Address>(
          COLLECTIONS.ADDRESSES,
          [where('user_id', '==', addressData.user_id), where('is_default', '==', true)]
        );

        // Update existing default addresses to false
        const updateOperations = existingAddresses.map(addr => ({
          type: 'update' as const,
          collection: COLLECTIONS.ADDRESSES,
          id: addr.id,
          data: { is_default: false }
        }));

        if (updateOperations.length > 0) {
          await batchWrite(updateOperations);
        }
      }

      const addressId = await addDocument<Address>(COLLECTIONS.ADDRESSES, addressData);
      const address = await getDocument<Address>(COLLECTIONS.ADDRESSES, addressId);

      return { data: address!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async updateAddress(addressId: string, addressData: UpdateAddressData): Promise<ApiResponse<Address>> {
    try {
      // If this is being set as default, unset all other default addresses for this user
      if (addressData.is_default) {
        const address = await getDocument<Address>(COLLECTIONS.ADDRESSES, addressId);
        if (address) {
          const existingAddresses = await getDocuments<Address>(
            COLLECTIONS.ADDRESSES,
            [where('user_id', '==', address.user_id), where('is_default', '==', true)]
          );

          // Update existing default addresses to false
          const updateOperations = existingAddresses
            .filter(addr => addr.id !== addressId)
            .map(addr => ({
              type: 'update' as const,
              collection: COLLECTIONS.ADDRESSES,
              id: addr.id,
              data: { is_default: false }
            }));

          if (updateOperations.length > 0) {
            await batchWrite(updateOperations);
          }
        }
      }

      await updateDocument<Address>(COLLECTIONS.ADDRESSES, addressId, addressData);
      const address = await getDocument<Address>(COLLECTIONS.ADDRESSES, addressId);

      return { data: address!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDocument(COLLECTIONS.ADDRESSES, addressId);
      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async getAddress(addressId: string): Promise<ApiResponse<Address>> {
    try {
      const address = await getDocument<Address>(COLLECTIONS.ADDRESSES, addressId);
      if (!address) {
        return { error: 'Address not found', success: false };
      }

      return { data: address, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // User-specific order operations
  async getUserOrders(userId: string, options?: { limit?: number }): Promise<ApiResponse<OrderWithItems[]>> {
    try {
      const constraints: QueryConstraint[] = [
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      ];

      if (options?.limit) {
        constraints.push(firestoreLimit(options.limit));
      }

      const orders = await getDocuments<Order>(COLLECTIONS.ORDERS, constraints);

      // Get order items for each order
      const ordersWithItems: OrderWithItems[] = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await getDocuments<OrderItem>(
            COLLECTIONS.ORDER_ITEMS,
            [where('order_id', '==', order.id)]
          );
          return {
            ...order,
            items: orderItems
          };
        })
      );

      return { data: ordersWithItems, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Notification operations
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<ApiResponse<Notification[]>> {
    try {
      const constraints = [
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      ];

      if (unreadOnly) {
        constraints.push(where('read', '==', false));
      }

      const notifications = await getDocuments<Notification>(
        COLLECTIONS.NOTIFICATIONS,
        constraints
      );

      return { data: notifications, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Notification>> {
    try {
      const notificationId = await addDocument<Notification>(COLLECTIONS.NOTIFICATIONS, notificationData);
      const notification = await getDocument<Notification>(COLLECTIONS.NOTIFICATIONS, notificationId);

      return { data: notification!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      await updateDocument<Notification>(COLLECTIONS.NOTIFICATIONS, notificationId, { read: true });
      const notification = await getDocument<Notification>(COLLECTIONS.NOTIFICATIONS, notificationId);

      return { data: notification!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Payment methods (placeholder for future implementation)
  async getUserPaymentMethods(userId: string): Promise<ApiResponse<any[]>> {
    try {
      // For now, return empty array as we only support COD
      // This method is prepared for future payment method integrations
      return { data: [], success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Analytics and reporting methods
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
      // Get all orders for analytics
      const ordersResult = await this.getOrders({ limit: 1000 });
      const orders = ordersResult.data || [];

      // Calculate summary statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // For now, return basic analytics
      // In a production app, you'd want more sophisticated analytics
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
      return { error: (error as Error).message, success: false };
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<ApiResponse<ProductWithCategory[]>> {
    try {
      // Get all products and filter by stock level
      const productsResult = await this.getProducts({ limit: 1000 });
      const products = productsResult.data || [];

      // Filter products with low stock
      const lowStockProducts = products.filter(product => 
        product.inventory_count <= threshold && product.inventory_count > 0
      );

      return { data: lowStockProducts, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Inventory management
  async updateProductInventory(
    productId: string,
    quantityChange: number,
    transactionType: 'restock' | 'adjustment' | 'return' | 'sale',
    referenceId?: string,
    referenceType?: string,
    notes?: string,
    userId?: string
  ): Promise<ApiResponse<Product>> {
    try {
      // Get current product
      const product = await getDocument<Product>(COLLECTIONS.PRODUCTS, productId);
      if (!product) {
        return { error: 'Product not found', success: false };
      }

      // Calculate new inventory count
      const currentInventory = product.inventory_count || 0;
      const newInventory = Math.max(0, currentInventory + quantityChange);

      // Update product inventory
      await updateDocument<Product>(COLLECTIONS.PRODUCTS, productId, {
        inventory_count: newInventory,
        updated_at: Timestamp.now()
      });

      // Log inventory transaction
      await addDocument('inventory_transactions', {
        product_id: productId,
        old_quantity: currentInventory,
        new_quantity: newInventory,
        quantity_change: quantityChange,
        transaction_type: transactionType,
        reference_id: referenceId,
        reference_type: referenceType,
        notes: notes,
        user_id: userId,
        created_at: Timestamp.now()
      });

      // Get updated product
      const updatedProduct = await getDocument<Product>(COLLECTIONS.PRODUCTS, productId);
      return { data: updatedProduct!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }
}
