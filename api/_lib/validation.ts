import type { VercelResponse } from '@vercel/node';

export function parseNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function isValidCoord(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function sanitizeString(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen).replace(/<[^>]*>/g, '');
}

function setSecureHeaders(res: VercelResponse): VercelResponse {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');
  return res;
}

export function jsonOk(res: VercelResponse, data: unknown): VercelResponse {
  return setSecureHeaders(res.status(200)).json(data);
}

export function jsonError(res: VercelResponse, message: string, status = 400): VercelResponse {
  return setSecureHeaders(res.status(status)).json({ error: message });
}
