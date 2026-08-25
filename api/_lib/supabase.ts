import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { 'x-client-info': 'mas-seguro-api' } }
  });

  return cachedClient;
}

export interface ReportRow {
  id: string;
  category: string;
  category_label: string;
  lat: number;
  lng: number;
  street_name: string;
  neighborhood: string;
  description: string;
  timestamp: string;
  upvotes: number;
  icon_type: string;
  created_at: string;
}
