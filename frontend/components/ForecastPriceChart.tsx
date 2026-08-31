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
      const p90 = parseFloat(
        (p50 * (1.15 + (shockFactor - 1.0) * 0.35)).toFixed(2)
      );

      p50Data.push(p50);
      p10Data.push(p10);
      p90Data.push(p90);
    }

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        padding: [10, 14],
        textStyle: {
          color: "#0E2841",
          fontFamily: "Inter",
          fontSize: 12,
        },
        extraCssText:
          "box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05); border-radius: 10px;",
        formatter: (params: any[]) => {
          let res = `<div style="font-family: Inter; font-size: 12px;">`;
          res += `<div style="font-weight: 600; color: #0E2841; margin-bottom: 8px;">${params[0]?.name}</div>`;
          params.forEach((p) => {
            const color =
              p.seriesName === "P50 Forecast"
                ? "#0E2841"
                : p.seriesName === "P90 Pessimistic"
                ? "#DC2626"
                : "#138808";
            res += `<div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">`;
            res += `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>`;
            res += `<span style="color: #64748B; font-size: 11px;">${p.seriesName}</span>`;
            res += `<span style="margin-left: auto; font-weight: 600; color: #0E2841;">$${p.value}</span>`;
            res += `</div>`;
          });
          return res + "</div>";
        },
      },
      legend: {
        data: ["P50 Forecast", "P90 Pessimistic", "P10 Optimistic"],
        textStyle: {
          color: "#64748B",
          fontFamily: "Inter",
          fontSize: 12,
        },
        icon: "roundRect",
        itemWidth: 14,
        itemHeight: 8,
        top: 0,
        right: 0,
      },
      grid: {
        left: "0",
        right: "0",
        bottom: "0",
        top: "40px",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "#94A3B8",
          fontFamily: "Inter",
          fontSize: 11,
          interval: 14,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#94A3B8",
          fontFamily: "JetBrains Mono",
          fontSize: 11,
          formatter: "${value}",
        },
        splitLine: {
          lineStyle: {
            color: "#F1F5F9",
            type: "dashed",
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: "P90 Pessimistic",
          type: "line",
          data: p90Data,
          itemStyle: { color: "#F58A2A" },
          lineStyle: { width: 1.5, type: "dashed" },
          smooth: true,
          symbol: "none",
        },
        {
          name: "P50 Forecast",
          type: "line",
          data: p50Data,
          itemStyle: { color: "#0E2841" },
          lineStyle: { width: 2.5 },
          smooth: true,
          symbol: "none",
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(14, 40, 65, 0.08)" },
                { offset: 1, color: "rgba(14, 40, 65, 0)" },
              ],
            },
          },
        },
        {
          name: "P10 Optimistic",
          type: "line",
          data: p10Data,
          itemStyle: { color: "#138808" },
          lineStyle: { width: 1.5, type: "dashed" },
          smooth: true,
          symbol: "none",
        },
      ],
    };
  }, [shockFactor]);

  return (
    <div className="w-full h-80">
      <ReactECharts
        option={chartOption}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "svg" }}
      />
   </div>
  );
}
