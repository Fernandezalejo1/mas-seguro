import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, sanitizeString } from './_lib/validation.js';

const UA = 'MasSeguro-Montevideo-App/1.0 (contact: info@masseguro.uy)';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const query = sanitizeString(req.query.q, 200);
    if (!query || query.length < 2) return jsonOk(res, { results: [] });

    const trailingNumberMatch = query.match(/(\d{1,5})\s*$/);
    const typedNumber = trailingNumberMatch ? trailingNumberMatch[1] : null;

    let data: any[] = [];

    if (typedNumber) {
      const structuredUrl = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(query)}&city=Montevideo&country=Uruguay&format=json&addressdetails=1&limit=6`;
      const structuredRes = await fetch(structuredUrl, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8000)
      });
      if (structuredRes.ok) data = await structuredRes.json();
    }

    if (data.length === 0) {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Montevideo, Uruguay')}&format=json&addressdetails=1&limit=6&viewbox=-56.35,-34.75,-56.02,-34.95&bounded=0`;
      const response = await fetch(nominatimUrl, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error(`Nominatim ${response.status}`);
      data = await response.json();
    }

    const results = (data || []).map((item: any) => {
      const address = item.address || {};
      const street = address.road || address.pedestrian || address.neighbourhood || item.display_name.split(',')[0];
      const neighborhood = address.suburb || address.neighbourhood || address.city_district || 'Montevideo';
      const rawHouseNumber: string | undefined = address.house_number;
      const isRange = !!rawHouseNumber && rawHouseNumber.includes(',');
      const isExactNumber = !!rawHouseNumber && !isRange;
      const houseNumber = isExactNumber ? rawHouseNumber : typedNumber;
      const name = houseNumber
        ? `${street} ${houseNumber}${isExactNumber ? '' : ' (aprox.)'}`
        : street;

      return {
        id: 'geo_' + item.place_id,
        name,
        address: item.display_name,
        neighborhood,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        category: 'custom'
      };
    });

    return jsonOk(res, { results });
  } catch (err) {
    console.warn('Geocoding error:', err);
    return jsonOk(res, { results: [] });
  }
}
