/**
 * Format currency with proper symbol and decimals
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: string = 'USD'): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    KES: 'KSh',
    GHS: 'GH₵',
  };
  return symbols[currency] || currency;
};

/**
 * Format price with custom decimals
 */
export const formatPrice = (price: number, decimals: number = 2): string => {
  return price.toFixed(decimals);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

/**
 * Apply discount to price
 */
export const applyDiscount = (price: number, discountPercent: number): number => {
  return price - price * (discountPercent / 100);
};

/**
 * Calculate tax
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  return amount * (taxRate / 100);
};
