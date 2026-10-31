import React from 'react';
import {
  Home,
  Activity,
  Calendar,
  Bell,
  Settings,
  Radio,
  Heart,
  Thermometer,
} from 'lucide-react';

export type MainTab = 'home' | 'live' | 'history' | 'alerts' | 'settings';
export type LiveSubTab = 'ecg' | 'fetal' | 'vitals';

interface TabBarProps {
  currentTab: MainTab;
  currentSubTab: LiveSubTab;
  onSelectTab: (tab: MainTab) => void;
  onSelectSubTab: (subTab: LiveSubTab) => void;
  unreadAlertsCount: number;
  isDopplerActive: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  currentTab,
  currentSubTab,
  onSelectTab,
  onSelectSubTab,
  unreadAlertsCount,
  isDopplerActive,
}) => {
  const tabs: Array<{
    id: MainTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live', label: 'Live', icon: Activity },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full">
      {/* If on Live tab, show the 3 live sensor sub-tabs */}
      {currentTab === 'live' && (
        <div className="bg-slate-100/90 border-t border-slate-200/80 px-4 py-1.5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onSelectSubTab('ecg')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              currentSubTab === 'ecg'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Screen 3: AD8232 ECG</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSubTab('fetal')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              currentSubTab === 'fetal'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span>Screen 4: Fetal Doppler</span>
            {isDopplerActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => onSelectSubTab('vitals')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              currentSubTab === 'vitals'
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-orange-600" />
            <span>Screen 5: Temp & Pulse</span>
          </button>
        </div>
      )}

      {/* Main 5-tab Bottom Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-sky-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-sky-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
