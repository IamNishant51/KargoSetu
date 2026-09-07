"use client";
import { useLanguage } from "@/i18n/LanguageContext";

import React, { useState, use } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  ChevronDown,
} from "lucide-react";
const ToggleSwitch = ({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}) => (
  <div className="flex items-center gap-2">
    <div
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? "bg-[#E9F5EE]0" : "bg-[#E2E6EB]"}`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-4" : "translate-x-1"}`}
      />
    </div>
    {label && (
      <span
        className={`text-sm font-semibold ${enabled ? "text-[#0E7A3D]" : "text-[#6B7D99]"}`}
      >
        {label}
      </span>
    )}
  </div>
);

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1`;

export default function SettingsPage({
  settingsPromise,
}: {
  settingsPromise: Promise<unknown>;
}) {
  const { t, language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const remoteSettingsArray = use(settingsPromise);
  const remoteSettings =
    remoteSettingsArray && Array.isArray(remoteSettingsArray)
      ? remoteSettingsArray.reduce(
          (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
          {},
        )
      : {};

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
    cacheCalculationResults: "true",
    ...remoteSettings,
  });

  const updateSetting = (key: string, value: string) => {
    setSettings((prev: Record<string, unknown>) => ({ ...prev, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (
      updatedSettings: Array<{ key: string; value: string }>,
    ) => {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
// Optional: show a success toast here
    },
  });

  const handleSave = () => {
    const payload = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-[#0A2342] pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="mono-label text-[#B45309]">{t("pg_settings")}</p>
          <h1 className="mt-1.5 font-display text-2xl md:text-3xl font-black tracking-[-0.02em] text-[#0A2342]">{t("set_title")}</h1>
          <p className="text-[#6B7D99] mt-1 text-sm md:text-base">
            {t("set_sub")}
          </p>
        </div>
        <button
          type="button"
          aria-label="Save Settings"
          onClick={handleSave}
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-[#D95D0F] text-white hover:bg-[#B45309] h-10 px-5 py-2 shrink-0 shadow-sm disabled:opacity-70"
        >
          {mutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : mutation.isSuccess ? (
            <Save className="w-4 h-4 mr-2 text-white" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {mutation.isPending
            ? t("saving")
            : mutation.isSuccess
              ? t("saved")
              : t("save_changes")}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Card 1: System Preferences */}
        <div className="bg-white rounded-xl border border-[#E2E6EB] shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-black tracking-tight text-[#0A2342]">{t("sys_title")}</h3>
            <p className="text-sm text-[#6B7D99]">
              {t("sys_sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_landing")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LayoutDashboard className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.defaultLandingPage}
                  onChange={(e) =>
                    updateSetting("defaultLandingPage", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="Dashboard">{t("dashboard")}</option>
                  <option value="Requisitions">{t("requisitions")}</option>
                  <option value="Forecasts">{t("forecasts")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_range")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.defaultDateRange}
                  onChange={(e) =>
                    updateSetting("defaultDateRange", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="Last 7 Days">{t("last_7")}</option>
                  <option value="Last 30 Days">{t("last_30")}</option>
                  <option value="Last 90 Days">{t("days_FMT").replace("{n}", "90")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_tz")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting("timezone", e.target.value)}
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option>(UTC+05:30) Asia/Kolkata</option>
                  <option>(UTC+00:00) Europe/London</option>
                  <option>(UTC-05:00) America/New_York</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_lang")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="w-4 h-4 text-[#6B7D99]" />
                </div>
                                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as "en" | "hi" | "bn" | "mr" | "ta" | "te" | "gu");
                    updateSetting("language", e.target.value);
                  }}
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="bn">বাংলা</option>
                  <option value="mr">मराठी</option>
                  <option value="ta">தமிழ்</option>
                  <option value="te">తెలుగు</option>
                  <option value="gu">ગુજરાતી</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_num")}</label>
              <div className="relative">
                <select
                  value={settings.numberFormat}
                  onChange={(e) =>
                    updateSetting("numberFormat", e.target.value)
                  }
                  className="block w-full h-10 pl-3 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option>1,234.56</option>
                  <option>1.234,56</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_theme")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Sun className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.themeMode}
                  onChange={(e) => updateSetting("themeMode", e.target.value)}
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="Light">{t("theme_light")}</option>
                  <option value="Dark">{t("theme_dark")}</option>
                  <option value="System">{t("theme_system")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E2E6EB] flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#0A2342]">{t("auto_title")}</h4>
                <p className="text-[13px] text-[#6B7D99] mt-0.5">
                  {t("auto_sub")}
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.autoDataRefresh === "true"}
                onChange={(val) =>
                  updateSetting("autoDataRefresh", val ? "true" : "false")
                }
              />
            </div>
            <div className="hidden md:block w-px h-12 bg-[#E2E6EB]"></div>
            <div className="flex-1">
              <label className="text-xs font-bold text-[#3D4F68] mb-2 block">{t("s_interval")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    updateSetting("refreshInterval", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="5 Minutes">{t("min_FMT").replace("{n}", "5")}</option>
                  <option value="15 Minutes">{t("min_FMT").replace("{n}", "15")}</option>
                  <option value="30 Minutes">{t("min_FMT").replace("{n}", "30")}</option>
                  <option value="1 Hour">{t("hour_1")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: AI & Forecasting Preferences */}
        <div className="bg-white rounded-xl border border-[#E2E6EB] shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-black tracking-tight text-[#0A2342]">{t("ai_title")}</h3>
            <p className="text-sm text-[#6B7D99]">
              {t("ai_sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_model")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GitMerge className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.defaultForecastModel}
                  onChange={(e) =>
                    updateSetting("defaultForecastModel", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option>FreightRate AI v2.1</option>
                  <option>Legacy Model v1.0</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_conf")}</label>
              <div className="relative">
                <select
                  value={settings.forecastConfidenceDisplay}
                  onChange={(e) =>
                    updateSetting("forecastConfidenceDisplay", e.target.value)
                  }
                  className="block w-full h-10 pl-3 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option>P10, P50, P90</option>
                  <option>Mean & Std Dev</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_shock")}</label>
              <div className="relative">
                <select
                  value={settings.marketShockScenario}
                  onChange={(e) =>
                    updateSetting("marketShockScenario", e.target.value)
                  }
                  className="block w-full h-10 pl-3 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="1.5x (Mild)">1.5x ({t("shock_mild")})</option>
                  <option value="2.0x (Moderate)">2.0x ({t("shock_moderate")})</option>
                  <option value="3.0x (Severe)">3.0x ({t("shock_severe")})</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E2E6EB] flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#0A2342]">{t("hist_title")}</h4>
                <p className="text-[13px] text-[#6B7D99] mt-0.5">
                  {t("hist_sub")}
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.showHistoricalComparison === "true"}
                onChange={(val) =>
                  updateSetting(
                    "showHistoricalComparison",
                    val ? "true" : "false",
                  )
                }
              />
            </div>
            <div className="hidden md:block w-px h-12 bg-[#E2E6EB]"></div>
            <div className="flex-1">
              <label className="text-xs font-bold text-[#3D4F68] mb-2 block">{t("s_horizon")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LineChart className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.predictionHorizon}
                  onChange={(e) =>
                    updateSetting("predictionHorizon", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="14 Days">{t("days_FMT").replace("{n}", "14")}</option>
                  <option value="30 Days">{t("days_FMT").replace("{n}", "30")}</option>
                  <option value="90 Days">{t("days_FMT").replace("{n}", "90")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Data & Calculation Preferences */}
        <div className="bg-white rounded-xl border border-[#E2E6EB] shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-black tracking-tight text-[#0A2342]">{t("data_title")}</h3>
            <p className="text-sm text-[#6B7D99]">
              {t("data_sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_cargo")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Weight className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.defaultCargoUnit}
                  onChange={(e) =>
                    updateSetting("defaultCargoUnit", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option>Metric Ton (MT)</option>
                  <option>Long Ton (LT)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_volunit")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Box className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.defaultVolumeUnit}
                  onChange={(e) =>
                    updateSetting("defaultVolumeUnit", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option>Cubic Meter (m³)</option>
                  <option>Cubic Feet (ft³)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D4F68]">{t("s_currency")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.currency}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>INR - Indian Rupee</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E2E6EB] flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <label className="text-xs font-bold text-[#3D4F68] mb-2 block">{t("s_round")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SlidersHorizontal className="w-4 h-4 text-[#6B7D99]" />
                </div>
                <select
                  value={settings.roundingPreference}
                  onChange={(e) =>
                    updateSetting("roundingPreference", e.target.value)
                  }
                  className="block w-full h-10 pl-9 pr-10 py-2 text-sm border border-[#E2E6EB] rounded-lg focus:ring-[#D95D0F]/30 focus:border-[#D95D0F] bg-white text-[#0A2342] font-medium appearance-none"
                >
                  <option value="0 Decimal Places">{t("dec_FMT").replace("{n}", "0")}</option>
                  <option value="2 Decimal Places">{t("dec_FMT").replace("{n}", "2")}</option>
                  <option value="4 Decimal Places">{t("dec_FMT").replace("{n}", "4")}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7D99]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-[#E2E6EB]"></div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 md:mt-0">
              <div>
                <h4 className="text-sm font-bold text-[#0A2342]">{t("cache_title")}</h4>
                <p className="text-[13px] text-[#6B7D99] mt-0.5">
                  {t("cache_sub")}
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.cacheCalculationResults === "true"}
                onChange={(val) =>
                  updateSetting(
                    "cacheCalculationResults",
                    val ? "true" : "false",
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
