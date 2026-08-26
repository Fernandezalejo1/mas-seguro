/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationPoint, RouteOption, RouteType, CommunityReport, Coordinates, RealRouteAlt } from './types';
import { MONTEVIDEO_PRESETS, INITIAL_COMMUNITY_REPORTS, generateMontevideoRoutes } from './data/montevideoData';
import { fetchRealRoutes } from './utils/routingService';
import { Header } from './components/Header';
import { RouteSearchPanel } from './components/RouteSearchPanel';
import { InteractiveMap } from './components/InteractiveMap';
import { CompanionSOSModal } from './components/CompanionSOSModal';
import { CommunityReportModal } from './components/CommunityReportModal';
import { UrbanMatrixDashboard } from './components/UrbanMatrixDashboard';
import { ArchitectureTechModal } from './components/ArchitectureTechModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'navigation' | 'companion' | 'reports' | 'matrix' | 'architecture'>('navigation');
  
  // Locations (Montevideo defaults: Plaza Independencia -> Tres Cruces)
  const [origin, setOrigin] = useState<LocationPoint>(MONTEVIDEO_PRESETS[0]);
  const [destination, setDestination] = useState<LocationPoint>(MONTEVIDEO_PRESETS[2]);
  
  // Environment simulation
  const [hourOfDay, setHourOfDay] = useState<number>(new Date().getHours());
  const [weather, setWeather] = useState<string>('Despejado');

  // Selected route
  const [selectedRouteId, setSelectedRouteId] = useState<RouteType>('safest');
  
  // Community reports
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  // Fetch real Montevideo weather & live community reports on start
  useEffect(() => {
    fetch('/api/weather/montevideo')
      .then(res => res.json())
      .then(data => {
        if (data && data.condition) {
          setWeather(data.condition);
        }
      })
      .catch(() => {});

    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        if (data && data.reports && data.reports.length > 0) {
          setCommunityReports(data.reports);
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

  // Submit new community report
  const handleSubmitReport = async (reportData: Partial<CommunityReport>) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      const data = await response.json();
      if (data && data.report) {
        setCommunityReports(prev => [data.report, ...prev]);
      }
    } catch {
      // Local fallback
      const newReport: CommunityReport = {
        id: 'rep_' + Date.now(),
        category: reportData.category || 'unsafe_feeling',
        categoryLabel: reportData.categoryLabel || 'Reporte de Seguridad',
        lat: reportData.lat || origin.lat,
        lng: reportData.lng || origin.lng,
        streetName: reportData.streetName || 'Montevideo',
        neighborhood: reportData.neighborhood || 'Centro',
        description: reportData.description || 'Reporte ciudadano',
        timestamp: 'Recién publicado',
        upvotes: 1,
        iconType: 'alert'
      };
      setCommunityReports(prev => [newReport, ...prev]);
    }
  };

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
        onOpenNewReport={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-6">
        
        {/* Navigation & Companion View */}
        {(activeTab === 'navigation' || activeTab === 'companion') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
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
            <div className="lg:col-span-7 h-[500px] sm:h-[650px] lg:h-[860px] sticky top-20">
              <InteractiveMap
                origin={origin}
                destination={destination}
                routes={routes}
                selectedRouteId={selectedRouteId}
                setSelectedRouteId={setSelectedRouteId}
                communityReports={communityReports}
                weather={weather}
                userSimulatedLocation={userSimulatedLocation}
                isCompanionActive={isCompanionActive}
                onMapClickSetLocation={handleMapClick}
              />
            </div>

          </div>
        )}

        {/* Reports View */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="glass-panel rounded-3xl p-6 shadow-lg border border-white/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Alertas Comunitarias en Vivo</h2>
                    <p className="text-xs text-slate-500 font-medium">Montevideo • Actualizaciones de vecinos y peatones</p>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    + Nuevo Reporte
                  </button>
                </div>

                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {communityReports.map(rep => (
                    <div key={rep.id} className="glass-panel-subtle p-4 rounded-2xl border border-white/90 flex flex-col gap-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          rep.category === 'dark_street' || rep.category === 'unsafe_feeling'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                        }`}>
                          {rep.categoryLabel}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">{rep.timestamp}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{rep.streetName}</h4>
                        <span className="text-xs font-medium text-slate-500">{rep.neighborhood}</span>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{rep.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 text-xs text-slate-500">
                        <span className="font-medium">{rep.upvotes} confirmaciones</span>
                        <button
                          onClick={() => {
                            fetch(`/api/upvote?id=${encodeURIComponent(rep.id)}`, { method: 'POST' })
                              .then(r => r.json())
                              .then(data => {
                                if (data && data.upvotes) {
                                  setCommunityReports(prev => prev.map(r => r.id === rep.id ? { ...r, upvotes: data.upvotes } : r));
                                }
                              })
                              .catch(() => {
                                setCommunityReports(prev => prev.map(r => r.id === rep.id ? { ...r, upvotes: r.upvotes + 1 } : r));
                              });
                          }}
                          className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white text-slate-700 font-semibold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          👍 Confirmar reporte
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 h-[500px] lg:h-[680px]">
              <InteractiveMap
                origin={origin}
                destination={destination}
                routes={routes}
                selectedRouteId={selectedRouteId}
                setSelectedRouteId={setSelectedRouteId}
                communityReports={communityReports}
                weather={weather}
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

      {/* Community Report Modal */}
      {isReportModalOpen && (
        <CommunityReportModal
          currentNeighborhood={origin.neighborhood}
          onClose={() => setIsReportModalOpen(false)}
          onSubmitReport={handleSubmitReport}
        />
      )}

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
