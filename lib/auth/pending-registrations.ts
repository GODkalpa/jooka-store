// Shared storage for pending registrations
// In production, this should be replaced with Redis or database storage

export interface PendingRegistration {
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  otpCode: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// In-memory storage (replace with Redis in production)
const pendingRegistrations = new Map<string, PendingRegistration>();

// Cleanup expired registrations every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, registration] of pendingRegistrations.entries()) {
    if (now > registration.expiresAt) {
      pendingRegistrations.delete(email);
      console.log(`Cleaned up expired registration for: ${email}`);
    }
  }
}, 5 * 60 * 1000);

export class PendingRegistrationService {
  static store(email: string, registration: PendingRegistration): void {
    pendingRegistrations.set(email, registration);
  }

  static get(email: string): PendingRegistration | undefined {
    return pendingRegistrations.get(email);
  }

  static delete(email: string): boolean {
    return pendingRegistrations.delete(email);
  }

  static incrementAttempts(email: string): boolean {
    const registration = pendingRegistrations.get(email);
    if (registration) {
      registration.attempts++;
      return true;
    }
    return false;
  }

  static isExpired(email: string): boolean {
    const registration = pendingRegistrations.get(email);
    if (!registration) return true;
    return Date.now() > registration.expiresAt;
  }

  static getAttempts(email: string): number {
    const registration = pendingRegistrations.get(email);
    return registration ? registration.attempts : 0;
  }

  static clear(): void {
    pendingRegistrations.clear();
  }

  static size(): number {
    return pendingRegistrations.size;
  }

  // Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}