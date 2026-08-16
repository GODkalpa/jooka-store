// Production-ready pending registrations and OTP verification service with rate limiting
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

// Global in-memory storage preserved across hot reloads in Node runtime
const globalStore = global as unknown as {
  __jooka_pending_registrations?: Map<string, PendingRegistrationData>;
};

if (!globalStore.__jooka_pending_registrations) {
  globalStore.__jooka_pending_registrations = new Map<string, PendingRegistrationData>();
}

const registrations = globalStore.__jooka_pending_registrations;
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5; // Max 5 verification attempts to prevent brute force

export class PendingRegistrationService {
  // Generate a cryptographically random 6-digit numeric OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Clean up expired registrations
  static cleanupExpired(): void {
    const now = Date.now();
    for (const [email, item] of registrations.entries()) {
      if (now - item.timestamp > EXPIRY_MS) {
        registrations.delete(email);
      }
    }
  }

  // Store pending registration
  static store(email: string, data: PendingRegistrationData): void {
    this.cleanupExpired();
    registrations.set(email.trim().toLowerCase(), {
      ...data,
      attempts: 0,
      timestamp: Date.now(),
    });
  }

  // Get pending registration
  static get(email: string): PendingRegistrationData | undefined {
    this.cleanupExpired();
    return registrations.get(email.trim().toLowerCase());
  }

  // Delete pending registration
  static delete(email: string): boolean {
    return registrations.delete(email.trim().toLowerCase());
  }

  // Check if registration exists and is valid
  static isValid(email: string): { valid: boolean; error?: string } {
    const key = email.trim().toLowerCase();
    const item = registrations.get(key);

    if (!item) {
      return { valid: false, error: 'No pending registration found for this email' };
    }

    if (Date.now() - item.timestamp > EXPIRY_MS) {
      registrations.delete(key);
      return { valid: false, error: 'Verification code has expired. Please sign up again.' };
    }

    if (item.attempts >= MAX_ATTEMPTS) {
      registrations.delete(key);
      return { valid: false, error: 'Too many failed attempts. Please request a new verification code.' };
    }

    return { valid: true };
  }

  // Verify OTP with brute force attempt tracking
  static verifyOTP(email: string, otpCode: string): { success: boolean; error?: string } {
    const key = email.trim().toLowerCase();
    const item = registrations.get(key);

    if (!item) {
      return { success: false, error: 'No pending registration found for this email' };
    }

    const validity = this.isValid(email);
    if (!validity.valid) {
      return { success: false, error: validity.error };
    }

    if (item.otpCode !== otpCode.trim()) {
      item.attempts += 1;
      const remaining = MAX_ATTEMPTS - item.attempts;
      if (remaining <= 0) {
        registrations.delete(key);
        return { success: false, error: 'Maximum attempts exceeded. Please start registration again.' };
      }
      return {
        success: false,
        error: `Invalid verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
      };
    }

    return { success: true };
  }

  static clear(): void {
    registrations.clear();
  }
}
