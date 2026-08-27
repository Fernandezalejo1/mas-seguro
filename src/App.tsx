/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationPoint, RouteOption, RouteType, Coordinates, RealRouteAlt } from './types';
import { MONTEVIDEO_PRESETS, generateMontevideoRoutes } from './data/montevideoData';
import { fetchRealRoutes } from './utils/routingService';
import { Header } from './components/Header';
import { RouteSearchPanel } from './components/RouteSearchPanel';
import { InteractiveMap } from './components/InteractiveMap';
import { CompanionSOSModal } from './components/CompanionSOSModal';
import { UrbanMatrixDashboard } from './components/UrbanMatrixDashboard';
import { ArchitectureTechModal } from './components/ArchitectureTechModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'navigation' | 'companion' | 'matrix' | 'architecture'>('navigation');
  
  // Locations (Montevideo defaults: Plaza Independencia -> Tres Cruces)
  const [origin, setOrigin] = useState<LocationPoint>(MONTEVIDEO_PRESETS[0]);
  const [destination, setDestination] = useState<LocationPoint>(MONTEVIDEO_PRESETS[2]);
  
  // Environment simulation
  const [hourOfDay, setHourOfDay] = useState<number>(new Date().getHours());
  const [weather, setWeather] = useState<string>('Despejado');

  // Selected route
  const [selectedRouteId, setSelectedRouteId] = useState<RouteType>('safest');
  
  // Companion & GPS simulation
  const [isCompanionActive, setIsCompanionActive] = useState(false);
  const [userSimulatedLocation, setUserSimulatedLocation] = useState<Coordinates>({
    lat: origin.lat,
    lng: origin.lng
  });

  // Real pedestrian routes over actual Montevideo streets (free OSRM foot routing).
  // Empty array => generateMontevideoRoutes falls back to its synthetic heuristic paths.
  const [realRoutes, setRealRoutes] = useState<RealRouteAlt[]>([]);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsRoutingLoading(true);
    fetchRealRoutes(origin, destination).then(routes => {
      if (!cancelled) {
        setRealRoutes(routes);
        setIsRoutingLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [origin.id, origin.lat, origin.lng, destination.id, destination.lat, destination.lng]);

  // Fetch real Montevideo weather on start
  useEffect(() => {
    fetch('/api/weather/montevideo')
      .then(res => res.json())
      .then(data => {
        if (data && data.condition) {
          setWeather(data.condition);
        }
      })
      .catch(() => {});
  }, []);

  // Generate the 3 pedestrian routes based on current origin, destination, hour, and weather
  const routes = useMemo(() => {
    return generateMontevideoRoutes(origin, destination, hourOfDay, weather, realRoutes);
  }, [origin, destination, hourOfDay, weather, realRoutes]);

  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Start Companion Mode
  const handleStartCompanion = (route: RouteOption) => {
    setSelectedRouteId(route.id);
    setUserSimulatedLocation({ lat: origin.lat, lng: origin.lng });
    setIsCompanionActive(true);
    setActiveTab('companion');
  };

  // Stable callback identities: CompanionSOSModal uses onUpdateLocation as a
  // useEffect dependency, so a new function reference every App render was
  // re-triggering that effect on every render (React setState-during-render warning).
  const handleCloseCompanion = useCallback(() => {
    setIsCompanionActive(false);
    setActiveTab('navigation');
  }, []);

  const handleUpdateSimulatedLocation = useCallback((coords: Coordinates) => {
    setUserSimulatedLocation(coords);
  }, []);

  // Handle map click to set destination with reverse geocode
  const handleMapClick = async (coords: Coordinates) => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${coords.lat}&lng=${coords.lng}`);
      const info = await res.json();
      setDestination({
        id: 'custom_' + Date.now(),
        name: info.name || 'Punto en Montevideo',
        address: info.address || 'Montevideo',
        neighborhood: info.neighborhood || 'Montevideo',
        lat: coords.lat,
        lng: coords.lng,
        category: 'custom'
      });
    } catch {
      setDestination({
        id: 'custom_' + Date.now(),
        name: 'Punto seleccionado',
        lat: coords.lat,
        lng: coords.lng,
        neighborhood: 'Montevideo'
      });
    }
  };

  return (
    <div className="min-h-screen frosted-bg text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hourOfDay={hourOfDay}
        setHourOfDay={setHourOfDay}
        weather={weather}
        setWeather={setWeather}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-6">
        
        {/* Navigation & Companion View */}
        {(activeTab === 'navigation' || activeTab === 'companion') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Control Column (Search Panel, AI Card, or Companion) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {activeTab === 'companion' ? (
                <CompanionSOSModal
                  route={selectedRoute}
                  origin={origin}
                  destination={destination}
                  onClose={handleCloseCompanion}
                  onUpdateLocation={handleUpdateSimulatedLocation}
                />
              ) : (
                <>
                  <RouteSearchPanel
                    origin={origin}
                    destination={destination}
                    setOrigin={setOrigin}
                    setDestination={setDestination}
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    setSelectedRouteId={setSelectedRouteId}
                    hourOfDay={hourOfDay}
                    onStartCompanion={handleStartCompanion}
                    isRoutingLoading={isRoutingLoading}
                    hasRealRoutes={realRoutes.length > 0}
                  />
                </>
              )}

            </div>

            {/* Right Map Column */}
            <div className="lg:col-span-7 min-h-[500px] lg:min-h-[680px]">
              <InteractiveMap
                origin={origin}
                destination={destination}
                routes={routes}
                selectedRouteId={selectedRouteId}
                setSelectedRouteId={setSelectedRouteId}
                weather={weather}
                userSimulatedLocation={userSimulatedLocation}
                isCompanionActive={isCompanionActive}
                onMapClickSetLocation={handleMapClick}
              />
            </div>

          </div>
        )}

        {/* Matrix Dashboard View */}
        {activeTab === 'matrix' && (
          <UrbanMatrixDashboard />
        )}

        {/* Architecture & Startup Tech View */}
        {activeTab === 'architecture' && (
          <ArchitectureTechModal />
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/60 py-4 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">
            Más Seguro &bull; Llegá mejor, no solamente más rápido.
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Montevideo, Uruguay &bull; Google Maps Core &bull; CCU Min. Interior &bull; IMM Open Data
          </span>
        </div>
      </footer>

    </div>
  );
}
