"use client";
import { useLanguage } from "@/i18n/LanguageContext";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Download, ArrowRightLeft, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { loadJSON, saveJSON } from "@/lib/storage";

const FC_VIEW_KEY = "kargosetu_fc_view_v1";
const DEFAULT_FC_VIEW = { shock: 2.0, days: 30, currentPage: 1 };

export default function ForecastsPage() {
  const { t } = useLanguage();
  const [savedFcView] = useState(() => loadJSON(FC_VIEW_KEY, DEFAULT_FC_VIEW));
  const [shock, setShock] = useState(savedFcView.shock);
  const [debouncedShock, setDebouncedShock] = useState(savedFcView.shock);
  const [days, setDays] = useState(savedFcView.days);
  const [currentPage, setCurrentPage] = useState(
    Number.isInteger(savedFcView.currentPage) && savedFcView.currentPage >= 1
      ? savedFcView.currentPage
      : 1,
  );

  // Shock, horizon, and table page survive reloads; the chart refetches itself.
  useEffect(() => {
    saveJSON(FC_VIEW_KEY, { shock, days, currentPage });
  }, [shock, days, currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedShock(shock);
    }, 300);
    return () => clearTimeout(handler);
  }, [shock]);

  const { data: apiChartData, isLoading } = useQuery({
    queryKey: ["forecast", debouncedShock],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(
        `${baseUrl}/api/v1/forecast/rates?shockMultiplier=${debouncedShock}`,
      );
      if (!res.ok) throw new Error("Failed to fetch forecast");
      const json = await res.json();
      if (Array.isArray(json)) {
        return json.map(
          (pt: { date: string; p10: number; p50: number; p90: number }) => {
            const d = new Date(pt.date);
            return {
              date: d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              }),
              rawDate: d,
              p10: pt.p10,
              p50: pt.p50,
              p90: pt.p90,
            };
          },
        );
      }
      return [];
    },
  });

  const chartData = apiChartData ? apiChartData.slice(0, days) : [];

