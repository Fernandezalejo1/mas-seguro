import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonOk, jsonError, sanitizeString, parseNum } from './_lib/validation.js';
import { getSupabase, type ReportRow } from './_lib/supabase.js';

function rowToReport(row: ReportRow) {
  return {
    id: row.id,
    category: row.category,
    categoryLabel: row.category_label,
    lat: row.lat,
    lng: row.lng,
    streetName: row.street_name,
    neighborhood: row.neighborhood,
    description: row.description,
    timestamp: row.timestamp,
    upvotes: row.upvotes,
    iconType: row.icon_type
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return jsonOk(res, { reports: (data || []).map(rowToReport) });
    } catch (err) {
      console.error('Error fetching reports:', err);
      return jsonOk(res, { reports: [] });
    }
  }

  if (req.method === 'POST') {
    const { category, categoryLabel, lat, lng, streetName, neighborhood, description, iconType } = req.body || {};

    const numLat = parseNum(lat, NaN);
    const numLng = parseNum(lng, NaN);
    const desc = sanitizeString(description, 1000);

    if (!Number.isFinite(numLat) || !Number.isFinite(numLng) || !desc) {
      return jsonError(res, 'Faltan campos obligatorios');
    }

    const newReport = {
      id: 'rep_' + Date.now(),
      category: sanitizeString(category, 50) || 'unsafe_feeling',
      category_label: sanitizeString(categoryLabel, 100) || 'Reporte de Seguridad',
      lat: numLat,
      lng: numLng,
      street_name: sanitizeString(streetName, 200) || 'Montevideo',
      neighborhood: sanitizeString(neighborhood, 100) || 'Centro',
      description: desc,
      timestamp: 'Recién publicado',
      upvotes: 1,
      icon_type: sanitizeString(iconType, 20) || 'alert'
    };

    try {
      const { data, error } = await supabase
        .from('community_reports')
        .insert(newReport)
        .select()
        .single();

      if (error) throw error;
      return jsonOk(res, { success: true, report: rowToReport(data) });
    } catch (err) {
      console.error('Error creating report:', err);
      return jsonError(res, 'Error al guardar el reporte', 500);
    }
  }

  return jsonError(res, 'Method not allowed', 405);
}
