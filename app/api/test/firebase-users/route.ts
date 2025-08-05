// Test endpoint to check Firebase Admin connection and list users
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Firebase Admin connection...');
    
    const db = getAdminDb();
    console.log('✅ Firebase Admin DB initialized');
    
    // Try to get all users from the users collection
    console.log('📋 Fetching users collection...');
    const usersSnapshot = await db.collection('users').get();
    
    console.log('📊 Users collection size:', usersSnapshot.size);
    console.log('📊 Users collection empty:', usersSnapshot.empty);
    
    const users: any[] = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        role: userData.role,
        created_at: userData.created_at,
        email_verified: userData.email_verified
      });
      console.log('👤 Found user:', doc.id, userData.email, userData.role);
    });
    
    // Also try to get profiles collection
    console.log('📋 Fetching profiles collection...');
    const profilesSnapshot = await db.collection('profiles').get();
    console.log('📊 Profiles collection size:', profilesSnapshot.size);
    
    const profiles: any[] = [];
    profilesSnapshot.forEach((doc) => {
      const profileData = doc.data();
      profiles.push({
        id: doc.id,
        user_id: profileData.user_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name
      });
      console.log('👤 Found profile:', doc.id, profileData.user_id);
    });
    
    return NextResponse.json({
      success: true,
      data: {
        users,
        profiles,
        stats: {
          usersCount: users.length,
          profilesCount: profiles.length
        }
      }
    });
    
  } catch (error) {
    console.error('💥 Firebase test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}