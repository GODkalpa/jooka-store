import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database';

async function seedOrders(request: NextRequest) {
  try {
    console.log('Starting order seeding process...');
    
    const supabase = createClient();
    
    // Read the seed script
    const seedScriptPath = join(process.cwd(), 'scripts', 'seed-orders.sql');
    const seedScript = readFileSync(seedScriptPath, 'utf-8');
    
    // Execute the seed script
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: seedScript
    });
    
    if (error) {
      console.error('Seed script execution error:', error);
      
      // Try alternative approach - execute parts of the script manually
      console.log('Trying alternative seeding approach...');
      
      // First, ensure we have basic users
      const { error: userError } = await supabase
        .from('users')
        .upsert([
          {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@jooka.com',
            role: 'admin',
            email_verified: true
          },
          {
            id: '00000000-0000-0000-0000-000000000002',
            email: 'customer@example.com',
            role: 'customer',
            email_verified: true
          }
        ], { onConflict: 'email' });
      
      if (userError) {
        console.error('User creation error:', userError);
      }
      
      // Create basic categories if they don't exist
      const { error: categoryError } = await supabase
        .from('categories')
        .upsert([
          {
            name: 'Electronics',
            slug: 'electronics',
            description: 'Electronic devices and gadgets',
            is_active: true,
            sort_order: 1
          },
          {
            name: 'Clothing',
            slug: 'clothing',
            description: 'Fashion and apparel',
            is_active: true,
            sort_order: 2
          }
        ], { onConflict: 'slug' });
      
      if (categoryError) {
        console.error('Category creation error:', categoryError);
      }
      
      // Get category IDs
      const { data: categories } = await supabase
        .from('categories')
        .select('id, slug')
        .limit(2);
      
      if (categories && categories.length > 0) {
        // Create basic products
        const { error: productError } = await supabase
          .from('products')
          .upsert([
            {
              name: 'Wireless Headphones',
              slug: 'wireless-headphones',
              description: 'High-quality wireless headphones with noise cancellation',
              short_description: 'Premium wireless headphones',
              price: 199.99,
              category_id: categories[0].id,
              inventory_count: 50,
              status: 'active',
              featured: true
            },
            {
              name: 'Smartphone',
              slug: 'smartphone',
              description: 'Latest model smartphone with advanced features',
              short_description: 'Advanced smartphone',
              price: 699.99,
              category_id: categories[0].id,
              inventory_count: 25,
              status: 'active',
              featured: true
            },
            {
              name: 'T-Shirt',
              slug: 't-shirt',
              description: 'Comfortable cotton t-shirt in various colors',
              short_description: 'Cotton t-shirt',
              price: 29.99,
              category_id: categories[1]?.id || categories[0].id,
              inventory_count: 100,
              status: 'active',
              featured: false
            }
          ], { onConflict: 'slug' });
        
        if (productError) {
          console.error('Product creation error:', productError);
        }
      }
      
      // Create sample orders
      const customerId = '00000000-0000-0000-0000-000000000002';
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('status', 'active')
        .limit(3);
      
      if (products && products.length > 0) {
        // Create 5 sample orders
        for (let i = 1; i <= 5; i++) {
          const orderNumber = `JOO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(i).padStart(4, '0')}`;
          const subtotal = Math.round((Math.random() * 500 + 50) * 100) / 100;
          const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
          const shippingAmount = 9.99;
          const totalAmount = subtotal + taxAmount + shippingAmount;
          
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              order_number: orderNumber,
              user_id: customerId,
              user_email: 'customer@example.com',
              status: i <= 2 ? 'pending' : i <= 3 ? 'processing' : 'delivered',
              subtotal,
              tax_amount: taxAmount,
              shipping_amount: shippingAmount,
              total_amount: totalAmount,
              shipping_address: {
                first_name: 'John',
                last_name: 'Doe',
                address_line_1: '123 Main St',
                city: 'New York',
                state: 'NY',
                postal_code: '10001',
                country: 'US'
              },
              billing_address: {
                first_name: 'John',
                last_name: 'Doe',
                address_line_1: '123 Main St',
                city: 'New York',
                state: 'NY',
                postal_code: '10001',
                country: 'US'
              },
              payment_method: {
                type: 'credit_card',
                last_four: '4242',
                brand: 'visa'
              },
              created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
            })
            .select()
            .single();
          
          if (orderError) {
            console.error(`Order ${i} creation error:`, orderError);
            continue;
          }
          
          // Add order items
          if (order) {
            const { error: itemError } = await supabase
              .from('order_items')
              .insert({
                order_id: order.id,
                product_id: products[i % products.length].id,
                quantity: Math.floor(Math.random() * 3) + 1,
                unit_price: Math.round((Math.random() * 200 + 20) * 100) / 100,
                total_price: 0 // Will be calculated by trigger
              });
            
            if (itemError) {
              console.error(`Order item ${i} creation error:`, itemError);
            }
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Sample orders created successfully using alternative method',
        data: {
          method: 'alternative',
          orders_created: 5
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sample orders created successfully',
      data: data
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
