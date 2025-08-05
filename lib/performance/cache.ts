// Performance caching system
import { NextRequest, NextResponse } from 'next/server';

// In-memory cache implementation
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, value: any, ttlSeconds: number = 300): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expiry });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Global cache instances
export const apiCache = new MemoryCache(500);
export const dataCache = new MemoryCache(1000);

// Cache key generators
export const cacheKeys = {
  products: (filters?: Record<string, any>) => 
    `products:${JSON.stringify(filters || {})}`,
  
  product: (id: string) => `product:${id}`,
  
  categories: () => 'categories:all',
  
  userProfile: (userId: string) => `user:${userId}:profile`,
  
  userOrders: (userId: string, page: number = 1) => 
    `user:${userId}:orders:page:${page}`,
  
  cart: (userId: string) => `user:${userId}:cart`,
  
  adminDashboard: () => 'admin:dashboard',
  
  salesAnalytics: (startDate?: string, endDate?: string) =>
    `analytics:sales:${startDate || 'default'}:${endDate || 'default'}`,
  
  lowStockProducts: (threshold: number = 10) => 
    `inventory:low-stock:${threshold}`,
};

// Cache middleware
export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    keyGenerator: (request: NextRequest) => string;
    ttlSeconds?: number;
    cache?: MemoryCache;
    skipCache?: (request: NextRequest) => boolean;
  }
) {
  const {
    keyGenerator,
    ttlSeconds = 300, // 5 minutes default
    cache = apiCache,
    skipCache = () => false
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip cache for non-GET requests or when skipCache returns true
    if (request.method !== 'GET' || skipCache(request)) {
      return await handler(request);
    }

    const cacheKey = keyGenerator(request);
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      // Return cached response with cache headers
      const response = NextResponse.json(cachedResponse);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
      return response;
    }

    // Execute handler and cache the result
    const response = await handler(request);
    
    if (response.status === 200) {
      try {
        const responseData = await response.json();
        cache.set(cacheKey, responseData, ttlSeconds);
        
        // Create new response with cache headers
        const newResponse = NextResponse.json(responseData);
        newResponse.headers.set('X-Cache', 'MISS');
        newResponse.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
        return newResponse;
      } catch (error) {
        // If response is not JSON, return original response
        response.headers.set('X-Cache', 'SKIP');
        return response;
      }
    }

    return response;
  };
}

// Cache invalidation utilities
export const cacheInvalidation = {
  // Invalidate product-related caches
  invalidateProduct: (productId: string) => {
    apiCache.delete(cacheKeys.product(productId));
    // Invalidate products list cache (all variations)
    for (const key of Array.from((apiCache as any).cache.keys())) {
      if (typeof key === 'string' && key.startsWith('products:')) {
        apiCache.delete(key);
      }
    }
  },

  // Invalidate user-related caches
  invalidateUser: (userId: string) => {
    apiCache.delete(cacheKeys.userProfile(userId));
    apiCache.delete(cacheKeys.cart(userId));
    // Invalidate all user orders pages
    for (const key of Array.from((apiCache as any).cache.keys())) {
      if (typeof key === 'string' && key.startsWith(`user:${userId}:orders:`)) {
        apiCache.delete(key);
      }
    }
  },

  // Invalidate category-related caches
  invalidateCategories: () => {
    apiCache.delete(cacheKeys.categories());
    // Also invalidate products cache as it might include category data
    for (const key of Array.from((apiCache as any).cache.keys())) {
      if (typeof key === 'string' && key.startsWith('products:')) {
        apiCache.delete(key);
      }
    }
  },

  // Invalidate admin dashboard cache
  invalidateAdminDashboard: () => {
    apiCache.delete(cacheKeys.adminDashboard());
    apiCache.delete(cacheKeys.salesAnalytics());
    apiCache.delete(cacheKeys.lowStockProducts());
  },

  // Clear all caches
  clearAll: () => {
    apiCache.clear();
    dataCache.clear();
  },
};

// Background cache cleanup
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    apiCache.cleanup();
    dataCache.cleanup();
  }, 60000); // Cleanup every minute
}

// Cache warming utilities
export const cacheWarming = {
  // Warm up frequently accessed data
  warmupProducts: async () => {
    try {
      // This would typically make API calls to populate cache
      console.log('Warming up products cache...');
      // Implementation would depend on your data fetching logic
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  },

  warmupCategories: async () => {
    try {
      console.log('Warming up categories cache...');
      // Implementation would depend on your data fetching logic
    } catch (error) {
      console.error('Categories cache warmup failed:', error);
    }
  },
};

// Cache statistics
export const cacheStats = {
  getStats: () => ({
    apiCache: {
      size: apiCache.size(),
      maxSize: (apiCache as any).maxSize,
    },
    dataCache: {
      size: dataCache.size(),
      maxSize: (dataCache as any).maxSize,
    },
  }),

  getHitRate: () => {
    // This would require implementing hit/miss counters
    // For now, return placeholder
    return {
      apiCache: { hits: 0, misses: 0, hitRate: 0 },
      dataCache: { hits: 0, misses: 0, hitRate: 0 },
    };
  },
};

// Redis cache implementation (for production)
export class RedisCache {
  private client: any; // Redis client would be initialized here

  constructor() {
    // Initialize Redis client in production
    if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
      // this.client = new Redis(process.env.REDIS_URL);
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.client) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.flushall();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

// Export Redis cache instance for production use
export const redisCache = new RedisCache();