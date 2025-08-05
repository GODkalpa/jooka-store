# JOOKA E-commerce Platform Deployment Guide

This guide covers the complete deployment process for the JOOKA e-commerce platform.

## Prerequisites

- Node.js 18+ installed locally
- Vercel account for hosting
- Firebase project for database and authentication
- Cloudinary account for image storage
- Domain name (optional, for custom domain)

## Environment Variables

Create the following environment variables in your deployment environment:

### Required Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# File Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Email Configuration (for OTP emails)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password

# Payment Processing
# COD (Cash on Delivery) is the only supported payment method
# No additional payment provider configuration needed
```

### Optional Variables

```env
# Logging & Monitoring
LOG_LEVEL=INFO
JSON_LOGS=true
SENTRY_DSN=your_sentry_dsn

# Security
VALID_API_KEYS=key1,key2,key3
IP_WHITELIST=ip1,ip2,ip3

# Performance
REDIS_URL=redis://your-redis-url

# Service Information
SERVICE_NAME=jooka-ecommerce
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication and Firestore Database

### 2. Authentication Configuration

1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Configure authorized domains:
   - `your-domain.com`
   - `localhost` (for development)

### 3. Firestore Database Setup

1. Go to Firestore Database
2. Create database in production mode
3. Set up security rules (see FIREBASE_SETUP_GUIDE.md for details)

### 4. Get Configuration Keys

1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Add a web app and copy the configuration
4. Add these values to your environment variables

## Cloudinary Setup

### 1. Create Cloudinary Account

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Note down your cloud name, API key, and API secret

### 2. Create Upload Presets

1. Go to Settings > Upload in your Cloudinary dashboard
2. Create upload presets:
   - `jooka-products`: For product images
   - `jooka-avatars`: For user avatars
   - `jooka-general`: For general uploads

### 3. Configure Transformations

Set up automatic optimizations:
- Quality: Auto
- Format: Auto
- Responsive breakpoints: Enable

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### 4. Configure Environment Variables

Add all environment variables in the Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all required variables for Production, Preview, and Development

### 5. Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs:
   - `https://your-domain.com/api/auth/callback/facebook`

## Monitoring Setup

### 1. Health Checks

The platform includes a health check endpoint at `/api/health` that monitors:
- Database connectivity
- Memory usage
- API performance
- Cache status

### 2. Error Tracking (Optional)

To enable Sentry error tracking:
1. Create a Sentry account
2. Create a new project
3. Add `SENTRY_DSN` environment variable

### 3. Performance Monitoring

The platform includes built-in performance monitoring:
- API response times
- Database query performance
- Memory usage tracking
- Cache hit rates

## Security Considerations

### 1. Environment Variables

- Never commit environment variables to version control
- Use different keys for development and production
- Rotate secrets regularly

### 2. Database Security

- Row Level Security (RLS) is enabled by default
- Regular database backups are configured
- API keys have minimal required permissions

### 3. API Security

- Rate limiting is enabled by default
- CORS is properly configured
- Input validation and sanitization is implemented

## Backup and Recovery

### 1. Database Backups

Supabase automatically creates daily backups. For additional security:
1. Enable point-in-time recovery in Supabase
2. Set up automated exports to external storage

### 2. File Storage Backups

Cloudinary provides automatic backups. For additional security:
1. Enable auto-backup in Cloudinary settings
2. Consider periodic exports to AWS S3 or similar

## Scaling Considerations

### 1. Database Scaling

- Monitor database performance in Supabase dashboard
- Consider upgrading to Pro plan for higher limits
- Implement read replicas for high-traffic scenarios

### 2. CDN and Caching

- Vercel provides global CDN automatically
- Consider implementing Redis for session storage
- Use Cloudinary's CDN for image delivery

### 3. Monitoring and Alerts

Set up alerts for:
- High error rates (>5%)
- Slow response times (>2 seconds)
- High memory usage (>80%)
- Database connection issues

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase service status
   - Verify environment variables
   - Check RLS policies

2. **Authentication Issues**
   - Verify OAuth redirect URLs
   - Check NextAuth configuration
   - Ensure NEXTAUTH_URL is correct

3. **Image Upload Failures**
   - Check Cloudinary API keys
   - Verify upload preset configuration
   - Check file size and type restrictions

4. **Performance Issues**
   - Monitor `/api/health` endpoint
   - Check database query performance
   - Review cache hit rates

### Debug Mode

Enable debug mode by setting:
```env
NODE_ENV=development
LOG_LEVEL=DEBUG
```

### Support

For deployment issues:
1. Check Vercel deployment logs
2. Monitor Supabase logs
3. Review application logs in `/api/health`
4. Check browser console for client-side errors

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed successfully
- [ ] Authentication working (test login/register)
- [ ] File uploads working (test image upload)
- [ ] Real-time features working (test notifications)
- [ ] Health check endpoint returning 200
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring and alerts configured
- [ ] Backup systems verified
- [ ] Performance baseline established

## Maintenance

### Regular Tasks

- Monitor application health daily
- Review error logs weekly
- Update dependencies monthly
- Rotate secrets quarterly
- Review and optimize database queries
- Monitor and optimize cache performance
- Review security logs and access patterns

### Updates and Patches

1. Test updates in development environment
2. Deploy to preview environment
3. Run automated tests
4. Deploy to production during low-traffic periods
5. Monitor for issues post-deployment

This deployment guide ensures a secure, scalable, and maintainable production deployment of the JOOKA e-commerce platform.