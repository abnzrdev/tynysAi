import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from '@/lib/i18n/config';
import { getToken } from 'next-auth/jwt';
import { detectUserLocale } from '@/lib/i18n/location-detection';

async function getLocale(request: NextRequest): Promise<string> {
  // Check if locale is in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = i18n.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) return pathnameLocale;

  // Use location detection with fallback chain
  // Priority: Cookie → IP Geolocation (cloud provider geo) → Browser Language → Default
  try {
    // Get country code from cloud provider geo object (if available)
    // For other platforms, this will be null and we'll fall back to browser language
    const countryCode = request.geo?.country || null;

    // Use location detection utility
    const detection = await detectUserLocale(
      {
        headers: request.headers,
        cookies: request.cookies,
      },
      countryCode || undefined
    );

    return detection.locale;
  } catch (error) {
    // Fallback to simple detection if location detection fails
    console.error('Location detection error:', error);
    
    // Check cookie
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
    if (localeCookie && i18n.locales.includes(localeCookie as any)) {
      return localeCookie;
    }

    // Check Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();
      
      if (preferredLocale === 'ru' && i18n.locales.includes('ru')) return 'ru';
      if (preferredLocale === 'kk' && i18n.locales.includes('kz')) return 'kz';
    }

    return i18n.defaultLocale;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes, static files, and internal Next.js routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to locale-prefixed URL using location-based detection
    const locale = await getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;
    
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('NEXT_LOCALE', locale, { maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  // Extract locale from pathname for protected routes check
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.slice(locale.length + 1);

  // Check authentication for protected routes
  const protectedPaths = ['/dashboard'];
  const isProtectedPath = protectedPaths.some(path => 
    pathWithoutLocale.startsWith(path)
  );

  if (isProtectedPath) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
