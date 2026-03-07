import { NextRequest, NextResponse } from 'next/server';
import type { RouteGeometryResponse, RouteRequestBody } from '@/types/route';

export const dynamic = 'force-dynamic';

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

type OsrmRouteResponse = {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
  message?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RouteRequestBody;
    const source = body?.source;
    const destination = body?.destination;

    if (!source || !destination) {
      return NextResponse.json({ error: 'source and destination are required' }, { status: 400 });
    }

    if (!isValidCoordinate(source.latitude, source.longitude) || !isValidCoordinate(destination.latitude, destination.longitude)) {
      return NextResponse.json({ error: 'Invalid source or destination coordinates' }, { status: 400 });
    }

    const baseUrl = process.env.OSRM_API_BASE_URL ?? 'https://router.project-osrm.org';
    const osrmUrl = `${baseUrl}/route/v1/driving/${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=false`;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 12000);

    let upstream: Response;
    try {
      upstream = await fetch(osrmUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        cache: 'no-store',
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Routing provider error' }, { status: 502 });
    }

    const payload = (await upstream.json()) as OsrmRouteResponse;
    if (payload.code !== 'Ok' || !payload.routes || payload.routes.length === 0) {
      return NextResponse.json(
        { error: payload.message || 'No route found for selected destination' },
        { status: 404 },
      );
    }

    const primary = payload.routes[0];
    const coordinates = primary.geometry?.coordinates ?? [];
    const geometry = coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);

    if (geometry.length < 2) {
      return NextResponse.json({ error: 'Routing provider returned invalid geometry' }, { status: 502 });
    }

    const response: RouteGeometryResponse = {
      geometry,
      distanceMeters: primary.distance,
      durationSeconds: primary.duration,
    };

    return NextResponse.json(response);
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return NextResponse.json({ error: 'Routing request timed out' }, { status: 504 });
    }
    console.error('Failed to build route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}