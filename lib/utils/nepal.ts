// Nepal-specific utility functions for formatting and validation

import { NEPAL_CURRENCY, NEPAL_PHONE, NEPAL_COUNTRY } from '@/lib/constants/nepal';

/**
 * Format currency amount in Nepalese Rupees
 */
export function formatNPR(amount: number, options?: {
  showSymbol?: boolean;
  showCode?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options || {};

  // Format the number with proper separators
  const formattedAmount = new Intl.NumberFormat('en-NP', {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: true
  }).format(amount);

  // Build the currency string
  let result = '';
  
  if (showSymbol) {
    result = `${NEPAL_CURRENCY.symbol}${NEPAL_CURRENCY.spaceAfterSymbol ? ' ' : ''}${formattedAmount}`;
  } else {
    result = formattedAmount;
  }
  
  if (showCode) {
    result += ` ${NEPAL_CURRENCY.code}`;
  }
  
  return result;
}

/**
 * Parse NPR currency string to number
 */
export function parseNPR(currencyString: string): number {
  // Remove currency symbols and spaces
  const cleanString = currencyString
    .replace(new RegExp(NEPAL_CURRENCY.symbol, 'g'), '')
    .replace(/\s/g, '')
    .replace(/,/g, '');
  
  return parseFloat(cleanString) || 0;
}

/**
 * Validate Nepal phone number
 */
export function validateNepalPhone(phone: string): {
  isValid: boolean;
  formatted?: string;
  type?: 'mobile' | 'landline';
  error?: string;
} {
  // Remove all non-digits and country code
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Remove country code if present
  if (cleanPhone.startsWith('977')) {
    cleanPhone = cleanPhone.substring(3);
  }
  
  // Check length
  if (cleanPhone.length !== NEPAL_PHONE.minLength) {
    return {
      isValid: false,
      error: `Phone number must be ${NEPAL_PHONE.minLength} digits`
    };
  }
  
  // Check if it's a mobile number
  const isMobile = NEPAL_PHONE.mobilePrefix.some(prefix => 
    cleanPhone.startsWith(prefix)
  );
  
  // Check if it's a landline number
  const isLandline = NEPAL_PHONE.landlinePrefix.some(prefix => 
    cleanPhone.startsWith(prefix)
  );
  
  if (!isMobile && !isLandline) {
    return {
      isValid: false,
      error: 'Invalid Nepal phone number format'
    };
  }
  
  // Format the phone number
  const formatted = `${NEPAL_PHONE.countryCode}-${cleanPhone.substring(0, 2)}-${cleanPhone.substring(2)}`;
  
  return {
    isValid: true,
    formatted,
    type: isMobile ? 'mobile' : 'landline'
  };
}

/**
 * Format Nepal phone number for display
 */
export function formatNepalPhone(phone: string, options?: {
  includeCountryCode?: boolean;
  format?: 'international' | 'national' | 'compact';
}): string {
  const { includeCountryCode = true, format = 'international' } = options || {};
  
  const validation = validateNepalPhone(phone);
  if (!validation.isValid) {
    return phone; // Return original if invalid
  }
  
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('977')) {
    cleanPhone = cleanPhone.substring(3);
  }
  
  switch (format) {
    case 'international':
      return includeCountryCode 
        ? `${NEPAL_PHONE.countryCode} ${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2)}`
        : `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2)}`;
    
    case 'national':
      return `0${cleanPhone.substring(0, 2)}-${cleanPhone.substring(2)}`;
    
    case 'compact':
      return includeCountryCode 
        ? `${NEPAL_PHONE.countryCode}${cleanPhone}`
        : cleanPhone;
    
    default:
      return validation.formatted || phone;
  }
}

/**
 * Validate Nepal postal code
 */
export function validateNepalPostalCode(postalCode: string): {
  isValid: boolean;
  error?: string;
} {
  // Nepal postal codes are typically 5 digits
  const cleanCode = postalCode.replace(/\D/g, '');
  
  if (cleanCode.length !== 5) {
    return {
      isValid: false,
      error: 'Postal code must be 5 digits'
    };
  }
  
  return { isValid: true };
}

/**
 * Format Nepal address for display
 */
export function formatNepalAddress(address: {
  street_address_1: string;
  street_address_2?: string;
  municipality_vdc?: string;
  ward_number?: string;
  district: string;
  province: string;
  postal_code?: string;
}): string {
  const parts: string[] = [];
  
  // Street address
  parts.push(address.street_address_1);
  if (address.street_address_2) {
    parts.push(address.street_address_2);
  }
  
  // Municipality/VDC and ward
  let localArea = '';
  if (address.municipality_vdc) {
    localArea = address.municipality_vdc;
    if (address.ward_number) {
      localArea += `, Ward ${address.ward_number}`;
    }
    parts.push(localArea);
  }
  
  // District and province
  parts.push(`${address.district}, ${address.province}`);
  
  // Postal code
  if (address.postal_code) {
    parts.push(`${address.postal_code}, Nepal`);
  } else {
    parts.push('Nepal');
  }
  
  return parts.join('\n');
}

/**
 * Calculate tax for Nepal (VAT)
 */
export function calculateNepalTax(amount: number, taxRate: number = 0.13): {
  taxAmount: number;
  totalWithTax: number;
  taxRate: number;
} {
  const taxAmount = Math.round(amount * taxRate * 100) / 100;
  const totalWithTax = Math.round((amount + taxAmount) * 100) / 100;
  
  return {
    taxAmount,
    totalWithTax,
    taxRate
  };
}

/**
 * Convert USD to NPR (placeholder - in real app, use live exchange rates)
 */
export function convertUSDToNPR(usdAmount: number, exchangeRate: number = 133.5): number {
  return Math.round(usdAmount * exchangeRate * 100) / 100;
}

/**
 * Get Nepal timezone date
 */
export function getNepalDate(): Date {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kathmandu"}));
}

/**
 * Format date for Nepal locale
 */
export function formatNepalDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kathmandu'
  };
  
  return new Intl.DateTimeFormat('en-NP', { ...defaultOptions, ...options }).format(date);
}

/**
 * Validate Nepal national ID (citizenship number) - basic validation
 */
export function validateNepalCitizenshipNumber(citizenshipNumber: string): {
  isValid: boolean;
  error?: string;
} {
  // Remove all non-alphanumeric characters
  const clean = citizenshipNumber.replace(/[^a-zA-Z0-9]/g, '');
  
  // Nepal citizenship numbers are typically in format: XX-XX-XX-XXXXX
  // Where first part is district code, second is VDC/Municipality, third is year, fourth is serial
  if (clean.length < 8 || clean.length > 15) {
    return {
      isValid: false,
      error: 'Invalid citizenship number format'
    };
  }
  
  return { isValid: true };
}

/**
 * Get default Nepal country data
 */
export function getNepalCountryData() {
  return NEPAL_COUNTRY;
}
