import React, { useState } from 'react';
import { SessionRecord, UserProfile } from '../../types/telemetry';
import { HISTORICAL_SESSIONS } from '../../data/mockData';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart,
  Thermometer,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface HistoryScreenProps {
  user: UserProfile;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ user }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>(HISTORICAL_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<SessionRecord>(HISTORICAL_SESSIONS[0]);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // CSV Export
  const handleExportCsv = (session: SessionRecord) => {
    const headers = 'Timestamp,Fetal_BPM_Doppler,Maternal_Pulse_BPM,Temperature_C,Status\n';
    const rows = session.fhrPoints
      .map(
        (p) =>
          `${session.date} ${p.time},${p.bpm},${session.avgMaternalPulse},${session.avgTemperature},${session.status}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IoMT_Telemetry_${session.date}_${session.patientName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('CSV Export downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // PDF Print Trigger
  const handlePrintPdf = () => {
    setShowPrintModal(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Screen 6: History & Medical Reports</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              Clinical Telemetry Archive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical monitoring sessions with automated PDF summary generation and CSV export
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportCsv(selectedSession)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Clinical PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Main Content: Left session picker, Right session detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Session List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Recorded Telemetry Sessions
          </h3>
          <div className="space-y-2">
            {sessions.map((s) => {
              const isSelected = s.id === selectedSession.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.date}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.status === 'normal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status === 'normal' ? 'Reassuring' : 'Observation'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {s.startTime} - {s.endTime} ({s.durationMinutes} min)
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="font-semibold text-sky-700">FHR: {s.avgFetalBpm} BPM</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">Pulse: {s.avgMaternalPulse} BPM</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Session Deep Dive */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Telemetry Session: {selectedSession.date}
                </h3>
                <span className="text-xs text-slate-500">
                  ({selectedSession.durationMinutes} minutes duration)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: {selectedSession.patientName} (Week {selectedSession.gestationalWeek})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportCsv(selectedSession)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
              >
                Download CSV
              </button>
            </div>
          </div>

          {/* Vitals Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500">Mean Fetal HR</span>
              <div className="text-xl font-bold font-mono text-sky-600 mt-0.5">
                {selectedSession.avgFetalBpm} <span className="text-xs font-normal text-slate-500">BPM</span>
              </div>
              <div className="text-[10px] text-slate-400">Range: {selectedSession.minFetalBpm}-{selectedSession.maxFetalBpm}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500">Mean Maternal Pulse</span>
              <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
                {selectedSession.avgMaternalPulse} <span className="text-xs font-normal text-slate-500">BPM</span>
              </div>
              <div className="text-[10px] text-slate-400">Analog Pulse Sensor</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500">Body Temp</span>
              <div className="text-xl font-bold font-mono text-orange-600 mt-0.5">
                {selectedSession.avgTemperature}°C
              </div>
              <div className="text-[10px] text-slate-400">DS18B20 1-Wire Probe</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500">Clinical Status</span>
              <div className="text-sm font-bold text-emerald-700 capitalize mt-1">
                {selectedSession.status}
              </div>
              <div className="text-[10px] text-slate-400">Reactive Non-Stress</div>
            </div>
          </div>

          {/* FHR CTG Trend for this session */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Cardiotocography (CTG) Baseline Points (110 - 160 Normal Band)</span>
              <span className="text-[11px] text-slate-500">5-minute interval samples</span>
            </div>
            <div className="h-28 bg-[#080d1a] rounded-xl p-3 flex items-end gap-2 border border-slate-800">
              {selectedSession.fhrPoints.map((pt, idx) => {
                const min = 80;
                const max = 180;
                const pct = ((pt.bpm - min) / (max - min)) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[9px] text-sky-300 font-mono">{pt.bpm}</div>
                    <div
                      className="w-full bg-sky-500 rounded-t-xs"
                      style={{ height: `${pct}%` }}
                    />
                    <div className="text-[8px] text-slate-400 font-mono">{pt.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinician Notes */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Obstetrician Assessment & Notes:</span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {selectedSession.notes}
            </p>
          </div>
        </div>
      </div>

      {/* Printable Clinical PDF Report View (Modal & Print Template) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 printable-area space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {user.hospital}
                </h2>
                <p className="text-xs text-slate-500">
                  IoMT Maternal & Fetal Telemetry Clinical Report
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>Report Date: {selectedSession.date}</div>
                <div>Device ID: ESP32_FETAL_01</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500">Patient Name:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedSession.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500">Gestational Age:</span>{' '}
                <span className="font-semibold text-slate-900">{selectedSession.gestationalWeek} Weeks</span>
              </div>
              <div>
                <span className="text-slate-500">Attending Physician:</span>{' '}
                <span className="font-semibold text-slate-900">{user.assignedDoctor}</span>
              </div>
              <div>
                <span className="text-slate-500">Session Interval:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {selectedSession.startTime} - {selectedSession.endTime} ({selectedSession.durationMinutes} min)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Telemetry Summary</h4>
              <table className="w-full text-xs border border-slate-200 text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2 border">Parameter</th>
                    <th className="p-2 border">Observed Value</th>
                    <th className="p-2 border">Reference Range</th>
                    <th className="p-2 border">Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Fetal Heart Rate (Doppler)</td>
                    <td className="p-2 border font-mono font-bold text-sky-700">{selectedSession.avgFetalBpm} BPM</td>
                    <td className="p-2 border">110 - 160 BPM</td>
                    <td className="p-2 border text-emerald-700 font-semibold">Normal Baseline</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Maternal Pulse (Pulse Sensor)</td>
                    <td className="p-2 border font-mono font-bold">{selectedSession.avgMaternalPulse} BPM</td>
                    <td className="p-2 border">60 - 100 BPM</td>
                    <td className="p-2 border text-emerald-700 font-semibold">Normal Resting</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Body Temperature (DS18B20)</td>
                    <td className="p-2 border font-mono font-bold">{selectedSession.avgTemperature}°C</td>
                    <td className="p-2 border">&lt; 37.5°C</td>
                    <td className="p-2 border text-emerald-700 font-semibold">Afebrile</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-800">Doctor's Sign-Off & Recommendations:</span>
              <p className="text-slate-700 mt-1">{selectedSession.notes}</p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-slate-400">
                <span>Physician Signature: ___________________________</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 cursor-pointer"
              >
                Print to PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
