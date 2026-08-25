import React from 'react';
import { 
  Cpu, 
  Layers, 
  Database, 
  Smartphone, 
  BrainCircuit, 
  DollarSign, 
  ShieldCheck, 
  Compass, 
  Server
} from 'lucide-react';

export const ArchitectureTechModal: React.FC = () => {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-sm text-slate-800 flex flex-col gap-6 border border-white/80">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Arquitectura Técnica y Blueprint de la Startup &ldquo;Más Seguro&rdquo;
            </h2>
            <p className="text-xs text-purple-800 font-semibold mt-0.5">
              Lema: &ldquo;Llegá mejor, no solamente más rápido.&rdquo; • Montevideo, Uruguay
            </p>
          </div>
        </div>
      </div>

      {/* The 6 Core Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Motor de Rutas */}
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>1. Motor de Rutas (Cerebro)</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
            <li><strong className="text-slate-900">Google Routes API (New):</strong> Obtención de polilíneas y alternativas peatonales multiruta.</li>
            <li><strong className="text-slate-900">Filtro de Veredas:</strong> Priorización de aceras transitables, cruces semafóricos y rebajes accesibles.</li>
            <li><strong className="text-slate-900">Modos:</strong> Caminata peatonal, Bicicleta y Monopatín eléctrico.</li>
          </ul>
        </div>

        {/* 2. Motor de Safety Score */}
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>2. Motor de Safety Score (Diferencial)</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
            <li><strong className="text-slate-900">Algoritmo Ponderado:</strong> Puntaje 0 a 100 asignado a cada cuadra de Montevideo.</li>
            <li><strong className="text-slate-900">Variables:</strong> Iluminación LED, cámaras C5 CCU, comercios 24h, comisarías, paradas STM y denuncias.</li>
            <li><strong className="text-slate-900">Sensibilidad Temporal:</strong> Modificador dinámico según la hora (15:00 vs 02:30).</li>
          </ul>
        </div>

        {/* 3. Motor de IA */}
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <BrainCircuit className="w-4 h-4 text-purple-600" />
            <span>3. Motor de IA (Gemini 3.7 Flash)</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
            <li><strong className="text-slate-900">Razonamiento Contextual:</strong> Explica en lenguaje humano por qué conviene caminar 2 cuadras más por la avenida.</li>
            <li><strong className="text-slate-900">Detección de Riesgos:</strong> Cruces de plazas vacías, eventos masivos (fútbol/conciertos) y clima lluvioso.</li>
            <li><strong className="text-slate-900">Asistente Interactivo:</strong> Respuestas inmediatas sobre seguridad barrial.</li>
          </ul>
        </div>

        {/* 4. Backend & Base de Datos */}
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm">
            <Server className="w-4 h-4 text-cyan-600" />
            <span>4. Backend de Alta Disponibilidad</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
            <li><strong className="text-slate-900">Stack:</strong> FastAPI / Express + Node.js en contenedores Cloud Run / Docker.</li>
            <li><strong className="text-slate-900">Base Espacial:</strong> PostgreSQL + PostGIS para consultas geográficas indexadas en microsegundos.</li>
            <li><strong className="text-slate-900">Caché:</strong> Redis para scores de tramos viales calientes y sesiones en vivo.</li>
          </ul>
        </div>

        {/* 5. App Móvil */}
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span>5. Aplicación Móvil (Cross-Platform)</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
            <li><strong className="text-slate-900">Framework:</strong> Flutter / React Native para compilación unificada en Android e iOS.</li>
            <li><strong className="text-slate-900">Geofencing & Tracking:</strong> Detección en segundo plano con bajo consumo de batería.</li>
            <li><strong className="text-slate-900">Botón de Pánico:</strong> Acceso rápido por sacudida (shake gesture) o botón flotante.</li>
          </ul>
        </div>

        {/* 6. Panel Administrativo */}
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <Layers className="w-4 h-4 text-rose-600" />
            <span>6. Panel Administrativo & Matriz Urbana</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
            <li><strong className="text-slate-900">Mapa de Calor:</strong> Visualización de Montevideo cuadra por cuadra (Verde, Amarillo, Rojo).</li>
            <li><strong className="text-slate-900">Evolución Histórica:</strong> Registro de alertas de vecinos, fallas de iluminación y patrullaje.</li>
            <li><strong className="text-slate-900">Exportación de Datos:</strong> Reportes anonimizados para planificación urbana.</li>
          </ul>
        </div>

      </div>

      {/* Open Data Sources & Integrations */}
      <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Fuentes de Datos Abiertos para Montevideo (Open Data UY)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-blue-800 block mb-1">Ministerio del Interior</span>
            <p className="text-slate-600 text-[11px] font-medium leading-snug">
              Estadísticas oficiales del Sistema de Gestión de Seguridad Pública (SGSP), cámaras CCU y comisarías seccionales.
            </p>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-emerald-800 block mb-1">Intendencia de Montevideo (IMM)</span>
            <p className="text-slate-600 text-[11px] font-medium leading-snug">
              Red de alumbrado público LED, paradas y frecuencias STM, cámaras de tránsito y catastro vial.
            </p>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-amber-800 block mb-1">Inteligencia Colectiva (Waze-like)</span>
            <p className="text-slate-600 text-[11px] font-medium leading-snug">
              Reportes directos de usuarios sobre focos rotos, esquinas oscuras, presencia policial y calles cortadas.
            </p>
          </div>
        </div>
      </div>

      {/* Business Model */}
      <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Modelo de Negocio y Monetización</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-emerald-800 block mb-1">B2C Freemium</span>
            <p className="text-slate-600 text-[11px] font-medium leading-snug">
              Gratis con rutas básicas. Premium con alertas proactivas en tiempo real, modo guardián familiar y botón SOS ilimitado.
            </p>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-cyan-800 block mb-1">B2B Empresas & Delivery</span>
            <p className="text-slate-600 text-[11px] font-medium leading-snug">
              API de ruteo seguro para empresas de logística, repartidores de PedidosYa/Rappi y seguridad laboral de empleados en turnos nocturnos.
            </p>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="font-bold text-purple-800 block mb-1">Gobierno & Smart Cities</span>
            <p className="text-slate-600 text-[11px] font-medium leading-snug">
              Licenciamiento de mapas de calor analíticos para optimizar la colocación de nuevas luminarias y cámaras en la Intendencia.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
