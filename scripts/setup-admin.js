#!/usr/bin/env node

/**
 * Admin Setup Script for JOOKA E-commerce Platform
 * 
 * This script creates the first admin user in your Firebase project.
 * Run this script once to set up your initial admin account.
 * 
 * Usage:
 *   node scripts/setup-admin.js <admin-email>
 * 
 * Example:
 *   node scripts/setup-admin.js admin@jooka.com
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Check if we're in development and have a service account key
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } else {
    // Use default credentials (works in Firebase Functions or with gcloud auth)
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupAdmin() {
  try {
    console.log('🚀 JOOKA E-commerce Admin Setup');
    console.log('================================\n');

    // Get admin email from command line or prompt
    let adminEmail = process.argv[2];
    
    if (!adminEmail) {
      adminEmail = await askQuestion('Enter admin email address: ');
    }

    if (!adminEmail || !adminEmail.includes('@')) {
      console.error('❌ Please provide a valid email address');
      process.exit(1);
    }

    console.log(`\n📧 Setting up admin account for: ${adminEmail}`);

    // Check if user already exists in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(adminEmail);
      console.log('✅ User found in Firebase Auth');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('👤 Creating new user in Firebase Auth...');
        
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
        
        firebaseUser = await auth.createUser({
          email: adminEmail,
          password: tempPassword,
          emailVerified: true
        });
        
        console.log('✅ User created in Firebase Auth');
        console.log(`🔑 Temporary password: ${tempPassword}`);
        console.log('⚠️  Please change this password after first login!');
      } else {
        throw error;
      }
    }

    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.role === 'admin') {
        console.log('✅ User is already an admin');
      } else {
        console.log('🔄 Promoting user to admin...');
        await db.collection('users').doc(firebaseUser.uid).update({
          role: 'admin',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ User promoted to admin');
      }
    } else {
      console.log('📝 Creating user document in Firestore...');
      await db.collection('users').doc(firebaseUser.uid).set({
        email: adminEmail,
        role: 'admin',
        email_verified: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ User document created with admin role');
    }

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Sign in to your application using the admin email');
    console.log('2. If you created a new user, use the temporary password shown above');
    console.log('3. Change your password after first login');
    console.log('4. You now have access to the admin dashboard at /admin');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the setup
setupAdmin();