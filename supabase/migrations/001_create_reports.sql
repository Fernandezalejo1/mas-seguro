-- Mas Seguro: Community Reports table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'unsafe_feeling',
  category_label TEXT NOT NULL DEFAULT 'Reporte de Seguridad',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  street_name TEXT NOT NULL DEFAULT 'Montevideo',
  neighborhood TEXT NOT NULL DEFAULT 'Centro',
  description TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT 'Recién publicado',
  upvotes INTEGER NOT NULL DEFAULT 1,
  icon_type TEXT NOT NULL DEFAULT 'alert',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for geographic queries
CREATE INDEX IF NOT EXISTS idx_reports_location ON community_reports (lat, lng);
CREATE INDEX IF NOT EXISTS idx_reports_created ON community_reports (created_at DESC);

-- Seed initial data
INSERT INTO community_reports (id, category, category_label, lat, lng, street_name, neighborhood, description, timestamp, upvotes, icon_type) VALUES
  ('rep_1', 'police_presence', 'Presencia Policial', -34.9059, -56.1865, 'Av. 18 de Julio y Ejido', 'Centro', 'Patrullero fijo del PADO y guardia en explanada IMM. Zona muy tranquila.', 'Hace 10 min', 24, 'shield'),
  ('rep_2', 'crowded_safe', 'Mucha Gente / Seguro', -34.9034, -56.1768, 'Av. 18 de Julio y Tristán Narvaja', 'Cordón', 'Mucho movimiento de estudiantes, bares abiertos y paradas llenas de gente.', 'Hace 25 min', 19, 'users'),
  ('rep_3', 'dark_street', 'Calle Muy Oscura', -34.9078, -56.188, 'Soriano entre Río Negro y Julio Herrera', 'Centro', 'Tres luminarias públicas parpadeando / apagadas. Conviene subir una cuadra a San José o 18.', 'Hace 40 min', 32, 'moon'),
  ('rep_4', 'unsafe_feeling', 'Me sentí inseguro', -34.9085, -56.1955, 'Canelones y Convención', 'Centro Sur', 'Muy poca circulación de gente a partir de las 22:00, poca luz en la vereda sur.', 'Hace 55 min', 16, 'alert'),
  ('rep_5', 'police_presence', 'Patrullaje Activo', -34.915, -56.149, 'Bv. España y Libertad', 'Pocitos', 'Móvil de Seccional 10ª circulando frecuentemente.', 'Hace 15 min', 14, 'shield')
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) - allow read for everyone, write for authenticated
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key can read)
CREATE POLICY "Public read access" ON community_reports
  FOR SELECT USING (true);

-- Allow insert/update for anyone (anonymous reports are core to the app)
-- In production, consider adding CAPTCHA or rate limiting at the API level
CREATE POLICY "Allow anonymous inserts" ON community_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous updates" ON community_reports
  FOR UPDATE USING (true);
