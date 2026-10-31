import React, { useState } from 'react';
import { SimulationScenario } from '../../types/telemetry';
import { telemetryService } from '../../services/telemetryService';
import {
  X,
  Sparkles,
  Wifi,
  Radio,
  Activity,
  Heart,
  Thermometer,
  ShieldAlert,
  PlayCircle,
  RadioTower,
  Cpu,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenario: SimulationScenario;
  onSelectScenario: (scenario: SimulationScenario) => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  isOpen,
  onClose,
  currentScenario,
  onSelectScenario,
}) => {
  const [hardwareIp, setHardwareIp] = useState<string>('ws://192.168.4.1:81');
  const [isBridged, setIsBridged] = useState<boolean>(false);

  if (!isOpen) return null;

  const scenarios: {
    id: SimulationScenario;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      id: 'normal',
      title: '1. Normal Pregnancy Baseline',
      description: 'Fetal HR ~142 BPM, Maternal Pulse 76 BPM, Temp 36.8°C, AD8232 Lead II sinus rhythm.',
      badge: 'All Sensors Reassuring',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'doppler_disconnected',
      title: '2. Doppler Disconnected / Awaiting Signal',
      description: 'Tests required requirement: displays "Waiting for Doppler data", FHR is null until ultrasound probe connects.',
      badge: 'Core Requirement Test',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'fetal_tachycardia',
      title: '3. Fetal Tachycardia (>160 BPM)',
      description: 'Elevated fetal heart rate baseline ~176 BPM. Generates obstetric advisory alert.',
      badge: 'Clinical High Alarm',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'fetal_bradycardia',
      title: '4. Fetal Bradycardia Deceleration (<110 BPM)',
      description: 'Deep deceleration down to 98 BPM on CTG trace. Triggers critical alert buzzer.',
      badge: 'Critical Deceleration',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'maternal_tachycardia',
      title: '5. Maternal Tachycardia (Pulse >120 BPM)',
      description: 'Analog pulse sensor captures elevated pulse (128 BPM). Advises left-lateral rest.',
      badge: 'Maternal Alarm',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'fever_spike',
      title: '6. Maternal Pyrexia / Fever (>38.5°C)',
      description: 'DS18B20 digital 1-Wire probe detects body temperature spike to 38.85°C.',
      badge: 'DS18B20 Threshold',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'ecg_lead_off',
      title: '7. AD8232 Lead-Off (Loose Electrode)',
      description: 'AD8232 hardware LO+ and LO- pins trip, flatlining waveform and triggering reattachment alert.',
      badge: 'Lead Detachment',
      badgeColor: 'bg-slate-200 text-slate-800',
    },
    {
      id: 'esp32_disconnected',
      title: '8. ESP32 Wi-Fi Signal Loss',
      description: 'Simulates ESP32 node battery depletion or Wi-Fi disconnection with warning banner.',
      badge: 'Connection Lost',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  const handleToggleBridge = () => {
    if (!isBridged) {
      telemetryService.connectHardwareBridge(hardwareIp);
      setIsBridged(true);
    } else {
      telemetryService.disconnectHardwareBridge();
      setIsBridged(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">ESP32 IoMT Hardware Demonstration Testbed</h3>
              <p className="text-xs text-slate-500">
                Instantly test all 8 project evaluation states without needing physical sensors
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Hardware Bridge Input */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <RadioTower className="w-4 h-4 text-sky-600" />
              <span>Real Physical ESP32 Hardware Bridge</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isBridged ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isBridged ? 'Live Hardware Active' : 'Simulator Mode'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            If testing with actual ESP32 running over Wi-Fi, enter your ESP32 WebSocket endpoint or IP:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={hardwareIp}
              onChange={(e) => setHardwareIp(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
              placeholder="ws://192.168.4.1:81"
            />
            <button
              type="button"
              onClick={handleToggleBridge}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isBridged
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isBridged ? 'Disconnect Hardware' : 'Connect Real ESP32'}
            </button>
          </div>
        </div>

        {/* Scenarios List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Demonstration Scenarios
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scenarios.map((sc) => {
              const isSelected = currentScenario === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => {
                    onSelectScenario(sc.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 shadow-xs ring-1 ring-sky-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{sc.title}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{sc.description}</p>
                  <div className="mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${sc.badgeColor}`}>
                      {sc.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Apply & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
