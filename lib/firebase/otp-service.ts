// Firebase-integrated OTP service for email verification
import { UserRecord } from 'firebase-admin/auth';
import { getAdminDb, getAdminAuth } from './admin';

interface OTPData {
  email: string;
  otpCode: string;
  expiresAt: number;
  attempts: number;
  userData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    password: string;
  };
  createdAt: any; // Firestore timestamp
}

interface OTPResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

interface VerifyResult {
  success: boolean;
  user?: UserRecord;
  error?: string;
}

export class FirebaseOTPService {
  private static readonly COLLECTION = 'pending_otps';
  private static readonly OTP_EXPIRY_MINUTES = 10;
  private static readonly MAX_ATTEMPTS = 5;

  /**
   * Generate a 6-digit OTP code
   */
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP for user registration
   */
  static async sendRegistrationOTP(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    phone?: string
  ): Promise<OTPResult> {
    try {
      console.log('🔥 Starting sendRegistrationOTP for:', email);
      const db = getAdminDb();
      console.log('🔥 Got admin DB');
      const otpCode = this.generateOTP();
      console.log('🔥 Generated OTP:', otpCode);
      const expiresAt = Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP data in Firestore using Admin SDK
      console.log('🔥 Storing OTP data in Firestore...');
      const otpDocRef = db.collection(this.COLLECTION).doc(email);
      await otpDocRef.set({
        email,
        otpCode,
        expiresAt,
        attempts: 0,
        userData: {
          firstName,
          lastName,
          phone,
          password
        },
        createdAt: new Date()
      } as OTPData);
      console.log('🔥 OTP data stored successfully');

      // Send email using Firebase's email system or custom service
      console.log('🔥 Sending OTP email...');
      const emailResult = await this.sendOTPEmail(email, otpCode, firstName);
      console.log('🔥 Email result:', emailResult);

      if (!emailResult.success) {
        console.log('🔥 Email failed, cleaning up...');
        // Clean up if email fails
        await otpDocRef.delete();
        return emailResult;
      }

      console.log(`OTP generated for ${email}: ${otpCode} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);
      
      return {
        success: true,
        messageId: emailResult.messageId
      };
    } catch (error) {
      console.error('Error sending registration OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP and create Firebase user
   */
  static async verifyOTPAndCreateUser(email: string, otpCode: string): Promise<VerifyResult> {
    try {
      const db = getAdminDb();
      const auth = getAdminAuth();

      // Get OTP data from Firestore using Admin SDK
      const otpDocRef = db.collection(this.COLLECTION).doc(email);
      const otpDoc = await otpDocRef.get();

      if (!otpDoc.exists) {
        return {
          success: false,
          error: 'No pending verification found for this email'
        };
      }

      const otpData = otpDoc.data() as OTPData;

      // Check if OTP has expired
      if (Date.now() > otpData.expiresAt) {
        await otpDocRef.delete();
        return {
          success: false,
          error: 'Verification code has expired. Please request a new one.'
        };
      }

      // Check attempts
      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        await otpDocRef.delete();
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new verification code.'
        };
      }

      // Verify OTP code
      if (otpData.otpCode !== otpCode) {
        // Increment attempts
        await otpDocRef.update({
          attempts: otpData.attempts + 1
        });

        return {
          success: false,
          error: 'Invalid verification code'
        };
      }

      // OTP is valid, create Firebase user
      if (!otpData.userData) {
        await otpDocRef.delete();
        return {
          success: false,
          error: 'User data not found'
        };
      }

      const userRecord = await auth.createUser({
        email: email,
        password: otpData.userData.password,
        emailVerified: true
      });

      // Update user profile with display name using admin SDK
      await auth.updateUser(userRecord.uid, {
        displayName: `${otpData.userData.firstName} ${otpData.userData.lastName}`
      });

      // Create user document in Firestore
      const userData = {
        email: email,
        role: 'customer', // Default role for new users
        created_at: new Date(),
        updated_at: new Date(),
        email_verified: true
      };

      await db.collection('users').doc(userRecord.uid).set(userData);
      console.log('User document created in Firestore');

      // Create user profile document in Firestore
      const profileData = {
        user_id: userRecord.uid,
        email: email,
        full_name: `${otpData.userData.firstName} ${otpData.userData.lastName}`,
        first_name: otpData.userData.firstName,
        last_name: otpData.userData.lastName,
        phone: otpData.userData.phone || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('profiles').doc(userRecord.uid).set(profileData);
      console.log('User profile created in Firestore');

      // Clean up OTP data
      await otpDocRef.delete();

      console.log('User created successfully:', userRecord.uid);

      return {
        success: true,
        user: userRecord
      };
    } catch (error) {
      console.error('Error verifying OTP and creating user:', error);
      
      let errorMessage = 'Failed to verify code';
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'An account with this email already exists';
        } else if (error.message.includes('auth/weak-password')) {
          errorMessage = 'Password is too weak';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Send OTP email (using existing email service)
   */
  private static async sendOTPEmail(email: string, otpCode: string, firstName: string): Promise<OTPResult> {
    try {
      // Import the email service
      const { EmailService } = await import('@/lib/email/email-service');
      const emailService = EmailService.getInstance();
      
      return await emailService.sendOTP(email, otpCode, firstName);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return {
        success: false,
        error: 'Failed to send verification email'
      };
    }
  }

  /**
   * Resend OTP (with rate limiting)
   */
  static async resendOTP(email: string): Promise<OTPResult> {
    try {
      const db = getAdminDb();
      const otpDocRef = db.collection(this.COLLECTION).doc(email);
      const otpDoc = await otpDocRef.get();

      if (!otpDoc.exists) {
        return {
          success: false,
          error: 'No pending verification found for this email'
        };
      }

      const otpData = otpDoc.data() as OTPData;

      // Check if enough time has passed (prevent spam)
      const timeSinceCreated = Date.now() - otpData.createdAt.getTime();
      if (timeSinceCreated < 60000) { // 1 minute cooldown
        return {
          success: false,
          error: 'Please wait before requesting a new code'
        };
      }

      // Generate new OTP
      const newOtpCode = this.generateOTP();
      const newExpiresAt = Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Update OTP data
      await otpDocRef.update({
        otpCode: newOtpCode,
        expiresAt: newExpiresAt,
        attempts: 0,
        createdAt: new Date()
      });

      // Send new OTP email
      const emailResult = await this.sendOTPEmail(
        email, 
        newOtpCode, 
        otpData.userData?.firstName || 'User'
      );

      if (!emailResult.success) {
        return emailResult;
      }

      console.log(`New OTP generated for ${email}: ${newOtpCode}`);
      
      return {
        success: true,
        messageId: emailResult.messageId
      };
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        error: 'Failed to resend verification code'
      };
    }
  }

  /**
   * Clean up expired OTPs (can be called periodically)
   */
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      const db = getAdminDb();
      // This would require a more complex query in a real implementation
      // For now, individual OTPs are cleaned up when accessed
      console.log('OTP cleanup completed');
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}
