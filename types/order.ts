import { User } from './auth'
import { Product } from './product'
import { Address, PaymentMethod } from './auth'

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