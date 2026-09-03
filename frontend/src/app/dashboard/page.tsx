"use client";

import { useState } from "react";
import { 
  Download, 
  Settings2, 
  Calendar, 
  Anchor, 
  Ship, 
  CheckCircle2, 
  ArrowDown, 
  ArrowUp,
  MapPin,
  Box,
  Scale,
  Search,
  ChevronDown,
  FileText,
  Info
} from "lucide-react";

export default function DashboardPage() {
  const [unit, setUnit] = useState<"Meters" | "Feet">("Meters");
  const [portDropdownOpen, setPortDropdownOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState({ name: "Singapore (SGSIN)", subtext: "Singapore" });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1727]">Requisition Evaluation & Cargo Splitting</h1>
          <p className="text-slate-500 mt-1">Evaluate constraints and get the optimal cargo splitting strategy.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 px-4 py-2 shrink-0 shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Requisition Inputs */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
            {/* Card Header */}
            <div className="p-6 pb-2 border-b-0 flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-800" />
                <h2 className="text-xl font-semibold text-slate-800">Requisition Inputs</h2>
              </div>
              <p className="text-sm text-slate-500 pl-7">Enter shipment and route details to evaluate constraints.</p>
            </div>
            
            {/* Card Content */}
            <div className="p-6 pt-4 space-y-5 flex-1">
              
              {/* Volume */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Volume (MT) <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="145,000"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500 text-sm">
                    MT
                  </div>
                </div>
              </div>

              {/* Destination Port */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Destination Port <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setPortDropdownOpen(!portDropdownOpen)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  >
                    <span>{selectedPort.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 hover:text-slate-600 font-bold px-1">&times;</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  {portDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50">
                        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Search ports..." 
                          className="w-full bg-transparent text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
                        />
                      </div>
                      <ul className="max-h-60 overflow-auto py-1">
                        {[
                          { name: "Singapore (SGSIN)", subtext: "Singapore" },
                          { name: "Rotterdam (NLRTM)", subtext: "Netherlands" },
                          { name: "Shanghai (CNSHA)", subtext: "China" },
                          { name: "Hamburg (DEHAM)", subtext: "Germany" }
                        ].map((port) => (
                          <li 
                            key={port.name}
                            onClick={() => { setSelectedPort(port); setPortDropdownOpen(false); }}
                            className="flex flex-col px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm transition-colors"
                          >
                            <span className="font-medium text-slate-800">{port.name}</span>
                            <span className="text-xs text-slate-500">{port.subtext}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Commodity Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Commodity Type <span className="text-red-500 ml-1">*</span>
                </label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer">
                  <option>Iron Ore</option>
                  <option>Coal</option>
                  <option>Grain</option>
                </select>
              </div>

              {/* Laycan Window */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Laycan Window <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    defaultValue="Jun 15, 2025  —  Jun 30, 2025"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Vessel Preference */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Vessel Preference <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                </label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer">
                  <option>Supramax</option>
                  <option>Panamax</option>
                  <option>Capesize</option>
                </select>
              </div>

            </div>

            {/* Card Footer */}
            <div className="p-6 pt-0 mt-auto">
              <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#0A1727] text-white hover:bg-[#0A1727]/90 h-10 px-4 py-2 shadow-sm">
                Evaluate Constraints
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Evaluation Results */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-800" />
                <h2 className="text-xl font-semibold text-slate-800 mr-2">Evaluation Results</h2>
                <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Feasible
                </span>
              </div>
              <span className="text-sm text-slate-500">Evaluated at: May 12, 2025, 10:24 AM</span>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 flex-1">
              
              {/* Recommended Strategy Box */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RECOMMENDED STRATEGY</p>
                  <h3 className="text-2xl font-semibold text-slate-800">
                    Split Cargo into <span className="text-orange-500 font-bold">3x Supramax</span>
                  </h3>
                </div>
                <div className="hidden sm:flex items-center justify-center bg-white border border-slate-200 rounded-md p-3 shadow-sm flex-col space-y-1">
                  <div className="flex items-center text-slate-800 font-semibold space-x-2">
                    <Ship className="w-5 h-5 text-[#0A1727]" />
                    <span>3 Vessels</span>
                  </div>
                  <span className="text-sm text-slate-500">Supramax</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col">
                  <p className="text-sm text-slate-500 mb-1 font-medium">Total Volume</p>
                  <p className="text-lg font-semibold text-slate-800">145,000 MT</p>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-4">
                  <p className="text-sm text-slate-500 mb-1 font-medium">Vessels Required</p>
                  <p className="text-lg font-semibold text-slate-800 text-green-600">3</p>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-4">
                  <p className="text-sm text-slate-500 mb-1 font-medium">Volume per Vessel</p>
                  <p className="text-lg font-semibold text-slate-800">~48,333 MT</p>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-4">
                  <p className="text-sm text-slate-500 mb-1 font-medium">Utilization</p>
                  <p className="text-lg font-semibold text-green-600">82%</p>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-4">
                  <p className="text-sm text-slate-500 mb-1 font-medium">Constraint Status</p>
                  <p className="text-lg font-semibold text-green-600">Feasible</p>
                </div>
              </div>

              {/* Draft Analysis */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Draft Analysis (Under Keel Clearance)</h3>
                  
                  {/* Toggle */}
                  <div className="inline-flex items-center rounded-md border border-slate-200 p-1 bg-white">
                    <button 
                      onClick={() => setUnit("Meters")}
                      className={`px-4 py-1 text-sm font-medium rounded-sm transition-colors ${unit === "Meters" ? "bg-[#0A1727] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 bg-transparent"}`}
                    >
                      Meters
                    </button>
                    <button 
                      onClick={() => setUnit("Feet")}
                      className={`px-4 py-1 text-sm font-medium rounded-sm transition-colors ${unit === "Feet" ? "bg-[#0A1727] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 bg-transparent"}`}
                    >
                      Feet
                    </button>
                  </div>
                </div>

                {/* Visualization Area */}
                <div className="relative border border-slate-200 rounded-xl bg-[#EAF5FC] h-[360px] overflow-hidden flex flex-col justify-end">
                  
                  {/* Ship Graphic (using image from desktop) */}
                  <div className="absolute inset-0 flex justify-center items-end bottom-[-20px]">
                     <img 
                       src="/dashboard-draft-analysis-ship-image.png" 
                       alt="Ship" 
                       className="max-h-[380px] w-auto object-contain z-10"
                     />
                  </div>

                  {/* Center dotted line */}
                  <div className="absolute left-1/2 top-[10%] bottom-0 w-px border-l-2 border-dashed border-white/50 z-20"></div>

                  {/* Calculated Draft Line (Dark Navy) */}
                  <div className="absolute w-full top-[160px] flex items-center z-20">
                    <div className="flex-1 border-t-2 border-dashed border-[#0A1727]"></div>
                    <div className="flex-1 border-t-2 border-dashed border-[#0A1727]"></div>
                    <div className="absolute right-6 flex items-center space-x-1.5 bg-white/50 backdrop-blur-sm px-2 py-1 rounded">
                      <span className="text-[#0A1727] font-bold text-sm">{unit === "Meters" ? "12.45 m" : "40.8 ft"}</span>
                      <span className="text-[#0A1727] text-sm font-medium">Calculated Draft</span>
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  {/* Port Max Draft Line (Orange) */}
                  <div className="absolute w-full top-[240px] flex items-center z-20">
                    <div className="flex-1 border-t-2 border-dashed border-orange-500"></div>
                    <div className="flex-1 border-t-2 border-dashed border-orange-500"></div>
                    <div className="absolute right-6 flex items-center space-x-1.5 bg-white/50 backdrop-blur-sm px-2 py-1 rounded">
                      <span className="text-orange-500 font-bold text-sm">{unit === "Meters" ? "14.50 m" : "47.5 ft"}</span>
                      <span className="text-orange-500 text-sm font-medium">Port Max Draft</span>
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                  
                  {/* Under Keel Clearance Arrow */}
                  <div className="absolute right-[12rem] xl:right-[14rem] top-[160px] h-[80px] w-0 border-l-2 border-green-600 z-20 flex flex-col justify-between items-center">
                     <ArrowUp className="w-4 h-4 text-green-600 absolute -top-2 -ml-[9px]" />
                     <ArrowDown className="w-4 h-4 text-green-600 absolute -bottom-2 -ml-[9px]" />
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-start bg-white/50 backdrop-blur-sm px-2 py-1 rounded whitespace-nowrap">
                       <span className="text-green-700 font-bold text-sm">{unit === "Meters" ? "2.05 m" : "6.7 ft"}</span>
                       <span className="text-green-700 text-sm font-medium">Under Keel Clearance</span>
                     </div>
                  </div>
                  
                </div>

                {/* Bottom Details Row */}
                <div className="grid grid-cols-5 gap-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-500 mb-1">Port</p>
                    <p className="text-sm font-semibold text-slate-800">Singapore (SGSIN)</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-500 mb-1">Water Depth</p>
                    <p className="text-sm font-semibold text-slate-800">17.80 m</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-500 mb-1">Tide Adjustment</p>
                    <p className="text-sm font-semibold text-slate-800">+0.25 m</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-500 mb-1">UKC Requirement</p>
                    <p className="text-sm font-semibold text-slate-800">10% of Draft</p>
                  </div>
                  <div className="flex flex-row bg-green-50 rounded-lg p-2 border border-green-200 justify-between items-center col-span-1">
                    <div className="flex flex-col">
                      <p className="text-xs text-green-700 font-semibold mb-0.5">UKC Achieved</p>
                      <p className="text-sm font-bold text-green-700">2.05 m <span className="font-normal">(12.1%)</span></p>
                    </div>
                    <div className="bg-green-600 rounded-full p-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer text */}
              <p className="text-xs text-slate-400 mt-4">
                All calculations are based on the latest available data and system assumptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
