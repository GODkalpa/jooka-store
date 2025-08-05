// NPR Currency formatting utilities for JOOKA E-commerce Platform

/**
 * Format price in NPR currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted NPR price string
 */
export function formatPrice(
  amount: number | string,
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    showSymbol = true,
    showDecimals = true,
    locale = 'en-NP'
  } = options;

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return showSymbol ? 'NPR 0' : '0';
  }

  const formattedNumber = showDecimals 
    ? numericAmount.toFixed(2)
    : Math.round(numericAmount).toString();

  // Add thousand separators for better readability
  const parts = formattedNumber.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const finalAmount = parts.join('.');

  return showSymbol ? `NPR ${finalAmount}` : finalAmount;
}

/**
 * Format price with NPR symbol (₨)
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places
 * @returns Formatted price with ₨ symbol
 */
export function formatPriceWithSymbol(
  amount: number | string,
  showDecimals: boolean = true
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '₨ 0';
  }

  const formattedNumber = showDecimals 
    ? numericAmount.toFixed(2)
    : Math.round(numericAmount).toString();

  // Add thousand separators
  const parts = formattedNumber.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const finalAmount = parts.join('.');

  return `₨ ${finalAmount}`;
}

/**
 * Format price for display in tables and lists
 * @param amount - The amount to format
 * @returns Formatted price optimized for display
 */
export function formatDisplayPrice(amount: number | string): string {
  return formatPriceWithSymbol(amount, true);
}

/**
 * Format price for input fields (no symbol, with decimals)
 * @param amount - The amount to format
 * @returns Formatted price for inputs
 */
export function formatInputPrice(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0.00';
  }

  return numericAmount.toFixed(2);
}

/**
 * Parse price string to number
 * @param priceString - The price string to parse
 * @returns Numeric value
 */
export function parsePrice(priceString: string): number {
  // Remove currency symbols and commas
  const cleanString = priceString.replace(/[₨NPR,\s]/g, '');
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate tax amount for Nepal (13% VAT)
 * @param amount - Base amount
 * @returns Tax calculation object
 */
export function calculateNepalTax(amount: number): {
  baseAmount: number;
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
} {
  const taxRate = 0.13; // 13% VAT in Nepal
  const taxAmount = Math.round(amount * taxRate * 100) / 100; // Round to 2 decimal places
  const totalWithTax = amount + taxAmount;

  return {
    baseAmount: amount,
    taxRate,
    taxAmount,
    totalWithTax
  };
}

/**
 * Format currency for different contexts
 */
export const currencyFormatter = {
  // For product displays
  product: (amount: number | string) => formatPriceWithSymbol(amount, true),
  
  // For order totals
  order: (amount: number | string) => formatPriceWithSymbol(amount, true),
  
  // For admin tables
  admin: (amount: number | string) => formatPriceWithSymbol(amount, true),
  
  // For checkout
  checkout: (amount: number | string) => formatPriceWithSymbol(amount, true),
  
  // For inputs
  input: (amount: number | string) => formatInputPrice(amount),
  
  // Compact format (no decimals for whole numbers)
  compact: (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const showDecimals = numericAmount % 1 !== 0;
    return formatPriceWithSymbol(amount, showDecimals);
  }
};

// Default export
export default {
  formatPrice,
  formatPriceWithSymbol,
  formatDisplayPrice,
  formatInputPrice,
  parsePrice,
  calculateNepalTax,
  currencyFormatter
};