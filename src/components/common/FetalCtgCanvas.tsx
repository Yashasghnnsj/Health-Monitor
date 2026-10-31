import React, { useRef, useEffect } from 'react';
import { DopplerStatus } from '../../types/telemetry';
import { HeartCrack, Radio } from 'lucide-react';

interface FetalCtgCanvasProps {
  fhrHistory: { time: string; bpm: number | null; kick?: boolean }[];
  dopplerStatus: DopplerStatus;
  currentBpm: number | null;
  height?: number;
}

export const FetalCtgCanvas: React.FC<FetalCtgCanvasProps> = ({
  fhrHistory,
  dopplerStatus,
  currentBpm,
  height = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark hospital CTG background
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Y Axis scaling: 60 BPM (bottom) to 200 BPM (top)
    const minBpm = 60;
    const maxBpm = 200;
    const getY = (bpm: number) => {
      const clamped = Math.max(minBpm, Math.min(maxBpm, bpm));
      return h - ((clamped - minBpm) / (maxBpm - minBpm)) * (h - 30) - 15;
    };

    // Draw normal clinical baseline corridor (110 - 160 BPM)
    const y160 = getY(160);
    const y110 = getY(110);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(40, y160, w - 40, y110 - y160);

    // Draw grid horizontal lines every 20 BPM
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#64748b';

    for (let bpm = 80; bpm <= 180; bpm += 20) {
      const y = getY(bpm);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      // BPM axis labels
      ctx.fillText(`${bpm}`, 10, y + 3);
    }

    // Normal zone indicator labels
    ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.fillText('160 MAX NORMAL', w - 85, y160 - 4);
    ctx.fillText('110 MIN NORMAL', w - 85, y110 + 10);

    // If Doppler disconnected or no points
    if (dopplerStatus !== 'connected' || fhrHistory.length === 0) {
      return;
    }

    // Draw CTG line
    const plotWidth = w - 50;
    const pointsCount = fhrHistory.length;
    const stepX = pointsCount > 1 ? plotWidth / (pointsCount - 1) : plotWidth;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let isDrawing = false;
    fhrHistory.forEach((pt, idx) => {
      if (pt.bpm === null) {
        isDrawing = false;
        return;
      }

      const x = 45 + idx * stepX;
      const y = getY(pt.bpm);

      if (!isDrawing) {
        ctx.moveTo(x, y);
        isDrawing = true;
      } else {
        ctx.lineTo(x, y);
      }

      // Draw fetal kick marker tick if present
      if (pt.kick) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, h - 8);
        ctx.lineTo(x, h - 22);
        ctx.stroke();
        ctx.fillText('▲ KICK', x - 12, h - 24);
        ctx.restore();
      }
    });
    ctx.stroke();

    // Draw current head point with pulse ring
    const lastValid = [...fhrHistory].reverse().find((p) => p.bpm !== null);
    if (lastValid && lastValid.bpm !== null) {
      const headX = 45 + (fhrHistory.length - 1) * stepX;
      const headY = getY(lastValid.bpm);

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(headX, headY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Current BPM pill
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(headX - 25, headY - 24, 50, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`${lastValid.bpm} BPM`, headX - 20, headY - 12);
    }
  }, [fhrHistory, dopplerStatus, height]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#080d1a]">
      <canvas ref={canvasRef} width={640} height={height} className="w-full block" />

      {dopplerStatus !== 'connected' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
          <Radio className="w-8 h-8 text-sky-400 mb-2 animate-pulse" />
          <h4 className="text-sm font-semibold text-slate-200">Waiting for Doppler data</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Fetal heart rate requires an active 2.5MHz ultrasonic Doppler transducer signal from the ESP32 node.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-sky-300 bg-sky-950/80 px-3 py-1 rounded border border-sky-800/80">
            <span>Status: Awaiting Acoustic Coupling</span>
          </div>
        </div>
      )}
    </div>
  );
};
