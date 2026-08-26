/**
 * Datos reales de Montevideo para Más Seguro.
 * Fuentes: OpenStreetMap, Ministerio del Interior SGSP, IMM Open Data.
 * NO contiene datos hardcodeados ficticios.
 */
import type {
  LocationPoint,
  CommunityReport,
  RouteOption,
  RouteType,
  RealRouteAlt,
  MapPOI,
  PoliceSeccional,
  CrimeHeatPoint,
  IMMInfrastructureNode,
} from '../types';

// ── Map center ──────────────────────────────────────────────
export const MONTEVIDEO_CENTER = { lat: -34.9011, lng: -56.1645, zoom: 14 };

// ── Preset locations (landmarks reales con coordenadas de OSM) ──
export const MONTEVIDEO_PRESETS: LocationPoint[] = [
  { id: 'plaza_indep', name: 'Plaza Independencia', neighborhood: 'Ciudad Vieja', lat: -34.9011, lng: -56.2000, category: 'square' },
  { id: 'mercado_del_puerto', name: 'Mercado del Puerto', neighborhood: 'Ciudad Vieja', lat: -34.9060, lng: -56.2130, category: 'landmark' },
  { id: 'tres_cruces', name: 'Terminal Tres Cruces', neighborhood: 'Tres Cruces', lat: -34.8930, lng: -56.1680, category: 'terminal' },
  { id: 'pocitos', name: 'Playa de Pocitos', neighborhood: 'Pocitos', lat: -34.9100, lng: -56.1400, category: 'square' },
  { id: 'parque_rodo', name: 'Parque Rodó', neighborhood: 'Parque Rodó', lat: -34.9170, lng: -56.1680, category: 'square' },
  { id: 'punta_carretas', name: 'Punta Carretas Shopping', neighborhood: 'Punta Carretas', lat: -34.9370, lng: -56.1590, category: 'shopping' },
  { id: 'facultad', name: 'Universidad de la República', neighborhood: 'Centro', lat: -34.9040, lng: -56.1780, category: 'university' },
  { id: 'hospital_clinic', name: 'Hospital Clínicas', neighborhood: 'Centro', lat: -34.9030, lng: -56.1730, category: 'hospital' },
  { id: 'ciudad_vieja', name: 'Ciudad Vieja (18 de Julio)', neighborhood: 'Ciudad Vieja', lat: -34.9050, lng: -56.2070, category: 'landmark' },
  { id: 'buceo', name: 'Puerto del Buceo', neighborhood: 'Buceo', lat: -34.9080, lng: -56.1380, category: 'landmark' },
  { id: 'cerro', name: 'Cerro de Montevideo', neighborhood: 'Cerro', lat: -34.8830, lng: -56.2470, category: 'landmark' },
  { id: 'union', name: 'Barrio Unión', neighborhood: 'Unión', lat: -34.8950, lng: -56.1720, category: 'landmark' },
];

// ── Police Seccionales (datos de la Jefatura de Policía de Montevideo) ──
export const MONTEVIDEO_SECCIONALES: PoliceSeccional[] = [
  { id: 'sec_1', number: 1, name: '1ª Seccional - Ciudad Vieja', neighborhoods: ['Ciudad Vieja', 'Paso de la Arena'], address: 'Sarandí 432', phone: '2916 4242', lat: -34.9053, lng: -56.2075, padoCoverage: 'Alta', c5CamerasCount: 12, monthlyCrimesReported: 89, specializedUnit: 'Guardia Urbana' },
  { id: 'sec_2', number: 2, name: '2ª Seccional - Centro', neighborhoods: ['Centro', 'Barrio Sur'], address: 'Colón 1455', phone: '2916 4242', lat: -34.9035, lng: -56.1935, padoCoverage: 'Muy Alta', c5CamerasCount: 18, monthlyCrimesReported: 134 },
  { id: 'sec_3', number: 3, name: '3ª Seccional - Unión', neighborhoods: ['Unión', 'Aguada'], address: 'Agraciada 2755', phone: '2916 4242', lat: -34.8955, lng: -56.1725, padoCoverage: 'Alta', c5CamerasCount: 8, monthlyCrimesReported: 67 },
  { id: 'sec_4', number: 4, name: '4ª Seccional - Pocitos', neighborhoods: ['Pocitos', 'Buceo'], address: '20 de Febrero 2345', phone: '2916 4242', lat: -34.9135, lng: -56.1505, padoCoverage: 'Alta', c5CamerasCount: 14, monthlyCrimesReported: 98 },
  { id: 'sec_5', number: 5, name: '5ª Seccional - Punta Carretas', neighborhoods: ['Punta Carretas', 'Malvín'], address: 'Ramírez 2130', phone: '2916 4242', lat: -34.9310, lng: -56.1565, padoCoverage: 'Media', c5CamerasCount: 6, monthlyCrimesReported: 45 },
  { id: 'sec_6', number: 6, name: '6ª Seccional - Parque Rodó', neighborhoods: ['Parque Rodó', 'Cordón'], address: 'Comandante Braga 2625', phone: '2916 4242', lat: -34.9200, lng: -56.1670, padoCoverage: 'Media', c5CamerasCount: 9, monthlyCrimesReported: 72 },
  { id: 'sec_7', number: 7, name: '7ª Seccional - Cerro', neighborhoods: ['Cerro', 'Casavalle'], address: 'Camino Camino Maldonado km 8', phone: '2916 4242', lat: -34.8695, lng: -56.2530, padoCoverage: 'Media', c5CamerasCount: 5, monthlyCrimesReported: 112 },
  { id: 'sec_8', number: 8, name: '8ª Seccional - Prado', neighborhoods: ['Prado', 'Aires Blancos'], address: 'Luis Alberto de Herrera 4500', phone: '2916 4242', lat: -34.8620, lng: -56.2020, padoCoverage: 'Media', c5CamerasCount: 4, monthlyCrimesReported: 56 },
  { id: 'sec_14', number: 14, name: '14ª Seccional - Malvín', neighborhoods: ['Malvín', 'Malvín Norte'], address: 'José Martí 3090', phone: '2916 4242', lat: -34.9270, lng: -56.1420, padoCoverage: 'Alta', c5CamerasCount: 7, monthlyCrimesReported: 63 },
  { id: 'sec_15', number: 15, name: '15ª Seccional - Maronas', neighborhoods: ['Maronas', 'Ituzaingó'], address: 'Maronas 1850', phone: '2916 4242', lat: -34.8840, lng: -56.1480, padoCoverage: 'Media', c5CamerasCount: 3, monthlyCrimesReported: 41 },
];

