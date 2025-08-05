// Simple email service for sending OTP codes
// In production, integrate with services like SendGrid, AWS SES, or similar

export interface EmailResult {
  success: boolean;
  error?: string;
}

export class SimpleEmailService {
  // Send OTP email
  static async sendOTP(email: string, otpCode: string, fullName: string): Promise<EmailResult> {
    try {
      // For development/testing, we'll log the OTP to console
      // In production, replace this with actual email sending logic
      console.log(`
========================================
OTP EMAIL FOR: ${email}
NAME: ${fullName}
OTP CODE: ${otpCode}
========================================
Subject: Your JOOKA Verification Code
        
Hi ${fullName},

Welcome to JOOKA! Please use the following verification code to complete your registration:

${otpCode}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
The JOOKA Team
========================================
      `);
      
      // In production, implement actual email sending here:
      /*
      const emailData = {
        to: email,
        subject: 'Your JOOKA Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #D4AF37;">Welcome to JOOKA!</h2>
            <p>Hi ${fullName},</p>
            <p>Please use the following verification code to complete your registration:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #D4AF37; font-size: 32px; margin: 0;">${otpCode}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>The JOOKA Team</p>
          </div>
        `
      };
      
      // Example with SendGrid:
      // await sgMail.send(emailData);
      
      // Example with AWS SES:
      // await ses.sendEmail(emailData).promise();
      
      // Example with Nodemailer:
      // await transporter.sendMail(emailData);
      */
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  // Send welcome email after successful registration
  static async sendWelcome(email: string, fullName: string): Promise<EmailResult> {
    try {
      console.log(`
========================================
WELCOME EMAIL FOR: ${email}
NAME: ${fullName}
========================================
Subject: Welcome to JOOKA!
        
Hi ${fullName},

Welcome to JOOKA! Your account has been successfully created.

You can now:
- Browse our premium product catalog
- Add items to your cart
- Place orders with cash on delivery
- Track your order status
- Manage your profile and addresses

Start shopping now at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

Best regards,
The JOOKA Team
========================================
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  // Send password reset email (for future use)
  static async sendPasswordReset(email: string, resetLink: string): Promise<EmailResult> {
    try {
      console.log(`
========================================
PASSWORD RESET EMAIL FOR: ${email}
RESET LINK: ${resetLink}
========================================
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }
}
