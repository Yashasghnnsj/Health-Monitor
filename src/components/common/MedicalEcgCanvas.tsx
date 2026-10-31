import React, { useRef, useEffect, useState } from 'react';
import { telemetryService } from '../../services/telemetryService';
import { Activity, Play, Pause, RefreshCw, ZoomIn, Eye, AlertTriangle } from 'lucide-react';

interface EcgCanvasProps {
  height?: number;
  sweepSpeed?: number; // 25mm/s standard
  gain?: number; // 1.0 standard (10mm/mV)
  compact?: boolean;
  onFreezeChange?: (frozen: boolean) => void;
}

export const MedicalEcgCanvas: React.FC<EcgCanvasProps> = ({
  height = 240,
  sweepSpeed = 25,
  gain = 1.0,
  compact = false,
  onFreezeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [leadOff, setLeadOff] = useState<boolean>(false);
  const [currentMv, setCurrentMv] = useState<number>(0);
  const [selectedGain, setSelectedGain] = useState<number>(gain);
  const [caliperMode, setCaliperMode] = useState<boolean>(false);
  const [caliperPoints, setCaliperPoints] = useState<{ x1: number | null; x2: number | null }>({ x1: null, x2: null });

  // Circular buffer for continuous sweep
  const bufferRef = useRef<number[]>([]);
  const cursorRef = useRef<number>(0);
  const isFrozenRef = useRef<boolean>(false);
  isFrozenRef.current = isFrozen;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize buffer matching canvas pixel width
    const width = canvas.width;
    bufferRef.current = new Array(width).fill(0);
    cursorRef.current = 0;

    const unsubscribe = telemetryService.subscribeEcg((mv) => {
      setCurrentMv(mv);
      setLeadOff(telemetryService.isLeadOff() || !telemetryService.isEspConnected());

      if (isFrozenRef.current) return;

      const buf = bufferRef.current;
      const c = cursorRef.current;
      buf[c] = mv;
      cursorRef.current = (c + 1) % width;
    });

    let animationFrameId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGridAndWave(ctx, canvas.width, canvas.height);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      unsubscribe();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const drawGridAndWave = (ctx: CanvasRenderingContext2D, width: number, h: number) => {
    // 1. Dark medical monitor background
    ctx.fillStyle = '#0b1320';
    ctx.fillRect(0, 0, width, h);

    // 2. Draw standard clinical ECG grid:
    // Minor grid (1mm ~ 4px), Major grid (5mm ~ 20px)
    const gridSize = 20; // 5mm box
    const subGrid = 4;   // 1mm box

    // Subtle 1mm minor lines
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += subGrid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += subGrid) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 5mm major lines
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Standard baseline zero line
    const centerY = h * 0.55;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Standard 1mV calibration pulse in top-left
    if (!compact) {
      const pulseH = 30 * selectedGain;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(10, centerY);
      ctx.lineTo(15, centerY);
      ctx.lineTo(15, centerY - pulseH);
      ctx.lineTo(25, centerY - pulseH);
      ctx.lineTo(25, centerY);
      ctx.lineTo(30, centerY);
      ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '9px monospace';
      ctx.fillText('1mV CAL', 10, centerY - pulseH - 4);
    }

    const buf = bufferRef.current;
    const cursor = cursorRef.current;
    const scale = 36 * selectedGain;

    // Draw the continuous sweep line
    ctx.lineWidth = 2.0;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Glow effect
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#34d399';

    ctx.beginPath();
    let started = false;

    // Segment before cursor
    for (let x = 0; x < width; x++) {
      // Clear a 12px gap in front of the sweeping cursor (classic medical monitor phosphor sweep)
      const distFromCursor = (x - cursor + width) % width;
      if (distFromCursor < 14) {
        continue;
      }

      const val = buf[x] || 0;
      const y = centerY - val * scale;

      if (!started || distFromCursor === 14) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw sweep bar cursor indicator
    if (!isFrozen) {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.fillRect(cursor, 0, 2, h);
    }

    // Caliper lines if active
    if (caliperPoints.x1 !== null) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(caliperPoints.x1, 0);
      ctx.lineTo(caliperPoints.x1, h);
      ctx.stroke();
      if (caliperPoints.x2 !== null) {
        ctx.moveTo(caliperPoints.x2, 0);
        ctx.lineTo(caliperPoints.x2, h);
        ctx.stroke();
        ctx.setLineDash([]);
        // Delta ms label
        const deltaPx = Math.abs(caliperPoints.x2 - caliperPoints.x1);
        const deltaMs = Math.round((deltaPx / (gridSize * 5)) * 1000); // 25mm/s standard
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(`Δ ${deltaMs} ms`, Math.min(caliperPoints.x1, caliperPoints.x2) + 6, 24);
      }
      ctx.setLineDash([]);
    }
  };

  const handleToggleFreeze = () => {
    const next = !isFrozen;
    setIsFrozen(next);
    if (onFreezeChange) onFreezeChange(next);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!caliperMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (caliperPoints.x1 === null || (caliperPoints.x1 !== null && caliperPoints.x2 !== null)) {
      setCaliperPoints({ x1: x, x2: null });
    } else {
      setCaliperPoints({ ...caliperPoints, x2: x });
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0b1320] shadow-inner">
      {/* Top Monitor Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400 uppercase tracking-wider">Lead II · AD8232</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-mono text-[11px]">{currentMv.toFixed(3)} mV</span>
        </div>

        <div className="flex items-center gap-2">
          {leadOff && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/80 text-rose-300 text-[11px]">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>LEAD-OFF (LO+/LO-)</span>
            </div>
          )}

          {!compact && (
            <>
              {/* Gain Selector */}
              <div className="flex items-center gap-1 bg-slate-800/80 px-1.5 py-0.5 rounded text-[11px] text-slate-300">
                <span>Gain:</span>
                {[0.5, 1.0, 2.0].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGain(g)}
                    className={`px-1.5 py-0.2 rounded transition-colors ${
                      selectedGain === g ? 'bg-emerald-600 text-white font-semibold' : 'hover:text-white'
                    }`}
                  >
                    {g}x
                  </button>
                ))}
              </div>

              {/* Freeze Button */}
              <button
                onClick={handleToggleFreeze}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                  isFrozen ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Freeze waveform to inspect intervals"
              >
                {isFrozen ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>{isFrozen ? 'Resume' : 'Freeze'}</span>
              </button>

              {/* Caliper Tool */}
              <button
                onClick={() => {
                  setCaliperMode(!caliperMode);
                  setCaliperPoints({ x1: null, x2: null });
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                  caliperMode ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Measure PR, QRS, QT intervals"
              >
                <Eye className="w-3 h-3" />
                <span>Caliper</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={compact ? 420 : 640}
          height={height}
          onClick={handleCanvasClick}
          className="w-full block"
        />

        {/* Lead Off Alert Overlay */}
        {leadOff && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-rose-300">AD8232 Electrode Detached</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Check RA (Right Arm), LA (Left Arm), or RL (Right Leg) biomedical electrode pads.
            </p>
          </div>
        )}

        {/* Frozen Indicator Badge */}
        {isFrozen && !leadOff && (
          <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
            TRACE FROZEN · CLICK TO MEASURE
          </div>
        )}
      </div>

      {/* Footer scale info */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-900">
        <span>Standard Calibration: 25 mm/s · 10 mm/mV</span>
        <span>Low-pass 40Hz · Notch 50/60Hz Filter Active</span>
      </div>
    </div>
  );
};
