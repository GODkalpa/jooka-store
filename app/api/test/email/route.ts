import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/email-service';
import { MessagingEmailService } from '@/lib/email/messaging-email-service';

export async function GET() {
  try {
    console.log('🧪 Testing email services...');
    
    // Test 1: Basic OTP Email Service
    console.log('\n📧 Testing OTP email service...');
    const emailService = EmailService.getInstance();
    const otpResult = await emailService.sendOTP(
      'jooka648@gmail.com', // Your verified email
      '123456',              // Test OTP
      'Test User'            // Test name
    );
    
    console.log('📧 OTP email test result:', otpResult);
    
    // Test 2: Messaging Email Service
    console.log('\n📧 Testing messaging email notifications...');
    const messagingEmailService = new MessagingEmailService();
    
    // Test customer message notification (to admin)
    const customerToAdminResult = await messagingEmailService.sendMessageNotification({
      recipientEmail: 'jooka648@gmail.com',
      recipientName: 'Support Team',
      senderName: 'John Customer',
      senderType: 'customer',
      subject: 'Product inquiry about pricing',
      messageContent: 'Hi, I\'m interested in your premium hoodie collection. Can you provide more details about bulk pricing options? I\'m looking to purchase 50+ units for my company.',
      conversationId: 'test-conv-123',
      conversationSubject: 'Product inquiry about pricing'
    });
    
    console.log('📧 Customer → Admin notification result:', customerToAdminResult);
    
    // Test admin response notification (to customer)
    const adminToCustomerResult = await messagingEmailService.sendMessageNotification({
      recipientEmail: 'jooka648@gmail.com',
      recipientName: 'John Customer',
      senderName: 'Sarah (Support)',
      senderType: 'admin',
      subject: 'Re: Product inquiry about pricing',
      messageContent: 'Thank you for your interest in our premium hoodie collection! For bulk orders of 50+ units, we offer a 15% discount. I\'ll send you a detailed quote with our wholesale pricing.',
      conversationId: 'test-conv-123',
      conversationSubject: 'Product inquiry about pricing'
    });
    
    console.log('📧 Admin → Customer notification result:', adminToCustomerResult);
    
    // Prepare response
    const allSuccessful = otpResult.success && customerToAdminResult.success && adminToCustomerResult.success;
    
    return NextResponse.json({
      success: true,
      results: {
        otpEmail: otpResult,
        customerToAdmin: customerToAdminResult,
        adminToCustomer: adminToCustomerResult
      },
      allEmailsWorking: allSuccessful,
      message: allSuccessful 
        ? 'All email services working! Check your inbox at jooka648@gmail.com for 3 test emails.'
        : 'Some email services failed. Check the results above for details.',
      summary: {
        otpService: otpResult.success ? '✅ Working' : `❌ Failed: ${otpResult.error}`,
        messagingService: (customerToAdminResult.success && adminToCustomerResult.success) 
          ? '✅ Working' 
          : '❌ Failed: Check individual results',
        domain: 'jookawear.com (verified)',
        provider: 'Resend'
      }
    });
    
  } catch (error) {
    console.error('❌ Email service test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Email service test failed'
    }, { status: 500 });
  }
}