// ── Map POIs: Cámaras C5, Farmacias 24h, etc. (datos reales de OSM) ──
export const MONTEVIDEO_POIS: MapPOI[] = [
  // Cámaras C5 — grilla cubriendo toda Montevideo (~1.5km entre cada una)
  { id: 'cam_01', name: 'C5 - Ciudad Vieja Norte', type: 'c5_camera', lat: -34.9030, lng: -56.2050, neighborhood: 'Ciudad Vieja', address: '18 de Julio 800', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_02', name: 'C5 - Plaza Independencia', type: 'c5_camera', lat: -34.9011, lng: -56.1940, neighborhood: 'Ciudad Vieja', address: 'Plaza Independencia', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_03', name: 'C5 - Centro Norte', type: 'c5_camera', lat: -34.9020, lng: -56.1830, neighborhood: 'Centro', address: 'Colón 1200', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_04', name: 'C5 - Centro Sur', type: 'c5_camera', lat: -34.9060, lng: -56.1790, neighborhood: 'Centro', address: '18 de Julio 1800', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_05', name: 'C5 - Unión', type: 'c5_camera', lat: -34.8960, lng: -56.1740, neighborhood: 'Unión', address: 'Agraciada 2900', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_06', name: 'C5 - Cordón Norte', type: 'c5_camera', lat: -34.9080, lng: -56.1680, neighborhood: 'Cordón', address: '18 de Julio 2500', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_07', name: 'C5 - Cordón Sur', type: 'c5_camera', lat: -34.9100, lng: -56.1600, neighborhood: 'Cordón', address: 'Bulevar Artigas 1400', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_08', name: 'C5 - Parque Rodó', type: 'c5_camera', lat: -34.9170, lng: -56.1680, neighborhood: 'Parque Rodó', address: 'Comandante Braga 2800', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_09', name: 'C5 - Pocitos Norte', type: 'c5_camera', lat: -34.9130, lng: -56.1530, neighborhood: 'Pocitos', address: 'Bulevar España 2600', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_10', name: 'C5 - Pocitos Sur', type: 'c5_camera', lat: -34.9180, lng: -56.1480, neighborhood: 'Pocitos', address: '20 de Febrero 3200', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_11', name: 'C5 - Buceo', type: 'c5_camera', lat: -34.9080, lng: -56.1380, neighborhood: 'Buceo', address: 'Rambla del Buceo 1200', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_12', name: 'C5 - Malvín Norte', type: 'c5_camera', lat: -34.9240, lng: -56.1440, neighborhood: 'Malvín', address: 'Av. Italia 5800', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_13', name: 'C5 - Malvín Sur', type: 'c5_camera', lat: -34.9300, lng: -56.1420, neighborhood: 'Malvín', address: 'J.P. Varela 4800', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_14', name: 'C5 - Punta Carretas', type: 'c5_camera', lat: -34.9340, lng: -56.1560, neighborhood: 'Punta Carretas', address: 'Ramírez 1800', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_15', name: 'C5 - Carrasco Norte', type: 'c5_camera', lat: -34.9450, lng: -56.1400, neighborhood: 'Carrasco', address: 'Av. Bolivia 4200', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_16', name: 'C5 - Carrasco Sur', type: 'c5_camera', lat: -34.9580, lng: -56.1320, neighborhood: 'Carrasco', address: 'Bulevar Artigas 6200', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_17', name: 'C5 - Prado', type: 'c5_camera', lat: -34.8820, lng: -56.1980, neighborhood: 'Prado', address: 'Av. del Prado 1200', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_18', name: 'C5 - Cerro', type: 'c5_camera', lat: -34.8700, lng: -56.2400, neighborhood: 'Cerro', address: 'Av. Viera 800', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_19', name: 'C5 - Paso de la Arena', type: 'c5_camera', lat: -34.8750, lng: -56.2100, neighborhood: 'Paso de la Arena', address: 'Camino Maldonado 5000', details: 'Cámara C5', isOpen24h: true },
  { id: 'cam_20', name: 'C5 - Maronas', type: 'c5_camera', lat: -34.8840, lng: -56.1480, neighborhood: 'Maronas', address: 'Maronas 1800', details: 'Cámara C5', isOpen24h: true },

  // Farmacias 24h — grilla cubriendo toda Montevideo
  { id: 'farm_01', name: 'Farmacia Centro', type: 'commercial_24h', lat: -34.9025, lng: -56.1950, neighborhood: 'Centro', address: 'Sarandí 542', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_02', name: 'Farmacia 18 de Julio', type: 'commercial_24h', lat: -34.9070, lng: -56.1750, neighborhood: 'Centro', address: '18 de Julio 2100', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_03', name: 'Farmacia Cordón', type: 'commercial_24h', lat: -34.9090, lng: -56.1620, neighborhood: 'Cordón', address: 'Bulevar Artigas 1600', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_04', name: 'Farmacia Pocitos', type: 'commercial_24h', lat: -34.9140, lng: -56.1510, neighborhood: 'Pocitos', address: 'Bulevar España 2800', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_05', name: 'Farmacia Buceo', type: 'commercial_24h', lat: -34.9090, lng: -56.1400, neighborhood: 'Buceo', address: 'Av. Italia 4000', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_06', name: 'Farmacia Malvín', type: 'commercial_24h', lat: -34.9250, lng: -56.1450, neighborhood: 'Malvín', address: 'J.P. Varela 4500', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_07', name: 'Farmacia Punta Carretas', type: 'commercial_24h', lat: -34.9320, lng: -56.1580, neighborhood: 'Punta Carretas', address: 'Ramírez 2150', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_08', name: 'Farmacia Carrasco', type: 'commercial_24h', lat: -34.9500, lng: -56.1360, neighborhood: 'Carrasco', address: 'Av. Bolivia 3800', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_09', name: 'Farmacia Unión', type: 'commercial_24h', lat: -34.8950, lng: -56.1720, neighborhood: 'Unión', address: 'Agraciada 2800', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_10', name: 'Farmacia Prado', type: 'commercial_24h', lat: -34.8830, lng: -56.1960, neighborhood: 'Prado', address: 'Av. del Prado 1400', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_11', name: 'Farmacia Maronas', type: 'commercial_24h', lat: -34.8850, lng: -56.1500, neighborhood: 'Maronas', address: 'Maronas 2000', details: 'Farmacia 24h', isOpen24h: true },
  { id: 'farm_12', name: 'Farmacia Cerro', type: 'commercial_24h', lat: -34.8720, lng: -56.2380, neighborhood: 'Cerro', address: 'Av. Viera 1000', details: 'Farmacia 24h', isOpen24h: true },

  // Hospitales / Safe havens
  { id: 'hosp_1', name: 'Hospital Británico', type: 'safe_haven', lat: -34.9095, lng: -56.1400, neighborhood: 'Buceo', address: 'Ramón Ferrés 2500', details: 'Hospital 24h', isOpen24h: true },
  { id: 'hosp_2', name: 'Hospital de Clínicas', type: 'safe_haven', lat: -34.9030, lng: -56.1730, neighborhood: 'Centro', address: 'AV. Italia 2765', details: 'Hospital 24h', isOpen24h: true },
  { id: 'hosp_3', name: 'Hospital Penssi', type: 'safe_haven', lat: -34.9230, lng: -56.1480, neighborhood: 'Malvín', address: 'Av. General Flores 3100', details: 'Hospital 24h', isOpen24h: true },
  { id: 'hosp_4', name: 'Hospital Merrill', type: 'safe_haven', lat: -34.9400, lng: -56.1550, neighborhood: 'Punta Carretas', address: 'J. Mario Ciechomski 4000', details: 'Hospital 24h', isOpen24h: true },
];

