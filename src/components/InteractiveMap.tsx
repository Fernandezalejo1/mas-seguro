import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationPoint, RouteOption, MapPOI, CommunityReport, RouteType, Coordinates } from '../types';
import { 
  MONTEVIDEO_CENTER, 
  MONTEVIDEO_POIS, 
  MONTEVIDEO_SECCIONALES, 
  MONTEVIDEO_CRIME_HEAT_DATA, 
  MONTEVIDEO_IMM_NODES 
} from '../data/montevideoData';
import { 
  Camera, 
  Shield, 
  Store, 
  AlertTriangle, 
  Layers, 
  Eye, 
  EyeOff, 
  CloudRain, 
  CloudFog, 
  Zap, 
  Sun, 
  Radio, 
  Lightbulb, 
  Flame, 
  Sparkles,
  Info
} from 'lucide-react';

interface InteractiveMapProps {
  origin: LocationPoint;
  destination: LocationPoint;
  routes: RouteOption[];
  selectedRouteId: RouteType;
  setSelectedRouteId: (id: RouteType) => void;
  communityReports: CommunityReport[];
  weather?: string;
  userSimulatedLocation?: Coordinates;
  isCompanionActive?: boolean;
  onMapClickSetLocation?: (coords: Coordinates) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  setSelectedRouteId,
  communityReports,
  weather = 'Despejado',
  userSimulatedLocation,
  isCompanionActive,
  onMapClickSetLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    routes: L.LayerGroup;
    markers: L.LayerGroup;
    cameras: L.LayerGroup;
    police: L.LayerGroup;
    commercial: L.LayerGroup;
    reports: L.LayerGroup;
    crimeHeat: L.LayerGroup;
    immLighting: L.LayerGroup;
    userLocation: L.LayerGroup;
  } | null>(null);

  // Layer toggles
  const [showCameras, setShowCameras] = useState(true);
  const [showPolice, setShowPolice] = useState(true);
  const [showCommercial, setShowCommercial] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showCrimeHeat, setShowCrimeHeat] = useState(true);
  const [showImmLighting, setShowImmLighting] = useState(true);

  // Weather state helpers
  const isRain = weather === 'Lluvia' || weather === 'Tormenta';
  const isStorm = weather === 'Tormenta';
  const isFog = weather === 'Niebla';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [MONTEVIDEO_CENTER.lat, MONTEVIDEO_CENTER.lng],
      zoom: MONTEVIDEO_CENTER.zoom,
      zoomControl: true,
      attributionControl: false
    });

    // High quality Voyager base map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // Initialize layer groups
    const routesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const camerasGroup = L.layerGroup().addTo(map);
    const policeGroup = L.layerGroup().addTo(map);
    const commercialGroup = L.layerGroup().addTo(map);
    const reportsGroup = L.layerGroup().addTo(map);
    const crimeHeatGroup = L.layerGroup().addTo(map);
    const immLightingGroup = L.layerGroup().addTo(map);
    const userLocationGroup = L.layerGroup().addTo(map);

    layerGroupsRef.current = {
      routes: routesGroup,
      markers: markersGroup,
      cameras: camerasGroup,
      police: policeGroup,
      commercial: commercialGroup,
      reports: reportsGroup,
      crimeHeat: crimeHeatGroup,
      immLighting: immLightingGroup,
      userLocation: userLocationGroup
    };

    mapInstanceRef.current = map;

    // Handle click
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickSetLocation) {
        onMapClickSetLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update POIs (Cameras, Police Seccionales, 24h Shops, IMM Nodes, Real Crime Heat Data)
  useEffect(() => {
    if (!layerGroupsRef.current) return;
    const { cameras, police, commercial, crimeHeat, immLighting } = layerGroupsRef.current;

    cameras.clearLayers();
    police.clearLayers();
    commercial.clearLayers();
    crimeHeat.clearLayers();
    immLighting.clearLayers();

    // 1. C5 CAMERAS (Ministerio del Interior CCU)
    if (showCameras) {
      MONTEVIDEO_POIS.filter(p => p.type === 'c5_camera').forEach(poi => {
        // In bad weather, cameras have an active laser beacon pulse
        const pulseEffect = (isRain || isFog)
          ? `<div style="position: absolute; top: -6px; left: -6px; width: 36px; height: 36px; border-radius: 9999px; border: 2px solid #38bdf8; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.7;"></div>`
          : '';

        const cameraIcon = L.divIcon({
          className: 'custom-poi-cam',
          html: `<div style="position: relative;">
            ${pulseEffect}
            <div style="background: #2563eb; color: white; border-radius: 9999px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(37,99,235,0.6);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([poi.lat, poi.lng], { icon: cameraIcon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="background: #1e3a8a; color: #93c5fd; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">CÁMARA C5 MIN. INTERIOR</span>
              ${isRain || isFog ? '<span style="background: #0284c7; color: #e0f2fe; font-size: 9px; font-weight: bold; padding: 2px 4px; border-radius: 4px;">VISIÓN NOCTURNA / IR</span>' : ''}
            </div>
            <h4 style="font-weight: bold; font-size: 13px; margin: 0 0 2px 0; color: #0f172a;">${poi.name}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">${poi.address}, ${poi.neighborhood}</p>
            <p style="font-size: 11px; color: #334155; margin: 0;">${poi.details}</p>
          </div>
        `);
        cameras.addLayer(marker);
      });
    }

    // 2. POLICE SECCIONALES & HUBS
    if (showPolice) {
      MONTEVIDEO_SECCIONALES.forEach(sec => {
        const beaconPulse = (isRain || isFog || isStorm)
          ? `<div style="position: absolute; top: -8px; left: -8px; width: 44px; height: 44px; border-radius: 9999px; background: rgba(79,70,229,0.25); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : '';

        const policeIcon = L.divIcon({
          className: 'custom-poi-pol',
          html: `<div style="position: relative;">
            ${beaconPulse}
            <div style="background: #4338ca; color: white; border-radius: 9999px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2.5px solid #c7d2fe; box-shadow: 0 4px 12px rgba(67,56,202,0.6);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([sec.lat, sec.lng], { icon: policeIcon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <span style="background: #312e81; color: #e0e7ff; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">JEFATURA DE POLICÍA DE MONTEVIDEO</span>
            <h4 style="font-weight: bold; font-size: 14px; margin: 4px 0 2px 0; color: #0f172a;">${sec.name}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">${sec.address} • Tel: <b style="color: #4338ca;">${sec.phone}</b></p>
            <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0;">Jurisdicción: <b>${sec.neighborhoods.join(', ')}</b></p>
            <div style="display: flex; gap: 4px; font-size: 10px; margin-bottom: 6px;">
              <span style="background: #ecfdf5; color: #047857; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #a7f3d0;">Patrullaje PADO: ${sec.padoCoverage}</span>
              <span style="background: #eff6ff; color: #1d4ed8; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #bfdbfe;">${sec.c5CamerasCount} Cámaras</span>
            </div>
            <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 10px; color: #0284c7; font-weight: 600;">Emergencias: 911 / CCU</div>
          </div>
        `);
        police.addLayer(marker);
      });
    }

    // 3. COMMERCIAL 24H & SAFE HAVENS (Farmacias, Ancap, Hospitales)
    if (showCommercial) {
      MONTEVIDEO_POIS.filter(p => p.type === 'commercial_24h' || p.type === 'safe_haven').forEach(poi => {
        const isHospital = poi.type === 'safe_haven';
        const bgColor = isHospital ? '#0284c7' : '#059669';
        const borderColor = isHospital ? '#7dd3fc' : '#6ee7b7';

        // Glowing Beacon in rainy/foggy conditions
        const beaconGlow = (isRain || isFog)
          ? `<div style="position: absolute; top: -6px; left: -6px; width: 36px; height: 36px; border-radius: 9999px; border: 2px solid ${borderColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6;"></div>`
          : '';

        const storeIcon = L.divIcon({
          className: 'custom-poi-store',
          html: `<div style="position: relative;">
            ${beaconGlow}
            <div style="background: ${bgColor}; color: white; border-radius: 9999px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid ${borderColor}; box-shadow: 0 4px 8px rgba(0,0,0,0.35);">
              ${isHospital 
                ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 6v12m-6-6h12"/></svg>'
                : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>'
              }
            </div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([poi.lat, poi.lng], { icon: storeIcon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <span style="background: ${isHospital ? '#0369a1' : '#065f46'}; color: #ffffff; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
              ${isHospital ? 'HOSPITAL PÚBLICO 24H' : 'REFUGIO & PUNTO SEGURO 24H'}
            </span>
            <h4 style="font-weight: bold; font-size: 13px; margin: 4px 0 2px 0; color: #0f172a;">${poi.name}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">${poi.address} • ${poi.neighborhood}</p>
            <p style="font-size: 11px; color: #334155; margin: 0 0 4px 0;">${poi.details}</p>
            ${isRain ? '<div style="background: #eff6ff; color: #1e40af; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">☔ Refugio con marquesina e iluminación continua en lluvia</div>' : ''}
          </div>
        `);
        commercial.addLayer(marker);
      });
    }

    // 4. REAL MONTEVIDEO CRIME HEAT DATA (Observatorio Min. Interior SGSP)
    if (showCrimeHeat) {
      MONTEVIDEO_CRIME_HEAT_DATA.forEach(crm => {
        const isSafePatrolled = crm.crimeType === 'Zona despejada / Patrullada';
        const color = isSafePatrolled ? '#10b981' : crm.severity === 'Alta' ? '#dc2626' : '#f59e0b';
        
        // Intensity circle based on weather & severity
        const circleRadius = isRain || isFog ? 45 : 35;
        const circle = L.circle([crm.lat, crm.lng], {
          radius: circleRadius,
          color: color,
          fillColor: color,
          fillOpacity: isSafePatrolled ? 0.15 : (isRain ? 0.35 : 0.25),
          weight: isRain || isFog ? 2 : 1.5,
          dashArray: isSafePatrolled ? undefined : '3, 4'
        });

        circle.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="background: ${isSafePatrolled ? '#065f46' : '#991b1b'}; color: white; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
                ${crm.source}
              </span>
              <span style="font-size: 9px; color: #64748b; font-weight: bold;">Año ${crm.year}</span>
            </div>
            <h4 style="font-weight: bold; font-size: 13px; margin: 0 0 2px 0; color: #0f172a;">${crm.corner}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">${crm.neighborhood} • Franja: <b>${crm.timeBracket}</b></p>
            <p style="font-size: 11px; color: #334155; margin: 0 0 4px 0;"><b>Tipo de registro:</b> ${crm.crimeType} (Riesgo: ${crm.severity})</p>
            <p style="font-size: 10.5px; color: #475569; margin: 0;">${crm.description}</p>
          </div>
        `);
        crimeHeat.addLayer(circle);
      });
    }

    // 5. IMM OPEN DATA INFRASTRUCTURE (Plan Montevideo Se Ilumina & Paradas Seguras STM)
    if (showImmLighting) {
      MONTEVIDEO_IMM_NODES.forEach(imm => {
        const isCorridor = imm.type === 'safe_corridor';
        const isShelter = imm.type === 'stm_shelter_camera';

        const nodeIcon = L.divIcon({
          className: 'custom-imm-node',
          html: `<div style="background: #0891b2; color: white; border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border: 2px solid #a5f3fc; box-shadow: 0 0 10px rgba(8,145,178,0.7);">
            ${isShelter 
              ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15h10"/><path d="M7 9h10"/></svg>'
              : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/></svg>'
            }
          </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([imm.lat, imm.lng], { icon: nodeIcon });
        marker.bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <span style="background: #155e75; color: #cffafe; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
              ${imm.immDataset}
            </span>
            <h4 style="font-weight: bold; font-size: 13px; margin: 4px 0 2px 0; color: #0f172a;">${imm.name}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">${imm.neighborhood} • Instalación: ${imm.installationYear}</p>
            <p style="font-size: 11px; color: #334155; margin: 0 0 4px 0;">${imm.description}</p>
            ${imm.lumensOrPower ? `<div style="font-size: 10px; color: #0891b2; font-weight: bold;">💡 Potencia LED: ${imm.lumensOrPower}</div>` : ''}
          </div>
        `);
        immLighting.addLayer(marker);
      });
    }

  }, [showCameras, showPolice, showCommercial, showCrimeHeat, showImmLighting, weather, isRain, isFog, isStorm]);

  // Update Community Reports Layer
  useEffect(() => {
    if (!layerGroupsRef.current) return;
    const { reports } = layerGroupsRef.current;
    reports.clearLayers();

    if (!showReports) return;

    communityReports.forEach(rep => {
      const isNegative = rep.category === 'dark_street' || rep.category === 'unsafe_feeling' || rep.category === 'suspicious_activity';
      const bgColor = isNegative ? '#e11d48' : '#0284c7';
      const borderColor = isNegative ? '#fda4af' : '#7dd3fc';

      // In adverse weather, warning reports get an extra bright pulsating aura
      const alertHalo = (isNegative && (isRain || isFog))
        ? `<div style="position: absolute; top: -6px; left: -6px; width: 38px; height: 38px; border-radius: 9999px; border: 2px solid #f43f5e; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.8;"></div>`
        : '';

      const reportIcon = L.divIcon({
        className: 'custom-report-icon',
        html: `<div style="position: relative;">
          ${alertHalo}
          <div style="background: ${bgColor}; color: white; border-radius: 9999px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 2px solid ${borderColor}; box-shadow: 0 4px 8px rgba(0,0,0,0.5);">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([rep.lat, rep.lng], { icon: reportIcon });
      marker.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif;">
          <span style="background: ${isNegative ? '#881337' : '#0c4a6e'}; color: ${isNegative ? '#fecdd3' : '#bae6fd'}; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
            ${rep.categoryLabel.toUpperCase()}
          </span>
          <h4 style="font-weight: bold; font-size: 13px; margin: 4px 0 2px 0; color: #0f172a;">${rep.streetName}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">${rep.neighborhood} • ${rep.timestamp}</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0;">${rep.description}</p>
          <div style="font-size: 10px; color: #64748b;">👍 ${rep.upvotes} vecinos confirmaron este reporte</div>
        </div>
      `);
      reports.addLayer(marker);
    });
  }, [communityReports, showReports, weather, isRain, isFog]);

  // Update Routes and Waypoints with Weather-Aware Styling
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current) return;
    const { routes: routesLayer, markers: markersLayer } = layerGroupsRef.current;

    routesLayer.clearLayers();
    markersLayer.clearLayers();

    // Render Origin Marker A
    const originIcon = L.divIcon({
      className: 'custom-origin-icon',
      html: `<div style="position: relative;">
        <div style="background: #10b981; color: white; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 0 15px rgba(16,185,129,0.8);">
          <span style="font-size: 13px;">A</span>
        </div>
        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 4px; height: 8px; background: #10b981;"></div>
      </div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 36]
    });

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon });
    originMarker.bindPopup(`<b>Origen:</b> ${origin.name}<br/><span style="font-size: 11px; color: #64748b;">${origin.address || origin.neighborhood}</span>`);
    markersLayer.addLayer(originMarker);

    // Render Destination Marker B
    const destIcon = L.divIcon({
      className: 'custom-dest-icon',
      html: `<div style="position: relative;">
        <div style="background: #ef4444; color: white; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 0 15px rgba(239,68,68,0.8);">
          <span style="font-size: 13px;">B</span>
        </div>
        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 4px; height: 8px; background: #ef4444;"></div>
      </div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 36]
    });

    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon });
    destMarker.bindPopup(`<b>Destino:</b> ${destination.name}<br/><span style="font-size: 11px; color: #64748b;">${destination.address || destination.neighborhood}</span>`);
    markersLayer.addLayer(destMarker);

    // Render Route Polylines dynamically styled by Weather & Route Type
    routes.forEach(route => {
      const isSelected = route.id === selectedRouteId;
      const isSafest = route.id === 'safest';
      const isFastest = route.id === 'fastest';
      
      let routeColor = isSafest ? '#2563eb' : route.id === 'balanced' ? '#f59e0b' : '#10b981';

      // Dynamic Weather Route adjustments:
      // In rain/fog:
      // - Safest route gets laser-beam intensity and wide fluorescent halo
      // - Fastest route (dark shortcuts) gets lower intensity, cautionary dash patterns
      let polylineWeight = isSelected ? 6 : 4;
      let polylineOpacity = isSelected ? 1.0 : 0.45;
      let glowWeight = 12;
      let glowOpacity = 0.35;
      let dashArray = isSelected ? undefined : '5, 8';

      if (isRain || isStorm) {
        if (isSafest) {
          routeColor = '#2563eb';
          glowWeight = isSelected ? 16 : 10;
          glowOpacity = isSelected ? 0.6 : 0.3;
          polylineWeight = isSelected ? 7 : 4.5;
        } else if (isFastest) {
          // Dim unsafe route when raining
          routeColor = '#059669';
          polylineOpacity = isSelected ? 0.8 : 0.25;
          dashArray = isSelected ? '8, 4' : '4, 8';
        }
      } else if (isFog) {
        if (isSafest) {
          glowWeight = isSelected ? 18 : 12;
          glowOpacity = isSelected ? 0.65 : 0.35;
        } else if (isFastest) {
          polylineOpacity = isSelected ? 0.75 : 0.25;
        }
      }

      // Background glowing polyline for high contrast
      if (isSelected || (isSafest && (isRain || isFog))) {
        const glowLine = L.polyline(route.coordinates, {
          color: routeColor,
          weight: glowWeight,
          opacity: glowOpacity,
          lineCap: 'round',
          lineJoin: 'round'
        });
        routesLayer.addLayer(glowLine);
      }

      // Foreground sharp polyline
      const polyline = L.polyline(route.coordinates, {
        color: routeColor,
        weight: polylineWeight,
        opacity: polylineOpacity,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('click', () => {
        setSelectedRouteId(route.id);
      });

      polyline.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; padding: 2px;">
          ${route.name} • Safety: ${route.safetyScore}/100 (${route.durationMinutes} min)
          ${isRain ? '<br/><span style="font-size: 10px; color: #0284c7;">🌧️ Ajustado por lluvia y visibilidad</span>' : ''}
        </div>
      `, { sticky: true });

      routesLayer.addLayer(polyline);
    });

    // Fit map bounds to encompass origin & destination
    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });

  }, [origin, destination, routes, selectedRouteId, weather, isRain, isFog, isStorm]);

  // Update Companion user GPS marker simulation
  useEffect(() => {
    if (!layerGroupsRef.current) return;
    const { userLocation } = layerGroupsRef.current;
    userLocation.clearLayers();

    if (isCompanionActive && userSimulatedLocation) {
      const userGpsIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `<div style="position: relative;">
          <div style="width: 20px; height: 20px; background: #3b82f6; border-radius: 9999px; border: 3px solid white; box-shadow: 0 0 20px #3b82f6;"></div>
          <div style="position: absolute; top: -10px; left: -10px; width: 40px; height: 40px; border-radius: 9999px; background: rgba(59,130,246,0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const userMarker = L.marker([userSimulatedLocation.lat, userSimulatedLocation.lng], { icon: userGpsIcon });
      userLocation.addLayer(userMarker);
    }
  }, [isCompanionActive, userSimulatedLocation]);

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[680px] rounded-3xl overflow-hidden border border-white/80 shadow-lg bg-slate-100">
      
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full transition-all duration-700 ${
          isRain ? 'brightness-[0.92] contrast-[1.08] saturate-[1.1]' : isFog ? 'brightness-[1.02] contrast-[0.92]' : ''
        }`} 
        style={{ height: '100%', minHeight: '500px' }} 
      />

      {/* Atmospheric Weather Overlay Visuals */}
      {isRain && (
        <div className="pointer-events-none absolute inset-0 z-[500] bg-gradient-to-b from-blue-900/10 via-transparent to-slate-900/20 mix-blend-multiply overflow-hidden">
          {/* Subtle animated rain streaks */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
        </div>
      )}

      {isFog && (
        <div className="pointer-events-none absolute inset-0 z-[500] bg-slate-200/20 backdrop-blur-[0.5px] mix-blend-screen" />
      )}

      {/* Weather Dynamic Navigation Alert Bar (Top Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 max-w-[280px] sm:max-w-xs">
        {/* Weather Indicator Card */}
        <div className="glass-panel p-2.5 rounded-2xl border border-white/90 shadow-md text-xs backdrop-blur-xl flex items-center gap-2.5">
          <div className={`p-2 rounded-xl text-white ${
            isStorm ? 'bg-indigo-600' : isRain ? 'bg-blue-600' : isFog ? 'bg-slate-600' : 'bg-amber-500'
          }`}>
            {isStorm ? <Zap className="w-4 h-4" /> : isRain ? <CloudRain className="w-4 h-4" /> : isFog ? <CloudFog className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-xs">Clima: {weather}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                isRain || isFog ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isRain ? 'Visibilidad 60%' : isFog ? 'Visibilidad 45%' : 'Visibilidad 100%'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
              {isRain 
                ? 'Ruta Más Segura intensificada con corredor lumínico LED y refugios STM.'
                : isFog
                ? 'Faros de seguridad C5 y comercios 24h destacados para navegación segura.'
                : 'Condiciones óptimas de tránsito peatonal en Montevideo.'
              }
            </p>
          </div>
        </div>

        {/* Real Open Data Citation Badge */}
        <div className="glass-panel-subtle px-2.5 py-1 rounded-xl border border-white/80 text-[10px] text-slate-600 font-semibold flex items-center gap-1.5 shadow-2xs backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-cyan-600" />
          <span>Datos Min. Interior SGSP & IMM Open Data</span>
        </div>
      </div>

      {/* Map Floating Layer Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 glass-panel p-2.5 rounded-2xl border border-white/90 shadow-md text-xs text-slate-800 backdrop-blur-xl max-h-[90%] overflow-y-auto">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 px-1 pb-1 border-b border-slate-200/80">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Capas y Datos Reales</span>
        </div>

        {/* Toggle Police Seccionales */}
        <button
          onClick={() => setShowPolice(!showPolice)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            showPolice ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs' : 'text-slate-600 hover:bg-white/80'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600" /> Seccionales (1ª-15ª)
          </span>
          {showPolice ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Toggle Cameras */}
        <button
          onClick={() => setShowCameras(!showCameras)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            showCameras ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs' : 'text-slate-600 hover:bg-white/80'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-blue-600" /> Cámaras C5 CCU
          </span>
          {showCameras ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Toggle Real Crime Heat Data */}
        <button
          onClick={() => setShowCrimeHeat(!showCrimeHeat)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            showCrimeHeat ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-2xs' : 'text-slate-600 hover:bg-white/80'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-600" /> Delitos SGSP (Oficial)
          </span>
          {showCrimeHeat ? <Eye className="w-3.5 h-3.5 text-rose-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Toggle IMM LED & Safe Corridors */}
        <button
          onClick={() => setShowImmLighting(!showImmLighting)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            showImmLighting ? 'bg-cyan-50 text-cyan-800 font-bold border border-cyan-200 shadow-2xs' : 'text-slate-600 hover:bg-white/80'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-cyan-600" /> IMM LED & Paradas STM
          </span>
          {showImmLighting ? <Eye className="w-3.5 h-3.5 text-cyan-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Toggle Commercial 24h */}
        <button
          onClick={() => setShowCommercial(!showCommercial)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            showCommercial ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-2xs' : 'text-slate-600 hover:bg-white/80'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-600" /> Puntos 24h / Farmacias
          </span>
          {showCommercial ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Toggle Reports */}
        <button
          onClick={() => setShowReports(!showReports)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            showReports ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs' : 'text-slate-600 hover:bg-white/80'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Reportes Vecinales
          </span>
          {showReports ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Floating Route Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3.5 glass-panel py-2 px-3.5 rounded-2xl border border-white/90 text-[11px] text-slate-700 shadow-md backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 bg-blue-600 rounded-full shadow-xs" />
          <span className="font-bold text-blue-700">Más Segura (+4 min)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 bg-amber-500 rounded-full shadow-xs" />
          <span className="font-bold text-amber-700">Equilibrada (+2 min)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 bg-emerald-600 rounded-full shadow-xs" />
          <span className="font-bold text-emerald-700">Más Rápida (Directa)</span>
        </div>
      </div>

    </div>
  );
};
