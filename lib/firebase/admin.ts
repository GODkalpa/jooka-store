// Firebase Admin SDK configuration for server-side operations (Safe Fallback Mode)
import { initializeApp, getApps, App } from 'firebase-admin/app';

let adminApp: App | undefined;

const dummyDb: any = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => {},
      update: async () => {},
      delete: async () => {},
    }),
    where: () => dummyDb.collection(),
    limit: () => dummyDb.collection(),
    offset: () => dummyDb.collection(),
    orderBy: () => dummyDb.collection(),
    get: async () => ({ docs: [], empty: true }),
    add: async () => ({ id: 'mock_id', get: async () => ({ exists: false, data: () => ({}) }) }),
  }),
  batch: () => ({
    delete: () => {},
    commit: async () => {},
  }),
};

export function initializeAdmin(): any {
  if (adminApp) return adminApp;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'jooka-app';
    adminApp = initializeApp({ projectId });
    return adminApp;
  } catch (error) {
    return undefined;
  }
}

export function getAdminAuth(): any {
  return {
    deleteUser: async () => {},
    getUserByEmail: async () => ({ uid: 'mock', email: '' }),
  };
}

export function getAdminDb(): any {
  return dummyDb;
}

export async function createUserDocument(userId: string, userData: any): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

export async function updateUserProfile(userId: string, profileData: any): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

export async function checkUserExists(userId: string): Promise<boolean> {
  return false;
}

export async function checkUserExistsByEmail(email: string): Promise<{ exists: boolean; user?: any; error?: string }> {
  return { exists: false };
}

export async function getUserData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  return { success: false, error: 'Migrated to Medusa' };
}

export { adminApp };
