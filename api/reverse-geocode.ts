import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, parseNum, isValidCoord } from './_lib/validation.js';

const UA = 'MasSeguro-Montevideo-App/1.0';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const lat = parseNum(req.query.lat, NaN);
    const lng = parseNum(req.query.lng, NaN);
    if (!isValidCoord(lat, lng)) return jsonError(res, 'Coordenadas inválidas', 400);

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Reverse geocode error');
    const data = await response.json();
    const address = data.address || {};

    return jsonOk(res, {
      name: address.road || address.pedestrian || 'Ubicación actual',
      address: data.display_name,
      neighborhood: address.suburb || address.neighbourhood || address.city_district || 'Montevideo',
      lat,
      lng
    });
  } catch {
    return jsonOk(res, {
      name: 'Ubicación actual',
      address: 'Montevideo, Uruguay',
      neighborhood: 'Montevideo',
      lat: parseNum(req.query.lat, -34.9055),
      lng: parseNum(req.query.lng, -56.1915)
    });
  }
}
