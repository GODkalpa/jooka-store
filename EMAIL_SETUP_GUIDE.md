# Email Service Setup Guide

Your e-commerce application currently logs OTP codes to the console instead of sending actual emails. To enable real email delivery, you need to configure an email service provider.

## Current Status
- ✅ OTP generation working
- ✅ Email templates ready
- ❌ Email delivery not configured (console logging only)

## Quick Setup Options

### Option 1: Resend (Recommended)
Resend is a modern email API that's easy to set up and reliable.

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to your `.env.local` file:
```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

### Option 2: Gmail SMTP (For Testing)
Use Gmail's SMTP server for testing purposes.

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Add to your `.env.local` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=your-email@gmail.com
```

### Option 3: SendGrid
Enterprise-grade email service.

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to your `.env.local` file:
```env
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

## Testing the Setup

After configuring any of the above options:

1. Restart your development server: `npm run dev`
2. Try registering a new user
3. Check that you receive the OTP code via email instead of console

## Troubleshooting

- **Still seeing console logs**: Make sure environment variables are set correctly and restart the server
- **Gmail "Less secure app" error**: Use App Password instead of regular password
- **Resend domain verification**: You may need to verify your domain for production use

## Production Considerations

- Use a custom domain for professional emails
- Set up proper SPF, DKIM, and DMARC records
- Consider email delivery monitoring and analytics
- Implement rate limiting for email sending
