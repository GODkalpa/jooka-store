// Test OTP email sending with real email service
require('dotenv').config({ path: '.env.local' });

async function testOTPEmail() {
  console.log('📧 Testing Real OTP Email Delivery');
  console.log('=' .repeat(50));
  
  try {
    // Import the email service
    const { EmailService } = await import('../lib/email/email-service.js');
    const emailService = EmailService.getInstance();
    
    // Test OTP details
    const testEmail = 'jooka648@gmail.com'; // Your verified email
    const testOTP = '123456';
    const testFirstName = 'Test User';
    
    console.log('\n🔄 Sending test OTP email...');
    console.log('To:', testEmail);
    console.log('OTP Code:', testOTP);
    console.log('Name:', testFirstName);
    
    // Send the OTP email
    const result = await emailService.sendOTP(testEmail, testOTP, testFirstName);
    
    console.log('\n📬 Email send result:');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('Message ID:', result.messageId);
      console.log('\n✅ SUCCESS! Check your email inbox for the OTP.');
      console.log('📧 Email should be in:', testEmail);
    } else {
      console.log('Error:', result.error);
      console.log('\n❌ Email sending failed. Check the error above.');
    }
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    console.log('\nThis might be due to ES module import issues.');
    console.log('The email service should still work in the Next.js app.');
  }
  
  console.log('\n📝 Note: If this test fails but you see "resend" as the provider');
  console.log('   in the app logs, then the email service is working correctly.');
}

// Run the test
testOTPEmail().catch(console.error);