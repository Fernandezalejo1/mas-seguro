import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint, RouteOption, RouteType } from '../types';
import { MONTEVIDEO_PRESETS } from '../data/montevideoData';
import { useGeolocation } from '../utils/useGeolocation';
import { 
  Shield, 
  Clock, 
  Navigation, 
  ArrowUpDown, 
  Lightbulb, 
  Users, 
  Camera, 
  Store, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Radio,
  LocateFixed,
  Search,
  MapPin,
  Loader2,
  X
} from 'lucide-react';

interface RouteSearchPanelProps {
  origin: LocationPoint;
  destination: LocationPoint;
  setOrigin: (point: LocationPoint) => void;
  setDestination: (point: LocationPoint) => void;
  routes: RouteOption[];
  selectedRouteId: RouteType;
  setSelectedRouteId: (id: RouteType) => void;
  hourOfDay: number;
  onStartCompanion: (route: RouteOption) => void;

  isRoutingLoading?: boolean;
  hasRealRoutes?: boolean;
}

export const RouteSearchPanel: React.FC<RouteSearchPanelProps> = ({
  origin,
  destination,
  setOrigin,
  setDestination,
  routes,
  selectedRouteId,
  setSelectedRouteId,
  hourOfDay,
  onStartCompanion,
  onAnalyzeWithAI,
  isAILoading,
  isRoutingLoading = false,
  hasRealRoutes = false
}) => {
  const [expandedRouteId, setExpandedRouteId] = useState<RouteType | null>(selectedRouteId);
  const [searchMode, setSearchMode] = useState<'presets' | 'custom'>('presets');
  
  // Custom Address search states
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originResults, setOriginResults] = useState<LocationPoint[]>([]);
  const [destResults, setDestResults] = useState<LocationPoint[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const { getCurrentPosition } = useGeolocation();

  // Search debounce for origin
  useEffect(() => {
    if (!originQuery || originQuery.length < 2) {
      setOriginResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingOrigin(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(originQuery)}`);
        const data = await res.json();
        setOriginResults(data.results || []);
      } catch (err) {
        console.warn('Origin search error:', err);
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [originQuery]);

  // Search debounce for destination
  useEffect(() => {
    if (!destQuery || destQuery.length < 2) {
      setDestResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(destQuery)}`);
        const data = await res.json();
        setDestResults(data.results || []);
      } catch (err) {
        console.warn('Dest search error:', err);
      } finally {
        setIsSearchingDest(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [destQuery]);

  // Handle Real GPS Location
  const handleUseRealGps = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const coords = await getCurrentPosition();
      // Reverse geocode to get street name in Montevideo
      const res = await fetch(`/api/reverse-geocode?lat=${coords.lat}&lng=${coords.lng}`);
      const info = await res.json();

      const userGpsPoint: LocationPoint = {
        id: 'user_gps_current',
        name: `📍 Mi ubicación (${info.name || 'Montevideo'})`,
        address: info.address || 'Ubicación actual GPS',
        neighborhood: info.neighborhood || 'Montevideo',
        lat: coords.lat,
        lng: coords.lng,
        category: 'custom'
      };

      setOrigin(userGpsPoint);
    } catch (err: any) {
      setGpsError(err.message || 'No se pudo obtener el GPS');
      // If error or running in iframe test environment, default to Plaza Independencia
      setTimeout(() => setGpsError(null), 4000);
    } finally {
      setIsGpsLoading(false);
    }
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 70) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-lg border border-white/80 flex flex-col gap-4 text-slate-800 backdrop-blur-xl">
      
      {/* Search Mode Tabs & GPS Quick Button */}
      <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/90 flex flex-col gap-3 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Navigation className="w-3.5 h-3.5" />
            <span className="font-extrabold text-slate-900">Puntos de Trayecto</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchMode(searchMode === 'presets' ? 'custom' : 'presets')}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 transition-all cursor-pointer"
            >
              {searchMode === 'presets' ? '🔍 Buscar cualquier esquina' : '⭐ Ver lugares clave'}
            </button>

            <button
              onClick={swapLocations}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-all py-1 px-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200 shadow-2xs text-xs font-semibold cursor-pointer"
              title="Invertir origen y destino"
            >
              <ArrowUpDown className="w-3 h-3 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Real GPS button */}
        <button
          onClick={handleUseRealGps}
          disabled={isGpsLoading}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 hover:from-emerald-500/25 text-emerald-800 border border-emerald-300/80 font-bold text-xs shadow-2xs transition-all cursor-pointer"
        >
          {isGpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{isGpsLoading ? 'Obteniendo GPS real...' : '📍 Usar mi ubicación GPS actual'}</span>
        </button>

        {gpsError && (
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* PRESET MODE SELECTORS */}
        {searchMode === 'presets' ? (
          <div className="flex flex-col gap-2">
            {/* Origin */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
              <select
                value={origin.id}
                onChange={(e) => {
                  const found = MONTEVIDEO_PRESETS.find(p => p.id === e.target.value);
                  if (found) setOrigin(found);
                }}
                className="w-full bg-white/95 text-xs font-bold text-slate-800 py-2.5 px-3 rounded-xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {origin.id === 'user_gps_current' && (
                  <option value="user_gps_current">{origin.name}</option>
                )}
                {MONTEVIDEO_PRESETS.map((preset) => (
                  <option key={`orig_${preset.id}`} value={preset.id} disabled={preset.id === destination.id}>
                    {preset.name} ({preset.neighborhood})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shrink-0" />
              <select
                value={destination.id}
                onChange={(e) => {
                  const found = MONTEVIDEO_PRESETS.find(p => p.id === e.target.value);
                  if (found) setDestination(found);
                }}
                className="w-full bg-white/95 text-xs font-bold text-slate-800 py-2.5 px-3 rounded-xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {MONTEVIDEO_PRESETS.map((preset) => (
                  <option key={`dest_${preset.id}`} value={preset.id} disabled={preset.id === origin.id}>
                    {preset.name} ({preset.neighborhood})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* CUSTOM SEARCH INPUTS */
          <div className="flex flex-col gap-2.5">
            {/* Origin Search */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/95 rounded-xl border border-slate-200 px-3 py-1.5 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <input
                  type="text"
                  placeholder={origin.name || "Escribí calle y número, o esquina (ej: 18 de Julio 1234)"}
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
                />
                {isSearchingOrigin && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />}
                {originQuery && (
                  <button onClick={() => { setOriginQuery(''); setOriginResults([]); }} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Origin Search Dropdown */}
              {originResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto p-1 text-xs">
                  {originResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setOrigin(item);
                        setOriginQuery('');
                        setOriginResults([]);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center gap-2 text-slate-800"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.neighborhood}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Search */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/95 rounded-xl border border-slate-200 px-3 py-1.5 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <input
                  type="text"
                  placeholder={destination.name || "Escribí calle y número de destino (ej: Rivera 1234)"}
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
                />
                {isSearchingDest && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />}
                {destQuery && (
                  <button onClick={() => { setDestQuery(''); setDestResults([]); }} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Destination Search Dropdown */}
              {destResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto p-1 text-xs">
                  {destResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setDestination(item);
                        setDestQuery('');
                        setDestResults([]);
                      }}
                      className="p-2 hover:bg-rose-50 rounded-lg cursor-pointer flex items-center gap-2 text-slate-800"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.neighborhood}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Active Selection Summary */}
        <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/80">
          <span className="text-slate-600 font-medium truncate max-w-[45%]">
            🟢 <b>{origin.name}</b>
          </span>
          <span className="text-slate-400">➔</span>
          <span className="text-slate-600 font-medium truncate max-w-[45%]">
            🔴 <b>{destination.name}</b>
          </span>
        </div>
      </div>

      {/* Routes Title and Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>Rutas Peatonales Comparadas</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {hourOfDay >= 22 || hourOfDay <= 5 ? 'Modo Nocturno 🌙' : 'Modo Diurno ☀️'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Calculado con datos en tiempo real de iluminación, cámaras C5 y seccionales policiales.
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 flex items-center gap-1 ${
          isRoutingLoading
            ? 'bg-slate-100 text-slate-500 border-slate-200'
            : hasRealRoutes
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {isRoutingLoading ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Calculando calles reales…</>
          ) : hasRealRoutes ? (
            <>🗺️ Calles reales (OSRM)</>
          ) : (
            <>~ Trazado estimado</>
          )}
        </span>
      </div>

      {/* Route Cards */}
      <div className="flex flex-col gap-3">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isExpanded = expandedRouteId === route.id;

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                isSelected
                  ? 'border-blue-500 bg-white shadow-md ring-2 ring-blue-500/20'
                  : 'border-white/80 bg-white/70 hover:bg-white shadow-2xs'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {route.name}
                        </span>
                        {route.id === 'safest' && (
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                            Recomendada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {route.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Safety Score Big Badge */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className={`px-2.5 py-1 rounded-xl border font-black text-sm flex items-center gap-1 shadow-2xs ${getScoreBadgeColor(route.safetyScore)}`}>
                      <Shield className="w-3.5 h-3.5" />
                      <span>{route.safetyScore}</span>
                      <span className="text-[10px] font-normal text-slate-500">/100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Safety Score
                    </span>
                  </div>
                </div>

                {/* Key Metrics Quick Row */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-medium">Tiempo</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {route.durationMinutes} min
                    </span>
                    {route.timeDiffMinutes > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 ml-1">
                        (+{route.timeDiffMinutes}m)
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-medium">Distancia</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {(route.distanceMeters / 1000).toFixed(2)} km
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-medium">Iluminación</span>
                    <span className={`font-bold text-xs ${
                      route.safetyMetrics.lightingLabel === 'Alta' ? 'text-emerald-700' :
                      route.safetyMetrics.lightingLabel === 'Media' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {route.safetyMetrics.lightingLabel}
                    </span>
                  </div>
                </div>

                {/* Toggle details */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedRouteId(isExpanded ? null : route.id);
                  }}
                  className="w-full mt-2.5 pt-1 flex items-center justify-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 gap-1 transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Ocultar desglose de seguridad</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Ver cámaras, comercios 24h y desglose</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Safety Details Breakdown */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 bg-slate-50/90 border-t border-slate-200/80 flex flex-col gap-3 text-xs">
                  {/* Indicators Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Cámaras C5</span>
                        <span className="font-bold text-slate-800">{route.safetyMetrics.c5Cameras} domos</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Locales 24h</span>
                        <span className="font-bold text-slate-800">{route.safetyMetrics.open24hSpots} abiertos</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Flujo Peatonal</span>
                        <span className="font-bold text-slate-800">{route.safetyMetrics.pedestrianLabel}</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Seccionales</span>
                        <span className="font-bold text-slate-800">{route.safetyMetrics.policeStations} en radio</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights and Warnings */}
                  <div className="flex flex-col gap-1.5">
                    {route.highlights.map((hl, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{hl}</span>
                      </div>
                    ))}
                    {route.warnings.map((wn, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight font-medium">{wn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons: Acompañame & AI Verdict */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <button
          onClick={() => onStartCompanion(selectedRoute)}
          className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>INICIAR MODO ACOMPAÑAME EN VIVO</span>
        </button>


      </div>

    </div>
  );
};
