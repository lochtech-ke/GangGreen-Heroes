/**
 * Flag Colors Mapping
 * 
 * Maps country codes to their flag colors for use in Scene 3
 * Colors are in hexadecimal format for Pixi.js
 */

export interface FlagColors {
  primary: number;
  secondary: number;
  tertiary: number;
  accent: number;
}

/**
 * Flag color mappings for African and other countries
 * Format: { primary, secondary, tertiary, accent }
 * Colors are in hex format (0xRRGGBB)
 */
export const FLAG_COLORS: Record<string, FlagColors> = {
  // Kenya (default)
  KE: {
    primary: 0x000000,   // Black
    secondary: 0xBB0000, // Red
    tertiary: 0x006600,  // Green
    accent: 0xFFFFFF,    // White
  },
  
  // Nigeria
  NG: {
    primary: 0x008751,   // Green
    secondary: 0xFFFFFF, // White
    tertiary: 0x008751,  // Green
    accent: 0xFFFFFF,    // White
  },
  
  // South Africa
  ZA: {
    primary: 0x007A4D,   // Green
    secondary: 0xFFB612,  // Gold
    tertiary: 0xDE3831,  // Red
    accent: 0x002395,    // Blue
  },
  
  // Ghana
  GH: {
    primary: 0xCE1126,   // Red
    secondary: 0xFCD116,  // Gold
    tertiary: 0x006B3F,  // Green
    accent: 0x000000,    // Black
  },
  
  // Ethiopia
  ET: {
    primary: 0x078930,   // Green
    secondary: 0xFCDD09,  // Yellow
    tertiary: 0xDA121A,  // Red
    accent: 0x0F47AF,    // Blue
  },
  
  // Tanzania
  TZ: {
    primary: 0x1EB53A,   // Green
    secondary: 0xFCD116,  // Gold
    tertiary: 0x00A3DD,  // Blue
    accent: 0x000000,    // Black
  },
  
  // Uganda
  UG: {
    primary: 0x000000,   // Black
    secondary: 0xFCDC04,  // Yellow
    tertiary: 0xD90000,  // Red
    accent: 0xFFFFFF,    // White
  },
  
  // Rwanda
  RW: {
    primary: 0x00A1DE,   // Blue
    secondary: 0xFAD201,  // Yellow
    tertiary: 0x20603D,  // Green
    accent: 0xFFFFFF,    // White
  },
  
  // Egypt
  EG: {
    primary: 0xCE1126,   // Red
    secondary: 0xFFFFFF, // White
    tertiary: 0x000000,  // Black
    accent: 0xC09300,    // Gold
  },
  
  // Morocco
  MA: {
    primary: 0xC1272D,   // Red
    secondary: 0x006233,  // Green
    tertiary: 0xC1272D,  // Red
    accent: 0xFFFFFF,    // White
  },
  
  // Senegal
  SN: {
    primary: 0x00853F,   // Green
    secondary: 0xFDEF42,  // Yellow
    tertiary: 0xE31B23,  // Red
    accent: 0x00853F,    // Green
  },
  
  // Cameroon
  CM: {
    primary: 0x007A5E,   // Green
    secondary: 0xCE1126,  // Red
    tertiary: 0xFCD116,  // Yellow
    accent: 0x007A5E,    // Green
  },
  
  // Ivory Coast (Côte d'Ivoire)
  CI: {
    primary: 0xF77F00,   // Orange
    secondary: 0xFFFFFF, // White
    tertiary: 0x009E60,  // Green
    accent: 0xF77F00,    // Orange
  },
  
  // Zimbabwe
  ZW: {
    primary: 0x006B3F,   // Green
    secondary: 0xFCD116,  // Yellow
    tertiary: 0xDE2010,  // Red
    accent: 0x000000,    // Black
  },
  
  // Botswana
  BW: {
    primary: 0x75AADB,   // Light Blue
    secondary: 0xFFFFFF, // White
    tertiary: 0x000000,  // Black
    accent: 0x75AADB,    // Light Blue
  },
  
  // Namibia
  NA: {
    primary: 0x003580,   // Blue
    secondary: 0xDE3831,  // Red
    tertiary: 0x009543,  // Green
    accent: 0xFFD100,    // Yellow
  },
  
  // Zambia
  ZM: {
    primary: 0x198A00,   // Green
    secondary: 0xDE2010,  // Red
    tertiary: 0x000000,  // Black
    accent: 0xEF7D00,    // Orange
  },
  
  // Malawi
  MW: {
    primary: 0x000000,   // Black
    secondary: 0xCE1126,  // Red
    tertiary: 0x339E35,  // Green
    accent: 0xFFFFFF,    // White
  },
  
  // Mozambique
  MZ: {
    primary: 0x009543,   // Green
    secondary: 0x000000,  // Black
    tertiary: 0xFCDD09,  // Yellow
    accent: 0xD21034,    // Red
  },
  
  // Angola
  AO: {
    primary: 0xCE1126,   // Red
    secondary: 0x000000,  // Black
    tertiary: 0xFFD100,  // Yellow
    accent: 0xCE1126,    // Red
  },
  
  // Democratic Republic of Congo
  CD: {
    primary: 0x007FFF,   // Sky Blue
    secondary: 0xF7D618,  // Yellow
    tertiary: 0xCE1021,  // Red
    accent: 0x007FFF,    // Sky Blue
  },
  
  // Algeria
  DZ: {
    primary: 0x006233,   // Green
    secondary: 0xFFFFFF, // White
    tertiary: 0xD21034,  // Red
    accent: 0x006233,    // Green
  },
  
  // Tunisia
  TN: {
    primary: 0xE70013,   // Red
    secondary: 0xFFFFFF, // White
    tertiary: 0xE70013,  // Red
    accent: 0xFFFFFF,    // White
  },
  
  // Libya
  LY: {
    primary: 0xE70013,   // Red
    secondary: 0x000000,  // Black
    tertiary: 0x239E46,  // Green
    accent: 0xFFFFFF,    // White
  },
  
  // Sudan
  SD: {
    primary: 0xD21034,   // Red
    secondary: 0xFFFFFF, // White
    tertiary: 0x007229,  // Green
    accent: 0x000000,    // Black
  },
  
  // Somalia
  SO: {
    primary: 0x4189DD,   // Blue
    secondary: 0xFFFFFF, // White
    tertiary: 0x4189DD,  // Blue
    accent: 0xFFFFFF,    // White
  },
};

/**
 * Get flag colors for a given country code
 * Falls back to Kenya if country code is not found
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'KE', 'NG')
 * @returns FlagColors object with primary, secondary, tertiary, and accent colors
 */
export function getFlagColors(countryCode: string): FlagColors {
  const colors = FLAG_COLORS[countryCode.toUpperCase()];
  
  if (!colors) {
    console.warn(`Flag colors not found for country code: ${countryCode}, using Kenya as default`);
    return FLAG_COLORS.KE;
  }
  
  return colors;
}

/**
 * Get a list of all supported country codes
 * 
 * @returns Array of country codes
 */
export function getSupportedCountries(): string[] {
  return Object.keys(FLAG_COLORS);
}

/**
 * Check if a country code is supported
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns boolean indicating if the country is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return countryCode.toUpperCase() in FLAG_COLORS;
}
