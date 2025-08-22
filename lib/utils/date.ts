// Date utility functions for consistent date handling across the application

/**
 * Converts Firestore Timestamp or any date value to ISO string
 * @param dateValue - The date value from Firestore (could be Timestamp, Date, or string)
 * @returns ISO string or null if invalid
 */
export function convertFirestoreDate(dateValue: any): string | null {
  try {
    if (!dateValue) {
      return null;
    }

    // If it's a Firestore Timestamp (client or admin SDK), convert to Date first
    if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toISOString();
    }

    // If it's a Firestore Admin Timestamp with seconds and nanoseconds
    if (dateValue?._seconds !== undefined && dateValue?._nanoseconds !== undefined) {
      const date = new Date(dateValue._seconds * 1000 + dateValue._nanoseconds / 1000000);
      return date.toISOString();
    }

    // If it has seconds and nanoseconds properties (another Admin SDK format)
    if (dateValue?.seconds !== undefined && dateValue?.nanoseconds !== undefined) {
      const date = new Date(dateValue.seconds * 1000 + dateValue.nanoseconds / 1000000);
      return date.toISOString();
    }

    // Handle Firebase Admin SDK timestamp that might appear as empty-looking object
    if (typeof dateValue === 'object' && dateValue !== null) {
      // Check if it has any timestamp-like properties
      const keys = Object.keys(dateValue);
      
      // If it's an empty object, skip it silently
      if (keys.length === 0) {
        return null;
      }

      // Check for various Firebase timestamp formats
      if (dateValue._seconds || dateValue.seconds) {
        const seconds = dateValue._seconds || dateValue.seconds;
        const nanoseconds = dateValue._nanoseconds || dateValue.nanoseconds || 0;
        const date = new Date(seconds * 1000 + nanoseconds / 1000000);
        return date.toISOString();
      }

      // Check if it has a valueOf method (some timestamps might)
      if (typeof dateValue.valueOf === 'function') {
        const timestamp = dateValue.valueOf();
        if (typeof timestamp === 'number') {
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
      }

      // Log unknown object format for debugging
      console.warn('convertFirestoreDate: Unknown object format:', dateValue, 'Keys:', keys);
    }

    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }

    // If it's a string, try to parse it
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // If it's a number (timestamp)
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return null;
  } catch (error) {
    // Only log meaningful errors, not empty object conversions
    if (dateValue && typeof dateValue === 'object' && Object.keys(dateValue).length > 0) {
      console.error('Date conversion error:', error, 'Input:', dateValue);
    }
    return null;
  }
}

/**
 * Safe date formatting function for display
 * @param dateValue - The date value to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or fallback message
 */
export function formatSafeDate(
  dateValue: any, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kathmandu'
  }
): string {
  try {
    if (!dateValue || dateValue === undefined || dateValue === null) {
      return 'No Date';
    }
    
    // Check for empty objects first
    if (typeof dateValue === 'object' && 
        dateValue !== null && 
        Object.keys(dateValue).length === 0) {
      return 'No Date';
    }

    // Handle different input types more robustly
    let date: Date | null = null;

    // If it's already a Date object
    if (dateValue instanceof Date) {
      date = dateValue;
    }
    // If it's a Firestore Timestamp (client or admin SDK)
    else if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    }
    // If it's a Firestore Admin Timestamp with seconds and nanoseconds
    else if (dateValue?._seconds !== undefined) {
      date = new Date(dateValue._seconds * 1000 + (dateValue._nanoseconds || 0) / 1000000);
    }
    else if (dateValue?.seconds !== undefined) {
      date = new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
    }
    // If it's a string
    else if (typeof dateValue === 'string') {
      // Try parsing ISO string first
      if (dateValue.includes('T') || dateValue.includes('Z')) {
        date = new Date(dateValue);
      } else {
        // Try other common formats
        date = new Date(dateValue);
      }
    }
    // If it's a number (timestamp in milliseconds)
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    }
    // Fallback: try converting through our utility
    else {
      const isoString = convertFirestoreDate(dateValue);
      if (isoString) {
        date = new Date(isoString);
      }
    }

    // Validate the date
    if (!date || isNaN(date.getTime())) {
      // Only log warning for non-empty objects to reduce console noise
      if (dateValue && typeof dateValue === 'object' && Object.keys(dateValue).length > 0) {
        console.warn('formatSafeDate: Could not parse date:', dateValue);
      }
      return 'No Date';
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Date formatting error:', error, 'Input was:', dateValue);
    return 'Format Error';
  }
}

/**
 * Converts an object's date fields from Firestore Timestamps to ISO strings
 * @param obj - Object containing potential date fields
 * @param dateFields - Array of field names that contain dates
 * @returns Object with converted date fields
 */
export function convertObjectDates<T extends Record<string, any>>(
  obj: T, 
  dateFields: string[] = ['created_at', 'updated_at', 'shipped_at', 'delivered_at']
): T {
  const converted = { ...obj } as Record<string, any>;
  
  for (const field of dateFields) {
    if (converted[field] !== undefined && converted[field] !== null) {
      // Check if it's an empty object first
      if (typeof converted[field] === 'object' && 
          converted[field] !== null && 
          Object.keys(converted[field]).length === 0) {
        // Remove empty timestamp objects to avoid errors
        delete converted[field];
        continue;
      }
      
      const convertedDate = convertFirestoreDate(converted[field]);
      if (convertedDate) {
        converted[field] = convertedDate;
      } else {
        // If conversion fails, remove the field to avoid displaying invalid dates
        delete converted[field];
      }
    }
  }
  
  return converted as T;
}

/**
 * Debug utility function to help diagnose date formatting issues
 * @param dateValue - The date value to debug
 * @returns Debug information about the date value
 */
export function debugDateValue(dateValue: any): {
  type: string;
  value: any;
  converted: string | null;
  formatted: string;
  isValid: boolean;
} {
  const type = typeof dateValue;
  const converted = convertFirestoreDate(dateValue);
  const formatted = formatSafeDate(dateValue);
  const isValid = formatted !== 'Invalid Date' && formatted !== 'Format Error' && formatted !== 'No Date';

  return {
    type: `${type} ${dateValue?.constructor?.name || ''}`.trim(),
    value: dateValue,
    converted,
    formatted,
    isValid
  };
}