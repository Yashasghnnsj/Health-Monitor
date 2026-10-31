import React, { useState } from 'react';
import { AlertItem, AlertSeverity, TelemetryPacket } from '../../types/telemetry';
import { INITIAL_ALERTS } from '../../data/mockData';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Volume2,
  VolumeX,
  Filter,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface AlertsScreenProps {
  telemetry: TelemetryPacket;
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onClearResolved: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  telemetry,
  alerts,
  onAcknowledgeAlert,
  onClearResolved,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Screen 7: Alerts & Notifications</h2>
            {criticalCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                {criticalCount} Critical Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated threshold violation detection and IoMT hardware status telemetry
          </p>
        </div>

        {/* Audio buzzer toggle & clear */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Buzzer Enabled' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={onClearResolved}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Clear Resolved
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
              filterSeverity === sev
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {sev === 'all' ? 'All Alerts' : sev}
          </button>
        ))}
      </div>

      {/* Alert Items List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No Alerts Matching Filter</h4>
            <p className="text-xs text-slate-500 mt-1">All physiological parameters within normal limits.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCrit
                    ? 'bg-rose-50/50 border-rose-200'
                    : isWarn
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCrit
                          ? 'bg-rose-100 text-rose-600'
                          : isWarn
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-sky-100 text-sky-600'
                      }`}
                    >
                      {isCrit ? (
                        <AlertOctagon className="w-5 h-5" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">[{alert.code}]</span>
                        {alert.value && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.2 rounded-md ${
                              isCrit
                                ? 'bg-rose-200 text-rose-900'
                                : isWarn
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {alert.value}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{alert.message}</p>

                      {alert.recommendation && (
                        <div className="mt-2 text-xs font-medium text-slate-800 bg-white/80 p-2 rounded-lg border border-slate-200/80">
                          Recommended Action: {alert.recommendation}
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{alert.timestamp}</span>
                        <span>·</span>
                        <span>{alert.acknowledged ? 'Acknowledged by Doctor' : 'Unacknowledged'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  {!alert.acknowledged ? (
                    <button
                      type="button"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reviewed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Medical Interpretation Boundary Notice Required by Spec */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <span className="font-bold text-slate-700">Clinical Boundary Disclaimer:</span> These threshold alarms are designed to support patient monitoring during project demonstrations and clinical study. Do not present these automated sensor alerts as definitive medical diagnoses. Clinical interpretation and emergency intervention require qualified obstetric physician guidance.
        </p>
      </div>
    </div>
  );
};
