import React, { useState } from 'react';
import { DeviceConfig, TelemetryPacket, UserProfile } from '../../types/telemetry';
import { telemetryService } from '../../services/telemetryService';
import {
  Settings,
  Cpu,
  Wifi,
  Database,
  Sliders,
  User,
  LogOut,
  Save,
  CheckCircle2,
  RefreshCw,
  Copy,
  Radio,
  Clock,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface SettingsScreenProps {
  telemetry: TelemetryPacket;
  user: UserProfile;
  config: DeviceConfig;
  onUpdateConfig: (newConfig: DeviceConfig) => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  telemetry,
  user,
  config,
  onUpdateConfig,
  onLogout,
}) => {
  const [localConfig, setLocalConfig] = useState<DeviceConfig>(config);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    telemetryService.setSamplingRate(localConfig.samplingIntervalMs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(telemetry, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Screen 8: Settings & Device Information</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              IoMT Node Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardware transceiver settings, MQTT telemetry broker, and clinical alert thresholds
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer w-fit"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect / Logout</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Device configuration and sampling frequency successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Device Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Cpu className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              ESP32 Microcontroller Hardware Status
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">ESP32 Device ID</span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                {localConfig.deviceId}
              </div>
              <div className="text-[10px] text-slate-400">Firmware v2.4.1-IoMT</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">Wi-Fi Network (SSID)</span>
              <div className="font-semibold text-slate-900 text-sm mt-0.5 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>{localConfig.wifiSSID}</span>
              </div>
              <div className="text-[10px] text-slate-400">RSSI: {telemetry.wifi_rssi ?? -58} dBm</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">Assigned Local IP</span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                {localConfig.ipAddress}
              </div>
              <div className="text-[10px] text-slate-400">Subnet 255.255.255.0</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px]">Sensors Connected</span>
              <div className="font-bold text-emerald-700 text-sm mt-0.5">
                4 of 4 Active
              </div>
              <div className="text-[10px] text-slate-400">ECG · Doppler · Pulse · Temp</div>
            </div>
          </div>
        </div>

        {/* Live ESP32 JSON Telemetry Inspector (Spec Section 4) */}
        <div className="bg-[#0b1320] rounded-2xl border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                Live ESP32 JSON Telemetry Stream (Spec Section 4)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedPayload ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Matches exact ESP32 JSON contract. Note: `fetal_bpm` is strictly `null` when Doppler is disconnected.
          </p>
          <pre className="p-3 bg-black/60 rounded-xl text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {JSON.stringify(telemetry, null, 2)}
          </pre>
        </div>

        {/* Communication & MQTT Broker Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              MQTT Broker & Telemetry Transmission
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                MQTT Broker Host & Port
              </label>
              <input
                type="text"
                value={localConfig.mqttBroker}
                onChange={(e) => setLocalConfig({ ...localConfig, mqttBroker: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                placeholder="broker.hivemq.com:8884/mqtt"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                MQTT Pub/Sub Topic
              </label>
              <input
                type="text"
                value={localConfig.mqttTopic}
                onChange={(e) => setLocalConfig({ ...localConfig, mqttTopic: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                placeholder="iomt/fetal/telemetry"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Monitoring Frequency: {localConfig.samplingIntervalMs} ms ({Math.round(1000 / localConfig.samplingIntervalMs)} Hz)
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={localConfig.samplingIntervalMs}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, samplingIntervalMs: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>100ms (High Speed)</span>
                <span>500ms (Standard)</span>
                <span>2000ms (Low Power)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fever Alarm Threshold (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={localConfig.feverThreshold}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, feverThreshold: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* User Profile & Hospital Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Patient Profile & Obstetric Care Team
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Patient:</span>{' '}
              <span className="font-semibold text-slate-900">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Gestational Week:</span>{' '}
              <span className="font-semibold text-slate-900">{user.gestationalWeek} Weeks</span>
            </div>
            <div>
              <span className="text-slate-500">Supervising Physician:</span>{' '}
              <span className="font-semibold text-slate-900">{user.assignedDoctor}</span>
            </div>
            <div>
              <span className="text-slate-500">Care Center:</span>{' '}
              <span className="font-semibold text-slate-900">{user.hospital}</span>
            </div>
            <div>
              <span className="text-slate-500">Emergency Contact:</span>{' '}
              <span className="font-semibold text-slate-900">{user.emergencyContact}</span>
            </div>
            <div>
              <span className="text-slate-500">Date & System Clock:</span>{' '}
              <span className="font-semibold text-slate-900">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Device Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