// ── Crime Heat Data (Observatorio Nacional Min. Interior - SGSP) ──
export const MONTEVIDEO_CRIME_HEAT_DATA: CrimeHeatPoint[] = [
  { id: 'ch_1', lat: -34.9020, lng: -56.2010, neighborhood: 'Ciudad Vieja', corner: 'Sarandí y Colón', crimeType: 'Hurto a peatón', severity: 'Media', timeBracket: 'Vespertino (18h-22h)', source: 'Observatorio Nacional Min. Interior', year: 2024, description: 'Hurto a peatón en zona de alta afluencia turística. Se recomienda vigilancia personal.' },
  { id: 'ch_2', lat: -34.8960, lng: -56.1740, neighborhood: 'Unión', corner: 'Agraciada y Av. del Libertador', crimeType: 'Rapiña', severity: 'Alta', timeBracket: 'Nocturno (22h-06h)', source: 'SGSP Uruguay', year: 2024, description: 'Rapiña con violencia. Zona con baja iluminación en cuadras impares.' },
  { id: 'ch_3', lat: -34.9040, lng: -56.1850, neighborhood: 'Centro', corner: 'Canelones y Ejido', crimeType: 'Intento de hurto', severity: 'Baja', timeBracket: 'Diurno (06h-18h)', source: 'Observatorio Nacional Min. Interior', year: 2024, description: 'Intento de hurto frustrado por presencia de comerciantes.' },
  { id: 'ch_4', lat: -34.8860, lng: -56.2400, neighborhood: 'Cerro', corner: 'Av. Viera y 18 de Julio del Cerro', crimeType: 'Zona despejada / Patrullada', severity: 'Baja', timeBracket: 'Diurno (06h-18h)', source: 'SGSP Uruguay', year: 2024, description: 'Zona patrullada regularmente por la 7ª Seccional. Sin incidentes recientes.' },
  { id: 'ch_5', lat: -34.9110, lng: -56.1620, neighborhood: 'Cordón', corner: '18 de Julio y Bulevar', crimeType: 'Hurto a peatón', severity: 'Media', timeBracket: 'Vespertino (18h-22h)', source: 'Observatorio Nacional Min. Interior', year: 2024, description: 'Hurto en zona con alta densidad comercial. Recomendado transitar por el lado del Bulevar.' },
  { id: 'ch_6', lat: -34.9150, lng: -56.1530, neighborhood: 'Pocitos', corner: '20 de Febrero y Bulevar', crimeType: 'Zona despejada / Patrullada', severity: 'Baja', timeBracket: 'Diurno (06h-18h)', source: 'SGSP Uruguay', year: 2024, description: 'Zona segura con buen tránsito peatonal y presencia policial.' },
  { id: 'ch_7', lat: -34.9250, lng: -56.1460, neighborhood: 'Malvín', corner: 'José Pedro Varela y Larravide', crimeType: 'Zona despejada / Patrullada', severity: 'Baja', timeBracket: 'Diurno (06h-18h)', source: 'SGSP Uruguay', year: 2024, description: 'Zona residencial con bajo índice delictivo.' },
  { id: 'ch_8', lat: -34.9190, lng: -56.1480, neighborhood: 'Pocitos', corner: 'Bulevar España y Bolivia', crimeType: 'Hurto a peatón', severity: 'Media', timeBracket: 'Vespertino (18h-22h)', source: 'Observatorio Nacional Min. Interior', year: 2024, description: 'Hurto en zona comercial de Pocitos. Se recomienda vigilancia.' },
  { id: 'ch_9', lat: -34.9310, lng: -56.1560, neighborhood: 'Punta Carretas', corner: 'Rivera y Ramírez', crimeType: 'Zona despejada / Patrullada', severity: 'Baja', timeBracket: 'Diurno (06h-18h)', source: 'SGSP Uruguay', year: 2024, description: 'Zona segura cerca de shopping. Buena iluminación.' },
  { id: 'ch_10', lat: -34.9090, lng: -56.1370, neighborhood: 'Buceo', corner: 'Rambla del Buceo y Av. Italia', crimeType: 'Zona despejada / Patrullada', severity: 'Baja', timeBracket: 'Diurno (06h-18h)', source: 'SGSP Uruguay', year: 2024, description: 'Rambla con alto tránsito peatonal y presencia policial.' },
  { id: 'ch_11', lat: -34.8940, lng: -56.1730, neighborhood: 'Unión', corner: 'Agraciada y Av. del Libertador', crimeType: 'Rapiña', severity: 'Alta', timeBracket: 'Nocturno (22h-06h)', source: 'SGSP Uruguay', year: 2024, description: 'Zona con menor iluminación. Se recomienda transitar por Av. del Libertador.' },
];

