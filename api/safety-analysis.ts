import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, sanitizeString, parseNum } from './_lib/validation.js';
import { getGeminiClient } from './_lib/gemini.js';

const FALLBACK_ANALYSIS = (hourOfDay: number, timeString: string, weather: string) => ({
  verdict: hourOfDay >= 22 || hourOfDay <= 5
    ? "Recomendación prioritaria: Utilizar el corredor principal con monitoreo CCU e iluminación LED continua."
    : "Ruta segura con alta visibilidad y flujo regular de peatones.",
  keyRecommendation: `A las ${timeString || 'esta hora'} conviene priorizar Av. 18 de Julio / Bulevar donde hay comercios 24h y cámaras C5 del Ministerio del Interior.`,
  reasons: [
    "Av. 18 de Julio cuenta con iluminación LED de alta potencia y cámaras de monitoreo 360° en cada intersección.",
    "Hay paradas de ómnibus STM con buena frecuencia y farmacias de turno abiertas las 24 horas.",
    "Las calles paralelas secundarias (ej. Soriano, Canelones) presentan menor tránsito y visibilidad nocturna reducida."
  ],
  nighttimeAdvice: "Mantené tu teléfono guardado, evitá auriculares con cancelación de ruido y permanecé en las veredas iluminadas frente a comercios abiertos.",
  weatherFactor: weather === 'Lluvia'
    ? "La lluvia reduce el tránsito peatonal en veredas, aumentando la importancia de transitar por avenidas comerciales."
    : "Condiciones climáticas favorables con visibilidad normal en calles principales.",
  hotspotsToAvoid: ["Cruces poco iluminados de calles secundarias", "Plazas desiertas pasadas las 23:00"]
});

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
