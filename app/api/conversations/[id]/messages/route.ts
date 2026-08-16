import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const newMessage = {
      id: `msg_${Date.now()}`,
      conversation_id: params.id,
      sender_id: 'usr_jooka',
      sender_type: 'customer',
      sender_name: 'Customer User',
      content: body.content,
      created_at: new Date().toISOString(),
      is_internal: false
    };

    return NextResponse.json({
      message: 'Message sent successfully',
      data: newMessage
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}