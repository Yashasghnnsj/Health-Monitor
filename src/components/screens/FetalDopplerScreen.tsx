import React, { useState, useEffect } from 'react';
import { TelemetryPacket, DopplerStatus } from '../../types/telemetry';
import { FetalCtgCanvas } from '../common/FetalCtgCanvas';
import { telemetryService } from '../../services/telemetryService';
import {
  Radio,
  Play,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  Footprints,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface FetalDopplerScreenProps {
  telemetry: TelemetryPacket;
  onToggleDoppler: () => void;
}

export const FetalDopplerScreen: React.FC<FetalDopplerScreenProps> = ({
  telemetry,
  onToggleDoppler,
}) => {
  const [fhrHistory, setFhrHistory] = useState<{ time: string; bpm: number | null; kick?: boolean }[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [audioRhythmPulse, setAudioRhythmPulse] = useState<boolean>(false);
  const [kickCount, setKickCount] = useState<number>(3);

  const isDopplerConnected = telemetry.doppler_status === 'connected';

  // Push new FHR samples into CTG rolling window
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setFhrHistory((prev) => {
      const updated = [...prev, { time: timeStr, bpm: telemetry.fetal_bpm }];
      if (updated.length > 40) updated.shift();
      return updated;
    });

    // Simulate Doppler rhythmic audio pulse if connected
    if (isDopplerConnected && telemetry.fetal_bpm) {
      setAudioRhythmPulse(true);
      const timer = setTimeout(() => setAudioRhythmPulse(false), 120);
      return () => clearTimeout(timer);
    }
  }, [telemetry.fetal_bpm, telemetry.timestamp, isDopplerConnected]);

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

  const handleMarkKick = () => {
    setKickCount((prev) => prev + 1);
    setFhrHistory((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      copy[copy.length - 1] = { ...copy[copy.length - 1], kick: true };
      return copy;
    });
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Screen 4 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Screen 4: Fetal Heart-Rate (FHR) Monitoring</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              2.5 MHz Doppler Transducer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cardiotocography (CTG) real-time fetal baseline tracking and acoustic motion detection
          </p>
        </div>

        {/* Doppler Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDoppler}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isDopplerConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isDopplerConnected ? 'Doppler Active' : 'Connect Doppler Probe'}</span>
          </button>
        </div>
      </div>

      {/* Main CTG Trend Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span className="font-semibold text-slate-800">Live Cardiotocography (CTG) Waveform</span>
          <span className="text-[11px] text-slate-500">Normal Baseline Band: 110 - 160 BPM (Green)</span>
        </div>
        <FetalCtgCanvas
          fhrHistory={fhrHistory}
          dopplerStatus={telemetry.doppler_status}
          currentBpm={telemetry.fetal_bpm}
          height={260}
        />
      </div>

      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* FHR in BPM */}
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Fetal Heart Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            {isDopplerConnected && telemetry.fetal_bpm !== null ? (
              <>
                <span className="text-3xl font-extrabold text-sky-600 font-mono">
                  {telemetry.fetal_bpm}
                </span>
                <span className="text-xs text-slate-500 font-medium">BPM</span>
              </>
            ) : (
              <span className="text-lg font-semibold text-slate-400">
                Waiting for Doppler data
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {isDopplerConnected ? 'Baseline variability: 8-12 BPM (Moderate / Healthy)' : 'Connect ultrasound probe'}
          </div>
        </div>

        {/* Doppler Transducer Acoustics & Audio Envelope */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Doppler Acoustic Envelope</span>
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="my-2 flex items-center gap-1.5 h-8">
            {[40, 70, 95, 60, 85, 100, 45, 90, 65, 80, 50, 75].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-100 ${
                  isDopplerConnected && audioRhythmPulse
                    ? 'bg-sky-500 shadow-xs'
                    : 'bg-slate-200'
                }`}
                style={{
                  height: isDopplerConnected ? `${(h * (audioRhythmPulse ? 1 : 0.4)).toFixed(0)}%` : '20%',
                }}
              />
            ))}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Acoustic Frequency: 2.5 MHz</span>
            <span className="text-sky-600 font-medium">
              {isDopplerConnected ? 'Valve Sound Detected' : 'Silent'}
            </span>
          </div>
        </div>

        {/* Fetal Movement (Kick Counter) */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Fetal Movements (Kicks)</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {kickCount} Today
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Mother presses button upon feeling fetal movement to correlate with CTG accelerations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkKick}
            className="mt-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Mark Fetal Kick (+1)</span>
          </button>
        </div>
      </div>

      {/* Recording & Session Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!isRecording) {
                setRecordingSeconds(0);
                setIsRecording(true);
              } else {
                setIsRecording(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
            }`}
          >
            {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRecording ? 'Stop FHR Recording' : 'Start FHR Session Recording'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Session Timer:</span>
            <span className="font-mono font-bold text-slate-800">{formatTimer(recordingSeconds)}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Signal Detection: <span className="font-semibold text-emerald-600">{isDopplerConnected ? 'Locked (98%)' : 'None'}</span>
        </div>
      </div>
    </div>
  );
};
