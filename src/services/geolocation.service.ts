/**
 * Geolocation Service
 * 
 * Detects user's country using browser Geolocation API and external service
 * Caches results in localStorage to avoid repeated API calls
 */

export interface GeolocationData {
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

const CACHE_KEY = 'ganggreen_user_location';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cached geolocation data if available and not expired
 */
function getCachedLocation(): GeolocationData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      return data as GeolocationData;
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('Error reading cached location:', error);
    return null;
  }
}

/**
 * Cache geolocation data in localStorage
 */
function cacheLocation(data: GeolocationData): void {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error caching location:', error);
  }
}

/**
 * Detect user's country using IP-based geolocation service
 * Falls back to Kenya if detection fails
 */
async function detectCountryByIP(): Promise<GeolocationData> {
  try {
    // Using ipapi.co free tier (no API key required, 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      country: data.country_name || 'Kenya',
      countryCode: data.country_code || 'KE',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.warn('IP-based geolocation failed:', error);
    
    // Fallback to Kenya
    return {
      country: 'Kenya',
      countryCode: 'KE',
    };
  }
}

/**
 * Main function to detect user's location
 * Uses cache first, then falls back to IP-based detection
 * 
 * @returns Promise<GeolocationData> User's location data
 */
export async function detectUserLocation(): Promise<GeolocationData> {
  // Check cache first
  const cached = getCachedLocation();
  if (cached) {
    console.log('Using cached location:', cached.country);
    return cached;
  }

  // Detect using IP
  console.log('Detecting location...');
  const location = await detectCountryByIP();
  
  // Cache the result
  cacheLocation(location);
  
  console.log('Location detected:', location.country);
  return location;
}

/**
 * Clear cached location data
 * Useful for testing or when user wants to refresh their location
 */
export function clearLocationCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Location cache cleared');
  } catch (error) {
    console.warn('Error clearing location cache:', error);
  }
}
