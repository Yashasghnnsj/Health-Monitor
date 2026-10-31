import React, { useState } from 'react';
import { EXPO_PROJECT_FILES, ProjectFile } from '../../data/expoCodeExport';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  FileCode,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface ExpoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpoCodeModal: React.FC<ExpoCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(EXPO_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">React Native with Expo & TypeScript Code Package</h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Ready to Build
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production-ready mobile project files + ESP32 C++ firmware sketch for your IoMT project
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Setup Instructions Bar */}
        <div className="bg-slate-800 px-6 py-2.5 text-xs text-slate-300 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-emerald-400">
              npx create-expo-app --template blank-typescript iomt-fetal-monitor
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Expo SDK 52 · TypeScript · React Navigation
          </span>
        </div>

        {/* Body: Left file explorer, Right code editor */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-3 space-y-1 shrink-0 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Project Files
            </div>
            {EXPO_PROJECT_FILES.map((file) => {
              const isSelected = file.filename === selectedFile.filename;
              return (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {file.language === 'cpp' ? (
                    <Cpu className="w-4 h-4 text-orange-400 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <div>{file.filename}</div>
                    <div className="text-[10px] opacity-70 truncate">{file.path}</div>
                  </div>
                </button>
              );
            })}

            <div className="mt-4 pt-4 border-t border-slate-800 px-2 space-y-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Target Platforms:</span>
              <ul className="space-y-1 text-[11px]">
                <li>• Android APK / App Bundle</li>
                <li>• iOS (Expo Go & EAS)</li>
                <li>• Web Preview & Desktop PWA</li>
              </ul>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar for Code Viewer */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
              <div className="text-slate-300 font-mono flex items-center gap-2">
                <span className="text-sky-400 font-semibold">{selectedFile.path}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy File'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSingle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 bg-[#0a0f1d]">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed tab-4">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>IoMT Maternal & Fetal Health Monitoring Architecture</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
