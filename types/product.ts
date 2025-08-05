export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  category: Category
  inventoryCount: number
  images: ProductImage[]
  colors: string[]
  sizes: string[]
  status: 'active' | 'inactive' | 'out_of_stock'
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  publicId?: string
  secure_url: string
  alt_text: string
  is_primary: boolean
  order: number
  color?: string // Associated color for this image (null for general images)
}

export interface ColorImageGroup {
  color: string
  images: ProductImage[]
  primaryImage?: ProductImage
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  children?: Category[]
}