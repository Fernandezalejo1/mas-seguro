import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
// 3000 collides with other local projects (e.g. Next.js apps default there too).
// Configurable via PORT env var; defaults to 3010 to avoid stepping on them.
const PORT = Number(process.env.PORT) || 3010;

// Security headers. CSP/COEP disabled: they'd block Leaflet's cross-origin
// map tiles (CartoDB) and Vite's dev-time inline scripts/styles.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());

// Basic abuse protection for the public API surface (free tier friendliness:
// keeps us within Nominatim/OSRM/Open-Meteo fair-use limits too).
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
}));

// --- Community reports: persisted to disk (JSON file), survives restarts ---
const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

const DEFAULT_REPORTS = [
  {
    id: 'rep_1',
    category: 'police_presence',
    categoryLabel: 'Presencia Policial',
    lat: -34.9059,
    lng: -56.1865,
    streetName: 'Av. 18 de Julio y Ejido',
    neighborhood: 'Centro',
    description: 'Patrullero fijo del PADO y guardia en explanada IMM. Zona muy tranquila.',
    timestamp: 'Hace 10 min',
    upvotes: 24,
    iconType: 'shield'
  },
  {
    id: 'rep_2',
    category: 'crowded_safe',
    categoryLabel: 'Mucha Gente / Seguro',
    lat: -34.9034,
    lng: -56.1768,
    streetName: 'Av. 18 de Julio y Tristán Narvaja',
    neighborhood: 'Cordón',
    description: 'Mucho movimiento de estudiantes, bares abiertos y paradas llenas de gente.',
    timestamp: 'Hace 25 min',
    upvotes: 19,
    iconType: 'users'
  },
  {
    id: 'rep_3',
    category: 'dark_street',
    categoryLabel: 'Calle Muy Oscura',
    lat: -34.9078,
    lng: -56.1880,
    streetName: 'Soriano entre Río Negro y Julio Herrera',
    neighborhood: 'Centro',
    description: 'Tres luminarias públicas parpadeando / apagadas. Conviene subir una cuadra a San José o 18.',
    timestamp: 'Hace 40 min',
    upvotes: 32,
    iconType: 'moon'
  },
  {
    id: 'rep_4',
    category: 'unsafe_feeling',
    categoryLabel: 'Me sentí inseguro',
    lat: -34.9085,
    lng: -56.1955,
    streetName: 'Canelones y Convención',
    neighborhood: 'Centro Sur',
    description: 'Muy poca circulación de gente a partir de las 22:00, poca luz en la vereda sur.',
    timestamp: 'Hace 55 min',
    upvotes: 16,
    iconType: 'alert'
  },
  {
    id: 'rep_5',
    category: 'police_presence',
    categoryLabel: 'Patrullaje Activo',
    lat: -34.9150,
    lng: -56.1490,
    streetName: 'Bv. España y Libertad',
    neighborhood: 'Pocitos',
    description: 'Móvil de Seccional 10ª circulando frecuentemente.',
    timestamp: 'Hace 15 min',
    upvotes: 14,
    iconType: 'shield'
  }
];

function loadReports(): typeof DEFAULT_REPORTS {
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('No se pudo leer data/reports.json, se usa el set inicial:', err);
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(DEFAULT_REPORTS, null, 2));
  return DEFAULT_REPORTS;
}

function saveReports(reports: typeof DEFAULT_REPORTS) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  } catch (err) {
    console.error('No se pudo guardar data/reports.json:', err);
  }
}

let communityReports = loadReports();

// Helper to initialize Gemini
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Más Seguro Montevideo API', time: new Date().toISOString() });
});

