// Orders API routes - Server-side price verification and Medusa integration
import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || searchParams.get('user_id') || undefined;
    const userEmail = searchParams.get('email') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;

    const result = OrderService.getOrders({
      userId,
      userEmail,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.page < result.totalPages,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders', data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawItems = body.cartItems || body.items || [];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty', success: false }, { status: 400 });
    }

    const items = rawItems.map((item: any) => ({
      product_id: item.id || item.productId || item.product_id,
      product_name: item.name || item.product_name,
      product_slug: item.slug || item.product_slug,
      quantity: item.quantity || 1,
      unit_price: item.price || item.unit_price,
      selected_color: item.color || item.selected_color,
      selected_size: item.size || item.selected_size,
      product_image: item.image || item.product_image,
      product_image_url: item.image || item.product_image_url || item.colorImageUrl,
    }));

    const result = await OrderService.createOrder({
      userId: body.userId || body.user_id,
      userEmail: body.email || body.userEmail || body.shippingAddress?.email,
      items,
      shippingAddress: body.shippingAddress || body.address || {},
      billingAddress: body.billingAddress || body.shippingAddress || body.address || {},
      shippingZone: body.shippingMethod?.zoneId || body.shippingZone,
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to create order', success: false }, { status: 400 });
    }

    const createdOrder = result.data;
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      id: createdOrder.id,
      order: {
        id: createdOrder.id,
        orderNumber: createdOrder.order_number,
        totalAmount: createdOrder.total_amount,
        subtotal: createdOrder.subtotal,
        shippingAmount: createdOrder.shipping_amount,
        taxAmount: createdOrder.tax_amount,
        status: createdOrder.status,
      },
      data: createdOrder,
    });
  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}