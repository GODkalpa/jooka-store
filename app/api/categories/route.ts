// Categories API routes
import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa/client';

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Outerwear', slug: 'outerwear', description: 'Structured jackets, puffers, and overcoats' },
  { id: 'cat-2', name: 'Sweatshirts', slug: 'sweatshirts', description: 'Heavyweight hoodies and crewnecks' },
  { id: 'cat-3', name: 'Shirts', slug: 'shirts', description: 'Combed cotton tees and streetwear tops' },
  { id: 'cat-4', name: 'Pants', slug: 'pants', description: 'Utility cargo pants and tailored trousers' },
  { id: 'cat-5', name: 'Merch', slug: 'merch', description: 'Capsule accessories and signature pieces' },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: DEFAULT_CATEGORIES,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', data: DEFAULT_CATEGORIES },
      { status: 500 }
    );
  }
}