// Customer Support Conversations API Route (In-Memory / Local Store)
import { NextRequest, NextResponse } from 'next/server';

// Store support conversations in memory
const conversationsStore: any[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      data: conversationsStore,
      pagination: {
        page: 1,
        limit: 20,
        total: conversationsStore.length,
        has_more: false
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newConversation = {
      id: `conv_${Date.now()}`,
      subject: body.subject || 'Support Query',
      category: body.category || 'general',
      priority: body.priority || 'medium',
      status: 'open',
      customer_id: 'usr_jooka',
      customer_email: body.guest_email || 'customer@jooka.com',
      customer_name: 'Customer User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      last_message_snippet: body.initial_message || '',
      unread_count_customer: 0,
      unread_count_admin: 1,
      messages: body.initial_message ? [
        {
          id: `msg_${Date.now()}`,
          conversation_id: `conv_${Date.now()}`,
          sender_id: 'usr_jooka',
          sender_type: 'customer',
          sender_name: 'Customer User',
          content: body.initial_message,
          created_at: new Date().toISOString(),
          is_internal: false
        }
      ] : []
    };

    conversationsStore.unshift(newConversation);

    return NextResponse.json({
      message: 'Conversation created successfully',
      data: newConversation
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}