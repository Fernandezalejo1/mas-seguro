import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, sanitizeString } from './_lib/validation.js';
import { getGeminiClient } from './_lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 'Method not allowed', 405);

  try {
    const { message, currentNeighborhood, hourOfDay } = req.body || {};
    const ai = getGeminiClient();

    const safeMsg = sanitizeString(message, 500);
    const safeNeighborhood = sanitizeString(currentNeighborhood, 100) || 'Centro / Cordón';
    const safeHour = typeof hourOfDay === 'number' ? hourOfDay : 23;

    if (!ai) {
      return jsonOk(res, {
        reply: `En ${safeNeighborhood}, a esta hora (${safeHour}), la recomendación principal es caminar por avenidas amplias e iluminadas como Av. 18 de Julio o Bulevar Artigas. Evitá cortar camino por calles oscuras o plazas solitarias. En caso de emergencia, tenés la Seccional más próxima y comercios 24h señalados en el mapa.`
      });
    }

    const systemInstruction = `Sos el asistente inteligente de seguridad urbana de "Más Seguro" en Montevideo, Uruguay.
Conocés en profundidad los barrios, avenidas, seccionales policiales y cámaras C5 del Ministerio del Interior.
Respondés con tono cercano, profesional, uruguayo natural y directo.
Tu prioridad es la prevención y la seguridad del peatón.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Pregunta del usuario: "${safeMsg}". Contexto: Barrio actual: ${safeNeighborhood}, Hora: ${safeHour}:00.`,
      config: { systemInstruction, temperature: 0.4 }
    });

    return jsonOk(res, {
      reply: response.text || 'Recordá siempre caminar por calles iluminadas y transitadas.'
    });
  } catch (error: any) {
    console.error('Assistant error:', error);
    return jsonOk(res, {
      reply: 'Para caminar seguro en Montevideo a esta hora, priorizá las calles con iluminación LED alta, cámaras C5 y presencia de locales 24 horas.'
    });
  }
}
