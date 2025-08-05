// Database service utilities for JOOKA E-commerce Platform
import { FirebaseDatabaseService } from './firebase-service';

// Always use client SDK for the main export to avoid server-side imports on client
export const db = new FirebaseDatabaseService();

// For backward compatibility, also export as DatabaseService
export class DatabaseService extends FirebaseDatabaseService {}

// Export client service explicitly
export const clientDb = new FirebaseDatabaseService();

// Export types for convenience
export type * from '@/types/firebase';