// User avatar upload API route
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database/index';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadAvatar(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (2MB max for avatars)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get current avatar to delete old one
    const currentUser = await db.getUser(user.id);
    const currentAvatarUrl = currentUser.data?.profile?.avatar_url;

    // Upload new avatar to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'jooka/avatars',
          public_id: `avatar_${user.id}`,
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
            { radius: 'max' } // Make it circular
          ],
          overwrite: true, // Replace existing avatar
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const result = uploadResult as any;

    // Update user profile with new avatar URL
    const updateResult = await db.updateUserProfile(user.id, {
      avatar_url: result.secure_url,
    });

    if (updateResult.error) {
      // If profile update fails, delete the uploaded image
      await cloudinary.uploader.destroy(result.public_id);
      return NextResponse.json(
        { error: 'Failed to update profile with new avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: result.secure_url,
        publicId: result.public_id,
      },
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

async function deleteAvatar(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    // Get current user to get avatar info
    const currentUser = await db.getUser(user.id);
    const currentAvatarUrl = currentUser.data?.profile?.avatar_url;

    if (!currentAvatarUrl) {
      return NextResponse.json(
        { error: 'No avatar to delete' },
        { status: 400 }
      );
    }

    // Extract public ID from Cloudinary URL
    const publicId = `avatar_${user.id}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(`jooka/avatars/${publicId}`);

    // Update user profile to remove avatar URL
    const updateResult = await db.updateUserProfile(user.id, {
      avatar_url: undefined,
    });

    if (updateResult.error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Avatar deleted successfully',
    });

  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(uploadAvatar);
export const DELETE = withAuth(deleteAvatar);