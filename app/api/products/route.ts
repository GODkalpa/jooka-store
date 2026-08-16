// Products API routes connected to Medusa Backend Engine
import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa/client';

const FALLBACK_PRODUCTS = [
  {
    id: 'mock-1',
    name: 'JOOKA Heavyweight Utility Puffer Jacket',
    slug: 'jooka-heavyweight-utility-puffer-jacket',
    price: 4999,
    originalPrice: 8499,
    description: 'Constructed from a matte Japanese ripstop shell with 700-fill down alternative insulation.',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80',
    images: [{ id: '1', secure_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80', is_primary: true }],
    category: { name: 'Outerwear' },
    badge: 'Limited Edition',
    status: 'active',
  },
  {
    id: 'mock-2',
    name: 'JOOKA Luxe Oversized Fleece Hoodie',
    slug: 'jooka-luxe-oversized-fleece-hoodie',
    price: 2999,
    originalPrice: 4999,
    description: 'Custom milled 450 GSM organic French terry cotton with structured hood.',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80',
    images: [{ id: '2', secure_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80', is_primary: true }],
    category: { name: 'Sweatshirts' },
    badge: 'Heavyweight 450 GSM',
    status: 'active',
  },
  {
    id: 'mock-3',
    name: 'JOOKA Vintage Washed Heavy Denim Jacket',
    slug: 'jooka-vintage-washed-heavy-denim-jacket',
    price: 3899,
    originalPrice: 6200,
    description: '14oz rigid Japanese raw denim with hand-distressed vintage wash.',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80',
    images: [{ id: '3', secure_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80', is_primary: true }],
    category: { name: 'Outerwear' },
    badge: 'Archive Piece',
    status: 'active',
  },
  {
    id: 'mock-4',
    name: 'JOOKA Premium Drop Shoulder Graphic Tee',
    slug: 'jooka-premium-drop-shoulder-graphic-tee',
    price: 1699,
    originalPrice: 2999,
    description: '280 GSM luxury combed cotton with high-density archival screen print.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
    images: [{ id: '4', secure_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80', is_primary: true }],
    category: { name: 'Shirts' },
    badge: 'Pre-Shrunk Cotton',
    status: 'active',
  },
  {
    id: 'mock-5',
    name: 'JOOKA Tailored Relaxed Fit Cargo Pants',
    slug: 'jooka-tailored-relaxed-fit-cargo-pants',
    price: 3299,
    originalPrice: 5499,
    description: 'Heavyweight cotton twill with articulated knees and discreet 3D cargo pockets.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    images: [{ id: '5', secure_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80', is_primary: true }],
    category: { name: 'Pants' },
    badge: 'Custom Hardware',
    status: 'active',
  },
  {
    id: 'mock-6',
    name: 'JOOKA Classic Wool Blend Oversized Coat',
    slug: 'jooka-classic-wool-blend-oversized-coat',
    price: 6499,
    originalPrice: 10999,
    description: 'Double-breasted Italian wool blend overcoat with satin lining.',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    images: [{ id: '6', secure_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', is_primary: true }],
    category: { name: 'Outerwear' },
    badge: 'Winter Capsule',
    status: 'active',
  },
  {
    id: 'mock-7',
    name: 'JOOKA Streetwear Essential Crewneck Sweater',
    slug: 'jooka-streetwear-essential-crewneck-sweater',
    price: 2499,
    originalPrice: 3999,
    description: '400 GSM heavyweight brushed fleece with ribbed collar and hem.',
    image: 'https://images.unsplash.com/photo-1620799140408-edc0dcb6d633?w=600&q=80',
    images: [{ id: '7', secure_url: 'https://images.unsplash.com/photo-1620799140408-edc0dcb6d633?w=600&q=80', is_primary: true }],
    category: { name: 'Sweatshirts' },
    badge: 'Core Edition',
    status: 'active',
  },
  {
    id: 'mock-8',
    name: 'JOOKA Urban Explorer Waterproof Parka',
    slug: 'jooka-urban-explorer-waterproof-parka',
    price: 5499,
    originalPrice: 8999,
    description: '3-layer waterproof breathable membrane with sealed seams.',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80',
    images: [{ id: '8', secure_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80', is_primary: true }],
    category: { name: 'Outerwear' },
    badge: 'Technical Shell',
    status: 'active',
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Try fetching products from Medusa backend first
    try {
      const medusaResult = await medusaClient.getProducts({ limit });
      if (medusaResult && medusaResult.products && medusaResult.products.length > 0) {
        const transformedData = medusaResult.products.map((p: any) => {
          const variant = p.variants?.[0];
          const firstVariantPrice =
            variant?.calculated_price?.calculated_amount ??
            variant?.prices?.[0]?.amount ??
            4500;
          const images = (p.images || []).map((img: any) => ({
            id: img.id,
            secure_url: img.url || p.thumbnail,
            is_primary: true,
          }));

          return {
            id: p.id,
            name: p.title,
            slug: p.handle,
            description: p.description,
            price: firstVariantPrice,
            images: images.length > 0 ? images : [{ secure_url: p.thumbnail, is_primary: true }],
            status: 'active',
            category: { name: p.categories?.[0]?.name || p.category?.name || 'Shirts' },
            colors: (p.options?.find((opt: any) => opt.title === 'Color')?.values || []).map((v: any) => typeof v === 'string' ? v : v?.value || String(v)),
            sizes: (p.options?.find((opt: any) => opt.title === 'Size')?.values || []).map((v: any) => typeof v === 'string' ? v : v?.value || String(v)),
          };
        });

        return NextResponse.json({
          success: true,
          data: transformedData,
          total: medusaResult.count || transformedData.length,
          source: 'medusa',
        });
      }
    } catch (medusaError) {
      console.warn('Medusa store fetch warning (using fallback catalog):', (medusaError as Error).message);
    }

    return NextResponse.json({
      success: true,
      data: FALLBACK_PRODUCTS.slice(0, limit),
      total: FALLBACK_PRODUCTS.length,
      source: 'catalog',
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', data: FALLBACK_PRODUCTS },
      { status: 500 }
    );
  }
}