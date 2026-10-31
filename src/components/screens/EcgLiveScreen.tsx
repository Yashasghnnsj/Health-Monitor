import React, { useState, useEffect } from 'react';
import { TelemetryPacket } from '../../types/telemetry';
import { MedicalEcgCanvas } from '../common/MedicalEcgCanvas';
import { telemetryService } from '../../services/telemetryService';
import {
  Activity,
  Play,
  Square,
  AlertTriangle,
  Heart,
  Sliders,
  ShieldAlert,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface EcgLiveScreenProps {
  telemetry: TelemetryPacket;
}

export const EcgLiveScreen: React.FC<EcgLiveScreenProps> = ({ telemetry }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [showPlacementGuide, setShowPlacementGuide] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'diagnostic' | 'monitor'>('monitor');
  const [sqi, setSqi] = useState<number>(98);

  const isLeadOff = telemetry.lead_off_positive || telemetry.lead_off_negative || telemetryService.isLeadOff();

  // Recording timer
  useEffect(() => {
    let timer: number;
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      setRecordingSeconds(0);
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Screen 3: Live ECG Monitoring</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              AD8232 Biosensor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-lead electrocardiogram front-end for maternal cardiac rhythm acquisition
          </p>
        </div>

        {/* Lead Placement Toggle */}
        <button
          type="button"
          onClick={() => setShowPlacementGuide(!showPlacementGuide)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>{showPlacementGuide ? 'Hide Placement Guide' : 'Lead Placement (Einthoven II)'}</span>
        </button>
      </div>

      {/* Placement Guide Modal / Box */}
      {showPlacementGuide && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs space-y-2">
          <h4 className="font-bold text-emerald-400">Standard Einthoven Lead II Electrode Diagram:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-semibold text-rose-400">RA (Right Arm / Red):</span>
              <p className="text-[11px] text-slate-300 mt-1">Right infraclavicular fossa, below the right collarbone.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-semibold text-amber-400">LA (Left Arm / Yellow):</span>
              <p className="text-[11px] text-slate-300 mt-1">Left infraclavicular fossa, below the left collarbone.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-semibold text-emerald-400">RL (Right Leg / Green):</span>
              <p className="text-[11px] text-slate-300 mt-1">Right lower abdomen / hip as reference ground.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Medical ECG Canvas (Real-Time 60FPS) */}
      <MedicalEcgCanvas height={280} compact={false} />

      {/* Key Metrics Row: 6 items required by ChatGPT specification */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Live Signal Value */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">1. ECG Signal Value</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {telemetry.ecg_value !== null ? telemetry.ecg_value.toFixed(3) : '--'}
            </span>
            <span className="text-xs text-slate-500">mV</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Analog ADC 12-bit</div>
        </div>

        {/* 2. Calculated Maternal HR */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">2. Maternal Heart Rate</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {telemetry.maternal_pulse ?? '--'}
            </span>
            <span className="text-xs text-slate-500">BPM</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">QRS Pan-Tompkins Est.</div>
        </div>

        {/* 3. Signal Quality Index (SQI) */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">3. Signal Quality (SQI)</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${isLeadOff ? 'text-rose-600' : 'text-sky-600'}`}>
              {isLeadOff ? '0%' : `${sqi}%`}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {isLeadOff ? 'Electrodes Detached' : 'Low Noise (<0.02mV)'}
          </div>
        </div>

        {/* 4. Recording Duration Timer */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] text-slate-500 font-medium">4. Recording Duration</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatTimer(recordingSeconds)}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {isRecording ? 'Session in progress' : 'Standby'}
          </div>
        </div>
      </div>

      {/* Control Bar: Start / Stop Monitoring */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
            }`}
          >
            {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRecording ? 'Stop ECG Recording' : 'Start ECG Recording'}</span>
          </button>

          {isRecording && (
            <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>RECORDING TO MEMORY BUFFER</span>
            </div>
          )}
        </div>

        {/* Lead Off Simulation Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => telemetryService.setLeadOff(!isLeadOff)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isLeadOff
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isLeadOff ? 'Reconnect Leads' : 'Simulate Loose Lead'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
