// User addresses management API routes
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { z } from 'zod';
import { addressSchema } from '@/lib/validation/schemas';

// Use centralized validation schema
const createAddressSchema = addressSchema;

async function getAddresses(request: NextRequest) {
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

    // Get user addresses
    const addressesSnapshot = await db.collection('addresses')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    const addresses = addressesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ data: addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

async function createAddress(request: NextRequest) {
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
    const validationResult = createAddressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const addressData: any = {
      user_id: userId,
      type: validationResult.data.type,
      first_name: validationResult.data.firstName,
      last_name: validationResult.data.lastName,
      address_line_1: validationResult.data.streetAddress1,
      city: validationResult.data.city,
      state: validationResult.data.state,
      country: validationResult.data.country,
      is_default: validationResult.data.isDefault,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Only add optional fields if they have values (not empty strings or undefined)
    if (validationResult.data.company && validationResult.data.company.trim()) {
      addressData.company = validationResult.data.company;
    }
    if (validationResult.data.streetAddress2 && validationResult.data.streetAddress2.trim()) {
      addressData.address_line_2 = validationResult.data.streetAddress2;
    }
    if (validationResult.data.postalCode && validationResult.data.postalCode.trim()) {
      addressData.postal_code = validationResult.data.postalCode;
    }
    if (validationResult.data.phone && validationResult.data.phone.trim()) {
      addressData.phone = validationResult.data.phone;
    }
    if (validationResult.data.deliveryInstructions && validationResult.data.deliveryInstructions.trim()) {
      addressData.delivery_instructions = validationResult.data.deliveryInstructions;
    }

    const db = getAdminDb();

    // If this is set as default, unset other default addresses first
    if (addressData.is_default) {
      const existingDefaultAddresses = await db.collection('addresses')
        .where('user_id', '==', userId)
        .where('is_default', '==', true)
        .get();

      const batch = db.batch();
      existingDefaultAddresses.docs.forEach(doc => {
        batch.update(doc.ref, { is_default: false, updated_at: new Date() });
      });
      await batch.commit();
    }

    // Create new address
    const addressRef = await db.collection('addresses').add(addressData);
    const newAddress = { id: addressRef.id, ...addressData };

    return NextResponse.json({
      message: 'Address created successfully',
      data: newAddress
    }, { status: 201 });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}

export const GET = getAddresses;
export const POST = createAddress;