"use client";

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

export default function ForecastsPage() {
  const [shock, setShock] = useState(2.0);
  const [debouncedShock, setDebouncedShock] = useState(2.0);
  const [days, setDays] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Predictive Freight Rates
            </h1>
            <p className="text-slate-500 mt-1">
              AI-powered forecasting of freight rates with adjustable market
              shock scenarios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm">
              <ArrowRightLeft className="w-4 h-4 text-slate-400 mr-2" />
              <select className="bg-transparent text-sm font-medium focus:outline-none text-slate-700">
                <option>Route: Singapore → Rotterdam</option>
                <option>Route: Shanghai → Los Angeles</option>
              </select>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <select
                className="bg-transparent text-sm font-medium focus:outline-none text-slate-700"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={180}>180 Days</option>
              </select>
            </div>

            <button
              type="button"
              aria-label="Export forecasts to CSV"
              onClick={handleExport}
              className="flex items-center bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Shock Slider Card */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">
                Market Shock Multiplier (1.0x to 3.0x)
              </h2>
              <span
                className="text-slate-400 text-sm cursor-help"
                title="Adjust volatility variance"
              >
                ⓘ
              </span>
            </div>
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
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
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>1.0x</span>
              <span>1.5x</span>
              <span>2.0x</span>
              <span>2.5x</span>
              <span>3.0x</span>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-6">
            Freight Rate Forecast (USD per Day)
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
                      <div className="border-t border-slate-100 border-dashed w-full h-0" />
                      <div className="border-t border-slate-100 border-dashed w-full h-0" />
                      <div className="border-t border-slate-100 border-dashed w-full h-0" />
                      <div className="border-t border-slate-100 border-dashed w-full h-0" />
                      <div className="border-t border-slate-100 border-dashed w-full h-0" />
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
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    dy={10}
                    interval={3}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}K`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: unknown) => [
                      `$${Number(value || 0).toLocaleString()}`,
                      "",
                    ]}
                    labelStyle={{
                      color: "#0F172A",
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
                    name="P90 (Bullish)"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#F97316", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    name="P50 (Base Case)"
                    stroke="#0F172A"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#0F172A", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p10"
                    name="P10 (Bearish)"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#10B981", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Forecast Data (USD per Day)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">P10 (Bearish)</th>
                  <th className="px-6 py-4 font-medium text-left">
                    P50 (Base Case)
                  </th>
                  <th className="px-6 py-4 font-medium text-left">
                    P90 (Bullish)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 transition-colors"
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
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                            {row.rawDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              timeZone: "UTC",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-semibold">
                            ${row.p10.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                            ${row.p50.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-orange-600 font-semibold">
                            ${row.p90.toLocaleString()}
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing{" "}
              {chartData.length === 0
                ? 0
                : Math.min(chartData.length, (currentPage - 1) * 10 + 1)}{" "}
              to {Math.min(chartData.length, currentPage * 10)} of{" "}
              {chartData.length} entries
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Previous page"
                className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
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
                    className={`px-3 py-1 rounded border ${currentPage === i + 1 ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ),
              )}

              <button
                type="button"
                aria-label="Next page"
                className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
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
