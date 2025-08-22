// Test script for messaging email notification service
require('dotenv').config({ path: '.env.local' });

const { MessagingEmailService } = require('../lib/email/messaging-email-service');

async function testMessagingEmail() {
  console.log('🧪 Testing Messaging Email Notification Service');
  console.log('=' .repeat(60));
  
  try {
    const messagingEmailService = new MessagingEmailService();
    
    // Test data for customer message notification (to admin)
    console.log('\n📧 Testing customer message notification to admin...');
    const customerToAdminResult = await messagingEmailService.sendMessageNotification({
      recipientEmail: 'jooka648@gmail.com', // Your verified email
      recipientName: 'Support Team',
      senderName: 'John Customer',
      senderType: 'customer',
      subject: 'Product inquiry about pricing',
      messageContent: 'Hi, I\'m interested in your premium hoodie collection. Can you provide more details about bulk pricing options? I\'m looking to purchase 50+ units for my company.',
      conversationId: 'test-conv-123',
      conversationSubject: 'Product inquiry about pricing'
    });
    
    console.log('Customer → Admin notification result:', customerToAdminResult);
    
    // Test data for admin response notification (to customer)
    console.log('\n📧 Testing admin response notification to customer...');
    const adminToCustomerResult = await messagingEmailService.sendMessageNotification({
      recipientEmail: 'jooka648@gmail.com', // Your verified email (simulating customer)
      recipientName: 'John Customer',
      senderName: 'Sarah (Support)',
      senderType: 'admin',
      subject: 'Re: Product inquiry about pricing',
      messageContent: 'Thank you for your interest in our premium hoodie collection! For bulk orders of 50+ units, we offer a 15% discount. I\'ll send you a detailed quote with our wholesale pricing. Would you like to schedule a call to discuss your specific requirements?',
      conversationId: 'test-conv-123',
      conversationSubject: 'Product inquiry about pricing'
    });
    
    console.log('Admin → Customer notification result:', adminToCustomerResult);
    
    if (customerToAdminResult.success && adminToCustomerResult.success) {
      console.log('\n✅ Both email notifications sent successfully!');
      console.log('📬 Check your email at jooka648@gmail.com for both notifications');
    } else {
      console.log('\n⚠️  Some notifications failed:');
      if (!customerToAdminResult.success) {
        console.log('❌ Customer → Admin failed:', customerToAdminResult.error);
      }
      if (!adminToCustomerResult.success) {
        console.log('❌ Admin → Customer failed:', adminToCustomerResult.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n🎉 Messaging email test completed!');
}

// Run the test
testMessagingEmail().catch(console.error);