'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import VariantInventoryTable from '@/components/dashboard/VariantInventoryTable'
import { api } from '@/lib/api/client'

interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  attributes: Record<string, string>
}

export default function ProductVariantsPage() {
  const params = useParams()
  const productId = params.id as string
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await api.get(`/products/${productId}/variants`)
        setVariants(response.data)
      } catch (error) {
        console.error('Error fetching variants:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchVariants()
    }
  }, [productId])

  if (loading) {
    return <div className="p-6">Loading variants...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Product Variants</h1>
      <VariantInventoryTable 
        productId={productId}
        productName="Product"
        productImages={[]}
        onVariantUpdate={() => {}}
      />
    </div>
  )
}