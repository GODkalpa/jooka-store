import { User, Address } from './firebase'
import { Product } from './product'

// Define PaymentMethod locally since it's not in firebase
export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank_transfer'
  details: any
}

export interface Order {
  id: string
  userId: string
  user: User
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  totalAmount: number
  shippingAddress: Address
  paymentMethod: PaymentMethod
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}