# Firebase Setup Guide for JOOKA E-commerce

## 🎯 Overview

This guide will help you set up Firebase for your JOOKA e-commerce application after the migration from Supabase/Clerk to Firebase.

## 📦 Prerequisites

- Firebase account (https://firebase.google.com/)
- Node.js and npm installed
- JOOKA e-commerce project

## 🔧 Firebase Project Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `jooka-ecommerce` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Email link (passwordless sign-in)**
4. Set authorized domains (add your domain for production)

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click "Done"

### 4. Get Configuration Keys

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add a web app
4. Register app with name: `jooka-ecommerce-web`
5. Copy the configuration object

## 🔑 Environment Variables

Update your `.env.local` file with the Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration (keep existing)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for OTP emails)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
```

## 🗄️ Firestore Database Structure

The application will automatically create the following collections:

### Collections:
- `users` - User accounts
- `profiles` - User profile information
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `cart_items` - Shopping cart items
- `addresses` - User addresses
- `notifications` - User notifications
- `audit_logs` - System audit logs

### Security Rules (Production)

Update Firestore security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /profiles/{profileId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // Products are readable by all, writable by admins only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories are readable by all, writable by admins only
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders are readable/writable by the user who owns them
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // Cart items are readable/writable by the user who owns them
    match /cart_items/{cartItemId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // Addresses are readable/writable by the user who owns them
    match /addresses/{addressId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

## 🚀 Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/auth/signin`

3. Enter your email address

4. Check your email for the sign-in link

5. Click the link to complete authentication

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase not initialized" error**
   - Check that all environment variables are set correctly
   - Ensure the Firebase config is valid

2. **Email links not working**
   - Verify Email/Password provider is enabled
   - Check that Email link sign-in is enabled
   - Ensure authorized domains include your development domain

3. **Firestore permission denied**
   - Check Firestore security rules
   - Ensure user is authenticated
   - Verify user has correct permissions

### Debug Steps:

1. Check browser console for errors
2. Verify Firebase configuration in Network tab
3. Check Firestore rules in Firebase Console
4. Test authentication flow step by step

## 📝 Next Steps

1. Set up production environment variables
2. Configure custom domain for email links
3. Set up proper Firestore security rules
4. Configure email templates
5. Set up monitoring and analytics

## 🔒 Security Considerations

1. **Never expose sensitive keys** - Use environment variables
2. **Set proper Firestore rules** - Restrict access appropriately
3. **Use HTTPS in production** - Required for Firebase Auth
4. **Validate all inputs** - Both client and server side
5. **Monitor authentication events** - Set up alerts for suspicious activity

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Review the Firebase documentation
3. Check the application logs
4. Verify environment configuration