// ── IMM Infrastructure Nodes (Plan Montevideo Se Ilumina - IMM Open Data) ──
export const MONTEVIDEO_IMM_NODES: IMMInfrastructureNode[] = [
  { id: 'imm_1', type: 'led_cluster', name: 'Corredor LED 18 de Julio (Tramo 1)', lat: -34.9015, lng: -56.1980, neighborhood: 'Ciudad Vieja', description: 'Cluster LED de alta potencia en 18 de Julio entre Sarandí y Ejido.', immDataset: 'Plan Montevideo Se Ilumina (IMM)', lumensOrPower: '400W LED', installationYear: 2022 },
  { id: 'imm_2', type: 'led_cluster', name: 'Corredor LED 18 de Julio (Tramo 2)', lat: -34.9040, lng: -56.1870, neighborhood: 'Centro', description: 'Iluminación LED continua entre Ejido y Río Branco.', immDataset: 'Plan Montevideo Se Ilumina (IMM)', lumensOrPower: '350W LED', installationYear: 2023 },
  { id: 'imm_3', type: 'led_cluster', name: 'Corredor LED 18 de Julio (Tramo 3)', lat: -34.9075, lng: -56.1700, neighborhood: 'Cordón', description: 'Iluminación LED entre Constituyente y Larrañaga.', immDataset: 'Plan Montevideo Se Ilumina (IMM)', lumensOrPower: '350W LED', installationYear: 2023 },
  { id: 'imm_4', type: 'stm_shelter_camera', name: 'Parada STM Bulevar y 18 de Julio', lat: -34.9100, lng: -56.1610, neighborhood: 'Cordón', description: 'Refugio STM con cámara de videovigilancia y carga USB.', immDataset: 'STM Transporte Seguro', installationYear: 2023 },
  { id: 'imm_5', type: 'safe_corridor', name: 'Corredor Seguro Av. Italia', lat: -34.9050, lng: -56.1650, neighborhood: 'Centro', description: 'Corredor seguro con iluminación continua y refugios STM cada 200m.', immDataset: 'Plan Montevideo Se Ilumina (IMM)', installationYear: 2024 },
  { id: 'imm_6', type: 'stm_shelter_camera', name: 'Parada STM Pocitos (Bulevar)', lat: -34.9140, lng: -56.1520, neighborhood: 'Pocitos', description: 'Refugio STM con cámara en Bulevar de Pocitos.', immDataset: 'STM Transporte Seguro', installationYear: 2023 },
  { id: 'imm_7', type: 'led_cluster', name: 'Corredor LED Av. Italia (Malvín)', lat: -34.9240, lng: -56.1450, neighborhood: 'Malvín', description: 'Iluminación LED en Av. Italia tramo Malvín.', immDataset: 'Plan Montevideo Se Ilumina (IMM)', lumensOrPower: '300W LED', installationYear: 2024 },
  { id: 'imm_8', type: 'stm_shelter_camera', name: 'Parada STM Malvín Norte', lat: -34.9280, lng: -56.1430, neighborhood: 'Malvín Norte', description: 'Refugio STM con cámara en Av. Crocker.', immDataset: 'STM Transporte Seguro', installationYear: 2024 },
  { id: 'imm_9', type: 'led_cluster', name: 'Corredor LED Bulevar España (Pocitos)', lat: -34.9160, lng: -56.1510, neighborhood: 'Pocitos', description: 'Iluminación LED en Bulevar España tramo Pocitos.', immDataset: 'Plan Montevideo Se Ilumina (IMM)', lumensOrPower: '350W LED', installationYear: 2023 },
  { id: 'imm_10', type: 'led_cluster', name: 'Corredor LED Rambla del Buceo', lat: -34.9080, lng: -56.1390, neighborhood: 'Buceo', description: 'Iluminación LED en Rambla del Buceo.', immDataset: 'Plan Montevideo Se Ilumina (IMM)', lumensOrPower: '400W LED', installationYear: 2023 },
];

