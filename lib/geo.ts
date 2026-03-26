export type Coordinates = {
  latitude: number;
  longitude: number;
};

export const ALMATY_CENTER: readonly [number, number] = [43.238949, 76.889709];

const ALMATY_BOUNDS = {
  minLatitude: 43.0,
  maxLatitude: 43.5,
  minLongitude: 76.65,
  maxLongitude: 77.2,
} as const;

export function isWithinWorldBounds(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

export function isWithinAlmatyBounds(latitude: number, longitude: number): boolean {
  return (
    latitude >= ALMATY_BOUNDS.minLatitude &&
    latitude <= ALMATY_BOUNDS.maxLatitude &&
    longitude >= ALMATY_BOUNDS.minLongitude &&
    longitude <= ALMATY_BOUNDS.maxLongitude
  );
}

export function isValidAlmatyCoordinate(latitude: number, longitude: number): boolean {
  return isWithinWorldBounds(latitude, longitude) && isWithinAlmatyBounds(latitude, longitude);
}

export function parseCoordinatePair(location?: string | null): Coordinates | null {
  if (!location || !location.includes(",")) return null;

  const [firstRaw, secondRaw] = location.split(",").map((part) => part.trim());
  const first = Number(firstRaw);
  const second = Number(secondRaw);

  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null;
  }

  const asLatLngValid = isValidAlmatyCoordinate(first, second);
  const asLngLatValid = isValidAlmatyCoordinate(second, first);

  if (asLatLngValid) {
    return { latitude: first, longitude: second };
  }

  if (asLngLatValid) {
    console.warn("[GeoParse] Detected swapped coordinate order, auto-correcting", {
      original: location,
      parsedAs: "lng,lat",
      correctedLatitude: second,
      correctedLongitude: first,
    });
    return { latitude: second, longitude: first };
  }

  return null;
}
