// Re-export all types for easier imports
export * from './product'
export * from './order'
export * from './api'
export * from './config'

// Export specific types from firebase and database to avoid conflicts
export type { 
  BaseDocument, User, UserProfile, Category, Product, ProductImage, ProductVariant,
  CartItem, Order, OrderItem, Address, Notification, AuditLog,
  ProductWithCategory, ProductWithVariants, ProductVariantWithStock,
  OrderWithItems, CartItemWithProduct, UserWithProfile,
  CreateProductData, CreateProductVariantData, UpdateProductVariantData,
  CreateUserData, EnhancedRegistrationData, RegistrationFormData,
  UpdateUserProfileData, CreateAddressData, UpdateAddressData,
  CreateOrderData, VariantInventoryUpdate, VariantStockCheck,
  ProductFilters, OrderFilters, SalesAnalytics, LowStockProduct,
  PaginatedResponse as FirebasePaginatedResponse
} from './firebase'

export type {
  Database, SalesAnalytics as DatabaseSalesAnalytics,
  LowStockProduct as DatabaseLowStockProduct,
  PaginatedResponse as DatabasePaginatedResponse
} from './database'