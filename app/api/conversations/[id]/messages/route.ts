import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { initializeAdmin } from '@/lib/firebase/admin';
import { CreateMessageData, Message } from '@/types/firebase';
import { MessagingEmailService } from '@/lib/email/messaging-email-service';

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

export async function POST(
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

    const body: CreateMessageData = await request.json();
    const { content, attachments, reply_to } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const conversationId = params.id;

    // Verify conversation exists and user has access
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conversation = conversationDoc.data();

    // Check permissions
    if (!isAdmin && conversation?.customer_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = Timestamp.now();

    // Create message (filter out undefined values)
    const messageData: any = {
      conversation_id: conversationId,
      sender_id: userId,
      sender_type: isAdmin ? 'admin' : 'customer',
      content: content.trim(),
      read: false,
      created_at: now,
      updated_at: now
    };

    // Only add optional fields if they're defined
    if (attachments) {
      messageData.attachments = attachments;
    }
    if (reply_to) {
      messageData.reply_to = reply_to;
    }

    const messageRef = await db.collection('messages').add(messageData);

    // Update conversation with last message info and unread counts
    const updateData: any = {
      last_message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      last_message_time: now,
      updated_at: now
    };

    // Update unread counts
    if (isAdmin) {
      updateData['unread_count.customer'] = FieldValue.increment(1);
      updateData['unread_count.admin'] = 0; // Admin just sent, so no unread for admin
    } else {
      updateData['unread_count.admin'] = FieldValue.increment(1);
      updateData['unread_count.customer'] = 0; // Customer just sent, so no unread for customer
    }

    // If conversation was closed, reopen it when new message is sent
    if (conversation?.status === 'closed') {
      updateData.status = 'open';
    }

    await conversationRef.update(updateData);

    // Send email notification to the recipient
    try {
      const messagingEmailService = new MessagingEmailService();
      
      // Get sender information
      let senderUser;
      let senderName = 'Unknown User';
      try {
        senderUser = await getAuth().getUser(userId);
        senderName = senderUser.displayName || senderUser.email?.split('@')[0] || 'User';
      } catch (error) {
        console.warn('Could not fetch sender user info:', error);
      }
      
      // Get recipient information
      let recipientEmail = '';
      let recipientName = '';
      
      if (isAdmin) {
        // Admin sent message, notify customer
        if (conversation?.customer_id) {
          try {
            const customerUser = await getAuth().getUser(conversation.customer_id);
            recipientEmail = customerUser.email || '';
            recipientName = customerUser.displayName || customerUser.email?.split('@')[0] || 'Customer';
          } catch (error) {
            console.warn('Could not fetch customer user info:', error);
          }
        }
      } else {
        // Customer sent message, notify admin(s)
        // For now, we'll send to a general admin email or the assigned admin
        if (conversation?.admin_id) {
          try {
            const adminUser = await getAuth().getUser(conversation.admin_id);
            recipientEmail = adminUser.email || '';
            recipientName = adminUser.displayName || 'Admin';
          } catch (error) {
            console.warn('Could not fetch admin user info:', error);
          }
        } else {
          // No specific admin assigned, send to general admin notification email
          recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || '';
          recipientName = 'Support Team';
          
          if (recipientEmail) {
            console.log('Sending notification to general admin email:', recipientEmail);
          } else {
            console.log('No admin notification email configured, skipping notification');
          }
        }
      }
      
      // Send notification if we have a recipient email
      if (recipientEmail) {
        await messagingEmailService.sendMessageNotification({
          recipientEmail,
          recipientName,
          senderName,
          senderType: isAdmin ? 'admin' : 'customer',
          subject: conversation?.subject || 'Message Notification',
          messageContent: content.trim(),
          conversationId,
          conversationSubject: conversation?.subject || 'Support Conversation'
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the message creation
      console.error('Failed to send email notification:', emailError);
    }

    // Return the created message
    const createdMessage = {
      id: messageRef.id,
      ...messageData
    };

    return NextResponse.json({ 
      data: createdMessage,
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getFirestore();
    const conversationId = params.id;

    // Verify conversation exists and user has access
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();

    if (!conversationDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conversation = conversationDoc.data();

    // Check permissions
    if (!isAdmin && conversation?.customer_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messagesQuery = db.collection('messages')
      .where('conversation_id', '==', conversationId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const snapshot = await messagesQuery.get();
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse(); // Reverse to show oldest first

    // Get total count
    const totalSnapshot = await db.collection('messages')
      .where('conversation_id', '==', conversationId)
      .count()
      .get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      data: messages,
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
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}