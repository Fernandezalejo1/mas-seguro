import React, { useState, useEffect, useRef } from 'react';
import { RouteOption, LocationPoint, Coordinates } from '../types';
import { emergencyAudio, generateEmergencyShareLinks } from '../utils/emergencyAudio';
import { useGeolocation } from '../utils/useGeolocation';
import { 
  Shield, 
  AlertOctagon, 
  PhoneCall, 
  Battery, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Share2, 
  X, 
  RotateCcw,
  Volume2,
  VolumeX,
  MessageCircle,
  Mic,
  MicOff,
  LocateFixed,
  Flashlight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface CompanionSOSModalProps {
  route: RouteOption;
  origin: LocationPoint;
  destination: LocationPoint;
  onClose: () => void;
  onUpdateLocation: (coords: Coordinates) => void;
}

export const CompanionSOSModal: React.FC<CompanionSOSModalProps> = ({
  route,
  origin,
  destination,
  onClose,
  onUpdateLocation
}) => {
  const [progress, setProgress] = useState(10);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [checkInActive, setCheckInActive] = useState(false);
  const [checkInCountdown, setCheckInCountdown] = useState(20);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosHoldProgress, setSosHoldProgress] = useState(0);
  const [isHoldingSos, setIsHoldingSos] = useState(false);
  
  // Real Emergency Tools states
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isStrobeOn, setIsStrobeOn] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [trackingMode, setTrackingMode] = useState<'simulated' | 'real_gps'>('simulated');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { coords: liveGpsCoords, startWatch } = useGeolocation();

  // Current active coordinates
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({
    lat: origin.lat,
    lng: origin.lng
  });

  // Battery status API if supported
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
  }, []);

  // Steps along route
  const steps = [
    { text: `Iniciá caminata desde ${origin.name}`, street: origin.address || 'Salida de punto seguro', distance: '100m' },
    { text: `Avanzá por ${route.summary.split(',')[0] || 'Av. 18 de Julio'} (iluminación LED y cámaras C5)`, street: 'Corredor Seguro', distance: '450m' },
    { text: 'Monitoreo activo de intersecciones y comercios abiertos', street: 'Zona vigilada PADO', distance: '300m' },
    { text: `Llegada a destino en ${destination.name}`, street: destination.neighborhood, distance: '150m' }
  ];

  const currentStepIndex = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));
  const currentStep = steps[currentStepIndex];

  // Continuous real GPS watch when in real_gps mode
  useEffect(() => {
    if (trackingMode === 'real_gps') {
      const stop = startWatch();
      return () => {
        if (stop) stop();
      };
    }
  }, [trackingMode, startWatch]);

  // Update coordinates when live GPS updates
  useEffect(() => {
    if (trackingMode === 'real_gps' && liveGpsCoords) {
      setCurrentCoords(liveGpsCoords);
      onUpdateLocation(liveGpsCoords);
    }
  }, [trackingMode, liveGpsCoords, onUpdateLocation]);

  // Auto advance walk simulation if in simulated mode
  useEffect(() => {
    if (sosTriggered || trackingMode === 'real_gps') return;

    const timer = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 5));
    }, 2500);

    return () => clearInterval(timer);
  }, [sosTriggered, trackingMode]);

  // Derive simulated coordinates from progress along the route. Kept out of the
  // setProgress updater above: updater functions must be pure (React may call
  // them outside a commit to compute state), so calling setCurrentCoords/
  // onUpdateLocation from inside one triggers a "setState while rendering" error.
  useEffect(() => {
    if (sosTriggered || trackingMode === 'real_gps') return;
    if (route.coordinates.length <= 1) return;

    const ratio = progress / 100;
    const idx = Math.min(route.coordinates.length - 2, Math.floor(ratio * (route.coordinates.length - 1)));
    const p1 = route.coordinates[idx];
    const p2 = route.coordinates[idx + 1] || p1;
    const lat = p1[0] + (p2[0] - p1[0]) * (ratio * (route.coordinates.length - 1) - idx);
    const lng = p1[1] + (p2[1] - p1[1]) * (ratio * (route.coordinates.length - 1) - idx);
    const newPoint = { lat, lng };
    setCurrentCoords(newPoint);
    onUpdateLocation(newPoint);
  }, [progress, sosTriggered, trackingMode, route, onUpdateLocation]);

  // Periodic Safe Check-in prompt
  useEffect(() => {
    if (progress > 35 && progress < 80 && !checkInActive && !sosTriggered) {
      const trigger = setTimeout(() => {
        setCheckInActive(true);
        setCheckInCountdown(20);
        emergencyAudio.playBeep(600, 300);
      }, 5000);
      return () => clearTimeout(trigger);
    }
  }, [progress, checkInActive, sosTriggered]);

  // Check-in countdown
  useEffect(() => {
    if (!checkInActive) return;
    if (checkInCountdown <= 0) {
      triggerFullSOS();
      setCheckInActive(false);
      return;
    }
    const cd = setInterval(() => {
      setCheckInCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(cd);
  }, [checkInActive, checkInCountdown]);

  // Trigger Full SOS
  const triggerFullSOS = () => {
    setSosTriggered(true);
    setIsSirenOn(true);
    emergencyAudio.startSiren();
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 1000]);
    }
  };

  // SOS button press hold
  useEffect(() => {
    let holdTimer: any;
    if (isHoldingSos && !sosTriggered) {
      holdTimer = setInterval(() => {
        setSosHoldProgress(p => {
          if (p >= 100) {
            triggerFullSOS();
            setIsHoldingSos(false);
            return 100;
          }
          return p + 12;
        });
      }, 100);
    } else {
      setSosHoldProgress(0);
    }
    return () => clearInterval(holdTimer);
  }, [isHoldingSos, sosTriggered]);

  // Toggle siren
  const toggleSiren = () => {
    if (isSirenOn) {
      emergencyAudio.stopSiren();
      setIsSirenOn(false);
    } else {
      emergencyAudio.startSiren();
      setIsSirenOn(true);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      emergencyAudio.stopSiren();
    };
  }, []);

  // Audio Memo / Evidence recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecordingAudio(true);
    } catch (e) {
      alert('Permiso de micrófono no otorgado para grabar nota de voz.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecordingAudio(false);
    }
  };

  // Generate emergency sharing links
  const shareLinks = generateEmergencyShareLinks({
    lat: currentCoords.lat,
    lng: currentCoords.lng,
    streetName: currentStep.street,
    neighborhood: destination.neighborhood,
    batteryLevel,
    emergencyContactPhone: emergencyPhone
  });

  return (
    <div className={`glass-panel rounded-3xl p-5 shadow-lg text-slate-800 flex flex-col gap-4 relative overflow-hidden border border-indigo-200/80 ${isStrobeOn ? 'animate-pulse bg-red-100/90' : ''}`}>
      
      {/* Top bar with active status */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>Modo Acompañame Activo</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                IA Guardián
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {trackingMode === 'real_gps' ? '📡 Siguiendo GPS real del dispositivo' : '🚶 Simulando trayecto seguro en Montevideo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
            <Battery className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-slate-800">{batteryLevel}%</span>
          </div>

          <button
            onClick={() => {
              emergencyAudio.stopSiren();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200 transition-all shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GPS Mode Toggle Bar */}
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-700 text-[11px]">Modo de Seguimiento:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setTrackingMode('simulated')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              trackingMode === 'simulated' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            🚶 Simulación
          </button>
          <button
            onClick={() => setTrackingMode('real_gps')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              trackingMode === 'real_gps' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <LocateFixed className="w-3 h-3" />
            <span>GPS Real</span>
          </button>
        </div>
      </div>

      {/* SOS Alert Banner if triggered */}
      {sosTriggered && (
        <div className="bg-rose-50/95 border-2 border-rose-500 p-4 rounded-2xl text-rose-900 flex flex-col gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 animate-bounce" />
            <div>
              <h4 className="font-black text-sm text-rose-900 uppercase tracking-wider">
                🚨 ALERTA SOS DE EMERGENCIA ACTIVADA
              </h4>
              <p className="text-xs text-rose-700 font-medium">
                Sirena disuasiva activa y ubicación en vivo lista para enviar.
              </p>
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-rose-200 text-xs flex flex-col gap-1.5 text-slate-700 shadow-2xs">
            <div className="flex justify-between">
              <span>Coordenadas en vivo:</span>
              <span className="font-mono font-bold text-slate-900">
                {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Batería:</span>
              <span className="font-bold text-emerald-600">{batteryLevel}%</span>
            </div>
            <div className="flex justify-between">
              <span>Punto de referencia:</span>
              <span className="font-bold text-indigo-700">{currentStep.street}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="tel:911"
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-center text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Llamar 911 (Policía)
            </a>

            <a
              href={shareLinks.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-center text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Enviar SOS por WhatsApp
            </a>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleSiren}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                isSirenOn ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {isSirenOn ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSirenOn ? 'Silenciar Sirena' : 'Sonar Sirena'}</span>
            </button>

            <button
              onClick={() => {
                setSosTriggered(false);
                emergencyAudio.stopSiren();
                setIsSirenOn(false);
              }}
              className="py-2 px-4 rounded-xl bg-white hover:bg-slate-100 font-bold text-xs text-slate-700 border border-slate-200 transition-all cursor-pointer"
            >
              Desactivar Alerta
            </button>
          </div>
        </div>
      )}

      {/* Check-In Prompt Box */}
      {checkInActive && !sosTriggered && (
        <div className="bg-amber-50/95 border border-amber-300 p-3.5 rounded-2xl text-amber-900 flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
              <span className="font-bold text-xs text-amber-950">
                {isOffRoute ? '⚠️ ¿Te desviaste de la ruta segura?' : '🛡️ Chequeo Preventivo: ¿Todo bien?'}
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              {checkInCountdown}s
            </span>
          </div>

          <p className="text-xs text-amber-800 font-medium">
            Confirmá que estás bien en tu camino para no alertar a tus contactos de emergencia.
          </p>

          <button
            onClick={() => setCheckInActive(false)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Estoy bien, continuar camino</span>
          </button>
        </div>
      )}

      {/* Progress & Current Guidance */}
      <div className="glass-panel-subtle p-3.5 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Progreso del trayecto</span>
          <span className="font-bold text-blue-600">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Turn by turn guidance */}
        <div className="flex items-start gap-2.5 mt-1 bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">
              {currentStep.text}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {currentStep.street} • Próximo punto en {currentStep.distance}
            </span>
          </div>
        </div>
      </div>

      {/* Real Emergency Guard Tools Toolbar */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="text-[11px] font-bold text-slate-700">Herramientas de Guardia Rápida:</span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          
          {/* Real Audio Siren Button */}
          <button
            onClick={toggleSiren}
            className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              isSirenOn 
                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
            }`}
          >
            {isSirenOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-600" />}
            <span className="text-[10px]">{isSirenOn ? 'Detener Sirena' : 'Sirena / Alarma'}</span>
          </button>

          {/* WhatsApp Live Location Share */}
          <a
            href={shareLinks.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px]">Compartir WhatsApp</span>
          </a>

          {/* Voice Memo Recorder */}
          <button
            onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
            className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              isRecordingAudio
                ? 'bg-red-600 text-white border-red-600 animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
            }`}
          >
            {isRecordingAudio ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
            <span className="text-[10px]">{isRecordingAudio ? 'Detener Nota' : 'Grabar Evidencia'}</span>
          </button>

        </div>

        {audioBlobUrl && (
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 text-xs flex items-center justify-between">
            <span className="font-semibold text-indigo-900">🎙️ Grabación de seguridad:</span>
            <audio src={audioBlobUrl} controls className="h-7 w-48" />
          </div>
        )}
      </div>

      {/* Simulation Controls (Deviation simulator) */}
      <div className="flex items-center justify-between gap-2 text-xs pt-1">
        <button
          onClick={() => {
            setIsOffRoute(true);
            setCheckInActive(true);
            setCheckInCountdown(15);
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-white/80 border border-slate-200 hover:bg-white text-slate-700 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
          title="Simula un desvío hacia una calle oscura para probar la reacción de la IA"
        >
          ⚡ Simular Desvío de Ruta
        </button>

        <button
          onClick={() => {
            setProgress(10);
            setIsOffRoute(false);
            setSosTriggered(false);
            emergencyAudio.stopSiren();
            setIsSirenOn(false);
          }}
          className="p-2 rounded-xl bg-white/80 border border-slate-200 hover:bg-white text-slate-500 hover:text-slate-800 transition-all shadow-2xs cursor-pointer"
          title="Reiniciar"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Big Red SOS Button */}
      <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-slate-200/80">
        <button
          onMouseDown={() => setIsHoldingSos(true)}
          onMouseUp={() => setIsHoldingSos(false)}
          onTouchStart={() => setIsHoldingSos(true)}
          onTouchEnd={() => setIsHoldingSos(false)}
          onClick={triggerFullSOS}
          className="relative w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
        >
          {isHoldingSos && (
            <div
              className="absolute inset-0 bg-white/25 transition-all"
              style={{ width: `${sosHoldProgress}%` }}
            />
          )}
          <AlertOctagon className="w-4 h-4" />
          <span>BOTÓN SOS • ACTIVAR ALERTA DE PÁNICO Y SIRENA</span>
        </button>
        <span className="text-[10px] text-slate-500 text-center font-medium">
          Emite sirena acústica disuasiva y genera aviso de auxilio inmediato.
        </span>
      </div>

    </div>
  );
};
