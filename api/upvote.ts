import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, sanitizeString } from './_lib/validation.js';
import { getSupabase } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return jsonError(res, 'Method not allowed', 405);

  const id = sanitizeString(req.query.id, 50);
  if (!id) return jsonError(res, 'ID inválido');

  const supabase = getSupabase();

  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('community_reports')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return jsonError(res, 'Reporte no encontrado', 404);

    const newCount = (existing.upvotes || 0) + 1;
    const { error: updateErr } = await supabase
      .from('community_reports')
      .update({ upvotes: newCount })
      .eq('id', id);

    if (updateErr) throw updateErr;
    return jsonOk(res, { success: true, upvotes: newCount });
  } catch (err) {
    console.error('Upvote error:', err);
    return jsonError(res, 'Error al actualizar', 500);
  }
}
