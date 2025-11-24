/**
 * GG Coin Formatting Utilities
 * Helper functions for displaying GG Coin values with proper decimal precision
 */

/**
 * Format GG Coins for display with 3 decimal places
 * 
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted string
 * 
 * @example
 * formatGGCoins(1.5) // "1.500"
 * formatGGCoins(0.005) // "0.005"
 * formatGGCoins(1.5, { showTrailingZeros: false }) // "1.5"
 * formatGGCoins(1234.567, { useLocale: true }) // "1,234.567"
 */
export function formatGGCoins(
  amount: number,
  options: {
    showTrailingZeros?: boolean;
    useLocale?: boolean;
    minimumFractionDigits?: number;
  } = {}
): string {
  const {
    showTrailingZeros = true,
    useLocale = false,
    minimumFractionDigits = 3,
  } = options;

  if (useLocale) {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: showTrailingZeros ? minimumFractionDigits : 0,
      maximumFractionDigits: 3,
    });
  }

  if (showTrailingZeros) {
    return amount.toFixed(3);
  }

  // Remove trailing zeros but keep at least one decimal place
  const formatted = amount.toFixed(3);
  return formatted.replace(/\.?0+$/, '');
}

/**
 * Parse a GG Coin string value to a number
 * 
 * @param value - String value to parse
 * @returns Parsed number rounded to 3 decimal places
 * 
 * @example
 * parseGGCoins("1.5") // 1.500
 * parseGGCoins("0.005") // 0.005
 * parseGGCoins("1,234.567") // 1234.567
 */
export function parseGGCoins(value: string): number {
  // Remove commas and parse
  const parsed = parseFloat(value.replace(/,/g, ''));
  
  if (isNaN(parsed)) {
    return 0;
  }

  // Round to 3 decimal places
  return Math.round(parsed * 1000) / 1000;
}

/**
 * Validate if a GG Coin amount is valid
 * 
 * @param amount - Amount to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * isValidGGCoinAmount(1.5) // true
 * isValidGGCoinAmount(0.005) // true
 * isValidGGCoinAmount(-1) // false
 * isValidGGCoinAmount(NaN) // false
 */
export function isValidGGCoinAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
}

/**
 * Round GG Coin amount to 3 decimal places
 * 
 * @param amount - Amount to round
 * @returns Rounded amount
 * 
 * @example
 * roundGGCoins(1.5555) // 1.556
 * roundGGCoins(0.0049) // 0.005
 */
export function roundGGCoins(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

/**
 * Calculate GG Coin reward for a purchase amount in KES
 * Formula: GG Coins = round(amount_kes / 200, 3)
 * 
 * @param amountKes - Purchase amount in Kenyan Shillings
 * @returns GG Coin reward rounded to 3 decimal places
 * 
 * @example
 * calculateGGCoinReward(200) // 1.000
 * calculateGGCoinReward(100) // 0.500
 * calculateGGCoinReward(50) // 0.250
 * calculateGGCoinReward(10) // 0.050
 * calculateGGCoinReward(1) // 0.005
 */
export function calculateGGCoinReward(amountKes: number): number {
  if (amountKes < 0) {
    return 0;
  }

  const REWARD_RATIO = 200; // 1 GG Coin per 200 KES
  const reward = amountKes / REWARD_RATIO;

  return roundGGCoins(reward);
}

/**
 * Format GG Coin change with +/- prefix
 * 
 * @param change - Amount of change
 * @param options - Formatting options
 * @returns Formatted string with +/- prefix
 * 
 * @example
 * formatGGCoinChange(1.5) // "+1.500"
 * formatGGCoinChange(-0.5) // "-0.500"
 * formatGGCoinChange(0) // "0.000"
 */
export function formatGGCoinChange(
  change: number,
  options: {
    showTrailingZeros?: boolean;
    showPlusSign?: boolean;
  } = {}
): string {
  const { showTrailingZeros = true, showPlusSign = true } = options;

  const formatted = formatGGCoins(Math.abs(change), { showTrailingZeros });

  if (change > 0 && showPlusSign) {
    return `+${formatted}`;
  } else if (change < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

/**
 * Get color class for GG Coin amount (for styling)
 * 
 * @param amount - Amount to get color for
 * @returns Tailwind color class
 * 
 * @example
 * getGGCoinColorClass(1.5) // "text-green-600"
 * getGGCoinColorClass(-0.5) // "text-red-600"
 * getGGCoinColorClass(0) // "text-gray-600"
 */
export function getGGCoinColorClass(amount: number): string {
  if (amount > 0) {
    return 'text-green-600';
  } else if (amount < 0) {
    return 'text-red-600';
  }
  return 'text-gray-600';
}
