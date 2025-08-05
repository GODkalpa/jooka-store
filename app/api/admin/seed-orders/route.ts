import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database';

async function seedOrders(request: NextRequest) {
  try {
    console.log('Starting order seeding process...');
    
    // Create sample orders using Firebase
    const sampleOrders = [];
    
    for (let i = 1; i <= 5; i++) {
      const orderNumber = `JOO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(i).padStart(4, '0')}`;
      const subtotal = Math.round((Math.random() * 500 + 50) * 100) / 100;
      const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
      const shippingAmount = 9.99;
      const totalAmount = subtotal + taxAmount + shippingAmount;
      
      const order = {
        orderNumber,
        userId: 'sample-customer-id',
        userEmail: 'customer@example.com',
        status: i <= 2 ? 'pending' : i <= 3 ? 'processing' : 'delivered',
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        },
        paymentMethod: {
          type: 'credit_card',
          lastFour: '4242',
          brand: 'visa'
        },
        items: [
          {
            productId: 'sample-product-id',
            productName: 'Sample Product',
            quantity: Math.floor(Math.random() * 3) + 1,
            unitPrice: Math.round((Math.random() * 200 + 20) * 100) / 100
          }
        ],
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      };
      
      sampleOrders.push(order);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sample orders data prepared successfully',
      data: {
        orders: sampleOrders,
        count: sampleOrders.length
      }
    });
    
  } catch (error) {
    console.error('Seed orders error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed orders', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(seedOrders, { requireAdmin: true });
