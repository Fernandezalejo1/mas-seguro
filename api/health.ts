import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk } from './_lib/validation.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return jsonOk(res, {
    status: 'ok',
    app: 'Más Seguro Montevideo API',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}
