// Centralized validation schemas for consistent validation across the platform
import { z } from 'zod';

// Base field validation schemas
export const baseSchemas = {
  // Name validation (first name, last name)
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters'),

  // Email validation
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),

  // Password validation
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),

  // Nepal phone number validation (10 digits, starting with 98 or 97)
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .refine((phone) => phone.startsWith('98') || phone.startsWith('97'), 'Nepal mobile numbers must start with 98 or 97'),

  // Optional phone number validation
  phoneOptional: z.string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .refine((phone) => phone.startsWith('98') || phone.startsWith('97'), 'Nepal mobile numbers must start with 98 or 97')
    .optional(),

  // Address validation
  address: z.string()
    .min(1, 'Address is required')
    .max(255, 'Address must be less than 255 characters'),

  // City/District validation
  city: z.string()
    .min(1, 'City/District is required')
    .max(100, 'City/District must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'City/District contains invalid characters'),

  // State/Province validation
  state: z.string()
    .min(1, 'State/Province is required')
    .max(100, 'State/Province must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'State/Province contains invalid characters'),

  // Nepal postal code validation (5 digits)
  postalCode: z.string()
    .regex(/^[0-9]{5}$/, 'Postal code must be 5 digits')
    .optional(),

  // Country validation
  country: z.string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Country contains invalid characters')
    .default('Nepal'),
};

// Enhanced user registration schema for Firebase
export const userRegistrationSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Full name contains invalid characters'),
  email: baseSchemas.email,
  phone: baseSchemas.phone,
  password: baseSchemas.password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Legacy registration schema (for backward compatibility)
export const legacyUserRegistrationSchema = z.object({
  firstName: baseSchemas.name,
  lastName: baseSchemas.name,
  email: baseSchemas.email,
  phone: baseSchemas.phone,
  password: baseSchemas.password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Enhanced user profile update schema
export const userProfileUpdateSchema = z.object({
  firstName: baseSchemas.name.optional(),
  lastName: baseSchemas.name.optional(),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Full name contains invalid characters')
    .optional(),
  phone: baseSchemas.phoneOptional,
  dateOfBirth: z.string().optional(),
});

// Enhanced address schema for delivery addresses
export const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']).default('shipping'),
  firstName: baseSchemas.name,
  lastName: baseSchemas.name,
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  streetAddress1: baseSchemas.address,
  streetAddress2: z.string().max(255, 'Address line 2 must be less than 255 characters').optional(),
  city: baseSchemas.city,
  state: baseSchemas.state,
  postalCode: baseSchemas.postalCode.optional(),
  country: baseSchemas.country,
  phone: baseSchemas.phoneOptional,
  deliveryInstructions: z.string().max(500, 'Delivery instructions must be less than 500 characters').optional(),
  isDefault: z.boolean().default(false),
});

// Address update schema (for editing existing addresses)
export const addressUpdateSchema = z.object({
  type: z.enum(['shipping', 'billing']).optional(),
  firstName: baseSchemas.name.optional(),
  lastName: baseSchemas.name.optional(),
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  streetAddress1: baseSchemas.address.optional(),
  streetAddress2: z.string().max(255, 'Address line 2 must be less than 255 characters').optional(),
  city: baseSchemas.city.optional(),
  state: baseSchemas.state.optional(),
  postalCode: baseSchemas.postalCode.optional(),
  country: baseSchemas.country.optional(),
  phone: baseSchemas.phoneOptional,
  deliveryInstructions: z.string().max(500, 'Delivery instructions must be less than 500 characters').optional(),
  isDefault: z.boolean().optional(),
});

// Checkout form schema
export const checkoutFormSchema = z.object({
  email: baseSchemas.email,
  firstName: baseSchemas.name,
  lastName: baseSchemas.name,
  phone: baseSchemas.phone,
  address: baseSchemas.address,
  city: baseSchemas.city,
  state: baseSchemas.state,
  zipCode: baseSchemas.postalCode.optional(),
  country: baseSchemas.country,
});

// Password update schema
export const passwordUpdateSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: baseSchemas.password,
  confirmPassword: z.string(),
  accessToken: z.string().optional(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Export types for TypeScript
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type UserProfileUpdateData = z.infer<typeof userProfileUpdateSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type PasswordUpdateData = z.infer<typeof passwordUpdateSchema>;

// Validation helper functions
export const validateUserRegistration = (data: any) => userRegistrationSchema.safeParse(data);
export const validateLegacyUserRegistration = (data: any) => legacyUserRegistrationSchema.safeParse(data);
export const validateUserProfileUpdate = (data: any) => userProfileUpdateSchema.safeParse(data);
export const validateAddress = (data: any) => addressSchema.safeParse(data);
export const validateAddressUpdate = (data: any) => addressUpdateSchema.safeParse(data);
export const validateCheckoutForm = (data: any) => checkoutFormSchema.safeParse(data);
export const validatePasswordUpdate = (data: any) => passwordUpdateSchema.safeParse(data);

// Utility function to format validation errors for display
export const formatValidationErrors = (errors: any[]) => {
  return errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
};

// Utility function to validate and format errors in one call
export const validateAndFormatErrors = (schema: any, data: any) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: formatValidationErrors(result.error.errors),
      data: null
    };
  }
  return {
    isValid: true,
    errors: null,
    data: result.data
  };
};

// Phone number formatting utility
export const formatPhoneNumber = (phone: string) => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If it starts with 977, remove the country code
  if (cleaned.startsWith('977')) {
    return cleaned.substring(3);
  }

  return cleaned;
};

// Phone number validation utility
export const isValidNepalPhone = (phone: string) => {
  const cleaned = formatPhoneNumber(phone);
  return /^(98|97)[0-9]{8}$/.test(cleaned);
};
