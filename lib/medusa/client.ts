// Medusa JS Client Helper for JOOKA Next.js Storefront
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  images: { id: string; url: string }[];
  options: { id: string; title: string; values: string[] }[];
  variants: {
    id: string;
    title: string;
    sku: string;
    options: Record<string, string>;
    calculated_price?: { calculated_amount?: number };
    prices: { amount: number; currency_code: string }[];
  }[];
}

export class MedusaClient {
  private baseUrl: string;
  private publishableKey: string;

  constructor() {
    this.baseUrl = MEDUSA_BACKEND_URL;
    this.publishableKey = PUBLISHABLE_KEY;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.publishableKey) {
      headers['x-publishable-api-key'] = this.publishableKey;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Medusa API Error [${response.status}]: ${errorText}`);
    }

    return response.json();
  }

  // Storefront Product APIs
  async getProducts(params?: { category_id?: string[]; limit?: number; offset?: number }): Promise<{ products: MedusaProduct[]; count: number }> {
    const searchParams = new URLSearchParams();
    searchParams.append('fields', '*variants,*variants.prices,*variants.calculated_price,*categories');
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.category_id) {
      params.category_id.forEach(id => searchParams.append('category_id[]', id));
    }

    const queryString = searchParams.toString();
    const endpoint = `/store/products${queryString ? `?${queryString}` : ''}`;
    return this.request<{ products: MedusaProduct[]; count: number }>(endpoint, {
      next: { revalidate: 0 },
    });
  }

  async getProductByHandle(handle: string): Promise<MedusaProduct | null> {
    const data = await this.request<{ products: MedusaProduct[] }>(`/store/products?handle=${handle}&fields=*variants,*variants.prices,*variants.calculated_price`);
    return data.products[0] || null;
  }

  // Customer Auth & Account APIs
  async createCustomer(data: { email: string; first_name?: string; last_name?: string; phone?: string }): Promise<{ customer: any }> {
    return this.request<{ customer: any }>('/store/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async authenticateCustomer(email: string, password: string): Promise<{ token?: string; customer?: any }> {
    return this.request<{ token?: string; customer?: any }>('/auth/customer/emailpass', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async authenticateAdmin(email: string, password: string): Promise<{ token?: string; user?: any }> {
    return this.request<{ token?: string; user?: any }>('/auth/user/emailpass', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Customer Store API Methods
  async getCustomerProfile(token: string): Promise<{ customer: any }> {
    return this.request<{ customer: any }>('/store/customers/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateCustomerProfile(token: string, data: { first_name?: string; last_name?: string; phone?: string }): Promise<{ customer: any }> {
    return this.request<{ customer: any }>('/store/customers/me', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async getCustomerOrders(token: string): Promise<{ orders: any[]; count: number }> {
    return this.request<{ orders: any[]; count: number }>('/store/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getCustomerAddresses(token: string): Promise<{ addresses: any[] }> {
    return this.request<{ addresses: any[] }>('/store/customers/me/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addCustomerAddress(token: string, address: any): Promise<{ customer: any }> {
    return this.request<{ customer: any }>('/store/customers/me/addresses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ address }),
    });
  }

  async updateCustomerAddress(token: string, addressId: string, address: any): Promise<{ customer: any }> {
    return this.request<{ customer: any }>(`/store/customers/me/addresses/${addressId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ address }),
    });
  }

  async deleteCustomerAddress(token: string, addressId: string): Promise<{ customer: any }> {
    return this.request<{ customer: any }>(`/store/customers/me/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Storefront Cart APIs
  async createCart(): Promise<{ cart: any }> {
    return this.request<{ cart: any }>('/store/carts', {
      method: 'POST',
      body: JSON.stringify({ region_id: 'reg_np' }),
    });
  }

  async addItemToCart(cartId: string, variantId: string, quantity: number): Promise<{ cart: any }> {
    return this.request<{ cart: any }>(`/store/carts/${cartId}/line-items`, {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
  }
}

export const medusaClient = new MedusaClient();
