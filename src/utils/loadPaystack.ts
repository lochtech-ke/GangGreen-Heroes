/**
 * Paystack SDK Loader Utility
 * Dynamically loads the Paystack inline JavaScript SDK
 */

const PAYSTACK_SDK_URL = 'https://js.paystack.co/v1/inline.js';
const MAX_RETRIES = 1;

/**
 * Loads the Paystack inline SDK script dynamically
 * @returns Promise that resolves when SDK is loaded
 * @throws Error if SDK fails to load after retries
 */
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    if (window.PaystackPop) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      `script[src="${PAYSTACK_SDK_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Paystack SDK'))
      );
      return;
    }

    // Create and append script element
    const script = document.createElement('script');
    script.src = PAYSTACK_SDK_URL;
    script.async = true;

    script.onload = () => {
      if (window.PaystackPop) {
        resolve();
      } else {
        reject(new Error('Paystack SDK loaded but PaystackPop not available'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Paystack SDK'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Loads the Paystack SDK with retry logic
 * @param retries Number of retry attempts (default: MAX_RETRIES)
 * @returns Promise that resolves when SDK is loaded
 * @throws Error if SDK fails to load after all retries
 */
export async function loadPaystackScriptWithRetry(
  retries: number = MAX_RETRIES
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await loadPaystackScript();
      return;
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `Failed to load Paystack SDK (attempt ${attempt + 1}/${retries + 1})`,
        error
      );

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error('Failed to load Paystack SDK after retries');
}

/**
 * Checks if Paystack SDK is loaded
 * @returns true if SDK is available, false otherwise
 */
export function isPaystackLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.PaystackPop;
}

/**
 * Validates that Paystack configuration is present
 * @throws Error if required configuration is missing
 */
export function validatePaystackConfig(): void {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const mode = import.meta.env.VITE_PAYSTACK_MODE;

  if (!publicKey) {
    throw new Error(
      'Paystack public key not configured. Please set VITE_PAYSTACK_PUBLIC_KEY environment variable.'
    );
  }

  if (!mode || !['test', 'live'].includes(mode)) {
    throw new Error(
      'Invalid Paystack mode. Please set VITE_PAYSTACK_MODE to "test" or "live".'
    );
  }
}