// API: Real-time Weather for Montevideo (Open-Meteo)
app.get('/api/weather/montevideo', async (req, res) => {
  try {
    // Montevideo Coordinates: -34.9055, -56.1915
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-34.9055&longitude=-56.1915&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&timezone=America%2FMontevideo';
    const response = await fetch(url, { headers: { 'User-Agent': 'MasSeguro-MVD/1.0' } });
    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }
    const data = await response.json();
    const current = data.current || {};
    
    // Map WMO weather codes to our conditions
    // 0: Clear, 1-3: Partly Cloudy, 45/48: Fog, 51-67: Rain/Drizzle, 80-82: Showers, 95-99: Thunderstorm
    const code = current.weather_code ?? 0;
    let condition: 'Despejado' | 'Lluvia' | 'Tormenta' | 'Niebla' = 'Despejado';
    if (code >= 95) {
      condition = 'Tormenta';
    } else if (code >= 51 || (current.rain && current.rain > 0) || (current.precipitation && current.precipitation > 0.2)) {
      condition = 'Lluvia';
    } else if (code === 45 || code === 48) {
      condition = 'Niebla';
    }

    res.json({
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
  } catch (error) {
    console.warn('Weather fetch fallback:', error);
    res.json({
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
});

// API: Search Montevideo Address / Place (Nominatim Geocoding)
app.get('/api/geocode', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }

    const nominatimHeaders = {
      'User-Agent': 'MasSeguro-Montevideo-App/1.0 (contact: info@masseguro.uy)'
    };

    // House number typed by the user, kept around so we can still show it even
    // if Nominatim only matches an interpolated address range rather than the
    // exact building. Only counts a number as a house number when it TRAILS
    // the query (Uruguayan convention: "street number", e.g. "Rivera 1234").
    // A leading/embedded number doesn't count, since many Montevideo street
    // names are themselves numbers ("18 de Julio", "25 de Mayo", "8 de
    // Octubre") — plain "18 de Julio" must not be read as house number 18.
    const trailingNumberMatch = query.match(/(\d{1,5})\s*$/);
    const typedNumber = trailingNumberMatch ? trailingNumberMatch[1] : null;

    let data: any[] = [];

    // When a house number is present, try Nominatim's structured search first —
    // it resolves exact street+number addresses more reliably than free text.
    if (typedNumber) {
      const structuredUrl = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(query)}&city=Montevideo&country=Uruguay&format=json&addressdetails=1&limit=6`;
      const structuredRes = await fetch(structuredUrl, { headers: nominatimHeaders });
      if (structuredRes.ok) {
        data = await structuredRes.json();
      }
    }

    // Fall back to free-text search (also used for queries with no number,
    // like intersections or landmark names).
    if (data.length === 0) {
      // Restrict bounding box to Montevideo & surrounding metro area
      // Viewbox: min_lon, max_lat, max_lon, min_lat
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Montevideo, Uruguay')}&format=json&addressdetails=1&limit=6&viewbox=-56.35,-34.75,-56.02,-34.95&bounded=0`;
      const response = await fetch(nominatimUrl, { headers: nominatimHeaders });
      if (!response.ok) {
        throw new Error(`Nominatim error ${response.status}`);
      }
      data = await response.json();
    }

    const results = (data || []).map((item: any) => {
      const address = item.address || {};
      const street = address.road || address.pedestrian || address.neighbourhood || item.display_name.split(',')[0];
      const neighborhood = address.suburb || address.neighbourhood || address.city_district || 'Montevideo';

      // Nominatim often only has an interpolated address RANGE rather than the
      // exact building (returned as e.g. "1234,1236,1240,1242,1244"), which
      // isn't a usable single number. In that case, and whenever there's no
      // house_number at all, fall back to the number the user typed and mark
      // it as approximate rather than showing a raw range or dropping it.
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
        neighborhood: neighborhood,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        category: 'custom'
      };
    });

    res.json({ results });
  } catch (err) {
    console.warn('Geocoding error:', err);
    res.json({ results: [] });
  }
});

// API: Reverse Geocode (Coordinates to Street Name)
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const lat = parseFloat(String(req.query.lat));
    const lng = parseFloat(String(req.query.lng));
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MasSeguro-Montevideo-App/1.0' }
    });
    if (!response.ok) throw new Error('Reverse geocode error');
    const data = await response.json();
    const address = data.address || {};
    const road = address.road || address.pedestrian || 'Ubicación actual';
    const suburb = address.suburb || address.neighbourhood || address.city_district || 'Montevideo';

    res.json({
      name: road,
      address: data.display_name,
      neighborhood: suburb,
      lat,
      lng
    });
  } catch (error) {
    res.json({
      name: 'Ubicación actual',
      address: 'Montevideo, Uruguay',
      neighborhood: 'Montevideo',
      lat: Number(req.query.lat) || -34.9055,
      lng: Number(req.query.lng) || -56.1915
    });
  }
});

