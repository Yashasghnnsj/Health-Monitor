import React from 'react';
import { TelemetryPacket, UserProfile } from '../../types/telemetry';
import { MedicalEcgCanvas } from '../common/MedicalEcgCanvas';
import {
  Heart,
  Activity,
  Thermometer,
  Wifi,
  WifiOff,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  PhoneCall,
  CheckCircle2,
  Stethoscope,
  Info,
} from 'lucide-react';

interface DashboardScreenProps {
  telemetry: TelemetryPacket;
  user: UserProfile;
  onNavigate: (tab: 'home' | 'live' | 'history' | 'alerts' | 'settings', subTab?: 'ecg' | 'fetal' | 'vitals') => void;
  onToggleDoppler: () => void;
  onOpenSimulator: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  telemetry,
  user,
  onNavigate,
  onToggleDoppler,
  onOpenSimulator,
}) => {
  const isEspConnected = telemetry.device_id && telemetry.wifi_rssi !== 0;
  const isDopplerConnected = telemetry.doppler_status === 'connected';

  // Fetal HR evaluation
  const getFetalStatus = () => {
    if (!isDopplerConnected || telemetry.fetal_bpm === null) {
      return { text: 'Awaiting Doppler data', color: 'text-slate-500', bg: 'bg-slate-100' };
    }
    if (telemetry.fetal_bpm < 110) {
      return { text: 'Bradycardia (<110 BPM)', color: 'text-amber-700', bg: 'bg-amber-50' };
    }
    if (telemetry.fetal_bpm > 160) {
      return { text: 'Tachycardia (>160 BPM)', color: 'text-rose-700', bg: 'bg-rose-50' };
    }
    return { text: 'Normal Baseline (110 - 160)', color: 'text-emerald-700', bg: 'bg-emerald-50' };
  };

  const fetalStatus = getFetalStatus();

  return (
    <div className="space-y-4">
      {/* Patient / Session Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              Week {user.gestationalWeek}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              · ID: {user.patientId}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Attending: {user.assignedDoctor} · {user.hospital}
          </p>
        </div>

        {/* ESP32 Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
            {isEspConnected ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-700">{telemetry.device_id}</span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-600 font-medium">Connected</span>
                <span className="text-slate-400 text-[10px]">({telemetry.wifi_rssi} dBm)</span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span className="font-semibold text-slate-700">{telemetry.device_id}</span>
                <span className="text-slate-400">·</span>
                <span className="text-rose-600 font-medium">Disconnected</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Testbed</span>
          </button>
        </div>
      </div>

      {/* Main 4 Parameter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: Fetal Heart Rate (Most Important) */}
        <div
          onClick={() => onNavigate('live', 'fetal')}
          className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Fetal Heart Rate
                </h3>
                <p className="text-[11px] text-slate-500">2.5MHz Ultrasonic Doppler</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>

          {/* Primary Value Display */}
          <div className="mt-4 flex items-baseline justify-between">
            {isDopplerConnected && telemetry.fetal_bpm !== null ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {telemetry.fetal_bpm}
                </span>
                <span className="text-sm font-semibold text-slate-500">BPM</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-400 font-mono">--</span>
                <span className="text-xs text-slate-400">BPM</span>
              </div>
            )}

            <div className={`text-xs font-medium px-2.5 py-1 rounded-lg ${fetalStatus.bg} ${fetalStatus.color}`}>
              {fetalStatus.text}
            </div>
          </div>

          {/* Diagnostic Details */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isDopplerConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Probe: {isDopplerConnected ? 'Connected & Detecting' : 'Waiting for Doppler data'}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleDoppler();
              }}
              className="text-[11px] text-sky-600 hover:text-sky-700 font-medium underline cursor-pointer"
            >
              {isDopplerConnected ? 'Disconnect' : 'Connect Doppler'}
            </button>
          </div>
        </div>

        {/* CARD 2: Maternal ECG Live Waveform Card */}
        <div
          onClick={() => onNavigate('live', 'ecg')}
          className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Maternal ECG
                </h3>
                <p className="text-[11px] text-slate-500">AD8232 Lead II Analog Stream</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>

          {/* Mini Real-Time Waveform */}
          <div className="mt-3 overflow-hidden rounded-xl">
            <MedicalEcgCanvas height={90} compact={true} />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standard 25mm/s · Gain 1.0x</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lead II Active</span>
            </span>
          </div>
        </div>

        {/* CARD 3: Maternal Pulse Rate */}
        <div
          onClick={() => onNavigate('live', 'vitals')}
          className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Heart className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Maternal Pulse Rate
                </h3>
                <p className="text-[11px] text-slate-500">Analog Photoplethysmogram</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            {telemetry.maternal_pulse !== null ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {telemetry.maternal_pulse}
                </span>
                <span className="text-sm font-semibold text-slate-500">BPM</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-400 font-mono">--</span>
                <span className="text-xs text-slate-400">BPM</span>
              </div>
            )}

            <div className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              Resting Range (60 - 100)
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pulse Sensor (Analog A0/GPIO35)</span>
            <span className="text-slate-600">Rhythm: Regular Sinus</span>
          </div>
        </div>

        {/* CARD 4: Body Temperature */}
        <div
          onClick={() => onNavigate('live', 'vitals')}
          className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Body Temperature
                </h3>
                <p className="text-[11px] text-slate-500">DS18B20 1-Wire Digital Probe</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            {telemetry.temperature !== null ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {telemetry.temperature}
                </span>
                <span className="text-sm font-semibold text-slate-500">°C</span>
                <span className="text-xs text-slate-400 ml-1">
                  ({(telemetry.temperature * 1.8 + 32).toFixed(1)}°F)
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-400 font-mono">--</span>
                <span className="text-xs text-slate-400">°C</span>
              </div>
            )}

            <div
              className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                telemetry.temperature && telemetry.temperature > 37.5
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {telemetry.temperature && telemetry.temperature > 37.5 ? 'Elevated (Fever)' : 'Normothermic'}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>DS18B20 Resolution: 12-bit (0.0625°C)</span>
            <span>Threshold: &lt; 37.5°C</span>
          </div>
        </div>
      </div>

      {/* Quick Status Bar: Telemetry Timestamp & Emergency Hotline */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-slate-900 text-white rounded-2xl gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Last ESP32 Telemetry Update:</span>
          <span className="font-mono text-emerald-400 font-semibold">{telemetry.timestamp}</span>
          <span className="text-slate-400 hidden sm:inline">| Auto-refreshing 500ms</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:911"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Maternal Emergency Call</span>
          </a>
        </div>
      </div>

      {/* Clinical Guidance Notice per Prompt */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-slate-700">IoMT Biomedical Prototype:</span> Telemetry signals are acquired via ESP32 ADC and 1-Wire bus. Doppler FHR reading requires verified acoustic coupler connection. Clinical diagnosis and interpretation require licensed obstetric evaluation.
        </p>
      </div>
    </div>
  );
};
