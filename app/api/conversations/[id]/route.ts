import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase/admin';
import { 
  Conversation, 
  UpdateConversationData, 
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== Loading conversation: ${params.id} ===`);
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const isAdmin = await isUserAdmin(userId);

    console.log(`✅ User authenticated: ${userId}, isAdmin: ${isAdmin}`);

    const db = getFirestore();
    const conversationRef = db.collection('conversations').doc(params.id);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      console.log(`❌ Conversation ${params.id} not found`);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conversation = { id: conversationDoc.id, ...conversationDoc.data() } as Conversation;
    console.log(`✅ Conversation found: ${conversation.subject}`);

    // Check permissions - customers can only see their own conversations
    if (!isAdmin && conversation.customer_id !== userId) {
      console.log(`❌ Access denied - user ${userId} cannot access conversation owned by ${conversation.customer_id}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages for this conversation
    console.log(`Loading messages for conversation ${params.id}`);
    const messagesSnapshot = await db.collection('messages')
      .where('conversation_id', '==', params.id)
      .orderBy('created_at', 'asc')
      .get();

    const messages: any[] = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${messages.length} messages`);

    // Get customer and admin emails
    let customerEmail = '';
    let adminEmail = '';

    try {
      if (conversation.customer_id) {
        const customerUser = await getAuth().getUser(conversation.customer_id);
        customerEmail = customerUser.email || '';
      }
      if (conversation.admin_id) {
        const adminUser = await getAuth().getUser(conversation.admin_id);
        adminEmail = adminUser.email || '';
      }
    } catch (emailError) {
      console.error('❌ Error fetching user emails:', emailError);
      // Don't fail the entire request if email fetching fails
    }

    // Mark messages as read for the current user
    const unreadMessages = messages.filter(msg => 
      !msg.read && 
      msg.sender_id !== userId
    );

    if (unreadMessages.length > 0) {
      const batch = db.batch();
      
      // Mark messages as read
      unreadMessages.forEach(msg => {
        const msgRef = db.collection('messages').doc(msg.id);
        batch.update(msgRef, { read: true });
      });

      // Update conversation unread count
      const updateData: any = {};
      if (isAdmin) {
        updateData['unread_count.admin'] = 0;
      } else {
        updateData['unread_count.customer'] = 0;
      }
      batch.update(conversationRef, updateData);

      await batch.commit();
    }

    const result: ConversationWithMessages = {
      ...conversation,
      messages,
      customer_email: customerEmail,
      admin_email: adminEmail,
      messages_count: messages.length
    };

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error(`❌ Error fetching conversation ${params.id}:`, error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json(
      { 
        error: 'Failed to fetch conversation',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          conversationId: params.id
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const isAdmin = await isUserAdmin(userId);

    // Only admins can update conversation status
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body: UpdateConversationData = await request.json();
    const { status, priority, admin_id } = body;

    const db = getFirestore();
    const conversationRef = db.collection('conversations').doc(params.id);
    
    const conversationDoc = await conversationRef.get();
    if (!conversationDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const updateData: any = {
      updated_at: Timestamp.now()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (admin_id) updateData.admin_id = admin_id;

    await conversationRef.update(updateData);

    const updatedDoc = await conversationRef.get();
    const updatedConversation = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ 
      data: updatedConversation,
      message: 'Conversation updated successfully' 
    });

  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}