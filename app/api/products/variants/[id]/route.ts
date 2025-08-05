import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = params.id

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      )
    }

    // This endpoint would typically return a specific product variant
    return NextResponse.json({ 
      id: variantId,
      name: 'Sample Variant',
      sku: 'VAR-001',
      price: 29.99,
      stock: 10
    })
  } catch (error) {
    console.error('Error fetching product variant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product variant' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = params.id
    const body = await request.json()

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      )
    }

    // This endpoint would typically update a product variant
    return NextResponse.json({ 
      id: variantId,
      ...body,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating product variant:', error)
    return NextResponse.json(
      { error: 'Failed to update product variant' },
      { status: 500 }
    )
  }
}