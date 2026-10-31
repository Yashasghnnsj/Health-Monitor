export type DopplerStatus = 'connected' | 'not_connected' | 'searching' | 'artifact';

export interface TelemetryPacket {
  device_id: string;
  timestamp: string; // ISO format or HH:mm:ss
  fetal_bpm: number | null; // null when doppler_status is not_connected
  maternal_pulse: number | null;
  temperature: number | null; // in Celsius
  ecg_value: number | null; // raw analog voltage/mV value
  doppler_status: DopplerStatus;
  lead_off_positive?: boolean; // AD8232 LO+
  lead_off_negative?: boolean; // AD8232 LO-
  signal_quality?: number; // 0 - 100%
  wifi_rssi?: number; // dBm e.g. -58
  battery_level?: number; // percentage
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  code: string;
  title: string;
  message: string;
  acknowledged: boolean;
  resolved: boolean;
  value?: string;
  recommendation?: string;
}

export interface EcgSample {
  time: number; // relative ms
  value: number; // millivolts
}

export interface FhrSample {
  time: number;
  bpm: number;
  hasKick?: boolean;
}

export interface SessionRecord {
  id: string;
  patientName: string;
  gestationalWeek: number;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  avgFetalBpm: number | null;
  minFetalBpm: number | null;
  maxFetalBpm: number | null;
  avgMaternalPulse: number;
  avgTemperature: number;
  status: 'normal' | 'observation' | 'critical';
  notes: string;
  fhrPoints: { time: string; bpm: number }[];
  ecgStripSnippet: number[];
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'doctor' | 'patient';
  email: string;
  gestationalWeek: number;
  hospital: string;
  assignedDoctor: string;
  patientId: string;
  emergencyContact: string;
}

export interface DeviceConfig {
  deviceId: string;
  wifiSSID: string;
  ipAddress: string;
  mqttBroker: string;
  mqttTopic: string;
  samplingIntervalMs: number;
  ecgGain: number; // 0.5, 1.0, 2.0
  sweepSpeed: number; // 12.5, 25, 50 mm/s
  feverThreshold: number; // default 37.5 C
  fetalHighThreshold: number; // default 160 BPM
  fetalLowThreshold: number; // default 110 BPM
  maternalHighThreshold: number; // default 100 BPM
  maternalLowThreshold: number; // default 55 BPM
  isLiveHardwareBridge: boolean;
  hardwareEndpointUrl: string;
}

export type SimulationScenario = 
  | 'normal'
  | 'doppler_disconnected'
  | 'fetal_tachycardia'
  | 'fetal_bradycardia'
  | 'maternal_tachycardia'
  | 'fever_spike'
  | 'ecg_lead_off'
  | 'esp32_disconnected';
