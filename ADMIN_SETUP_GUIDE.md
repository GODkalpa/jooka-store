# Admin Setup Guide for JOOKA E-commerce Platform

This guide explains how to set up your first admin account for the JOOKA e-commerce platform.

## Method 1: Using the Terminal Script (Fastest & Most Reliable)

The quickest way to create admin accounts directly in the database:

### One-Time Setup (Required)

1. **Get Firebase Admin Credentials**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `jooka-7c2bd`
   - Click ⚙️ → **Project Settings** → **Service Accounts** tab
   - Click **"Generate new private key"** and download the JSON file

2. **Add credentials to `.env.local`**:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"jooka-7c2bd",...}
   ```
   (Copy the entire JSON content from the downloaded file)

### Creating Admin Accounts

```bash
# Interactive mode (will prompt for email)
npm run create-admin

# Direct mode (provide email immediately)
npm run create-admin admin@yourstore.com

# Windows users can also double-click: create-admin.bat
```

**What it does:**
- Creates user in Firebase Authentication (if needed)
- Generates secure temporary password for new users
- Creates/updates user document in Firestore with admin role
- Shows login credentials

## Method 2: Using the Admin Setup Page

The easiest way to set up your first admin account:

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the admin setup page**: Navigate to `/admin-setup`

3. **Enter your admin email**: 
   - Enter your email address
   - Click "Setup Admin Account"

4. **Check your email**: You'll receive an OTP code

5. **Sign in**: Click "Go to Sign In Page" and use your email + OTP

6. **Automatic admin promotion**: Since you're the first user, you'll automatically be given admin privileges

7. **Access admin dashboard**: Navigate to `/admin` to access the admin features

## Method 2: Using the Setup API (Development Only)

If you want to pre-verify your admin email before signing in:

1. **Send a POST request** to `/api/setup-admin`:
   ```bash
   curl -X POST http://localhost:3000/api/setup-admin \
     -H "Content-Type: application/json" \
     -d '{"email":"your-admin@email.com"}'
   ```

2. **Follow the instructions** returned by the API

3. **Sign in** using the OTP sent to your email

## Method 3: Using the Legacy Script (Alternative)

If you prefer the original script:

```bash
node scripts/setup-admin.js your-admin@email.com
```

> **Note:** The new `create-admin.js` script (Method 1) is recommended for better error handling and user experience.

## Important Security Notes

- **Development Only**: Methods 2 and 3 only work in development mode
- **First User Only**: The automatic promotion only works for the very first user
- **Change Passwords**: If using Method 3, change the temporary password immediately
- **Remove Scripts**: Consider removing the setup scripts in production

## Verifying Admin Access

After setup, verify your admin access by:

1. **Check your role**: Your user profile should show `role: "admin"`
2. **Access admin routes**: You should be able to access `/admin/*` routes
3. **Admin navigation**: The admin sidebar should be visible in the dashboard

## Troubleshooting

### "Admin users already exist" error
- This means an admin has already been created
- Use the existing admin account to promote other users
- Or reset your database if in development

### OTP not received
- Check your spam folder
- Verify your email configuration in Firebase
- Check the Firebase console for authentication logs

### Access denied to admin routes
- Verify your user role in the Firestore console
- Check that you're signed in with the correct account
- Clear your browser cache and sign in again

## Next Steps

Once you have admin access:

1. **Update your profile**: Add your name and other details
2. **Set up products**: Add your first products and categories
3. **Configure settings**: Review and update system settings
4. **Create additional admins**: Use the user management interface to promote other users

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the Firebase console for authentication issues
3. Verify your environment variables are set correctly
4. Check the application logs for detailed error messages