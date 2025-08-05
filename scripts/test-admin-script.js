#!/usr/bin/env node

/**
 * Test script to verify admin creation setup
 * This script checks if your Firebase Admin SDK is properly configured
 * without actually creating any users.
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAdminSetup() {
  try {
    colorLog('cyan', '🧪 Testing Admin Creation Setup');
    colorLog('cyan', '================================\n');

    // Test 1: Check environment variables
    colorLog('blue', '1. Checking environment variables...');
    
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      colorLog('red', '❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing');
      return false;
    }
    colorLog('green', `✅ Project ID: ${projectId}`);

    // Test 2: Check Firebase Admin credentials
    colorLog('blue', '\n2. Checking Firebase Admin credentials...');
    
    let hasCredentials = false;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        colorLog('green', '✅ FIREBASE_SERVICE_ACCOUNT_KEY found and valid JSON');
        hasCredentials = true;
      } catch (error) {
        colorLog('red', '❌ FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON');
      }
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      colorLog('green', '✅ Individual Firebase credentials found');
      hasCredentials = true;
    } else {
      colorLog('yellow', '⚠️  No Firebase Admin credentials found');
      colorLog('yellow', '   You need to add Firebase service account credentials to .env.local');
    }

    if (!hasCredentials) {
      colorLog('yellow', '\n💡 To fix this:');
      colorLog('yellow', '   1. Go to Firebase Console > Project Settings > Service Accounts');
      colorLog('yellow', '   2. Generate a new private key');
      colorLog('yellow', '   3. Add the JSON content to .env.local as FIREBASE_SERVICE_ACCOUNT_KEY');
      return false;
    }

    // Test 3: Initialize Firebase Admin
    colorLog('blue', '\n3. Testing Firebase Admin initialization...');
    
    try {
      if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId
          });
        } else {
          const serviceAccount = {
            type: "service_account",
            project_id: projectId,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
          };
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId
          });
        }
      }
      
      colorLog('green', '✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      colorLog('red', `❌ Failed to initialize Firebase Admin: ${error.message}`);
      return false;
    }

    // Test 4: Test Firestore connection
    colorLog('blue', '\n4. Testing Firestore connection...');
    
    try {
      const db = admin.firestore();
      // Try to read from users collection (this will work even if empty)
      const usersRef = db.collection('users').limit(1);
      await usersRef.get();
      colorLog('green', '✅ Firestore connection successful');
    } catch (error) {
      colorLog('red', `❌ Firestore connection failed: ${error.message}`);
      return false;
    }

    // Test 5: Test Firebase Auth connection
    colorLog('blue', '\n5. Testing Firebase Auth connection...');
    
    try {
      const auth = admin.auth();
      // Try to list users (this will work even if no users exist)
      await auth.listUsers(1);
      colorLog('green', '✅ Firebase Auth connection successful');
    } catch (error) {
      colorLog('red', `❌ Firebase Auth connection failed: ${error.message}`);
      return false;
    }

    // Test 6: Check existing admin users
    colorLog('blue', '\n6. Checking for existing admin users...');
    
    try {
      const db = admin.firestore();
      const adminUsers = await db.collection('users')
        .where('role', '==', 'admin')
        .limit(5)
        .get();
      
      if (adminUsers.empty) {
        colorLog('yellow', '⚠️  No admin users found');
        colorLog('green', '✅ Ready to create your first admin!');
      } else {
        colorLog('green', `✅ Found ${adminUsers.size} existing admin user(s):`);
        adminUsers.forEach(doc => {
          const data = doc.data();
          colorLog('green', `   - ${data.email} (ID: ${doc.id})`);
        });
      }
    } catch (error) {
      colorLog('red', `❌ Failed to check admin users: ${error.message}`);
      return false;
    }

    // Success!
    colorLog('green', '\n🎉 All tests passed! Your admin creation setup is ready.');
    colorLog('cyan', '\n📝 Next steps:');
    colorLog('cyan', '   Run: npm run create-admin');
    colorLog('cyan', '   Or:  npm run create-admin your-email@domain.com');
    
    return true;

  } catch (error) {
    colorLog('red', `\n❌ Unexpected error: ${error.message}`);
    return false;
  }
}

// Run the test
testAdminSetup()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    colorLog('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
