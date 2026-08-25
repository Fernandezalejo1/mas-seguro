import React, { useState } from 'react';
import { AISafetyAnalysis, RouteOption, LocationPoint } from '../types';
import { 
  Sparkles, 
  CheckCircle, 
  Moon, 
  AlertOctagon, 
  CornerDownRight, 
  MessageSquare,
  Send,
  Bot
} from 'lucide-react';

interface AISafetyAnalysisCardProps {
  analysis: AISafetyAnalysis | null;
  selectedRoute: RouteOption;
  origin: LocationPoint;
  destination: LocationPoint;
  hourOfDay: number;
  weather: string;
  isAILoading: boolean;
  onRefreshAI: () => void;
}

export const AISafetyAnalysisCard: React.FC<AISafetyAnalysisCardProps> = ({
  analysis,
  selectedRoute,
  origin,
  destination,
  hourOfDay,
  weather,
  isAILoading,
  onRefreshAI
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `¡Hola! Soy tu asistente de seguridad para Montevideo. Analicé tu trayecto desde ${origin.name} hacia ${destination.name}. ¿Tenés alguna duda sobre calles específicas o comisarías cercanas?`
    }
  ]);
  const [isChatSending, setIsChatSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isChatSending) return;

    const query = userQuery.trim();
    setUserQuery('');
    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setIsChatSending(true);

    try {
      const response = await fetch('/api/safety-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          currentNeighborhood: origin.neighborhood,
          hourOfDay
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply || 'Caminá siempre por calles iluminadas y con comercios abiertos.' }]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `En ${origin.neighborhood}, a las ${hourOfDay}:00 hs, la mejor opción es transitar por Av. 18 de Julio o Bulevar Artigas donde hay patrullaje del PADO y cámaras C5 del Ministerio.`
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-sm text-slate-800 flex flex-col gap-3.5 relative overflow-hidden border border-purple-200/60">
      
      {/* Subtle purple aura */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              Motor de Razonamiento IA (Gemini)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Análisis contextual de riesgo urbano en tiempo real para Montevideo
            </p>
          </div>
        </div>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/90 hover:bg-purple-100/90 text-purple-700 border border-purple-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{chatOpen ? 'Cerrar Consulta' : 'Preguntar a la IA'}</span>
        </button>
      </div>

      {/* Main Analysis Box */}
      {isAILoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs animate-pulse">
          <Bot className="w-8 h-8 text-purple-600 animate-bounce" />
          <span className="font-medium">Procesando datos de calles de Montevideo, iluminación y delitos con Gemini...</span>
        </div>
      ) : analysis ? (
        <div className="flex flex-col gap-3.5">
          
          {/* Key Verdict Callout */}
          <div className="bg-gradient-to-br from-purple-50/90 to-indigo-50/60 p-3.5 rounded-2xl border border-purple-200/80 flex items-start gap-3 shadow-2xs">
            <CornerDownRight className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
                Veredicto de Seguridad
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-snug">
                {analysis.verdict}
              </p>
              <p className="text-xs text-purple-900 mt-2 font-medium bg-white/80 p-2.5 rounded-xl border border-purple-200/60 shadow-2xs">
                💡 <span className="font-bold text-purple-950">Consejo clave:</span> {analysis.keyRecommendation}
              </p>
            </div>
          </div>

          {/* Reasons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Why this route */}
            <div className="glass-panel-subtle p-3.5 rounded-2xl border border-slate-200/80">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-[11px] mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Factores Favorables de la Ruta
              </span>
              <ul className="space-y-1.5">
                {analysis.reasons.map((r, idx) => (
                  <li key={idx} className="text-[11px] text-slate-700 pl-3.5 relative before:content-['✓'] before:absolute before:left-0 before:text-emerald-600 before:font-bold before:text-[10px] leading-tight">
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Night & Weather Advice */}
            <div className="glass-panel-subtle p-3.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-700 flex items-center gap-1.5 text-[11px] mb-1.5">
                  <Moon className="w-3.5 h-3.5 text-amber-600" /> Precaución Nocturna
                </span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {analysis.nighttimeAdvice}
                </p>
              </div>

              {analysis.hotspotsToAvoid && analysis.hotspotsToAvoid.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-rose-100">
                  <span className="font-bold text-rose-700 flex items-center gap-1 text-[10px] mb-0.5">
                    <AlertOctagon className="w-3 h-3 text-rose-600" /> Puntos a evitar a esta hora
                  </span>
                  <p className="text-[10px] text-rose-600 font-medium">
                    {analysis.hotspotsToAvoid.join(' • ')}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-500 font-medium">
          Haz clic en &ldquo;Consultar IA&rdquo; para analizar este trayecto con Gemini.
        </div>
      )}

      {/* Interactive Chat Drawer with AI */}
      {chatOpen && (
        <div className="mt-2 pt-3 border-t border-purple-200/60 flex flex-col gap-2.5 glass-panel p-3.5 rounded-2xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-purple-800 font-bold">
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-600" /> Asistente de Seguridad en Vivo (Montevideo)
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'ml-auto bg-blue-600 text-white font-medium shadow-2xs'
                    : 'mr-auto bg-white/90 border border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isChatSending && (
              <div className="mr-auto bg-white/80 border border-purple-100 text-purple-600 p-2.5 rounded-2xl text-xs font-medium animate-pulse">
                La IA está evaluando el mapa de Montevideo...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 mt-1">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ej: ¿Qué calle conviene tomar después de las 23 hs?"
              className="flex-1 bg-white/90 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!userQuery.trim() || isChatSending}
              className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
