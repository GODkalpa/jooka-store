#!/usr/bin/env node

/**
 * Fix Admin User Script for JOOKA E-commerce Platform
 * This script fixes orphaned auth users by creating the corresponding database records
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Try to load dotenv, but don't fail if it's not available
try {
    require('dotenv').config({ path: '.env.local' });
} catch (error) {
    console.log('⚠️  dotenv not found, using system environment variables');
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
    console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function fixAdminUser() {
    try {
        console.log('🔧 JOOKA E-commerce Admin User Fix\n');

        // Get the email of the user to fix
        const email = await question('Enter the email of the admin user to fix: ');

        rl.close();

        if (!email) {
            throw new Error('Email is required');
        }

        console.log('\n🔍 Checking user status...');

        // Check if auth user exists by trying to get user from database first
        // Since we can't easily query auth.users directly, we'll work with what we have
        console.log('🔍 Looking for existing database record...');

        const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        let authUserId = null;

        if (dbUser) {
            console.log('✅ Database user found:', dbUser.id);
            authUserId = dbUser.id;
        } else {
            // Try to find the auth user by attempting to sign in (this will fail but give us info)
            console.log('🔍 Searching for orphaned auth user...');

            // We'll need to get the user ID another way
            // Let's try to list all auth users (this requires admin privileges)
            try {
                const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

                if (listError) {
                    throw new Error(`Cannot access auth users: ${listError.message}`);
                }

                const foundUser = authUsers.users.find(user => user.email === email);

                if (!foundUser) {
                    throw new Error(`No auth user found with email: ${email}`);
                }

                console.log('✅ Auth user found:', foundUser.id);
                authUserId = foundUser.id;

            } catch (error) {
                throw new Error(`Failed to find auth user: ${error.message}`);
            }
        }

        if (dbUser) {
            console.log('✅ Database user already exists');

            // Check if user is admin
            if (dbUser.role === 'admin') {
                console.log('✅ User is already an admin');
            } else {
                console.log('🔄 Promoting user to admin...');

                const { error: updateError } = await supabase
                    .from('users')
                    .update({ role: 'admin' })
                    .eq('id', dbUser.id);

                if (updateError) {
                    throw new Error(`Failed to promote user: ${updateError.message}`);
                }

                console.log('✅ User promoted to admin');
            }
        } else {
            console.log('🔄 Creating database user record...');

            // Create database user record
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: authUserId,
                    email: email,
                    email_verified: true, // Assume verified for admin users
                    role: 'admin',
                });

            if (userError) {
                console.error('Detailed error:', userError);
                throw new Error(`Failed to create database user: ${userError.message}`);
            }

            console.log('✅ Database user record created');
        }

        // Check if profile exists
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authUserId)
            .single();

        if (!profile) {
            console.log('🔄 Creating user profile...');

            // Extract names from email as fallback
            const firstName = email.split('@')[0];
            const lastName = '';

            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: authUserId,
                    first_name: firstName,
                    last_name: lastName,
                });

            if (profileError) {
                console.warn('⚠️  Warning creating profile:', profileError.message);
            } else {
                console.log('✅ Profile created successfully');
            }
        } else {
            console.log('✅ Profile already exists');
        }

        console.log('\n🎉 Admin user fix completed successfully!');
        console.log(`📧 Email: ${email}`);
        console.log(`🆔 User ID: ${authUserId}`);
        console.log(`🔑 Role: admin`);
        console.log('\n📋 Next steps:');
        console.log('1. The admin can now sign in at /auth/signin');
        console.log('2. They will be redirected to /admin/dashboard after login');
        console.log('3. Admin has full access to all admin features');

    } catch (error) {
        console.error('\n❌ Failed to fix admin user:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Fix cancelled');
    rl.close();
    process.exit(0);
});

// Run the script
if (require.main === module) {
    fixAdminUser();
}

module.exports = { fixAdminUser };