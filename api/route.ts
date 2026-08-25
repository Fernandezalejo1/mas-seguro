import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, parseNum, isValidCoord } from './_lib/validation.js';
import { cacheGet, cacheSet, ROUTE_CACHE_TTL_MS } from './_lib/cache.js';

interface OsrmRouteAlt {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  streetNames: string[];
}

const UA = 'MasSeguro-Montevideo-App/1.0';

async function fetchOsrmRoute(points: { lat: number; lng: number }[]): Promise<OsrmRouteAlt | null> {
  const coordsPath = points.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordsPath}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) return null;
  const data: any = await response.json();
  if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) return null;

  const r = data.routes[0];
  const coordinates: [number, number][] = (r.geometry?.coordinates || []).map(
    (c: [number, number]) => [c[1], c[0]]
  );
  const streetNames: string[] = [];
  (r.legs || []).forEach((leg: any) => {
    (leg.steps || []).forEach((step: any) => {
      if (step.name && !streetNames.includes(step.name)) streetNames.push(step.name);
    });
  });
  return {
    coordinates,
    distanceMeters: Math.round(r.distance),
    durationSeconds: Math.round(r.duration),
    streetNames: streetNames.slice(0, 8)
  };
}

function perpendicularWaypoint(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  offsetMeters: number
): { lat: number; lng: number } {
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos((midLat * Math.PI) / 180);
  const vx = (destination.lng - origin.lng) * metersPerDegLng;
  const vy = (destination.lat - origin.lat) * metersPerDegLat;
  const length = Math.sqrt(vx * vx + vy * vy) || 1;
  const perpX = -vy / length;
  const perpY = vx / length;
  return {
    lat: midLat + (perpY * offsetMeters) / metersPerDegLat,
    lng: midLng + (perpX * offsetMeters) / metersPerDegLng
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const originLat = parseNum(req.query.originLat, NaN);
    const originLng = parseNum(req.query.originLng, NaN);
    const destLat = parseNum(req.query.destLat, NaN);
    const destLng = parseNum(req.query.destLng, NaN);

    if (!isValidCoord(originLat, originLng) || !isValidCoord(destLat, destLng)) {
      return jsonError(res, 'Coordenadas inválidas', 400);
    }

    const cacheKey = `${originLat.toFixed(5)},${originLng.toFixed(5)}-${destLat.toFixed(5)},${destLng.toFixed(5)}`;
    const cached = cacheGet<any>(cacheKey);
    if (cached) return jsonOk(res, cached);

    const origin = { lat: originLat, lng: originLng };
    const destination = { lat: destLat, lng: destLng };

    const dLat = (destLat - originLat) * 111320;
    const dLng = (destLng - originLng) * 111320 * Math.cos((originLat * Math.PI) / 180);
    const straightLineMeters = Math.sqrt(dLat * dLat + dLng * dLng);

    const smallOffset = Math.min(300, Math.max(15, straightLineMeters * 0.15));
    const largeOffset = Math.min(600, Math.max(30, straightLineMeters * 0.32));

    const [direct, viaSmall, viaLarge] = await Promise.all([
      fetchOsrmRoute([origin, destination]),
      fetchOsrmRoute([origin, perpendicularWaypoint(origin, destination, smallOffset), destination]),
      fetchOsrmRoute([origin, perpendicularWaypoint(origin, destination, largeOffset), destination])
    ]);

    if (!direct) throw new Error('OSRM no devolvió ruta');

    const maxReasonableDetour = direct.distanceMeters + Math.max(400, direct.distanceMeters * 1.2);
    const candidates = [direct, viaSmall, viaLarge].filter(
      (r): r is OsrmRouteAlt => r !== null && r.distanceMeters <= maxReasonableDetour
    );
    const routes: OsrmRouteAlt[] = [];
    for (const candidate of candidates) {
      if (!routes.some(r => Math.abs(r.distanceMeters - candidate.distanceMeters) < 15)) {
        routes.push(candidate);
      }
    }

    const payload = { success: true, routes, source: 'OSRM Foot (routing.openstreetmap.de)' };
    cacheSet(cacheKey, payload, ROUTE_CACHE_TTL_MS);
    return jsonOk(res, payload);
  } catch (error) {
    console.warn('Routing error:', error);
    return jsonOk(res, { success: false, routes: [], source: 'fallback' });
  }
}
