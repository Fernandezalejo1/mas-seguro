import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, parseNum } from './_lib/validation.js';

const FALLBACK_ANALYSIS = (hourOfDay: number, timeString: string, weather: string) => {
  const isNight = hourOfDay >= 22 || hourOfDay <= 5;
  const isRain = weather === 'Lluvia' || weather === 'Tormenta';

  return {
    verdict: isNight
      ? 'Nocturno: priorizá avenidas principales con iluminación LED y comercios abiertos.'
      : 'Ruta con buena visibilidad y tránsito peatonal regular.',
    keyRecommendation: isNight
      ? `A las ${timeString || 'esta hora'} transitá por corredores iluminados con presencia de comercios 24h y farmacias de turno.`
      : `Con ${weather || 'buen clima'} conviene usar avenidas principales con mayor circulación de personas.`,
    reasons: [
      isNight ? 'Calles principales con iluminación LED y mayor vigilancia natural.' : 'Buena visibilidad diurna en calles comerciales.',
      isRain ? 'En lluvia hay menos peatones — transitar por avenidas amplias.' : 'Tránsito peatonal regular que favorece la seguridad natural.',
      'Verificá la presencia de comercios abiertos y farmacias de turno como puntos seguros.',
    ],
    nighttimeAdvice: isNight
      ? 'Mantené tu teléfono guardado, evitá auriculares y permanecé en veredas iluminadas frente a comercios abiertos.'
      : 'En horario diurno la visibilidad es adecuada, mantené precaución normal.',
    weatherFactor: isRain
      ? 'La lluvia reduce el tránsito peatonal. Priorizá avenidas comerciales y refugios STM.'
      : 'Condiciones climáticas favorables con visibilidad normal.',
    hotspotsToAvoid: [
      isNight ? 'Calles secundarias sin iluminación' : 'Zonas con baja densidad comercial',
      'Plazas desiertas y pasajes sin circulación de personas',
    ],
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 'Method not allowed', 405);

  try {
    const { timeString, hourOfDay, weather } = req.body || {};

    return jsonOk(res, {
      analysis: FALLBACK_ANALYSIS(parseNum(hourOfDay, 23), timeString, weather || 'Despejado')
    });
  } catch (error: any) {
    console.error('Safety analysis error:', error);
    return jsonOk(res, {
      analysis: FALLBACK_ANALYSIS(23, '23:00', 'Despejado')
    });
  }
}
