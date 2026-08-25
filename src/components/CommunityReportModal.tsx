import React, { useState } from 'react';
import { CommunityReport, ReportCategory } from '../types';
import { 
  AlertTriangle, 
  Moon, 
  Users, 
  ShieldCheck, 
  Eye, 
  Construction, 
  MapPin, 
  X, 
  Send,
  CheckCircle2
} from 'lucide-react';

interface CommunityReportModalProps {
  onClose: () => void;
  onSubmitReport: (report: Partial<CommunityReport>) => void;
  currentNeighborhood?: string;
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  onClose,
  onSubmitReport,
  currentNeighborhood = 'Centro'
}) => {
  const [category, setCategory] = useState<ReportCategory>('dark_street');
  const [streetName, setStreetName] = useState('');
  const [neighborhood, setNeighborhood] = useState(currentNeighborhood);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categories: Array<{ id: ReportCategory; label: string; icon: any; color: string }> = [
    { id: 'dark_street', label: 'Calle Muy Oscura', icon: Moon, color: 'text-amber-700 border-amber-300 bg-amber-50 font-bold shadow-2xs' },
    { id: 'unsafe_feeling', label: 'Me sentí inseguro', icon: AlertTriangle, color: 'text-rose-700 border-rose-300 bg-rose-50 font-bold shadow-2xs' },
    { id: 'crowded_safe', label: 'Mucha Gente / Seguro', icon: Users, color: 'text-sky-700 border-sky-300 bg-sky-50 font-bold shadow-2xs' },
    { id: 'police_presence', label: 'Presencia Policial', icon: ShieldCheck, color: 'text-indigo-700 border-indigo-300 bg-indigo-50 font-bold shadow-2xs' },
    { id: 'suspicious_activity', label: 'Actividad Sospechosa', icon: Eye, color: 'text-orange-700 border-orange-300 bg-orange-50 font-bold shadow-2xs' },
    { id: 'street_cut', label: 'Corte / Obras', icon: Construction, color: 'text-yellow-800 border-yellow-300 bg-yellow-50 font-bold shadow-2xs' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetName.trim() || !description.trim()) return;

    const selectedCat = categories.find(c => c.id === category);

    // Approximate coordinates near Centro / Cordón for demonstration
    const randomOffsetLat = (Math.random() - 0.5) * 0.015;
    const randomOffsetLng = (Math.random() - 0.5) * 0.015;

    onSubmitReport({
      category,
      categoryLabel: selectedCat?.label || 'Reporte de Seguridad',
      streetName: streetName.trim(),
      neighborhood,
      description: description.trim(),
      lat: -34.9060 + randomOffsetLat,
      lng: -56.1850 + randomOffsetLng
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl text-slate-800 flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200 border border-white/90">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 border border-slate-200 transition-all shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">¡Gracias por cuidar a la comunidad!</h3>
            <p className="text-xs text-slate-600 font-medium max-w-sm">
              Tu reporte ha sido publicado en el mapa y ya está impactando el Safety Score de las calles de Montevideo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Header */}
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Reportar Estado de Calle</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1.5">
                Con cada aviso de iluminación, presencia policial o zonas desiertas, el algoritmo de Más Seguro aprende y cuida a otros peatones en Montevideo.
              </p>
            </div>

            {/* Category selection grid */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Seleccioná el tipo de reporte:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                        isSelected
                          ? cat.color
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-medium leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Street & Neighborhood Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Esquina o Calle:
                </label>
                <input
                  type="text"
                  required
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder="Ej: Soriano y Paraguay"
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Barrio:
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                >
                  <option value="Centro">Centro</option>
                  <option value="Cordón">Cordón</option>
                  <option value="Ciudad Vieja">Ciudad Vieja</option>
                  <option value="Pocitos">Pocitos</option>
                  <option value="Punta Carretas">Punta Carretas</option>
                  <option value="Parque Rodó">Parque Rodó</option>
                  <option value="Tres Cruces">Tres Cruces</option>
                  <option value="Parque Batlle">Parque Batlle</option>
                  <option value="Aguada">Aguada</option>
                  <option value="Buceo">Buceo</option>
                  <option value="Malvín">Malvín</option>
                </select>
              </div>
            </div>

            {/* Description textarea */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Detalles de lo que observaste:
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Dos luminarias apagadas en la vereda impar. Poca gente pasando a esta hora."
                className="w-full bg-white/90 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none shadow-2xs"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Alerta Comunitaria</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
