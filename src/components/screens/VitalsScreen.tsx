import React, { useState, useEffect } from 'react';
import { TelemetryPacket } from '../../types/telemetry';
import {
  Thermometer,
  Heart,
  Activity,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface VitalsScreenProps {
  telemetry: TelemetryPacket;
}

export const VitalsScreen: React.FC<VitalsScreenProps> = ({ telemetry }) => {
  const [pulseHistory, setPulseHistory] = useState<number[]>([74, 76, 75, 78, 77, 76, 79, 78, 76]);
  const [tempHistory, setTempHistory] = useState<number[]>([36.75, 36.78, 36.80, 36.81, 36.82, 36.80, 36.84]);

  useEffect(() => {
    if (telemetry.maternal_pulse !== null) {
      setPulseHistory((prev) => {
        const copy = [...prev, telemetry.maternal_pulse!];
        if (copy.length > 20) copy.shift();
        return copy;
      });
    }

    if (telemetry.temperature !== null) {
      setTempHistory((prev) => {
        const copy = [...prev, telemetry.temperature!];
        if (copy.length > 20) copy.shift();
        return copy;
      });
    }
  }, [telemetry.maternal_pulse, telemetry.temperature, telemetry.timestamp]);

  const isFever = telemetry.temperature !== null && telemetry.temperature > 37.5;
  const isTachycardia = telemetry.maternal_pulse !== null && telemetry.maternal_pulse > 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">Screen 5: Temperature & Pulse Monitoring</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
            DS18B20 & Pulse Sensor
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Peripheral pulse plethysmogram and Dallas 1-Wire high-precision clinical temperature telemetry
        </p>
      </div>

      {/* Two Main Vital Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: DS18B20 Body Temperature */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">DS18B20 Digital Temperature</h3>
                <p className="text-[11px] text-slate-500">1-Wire Bus · GPIO 15 (4.7kΩ pull-up)</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700">
              Sensor Online
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">
                  {telemetry.temperature !== null ? telemetry.temperature.toFixed(2) : '--'}
                </span>
                <span className="text-sm font-semibold text-slate-500">°C</span>
                <span className="text-xs text-slate-400 ml-1">
                  ({telemetry.temperature ? (telemetry.temperature * 1.8 + 32).toFixed(1) : '--'}°F)
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Resolution: 12-bit (0.0625°C step)
              </div>
            </div>

            <div
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                isFever ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isFever ? 'Fever Warning (>37.5°C)' : 'Normal (36.5 - 37.5°C)'}
            </div>
          </div>

          {/* SVG Trend Sparkline */}
          <div className="pt-2">
            <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
              <span>Rolling Temperature Trend</span>
              <span>Last 20 updates</span>
            </div>
            <div className="h-20 bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-end gap-1">
              {tempHistory.map((t, idx) => {
                const min = 36.0;
                const max = 39.0;
                const pct = Math.max(10, Math.min(100, ((t - min) / (max - min)) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        t > 37.5 ? 'bg-rose-500' : 'bg-orange-400'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Analog Pulse Sensor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Heart className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Analog Pulse Sensor</h3>
                <p className="text-[11px] text-slate-500">Photoplethysmography (PPG) · GPIO 35</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700">
              Sensor Online
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">
                  {telemetry.maternal_pulse ?? '--'}
                </span>
                <span className="text-sm font-semibold text-slate-500">BPM</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Peripheral Pulse Wave
              </div>
            </div>

            <div
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                isTachycardia ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isTachycardia ? 'Elevated Pulse (>100 BPM)' : 'Resting Baseline (60 - 100)'}
            </div>
          </div>

          {/* SVG Pulse Sparkline */}
          <div className="pt-2">
            <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
              <span>Rolling Pulse Trend</span>
              <span>Last 20 updates</span>
            </div>
            <div className="h-20 bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-end gap-1">
              {pulseHistory.map((p, idx) => {
                const min = 50;
                const max = 130;
                const pct = Math.max(10, Math.min(100, ((p - min) / (max - min)) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        p > 100 ? 'bg-rose-500' : 'bg-rose-400'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Note per Prompt Specifications */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold">Hardware Engineering Note:</span> The analog pulse sensor utilized in this prototype measures peripheral pulse rate via optical photoplethysmography (PPG). It does not measure blood oxygen saturation (SpO2), which would require a dual-wavelength red/infrared optical sensor (such as MAX30102).
        </p>
      </div>
    </div>
  );
};