// API: Get Community Reports
app.get('/api/reports', (req, res) => {
  res.json({ reports: communityReports });
});

// API: Create Community Report
app.post('/api/reports', (req, res) => {
  const { category, categoryLabel, lat, lng, streetName, neighborhood, description, iconType } = req.body;
  if (!lat || !lng || !description) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const newReport = {
    id: 'rep_' + Date.now(),
    category: category || 'unsafe_feeling',
    categoryLabel: categoryLabel || 'Reporte de Seguridad',
    lat: Number(lat),
    lng: Number(lng),
    streetName: streetName || 'Montevideo',
    neighborhood: neighborhood || 'Centro',
    description: String(description),
    timestamp: 'Recién publicado',
    upvotes: 1,
    iconType: iconType || 'alert'
  };

  communityReports.unshift(newReport);
  saveReports(communityReports);
  res.json({ success: true, report: newReport });
});

// API: Upvote Report
app.post('/api/reports/:id/upvote', (req, res) => {
  const { id } = req.params;
  const report = communityReports.find(r => r.id === id);
  if (report) {
    report.upvotes += 1;
    saveReports(communityReports);
    return res.json({ success: true, upvotes: report.upvotes });
  }
  res.status(404).json({ error: 'Reporte no encontrado' });
});

// API: Real pedestrian routing over actual Montevideo streets.
// Uses the free, public "foot" OSRM instance operated by FOSSGIS/OpenStreetMap.de
// (https://routing.openstreetmap.de) — no API key required. Falls back to
// success:false so the client can use its heuristic synthetic route generator.
const routeCache = new Map<string, { data: any; expires: number }>();
const ROUTE_CACHE_TTL_MS = 10 * 60 * 1000;

interface OsrmRouteAlt {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  streetNames: string[];
}

async function fetchOsrmRoute(points: { lat: number; lng: number }[]): Promise<OsrmRouteAlt | null> {
  const coordsPath = points.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordsPath}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url, { headers: { 'User-Agent': 'MasSeguro-Montevideo-App/1.0' } });
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

// Offsets the straight-line midpoint perpendicular to the origin->destination
// vector, by `offsetMeters`, so a via-waypoint request forces OSRM onto a
// genuinely different (but still real, walkable) street path — otherwise the
// "balanced" and "safest" cards frequently collapse onto the same geometry,
// since OSRM's foot profile rarely returns 3 distinct native alternatives.
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

  // Rotate the direction vector 90° to get a perpendicular unit vector.
  const perpX = -vy / length;
  const perpY = vx / length;

  return {
    lat: midLat + (perpY * offsetMeters) / metersPerDegLat,
    lng: midLng + (perpX * offsetMeters) / metersPerDegLng
  };
}

