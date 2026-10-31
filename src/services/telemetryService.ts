import { TelemetryPacket, SimulationScenario, DopplerStatus } from '../types/telemetry';

type Listener = (packet: TelemetryPacket) => void;
type EcgListener = (value: number, time: number) => void;

class TelemetryService {
  private packetListeners: Set<Listener> = new Set();
  private ecgListeners: Set<EcgListener> = new Set();
  private intervalId: number | null = null;
  private ecgIntervalId: number | null = null;
  private scenario: SimulationScenario = 'normal';
  private customFetalBpm: number | null = 142;
  private customMaternalPulse: number = 76;
  private customTemp: number = 36.8;
  private dopplerConnected: boolean = true;
  private espConnected: boolean = true;
  private leadOff: boolean = false;
  private samplingRateMs: number = 500;
  private isLiveHardwareBridge: boolean = false;
  private hardwareBridgeUrl: string = '';
  private hardwareWs: WebSocket | null = null;

  // ECG generation internal state
  private ecgPhase: number = 0;
  private ecgSampleIndex: number = 0;
  private lastPacket: TelemetryPacket | null = null;

  constructor() {
    this.startSimulation();
  }

  public setScenario(scenario: SimulationScenario) {
    this.scenario = scenario;
    if (scenario === 'doppler_disconnected') {
      this.dopplerConnected = false;
    } else {
      this.dopplerConnected = true;
    }

    if (scenario === 'ecg_lead_off') {
      this.leadOff = true;
    } else {
      this.leadOff = false;
    }

    if (scenario === 'esp32_disconnected') {
      this.espConnected = false;
    } else {
      this.espConnected = true;
    }
  }

  public getScenario(): SimulationScenario {
    return this.scenario;
  }

  public setDopplerConnected(connected: boolean) {
    this.dopplerConnected = connected;
    if (!connected && this.scenario === 'normal') {
      this.scenario = 'doppler_disconnected';
    }
  }

  public isDopplerConnected(): boolean {
    return this.dopplerConnected && this.espConnected;
  }

  public setEspConnected(connected: boolean) {
    this.espConnected = connected;
    if (!connected) {
      this.scenario = 'esp32_disconnected';
    } else if (this.scenario === 'esp32_disconnected') {
      this.scenario = 'normal';
    }
  }

  public isEspConnected(): boolean {
    return this.espConnected;
  }

  public setLeadOff(leadOff: boolean) {
    this.leadOff = leadOff;
  }

  public isLeadOff(): boolean {
    return this.leadOff;
  }

  public setSamplingRate(ms: number) {
    this.samplingRateMs = Math.max(100, Math.min(2000, ms));
    this.restartTelemetryLoop();
  }

  public subscribe(listener: Listener): () => void {
    this.packetListeners.add(listener);
    if (this.lastPacket) {
      listener(this.lastPacket);
    }
    return () => this.packetListeners.delete(listener);
  }

  public subscribeEcg(listener: EcgListener): () => void {
    this.ecgListeners.add(listener);
    return () => this.ecgListeners.delete(listener);
  }

  private startSimulation() {
    this.restartTelemetryLoop();
    this.startEcgHighFrequencyLoop();
  }

