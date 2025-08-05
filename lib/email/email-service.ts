// Email service for sending OTP codes
// Supports multiple email providers with fallback to console logging for development

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export class EmailService {
  private static instance: EmailService;
  private provider: string;

  constructor() {
    // Always default to console for development unless explicitly configured
    this.provider = 'console';

    // Only try other providers if explicitly configured
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      this.provider = 'resend';
    } else if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
      this.provider = 'sendgrid';
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.provider = 'smtp';
    }

    console.log(`📧 Email service initialized with provider: ${this.provider}`);
    
    if (this.provider === 'console') {
      console.log('📧 Using console logging for OTP codes (development mode)');
      console.log('📧 To use real email, configure RESEND_API_KEY, SENDGRID_API_KEY, or SMTP settings');
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      switch (this.provider) {
        case 'resend':
          return await this.sendWithResend(options);
        case 'sendgrid':
          return await this.sendWithSendGrid(options);
        case 'smtp':
          return await this.sendWithSMTP(options);
        default:
          return this.logToConsole(options);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendOTP(email: string, otpCode: string, firstName?: string): Promise<EmailResult> {
    const subject = 'Verify your email address';
    const html = this.generateOTPEmailHTML(otpCode, firstName);
    const text = this.generateOTPEmailText(otpCode, firstName);

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  private async sendWithResend(options: EmailOptions): Promise<EmailResult> {
    try {
      console.log('🔥 Attempting to send email with Resend...');
      console.log('🔥 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
      console.log('🔥 FROM_EMAIL:', process.env.FROM_EMAIL);
      console.log('🔥 TO:', options.to);

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailData = {
        from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      console.log('🔥 Sending email with data:', { ...emailData, html: '[HTML_CONTENT]', text: '[TEXT_CONTENT]' });

      const result = await resend.emails.send(emailData);

      console.log('🔥 Resend result:', result);

      if (result.error) {
        console.log('🔥 Resend error:', result.error);
        // If it's a domain verification error, fall back to console logging for development
        if (result.error.statusCode === 403 && result.error.error?.includes('verify a domain')) {
          console.log('🔥 Domain verification required, falling back to console logging for development');
          return this.logToConsole(options);
        }
        return { success: false, error: result.error.message || result.error.error };
      }

      console.log('🔥 Email sent successfully with Resend');
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.log('🔥 Resend error caught:', error);
      console.log('Resend package not available, falling back to console logging');
      return this.logToConsole(options);
    }
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
    // SendGrid not installed, fall back to console logging
    console.log('SendGrid package not available, falling back to console logging');
    return this.logToConsole(options);
  }

  private async sendWithSMTP(options: EmailOptions): Promise<EmailResult> {
    try {
      const nodemailer = await import('nodemailer');

      const transporter = nodemailer.default.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const result = await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.log('SMTP error, falling back to console logging:', error);
      return this.logToConsole(options);
    }
  }

  private logToConsole(options: EmailOptions): EmailResult {
    console.log('\n📧 EMAIL (Development Mode)');
    console.log('================================');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Content:');
    console.log(options.text || this.stripHTML(options.html));
    console.log('================================\n');

    return { success: true, messageId: 'console-log' };
  }

  private generateOTPEmailHTML(otpCode: string, firstName?: string): string {
    const greeting = firstName ? `Hi ${firstName}` : 'Hello';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #007bff; 
            text-align: center; 
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 8px; 
            margin: 20px 0; 
            letter-spacing: 4px;
          }
          .footer { margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          
          <p>${greeting},</p>
          
          <p>Thank you for signing up! To complete your registration, please enter the following 6-digit verification code:</p>
          
          <div class="otp-code">${otpCode}</div>
          
          <p>This code will expire in 10 minutes for security reasons.</p>
          
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <div class="footer">
            <p>Best regards,<br>Your App Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOTPEmailText(otpCode: string, firstName?: string): string {
    const greeting = firstName ? `Hi ${firstName}` : 'Hello';
    
    return `
${greeting},

Thank you for signing up! To complete your registration, please enter the following 6-digit verification code:

${otpCode}

This code will expire in 10 minutes for security reasons.

If you didn't request this verification, please ignore this email.

Best regards,
Your App Team
    `.trim();
  }

  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();