# MODULE 3: FRONTEND ARCHITECTURE & IMPLEMENTATION

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Zustand, TanStack Query v5, Apache ECharts, MapLibre GL JS.

## 3.1 `RequisitionForm.tsx` (Zod Validation)
```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";

const reqSchema = z.object({
  originPort: z.string().min(3),
  destPort: z.string().min(3),
  commodity: z.enum(["Coking Coal", "Thermal Coal", "Iron Ore", "Limestone"]),
  volumeMt: z.number().min(10000).max(300000),
  laycanStart: z.string().date(),
  laycanEnd: z.string().date(),
});

type ReqForm = z.infer<typeof reqSchema>;

export function RequisitionForm() {
  const form = useForm<ReqForm>({ resolver: zodResolver(reqSchema) });
  const mutation = useMutation({
    mutationFn: async (data: ReqForm) => {
      const res = await fetch("/api/v1/requisitions/evaluate", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4 bg-[#101A30] p-6 rounded-lg border border-[#26385C]">
      <h2 className="text-[#00E5FF] font-space-grotesk text-xl">New Cargo Requisition</h2>
      {/* Form fields omitted for brevity; utilizing Shadcn Input/Select components */}
      <div className="grid grid-cols-2 gap-4">
        <input {...form.register("volumeMt", { valueAsNumber: true })} className="bg-[#080E1E] text-white border-[#26385C]" placeholder="Volume (MT)" />
        <select {...form.register("commodity")} className="bg-[#080E1E] text-white border-[#26385C]">
          <option value="Coking Coal">Coking Coal</option>
        </select>
      </div>
      <button type="submit" className="w-full bg-[#00E5FF] text-[#080E1E] font-bold py-2 rounded">
        Evaluate Constraints
      </button>
    </form>
  );
}
```

## 3.2 `ConstraintFeedbackCard.tsx`
```tsx
export function ConstraintFeedbackCard({ recommendation }: { recommendation: any }) {
  const isFeasible = recommendation.feasible;
  return (
    <div className={`p-4 border rounded-md ${isFeasible ? 'border-[#10B981] bg-[#10B981]/10' : 'border-[#EF4444] bg-[#EF4444]/10'}`}>
      <div className="flex justify-between items-center">
        <h3 className="font-space-grotesk font-semibold text-white">Vessel Recommendation</h3>
        <span className={`px-2 py-1 text-xs font-mono rounded ${isFeasible ? 'bg-[#10B981] text-black' : 'bg-[#EF4444] text-white'}`}>
          {isFeasible ? 'CLEARED' : 'DRAFT REJECTED'}
        </span>
      </div>
      <div className="mt-4 font-mono text-sm text-gray-300">
        <p>Strategy: <span className="text-[#00E5FF]">{recommendation.strategy}</span></p>
        <p>Arrival Draft: {recommendation.calculatedDraft}m / Max: {recommendation.portMaxDraft}m</p>
      </div>
    </div>
  );
}
```

## 3.3 `ForecastPriceChart.tsx` (ECharts)
```tsx
"use client";
import ReactECharts from 'echarts-for-react';

export function ForecastPriceChart({ data }: { data: any[] }) {
  const options = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { color: '#8892B0' } },
    yAxis: { type: 'value', axisLabel: { fontFamily: 'JetBrains Mono', color: '#8892B0' } },
    series: [
      {
        name: 'P50 Forecast',
        type: 'line',
        data: data.map(d => d.p50),
        itemStyle: { color: '#00E5FF' },
      },
      {
        name: 'P10-P90 Band',
        type: 'line',
        data: data.map(d => d.p90),
        lineStyle: { opacity: 0 },
        areaStyle: { color: '#00E5FF', opacity: 0.1 },
        stack: 'confidence-band'
      },
      {
        name: 'P10 Lower Bound',
        type: 'line',
        data: data.map(d => d.p10 - d.p90),
        lineStyle: { opacity: 0 },
        areaStyle: { color: '#080E1E', opacity: 1 },
        stack: 'confidence-band'
      }
    ]
  };

  return <ReactECharts option={options} style={{ height: 400 }} theme="dark" />;
}
```

## 3.4 GIS Mapping Implementation (MapLibre GL JS)
**Zero Cost Mandate:** We strictly avoid paid Mapbox tokens by using open-source MapLibre combined with free CARTO Dark raster tiles.

```tsx
"use client";
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function PortFairwayMap() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
          }
        },
        layers: [{
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: [88.06, 22.02], // Haldia Port Coordinates
      zoom: 10
    });
    
    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
}
```