  private restartTelemetryLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = window.setInterval(() => {
      this.emitTelemetryPacket();
    }, this.samplingRateMs);
  }

  // 60Hz - 100Hz high-resolution ECG loop for ultra-smooth waveform animation
  private startEcgHighFrequencyLoop() {
    if (this.ecgIntervalId) {
      clearInterval(this.ecgIntervalId);
    }
    // ~16ms for 60Hz sampling
    this.ecgIntervalId = window.setInterval(() => {
      if (!this.espConnected || this.leadOff) {
        // Flatline with minimal noise
        const flatVal = (Math.random() - 0.5) * 0.04;
        this.ecgListeners.forEach(l => l(flatVal, performance.now()));
        return;
      }

      const maternalHr = this.getCalculatedMaternalHr();
      const periodSamples = (60 / maternalHr) * 60; // samples per beat at 60Hz
      this.ecgPhase = (this.ecgSampleIndex % Math.floor(periodSamples)) / periodSamples;
      this.ecgSampleIndex++;

      const val = this.generateEcgValue(this.ecgPhase);
      const noise = (Math.random() - 0.5) * 0.02;
      this.ecgListeners.forEach(l => l(val + noise, performance.now()));
    }, 16);
  }

  private getCalculatedMaternalHr(): number {
    if (this.scenario === 'maternal_tachycardia') return 128;
    return this.customMaternalPulse + Math.sin(this.ecgSampleIndex * 0.05) * 2;
  }

  // Generate realistic P-Q-R-S-T complex
  private generateEcgValue(phase: number): number {
    // phase goes 0 -> 1 over 1 cardiac cycle
    // Baseline is 0 mV
    let val = 0;

    // P-wave (at phase 0.15 - 0.25)
    if (phase >= 0.12 && phase <= 0.22) {
      const pPhase = (phase - 0.17) / 0.05;
      val += 0.18 * Math.exp(-pPhase * pPhase * 4);
    }

    // Q-wave (at phase 0.32)
    if (phase >= 0.30 && phase <= 0.33) {
      const qPhase = (phase - 0.32) / 0.015;
      val -= 0.16 * Math.exp(-qPhase * qPhase * 4);
    }

    // R-wave sharp high peak (at phase 0.35)
    if (phase >= 0.33 && phase <= 0.38) {
      const rPhase = (phase - 0.355) / 0.018;
      val += 1.45 * Math.exp(-rPhase * rPhase * 6);
    }

    // S-wave sharp dip (at phase 0.39)
    if (phase >= 0.37 && phase <= 0.42) {
      const sPhase = (phase - 0.395) / 0.02;
      val -= 0.32 * Math.exp(-sPhase * sPhase * 4);
    }

    // T-wave (at phase 0.55 - 0.70)
    if (phase >= 0.52 && phase <= 0.72) {
      const tPhase = (phase - 0.62) / 0.08;
      val += 0.32 * Math.exp(-tPhase * tPhase * 4);
    }

    // Baseline wander simulation (respiratory sinus effect)
    val += Math.sin(this.ecgSampleIndex * 0.01) * 0.03;

    return val;
  }

  private emitTelemetryPacket() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    if (!this.espConnected) {
      const offlinePacket: TelemetryPacket = {
        device_id: 'ESP32_FETAL_01',
        timestamp: timeStr,
        fetal_bpm: null,
        maternal_pulse: null,
        temperature: null,
        ecg_value: null,
        doppler_status: 'not_connected',
        lead_off_positive: false,
        lead_off_negative: false,
        signal_quality: 0,
        wifi_rssi: 0,
        battery_level: 0,
      };
      this.lastPacket = offlinePacket;
      this.packetListeners.forEach(l => l(offlinePacket));
      return;
    }

    // Calculate Fetal Heart Rate according to rules
    let fetalBpm: number | null = null;
    let dopplerStatus: DopplerStatus = 'not_connected';

    if (this.dopplerConnected && this.scenario !== 'doppler_disconnected') {
      dopplerStatus = 'connected';
      let baseFhr = 142;
      if (this.scenario === 'fetal_tachycardia') {
        baseFhr = 176;
      } else if (this.scenario === 'fetal_bradycardia') {
        baseFhr = 98;
      }
      // Natural micro-fluctuation in CTG baseline
      const jitter = (Math.random() - 0.5) * 4 + Math.sin(Date.now() / 3000) * 3;
      fetalBpm = Math.round(baseFhr + jitter);
    } else {
      // Must be null when doppler is not connected!
      fetalBpm = null;
      dopplerStatus = 'not_connected';
    }

    // Calculate Maternal Pulse (Analog Pulse Sensor)
    let maternalPulse: number | null = this.customMaternalPulse;
    if (this.scenario === 'maternal_tachycardia') {
      maternalPulse = Math.round(124 + (Math.random() - 0.5) * 4);
    } else {
      maternalPulse = Math.round(76 + Math.sin(Date.now() / 4000) * 3 + (Math.random() - 0.5) * 2);
    }

    // Calculate Temperature (DS18B20 digital 1-Wire)
    let temperature: number | null = this.customTemp;
    if (this.scenario === 'fever_spike') {
      temperature = parseFloat((38.85 + Math.sin(Date.now() / 6000) * 0.15).toFixed(2));
    } else {
      temperature = parseFloat((36.78 + Math.sin(Date.now() / 10000) * 0.08).toFixed(2));
    }

    const currentEcg = this.leadOff ? 0 : this.generateEcgValue(this.ecgPhase);
    const signalQuality = this.leadOff ? 12 : (this.dopplerConnected ? 96 : 84);

    const packet: TelemetryPacket = {
      device_id: 'ESP32_FETAL_01',
      timestamp: timeStr,
      fetal_bpm: fetalBpm,
      maternal_pulse: maternalPulse,
      temperature: temperature,
      ecg_value: parseFloat(currentEcg.toFixed(3)),
      doppler_status: dopplerStatus,
      lead_off_positive: this.leadOff,
      lead_off_negative: this.leadOff,
      signal_quality: signalQuality,
      wifi_rssi: -58 + Math.floor((Math.random() - 0.5) * 6),
      battery_level: 92,
    };

    this.lastPacket = packet;
    this.packetListeners.forEach(l => l(packet));
  }

  // Real Hardware Bridge setup
  public connectHardwareBridge(wsUrl: string) {
    this.hardwareBridgeUrl = wsUrl;
    this.isLiveHardwareBridge = true;
    try {
      if (this.hardwareWs) {
        this.hardwareWs.close();
      }
      this.hardwareWs = new WebSocket(wsUrl);
      this.hardwareWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.device_id) {
            this.lastPacket = data;
            this.packetListeners.forEach(l => l(data));
          }
        } catch (e) {
          console.warn('Failed parsing hardware packet', e);
        }
      };
      this.hardwareWs.onerror = () => {
        console.warn('Hardware WebSocket error, falling back to simulator');
      };
    } catch (err) {
      console.warn('Could not connect to hardware bridge', err);
    }
  }

  public disconnectHardwareBridge() {
    this.isLiveHardwareBridge = false;
    if (this.hardwareWs) {
      this.hardwareWs.close();
      this.hardwareWs = null;
    }
  }
}

export const telemetryService = new TelemetryService();
