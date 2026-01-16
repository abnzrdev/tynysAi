import { type Locale } from './config';

/**
 * Maps country codes (ISO 3166-1 alpha-2) to locales
 * This determines which language to show based on user's geographic location
 */
export const countryToLocaleMap: Record<string, Locale> = {
  // Russian-speaking countries
  RU: 'ru', // Russia
  BY: 'ru', // Belarus
  KZ: 'kz', // Kazakhstan
  KG: 'ru', // Kyrgyzstan
  TJ: 'ru', // Tajikistan
  TM: 'ru', // Turkmenistan
  UZ: 'ru', // Uzbekistan
  AM: 'ru', // Armenia
  AZ: 'ru', // Azerbaijan
  GE: 'ru', // Georgia
  MD: 'ru', // Moldova
  UA: 'ru', // Ukraine
  
  // Kazakh-speaking regions (Kazakhstan is already mapped above)
  // Add more if needed
  
  // Default to English for all other countries
};

/**
 * Maps browser language codes to locales
 * Handles language variants like 'ru-RU', 'kk-KZ', etc.
 */
export const browserLangToLocaleMap: Record<string, Locale> = {
  'ru': 'ru',
  'ru-RU': 'ru',
  'ru-BY': 'ru',
  'ru-KZ': 'ru',
  'ru-UA': 'ru',
  'kk': 'kz',
  'kk-KZ': 'kz',
  'kz': 'kz',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
};

/**
 * Get locale from country code with fallback
 */
export function getLocaleFromCountry(countryCode: string): Locale | null {
  const upperCountry = countryCode.toUpperCase();
  return countryToLocaleMap[upperCountry] || null;
}

/**
 * Get locale from browser language with fallback
 */
export function getLocaleFromBrowserLang(browserLang: string): Locale | null {
  // Try exact match first
  if (browserLangToLocaleMap[browserLang]) {
    return browserLangToLocaleMap[browserLang];
  }
  
  // Try language code only (e.g., 'ru' from 'ru-RU')
  const langCode = browserLang.split('-')[0].toLowerCase();
  if (browserLangToLocaleMap[langCode]) {
    return browserLangToLocaleMap[langCode];
  }
  
  return null;
}
