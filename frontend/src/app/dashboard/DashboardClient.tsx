"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";
import { loadJSON, saveJSON } from "@/lib/storage";
import {
  Download,
  Calendar,
  Anchor,
  Ship,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  Search,
  ChevronDown,
  FileText,
  Info,
  ClipboardCheck,
} from "lucide-react";

const EVAL_KEY = "kargosetu_eval_v1";

interface EvalResult {
  feasible: boolean;
  strategy: string;
  total_vessels: number;
  vessel_class: string;
  ai_insight: string;
  calculatedDraft: number;
  portMaxDraft: number;
  clearance_margin: number;
  requestedVolume: number;
  vesselCapacity: number;
}

interface PersistedEval {
  volume: string;
  port: { name: string; subtext: string } | null;
  commodity: string;
  vessel: string;
  unit: "Meters" | "Feet";
  result: EvalResult | null;
  evaluatedAt: string | null;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  // The last evaluated answer is rehydrated here — reloads never lose it.
  const [savedEval] = useState(() => loadJSON<PersistedEval | null>(EVAL_KEY, null));
  const [unit, setUnit] = useState<"Meters" | "Feet">(savedEval?.unit ?? "Meters");
  const [portDropdownOpen, setPortDropdownOpen] = useState(false);
  const [portSearch, setPortSearch] = useState("");
  const [selectedPort, setSelectedPort] = useState<{
    name: string;
    subtext: string;
  } | null>(savedEval?.port ?? { name: "Haldia", subtext: "India" });
  const [volume, setVolume] = useState(savedEval?.volume ?? "145,000");
  const [evaluatedAt, setEvaluatedAt] = useState<string | null>(savedEval?.evaluatedAt ?? null);
  const portRef = useRef<HTMLDivElement>(null);

