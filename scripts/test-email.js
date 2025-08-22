// Test script to verify email service configuration
require('dotenv').config({ path: '.env.local' });

async function testEmailService() {
  console.log('🧪 Email Service Configuration Test');
  console.log('=' .repeat(50));
  
  // Check environment variables
  console.log('\n📋 Environment Configuration:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Missing');
  console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✅ Set' : '⚪ Not set (OK if using Resend)');
  
  // Determine which provider should be used
  let provider = 'console';
  if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
    provider = 'resend';
  } else if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
    provider = 'sendgrid';
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    provider = 'smtp';
  }
  
  console.log('\n🎯 Detected Provider:', provider);
  
  if (provider === 'console') {
    console.log('\n❌ Email service is in console mode (development only)');
    console.log('\n📖 To enable real email delivery:');
    console.log('   1. Configure Resend API key in .env.local');
    console.log('   2. Set FROM_EMAIL in .env.local');
    console.log('   3. Restart the development server');
    return;
  }
  
  if (provider === 'resend') {
    console.log('\n🔄 Testing Resend connection...');
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      console.log('✅ Resend package loaded successfully');
      console.log('✅ API key configured');
      
      // Test email send (to a safe email)
      const testEmail = {
        from: process.env.FROM_EMAIL,
        to: 'test@example.com', // This will fail safely
        subject: 'Test Email from Jooka E-commerce',
        html: '<p>This is a test email to verify the service is working.</p>',
        text: 'This is a test email to verify the service is working.'
      };
      
      console.log('\n🧪 Attempting test email send...');
      console.log('From:', testEmail.from);
      console.log('To:', testEmail.to);
      
      const result = await resend.emails.send(testEmail);
      
      if (result.error) {
        console.log('\n⚠️  Email send result:');
        console.log('Error:', result.error);
        
        // Check if it's a domain verification issue
        if (result.error.message && result.error.message.includes('verify')) {
          console.log('\n💡 This appears to be a domain verification issue.');
          console.log('   For production, you\'ll need to verify your domain with Resend.');
          console.log('   For development, the service should fall back to console logging.');
        }
        
        console.log('\n✅ Resend API is responding (even if domain needs verification)');
      } else {
        console.log('\n✅ Email sent successfully!');
        console.log('Message ID:', result.data?.id);
      }
      
    } catch (error) {
      console.log('\n❌ Resend test failed:');
      console.log('Error:', error.message);
      
      if (error.message.includes('Cannot find module')) {
        console.log('\n📦 Please install resend package:');
        console.log('   npm install resend');
      }
    }
  }
  
  console.log('\n🎉 Email service test completed!');
  console.log('\n📖 For more details, see EMAIL_SETUP_GUIDE.md');
}

// Run the test
testEmailService().catch(console.error);


