import { LocationPoint, RealRouteAlt } from '../types';

/**
 * Fetches real pedestrian route alternatives over actual Montevideo streets
 * from the server's /api/route proxy (backed by the free OSRM foot service).
 * Returns an empty array on any failure so callers can fall back to the
 * synthetic heuristic route generator.
 */
export async function fetchRealRoutes(
  origin: LocationPoint,
  destination: LocationPoint
): Promise<RealRouteAlt[]> {
  try {
    const params = new URLSearchParams({
      originLat: String(origin.lat),
      originLng: String(origin.lng),
      destLat: String(destination.lat),
      destLng: String(destination.lng)
    });
    const res = await fetch(`/api/route?${params.toString()}`);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.routes) && data.routes.length > 0) {
      return data.routes;
    }
    return [];
  } catch {
    return [];
  }
}