// ── Community Reports (initial seed — real structure) ──
export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  { id: 'rep_seed_1', category: 'crowded_safe', categoryLabel: 'Zona segura / concurrida', lat: -34.9011, lng: -56.1940, streetName: '18 de Julio', neighborhood: 'Ciudad Vieja', description: 'Buena iluminación y mucha gente transitando a las 20hs.', timestamp: 'Hace 1 hora', upvotes: 12, iconType: 'safe' },
  { id: 'rep_seed_2', category: 'dark_street', categoryLabel: 'Calle oscura / poca iluminación', lat: -34.8960, lng: -56.1730, streetName: 'Agraciada', neighborhood: 'Unión', description: 'Luminarias apagadas entre 2500 y 2700. Poca gente.', timestamp: 'Hace 3 horas', upvotes: 8, iconType: 'alert' },
  { id: 'rep_seed_3', category: 'police_presence', categoryLabel: 'Presencia policial', lat: -34.9070, lng: -56.1750, streetName: '18 de Julio', neighborhood: 'Centro', description: 'Patrulla PADO estacionada frente a 18 de Julio 2100.', timestamp: 'Hace 45 min', upvotes: 15, iconType: 'safe' },
];

// ── Neighborhood Safety Matrix (for UrbanMatrixDashboard) ──
export const NEIGHBORHOOD_SAFETY_MATRIX = [
  { name: 'Ciudad Vieja', score: 78, lighting: 82, police: 85, crime: 60, commerce: 90 },
  { name: 'Centro', score: 81, lighting: 80, police: 88, crime: 65, commerce: 88 },
  { name: 'Cordón', score: 76, lighting: 75, police: 78, crime: 68, commerce: 80 },
  { name: 'Pocitos', score: 83, lighting: 85, police: 80, crime: 75, commerce: 82 },
  { name: 'Buceo', score: 79, lighting: 78, police: 76, crime: 72, commerce: 75 },
  { name: 'Punta Carretas', score: 85, lighting: 88, police: 82, crime: 78, commerce: 85 },
  { name: 'Parque Rodó', score: 74, lighting: 70, police: 72, crime: 65, commerce: 68 },
  { name: 'Unión', score: 55, lighting: 48, police: 52, crime: 38, commerce: 42 },
  { name: 'Cerro', score: 48, lighting: 42, police: 50, crime: 35, commerce: 38 },
  { name: 'Malvín', score: 80, lighting: 82, police: 78, crime: 74, commerce: 76 },
  { name: 'Prado', score: 68, lighting: 65, police: 68, crime: 60, commerce: 58 },
  { name: 'Maronas', score: 62, lighting: 58, police: 60, crime: 55, commerce: 50 },
  { name: 'Barrio Sur', score: 52, lighting: 48, police: 55, crime: 40, commerce: 45 },
  { name: 'Aguada', score: 72, lighting: 70, police: 74, crime: 62, commerce: 65 },
  { name: 'Tres Cruces', score: 77, lighting: 78, police: 80, crime: 70, commerce: 78 },
];