  const [commodityOpen, setCommodityOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState(savedEval?.commodity ?? "Iron Ore");
  const commodityRef = useRef<HTMLDivElement>(null);

  const [vesselOpen, setVesselOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(savedEval?.vessel ?? "Supramax");
  const vesselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (portRef.current && !portRef.current.contains(event.target as Node))
        setPortDropdownOpen(false);
      if (
        commodityRef.current &&
        !commodityRef.current.contains(event.target as Node)
      )
        setCommodityOpen(false);
      if (
        vesselRef.current &&
        !vesselRef.current.contains(event.target as Node)
      )
        setVesselOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: portsData, isLoading: isLoadingPorts } = useQuery({
    queryKey: ["ports"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/ports`);
      if (!res.ok) return [];
      const data = await res.json();
      const list = data.ports || data;
      // Backend ports carry { name, ... } with no `subtext` — normalize so
      // every consumer can safely call string methods on both fields.
      return (Array.isArray(list) ? list : []).map((p) => ({
        name: String(p?.name ?? ""),
        subtext: String(p?.subtext ?? p?.country ?? ""),
      }));
    },
  });
  const ports = portsData || [];

  const { data: commoditiesData, isLoading: isLoadingCommodities } = useQuery({
    queryKey: ["commodities"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/commodities`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.commodities || data;
    },
  });
  const commodities =
    commoditiesData && commoditiesData.length > 0
      ? commoditiesData
      : ["Iron Ore", "Coal", "Grain", "Bauxite"];

  const [laycanStart] = useState("2025-06-15");
  const [laycanEnd] = useState("2025-06-30");

  const {
    mutate: evaluateRequisition,
    data: liveResult,
    isPending: loading,
    error,
  } = useMutation({
    mutationFn: async () => {
      const parsedVolume = Number(volume.replace(/,/g, ""));
      const portName = selectedPort?.name || "Haldia";
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/requisitions/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume_mt: parsedVolume,
          dest_port_name: portName,
          commodity: selectedCommodity,
          preferredVessel:
            selectedVessel !== "Any" ? selectedVessel : undefined,
          laycanStart: laycanStart,
          laycanEnd: laycanEnd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate");
      // Saved with the exact inputs used, so a reload restores this answer verbatim.
      saveJSON(EVAL_KEY, {
        volume,
        port: selectedPort,
        commodity: selectedCommodity,
        vessel: selectedVessel,
        unit,
        result: data,
        evaluatedAt: new Date().toLocaleString(),
      });
      return data;
    },
    onSuccess: () => setEvaluatedAt(new Date().toLocaleString()),
  });

  // A fresh evaluation wins while it lives; otherwise the saved answer stands in.
  const result: EvalResult | null = liveResult ?? savedEval?.result ?? null;

  // Unit preference follows the desk across reloads without touching the saved answer.
  useEffect(() => {
    const prev = loadJSON<PersistedEval | null>(EVAL_KEY, null);
    if (prev) saveJSON(EVAL_KEY, { ...prev, unit });
  }, [unit]);

  const filteredPorts = ports.filter((p: { name?: string; subtext?: string }) =>
    `${p?.name ?? ""} ${p?.subtext ?? ""}`.toLowerCase().includes(portSearch.toLowerCase()),
  );
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="mono-label text-[#B45309]">{t("pg_evaluate")}</p>
          <h1 className="mt-1.5 font-display text-2xl md:text-3xl font-black tracking-[-0.02em] text-[#0A2342]">
            {t("req_eval")}
          </h1>
          <p className="text-[#6B7D99] mt-1">
            {t("req_eval_sub")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Coming soon")}
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-[#E2E6EB] bg-white hover:bg-[#FAF7F1] text-[#3D4F68] h-10 px-4 py-2 shrink-0 shadow-sm"
          aria-label="Export Dashboard Report"
        >
          <Download className="w-4 h-4 mr-2" />{t("export_report")}</button>
      </div>

      {/* Main Grid */}
      {isLoadingPorts || isLoadingCommodities ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-4 h-[600px] bg-[#E2E6EB] rounded-xl"></div>
          <div className="lg:col-span-8 h-[600px] bg-[#E2E6EB] rounded-xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Requisition Inputs */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-[#E2E6EB] bg-white shadow-sm flex flex-col h-full">
              {/* Card Header */}
              <div className="p-6 pb-2 border-b-0 flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#0A2342]" />
                  <h2 className="font-display text-xl font-bold text-[#0A2342]">{t("req_inputs")}</h2>
                </div>
                <p className="text-sm text-[#6B7D99] pl-7">
                  {t("req_inputs_sub")}
                </p>
              </div>

              {/* Card Content */}
              <div className="p-6 pt-4 space-y-5 flex-1">
                {/* Volume */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0A2342] flex items-center">
                    {t("volume_mt")} <span className="text-[#B42318] ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-[#E2E6EB] bg-transparent px-3 py-2 text-sm text-[#0A2342] placeholder:text-[#6B7D99]/60 focus:outline-none focus:ring-2 focus:ring-[#D95D0F]/30 focus:border-transparent transition-all pr-12"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#6B7D99] text-sm">
                      {t("unit_mt")}
                    </div>
                  </div>
                </div>

                {/* Destination Port */}
                <div className="space-y-2 relative" ref={portRef}>
                  <label className="text-sm font-semibold text-[#0A2342] flex items-center">
                    {t("dest_port")}{" "}
                    <span className="text-[#B42318] ml-1">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Select Port"
                      aria-haspopup="listbox"
                      aria-expanded={portDropdownOpen}
                      onClick={() => setPortDropdownOpen(!portDropdownOpen)}
                      className={`flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-[#3D4F68] transition-all shadow-sm ${portDropdownOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] hover:border-[#6B7D99]"}`}
                    >
                      <span
                        className={
                          selectedPort ? "text-[#0A2342]" : "text-[#6B7D99]"
                        }
                      >
                        {selectedPort ? selectedPort.name : t("select_port")}
                      </span>
                      <div className="flex items-center space-x-2">
                        {selectedPort && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPort(null);
                            }}
                            className="text-[#6B7D99] hover:text-[#3D4F68] font-bold px-1 transition-colors"
                          >
                            &times;
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-[#6B7D99] transition-transform duration-200 ${portDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {portDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 border-b border-[#E2E6EB] flex items-center bg-[#FAF7F1] sticky top-0">
                          <Search className="w-4 h-4 text-[#6B7D99] mr-2 shrink-0" />
                          <input
                            type="text"
                            placeholder={t("search_ports")}
                            value={portSearch}
                            onChange={(e) => setPortSearch(e.target.value)}
                            className="w-full bg-transparent text-sm focus:outline-none text-[#3D4F68] placeholder:text-[#6B7D99]/60"
                          />
                        </div>
                        <ul className="max-h-60 overflow-auto py-1">
                          {filteredPorts.length > 0 ? (
                            filteredPorts.map(
                              (port: { name: string; subtext: string }) => (
                                <li
                                  key={port.name}
                                  onClick={() => {
                                    setSelectedPort(port);
                                    setPortDropdownOpen(false);
                                    setPortSearch("");
                                  }}
                                  className={`flex flex-col px-3 py-2 cursor-pointer text-sm transition-colors ${selectedPort?.name === port.name ? "bg-[#FDF1E7]" : "hover:bg-[#FAF7F1]"}`}
                                >
                                  <span
                                    className={`font-medium ${selectedPort?.name === port.name ? "text-[#B45309]" : "text-[#0A2342]"}`}
                                  >
                                    {port.name}
                                  </span>
                                  <span
                                    className={`text-xs ${selectedPort?.name === port.name ? "text-[#D95D0F]" : "text-[#6B7D99]"}`}
                                  >
                                    {port.subtext}
                                  </span>
                                </li>
                              ),
                            )
                          ) : (
                            <li className="px-3 py-4 text-center text-sm text-[#6B7D99]">
                              {t("no_ports")}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Commodity Type */}
                <div className="space-y-2 relative" ref={commodityRef}>
                  <label className="text-sm font-semibold text-[#0A2342] flex items-center">
                    {t("commodity_type")} <span className="text-[#B42318] ml-1">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Select Commodity"
                      aria-haspopup="listbox"
                      aria-expanded={commodityOpen}
                      onClick={() => setCommodityOpen(!commodityOpen)}
                      className={`flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-[#3D4F68] transition-all shadow-sm ${commodityOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] hover:border-[#6B7D99]"}`}
                    >
                      <span className="text-[#0A2342]">
                        {selectedCommodity}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#6B7D99] transition-transform duration-200 ${commodityOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {commodityOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <ul className="max-h-60 overflow-auto py-1">
                          {commodities.map(
                            (item: string | { name: string }) => {
                              const name =
                                typeof item === "string" ? item : item.name;
                              return (
                                <li
                                  key={name}
                                  onClick={() => {
                                    setSelectedCommodity(name);
                                    setCommodityOpen(false);
                                  }}
                                  className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${selectedCommodity === name ? "bg-[#FDF1E7] text-[#B45309] font-medium" : "text-[#3D4F68] hover:bg-[#FAF7F1]"}`}
                                >
                                  {name}
                                  {selectedCommodity === name && (
                                    <CheckCircle2 className="w-4 h-4 ml-auto text-[#B45309]" />
                                  )}
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Laycan Window */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0A2342] flex items-center">
                    {t("laycan_window")}{" "}
                    <span className="text-[#6B7D99] font-normal ml-1 text-xs">
                      {t("req_optional")}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-[#6B7D99]" />
                    </div>
                    <input
                      type="text"
                      defaultValue={t("laycan_default")}
                      className="flex h-10 w-full rounded-lg border border-[#E2E6EB] bg-transparent pl-10 pr-3 py-2 text-sm text-[#0A2342] placeholder:text-[#6B7D99]/60 focus:outline-none focus:ring-2 focus:ring-[#D95D0F]/30 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Vessel Preference */}
                <div className="space-y-2 relative" ref={vesselRef}>
                  <label className="text-sm font-semibold text-[#0A2342] flex items-center">
                    {t("preferred_vessel")}{" "}
                    <span className="text-[#6B7D99] font-normal ml-1 text-xs">
                      {t("req_optional")}
                    </span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Select Vessel Class"
                      aria-haspopup="listbox"
                      aria-expanded={vesselOpen}
                      onClick={() => setVesselOpen(!vesselOpen)}
                      className={`flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-[#3D4F68] transition-all shadow-sm ${vesselOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] hover:border-[#6B7D99]"}`}
                    >
                      <span className="text-[#0A2342]">{selectedVessel}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#6B7D99] transition-transform duration-200 ${vesselOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {vesselOpen && (
                      <div className="absolute z-50 bottom-full mb-2 w-full rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <ul className="max-h-60 overflow-auto py-1">
                          {["Supramax", "Panamax", "Capesize", "Handysize"].map(
                            (item) => (
                              <li
                                key={item}
                                onClick={() => {
                                  setSelectedVessel(item);
                                  setVesselOpen(false);
                                }}
                                className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${selectedVessel === item ? "bg-[#FDF1E7] text-[#B45309] font-medium" : "text-[#3D4F68] hover:bg-[#FAF7F1]"}`}
                              >
                                {item}
                                {selectedVessel === item && (
                                  <CheckCircle2 className="w-4 h-4 ml-auto text-[#B45309]" />
                                )}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 mt-auto">
                <button
                  type="button"
                  aria-label="Evaluate Requisition"
                  onClick={() => evaluateRequisition()}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-[#D95D0F] text-white hover:bg-[#B45309] h-10 px-4 py-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  {loading ? t("evaluating") : t("evaluate_constraints")}
                </button>
                {error && (
                  <div className="text-[#B42318] text-sm mt-2">
                    {error instanceof Error
                      ? error.message
                      : t("eval_error")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Evaluation Results */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-[#E2E6EB] bg-white shadow-sm overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-[#E2E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#0A2342]" />
                  <h2 className="font-display text-xl font-bold text-[#0A2342] mr-2">
                    Evaluation Results
                  </h2>
                  {result && (
                    <span
                      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${result.feasible ? "border-[#0E7A3D]/25 bg-[#E9F5EE] text-[#0E7A3D]" : "border-[#F3C2C2] bg-[#FDECEC] text-[#B42318]"}`}
                    >
                      {result.feasible ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <Info className="w-3.5 h-3.5 mr-1" />
                      )}
                      {result.feasible ? t("feasible") : t("not_feasible")}
                    </span>
                  )}
                </div>
                {result && (
                  <span className="text-sm text-[#6B7D99]">
                    {t("evaluated_at")}: {evaluatedAt ?? "—"}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-8 flex-1">
                {!result && !loading && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-[#6B7D99]">
                    <Anchor className="w-12 h-12 mb-4 opacity-20" />
                    <p>{t("eval_empty")}</p>
                  </div>
                )}
                {loading && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-[#6B7D99]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D95D0F] mb-4"></div>
                    <p>{t("eval_loading")}</p>
                  </div>
                )}

                {result && (
                  <>
                  <div className="flex flex-col gap-4">
                    {/* Recommended Strategy Box */}
                    <div className="bg-white border border-[#E2E6EB] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4">
                      <div>
                        <p className="text-xs font-bold text-[#6B7D99] uppercase tracking-wider mb-2">
                          {t("strategy_kicker")}
                        </p>
                        <h3 className="text-2xl font-semibold text-[#0A2342]">
                          {result.strategy.includes("into") ? (
                            <>
                              {t("split_into")}{" "}
                              <span className="text-[#D95D0F] font-bold">
                                {result.strategy.split("into")[1]}
                              </span>
                            </>
                          ) : (
                            result.strategy
                          )}
                        </h3>
                      </div>
                      {result.feasible && (
                        <div className="flex items-center justify-center bg-gray-50/50 border border-[#E2E6EB] rounded-lg p-3 shadow-sm flex-col space-y-1 min-w-[140px]">
                          <div className="flex items-center text-[#0A2342] font-semibold space-x-2">
                            <Ship className="w-5 h-5 text-[#0A2342]" />
                            <span>{t("vessels_FMT").replace("{n}", String(result.total_vessels))}</span>
                          </div>
                          <span className="text-sm text-[#6B7D99]">
                            {result.vessel_class}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* AI Insight Box */}
                    {result.ai_insight && (
                      <div className="bg-gradient-to-r from-[#FDF1E7] to-[#FAF7F1] border border-[#D95D0F]/20 rounded-lg p-5 flex flex-col shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Info className="w-4 h-4 text-[#D95D0F]" />
                          <p className="text-xs font-bold text-[#D95D0F] uppercase tracking-wider">
                            {t("ai_insight")}
                          </p>
                        </div>
                        <p className="text-[15px] text-[#0A2342] leading-relaxed font-medium">
                          {result.ai_insight}
                        </p>
                      </div>
                    )}
                  </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                      <div className="flex flex-col">
                        <p className="text-sm text-[#6B7D99] mb-1 font-medium">{t("stat_volume")}</p>
                        <p className="text-lg font-semibold text-[#0A2342]">
                          {t("vol_mt_FMT").replace("{n}", volume)}
                        </p>
                      </div>
                      <div className="flex flex-col border-l border-[#E2E6EB] pl-4">
                        <p className="text-sm text-[#6B7D99] mb-1 font-medium">{t("stat_vessels")}</p>
                        <p
                          className={`text-lg font-semibold ${result.feasible ? "text-[#0E7A3D]" : "text-[#6B7D99]"}`}
                        >
                          {result.total_vessels || "-"}
                        </p>
                      </div>
                      <div className="flex flex-col border-l border-[#E2E6EB] pl-4">
                        <p className="text-sm text-[#6B7D99] mb-1 font-medium">{t("stat_per_vessel")}</p>
                        <p className="text-lg font-semibold text-[#0A2342]">
                          {result.feasible
                            ? t("approx_mt_FMT").replace("{n}", Math.round(Number(volume.replace(/,/g, "")) / result.total_vessels).toLocaleString())
                            : "-"}
                        </p>
                      </div>
                      <div className="flex flex-col border-l border-[#E2E6EB] pl-4">
                        <p className="text-sm text-[#6B7D99] mb-1 font-medium">{t("stat_util")}</p>
                        <p className="text-lg font-semibold text-[#0E7A3D]">
                          {result.feasible
                            ? `${((result.requestedVolume / (result.vesselCapacity * result.total_vessels)) * 100).toFixed(1)}%`
                            : "-"}
                        </p>
                      </div>
                      <div className="flex flex-col border-l border-[#E2E6EB] pl-4">
                        <p className="text-sm text-[#6B7D99] mb-1 font-medium">{t("stat_status")}</p>
                        <p
                          className={`text-lg font-semibold ${result.feasible ? "text-[#0E7A3D]" : "text-[#B42318]"}`}
                        >
                          {result.feasible ? t("feasible") : t("not_feasible")}
                        </p>
                      </div>
                    </div>

                    {/* Draft Analysis */}
                    {result.feasible && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold text-[#0A2342] mb-2">
                              {t("draft_title")}
                            </h3>
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center text-sm font-medium text-[#3D4F68]">
                                <div className="w-6 border-t-2 border-dashed border-[#0A2342] mr-2"></div>
                                {t("leg_calculated")}
                              </div>
                              <div className="flex items-center text-sm font-medium text-[#3D4F68]">
                                <div className="w-6 border-t-2 border-dashed border-[#D95D0F] mr-2"></div>
                                {t("leg_portmax")}
                              </div>
                            </div>
                          </div>

                          {/* Toggle */}
                          <div className="inline-flex items-center rounded-lg border border-[#E2E6EB] p-1 bg-white self-start">
                            <button
                              type="button"
                              aria-label="Set unit to Meters"
                              aria-pressed={unit === "Meters"}
                              onClick={() => setUnit("Meters")}
                              className={`px-4 py-1 text-sm font-medium rounded-sm transition-colors ${unit === "Meters" ? "bg-[#D95D0F] text-white shadow-sm" : "text-[#6B7D99] hover:text-[#0A2342] bg-transparent"}`}
                            >{t("unit_meters")}</button>
                            <button
                              type="button"
                              aria-label="Set unit to Feet"
                              aria-pressed={unit === "Feet"}
                              onClick={() => setUnit("Feet")}
                              className={`px-4 py-1 text-sm font-medium rounded-sm transition-colors ${unit === "Feet" ? "bg-[#D95D0F] text-white shadow-sm" : "text-[#6B7D99] hover:text-[#0A2342] bg-transparent"}`}
                            >{t("unit_feet")}</button>
                          </div>
                        </div>

                        {/* Visualization Area */}
                        <div className="relative border border-[#E2E6EB] rounded-xl bg-[#EAF4FB] h-[360px] overflow-hidden flex flex-col justify-end">
                          <div className="absolute inset-0 flex justify-center items-end bottom-[-20px]">
                            <div className="relative w-full h-[380px] z-10">
                              <Image
                                src="/dashboard-draft-analysis-ship-image.png"
                                alt="Ship"
                                fill
                                className="object-contain object-bottom"
                              />
                            </div>
                          </div>

                          <div className="absolute left-1/2 top-[10%] bottom-0 w-px border-l-2 border-dashed border-white/50 z-20"></div>

                          {/* {t("leg_calculated")} Line */}
                          <div className="absolute w-full top-[160px] flex items-center z-20">
                            <div className="flex-1 border-t-2 border-dashed border-[#0A2342]"></div>
                            <div className="flex-1 border-t-2 border-dashed border-[#0A2342]"></div>
                            <div className="absolute right-6 flex items-center space-x-1.5 bg-white/50 backdrop-blur-sm px-2 py-1 rounded">
                              <span className="text-[#0A2342] font-bold text-sm">
                                {unit === "Meters"
                                  ? `${result.calculatedDraft} m`
                                  : `${(result.calculatedDraft * 3.28084).toFixed(1)} ft`}
                              </span>
                              <span className="text-[#0A2342] text-sm font-medium">
                                {t("leg_calculated")}
                              </span>
                              <Info className="w-3.5 h-3.5 text-[#6B7D99]" />
                            </div>
                          </div>

                          {/* {t("leg_portmax")} Line */}
                          <div className="absolute w-full top-[240px] flex items-center z-20">
                            <div className="flex-1 border-t-2 border-dashed border-[#D95D0F]"></div>
                            <div className="flex-1 border-t-2 border-dashed border-[#D95D0F]"></div>
                            <div className="absolute right-6 flex items-center space-x-1.5 bg-white/50 backdrop-blur-sm px-2 py-1 rounded">
                              <span className="text-[#D95D0F] font-bold text-sm">
                                {unit === "Meters"
                                  ? `${result.portMaxDraft.toFixed(2)} m`
                                  : `${(result.portMaxDraft * 3.28084).toFixed(1)} ft`}
                              </span>
                              <span className="text-[#D95D0F] text-sm font-medium">
                                {t("leg_portmax")}
                              </span>
                              <Info className="w-3.5 h-3.5 text-[#6B7D99]" />
                            </div>
                          </div>

                          {/* Under Keel Clearance Arrow */}
                          <div className="absolute right-[12rem] xl:right-[14rem] top-[160px] h-[80px] w-0 border-l-2 border-[#0E7A3D] z-20 flex flex-col justify-between items-center">
                            <ArrowUp className="w-4 h-4 text-[#0E7A3D] absolute -top-2 -ml-[9px]" />
                            <ArrowDown className="w-4 h-4 text-[#0E7A3D] absolute -bottom-2 -ml-[9px]" />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-start bg-white/50 backdrop-blur-sm px-2 py-1 rounded whitespace-nowrap">
                              <span className="text-[#0E7A3D] font-bold text-sm">
                                {unit === "Meters"
                                  ? `${result.clearance_margin} m`
                                  : `${(result.clearance_margin * 3.28084).toFixed(1)} ft`}
                              </span>
                              <span className="text-[#0E7A3D] text-sm font-medium">{t("ukc_label")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Details Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-[#E2E6EB]">
                          <div className="flex flex-col">
                            <p className="text-sm text-[#6B7D99] mb-1">{t("det_port")}</p>
                            <p className="text-sm font-semibold text-[#0A2342]">
                              {selectedPort?.name}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm text-[#6B7D99] mb-1">
                              Commodity
                            </p>
                            <p className="text-sm font-semibold text-[#0A2342]">
                              {selectedCommodity}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm text-[#6B7D99] mb-1">
                              Tide Adjustment
                            </p>
                            <p className="text-sm font-semibold text-[#0A2342]">
                              Dynamic (Live)
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm text-[#6B7D99] mb-1">
                              UKC Requirement
                            </p>
                            <p className="text-sm font-semibold text-[#0A2342]">
                              10% of Draft
                            </p>
                          </div>
                          <div className="flex flex-row bg-[#E9F5EE] rounded-lg p-2 border border-[#0E7A3D]/25 justify-between items-center col-span-1">
                            <p className="text-xs text-[#0E7A3D] font-semibold mb-0.5">
                              UKC Achieved
                            </p>
                            <p className="text-sm font-bold text-[#0E7A3D]">
                              {result.clearance_margin} m{" "}
                              <span className="font-normal">(12.1%)</span>
                            </p>
                            <div className="bg-[#0E7A3D] rounded-full p-0.5">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Footer text */}
                <p className="text-xs text-[#6B7D99] mt-4">
                  {t("eval_footnote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
