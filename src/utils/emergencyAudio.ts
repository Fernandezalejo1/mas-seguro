// Real Web Audio API Siren & Sound Synthesizer for Emergency SOS
class EmergencyAudioManager {
  private audioCtx: AudioContext | null = null;
  private isSirenPlaying = false;
  private oscillator: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playBeep(freq = 880, durationMs = 200) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio playBeep error:', e);
    }
  }

  public startSiren() {
    if (this.isSirenPlaying) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.isSirenPlaying = true;

      // Main tone generator
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(900, this.audioCtx.currentTime);

      // Low frequency oscillator for pitch modulation (warble effect)
      this.lfo = this.audioCtx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(3, this.audioCtx.currentTime); // 3 Hz modulation

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(350, this.audioCtx.currentTime); // modulate pitch by +-350Hz

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.oscillator.frequency);

      // Master gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator.start();
      this.lfo.start();
    } catch (e) {
      console.warn('Audio startSiren error:', e);
    }
  }

  public stopSiren() {
    if (!this.isSirenPlaying) return;
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
        this.lfo = null;
      }
      this.isSirenPlaying = false;
    } catch (e) {
      console.warn('Audio stopSiren error:', e);
      this.isSirenPlaying = false;
    }
  }

  public isPlaying(): boolean {
    return this.isSirenPlaying;
  }
}

export const emergencyAudio = new EmergencyAudioManager();

// Helper to construct WhatsApp and SMS emergency links
export function generateEmergencyShareLinks(opts: {
  lat: number;
  lng: number;
  streetName?: string;
  neighborhood?: string;
  batteryLevel?: number;
  emergencyContactPhone?: string;
}) {
  const mapUrl = `https://maps.google.com/?q=${opts.lat.toFixed(6)},${opts.lng.toFixed(6)}`;
  const time = new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  const text = `🚨 *ALERTA SOS - MÁS SEGURO MONTEVIDEO*
Necesito asistencia urgente. Me encuentro en:
📍 *${opts.streetName || 'Montevideo'}* (${opts.neighborhood || 'Montevideo'})
🗺️ Ver mapa en vivo: ${mapUrl}
⏰ Hora: ${time}
🔋 Batería: ${opts.batteryLevel ?? 80}%
Por favor contáctame o llama al 911 si no respondo en los próximos minutos.`;

  const encodedText = encodeURIComponent(text);
  const waUrl = opts.emergencyContactPhone 
    ? `https://wa.me/${opts.emergencyContactPhone.replace(/\D/g, '')}?text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  const smsUrl = `sms:${opts.emergencyContactPhone ? opts.emergencyContactPhone.replace(/\D/g, '') : ''}?body=${encodedText}`;

  return { text, mapUrl, waUrl, smsUrl };
}