app.get('/api/route', async (req, res) => {
  try {
    const originLat = parseFloat(String(req.query.originLat));
    const originLng = parseFloat(String(req.query.originLng));
    const destLat = parseFloat(String(req.query.destLat));
    const destLng = parseFloat(String(req.query.destLng));

    if ([originLat, originLng, destLat, destLng].some(n => isNaN(n))) {
      return res.status(400).json({ success: false, error: 'Coordenadas inválidas', routes: [] });
    }

    const cacheKey = `${originLat.toFixed(5)},${originLng.toFixed(5)}-${destLat.toFixed(5)},${destLng.toFixed(5)}`;
    const cached = routeCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }

    const origin = { lat: originLat, lng: originLng };
    const destination = { lat: destLat, lng: destLng };

    const dLat = (destLat - originLat) * 111320;
    const dLng = (destLng - originLng) * 111320 * Math.cos((originLat * Math.PI) / 180);
    const straightLineMeters = Math.sqrt(dLat * dLat + dLng * dLng);

    // Proportional, not fixed-floor: a fixed 150m detour is negligible on a
    // 3km walk but quadruples a 100m walk. Small floors just keep OSRM from
    // snapping the waypoint straight back onto the direct street for very
    // short trips.
    const smallOffset = Math.min(300, Math.max(15, straightLineMeters * 0.15));
    const largeOffset = Math.min(600, Math.max(30, straightLineMeters * 0.32));

    const [direct, viaSmall, viaLarge] = await Promise.all([
      fetchOsrmRoute([origin, destination]),
      fetchOsrmRoute([origin, perpendicularWaypoint(origin, destination, smallOffset), destination]),
      fetchOsrmRoute([origin, perpendicularWaypoint(origin, destination, largeOffset), destination])
    ]);

    if (!direct) {
      throw new Error('OSRM no devolvió una ruta directa para estas coordenadas');
    }

    // Dedupe near-identical geometries (e.g. a detour that OSRM snapped back
    // onto the same street as the direct route), and discard detours that
    // blow up disproportionately on short trips (dead ends, one-way loops)
    // rather than showing an absurd "walk 4x further" route.
    const maxReasonableDetour = direct.distanceMeters + Math.max(400, direct.distanceMeters * 1.2);
    const candidates = [direct, viaSmall, viaLarge].filter(
      (r): r is OsrmRouteAlt => r !== null && r.distanceMeters <= maxReasonableDetour
    );
    const routes: OsrmRouteAlt[] = [];
    for (const candidate of candidates) {
      const isDuplicate = routes.some(
        r => Math.abs(r.distanceMeters - candidate.distanceMeters) < 15
      );
      if (!isDuplicate) routes.push(candidate);
    }

    const payload = { success: true, routes, source: 'OSRM Foot (routing.openstreetmap.de)' };
    routeCache.set(cacheKey, { data: payload, expires: Date.now() + ROUTE_CACHE_TTL_MS });
    res.json(payload);
  } catch (error) {
    console.warn('Routing error, cliente usará ruta sintética de respaldo:', error);
    res.json({ success: false, routes: [], source: 'fallback' });
  }
});

