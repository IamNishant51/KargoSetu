"use client";
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface ForecastPriceChartProps {
  shockFactor: number;
}

export default function ForecastPriceChart({ shockFactor }: ForecastPriceChartProps) {
  const chartOption = useMemo(() => {
    const dates: string[] = [];
    const p50Data: number[] = [];
    const p10Data: number[] = [];
    const p90Data: number[] = [];

    const basePrice = 18.42;
    const today = new Date();

    for (let i = 1; i <= 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(5, 10));

      const trend = i * 0.03 * shockFactor;
      const sinOsc = Math.sin(i / 8) * 0.9;
      const p50 = parseFloat((basePrice + trend + sinOsc).toFixed(2));
      const p10 = parseFloat((p50 * 0.88).toFixed(2));
      const p90 = parseFloat((p50 * (1.15 + (shockFactor - 1.0) * 0.35)).toFixed(2));

      p50Data.push(p50);
      p10Data.push(p10);
      p90Data.push(p90);
    }

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#101A30",
        borderColor: "#26385C",
        textStyle: { color: "#FFFFFF" },
        formatter: (params: any[]) => {
          let res = `<div class="font-mono text-xs"><strong class="text-[#00E5FF]">${params[0]?.name}</strong><br/>`;
          params.forEach((p) => {
            res += `${p.seriesName}: <span class="font-bold">$${p.value}</span><br/>`;
          });
          return res + "</div>";
        },
      },
      legend: {
        data: ["P50 Forecast", "P90 Pessimistic", "P10 Optimistic"],
        textStyle: { color: "#8892B0" },
        top: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: { color: "#8892B0" },
        axisLine: { lineStyle: { color: "#26385C" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#8892B0", formatter: "${value}" },
        splitLine: { lineStyle: { color: "#101A30" } },
        axisLine: { lineStyle: { color: "#26385C" } },
      },
      series: [
        {
          name: "P50 Forecast",
          type: "line",
          data: p50Data,
          itemStyle: { color: "#00E5FF" },
          lineStyle: { width: 3 },
          smooth: true,
        },
        {
          name: "P90 Pessimistic",
          type: "line",
          data: p90Data,
          itemStyle: { color: "#EF4444" },
          lineStyle: { type: "dashed", width: 2 },
          smooth: true,
        },
        {
          name: "P10 Optimistic",
          type: "line",
          data: p10Data,
          itemStyle: { color: "#10B981" },
          lineStyle: { type: "dotted", width: 2 },
          smooth: true,
        },
      ],
    };
  }, [shockFactor]);

  return (
    <div className="w-full h-72">
      <ReactECharts option={chartOption} style={{ height: "100%", width: "100%" }} theme="dark" />
    </div>
  );
}
