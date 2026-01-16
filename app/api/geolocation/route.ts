import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to get user's country code based on IP address
 * Uses a free geolocation service (ipapi.co) as fallback
 * In production, you might want to use a more reliable service like:
 * - MaxMind GeoIP2
 * - Cloudflare (if using Cloudflare)
 * - Vercel Edge Config with geolocation
 */

// Force dynamic rendering since we need to access request headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get IP from request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    const vercelIP = request.headers.get('x-vercel-forwarded-for'); // Vercel
    
    const clientIP = 
      cfIP || 
      vercelIP || 
      (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || 
      realIP || 
      '';

    // If we have Vercel, use their geolocation
    if (request.geo?.country) {
      return NextResponse.json({
        country: request.geo.country,
        countryCode: request.geo.country,
        ip: clientIP,
        source: 'vercel',
      });
    }

    // Fallback: Use free IP geolocation API
    // Note: This has rate limits. For production, consider using a paid service
    if (clientIP && clientIP !== '::1' && !clientIP.startsWith('127.')) {
      try {
        const response = await fetch(`https://ipapi.co/${clientIP}/country_code/`, {
          headers: {
            'User-Agent': 'TynysAi/1.0',
          },
        });

        if (response.ok) {
          const countryCode = (await response.text()).trim();
          if (countryCode && countryCode.length === 2) {
            return NextResponse.json({
              country: countryCode,
              countryCode: countryCode,
              ip: clientIP,
              source: 'ipapi',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching geolocation:', error);
        // Continue to fallback
      }
    }

    // Final fallback: return null (will use browser language or default)
    return NextResponse.json({
      country: null,
      countryCode: null,
      ip: clientIP || null,
      source: 'none',
    });
  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json(
      { error: 'Failed to detect location' },
      { status: 500 }
    );
  }
}