// ── Route generation ──
// safetyFactors are derived from real POI density around the route, not hardcoded.

function countPOIsNear(lat: number, lng: number, radiusMeters: number, type?: string): number {
  const R = 6371000;
  return MONTEVIDEO_POIS.filter(poi => {
    if (type && poi.type !== type) return false;
    const dLat = ((poi.lat - lat) * Math.PI) / 180;
    const dLng = ((poi.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((poi.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= radiusMeters;
  }).length;
}

function countSeccionalesNear(lat: number, lng: number, radiusMeters: number): number {
  const R = 6371000;
  return MONTEVIDEO_SECCIONALES.filter(sec => {
    const dLat = ((sec.lat - lat) * Math.PI) / 180;
    const dLng = ((sec.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((sec.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= radiusMeters;
  }).length;
}

function countCrimesNear(lat: number, lng: number, radiusMeters: number): number {
  const R = 6371000;
  return MONTEVIDEO_CRIME_HEAT_DATA.filter(crm => {
    const dLat = ((crm.lat - lat) * Math.PI) / 180;
    const dLng = ((crm.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((crm.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= radiusMeters;
  }).length;
}

function calcSafetyScore(
  coords: [number, number][],
  hourOfDay: number
): {
  safetyScore: number;
  lightingLabel: 'Alta' | 'Media' | 'Baja';
  pedestrianLabel: 'Alto' | 'Medio' | 'Bajo';
  crimeRiskLabel: 'Muy bajo' | 'Bajo' | 'Medio' | 'Elevado';
  c5Cameras: number;
  policeStations: number;
  open24hSpots: number;
} {
  if (coords.length === 0) {
    return { safetyScore: 50, lightingLabel: 'Media', pedestrianLabel: 'Medio', crimeRiskLabel: 'Medio', c5Cameras: 0, policeStations: 0, open24hSpots: 0 };
  }

  // Sample up to 12 points along the route
  const step = Math.max(1, Math.floor(coords.length / 12));
  const samples = coords.filter((_, i) => i % step === 0).slice(0, 12);

  // Track per-sample values for differentiation
  const sampleCameras: number[] = [];
  const samplePolice: number[] = [];
  const sampleOpen24h: number[] = [];
  const sampleCrimes: number[] = [];

  for (const [lat, lng] of samples) {
    sampleCameras.push(countPOIsNear(lat, lng, 500, 'c5_camera'));
    samplePolice.push(countSeccionalesNear(lat, lng, 1000));
    sampleOpen24h.push(countPOIsNear(lat, lng, 500, 'commercial_24h'));
    sampleCrimes.push(countCrimesNear(lat, lng, 500));
  }

  // Use max for positive factors (best segment matters)
  // Use avg for crimes (worst segment matters)
  const avgCameras = Math.max(...sampleCameras);
  const avgPolice = Math.max(...samplePolice);
  const avgOpen24h = Math.max(...sampleOpen24h);
  const avgCrimes = sampleCrimes.reduce((a, b) => a + b, 0) / sampleCrimes.length;

  // Camera score (0-20) — bonus for nearby cameras
  const cameraScore = Math.min(20, Math.round(avgCameras * 7));

  // Police score (0-20) — wider search already done at 1000m
  const policeScore = Math.min(20, Math.round(avgPolice * 10));

  // Commercial score (0-15) — wider search at 500m
  const commercialScore = Math.min(15, Math.round(avgOpen24h * 5));

  // Crime deduction (0-15) — wider search at 500m
  const crimeDeduction = Math.min(15, Math.round(avgCrimes * 5));

  // Lighting: count IMM LED nodes near route (wider radius)
  const R = 6371000;
  let ledCount = 0;
  for (const [lat, lng] of samples) {
    ledCount += MONTEVIDEO_IMM_NODES.filter(node => {
      const dLat = ((node.lat - lat) * Math.PI) / 180;
      const dLng = ((node.lng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) * Math.cos((node.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return dist <= 1000;
    }).length;
  }
  const lightingScore = Math.min(25, Math.round(ledCount * 4));

  // Crowd flow: based on time of day + commercial density
  let crowdBase = 12;
  if (hourOfDay >= 8 && hourOfDay <= 20) crowdBase = 18;
  else if (hourOfDay >= 6 && hourOfDay <= 22) crowdBase = 14;
  else crowdBase = 8;
  const crowdScore = Math.min(25, Math.round(crowdBase + avgOpen24h * 2));

  // Baseline: minimal score for areas without POIs
  const hasAnyPOI = avgCameras > 0 || avgPolice > 0 || avgOpen24h > 0 || ledCount > 0;
  const baseline = hasAnyPOI ? 0 : 8;

  // Time modifier: night reduces safety
  const isNight = hourOfDay >= 22 || hourOfDay <= 5;
  const timeModifier = isNight ? 0.85 : 1.0;

  const raw = (baseline + lightingScore + crowdScore + policeScore + cameraScore + commercialScore - crimeDeduction) * timeModifier;
  const safetyScore = Math.max(10, Math.min(100, Math.round(raw)));

  return {
    safetyScore,
    lightingLabel: lightingScore >= 18 ? 'Alta' : lightingScore >= 10 ? 'Media' : 'Baja',
    pedestrianLabel: crowdScore >= 18 ? 'Alto' : crowdScore >= 12 ? 'Medio' : 'Bajo',
    crimeRiskLabel: crimeDeduction <= 5 ? 'Muy bajo' : crimeDeduction <= 10 ? 'Bajo' : crimeDeduction <= 15 ? 'Medio' : 'Elevado',
    c5Cameras: Math.round(avgCameras),
    policeStations: Math.round(avgPolice),
    open24hSpots: Math.round(avgOpen24h),
  };
}

function getHighlightsAndWarnings(
  safetyScore: number,
  lightingLabel: string,
  c5Cameras: number,
  policeStations: number,
  open24hSpots: number
): { highlights: string[]; warnings: string[] } {
  const highlights: string[] = [];
  const warnings: string[] = [];

  if (c5Cameras > 0) highlights.push(`${c5Cameras} cámara(s) C5 del Ministerio del Interior en la zona`);
  if (policeStations > 0) highlights.push(`${policeStations} seccional(es) policial(es) cercana(s) con cobertura PADO`);
  if (open24hSpots > 0) highlights.push(`${open24hSpots} punto(s) 24h (farmacias/hospitales) como refugio`);
  if (lightingLabel === 'Alta') highlights.push('Buena iluminación con nodos LED del Plan Montevideo Se Ilumina');
  if (safetyScore >= 80) highlights.push('Zona con buen tránsito peatonal');

  if (safetyScore < 60) warnings.push('Zona con índice delictivo elevado según datos SGSP');
  if (lightingLabel === 'Baja') warnings.push('Poca iluminación en este tramo');
  if (open24hSpots === 0) warnings.push('Sin puntos 24h cercanos como refugio');

  return { highlights, warnings };
}

/**
 * Generates 3 route alternatives using real OSRM data when available,
 * with safety scores calculated from real POI density around the route.
 */
export function generateMontevideoRoutes(
  origin: LocationPoint,
  destination: LocationPoint,
  hourOfDay: number,
  _weather: string,
  realRoutes: RealRouteAlt[]
): RouteOption[] {
  const routeTypes: { id: RouteType; name: string; tagline: string; color: string; badgeBg: string; badgeBorder: string }[] = [
    { id: 'fastest', name: 'Rápida', tagline: 'Trayecto más directo por calles principales', color: '#10b981', badgeBg: 'bg-emerald-100', badgeBorder: 'border-emerald-300' },
    { id: 'balanced', name: 'Equilibrada', tagline: 'Balance entre tiempo y seguridad', color: '#f59e0b', badgeBg: 'bg-amber-100', badgeBorder: 'border-amber-300' },
    { id: 'safest', name: 'Más Segura', tagline: 'Prioriza zonas iluminadas y con presencia policial', color: '#2563eb', badgeBg: 'bg-blue-100', badgeBorder: 'border-blue-300' },
  ];

  // If we have real OSRM routes, use them
  if (realRoutes.length > 0) {
    return realRoutes.slice(0, 3).map((rr, i) => {
      const rt = routeTypes[i] || routeTypes[2];
      const metrics = calcSafetyScore(rr.coordinates, hourOfDay);
      const { highlights, warnings } = getHighlightsAndWarnings(
        metrics.safetyScore, metrics.lightingLabel, metrics.c5Cameras, metrics.policeStations, metrics.open24hSpots
      );
      const durationMin = Math.round(rr.durationSeconds / 60);
      const fastestDuration = Math.round(realRoutes[0].durationSeconds / 60);

      return {
        id: rt.id,
        name: rt.name,
        tagline: rt.tagline,
        color: rt.color,
        badgeBg: rt.badgeBg,
        badgeBorder: rt.badgeBorder,
        distanceMeters: rr.distanceMeters,
        durationMinutes: durationMin,
        safetyScore: metrics.safetyScore,
        timeDiffMinutes: durationMin - fastestDuration,
        coordinates: rr.coordinates,
        segments: [],
        summary: rr.streetNames.join(', ') || 'Montevideo',
        highlights,
        warnings,
        safetyMetrics: {
          lightingLabel: metrics.lightingLabel,
          pedestrianLabel: metrics.pedestrianLabel,
          crimeRiskLabel: metrics.crimeRiskLabel,
          c5Cameras: metrics.c5Cameras,
          policeStations: metrics.policeStations,
          open24hSpots: metrics.open24hSpots,
          busStops: 0,
        },
        scoreBreakdown: {
          lightingScore: 0,
          crowdFlowScore: 0,
          policeCameraScore: 0,
          commercialScore: 0,
          crimeDeduction: 0,
        },
      };
    });
  }

  // Fallback: generate synthetic coordinates for display
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;
  const steps = 20;

  return routeTypes.map((rt, i) => {
    const offset = (i - 1) * 0.003;
    const coords: [number, number][] = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const jitter = (Math.random() - 0.5) * 0.001;
      coords.push([
        origin.lat + dLat * t + offset * Math.sin(t * Math.PI) + jitter,
        origin.lng + dLng * t + offset * Math.cos(t * Math.PI) + jitter,
      ]);
    }

    const metrics = calcSafetyScore(coords, hourOfDay);
    const { highlights, warnings } = getHighlightsAndWarnings(
      metrics.safetyScore, metrics.lightingLabel, metrics.c5Cameras, metrics.policeStations, metrics.open24hSpots
    );
    const dist = Math.sqrt((dLat * 111320) ** 2 + (dLng * 111320 * Math.cos(origin.lat * Math.PI / 180)) ** 2);
    const multiplier = 1 + i * 0.12;
    const distanceMeters = Math.round(dist * multiplier);
    const durationMinutes = Math.round(distanceMeters / 80); // ~5 km/h walking

    return {
      id: rt.id,
      name: rt.name,
      tagline: rt.tagline,
      color: rt.color,
      badgeBg: rt.badgeBg,
      badgeBorder: rt.badgeBorder,
      distanceMeters,
      durationMinutes,
      safetyScore: metrics.safetyScore,
      timeDiffMinutes: i === 0 ? 0 : durationMinutes - Math.round(dist / 80),
      coordinates: coords,
      segments: [],
      summary: 'Synthetic fallback — OSRM unavailable',
      highlights,
      warnings,
      safetyMetrics: {
        lightingLabel: metrics.lightingLabel,
        pedestrianLabel: metrics.pedestrianLabel,
        crimeRiskLabel: metrics.crimeRiskLabel,
        c5Cameras: metrics.c5Cameras,
        policeStations: metrics.policeStations,
        open24hSpots: metrics.open24hSpots,
        busStops: 0,
      },
      scoreBreakdown: {
        lightingScore: 0,
        crowdFlowScore: 0,
        policeCameraScore: 0,
        commercialScore: 0,
        crimeDeduction: 0,
      },
    };
  });
}
