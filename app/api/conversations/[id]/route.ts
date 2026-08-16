import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = {
      id: params.id,
      subject: 'Support Inquiry',
      category: 'general',
      priority: 'medium',
      status: 'open',
      customer_id: 'usr_jooka',
      customer_email: 'customer@jooka.com',
      customer_name: 'Customer User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: `msg_1`,
          conversation_id: params.id,
          sender_id: 'usr_jooka',
          sender_type: 'customer',
          sender_name: 'Customer User',
          content: 'Hello, I have a question about my recent order.',
          created_at: new Date().toISOString(),
          is_internal: false
        },
        {
          id: `msg_2`,
          conversation_id: params.id,
          sender_id: 'admin_1',
          sender_type: 'support',
          sender_name: 'JOOKA Support',
          content: 'Hi there! We would be happy to help you. What is your order number?',
          created_at: new Date().toISOString(),
          is_internal: false
        }
      ]
    };

    return NextResponse.json({
      data: conversation
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}