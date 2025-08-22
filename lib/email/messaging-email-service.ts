// Email notification service for messaging system
// Sends email notifications when messages are exchanged between customers and admins

import { EmailService } from './email-service';

interface MessageNotificationData {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  senderType: 'customer' | 'admin';
  subject: string;
  messageContent: string;
  conversationId: string;
  conversationSubject: string;
}

export class MessagingEmailService {
  private emailService: EmailService;

  constructor() {
    this.emailService = EmailService.getInstance();
  }

  async sendMessageNotification(data: MessageNotificationData): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        recipientEmail,
        recipientName,
        senderName,
        senderType,
        messageContent,
        conversationId,
        conversationSubject
      } = data;

      // Generate email content based on sender type
      const isAdminRecipient = senderType === 'customer';
      const subject = isAdminRecipient 
        ? `New Customer Message: ${conversationSubject}`
        : `New Admin Response: ${conversationSubject}`;

      const html = this.generateMessageNotificationHTML({
        recipientName,
        senderName,
        senderType,
        messageContent,
        conversationId,
        conversationSubject,
        isAdminRecipient
      });

      const text = this.generateMessageNotificationText({
        recipientName,
        senderName,
        senderType,
        messageContent,
        conversationSubject,
        isAdminRecipient
      });

      const result = await this.emailService.sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
      });

      if (result.success) {
        console.log(`📧 Message notification sent to ${recipientEmail} for conversation ${conversationId}`);
      } else {
        console.error(`❌ Failed to send message notification: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending message notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateMessageNotificationHTML({
    recipientName,
    senderName,
    senderType,
    messageContent,
    conversationId,
    conversationSubject,
    isAdminRecipient
  }: {
    recipientName?: string;
    senderName: string;
    senderType: 'customer' | 'admin';
    messageContent: string;
    conversationId: string;
    conversationSubject: string;
    isAdminRecipient: boolean;
  }): string {
    const truncatedMessage = messageContent.length > 200 
      ? messageContent.substring(0, 200) + '...' 
      : messageContent;

    const dashboardUrl = isAdminRecipient 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/support`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/messages`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message Notification</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); 
      color: #D4AF37; 
      padding: 30px; 
      text-align: center; 
      border-radius: 8px 8px 0 0; 
    }
    .content { 
      background: #f8f9fa; 
      padding: 30px; 
      border-radius: 0 0 8px 8px; 
      border: 1px solid #e9ecef; 
    }
    .message-box { 
      background: white; 
      padding: 20px; 
      border-left: 4px solid #D4AF37; 
      margin: 20px 0; 
      border-radius: 0 8px 8px 0; 
    }
    .button { 
      display: inline-block; 
      background: #D4AF37; 
      color: #1a1a1a; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      font-weight: bold; 
      margin: 20px 0; 
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      color: #666; 
      font-size: 14px; 
    }
    .badge { 
      background: #D4AF37; 
      color: #1a1a1a; 
      padding: 4px 8px; 
      border-radius: 12px; 
      font-size: 12px; 
      font-weight: bold; 
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>💬 New Message</h1>
    <p>You have received a new message from ${senderType === 'admin' ? 'support' : 'a customer'}</p>
  </div>
  
  <div class="content">
    <p>Hello ${recipientName || (isAdminRecipient ? 'Support Team' : 'there')},</p>
    
    <p>You have received a new message in your conversation:</p>
    
    <div style="margin: 20px 0;">
      <strong>Conversation:</strong> ${conversationSubject}<br>
      <strong>From:</strong> ${senderName} <span class="badge">${senderType.toUpperCase()}</span>
    </div>
    
    <div class="message-box">
      <strong>Message:</strong><br>
      <p style="margin: 10px 0 0 0;">"${truncatedMessage}"</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${dashboardUrl}" class="button">View and Reply</a>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      ${isAdminRecipient 
        ? 'Please respond to this customer message as soon as possible to maintain excellent customer service.' 
        : 'Our support team has responded to your inquiry. Click the button above to view the full conversation and continue the discussion.'
      }
    </p>
  </div>
  
  <div class="footer">
    <p>This is an automated notification from Jooka E-commerce Platform.</p>
    <p>© ${new Date().getFullYear()} Jooka. All rights reserved.</p>
  </div>
</body>
</html>`;
  }

  private generateMessageNotificationText({
    recipientName,
    senderName,
    senderType,
    messageContent,
    conversationSubject,
    isAdminRecipient
  }: {
    recipientName?: string;
    senderName: string;
    senderType: 'customer' | 'admin';
    messageContent: string;
    conversationSubject: string;
    isAdminRecipient: boolean;
  }): string {
    const truncatedMessage = messageContent.length > 200 
      ? messageContent.substring(0, 200) + '...' 
      : messageContent;

    const dashboardUrl = isAdminRecipient 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/support`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/messages`;

    return `
New Message Notification

Hello ${recipientName || (isAdminRecipient ? 'Support Team' : 'there')},

You have received a new message in your conversation:

Conversation: ${conversationSubject}
From: ${senderName} (${senderType.toUpperCase()})

Message:
"${truncatedMessage}"

To view and reply to this message, visit:
${dashboardUrl}

${isAdminRecipient 
  ? 'Please respond to this customer message as soon as possible to maintain excellent customer service.' 
  : 'Our support team has responded to your inquiry. Visit the link above to view the full conversation and continue the discussion.'
}

---
This is an automated notification from Jooka E-commerce Platform.
© ${new Date().getFullYear()} Jooka. All rights reserved.
`;
  }
}