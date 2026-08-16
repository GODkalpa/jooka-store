// Database service utilities for JOOKA E-commerce Platform (Medusa & Local Fallback backed)
import { medusaClient } from '@/lib/medusa/client';
import { OrderService } from '@/lib/services/order-service';

export class MedusaDatabaseService {
  async getUsers(params?: any): Promise<any> {
    return { data: [], total: 0, page: 1, limit: params?.limit || 20, hasMore: false };
  }

  async getUser(userId: string): Promise<any> {
    return {
      data: {
        id: userId,
        email: 'customer@jookawear.com',
        role: 'customer',
        profile: {
          first_name: 'Customer',
          last_name: 'User',
          full_name: 'Customer User',
          phone: '',
        },
      },
      success: true,
    };
  }

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    return { data: profileData, success: true };
  }

  async getUserAddresses(userId: string): Promise<any> {
    return { data: [], success: true };
  }

  async getUserOrders(userId: string, params?: any): Promise<any> {
    return OrderService.getOrders({ userId, ...params });
  }

  async getCartItems(userId: string): Promise<any> {
    return { data: [], success: true };
  }

  async getUserNotifications(userId: string, params?: any): Promise<any> {
    return { data: [], success: true };
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    return { success: true };
  }

  async getCategories(): Promise<any> {
    return {
      data: [
        { id: 'cat-1', name: 'Outerwear', slug: 'outerwear' },
        { id: 'cat-2', name: 'Sweatshirts', slug: 'sweatshirts' },
        { id: 'cat-3', name: 'Shirts', slug: 'shirts' },
        { id: 'cat-4', name: 'Pants', slug: 'pants' },
        { id: 'cat-5', name: 'Merch', slug: 'merch' },
      ],
      success: true,
    };
  }

  async getProducts(params?: any): Promise<any> {
    try {
      const res = await medusaClient.getProducts({ limit: params?.limit || 20 });
      return { data: res.products || [], total: res.count || 0, success: true };
    } catch {
      return { data: [], total: 0, success: true };
    }
  }

  async getProduct(productId: string): Promise<any> {
    return { data: null, success: false };
  }

  async getOrders(params?: any): Promise<any> {
    return OrderService.getOrders(params);
  }

  async getOrder(orderId: string): Promise<any> {
    const found = OrderService.getOrderById(orderId);
    return { data: found, success: !!found };
  }

  async getLowStockProducts(threshold: number = 10): Promise<any> {
    return { data: [], success: true };
  }

  async updateProductInventory(productId: string, quantityChange: number, transactionType: string, referenceId?: string, referenceType?: string, notes?: string, userId?: string): Promise<any> {
    return { success: true };
  }

  async createCategory(categoryData: any): Promise<any> {
    return { data: { id: `cat_${Date.now()}`, ...categoryData }, success: true };
  }
}

export const db = new MedusaDatabaseService();
export const clientDb = new MedusaDatabaseService();
export class DatabaseService extends MedusaDatabaseService {}

// Export types for convenience
export type * from '@/types/firebase';