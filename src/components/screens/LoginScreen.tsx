import React, { useState } from 'react';
import { UserProfile } from '../../types/telemetry';
import { DEFAULT_USER, DEMO_DOCTOR } from '../../data/mockData';
import { HeartPulse, Lock, Mail, ShieldCheck, UserCheck, Stethoscope, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>('sarah.jenkins@hospital.health.org');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);
  const [forgotEmailSent, setForgotEmailSent] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('Sarah Jenkins');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'doctor') {
      onLogin({
        ...DEMO_DOCTOR,
        name: isRegistering ? fullName : DEMO_DOCTOR.name,
        email: email || DEMO_DOCTOR.email,
      });
    } else {
      onLogin({
        ...DEFAULT_USER,
        name: isRegistering ? fullName : DEFAULT_USER.name,
        email: email || DEFAULT_USER.email,
      });
    }
  };

  const handleQuickDemo = (demoType: 'patient' | 'doctor') => {
    if (demoType === 'doctor') {
      onLogin(DEMO_DOCTOR);
    } else {
      onLogin(DEFAULT_USER);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/30 text-white">
            <HeartPulse className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900">
          IoMT Fetal & Maternal
        </h2>
        <p className="text-center text-xs text-slate-500 mt-1">
          Real-time physiological telemetry for ESP32 biomedical sensors
        </p>

        {/* Demonstration Quick Access Buttons */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Fast Demo Sign-In (Engineering Prototype):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('patient')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Patient Mode</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('doctor')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>Doctor / OB-GYN</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Account Email or Clinician ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="name@hospital.health.org"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="pt-1">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Portal Access Type
              </label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    role === 'patient'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Expectant Mother (Sarah)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    role === 'doctor'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Doctor / OB-GYN (Iman)
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors cursor-pointer"
            >
              <span>{isRegistering ? 'Create Account & Enter' : 'Enter Monitoring System'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : 'Need a new monitoring account? Register'}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset Access Credentials</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your clinical email to receive a secure device authentication reset link.
            </p>
            {forgotEmailSent ? (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
                Reset instructions sent to <span className="font-semibold">{email}</span>. Use the test credentials or demo button above for immediate prototype access.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  placeholder="your.email@hospital.org"
                />
                <button
                  type="button"
                  onClick={() => setForgotEmailSent(true)}
                  className="w-full py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setForgotPasswordOpen(false);
                setForgotEmailSent(false);
              }}
              className="mt-3 w-full py-1.5 text-slate-600 text-xs font-medium hover:text-slate-900 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
