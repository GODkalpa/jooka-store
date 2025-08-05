// Simple email service for development - no external dependencies
// Logs OTP codes to console for easy testing

interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export class SimpleEmailService {
  private static instance: SimpleEmailService;

  static getInstance(): SimpleEmailService {
    if (!SimpleEmailService.instance) {
      SimpleEmailService.instance = new SimpleEmailService();
    }
    return SimpleEmailService.instance;
  }

  async sendOTP(email: string, otpCode: string, firstName?: string): Promise<EmailResult> {
    const greeting = firstName ? `Hi ${firstName}` : 'Hello';
    
    console.log('\n' + '='.repeat(60));
    console.log('📧 OTP EMAIL (Development Mode)');
    console.log('='.repeat(60));
    console.log(`📧 To: ${email}`);
    console.log(`📧 Subject: Verify your email address`);
    console.log('📧 Message:');
    console.log('');
    console.log(`   ${greeting},`);
    console.log('');
    console.log('   Thank you for signing up! To complete your registration,');
    console.log('   please enter the following 6-digit verification code:');
    console.log('');
    console.log(`   🔢 OTP CODE: ${otpCode}`);
    console.log('');
    console.log('   This code will expire in 10 minutes for security reasons.');
    console.log('');
    console.log('   If you didn\'t request this verification, please ignore this email.');
    console.log('');
    console.log('   Best regards,');
    console.log('   Your App Team');
    console.log('');
    console.log('='.repeat(60));
    console.log(`🎯 COPY THIS CODE: ${otpCode}`);
    console.log('='.repeat(60));
    console.log('');

    return {
      success: true,
      messageId: `dev-${Date.now()}`
    };
  }

  async sendEmail(to: string, subject: string, content: string): Promise<EmailResult> {
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL (Development Mode)');
    console.log('='.repeat(60));
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log('📧 Content:');
    console.log('');
    console.log(content);
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    return {
      success: true,
      messageId: `dev-${Date.now()}`
    };
  }
}

// Export singleton instance
export const simpleEmailService = SimpleEmailService.getInstance();