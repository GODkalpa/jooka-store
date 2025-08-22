import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase/admin';
import { 
  Conversation, 
  CreateConversationData, 
  ConversationFilters,
  ConversationWithMessages 
} from '@/types/firebase';

// Initialize Firebase Admin
initializeAdmin();

// Helper function to check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.exists && userDoc.data()?.role === 'admin';
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const db = getFirestore();
    
    // Parse query parameters
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority') as any;
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // Check if user is admin
    const isAdmin = await isUserAdmin(userId);

    let query: any = db.collection('conversations');

    // Apply filters based on user role
    if (isAdmin) {
      // Admin can see all conversations or filter by customer
      const customerId = searchParams.get('customer_id');
      if (customerId) {
        query = query.where('customer_id', '==', customerId);
      }
    } else {
      // Customer can only see their own conversations
      query = query.where('customer_id', '==', userId);
    }

    // Apply additional filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (priority) {
      query = query.where('priority', '==', priority);
    }
    if (category) {
      query = query.where('category', '==', category);
    }

    // Add pagination - temporarily simplified to avoid index requirement
    query = query.limit(limit);
    
    // If we need ordering, we'll do it in memory for now
    const snapshot = await query.get();
    let conversations: ConversationWithMessages[] = [];

    for (const doc of snapshot.docs) {
      const { id, ...data } = { id: doc.id, ...doc.data() } as Conversation;
      
      // Get customer email for admin view
      let customerEmail = '';
      if (isAdmin && data.customer_id) {
        try {
          const customerUser = await getAuth().getUser(data.customer_id);
          customerEmail = customerUser.email || '';
        } catch (error) {
          console.error('Error fetching customer email:', error);
        }
      }

      conversations.push({
        id: doc.id,
        ...data,
        customer_email: customerEmail
      } as ConversationWithMessages);
    }

    // Sort by last_message_time in memory and apply pagination
    conversations.sort((a, b) => {
      let aTime: Date;
      let bTime: Date;
      
      // Handle different timestamp formats
      if (a.last_message_time?.toDate) {
        aTime = a.last_message_time.toDate();
      } else if (a.last_message_time) {
        aTime = new Date(a.last_message_time as any);
      } else {
        aTime = new Date(0);
      }
      
      if (b.last_message_time?.toDate) {
        bTime = b.last_message_time.toDate();
      } else if (b.last_message_time) {
        bTime = new Date(b.last_message_time as any);
      } else {
        bTime = new Date(0);
      }
      
      return bTime.getTime() - aTime.getTime();
    });

    // Apply pagination
    const total = conversations.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    conversations = conversations.slice(startIndex, endIndex);

    return NextResponse.json({
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body: CreateConversationData = await request.json();
    const { subject, category, priority = 'medium', initial_message, order_id } = body;

    // Validate required fields
    if (!subject || !initial_message || !category) {
      return NextResponse.json(
        { error: 'Subject, category, and initial message are required' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const now = Timestamp.now();

    // Create conversation (filter out undefined values)
    const conversationData: any = {
      customer_id: userId,
      subject,
      status: 'open',
      priority,
      category,
      last_message: initial_message.substring(0, 100) + (initial_message.length > 100 ? '...' : ''),
      last_message_time: now,
      unread_count: {
        customer: 0,
        admin: 1
      },
      created_at: now,
      updated_at: now
    };

    // Only add order_id if it's defined
    if (order_id) {
      conversationData.order_id = order_id;
    }

    const conversationRef = await db.collection('conversations').add(conversationData);

    // Create initial message
    const messageData = {
      conversation_id: conversationRef.id,
      sender_id: userId,
      sender_type: 'customer' as const,
      content: initial_message,
      read: false,
      created_at: now,
      updated_at: now
    };

    await db.collection('messages').add(messageData);

    // Return the created conversation
    const createdConversation = {
      id: conversationRef.id,
      ...conversationData
    };

    return NextResponse.json({ 
      data: createdConversation,
      message: 'Conversation created successfully' 
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}