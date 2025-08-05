#!/usr/bin/env node

/**
 * Enhanced Admin Creation Script for JOOKA E-commerce Platform
 * 
 * This script creates admin users in your Firebase project with better error handling
 * and user experience. It supports both creating new users and promoting existing ones.
 * 
 * Usage:
 *   npm run create-admin
 *   npm run create-admin <admin-email>
 * 
 * Examples:
 *   npm run create-admin
 *   npm run create-admin admin@jooka.com
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    // Check for service account key in environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    } 
    
    // Check for individual service account fields
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };
      
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    }
    
    // Use default credentials (works with gcloud auth or in Firebase environment)
    return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    
  } catch (error) {
    colorLog('red', '❌ Failed to initialize Firebase Admin SDK');
    colorLog('red', `Error: ${error.message}`);
    colorLog('yellow', '\n💡 Make sure you have one of the following:');
    colorLog('yellow', '   1. FIREBASE_SERVICE_ACCOUNT_KEY environment variable with the full service account JSON');
    colorLog('yellow', '   2. Individual Firebase service account environment variables');
    colorLog('yellow', '   3. Google Cloud SDK authenticated (run: gcloud auth application-default login)');
    process.exit(1);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateSecurePassword() {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one of each required character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function createAdminUser() {
  try {
    // Header
    colorLog('cyan', '🚀 JOOKA E-commerce Admin Creator');
    colorLog('cyan', '===================================\n');

    // Initialize Firebase
    colorLog('blue', '🔧 Initializing Firebase Admin SDK...');
    const app = initializeFirebase();
    const db = admin.firestore();
    const auth = admin.auth();
    colorLog('green', '✅ Firebase initialized successfully\n');

    // Get admin email
    let adminEmail = process.argv[2];
    
    if (!adminEmail) {
      adminEmail = await askQuestion('📧 Enter admin email address: ');
    }

    if (!adminEmail || !validateEmail(adminEmail)) {
      colorLog('red', '❌ Please provide a valid email address');
      process.exit(1);
    }

    colorLog('blue', `\n👤 Processing admin account for: ${adminEmail}`);

    // Check if user exists in Firebase Auth
    let firebaseUser;
    let isNewUser = false;
    let tempPassword = null;

    try {
      firebaseUser = await auth.getUserByEmail(adminEmail);
      colorLog('green', '✅ User found in Firebase Auth');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        colorLog('yellow', '👤 User not found in Firebase Auth, creating new user...');
        
        tempPassword = generateSecurePassword();
        
        firebaseUser = await auth.createUser({
          email: adminEmail,
          password: tempPassword,
          emailVerified: true
        });
        
        isNewUser = true;
        colorLog('green', '✅ User created in Firebase Auth');
      } else {
        throw error;
      }
    }

    // Check/create user document in Firestore
    const userDocRef = db.collection('users').doc(firebaseUser.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.role === 'admin') {
        colorLog('green', '✅ User is already an admin');
      } else {
        colorLog('yellow', '🔄 Promoting existing user to admin...');
        await userDocRef.update({
          role: 'admin',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        colorLog('green', '✅ User promoted to admin');
      }
    } else {
      colorLog('yellow', '📝 Creating user document in Firestore...');
      await userDocRef.set({
        email: adminEmail,
        role: 'admin',
        email_verified: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      colorLog('green', '✅ User document created with admin role');
    }

    // Success message
    colorLog('green', '\n🎉 Admin setup completed successfully!');
    colorLog('bright', '\n📋 Summary:');
    colorLog('white', `   Email: ${adminEmail}`);
    colorLog('white', `   Role: admin`);
    colorLog('white', `   Firebase UID: ${firebaseUser.uid}`);
    
    if (isNewUser && tempPassword) {
      colorLog('yellow', '\n🔑 IMPORTANT - Save this temporary password:');
      colorLog('bright', `   Password: ${tempPassword}`);
      colorLog('red', '   ⚠️  Change this password immediately after first login!');
    }
    
    colorLog('cyan', '\n📝 Next steps:');
    colorLog('white', '   1. Sign in to your application using the admin email');
    if (isNewUser) {
      colorLog('white', '   2. Use the temporary password shown above');
      colorLog('white', '   3. Change your password after first login');
      colorLog('white', '   4. Access the admin dashboard at /admin');
    } else {
      colorLog('white', '   2. Use your existing password');
      colorLog('white', '   3. Access the admin dashboard at /admin');
    }
    
  } catch (error) {
    colorLog('red', `\n❌ Error creating admin: ${error.message}`);
    
    if (error.code) {
      colorLog('yellow', `   Error code: ${error.code}`);
    }
    
    // Provide helpful error messages
    if (error.message.includes('permission')) {
      colorLog('yellow', '\n💡 This might be a permissions issue. Make sure:');
      colorLog('yellow', '   - Your Firebase service account has the necessary permissions');
      colorLog('yellow', '   - You have Firebase Admin SDK properly configured');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  colorLog('yellow', '\n\n👋 Admin creation cancelled');
  rl.close();
  process.exit(0);
});

// Run the script
createAdminUser();
