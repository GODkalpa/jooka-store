// Shared service for managing pending registrations
// In production, this should be replaced with Redis or a database

import fs from 'fs';
import path from 'path';

export interface PendingRegistrationData {
  data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  otpCode: string;
  timestamp: number;
  attempts: number;
}

// Use file-based storage for development (in production, use Redis or database)
const STORAGE_FILE = path.join(process.cwd(), '.tmp', 'pending-registrations.json');

// Ensure storage directory exists
const ensureStorageDir = () => {
  const dir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Load pending registrations from file
const loadPendingRegistrations = (): Map<string, PendingRegistrationData> => {
  try {
    ensureStorageDir();
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const obj = JSON.parse(data);
      return new Map(Object.entries(obj));
    }
  } catch (error) {
    console.warn('Failed to load pending registrations:', error);
  }
  return new Map();
};

// Save pending registrations to file
const savePendingRegistrations = (registrations: Map<string, PendingRegistrationData>) => {
  try {
    ensureStorageDir();
    const obj = Object.fromEntries(registrations);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.warn('Failed to save pending registrations:', error);
  }
};

export class PendingRegistrationService {
  // Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Clean up expired registrations (older than 10 minutes)
  static cleanupExpired(): void {
    const registrations = loadPendingRegistrations();
    const now = Date.now();
    const expireTime = 10 * 60 * 1000; // 10 minutes
    let hasChanges = false;

    for (const [email, registration] of registrations.entries()) {
      if (now - registration.timestamp > expireTime) {
        registrations.delete(email);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      savePendingRegistrations(registrations);
    }
  }

  // Store pending registration
  static store(email: string, data: PendingRegistrationData): void {
    const registrations = loadPendingRegistrations();
    registrations.set(email, data);
    savePendingRegistrations(registrations);
  }

  // Get pending registration
  static get(email: string): PendingRegistrationData | undefined {
    const registrations = loadPendingRegistrations();
    return registrations.get(email);
  }

  // Delete pending registration
  static delete(email: string): boolean {
    const registrations = loadPendingRegistrations();
    const result = registrations.delete(email);
    savePendingRegistrations(registrations);
    return result;
  }

  // Check if registration exists and is valid
  static isValid(email: string): { valid: boolean; error?: string } {
    const registrations = loadPendingRegistrations();
    const registration = registrations.get(email);

    if (!registration) {
      return { valid: false, error: 'No pending registration found for this email' };
    }

    // Check if registration has expired
    const now = Date.now();
    const expireTime = 10 * 60 * 1000; // 10 minutes
    if (now - registration.timestamp > expireTime) {
      registrations.delete(email);
      savePendingRegistrations(registrations);
      return { valid: false, error: 'Registration has expired. Please start over.' };
    }

    return { valid: true };
  }

  // Verify OTP
  static verifyOTP(email: string, otpCode: string): { success: boolean; error?: string } {
    const registrations = loadPendingRegistrations();
    const registration = registrations.get(email);

    if (!registration) {
      return { success: false, error: 'No pending registration found for this email' };
    }

    // Check if registration has expired
    const validity = this.isValid(email);
    if (!validity.valid) {
      return { success: false, error: validity.error };
    }

    // Verify OTP
    if (registration.otpCode !== otpCode) {
      return { success: false, error: 'Invalid verification code' };
    }

    return { success: true };
  }

  // Get all pending registrations (for debugging)
  static getAll(): Map<string, PendingRegistrationData> {
    return loadPendingRegistrations();
  }

  // Clear all pending registrations (for testing)
  static clear(): void {
    const registrations = loadPendingRegistrations();
    registrations.clear();
    savePendingRegistrations(registrations);
  }
}