// API: AI Safety Analysis with Gemini 3.7 Flash
app.post('/api/safety-analysis', async (req, res) => {
  try {
    const { originName, destinationName, timeString, hourOfDay, weather, routeOption } = req.body;

    const ai = getGeminiClient();

    // Context for prompt
    const prompt = `Actúa como el motor de Inteligencia Artificial de la startup de seguridad urbana "Más Seguro" en Montevideo, Uruguay.
Lema: "Llegá mejor, no solamente más rápido."

El usuario va a caminar desde "${originName}" hasta "${destinationName}" en Montevideo.
Hora actual: ${timeString || '23:30'} (${hourOfDay !== undefined ? `Hora: ${hourOfDay}:00` : 'Nocturno'}).
Clima actual: ${weather || 'Despejado'}.
Ruta analizada: ${routeOption?.name || 'Ruta Más Segura'} (Safety Score: ${routeOption?.safetyScore || 92}/100, Distancia: ${routeOption?.distanceMeters || 1400}m, Tiempo estimado: ${routeOption?.durationMinutes || 18} min).
Calles involucradas: ${routeOption?.summary || 'Avenida 18 de Julio, San José, Constituyente, Pocitos, etc.'}.

Proporciona un veredicto de seguridad inteligente, ultra específico para las calles y barrios de Montevideo (ej. 18 de Julio, Cordón, Pocitos, Centro, Tres Cruces, Parque Rodó, Ciudad Vieja).
Debes devolver una respuesta en formato JSON estrictamente válido con los siguientes campos:
{
  "verdict": "Veredicto conciso de 1 frase contundente",
  "keyRecommendation": "Consejo táctico de caminata (ej: 'Caminá por la vereda norte de 18 de Julio...', 'Evitá cortar por la plaza...', 'Preferí desviarte una cuadra...')",
  "reasons": [
    "Razón 1 concreta sobre iluminación, cámaras C5 o movimiento",
    "Razón 2 sobre comercios 24h o paradas STM",
    "Razón 3 sobre el horario o flujo de peatones"
  ],
  "nighttimeAdvice": "Consejo específico para la noche montevideana",
  "weatherFactor": "Impacto del clima en la seguridad",
  "hotspotsToAvoid": ["Calle o punto oscuro a evitar", "Otro punto a evitar"]
}`;

    if (!ai) {
      // Heuristic fallback if Gemini API Key not present in environment
      return res.json({
        analysis: {
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
          weatherFactor: weather === 'Lluvia' ? "La lluvia reduce el tránsito peatonal en veredas, aumentando la importancia de transitar por avenidas comerciales." : "Condiciones climáticas favorables con visibilidad normal en calles principales.",
          hotspotsToAvoid: ["Cruces poco iluminados de calles secundarias", "Plazas desiertas pasadas las 23:00"]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const responseText = response.text || '';
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(responseText);
    } catch {
      parsedAnalysis = {
        verdict: "Ruta evaluada favorablemente según el índice de seguridad urbana.",
        keyRecommendation: "Caminá por las avenidas principales con cámaras C5 y comercios activos.",
        reasons: ["Mayor densidad de iluminación LED", "Monitoreo CCU activo", "Presencia policial del PADO"],
        nighttimeAdvice: "Evitá calles desiertas y utilizá el modo Acompañame.",
        weatherFactor: "Condiciones estables.",
        hotspotsToAvoid: ["Calles oscuras secundarias"]
      };
    }

    res.json({ analysis: parsedAnalysis });
  } catch (error: any) {
    console.error('Error in safety analysis:', error);
    res.json({
      analysis: {
        verdict: "Análisis de seguridad local aplicado con base en datos urbanos de Montevideo.",
        keyRecommendation: "Mantenete sobre las arterias principales con cobertura de cámaras C5 y farmacias 24h.",
        reasons: [
          "Av. 18 de Julio y corredores centrales tienen el índice Safety Score más alto de la capital.",
          "Monitoreo policial constante y paradas STM con iluminación activa.",
          "Menor tasa de incidentes reportados en comparación con transversales oscuras."
        ],
        nighttimeAdvice: "Priorizá siempre la ruta más iluminada aunque tome 3 a 5 minutos adicionales.",
        weatherFactor: "Monitoreo de visibilidad en tiempo real activo.",
        hotspotsToAvoid: ["Pasajes oscuros sin cámaras"]
      }
    });
  }
});

// API: AI Safety Assistant Chat
app.post('/api/safety-assistant', async (req, res) => {
  try {
    const { message, currentNeighborhood, hourOfDay } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `Sos el asistente inteligente de seguridad urbana de "Más Seguro" en Montevideo, Uruguay.
Conocés en profundidad los barrios (Centro, Ciudad Vieja, Cordón, Pocitos, Punta Carretas, Parque Rodó, Tres Cruces, Aguada, Parque Batlle, etc.), las avenidas (18 de Julio, Bv. Artigas, Rambla, Rivera, 8 de Octubre, Libertador), la ubicación de seccionales policiales (1ª, 2ª, 5ª, 10ª, 9ª) y las cámaras C5 del Ministerio del Interior.
Respondés con tono cercano, profesional, uruguayo natural y directo.
Tu prioridad es la prevención y la seguridad del peatón.`;

    if (!ai) {
      return res.json({
        reply: `En ${currentNeighborhood || 'Montevideo'}, a esta hora (${hourOfDay || 'noche'}), la recomendación principal es caminar por avenidas amplias e iluminadas como Av. 18 de Julio o Bulevar Artigas. Evitá cortar camino por calles oscuras o plazas solitarias. En caso de emergencia, tenés la Seccional más próxima y comercios 24h señalados en el mapa.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Pregunta del usuario: "${message}". Contexto: Barrio actual: ${currentNeighborhood || 'Centro / Cordón'}, Hora: ${hourOfDay || 23}:00.`,
      config: {
        systemInstruction,
        temperature: 0.4
      }
    });

    res.json({ reply: response.text || 'Recordá siempre caminar por calles iluminadas y transitadas.' });
  } catch (error: any) {
    console.error('Assistant error:', error);
    res.json({
      reply: 'Para caminar seguro en Montevideo a esta hora, priorizá las calles con iluminación LED alta, cámaras C5 y presencia de locales 24 horas.'
    });
  }
});

// Setup Vite or Static File Serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Más Seguro Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
