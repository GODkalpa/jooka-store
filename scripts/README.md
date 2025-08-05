# Admin Creation Scripts

This directory contains scripts to easily create admin accounts for your JOOKA E-commerce platform.

## Quick Start

### Option 1: Using npm scripts (Recommended)

```bash
# Install firebase-admin if not already installed
npm install

# Create an admin account (will prompt for email)
npm run create-admin

# Or provide email directly
npm run create-admin admin@yourstore.com
```

### Option 2: Using the batch file (Windows)

Double-click `create-admin.bat` in the project root, or run:

```cmd
create-admin.bat
create-admin.bat admin@yourstore.com
```

### Option 3: Direct script execution

```bash
node scripts/create-admin.js
node scripts/create-admin.js admin@yourstore.com
```

## Prerequisites

### 1. Firebase Admin SDK Setup

You need to configure Firebase Admin SDK credentials. Choose one of these methods:

#### Method A: Service Account Key (Recommended for development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Add to your `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}
```

#### Method B: Individual Environment Variables

Add these to your `.env.local`:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="123456789012345678901"
FIREBASE_PRIVATE_KEY_ID="abcdef1234567890"
```

#### Method C: Google Cloud SDK (For production/CI)

```bash
gcloud auth application-default login
```

### 2. Environment Variables

Make sure your `.env.local` contains:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# Plus one of the Firebase Admin SDK configurations above
```

## What the Script Does

1. **Initializes Firebase Admin SDK** with your credentials
2. **Checks if user exists** in Firebase Authentication
3. **Creates new user** if they don't exist (with secure random password)
4. **Creates/updates user document** in Firestore with admin role
5. **Provides login credentials** for new users

## Script Features

- ✅ **Smart user detection** - Works with existing or new users
- ✅ **Secure password generation** - Creates strong temporary passwords
- ✅ **Colorful output** - Easy to read console messages
- ✅ **Error handling** - Clear error messages and troubleshooting tips
- ✅ **Email validation** - Ensures valid email addresses
- ✅ **Graceful shutdown** - Handle Ctrl+C properly

## Troubleshooting

### "Failed to initialize Firebase Admin SDK"

- Check your Firebase service account credentials
- Ensure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set correctly
- Verify your service account has the necessary permissions

### "Permission denied" errors

- Make sure your service account has these roles:
  - Firebase Admin SDK Administrator Service Agent
  - Firebase Authentication Admin

### "User not found" in Firestore

This is normal for new users. The script will create the user document automatically.

## Security Notes

- **Change temporary passwords immediately** after first login
- **Store service account keys securely** - never commit them to version control
- **Use environment variables** for all sensitive configuration
- **Limit service account permissions** to only what's needed

## Legacy Script

The original `setup-admin.js` script is still available but the new `create-admin.js` script is recommended for better user experience and error handling.
