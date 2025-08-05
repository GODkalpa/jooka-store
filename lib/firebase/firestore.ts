// Firestore database utilities for JOOKA E-commerce Platform
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { getFirebaseDb } from './config';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  PRODUCT_VARIANTS: 'product_variants',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CART_ITEMS: 'cart_items',
  ADDRESSES: 'addresses',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  INVENTORY_TRANSACTIONS: 'inventory_transactions'
} as const;

/**
 * Generic function to get a document by ID
 */
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to get multiple documents with query
 */
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to add a document
 */
export async function addDocument<T>(
  collectionName: string,
  data: Omit<T, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const collectionRef = collection(db, collectionName);
    const docData = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    const docRef = await addDoc(collectionRef, docData);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document
 */
export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<Omit<T, 'id' | 'created_at'>>
): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, collectionName, docId);
    const updateData = {
      ...data,
      updated_at: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Paginated query function
 */
export async function getPaginatedDocuments<T>(
  collectionName: string,
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot,
  constraints: QueryConstraint[] = []
): Promise<{ documents: T[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const collectionRef = collection(db, collectionName);
    let queryConstraints = [...constraints, limit(pageSize + 1)];
    
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }
    
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.slice(0, pageSize).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
    
    const hasMore = querySnapshot.docs.length > pageSize;
    const newLastDoc = hasMore ? querySnapshot.docs[pageSize - 1] : null;
    
    return { documents, lastDoc: newLastDoc, hasMore };
  } catch (error) {
    console.error(`Error getting paginated documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Batch write operations
 */
export async function batchWrite(operations: Array<{
  type: 'add' | 'update' | 'delete';
  collection: string;
  id?: string;
  data?: any;
}>): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const batch = writeBatch(db);

    operations.forEach(operation => {
      switch (operation.type) {
        case 'add':
          const addRef = doc(collection(db, operation.collection));
          batch.set(addRef, {
            ...operation.data,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });
          break;
          
        case 'update':
          if (!operation.id) throw new Error('ID required for update operation');
          const updateRef = doc(db, operation.collection, operation.id);
          batch.update(updateRef, {
            ...operation.data,
            updated_at: serverTimestamp()
          });
          break;
          
        case 'delete':
          if (!operation.id) throw new Error('ID required for delete operation');
          const deleteRef = doc(db, operation.collection, operation.id);
          batch.delete(deleteRef);
          break;
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error in batch write:', error);
    throw error;
  }
}

/**
 * Transaction helper
 */
export async function runFirestoreTransaction<T>(
  updateFunction: (transaction: any) => Promise<T>
): Promise<T> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    return await runTransaction(db, updateFunction);
  } catch (error) {
    console.error('Error in transaction:', error);
    throw error;
  }
}
