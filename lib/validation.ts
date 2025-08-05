// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 6 characters to match simplified requirements
  return password.length >= 6;
}

// Phone validation for Nepal
export const isValidPhone = (phone: string): boolean => {
  // Remove all non-digits
  const cleanPhone = phone.replace(/\D/g, '');

  // Check if it starts with country code +977
  if (cleanPhone.startsWith('977')) {
    const localNumber = cleanPhone.substring(3);
    // Nepal mobile numbers: 98XXXXXXXX or 97XXXXXXXX (10 digits total)
    // Nepal landline numbers: 01XXXXXXXX, 02XXXXXXXX, etc. (10 digits total)
    return localNumber.length === 10 &&
           (localNumber.startsWith('98') || localNumber.startsWith('97') ||
            /^0[1-9]/.test(localNumber));
  }

  // If no country code, check for 10-digit Nepal number
  if (cleanPhone.length === 10) {
    return cleanPhone.startsWith('98') || cleanPhone.startsWith('97') ||
           /^0[1-9]/.test(cleanPhone);
  }

  return false;
}

// Generic validation helper
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Additional validation functions for auth
export const validateEmail = (email: string): boolean => {
  return isValidEmail(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 6 characters to match simplified requirements
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  // Only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.trim().length > 0;
};

export const validatePhone = (phone: string): boolean => {
  return isValidPhone(phone);
};

// Nepal postal code validation
export const validateNepalPostalCode = (postalCode: string): boolean => {
  // Nepal postal codes are 5 digits
  const cleanCode = postalCode.replace(/\D/g, '');
  return cleanCode.length === 5;
};