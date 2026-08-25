import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk } from '../_lib/validation.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-34.9055&longitude=-56.1915&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&timezone=America%2FMontevideo';
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MasSeguro-MVD/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);

    const data = await response.json();
    const current = data.current || {};
    const code = current.weather_code ?? 0;

    let condition: 'Despejado' | 'Lluvia' | 'Tormenta' | 'Niebla' = 'Despejado';
    if (code >= 95) condition = 'Tormenta';
    else if (code >= 51 || (current.rain && current.rain > 0) || (current.precipitation && current.precipitation > 0.2)) condition = 'Lluvia';
    else if (code === 45 || code === 48) condition = 'Niebla';

    return jsonOk(res, {
      success: true,
      condition,
      temperature: current.temperature_2m ?? 18,
      apparentTemperature: current.apparent_temperature ?? 18,
      humidity: current.relative_humidity_2m ?? 65,
      windSpeed: current.wind_speed_10m ?? 12,
      precipitation: current.precipitation ?? 0,
      weatherCode: code,
      source: 'Open-Meteo Live API (Montevideo)',
      lastUpdated: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
    });
  } catch {
    return jsonOk(res, {
      success: true,
      condition: 'Despejado',
      temperature: 19,
      apparentTemperature: 19,
      humidity: 60,
      windSpeed: 10,
      precipitation: 0,
      source: 'Default Montevideo Average',
      lastUpdated: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
    });
  }
}
