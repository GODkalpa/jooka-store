// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

// Product statuses
export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
} as const

// Address types
export const ADDRESS_TYPES = {
  SHIPPING: 'shipping',
  BILLING: 'billing',
} as const

// Payment method types
export const PAYMENT_METHOD_TYPES = {
  COD: 'cod',
} as const

// Default localization settings for Nepal
export const DEFAULT_COUNTRY = 'Nepal' as const;
export const DEFAULT_CURRENCY = 'NPR' as const;
export const DEFAULT_PHONE_CODE = '+977' as const;
export const DEFAULT_TAX_RATE = 0.13 as const; // 13% VAT in Nepal

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    ORDERS: '/api/admin/orders',
    PRODUCTS: '/api/admin/products',
  },
  CUSTOMER: {
    PROFILE: '/api/customer/profile',
    ORDERS: '/api/customer/orders',
    CART: '/api/customer/cart',
    CHECKOUT: '/api/customer/checkout',
  },
  PRODUCTS: '/api/products',
  UPLOAD: '/api/upload',
} as const