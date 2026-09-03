"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, 
  SlidersHorizontal,
  LayoutDashboard,
  Calendar,
  Globe,
  Sun,
  Clock,
  GitMerge,
  LineChart,
  Weight,
  Box,
  DollarSign,
  ChevronDown
} from 'lucide-react';
const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean, onChange: (val: boolean) => void, label?: string }) => (
  <div className="flex items-center gap-2">
    <div 
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-green-500' : 'bg-slate-200'}`}
    >
      <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
    </div>
    {label && <span className={`text-sm font-semibold ${enabled ? 'text-green-600' : 'text-slate-500'}`}>{label}</span>}
  </div>
);

const API_BASE = "http://localhost:5000/api/v1";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Local state for settings
  const [settings, setSettings] = useState({
    defaultLandingPage: "Dashboard",
    defaultDateRange: "Last 30 Days",
    timezone: "(UTC+05:30) Asia/Kolkata",
    language: "English",
    numberFormat: "1,234.56",
    themeMode: "Light",
    autoDataRefresh: "true",
    refreshInterval: "15 Minutes",
    defaultForecastModel: "FreightRate AI v2.1",
    forecastConfidenceDisplay: "P10, P50, P90",
    marketShockScenario: "2.0x (Moderate)",
    showHistoricalComparison: "true",
    predictionHorizon: "30 Days",
    defaultCargoUnit: "Metric Ton (MT)",
    defaultVolumeUnit: "Cubic Meter (m³)",
    currency: "USD - US Dollar",
    roundingPreference: "2 Decimal Places",
    cacheCalculationResults: "true"
  });

  const { data: remoteSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  useEffect(() => {
    if (remoteSettings && Array.isArray(remoteSettings)) {
      const newSettings = { ...settings };
      remoteSettings.forEach((s: { key: string; value: string }) => {
        if (s.key in newSettings) {
          (newSettings as Record<string, string>)[s.key] = s.value;
        }
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(newSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteSettings]);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (updatedSettings: Array<{ key: string; value: string }>) => {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Optional: show a success toast here
    }
  });

  const handleSave = () => {
    const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
    mutation.mutate(payload);
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A1727]"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-900 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Settings</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Manage your account, preferences, and system configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#0A1727] text-white hover:bg-[#0A1727]/90 h-10 px-5 py-2 shrink-0 shadow-sm disabled:opacity-70"
        >
          {mutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : mutation.isSuccess ? (
             <Save className="w-4 h-4 mr-2 text-green-400" />
          ) : (
             <Save className="w-4 h-4 mr-2" />
          )}
          {mutation.isPending ? 'Saving...' : mutation.isSuccess ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
          {/* Card 1: System Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">System Preferences</h3>
              <p className="text-sm text-slate-500">Customize how KargoSetu works for your organization.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Default Landing Page</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.defaultLandingPage}
                    onChange={(e) => updateSetting('defaultLandingPage', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>Dashboard</option>
                    <option>Requisitions</option>
                    <option>Forecasts</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Default Date Range</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.defaultDateRange}
                    onChange={(e) => updateSetting('defaultDateRange', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Timezone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>(UTC+05:30) Asia/Kolkata</option>
                    <option>(UTC+00:00) Europe/London</option>
                    <option>(UTC-05:00) America/New_York</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Language</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Number Format</label>
                <div className="relative">
                  <select 
                    value={settings.numberFormat}
                    onChange={(e) => updateSetting('numberFormat', e.target.value)}
                    className="block w-full h-10 pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>1,234.56</option>
                    <option>1.234,56</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Theme Mode</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sun className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.themeMode}
                    onChange={(e) => updateSetting('themeMode', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Automatic Data Refresh</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Keep data up-to-date automatically.</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.autoDataRefresh === "true"} 
                  onChange={(val) => updateSetting('autoDataRefresh', val ? "true" : "false")} 
                />
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-200"></div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 mb-2 block">Refresh Interval</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.refreshInterval}
                    onChange={(e) => updateSetting('refreshInterval', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>5 Minutes</option>
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: AI & Forecasting Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">AI & Forecasting Preferences</h3>
              <p className="text-sm text-slate-500">Configure AI models and forecasting behavior.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Default Forecast Model</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GitMerge className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.defaultForecastModel}
                    onChange={(e) => updateSetting('defaultForecastModel', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>FreightRate AI v2.1</option>
                    <option>Legacy Model v1.0</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Forecast Confidence Display</label>
                <div className="relative">
                  <select 
                    value={settings.forecastConfidenceDisplay}
                    onChange={(e) => updateSetting('forecastConfidenceDisplay', e.target.value)}
                    className="block w-full h-10 pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>P10, P50, P90</option>
                    <option>Mean & Std Dev</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Market Shock Scenario (Default)</label>
                <div className="relative">
                  <select 
                    value={settings.marketShockScenario}
                    onChange={(e) => updateSetting('marketShockScenario', e.target.value)}
                    className="block w-full h-10 pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>1.5x (Mild)</option>
                    <option>2.0x (Moderate)</option>
                    <option>3.0x (Severe)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Show Historical Comparison</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Enable historical data overlay in charts.</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.showHistoricalComparison === "true"}
                  onChange={(val) => updateSetting('showHistoricalComparison', val ? "true" : "false")}
                />
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-200"></div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 mb-2 block">Prediction Horizon (Days)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LineChart className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.predictionHorizon}
                    onChange={(e) => updateSetting('predictionHorizon', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>14 Days</option>
                    <option>30 Days</option>
                    <option>90 Days</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Data & Calculation Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Data & Calculation Preferences</h3>
              <p className="text-sm text-slate-500">Set default values for calculations and data handling.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Default Cargo Unit</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Weight className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.defaultCargoUnit}
                    onChange={(e) => updateSetting('defaultCargoUnit', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>Metric Ton (MT)</option>
                    <option>Long Ton (LT)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Default Volume Unit</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Box className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.defaultVolumeUnit}
                    onChange={(e) => updateSetting('defaultVolumeUnit', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>Cubic Meter (m³)</option>
                    <option>Cubic Feet (ft³)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Currency</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>INR - Indian Rupee</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 mb-2 block">Rounding Preference</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  </div>
                  <select 
                    value={settings.roundingPreference}
                    onChange={(e) => updateSetting('roundingPreference', e.target.value)}
                    className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:ring-[#0A1727] focus:border-[#0A1727] bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option>0 Decimal Places</option>
                    <option>2 Decimal Places</option>
                    <option>4 Decimal Places</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-200"></div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 md:mt-0">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Cache Calculation Results</h4>
                  <p className="text-[13px] text-slate-500 mt-0.5">Improve performance by caching results.</p>
                </div>
                <ToggleSwitch 
                  enabled={settings.cacheCalculationResults === "true"}
                  onChange={(val) => updateSetting('cacheCalculationResults', val ? "true" : "false")}
                />
              </div>
            </div>
          </div>
          
      </div>
    </div>
  );
}
