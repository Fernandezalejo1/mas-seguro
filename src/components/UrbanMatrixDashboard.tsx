import React, { useState } from 'react';
import { NEIGHBORHOOD_SAFETY_MATRIX, MONTEVIDEO_SECCIONALES, MONTEVIDEO_IMM_NODES, MONTEVIDEO_CRIME_HEAT_DATA } from '../data/montevideoData';
import { 
  BarChart3, 
  Sliders, 
  Lightbulb, 
  Users, 
  Camera, 
  Store, 
  FileWarning, 
  Layers,
  Shield,
  Database,
  CloudRain,
  CloudFog,
  Zap,
  Sun,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

export const UrbanMatrixDashboard: React.FC = () => {
  // Formula Sandbox weights
  const [weights, setWeights] = useState({
    lighting: 25,
    pedestrian: 25,
    policeCamera: 25,
    commercial: 15,
    crimeReports: 10
  });

  const [sandboxWeather, setSandboxWeather] = useState<'Despejado' | 'Lluvia' | 'Tormenta' | 'Niebla'>('Despejado');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Centro (Eje 18 de Julio)');
  const [activeMatrixTab, setActiveMatrixTab] = useState<'matrix' | 'seccionales' | 'imm_lighting' | 'sandbox'>('matrix');

  // Weather penalty factor calculation
  const weatherMultiplier = sandboxWeather === 'Tormenta' ? 0.78 : sandboxWeather === 'Lluvia' ? 0.88 : sandboxWeather === 'Niebla' ? 0.85 : 1.0;

  // Example test scores with dynamic weather multiplier
  const sample18deJulio = Math.round(
    ((0.95 * weights.lighting) +
    (0.90 * weights.pedestrian) +
    (0.95 * weights.policeCamera) +
    (0.85 * weights.commercial) -
    (0.15 * weights.crimeReports)) * weatherMultiplier
  );

  const sampleSoriano = Math.round(
    ((0.40 * weights.lighting) +
    (0.35 * weights.pedestrian) +
    (0.30 * weights.policeCamera) +
    (0.20 * weights.commercial) -
    (0.45 * weights.crimeReports)) * weatherMultiplier
  );

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-sm text-slate-800 flex flex-col gap-6 border border-white/80">
      
      {/* Header with Official Sources Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                Matriz Urbana & Datos Públicos de Montevideo
              </h2>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-300">
                Datos Oficiales SGSP & IMM
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Integración de datos abiertos de la Intendencia de Montevideo, Observatorio del Ministerio del Interior y Cámaras C5
            </p>
          </div>
        </div>

        {/* Official Sources Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <div className="glass-panel-subtle px-3 py-1.5 rounded-xl border border-white/90 flex items-center gap-1.5 shadow-2xs">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-slate-800">IMM Open Data</span>
          </div>
          <div className="glass-panel-subtle px-3 py-1.5 rounded-xl border border-white/90 flex items-center gap-1.5 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold text-slate-800">Min. Interior SGSP</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveMatrixTab('matrix')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMatrixTab === 'matrix'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'glass-panel-subtle text-slate-600 hover:bg-white/90'
          }`}
        >
          Índice de Seguridad por Barrio
        </button>
        <button
          onClick={() => setActiveMatrixTab('seccionales')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMatrixTab === 'seccionales'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'glass-panel-subtle text-slate-600 hover:bg-white/90'
          }`}
        >
          Seccionales Policiales (1ª a 15ª)
        </button>
        <button
          onClick={() => setActiveMatrixTab('imm_lighting')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMatrixTab === 'imm_lighting'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'glass-panel-subtle text-slate-600 hover:bg-white/90'
          }`}
        >
          Plan Montevideo Se Ilumina & STM
        </button>
        <button
          onClick={() => setActiveMatrixTab('sandbox')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMatrixTab === 'sandbox'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'glass-panel-subtle text-slate-600 hover:bg-white/90'
          }`}
        >
          Sandbox Algorítmico & Clima
        </button>
      </div>

      {/* TAB 1: Neighborhood Heat Grid */}
      {activeMatrixTab === 'matrix' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Matriz Urbana por Corredor Peatonal</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click en una fila para inspeccionar</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs backdrop-blur-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Zona / Corredor</th>
                  <th className="py-3 px-4 text-center">Safety Score</th>
                  <th className="py-3 px-4">Iluminación</th>
                  <th className="py-3 px-4 text-center">Cámaras C5</th>
                  <th className="py-3 px-4">Patrullaje</th>
                  <th className="py-3 px-4 text-center">Riesgo Nocturno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {NEIGHBORHOOD_SAFETY_MATRIX.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedNeighborhood(item.name)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                      selectedNeighborhood === item.name ? 'bg-blue-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-900 font-medium flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        item.score >= 85 ? 'bg-emerald-500' : item.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                        item.score >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.score >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.lighting}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">{item.cameras} domos</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.policeRating}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.risk === 'Bajo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.risk === 'Medio' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Seccionales Policiales Min. Interior */}
      {activeMatrixTab === 'seccionales' && (
        <div className="flex flex-col gap-4">
          <div className="glass-panel-subtle p-4 rounded-2xl border border-indigo-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Seccionales de la Jefatura de Policía de Montevideo</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Red oficial de comisarías con patrullaje de alta dedicación (PADO) y videovigilancia C5
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
              {MONTEVIDEO_SECCIONALES.length} Unidades Mapeadas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {MONTEVIDEO_SECCIONALES.map((sec) => (
              <div key={sec.number} className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-indigo-900">{sec.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      Secc. {sec.number}ª
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">{sec.address}</p>
                  <div className="text-xs font-bold text-indigo-600 mt-0.5">Tel: {sec.phone}</div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/70">
                    <div className="text-[11px] text-slate-700 font-semibold mb-1">Jurisdicción:</div>
                    <div className="flex flex-wrap gap-1">
                      {sec.neighborhoods.map((nb, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-medium">
                          {nb}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    PADO: {sec.padoCoverage}
                  </span>
                  <span className="font-bold text-blue-700">
                    {sec.c5CamerasCount} Cámaras C5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Plan Montevideo Se Ilumina & IMM Open Data */}
      {activeMatrixTab === 'imm_lighting' && (
        <div className="flex flex-col gap-4">
          <div className="glass-panel-subtle p-4 rounded-2xl border border-cyan-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-600" />
                <span>Plan "Montevideo Se Ilumina" & Paradas Seguras STM</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Infraestructura lumínica LED telegestionada de la Intendencia de Montevideo (85.000+ luminarias)
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-xl border border-cyan-200">
                Catálogo IMM Open Data
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {MONTEVIDEO_IMM_NODES.map((node) => (
              <div key={node.id} className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{node.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800">
                      {node.type === 'safe_corridor' ? 'Corredor LED' : 'Parada STM Segura'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-cyan-700">{node.neighborhood}</span>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{node.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                  <span className="text-slate-500 font-medium">Dataset: {node.immDataset}</span>
                  <span className="font-mono font-bold text-cyan-700">{node.lumensOrPower || 'Iluminación Continua'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Crime Heat SGSP Dataset Reference */}
          <div className="glass-panel-subtle p-4 rounded-2xl border border-rose-200 mt-2">
            <h4 className="font-bold text-xs text-rose-900 mb-2 flex items-center gap-1.5">
              <FileWarning className="w-4 h-4 text-rose-600" />
              <span>Registros de Incidentes y Hurtos (Observatorio Min. Interior SGSP)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {MONTEVIDEO_CRIME_HEAT_DATA.slice(0, 6).map((crm) => (
                <div key={crm.id} className="p-2.5 rounded-xl bg-white/80 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{crm.corner}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      crm.severity === 'Alta' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>{crm.severity}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{crm.neighborhood} • {crm.timeBracket}</div>
                  <div className="text-[10.5px] text-slate-700 mt-1">{crm.crimeType}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Safety Score Formula Sandbox & Weather Simulator */}
      {activeMatrixTab === 'sandbox' && (
        <div className="glass-panel-subtle border border-blue-200/80 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Sandbox Algorítmico de Safety Score (Ponderación de Variables)
              </h3>
            </div>
            <span className="text-[11px] text-blue-700 font-mono font-bold glass-pill px-2.5 py-0.5 rounded-full border border-blue-200">
              Suma total: {weights.lighting + weights.pedestrian + weights.policeCamera + weights.commercial + weights.crimeReports}%
            </span>
          </div>

          {/* Weather Simulation Toggle in Sandbox */}
          <div className="flex items-center gap-2 p-3 bg-white/80 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              Impacto del Clima en el Cálculo:
            </span>
            <div className="flex items-center gap-1.5">
              {(['Despejado', 'Lluvia', 'Tormenta', 'Niebla'] as const).map(w => (
                <button
                  key={w}
                  onClick={() => setSandboxWeather(w)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sandboxWeather === w 
                      ? 'bg-blue-600 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {w === 'Despejado' && <Sun className="w-3 h-3 inline mr-1" />}
                  {w === 'Lluvia' && <CloudRain className="w-3 h-3 inline mr-1" />}
                  {w === 'Tormenta' && <Zap className="w-3 h-3 inline mr-1" />}
                  {w === 'Niebla' && <CloudFog className="w-3 h-3 inline mr-1" />}
                  {w}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-medium ml-auto hidden md:inline">
              Penalización: {Math.round((1 - weatherMultiplier) * 100)}%
            </span>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            
            <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Iluminación LED Pública
                </span>
                <span className="font-bold text-amber-600">{weights.lighting}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={weights.lighting}
                onChange={(e) => setWeights({ ...weights, lighting: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-600" /> Flujo Peatonal & Paradas
                </span>
                <span className="font-bold text-cyan-700">{weights.pedestrian}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={weights.pedestrian}
                onChange={(e) => setWeights({ ...weights, pedestrian: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" /> Cámaras C5 y Comisarías
                </span>
                <span className="font-bold text-blue-700">{weights.policeCamera}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={weights.policeCamera}
                onChange={(e) => setWeights({ ...weights, policeCamera: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" /> Comercios y Farmacias 24h
                </span>
                <span className="font-bold text-emerald-700">{weights.commercial}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.commercial}
                onChange={(e) => setWeights({ ...weights, commercial: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileWarning className="w-3.5 h-3.5 text-rose-600" /> Penalización por Delitos
                </span>
                <span className="font-bold text-rose-700">{weights.crimeReports}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.crimeReports}
                onChange={(e) => setWeights({ ...weights, crimeReports: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

          </div>

          {/* Live Formula Score Output */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[11px] text-blue-900 font-bold block">Av. 18 de Julio (Centro)</span>
                <span className="text-xs text-slate-600 font-medium">Iluminación LED, 12 Cámaras C5, PADO, 8 comercios 24h</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-600">{sample18deJulio}/100</span>
                <span className="text-[10px] text-emerald-700 block font-bold">
                  {sample18deJulio >= 75 ? 'Muy Seguro' : 'Seguridad Moderada'}
                </span>
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[11px] text-rose-900 font-bold block">Calle Soriano (Transversal nocturna)</span>
                <span className="text-xs text-slate-600 font-medium">Luz tenue, 1 cámara, sin comercios 24h</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-rose-600">{sampleSoriano}/100</span>
                <span className="text-[10px] text-rose-700 block font-bold">Riesgo Nocturno</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
