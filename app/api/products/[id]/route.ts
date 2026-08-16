import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa/client';
import fs from 'fs';
import path from 'path';

let mockProductsCache: any[] | null = null;
function getMockProducts(): any[] {
  if (mockProductsCache) return mockProductsCache;
  try {
    const candidatePath = path.join(process.cwd(), 'scripts', 'mock-products-export.json');
    if (fs.existsSync(candidatePath)) {
      const raw = fs.readFileSync(candidatePath, 'utf-8');
      const data = JSON.parse(raw);
      mockProductsCache = data.products || [];
      return mockProductsCache || [];
    }
  } catch (err) {
    // Ignore error
  }
  return [];
}

const FALLBACK_PRODUCTS = [
  {
    id: 'mock-1',
    name: 'JOOKA Heavyweight Utility Puffer Jacket',
    slug: 'jooka-heavyweight-utility-puffer-jacket',
    price: 4999,
    description: 'Constructed from a matte Japanese ripstop shell with 700-fill down alternative insulation. Engineered for high-altitude wind resistance and tailored street aesthetics.',
    short_description: 'Matte ripstop insulated jacket with double-pull YKK hardware.',
    status: 'active',
    images: [{ id: '1', secure_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=1200&q=80', is_primary: true }],
    colors: ['Onyx Black', 'Stone Gray', 'Olive Drab'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: { id: 'c1', name: 'Outerwear' },
  },
  {
    id: 'mock-2',
    name: 'JOOKA Luxe Oversized Fleece Hoodie',
    slug: 'jooka-luxe-oversized-fleece-hoodie',
    price: 2999,
    description: 'Custom milled 450 GSM organic French terry cotton. Features a double-layer structured hood, blind seam cuffs, and subtle tonal chest embroidery.',
    short_description: '450 GSM heavyweight cotton hoodie in oversized relaxed silhouette.',
    status: 'active',
    images: [{ id: '2', secure_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1200&q=80', is_primary: true }],
    colors: ['Vintage Washed Black', 'Off-White', 'Muted Mocha'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: { id: 'c2', name: 'Sweatshirts' },
  },
  {
    id: 'mock-3',
    name: 'JOOKA Vintage Washed Heavy Denim Jacket',
    slug: 'jooka-vintage-washed-heavy-denim-jacket',
    price: 3899,
    description: '14oz rigid Japanese raw denim with hand-distressed vintage wash. Custom embossed gunmetal hardware with dropped shoulder profile.',
    short_description: '14oz structured denim jacket with custom metal rivets.',
    status: 'active',
    images: [{ id: '3', secure_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1200&q=80', is_primary: true }],
    colors: ['Washed Indigo', 'Faded Charcoal'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: { id: 'c1', name: 'Outerwear' },
  },
  {
    id: 'mock-4',
    name: 'JOOKA Premium Drop Shoulder Graphic Tee',
    slug: 'jooka-premium-drop-shoulder-graphic-tee',
    price: 1699,
    description: '280 GSM luxury combed cotton with high-density archival screen print. Pre-shrunk boxy cut with thick 1-inch ribbed collar.',
    short_description: '280 GSM heavyweight cotton boxy streetwear tee.',
    status: 'active',
    images: [{ id: '4', secure_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80', is_primary: true }],
    colors: ['Pitch Black', 'Raw Cream', 'Sage Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: { id: 'c3', name: 'Shirts' },
  },
  {
    id: 'mock-5',
    name: 'JOOKA Tailored Relaxed Fit Cargo Pants',
    slug: 'jooka-tailored-relaxed-fit-cargo-pants',
    price: 3299,
    description: 'Heavyweight cotton twill with articulated knees and discreet 3D cargo pockets. Adjustable toggle hem allowing transition between wide and tapered cuffs.',
    short_description: 'Articulated utility cargo trousers with toggle-cinch ankles.',
    status: 'active',
    images: [{ id: '5', secure_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=80', is_primary: true }],
    colors: ['Deep Olive', 'Shadow Black', 'Desert Tan'],
    sizes: ['30', '32', '34', '36'],
    category: { id: 'c4', name: 'Pants' },
  },
  {
    id: 'mock-6',
    name: 'JOOKA Classic Wool Blend Oversized Coat',
    slug: 'jooka-classic-wool-blend-oversized-coat',
    price: 6499,
    description: 'Double-breasted Italian wool blend overcoat with satin lining. Clean notched lapels and rear center vent.',
    short_description: 'Italian wool blend overcoat with tailored dropped shoulders.',
    status: 'active',
    images: [{ id: '6', secure_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200&q=80', is_primary: true }],
    colors: ['Camel Beige', 'Midnight Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: { id: 'c1', name: 'Outerwear' },
  },
  {
    id: 'mock-7',
    name: 'JOOKA Streetwear Essential Crewneck Sweater',
    slug: 'jooka-streetwear-essential-crewneck-sweater',
    price: 2499,
    description: '400 GSM heavyweight brushed fleece with ribbed collar, hem, and side gussets for enhanced drape and movement.',
    short_description: '400 GSM brushed fleece minimal crewneck.',
    status: 'active',
    images: [{ id: '7', secure_url: 'https://images.unsplash.com/photo-1620799140408-edc0dcb6d633?w=1200&q=80', is_primary: true }],
    colors: ['Heather Gray', 'Black', 'Forest Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: { id: 'c2', name: 'Sweatshirts' },
  },
  {
    id: 'mock-8',
    name: 'JOOKA Urban Explorer Waterproof Parka',
    slug: 'jooka-urban-explorer-waterproof-parka',
    price: 5499,
    description: '3-layer waterproof breathable membrane with sealed seams, storm flap closure, and multiple concealed gear pockets.',
    short_description: 'Fully seam-sealed waterproof technical storm parka.',
    status: 'active',
    images: [{ id: '8', secure_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1200&q=80', is_primary: true }],
    colors: ['Matte Black', 'Arctic Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: { id: 'c1', name: 'Outerwear' },
  },
];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    // 1. Try fetching from Medusa first
    try {
      const medusaResult = await medusaClient.getProducts({ limit: 100 });
      if (medusaResult && medusaResult.products) {
        const found = medusaResult.products.find(
          (p: any) => p.id === productId || p.handle === productId
        );

        if (found) {
          const variant = found.variants?.[0];
          const firstVariantPrice =
            variant?.calculated_price?.calculated_amount ??
            variant?.prices?.[0]?.amount ??
            4500;
          const mockList = getMockProducts();
          const mockProduct = mockList.find((p: any) =>
            p.name?.toLowerCase() === found.title?.toLowerCase() ||
            found.handle?.includes(p.slug)
          );

          const images = (found.images || []).map((img: any, idx: number) => {
            const matchedMockImg =
              mockProduct?.images?.[idx] ||
              mockProduct?.images?.find((m: any) => m.secure_url === img.url);
            return {
              id: img.id,
              secure_url: img.url || found.thumbnail,
              color: matchedMockImg?.color || undefined,
              is_primary: idx === 0,
            };
          });

          const variants = (found.variants || []).map((v: any) => {
            const price =
              v.calculated_price?.calculated_amount ??
              v.prices?.[0]?.amount ??
              firstVariantPrice;
            let color = '';
            let size = '';
            if (v.options) {
              if (Array.isArray(v.options)) {
                const colorOpt = v.options.find((o: any) => o.option?.title === 'Color' || o.title === 'Color');
                const sizeOpt = v.options.find((o: any) => o.option?.title === 'Size' || o.title === 'Size');
                color = colorOpt?.value || '';
                size = sizeOpt?.value || '';
              } else if (typeof v.options === 'object') {
                color = v.options.Color || v.options.color || '';
                size = v.options.Size || v.options.size || '';
              }
            }
            return {
              id: v.id,
              title: v.title,
              sku: v.sku,
              color,
              size,
              price,
              inventory_quantity: v.inventory_quantity ?? 100,
            };
          });

          return NextResponse.json({
            id: found.id,
            name: found.title,
            slug: found.handle,
            description: found.description,
            short_description: found.description,
            price: firstVariantPrice,
            images: images.length > 0 ? images : [{ id: '1', secure_url: found.thumbnail, is_primary: true }],
            status: 'active',
            category: { id: 'c1', name: (found as any).categories?.[0]?.name || 'Capsule 01' },
            colors: (found.options?.find((opt: any) => opt.title === 'Color')?.values || []).map((v: any) => typeof v === 'string' ? v : v?.value || String(v)),
            sizes: (found.options?.find((opt: any) => opt.title === 'Size')?.values || []).map((v: any) => typeof v === 'string' ? v : v?.value || String(v)),
            variants,
          });
        }
      }
    } catch (medusaError) {
      console.warn('Medusa single product fetch warning:', (medusaError as Error).message);
    }

    // 2. Fallback to static catalog
    const fallback = FALLBACK_PRODUCTS.find(p => p.id === productId || p.slug === productId);
    if (fallback) {
      return NextResponse.json(fallback);
    }

    const mockList = getMockProducts();
    const foundInMock = mockList.find(p => p.id === productId || p.slug === productId);
    if (foundInMock) {
      return NextResponse.json(foundInMock);
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}