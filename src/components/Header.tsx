import React, { useState } from 'react';
import { Shield, Compass, Cpu, BarChart3, Sun, Moon, CloudRain, Clock, CloudFog, Zap, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeTab: 'navigation' | 'companion' | 'reports' | 'matrix' | 'architecture';
  setActiveTab: (tab: 'navigation' | 'companion' | 'reports' | 'matrix' | 'architecture') => void;
  hourOfDay: number;
  setHourOfDay: (hour: number) => void;
  weather: string;
  setWeather: (weather: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hourOfDay,
  setHourOfDay,
  weather,
  setWeather
}) => {
  const [isWeatherMenuOpen, setIsWeatherMenuOpen] = useState(false);
  const isNight = hourOfDay >= 20 || hourOfDay <= 6;

  const weatherOptions = [
    { label: 'Despejado', icon: Sun, color: 'text-amber-500', desc: 'Visibilidad 100%' },
    { label: 'Lluvia', icon: CloudRain, color: 'text-blue-600', desc: 'Visibilidad 60% • Calzada mojada' },
    { label: 'Tormenta', icon: Zap, color: 'text-indigo-600', desc: 'Visibilidad 40% • Riesgo elevado' },
    { label: 'Niebla', icon: CloudFog, color: 'text-slate-600', desc: 'Visibilidad 45% • Bruma costera' }
  ];

  const currentWeatherOpt = weatherOptions.find(w => w.label === weather) || weatherOptions[0];
  const CurrentWeatherIcon = currentWeatherOpt.icon;

  return (
    <header className="glass-panel sticky top-0 z-30 px-4 py-2.5 border-b border-white/60 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Brand & Slogan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('navigation')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 text-white font-bold">
              <Shield className="w-5 h-5 text-white" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  Más Seguro
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    Montevideo
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                &ldquo;Llegá mejor, no solamente más rápido.&rdquo;
              </p>
            </div>
          </div>

  
        </div>

        {/* Environmental Simulator Controls (Hour & Weather) */}
        <div className="flex items-center flex-wrap gap-2 text-xs bg-white/65 p-1.5 rounded-2xl border border-white/80 shadow-xs backdrop-blur-md">
          {/* Hour Selector */}
          <div className="flex items-center space-x-2 px-2.5 py-1 bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-700 font-medium whitespace-nowrap text-xs">
              Hora: <span className="font-bold text-slate-900">{String(hourOfDay).padStart(2, '0')}:00</span>
            </span>
            <input
              type="range"
              min="0"
              max="23"
              value={hourOfDay}
              onChange={(e) => setHourOfDay(Number(e.target.value))}
              className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              title="Ajustar hora para simular riesgo nocturno vs diurno"
            />
            {isNight ? (
              <span className="flex items-center text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200">
                <Moon className="w-2.5 h-2.5 mr-0.5 text-indigo-600" /> Noche
              </span>
            ) : (
              <span className="flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                <Sun className="w-2.5 h-2.5 mr-0.5 text-amber-600" /> Día
              </span>
            )}
          </div>

          {/* Weather Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsWeatherMenuOpen(!isWeatherMenuOpen)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border font-semibold transition-all cursor-pointer ${
                weather !== 'Despejado'
                  ? 'bg-blue-50 text-blue-800 border-blue-200 shadow-2xs'
                  : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900 shadow-2xs'
              }`}
              title="Ajustar clima ambiental: altera la visibilidad, estado de aceras y el Safety Score"
            >
              <CurrentWeatherIcon className={`w-3.5 h-3.5 ${currentWeatherOpt.color}`} />
              <span className="capitalize">{weather}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isWeatherMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsWeatherMenuOpen(false)} 
                />
                <div className="absolute top-full mt-1.5 right-0 z-50 w-56 glass-panel rounded-2xl p-1.5 border border-white/90 shadow-xl backdrop-blur-2xl flex flex-col gap-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulación de Clima
                  </div>
                  {weatherOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = weather === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setWeather(opt.label);
                          setIsWeatherMenuOpen(false);
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 text-blue-900 border border-blue-200/80 font-bold'
                            : 'text-slate-700 hover:bg-white/80'
                        }`}
                      >
                        <div className={`p-1 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('navigation')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'navigation'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Rutas Seguras</span>
          </button>

          <button
            onClick={() => setActiveTab('companion')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'companion'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Acompañame & SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-cyan-700 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Matriz Urbana</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-purple-700 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Startup Tech</span>
          </button>

        </div>

      </div>
    </header>
  );
};
