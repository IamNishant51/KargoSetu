"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";

type ForecastResult = Array<{
  date: string;
  p10: number;
  p50: number;
  p90: number;
}>;

const ForecastPriceChart = React.memo(function ForecastPriceChart() {
  const [shockMultiplier, setShockMultiplier] = React.useState(1.0);

  const { data, isLoading } = useQuery<ForecastResult>({
    queryKey: ["forecast", shockMultiplier],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(
        `${baseUrl}/api/v1/forecast/rates?shockMultiplier=${shockMultiplier}`,
      );
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    },
  });

  const displayData = React.useMemo(() => data?.[0], [data]);

  return (
    <div className="p-6 bg-white border border-[#E2E6EB] rounded-2xl shadow-sm">
      <p className="mono-label text-[#B45309]">Outlook desk</p>
      <h2 className="mt-1.5 font-display text-xl font-black tracking-tight text-[#0A2342] mb-6">
        ML Freight Forecast (90-Day)
      </h2>

      <div className="mb-8">
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
          min="0.5"
          max="3.0"
          step="0.1"
          value={shockMultiplier}
          onChange={(e) => setShockMultiplier(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-[#6B7D99] mt-2">
          Adjust historical volatility variance bounds in real-time.
        </p>
      </div>

      {isLoading && !data && (
        <div className="flex items-center space-x-2 text-[#6B7D99] font-medium">
          <div className="w-4 h-4 rounded-full border-2 border-[#E2E6EB] border-t-[#D95D0F] animate-spin"></div>
          <span>Running LSTM model...</span>
        </div>
      )}

      {displayData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#E9F5EE] border border-[#0E7A3D]/25 p-5 rounded-xl flex flex-col justify-center">
            <div className="mono-label text-[#0E7A3D] mb-2">
              P10 (Optimistic)
            </div>
            <div className="font-mono text-3xl font-bold text-[#0A2342]">
              ${displayData.p10.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#FAF7F1] border border-[#E2E6EB] p-5 rounded-xl flex flex-col justify-center">
            <div className="mono-label text-[#6B7D99] mb-2">
              P50 (Median)
            </div>
            <div className="font-mono text-3xl font-bold text-[#0A2342]">
              ${displayData.p50.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#FDF1E7] border border-[#D95D0F]/30 p-5 rounded-xl flex flex-col justify-center">
            <div className="mono-label text-[#B45309] mb-2">
              P90 (Pessimistic)
            </div>
            <div className="font-mono text-3xl font-bold text-[#0A2342]">
              ${displayData.p90.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {data && (
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
