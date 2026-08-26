import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, sanitizeString, parseNum } from './_lib/validation.js';
import { getGeminiClient } from './_lib/gemini.js';

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
    const { originName, destinationName, timeString, hourOfDay, weather, routeOption } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return jsonOk(res, {
        analysis: FALLBACK_ANALYSIS(parseNum(hourOfDay, 23), timeString, weather || 'Despejado')
      });
    }

    const prompt = `Actúa como el motor de Inteligencia Artificial de la startup de seguridad urbana "Más Seguro" en Montevideo, Uruguay.
Lema: "Llegá mejor, no solamente más rápido."

El usuario va a caminar desde "${sanitizeString(originName, 100)}" hasta "${sanitizeString(destinationName, 100)}" en Montevideo.
Hora actual: ${sanitizeString(timeString, 20) || '23:30'} (${hourOfDay !== undefined ? `Hora: ${hourOfDay}:00` : 'Nocturno'}).
Clima actual: ${sanitizeString(weather, 20) || 'Despejado'}.
Ruta analizada: ${routeOption?.name || 'Ruta Más Segura'} (Safety Score: ${routeOption?.safetyScore || 92}/100, Distancia: ${routeOption?.distanceMeters || 1400}m, Tiempo estimado: ${routeOption?.durationMinutes || 18} min).
Calles involucradas: ${routeOption?.summary || 'Avenida 18 de Julio, San José, Constituyente, Pocitos, etc.'}.

Proporciona un veredicto de seguridad inteligente, ultra específico para las calles y barrios de Montevideo.
Devuelve JSON estrictamente válido:
{
  "verdict": "Veredicto conciso de 1 frase",
  "keyRecommendation": "Consejo táctico de caminata",
  "reasons": ["Razón 1", "Razón 2", "Razón 3"],
  "nighttimeAdvice": "Consejo específico para la noche",
  "weatherFactor": "Impacto del clima",
  "hotspotsToAvoid": ["Punto 1", "Punto 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.3 }
    });

    const responseText = response.text || '';
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(responseText);
    } catch {
      parsedAnalysis = FALLBACK_ANALYSIS(parseNum(hourOfDay, 23), timeString, weather);
    }

    return jsonOk(res, { analysis: parsedAnalysis });
  } catch (error: any) {
    console.error('Safety analysis error:', error);
    return jsonOk(res, {
      analysis: FALLBACK_ANALYSIS(23, '23:00', 'Despejado')
    });
  }
}
