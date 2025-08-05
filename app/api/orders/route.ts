// Orders API routes
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';
import { adminVariantService } from '@/lib/database/admin-variant-service';
import { calculateNepalTax } from '@/lib/utils/currency';
import { convertObjectDates } from '@/lib/utils/date';
import { z } from 'zod';

const createOrderSchema = z.object({
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    streetAddress1: z.string().min(1, 'Street address is required'),
    streetAddress2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().optional(), // Make optional for Nepal
    country: z.string().default('Nepal'),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    streetAddress1: z.string().min(1, 'Street address is required'),
    streetAddress2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().optional(), // Make optional for Nepal
    country: z.string().default('Nepal'),
    phone: z.string().optional(),
  }),
  paymentMethod: z.object({
    type: z.string().min(1, 'Payment method type is required'),
    provider: z.string().min(1, 'Payment provider is required'),
    paymentMethodId: z.string().min(1, 'Payment method ID is required'),
  }),
  cartItems: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
    selected_color: z.string().optional(),
    selected_size: z.string().optional(),
    product_image_url: z.string().optional(),
    variant_key: z.string().optional(),
  })).min(1, 'Cart must contain at least one item'),
});

async function getOrders(request: AuthenticatedRequest) {
  try {
    const userId = request.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = getAdminDb();

    // Get user-specific orders
    const ordersSnapshot = await db.collection('orders')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    const orders = [];
    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();
      
      // Get order items
      const itemsSnapshot = await db.collection('order_items')
        .where('order_id', '==', doc.id)
        .get();
      
      const items = itemsSnapshot.docs.map(itemDoc => 
        convertObjectDates({ id: itemDoc.id, ...itemDoc.data() })
      );

      orders.push({
        ...convertObjectDates({ id: doc.id, ...orderData }),
        items,
        items_count: items.length
      });
    }

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total: orders.length,
        totalPages: Math.ceil(orders.length / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

async function createOrder(request: AuthenticatedRequest) {
  try {
    console.log('DEBUG: Order creation API called');
    console.log('DEBUG: User authenticated:', request.user.id);

    const body = await request.json();
    console.log('DEBUG: Request body received:', JSON.stringify(body, null, 2));
    
    const validationResult = createOrderSchema.safeParse(body);
    console.log('DEBUG: Validation result:', validationResult.success);

    if (!validationResult.success) {
      console.error('DEBUG: Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    console.log('DEBUG: Validation passed, processing order...');
    const { shippingAddress, billingAddress, paymentMethod, cartItems, email, phone } = validationResult.data;
    const userId = request.user.id;

    // Initialize admin database service
    const adminDb = new FirebaseAdminDatabaseService();

    // Get product details for cart items and check variant stock
    const orderItems = [];
    const variantStockChecks = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      try {
        const productResult = await adminDb.getProduct(cartItem.product_id);
        if (productResult.error || !productResult.data) {
          return NextResponse.json(
            { error: `Product not found: ${cartItem.product_id}` },
            { status: 400 }
          );
        }

        const product = productResult.data;
        const unitPrice = product.price;
        const totalPrice = unitPrice * cartItem.quantity;

        subtotal += totalPrice;

        // If product tracks variants and has color/size selected, check variant stock
        if (product.track_variants && cartItem.selected_color && cartItem.selected_size) {
          variantStockChecks.push({
            product_id: cartItem.product_id,
            color: cartItem.selected_color,
            size: cartItem.selected_size,
            requested_quantity: cartItem.quantity
          });
        }

        orderItems.push({
          product_id: cartItem.product_id,
          product_name: product.name || 'Unknown Product',
          product_sku: product.sku || `SKU-${cartItem.product_id}`,
          quantity: cartItem.quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          product_image: cartItem.product_image_url || product.images?.[0]?.secure_url || null,
          selected_color: cartItem.selected_color || null,
          selected_size: cartItem.selected_size || null,
        });
      } catch (error) {
        console.error(`Error fetching product ${cartItem.product_id}:`, error);
        return NextResponse.json(
          { error: `Failed to fetch product details: ${cartItem.product_id}` },
          { status: 500 }
        );
      }
    }

    // Check variant stock availability if needed
    if (variantStockChecks.length > 0) {
      try {
        const stockCheckResult = await adminVariantService.checkVariantStock(variantStockChecks);
        
        if (stockCheckResult.error) {
          return NextResponse.json(
            { error: stockCheckResult.error },
            { status: 400 }
          );
        }

        if (!stockCheckResult.data?.available) {
          const unavailableVariants = stockCheckResult.data?.unavailable_variants || [];
          const variantNames = unavailableVariants.map(v => `${v.color} ${v.size}`).join(', ');
          
          return NextResponse.json(
            { 
              error: `Insufficient stock for variants: ${variantNames}`,
              unavailable_variants: unavailableVariants,
              variant_stock: stockCheckResult.data?.variant_stock
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('Variant stock check failed:', error);
        return NextResponse.json(
          { error: 'Failed to verify stock availability' },
          { status: 500 }
        );
      }
    }

    // Calculate tax and totals using Nepal tax calculation
    const taxCalculation = calculateNepalTax(subtotal);
    const shippingAmount = 0; // Free shipping for now
    const discountAmount = 0; // No discounts for now
    const totalAmount = taxCalculation.totalWithTax + shippingAmount - discountAmount;

    // Prepare order data for Firebase
    const orderData = {
      user_id: userId,
      status: 'pending' as const,
      payment_status: 'pending' as const,
      payment_method: 'cod' as const,
      subtotal,
      tax_amount: taxCalculation.taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      currency: 'NPR',
      shipping_address: {
        first_name: shippingAddress.firstName || '',
        last_name: shippingAddress.lastName || '',
        company: shippingAddress.company || null,
        address_line_1: shippingAddress.streetAddress1 || '',
        address_line_2: shippingAddress.streetAddress2 || null,
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postal_code: shippingAddress.postalCode || null,
        country: shippingAddress.country || 'Nepal',
        phone: shippingAddress.phone || null,
      },
      billing_address: billingAddress ? {
        first_name: billingAddress.firstName || '',
        last_name: billingAddress.lastName || '',
        company: billingAddress.company || null,
        address_line_1: billingAddress.streetAddress1 || '',
        address_line_2: billingAddress.streetAddress2 || null,
        city: billingAddress.city || '',
        state: billingAddress.state || '',
        postal_code: billingAddress.postalCode || null,
        country: billingAddress.country || 'Nepal',
        phone: billingAddress.phone || null,
      } : null,
      items: orderItems,
    } as any; // Type assertion to bypass strict typing for address structure

    // Create the order
    console.log('DEBUG: About to create order with data:', JSON.stringify(orderData, null, 2));
    const result = await adminDb.createOrder(orderData);
    console.log('DEBUG: Order creation result:', result);

    if (result.error) {
      console.error('Order creation failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    console.log('DEBUG: Order created successfully:', result.data?.id);

    // Reserve variant stock after successful order creation
    if (variantStockChecks.length > 0) {
      try {
        const reservationResult = await adminVariantService.reserveVariantStock(variantStockChecks);
        
        if (reservationResult.error) {
          console.error('Variant stock reservation failed:', reservationResult.error);
          // Note: Order was already created, so we log the error but don't fail the request
          // In a production system, you might want to implement compensation logic
        } else {
          console.log('Variant stock reserved successfully for order:', result.data?.id);
        }
      } catch (error) {
        console.error('Variant stock reservation error:', error);
        // Same as above - log but don't fail since order is already created
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: result.data!.id,
        orderNumber: result.data!.order_number,
        totalAmount: result.data!.total_amount,
        status: result.data!.status,
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getOrders);
export const POST = withAuth(createOrder);