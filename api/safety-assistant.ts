import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError } from './_lib/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 'Method not allowed', 405);

  try {
    const { currentNeighborhood, hourOfDay } = req.body || {};
    const safeNeighborhood = currentNeighborhood || 'Centro';
    const safeHour = typeof hourOfDay === 'number' ? hourOfDay : 23;
    const isNight = safeHour >= 22 || safeHour <= 5;

    return jsonOk(res, {
      reply: isNight
        ? `En ${safeNeighborhood}, a las ${safeHour}:00 transitá por avenidas principales iluminadas. Buscá farmacias y comercios 24h como puntos seguros. Evitá calles secundarias y plazas desiertas.`
        : `En ${safeNeighborhood}, caminá por calles comerciales con tránsito de personas. Las avenidas principales como 18 de Julio tienen buena iluminación y circulación.`
    });
  } catch (error: any) {
    console.error('Assistant error:', error);
    return jsonOk(res, {
      reply: 'Camina siempre por calles iluminadas y transitadas.'
    });
  }
}
