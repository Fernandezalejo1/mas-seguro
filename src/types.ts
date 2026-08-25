export type RouteType = 'fastest' | 'balanced' | 'safest';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPoint extends Coordinates {
  id: string;
  name: string;
  address?: string;
  neighborhood: string;
  category?: 'landmark' | 'university' | 'hospital' | 'shopping' | 'terminal' | 'square' | 'custom';
}

export interface RouteSegment {
  streetName: string;
  lengthMeters: number;
  coordinates: [number, number][];
  safetyScore: number; // 0-100
  lighting: 'Alta' | 'Media' | 'Baja';
  pedestrianTraffic: 'Alto' | 'Medio' | 'Bajo';
  c5CamerasCount: number;
  open24hCount: number;
  policeNear: boolean;
  warnings?: string[];
  recommendation?: string;
}

export interface RouteOption {
  id: RouteType;
  name: string;
  tagline: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  distanceMeters: number;
  durationMinutes: number;
  safetyScore: number; // 0-100
  timeDiffMinutes: number; // +X min vs fastest
  coordinates: [number, number][];
  segments: RouteSegment[];
  summary: string;
  highlights: string[];
  warnings: string[];
  safetyMetrics: {
    lightingLabel: 'Alta' | 'Media' | 'Baja';
    pedestrianLabel: 'Alto' | 'Medio' | 'Bajo';
    crimeRiskLabel: 'Muy bajo' | 'Bajo' | 'Medio' | 'Elevado';
    c5Cameras: number;
    policeStations: number;
    open24hSpots: number;
    busStops: number;
  };
  scoreBreakdown: {
    lightingScore: number; // 0-25
    crowdFlowScore: number; // 0-25
    policeCameraScore: number; // 0-25
    commercialScore: number; // 0-15
    crimeDeduction: number; // subtracted 0-20
  };
}

export interface RealRouteAlt {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  streetNames: string[];
}

export type WeatherCondition = 'Despejado' | 'Lluvia' | 'Tormenta' | 'Niebla';

export type POIType = 'police_station' | 'c5_camera' | 'commercial_24h' | 'stm_bus_stop' | 'safe_haven' | 'crime_hotspot' | 'imm_lighting_node';

export interface PoliceSeccional {
  id: string;
  number: number;
  name: string;
  neighborhoods: string[];
  address: string;
  phone: string;
  lat: number;
  lng: number;
  padoCoverage: 'Muy Alta' | 'Alta' | 'Media';
  c5CamerasCount: number;
  monthlyCrimesReported: number; // Official SGSP average
  specializedUnit?: string;
}

export interface CrimeHeatPoint {
  id: string;
  lat: number;
  lng: number;
  neighborhood: string;
  corner: string;
  crimeType: 'Hurto a peatón' | 'Rapiña' | 'Arrebato' | 'Intento de hurto' | 'Zona despejada / Patrullada';
  severity: 'Baja' | 'Media' | 'Alta';
  timeBracket: 'Nocturno (22h-06h)' | 'Vespertino (18h-22h)' | 'Diurno (06h-18h)';
  source: 'Observatorio Nacional Min. Interior' | 'SGSP Uruguay';
  year: number;
  description: string;
}

export interface IMMInfrastructureNode {
  id: string;
  type: 'led_cluster' | 'stm_shelter_camera' | 'safe_corridor';
  name: string;
  lat: number;
  lng: number;
  neighborhood: string;
  description: string;
  immDataset: 'Plan Montevideo Se Ilumina (IMM)' | 'STM Transporte Seguro';
  lumensOrPower?: string;
  installationYear: number;
}

export interface MapPOI {
  id: string;
  name: string;
  type: POIType;
  lat: number;
  lng: number;
  neighborhood: string;
  address: string;
  details: string;
  isOpen24h?: boolean;
}

export type ReportCategory = 
  | 'dark_street' 
  | 'unsafe_feeling' 
  | 'crowded_safe' 
  | 'police_presence' 
  | 'suspicious_activity' 
  | 'street_cut';

export interface CommunityReport {
  id: string;
  category: ReportCategory;
  categoryLabel: string;
  lat: number;
  lng: number;
  streetName: string;
  neighborhood: string;
  description: string;
  timestamp: string;
  upvotes: number;
  iconType: string;
}

export interface CompanionState {
  isActive: boolean;
  currentSegmentIndex: number;
  progressPercent: number;
  currentLocation: Coordinates;
  isOffRoute: boolean;
  batteryLevel: number;
  checkInStatus: 'idle' | 'prompted' | 'safe' | 'alert_sent';
  sosTriggered: boolean;
  contactNotified: string;
  simulatedTimeRemaining: number;
}

export interface AISafetyAnalysis {
  verdict: string;
  recommendedRouteId: RouteType;
  keyRecommendation: string;
  reasons: string[];
  nighttimeAdvice: string;
  weatherFactor: string;
  hotspotsToAvoid: string[];
  rawAnalysisText?: string;
}

export interface SafetyScoreFormulaWeights {
  lightingWeight: number; // Default: 25%
  pedestrianWeight: number; // Default: 25%
  policeCameraWeight: number; // Default: 25%
  commercialWeight: number; // Default: 15%
  crimeDataPenaltyWeight: number; // Default: 10%
  timeModifier: number; // 1.0 day, 1.4 night sensitivity
}
