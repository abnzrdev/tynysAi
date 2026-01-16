import { i18n, type Locale } from './config';
import { getLocaleFromCountry, getLocaleFromBrowserLang } from './language-mapping';

/**
 * Location detection result
 */
export interface LocationDetectionResult {
  locale: Locale;
  source: 'ip' | 'browser' | 'cookie' | 'default';
  countryCode?: string;
  browserLang?: string;
}

/**
 * Detect user's locale based on multiple sources with fallback chain:
 * 1. IP-based geolocation (country code)
 * 2. Browser language (Accept-Language header)
 * 3. Cookie preference
 * 4. Default locale
 * 
 * This function should be called server-side
 */
export async function detectUserLocale(
  request: {
    headers: Headers | Record<string, string | string[] | undefined>;
    cookies?: {
      get: (name: string) => { value: string } | undefined;
    };
  },
  ipCountryCode?: string | null
): Promise<LocationDetectionResult> {
  // Priority 1: Check cookie (user preference)
  if (request.cookies) {
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
    if (localeCookie && i18n.locales.includes(localeCookie as Locale)) {
      return {
        locale: localeCookie as Locale,
        source: 'cookie',
      };
    }
  }

  // Priority 2: IP-based geolocation (if available)
  if (ipCountryCode) {
    const localeFromCountry = getLocaleFromCountry(ipCountryCode);
    if (localeFromCountry) {
      return {
        locale: localeFromCountry,
        source: 'ip',
        countryCode: ipCountryCode,
      };
    }
  }

  // Priority 3: Browser language (Accept-Language header)
  const acceptLanguage = 
    request.headers instanceof Headers
      ? request.headers.get('accept-language')
      : request.headers['accept-language'];
  
  if (acceptLanguage) {
    const languages = Array.isArray(acceptLanguage) 
      ? acceptLanguage[0] 
      : acceptLanguage;
    
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,ru;q=0.8")
    const preferredLangs = languages
      .split(',')
      .map(lang => lang.split(';')[0].trim());
    
    for (const lang of preferredLangs) {
      const localeFromBrowser = getLocaleFromBrowserLang(lang);
      if (localeFromBrowser) {
        return {
          locale: localeFromBrowser,
          source: 'browser',
          browserLang: lang,
        };
      }
    }
  }

  // Priority 4: Default locale
  return {
    locale: i18n.defaultLocale,
    source: 'default',
  };
}

/**
 * Get IP address from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: {
  headers: Headers | Record<string, string | string[] | undefined>;
}): string | null {
  const headers = request.headers instanceof Headers 
    ? Object.fromEntries(request.headers.entries())
    : request.headers;
  
  // Check various headers for IP address
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-vercel-forwarded-for', // Vercel
    'x-client-ip',
  ];

  for (const header of ipHeaders) {
    const value = headers[header];
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = Array.isArray(value) ? value[0] : value;
      return ip.split(',')[0].trim();
    }
  }

  return null;
}
