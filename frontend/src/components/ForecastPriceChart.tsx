"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ForecastDay = {
  date: string;
  p10: number;
  p50: number;
  p90: number;
};

type ForecastResult = ForecastDay[];

const ForecastPriceChart = React.memo(function ForecastPriceChart() {
  const [shockMultiplier, setShockMultiplier] = React.useState(1.0);

  const { data, isLoading, isError, refetch } = useQuery<ForecastResult>({
    queryKey: ["forecast", shockMultiplier],
    queryFn: async () => {
      const baseUrl =
        "";
      const res = await fetch(
        `${baseUrl}/api/v1/forecast/rates?shockMultiplier=${shockMultiplier}`,
      );
      if (!res.ok) throw new Error("Failed to fetch forecast");
      const payload = await res.json();
      if (payload && payload.forecast && Array.isArray(payload.forecast)) {
        return payload.forecast as ForecastResult;
      }
      return Array.isArray(payload) ? (payload as ForecastResult) : [];
    },
  });

  const series = React.useMemo(() => data ?? [], [data]);
  const latest = series.length > 0 ? series[series.length - 1] : undefined;

  return (
    <div className="p-6 bg-white border border-[#E2E6EB] rounded-2xl shadow-sm">
      <p className="mono-label text-[#B45309]">Outlook desk</p>
      <div className="mt-1.5 mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-black tracking-tight text-[#0A2342]">
          ML Freight Forecast (90-Day)
        </h2>
        <p className="font-mono text-[11px] text-[#6B7D99]">
          Shock {shockMultiplier.toFixed(1)}x · P10–P90 band · {series.length}{" "}
          days
        </p>
      </div>

      <div className="mb-6">
        <label className="flex justify-between items-center text-[#3D4F68] mb-3">
          <span className="font-semibold text-sm">
            What-If Market Shock Multiplier
          </span>
          <span className="font-mono bg-[#FDF1E7] px-3 py-1 rounded-lg border border-[#D95D0F]/30 text-[#B45309] font-bold text-sm">
            {shockMultiplier.toFixed(1)}x
          </span>
        </label>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={shockMultiplier}
          onChange={(e) => setShockMultiplier(parseFloat(e.target.value))}
          className="w-full"
          aria-label="Market shock multiplier 0.1 to 5.0"
        />
        <p className="text-xs text-[#6B7D99] mt-2">
          Adjust historical volatility variance bounds in real-time.
        </p>
      </div>

      {isLoading && series.length === 0 && (
        <div className="flex items-center space-x-2 text-[#6B7D99] font-medium">
          <div className="w-4 h-4 rounded-full border-2 border-[#E2E6EB] border-t-[#D95D0F] animate-spin"></div>
          <span>Running LSTM model...</span>
        </div>
      )}

      {isError && series.length === 0 && (
        <div className="rounded-xl border border-[#E2E6EB] bg-[#FAF7F1] p-5 text-center">
          <p className="font-bold text-[#0A2342] text-sm">
            Outlook unavailable.
          </p>
          <p className="mt-1 text-[12.5px] text-[#6B7D99]">
            The forecast desk did not answer. Check the backend and retry.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-[#0A2342] px-4 py-2 text-[12.5px] font-bold text-white hover:bg-[#14315C]"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && series.length === 0 && (
        <div className="rounded-xl border border-[#E2E6EB] bg-[#FAF7F1] p-5 text-center">
          <p className="font-bold text-[#0A2342] text-sm">
            No forecast points yet.
          </p>
          <p className="mt-1 text-[12.5px] text-[#6B7D99]">
            Enter requisition details and evaluate constraints.
          </p>
        </div>
      )}

      {series.length > 0 && (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={series}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid stroke="#EDF0F4" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 10,
                  fill: "#6B7D99",
                  fontFamily: "monospace",
                }}
                tickLine={false}
                axisLine={{ stroke: "#E2E6EB" }}
                interval={13}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{
                  fontSize: 10,
                  fill: "#6B7D99",
                  fontFamily: "monospace",
                }}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v: number) =>
                  `$${Math.round(v).toLocaleString("en-US")}`
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#E2E6EB",
                  fontSize: 12,
                }}
                labelFormatter={(v) => `Date ${String(v)}`}
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString("en-US")}`,
                  String(name),
                ]}
              />
              <Area
                type="monotone"
                dataKey="p90"
                stroke="none"
                fill="#FDF1E7"
                fillOpacity={0.9}
                name="p90"
              />
              <Area
                type="monotone"
                dataKey="p10"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                name="p10"
              />
              <Line
                type="monotone"
                dataKey="p90"
                stroke="#B42318"
                strokeWidth={1.5}
                dot={false}
                name="p90"
              />
              <Line
                type="monotone"
                dataKey="p50"
                stroke="#D95D0F"
                strokeWidth={2.5}
                dot={false}
                name="p50"
              />
              <Line
                type="monotone"
                dataKey="p10"
                stroke="#0E7A3D"
                strokeWidth={1.5}
                dot={false}
                name="p10"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {latest && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#E9F5EE] border border-[#0E7A3D]/25 p-5 rounded-xl flex flex-col justify-center">
            <div className="mono-label text-[#0E7A3D] mb-2">
              P10 (Optimistic)
            </div>
            <div className="font-mono text-3xl font-bold text-[#0A2342]">
              ${latest.p10.toLocaleString("en-US")}
            </div>
          </div>
          <div className="bg-[#FAF7F1] border border-[#E2E6EB] p-5 rounded-xl flex flex-col justify-center">
            <div className="mono-label text-[#6B7D99] mb-2">P50 (Median)</div>
            <div className="font-mono text-3xl font-bold text-[#0A2342]">
              ${latest.p50.toLocaleString("en-US")}
            </div>
          </div>
          <div className="bg-[#FDF1E7] border border-[#D95D0F]/30 p-5 rounded-xl flex flex-col justify-center">
            <div className="mono-label text-[#B45309] mb-2">
              P90 (Pessimistic)
            </div>
            <div className="font-mono text-3xl font-bold text-[#0A2342]">
              ${latest.p90.toLocaleString("en-US")}
            </div>
          </div>
        </div>
      )}

      {series.length > 0 && (
        <div className="mt-6 flex items-center justify-end text-xs font-semibold text-[#3D4F68]">
          <span className="relative flex h-2.5 w-2.5 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0E7A3D] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0E7A3D]"></span>
          </span>
          LSTM Hybrid Model Active
        </div>
      )}
    </div>
  );
});

export default ForecastPriceChart;
