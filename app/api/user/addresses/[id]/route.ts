// Individual address management API routes
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { z } from 'zod';
import { baseSchemas } from '@/lib/validation/schemas';

// Use the centralized address update schema
import { addressUpdateSchema } from '@/lib/validation/schemas';

async function updateAddress(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const addressId = params.id;

  try {
    // Get user from Firebase Auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await getAdminAuth().verifyIdToken(token);
    } catch (authError) {
      console.error('Auth token verification failed:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const body = await request.json();
    const validationResult = addressUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date()
    };

    // Only add fields that have values (not empty strings or undefined)
    if (validationResult.data.type) updateData.type = validationResult.data.type;
    if (validationResult.data.firstName) updateData.first_name = validationResult.data.firstName;
    if (validationResult.data.lastName) updateData.last_name = validationResult.data.lastName;
    if (validationResult.data.streetAddress1) updateData.address_line_1 = validationResult.data.streetAddress1;
    if (validationResult.data.city) updateData.city = validationResult.data.city;
    if (validationResult.data.state) updateData.state = validationResult.data.state;
    if (validationResult.data.country) updateData.country = validationResult.data.country;

    // Handle optional fields - only add if they have meaningful values
    if (validationResult.data.company && validationResult.data.company.trim()) {
      updateData.company = validationResult.data.company;
    }
    if (validationResult.data.streetAddress2 && validationResult.data.streetAddress2.trim()) {
      updateData.address_line_2 = validationResult.data.streetAddress2;
    }
    if (validationResult.data.postalCode && validationResult.data.postalCode.trim()) {
      updateData.postal_code = validationResult.data.postalCode;
    }
    if (validationResult.data.phone && validationResult.data.phone.trim()) {
      updateData.phone = validationResult.data.phone;
    }
    if (validationResult.data.deliveryInstructions && validationResult.data.deliveryInstructions.trim()) {
      updateData.delivery_instructions = validationResult.data.deliveryInstructions;
    }
    if (validationResult.data.isDefault !== undefined) {
      updateData.is_default = validationResult.data.isDefault;
    }

    const db = getAdminDb();

    // Verify the address belongs to the user
    const addressDoc = await db.collection('addresses').doc(addressId).get();
    if (!addressDoc.exists) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const addressData = addressDoc.data();
    if (addressData?.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If setting as default, unset other default addresses first
    if (updateData.is_default) {
      const existingDefaultAddresses = await db.collection('addresses')
        .where('user_id', '==', userId)
        .where('is_default', '==', true)
        .get();

      const batch = db.batch();
      existingDefaultAddresses.docs.forEach(doc => {
        if (doc.id !== addressId) {
          batch.update(doc.ref, { is_default: false, updated_at: new Date() });
        }
      });
      await batch.commit();
    }

    // Update the address
    await addressDoc.ref.update(updateData);
    const updatedAddress = { id: addressId, ...addressData, ...updateData };

    return NextResponse.json({
      message: 'Address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

async function deleteAddress(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const addressId = params.id;

  try {
    // Get user from Firebase Auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await getAdminAuth().verifyIdToken(token);
    } catch (authError) {
      console.error('Auth token verification failed:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const db = getAdminDb();

    // Verify the address belongs to the user
    const addressDoc = await db.collection('addresses').doc(addressId).get();
    if (!addressDoc.exists) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const addressData = addressDoc.data();
    if (addressData?.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the address
    await addressDoc.ref.delete();

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}

export const PUT = updateAddress;
export const DELETE = deleteAddress;