// Reset page when days change
  useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [days]);

  const handleExport = () => {
    if (!chartData || chartData.length === 0) return;

    const headers = ["Date", "P10", "P50", "P90"];
    const csvRows = [
      headers.join(","),
      ...chartData.map(
        (row) =>
          `${row.rawDate.toISOString().split("T")[0]},${row.p10},${row.p50},${row.p90}`,
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `forecast_data_${days}_days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="mono-label text-[#B45309]">{t("pg_forecasts")}</p>
            <h1 className="mt-1.5 font-display text-2xl font-black text-[#0A2342] tracking-[-0.02em]">{t("fc_title")}</h1>
            <p className="text-[#6B7D99] mt-1">
              {t("fc_sub")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-[#E2E6EB] rounded-lg px-3 py-2 shadow-sm">
              <ArrowRightLeft className="w-4 h-4 text-[#6B7D99] mr-2" />
              <select className="bg-transparent text-sm font-medium focus:outline-none text-[#3D4F68]">
                <option>Route: Singapore → Rotterdam</option>
                <option>Route: Shanghai → Los Angeles</option>
              </select>
            </div>

            <div className="flex items-center bg-white border border-[#E2E6EB] rounded-lg px-3 py-2 shadow-sm">
              <Calendar className="w-4 h-4 text-[#6B7D99] mr-2" />
              <select
                className="bg-transparent text-sm font-medium focus:outline-none text-[#3D4F68]"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={30}>{t("days_FMT").replace("{n}", "30")}</option>
                <option value={90}>{t("days_FMT").replace("{n}", "90")}</option>
                <option value={180}>{t("days_FMT").replace("{n}", "180")}</option>
              </select>
            </div>

            <button
              type="button"
              aria-label="Export forecasts to CSV"
              onClick={handleExport}
              className="flex items-center bg-[#D95D0F] hover:bg-[#B45309] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />{t("export")}</button>
          </div>
        </div>

        {/* Shock Slider Card */}
        <div className="bg-white p-6 border border-[#E2E6EB] rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-[#0A2342]">
                {t("shock_title")}
              </h2>
              <span
                className="text-[#6B7D99] text-sm cursor-help"
                title="Adjust volatility variance"
              >
                ⓘ
              </span>
            </div>
            <div className="bg-[#D95D0F] text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              {shock.toFixed(1)}x
            </div>
          </div>

          <div className="relative px-2">
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={shock}
              onChange={(e) => setShock(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#FAF7F1] rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D95D0F]/30"
            />
            <div className="flex justify-between text-xs text-[#6B7D99] mt-2">
              <span>1.0x</span>
              <span>1.5x</span>
              <span>2.0x</span>
              <span>2.5x</span>
              <span>3.0x</span>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white p-6 border border-[#E2E6EB] rounded-xl shadow-sm">
          <h2 className="font-display font-bold text-[#0A2342] mb-6">
            {t("freight_forecast")}
          </h2>

          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="h-full w-full flex flex-col justify-between py-2">
                <div className="flex items-center justify-center gap-8 h-9 mb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex flex-1 gap-4 items-end relative">
                  <div className="flex flex-col justify-between h-full pb-6 mr-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <div className="flex-1 flex gap-2 items-end h-full pb-6 relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                      <div className="border-t border-[#E2E6EB] border-dashed w-full h-0" />
                      <div className="border-t border-[#E2E6EB] border-dashed w-full h-0" />
                      <div className="border-t border-[#E2E6EB] border-dashed w-full h-0" />
                      <div className="border-t border-[#E2E6EB] border-dashed w-full h-0" />
                      <div className="border-t border-[#E2E6EB] border-dashed w-full h-0" />
                    </div>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${[48, 56, 42, 63, 51, 69, 45, 58, 52, 66][i % 10]}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-12 right-0 flex justify-between pr-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E6EB"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7D99", fontSize: 12 }}
                    dy={10}
                    interval={3}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7D99", fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}K`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #E2E6EB",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: unknown) => [
                      `$${Number(value || 0).toLocaleString()}`,
                      "",
                    ]}
                    labelStyle={{
                      color: "#0A2342",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "14px", color: "#475569" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p90"
                    name={t("p90")}
                    stroke="#D95D0F"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#D95D0F", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    name={t("p50")}
                    stroke="#0A2342"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#0A2342", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p10"
                    name={t("p10")}
                    stroke="#0E7A3D"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#0E7A3D", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-[#E2E6EB] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E2E6EB]">
            <h2 className="font-display font-bold text-[#0A2342]">
              {t("fc_table")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#6B7D99] uppercase bg-[#FAF7F1] border-b border-[#E2E6EB]">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("fc_date")}</th>
                  <th className="px-6 py-4 font-medium">{t("p10")}</th>
                  <th className="px-6 py-4 font-medium text-left">
                    {t("p50")}
                  </th>
                  <th className="px-6 py-4 font-medium text-left">
                    {t("p90")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EB]">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-[#FAF7F1] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      </tr>
                    ))
                  : chartData
                      .slice((currentPage - 1) * 10, currentPage * 10)
                      .map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-[#FAF7F1] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-[#3D4F68] font-medium">
                            {row.rawDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              timeZone: "UTC",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[#0E7A3D] font-semibold">
                            ${row.p10.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[#0A2342] font-medium">
                            ${row.p50.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[#B45309] font-semibold">
                            ${row.p90.toLocaleString()}
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[#E2E6EB] bg-[#FAF7F1] flex items-center justify-between text-xs text-[#6B7D99]">
            <span>
              {t("showing_FMT")
                .replace(
                  "{a}",
                  String(
                    chartData.length === 0
                      ? 0
                      : Math.min(chartData.length, (currentPage - 1) * 10 + 1),
                  ),
                )
                .replace("{b}", String(Math.min(chartData.length, currentPage * 10)))
                .replace("{c}", String(chartData.length))}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Previous page"
                className="px-3 py-1 bg-white border border-[#E2E6EB] rounded hover:bg-[#FAF7F1] disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>

              {Array.from({ length: Math.ceil(chartData.length / 10) }).map(
                (_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Page ${i + 1}`}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                    className={`px-3 py-1 rounded border ${currentPage === i + 1 ? "bg-[#D95D0F] text-white border-[#D95D0F]" : "bg-white border-[#E2E6EB] hover:bg-[#FAF7F1]"}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ),
              )}

              <button
                type="button"
                aria-label="Next page"
                className="px-3 py-1 bg-white border border-[#E2E6EB] rounded hover:bg-[#FAF7F1] disabled:opacity-50"
                disabled={
                  currentPage === Math.ceil(chartData.length / 10) ||
                  chartData.length === 0
                }
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(chartData.length / 10), p + 1),
                  )
                }
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
