import React, { useState, useEffect } from 'react';
import {
  TelemetryPacket,
  UserProfile,
  DeviceConfig,
  AlertItem,
  SimulationScenario,
} from './types/telemetry';
import { DEFAULT_USER, DEFAULT_DEVICE_CONFIG, INITIAL_ALERTS } from './data/mockData';
import { telemetryService } from './services/telemetryService';
import { TabBar, MainTab, LiveSubTab } from './components/navigation/TabBar';
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { EcgLiveScreen } from './components/screens/EcgLiveScreen';
import { FetalDopplerScreen } from './components/screens/FetalDopplerScreen';
import { VitalsScreen } from './components/screens/VitalsScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { AlertsScreen } from './components/screens/AlertsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ExpoCodeModal } from './components/modals/ExpoCodeModal';
import { SimulationDrawer } from './components/modals/SimulationDrawer';
import {
  HeartPulse,
  Smartphone,
  Monitor,
  Code2,
  Sparkles,
  Wifi,
  Battery,
  AlertOctagon,
  Radio,
  LogOut,
  Bell,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [currentSubTab, setCurrentSubTab] = useState<LiveSubTab>('ecg');
  const [telemetry, setTelemetry] = useState<TelemetryPacket>({
    device_id: 'ESP32_FETAL_01',
    timestamp: new Date().toLocaleTimeString(),
    fetal_bpm: 142,
    maternal_pulse: 76,
    temperature: 36.8,
    ecg_value: 0.12,
    doppler_status: 'connected',
    lead_off_positive: false,
    lead_off_negative: false,
    signal_quality: 96,
    wifi_rssi: -58,
    battery_level: 92,
  });
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>(DEFAULT_DEVICE_CONFIG);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>('normal');
  const [isExpoModalOpen, setIsExpoModalOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Real-time telemetry subscription
  useEffect(() => {
    const unsubscribe = telemetryService.subscribe((packet) => {
      setTelemetry(packet);

      // Automated alert generation when physiological thresholds are breached
      if (packet.temperature !== null && packet.temperature > deviceConfig.feverThreshold) {
        setAlerts((prev) => {
          if (prev.some((a) => a.code === 'TEMP_SPIKE' && !a.resolved)) return prev;
          const newAlert: AlertItem = {
            id: `alt_temp_${Date.now()}`,
            timestamp: `Today, ${packet.timestamp}`,
            severity: 'critical',
            code: 'TEMP_SPIKE',
            title: 'Elevated Maternal Temperature (Fever)',
            message: `DS18B20 digital probe registered ${packet.temperature}°C, exceeding limit (${deviceConfig.feverThreshold}°C).`,
            acknowledged: false,
            resolved: false,
            value: `${packet.temperature}°C`,
            recommendation: 'Evaluate maternal hydration, antipyretic protocol, and infection markers.',
          };
          return [newAlert, ...prev];
        });
      }

      if (packet.fetal_bpm !== null && packet.fetal_bpm < deviceConfig.fetalLowThreshold) {
        setAlerts((prev) => {
          if (prev.some((a) => a.code === 'FETAL_BRADYCARDIA' && !a.resolved)) return prev;
          const newAlert: AlertItem = {
            id: `alt_fetal_brady_${Date.now()}`,
            timestamp: `Today, ${packet.timestamp}`,
            severity: 'critical',
            code: 'FETAL_BRADYCARDIA',
            title: 'Fetal Heart Rate Deceleration',
            message: `Doppler FHR dropped to ${packet.fetal_bpm} BPM (below normal 110 BPM threshold).`,
            acknowledged: false,
            resolved: false,
            value: `${packet.fetal_bpm} BPM`,
            recommendation: 'Reposition patient into left lateral position; administer oxygen if indicated.',
          };
          return [newAlert, ...prev];
        });
      }

      if (packet.fetal_bpm !== null && packet.fetal_bpm > deviceConfig.fetalHighThreshold) {
        setAlerts((prev) => {
          if (prev.some((a) => a.code === 'FETAL_TACHYCARDIA' && !a.resolved)) return prev;
          const newAlert: AlertItem = {
            id: `alt_fetal_tachy_${Date.now()}`,
            timestamp: `Today, ${packet.timestamp}`,
            severity: 'warning',
            code: 'FETAL_TACHYCARDIA',
            title: 'Fetal Tachycardia Detected',
            message: `Doppler FHR reached ${packet.fetal_bpm} BPM (above baseline 160 BPM threshold).`,
            acknowledged: false,
            resolved: false,
            value: `${packet.fetal_bpm} BPM`,
            recommendation: 'Check maternal temperature, fetal movements, and hydration.',
          };
          return [newAlert, ...prev];
        });
      }

      if (packet.lead_off_positive || packet.lead_off_negative) {
        setAlerts((prev) => {
          if (prev.some((a) => a.code === 'ECG_LEAD_OFF' && !a.resolved)) return prev;
          const newAlert: AlertItem = {
            id: `alt_lead_off_${Date.now()}`,
            timestamp: `Today, ${packet.timestamp}`,
            severity: 'warning',
            code: 'ECG_LEAD_OFF',
            title: 'AD8232 ECG Electrode Detached',
            message: 'Lead-Off pins detected disconnection in Lead II electrodes. Check RA, LA, or RL pads.',
            acknowledged: false,
            resolved: false,
            value: 'Lead Detached',
            recommendation: 'Inspect gel contact and electrode lead wires.',
          };
          return [newAlert, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, [deviceConfig]);

  const handleToggleDoppler = () => {
    const nextState = !telemetryService.isDopplerConnected();
    telemetryService.setDopplerConnected(nextState);
  };

  const handleScenarioChange = (scenario: SimulationScenario) => {
    setCurrentScenario(scenario);
    telemetryService.setScenario(scenario);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleClearResolved = () => {
    setAlerts((prev) => prev.filter((a) => !a.acknowledged));
  };

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  // Render screen by active tab
  const renderCurrentScreen = () => {
    if (!user) {
      return <LoginScreen onLogin={(loggedInUser) => setUser(loggedInUser)} />;
    }

    switch (currentTab) {
      case 'home':
        return (
          <DashboardScreen
            telemetry={telemetry}
            user={user}
            onNavigate={(tab, sub) => {
              setCurrentTab(tab);
              if (sub) setCurrentSubTab(sub);
            }}
            onToggleDoppler={handleToggleDoppler}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        );
      case 'live':
        if (currentSubTab === 'ecg') {
          return <EcgLiveScreen telemetry={telemetry} />;
        } else if (currentSubTab === 'fetal') {
          return (
            <FetalDopplerScreen
              telemetry={telemetry}
              onToggleDoppler={handleToggleDoppler}
            />
          );
        } else {
          return <VitalsScreen telemetry={telemetry} />;
        }
      case 'history':
        return <HistoryScreen user={user} />;
      case 'alerts':
        return (
          <AlertsScreen
            telemetry={telemetry}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onClearResolved={handleClearResolved}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            telemetry={telemetry}
            user={user}
            config={deviceConfig}
            onUpdateConfig={(c) => setDeviceConfig(c)}
            onLogout={() => setUser(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Application Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">IoMT Fetal & Maternal Monitor</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hidden sm:inline">
                ESP32 Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              AD8232 ECG · Fetal Doppler · Pulse Sensor · DS18B20 Temp
            </p>
          </div>
        </div>

        {/* Global Controls & Tools */}
        <div className="flex items-center gap-2">
          {/* Viewport Mode Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Mobile Device Shell (React Native / Expo simulation)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Wide Clinical Station View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Clinical Monitor</span>
            </button>
          </div>

          {/* Testbed Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">ESP32 Testbed</span>
            <span className="sm:hidden">Testbed</span>
          </button>

          {/* React Native Expo Code Package Button */}
          <button
            type="button"
            onClick={() => setIsExpoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Download / View React Native with Expo & TypeScript Code + ESP32 Firmware"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Expo TS & Firmware</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {viewMode === 'mobile' ? (
          /* Phone Device Shell: Exact React Native Expo Mobile Experience */
          <div className="w-full max-w-[430px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col min-h-[780px] max-h-[92vh] overflow-hidden my-auto">
            {/* Top Phone Speaker / Camera Island */}
            <div className="flex items-center justify-between px-6 py-1.5 text-white text-[11px] font-semibold">
              <span>09:41</span>
              {/* Dynamic Island / Notch */}
              <div className="w-24 h-4 bg-black rounded-full" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Internal Phone Screen Container */}
            <div className="flex-1 bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative border border-slate-800/20">
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                {renderCurrentScreen()}
              </div>

              {/* Bottom Tab Bar (Expo React Navigation BottomTabs) */}
              {user && (
                <TabBar
                  currentTab={currentTab}
                  currentSubTab={currentSubTab}
                  onSelectTab={(tab) => setCurrentTab(tab)}
                  onSelectSubTab={(sub) => setCurrentSubTab(sub)}
                  unreadAlertsCount={unreadAlertsCount}
                  isDopplerActive={telemetry.doppler_status === 'connected'}
                />
              )}
            </div>
          </div>
        ) : (
          /* Desktop / Tablet Clinical Station View */
          <div className="w-full max-w-6xl space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
              {renderCurrentScreen()}
            </div>

            {user && (
              <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200">
                <TabBar
                  currentTab={currentTab}
                  currentSubTab={currentSubTab}
                  onSelectTab={(tab) => setCurrentTab(tab)}
                  onSelectSubTab={(sub) => setCurrentSubTab(sub)}
                  unreadAlertsCount={unreadAlertsCount}
                  isDopplerActive={telemetry.doppler_status === 'connected'}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Expo & TypeScript Code Modal */}
      <ExpoCodeModal
        isOpen={isExpoModalOpen}
        onClose={() => setIsExpoModalOpen(false)}
      />

      {/* ESP32 Simulation Drawer / Hardware Bridge */}
      <SimulationDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentScenario={currentScenario}
        onSelectScenario={handleScenarioChange}
      />
    </div>
  );
}
