"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
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
  Info,
  ClipboardCheck
} from "lucide-react";

export default function DashboardPage() {
  const [unit, setUnit] = useState<"Meters" | "Feet">("Meters");
  const [portDropdownOpen, setPortDropdownOpen] = useState(false);
  const [portSearch, setPortSearch] = useState("");
  const [selectedPort, setSelectedPort] = useState<{ name: string; subtext: string } | null>({ name: "Haldia", subtext: "India" });
  const [volume, setVolume] = useState("145,000");
  const portRef = useRef<HTMLDivElement>(null);

  const [commodityOpen, setCommodityOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState("Iron Ore");
  const commodityRef = useRef<HTMLDivElement>(null);

  const [vesselOpen, setVesselOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState("Supramax");
  const vesselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (portRef.current && !portRef.current.contains(event.target as Node)) setPortDropdownOpen(false);
      if (commodityRef.current && !commodityRef.current.contains(event.target as Node)) setCommodityOpen(false);
      if (vesselRef.current && !vesselRef.current.contains(event.target as Node)) setVesselOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ports = [
    { name: "Haldia", subtext: "India" },
    { name: "Paradip", subtext: "India" },
    { name: "Dhamra", subtext: "India" }
  ];

  const { mutate: evaluateRequisition, data: result, isPending: loading, error } = useMutation({
    mutationFn: async () => {
      const parsedVolume = Number(volume.replace(/,/g, ''));
      const portName = selectedPort?.name || "Haldia";
      const res = await fetch('http://localhost:3001/api/v1/requisitions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume_mt: parsedVolume, dest_port_name: portName, commodity: selectedCommodity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to evaluate');
      return data;
    }
  });

  const filteredPorts = ports.filter(p => 
    p.name.toLowerCase().includes(portSearch.toLowerCase()) || 
    p.subtext.toLowerCase().includes(portSearch.toLowerCase())
  );
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
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500 text-sm">
                    MT
                  </div>
                </div>
              </div>

              {/* Destination Port */}
              <div className="space-y-2 relative" ref={portRef}>
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Destination Port <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setPortDropdownOpen(!portDropdownOpen)}
                    className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 transition-all shadow-sm ${portDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
                  >
                    <span className={selectedPort ? "text-slate-800" : "text-slate-400"}>
                      {selectedPort ? selectedPort.name : "Select port..."}
                    </span>
                    <div className="flex items-center space-x-2">
                      {selectedPort && (
                        <span 
                          onClick={(e) => { e.stopPropagation(); setSelectedPort(null); }}
                          className="text-slate-400 hover:text-slate-600 font-bold px-1 transition-colors"
                        >
                          &times;
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${portDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {portDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50 sticky top-0">
                        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Search ports..." 
                          value={portSearch}
                          onChange={(e) => setPortSearch(e.target.value)}
                          className="w-full bg-transparent text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
                        />
                      </div>
                      <ul className="max-h-60 overflow-auto py-1">
                        {filteredPorts.length > 0 ? (
                          filteredPorts.map((port) => (
                            <li 
                              key={port.name}
                              onClick={() => { setSelectedPort(port); setPortDropdownOpen(false); setPortSearch(""); }}
                              className={`flex flex-col px-3 py-2 cursor-pointer text-sm transition-colors ${selectedPort?.name === port.name ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                            >
                              <span className={`font-medium ${selectedPort?.name === port.name ? 'text-blue-700' : 'text-slate-800'}`}>{port.name}</span>
                              <span className={`text-xs ${selectedPort?.name === port.name ? 'text-blue-500' : 'text-slate-500'}`}>{port.subtext}</span>
                            </li>
                          ))
                        ) : (
                          <li className="px-3 py-4 text-center text-sm text-slate-500">No ports found</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Commodity Type */}
              <div className="space-y-2 relative" ref={commodityRef}>
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Commodity Type <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setCommodityOpen(!commodityOpen)}
                    className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 transition-all shadow-sm ${commodityOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
                  >
                    <span className="text-slate-800">{selectedCommodity}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${commodityOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {commodityOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <ul className="max-h-60 overflow-auto py-1">
                        {["Iron Ore", "Coal", "Grain", "Bauxite"].map((item) => (
                          <li 
                            key={item}
                            onClick={() => { setSelectedCommodity(item); setCommodityOpen(false); }}
                            className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${selectedCommodity === item ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {item}
                            {selectedCommodity === item && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
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
              <div className="space-y-2 relative" ref={vesselRef}>
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  Vessel Preference <span className="text-slate-400 font-normal ml-1 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setVesselOpen(!vesselOpen)}
                    className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 transition-all shadow-sm ${vesselOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
                  >
                    <span className="text-slate-800">{selectedVessel}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${vesselOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {vesselOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <ul className="max-h-60 overflow-auto py-1">
                        {["Supramax", "Panamax", "Capesize", "Handysize"].map((item) => (
                          <li 
                            key={item}
                            onClick={() => { setSelectedVessel(item); setVesselOpen(false); }}
                            className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${selectedVessel === item ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {item}
                            {selectedVessel === item && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Card Footer */}
            <div className="p-6 pt-0 mt-auto">
              <button 
                onClick={() => evaluateRequisition()}
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#0A1727] text-white hover:bg-[#0A1727]/90 h-10 px-4 py-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                {loading ? 'Evaluating...' : 'Evaluate Constraints'}
              </button>
              {error && <div className="text-red-500 text-sm mt-2">{error instanceof Error ? error.message : 'Error evaluating'}</div>}
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
                {result && (
                  <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${result.feasible ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {result.feasible ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Info className="w-3.5 h-3.5 mr-1" />}
                    {result.feasible ? 'Feasible' : 'Not Feasible'}
                  </span>
                )}
              </div>
              {result && <span className="text-sm text-slate-500">Evaluated at: May 12, 2025, 10:24 AM</span>}
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 flex-1">
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
                  <Anchor className="w-12 h-12 mb-4 opacity-20" />
                  <p>Enter requisition details and evaluate constraints.</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A1727] mb-4"></div>
                  <p>Calculating draft and clearance...</p>
                </div>
              )}

              {result && (
                <>
                  {/* Recommended Strategy Box */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RECOMMENDED STRATEGY</p>
                      <h3 className="text-2xl font-semibold text-slate-800">
                        {result.strategy.includes('into') ? (
                          <>
                            Split Cargo into <span className="text-orange-500 font-bold">{result.strategy.split('into')[1]}</span>
                          </>
                        ) : (
                          result.strategy
                        )}
                      </h3>
                    </div>
                    {result.feasible && (
                      <div className="hidden sm:flex items-center justify-center bg-white border border-slate-200 rounded-md p-3 shadow-sm flex-col space-y-1">
                        <div className="flex items-center text-slate-800 font-semibold space-x-2">
                          <Ship className="w-5 h-5 text-[#0A1727]" />
                          <span>{result.total_vessels} Vessels</span>
                        </div>
                        <span className="text-sm text-slate-500">{result.vessel_class}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div className="flex flex-col">
                      <p className="text-sm text-slate-500 mb-1 font-medium">Total Volume</p>
                      <p className="text-lg font-semibold text-slate-800">{volume} MT</p>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-4">
                      <p className="text-sm text-slate-500 mb-1 font-medium">Vessels Required</p>
                      <p className={`text-lg font-semibold ${result.feasible ? 'text-green-600' : 'text-slate-400'}`}>{result.total_vessels || '-'}</p>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-4">
                      <p className="text-sm text-slate-500 mb-1 font-medium">Volume per Vessel</p>
                      <p className="text-lg font-semibold text-slate-800">
                        {result.feasible ? `~${Math.round(Number(volume.replace(/,/g, '')) / result.total_vessels).toLocaleString()} MT` : '-'}
                      </p>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-4">
                      <p className="text-sm text-slate-500 mb-1 font-medium">Utilization</p>
                      <p className="text-lg font-semibold text-green-600">{result.feasible ? '82%' : '-'}</p>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-4">
                      <p className="text-sm text-slate-500 mb-1 font-medium">Constraint Status</p>
                      <p className={`text-lg font-semibold ${result.feasible ? 'text-green-600' : 'text-red-600'}`}>{result.feasible ? 'Feasible' : 'Not Feasible'}</p>
                    </div>
                  </div>

                  {/* Draft Analysis */}
                  {result.feasible && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">Draft Analysis (Under Keel Clearance)</h3>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center text-sm font-medium text-slate-700">
                              <div className="w-6 border-t-2 border-dashed border-[#0A1727] mr-2"></div>
                              Calculated Draft
                            </div>
                            <div className="flex items-center text-sm font-medium text-slate-700">
                              <div className="w-6 border-t-2 border-dashed border-orange-500 mr-2"></div>
                              Port Max Draft
                            </div>
                          </div>
                        </div>
                        
                        {/* Toggle */}
                        <div className="inline-flex items-center rounded-md border border-slate-200 p-1 bg-white self-start">
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
                        
                        <div className="absolute inset-0 flex justify-center items-end bottom-[-20px]">
                           <img 
                             src="/dashboard-draft-analysis-ship-image.png" 
                             alt="Ship" 
                             className="max-h-[380px] w-auto object-contain z-10"
                           />
                        </div>

                        <div className="absolute left-1/2 top-[10%] bottom-0 w-px border-l-2 border-dashed border-white/50 z-20"></div>

                        {/* Calculated Draft Line */}
                        <div className="absolute w-full top-[160px] flex items-center z-20">
                          <div className="flex-1 border-t-2 border-dashed border-[#0A1727]"></div>
                          <div className="flex-1 border-t-2 border-dashed border-[#0A1727]"></div>
                          <div className="absolute right-6 flex items-center space-x-1.5 bg-white/50 backdrop-blur-sm px-2 py-1 rounded">
                            <span className="text-[#0A1727] font-bold text-sm">{unit === "Meters" ? `${result.calculatedDraft} m` : `${(result.calculatedDraft * 3.28084).toFixed(1)} ft`}</span>
                            <span className="text-[#0A1727] text-sm font-medium">Calculated Draft</span>
                            <Info className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>

                        {/* Port Max Draft Line */}
                        <div className="absolute w-full top-[240px] flex items-center z-20">
                          <div className="flex-1 border-t-2 border-dashed border-orange-500"></div>
                          <div className="flex-1 border-t-2 border-dashed border-orange-500"></div>
                          <div className="absolute right-6 flex items-center space-x-1.5 bg-white/50 backdrop-blur-sm px-2 py-1 rounded">
                            <span className="text-orange-500 font-bold text-sm">{unit === "Meters" ? `${result.portMaxDraft.toFixed(2)} m` : `${(result.portMaxDraft * 3.28084).toFixed(1)} ft`}</span>
                            <span className="text-orange-500 text-sm font-medium">Port Max Draft</span>
                            <Info className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>
                        
                        {/* Under Keel Clearance Arrow */}
                        <div className="absolute right-[12rem] xl:right-[14rem] top-[160px] h-[80px] w-0 border-l-2 border-green-600 z-20 flex flex-col justify-between items-center">
                           <ArrowUp className="w-4 h-4 text-green-600 absolute -top-2 -ml-[9px]" />
                           <ArrowDown className="w-4 h-4 text-green-600 absolute -bottom-2 -ml-[9px]" />
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-start bg-white/50 backdrop-blur-sm px-2 py-1 rounded whitespace-nowrap">
                             <span className="text-green-700 font-bold text-sm">{unit === "Meters" ? `${result.clearance_margin} m` : `${(result.clearance_margin * 3.28084).toFixed(1)} ft`}</span>
                             <span className="text-green-700 text-sm font-medium">Under Keel Clearance</span>
                           </div>
                        </div>
                      </div>

                      {/* Bottom Details Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <p className="text-sm text-slate-500 mb-1">Port</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedPort?.name}</p>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm text-slate-500 mb-1">Commodity</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedCommodity}</p>
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
                            <p className="text-xs text-green-700 font-semibold mb-0.5">UKC Achieved</p>
                            <p className="text-sm font-bold text-green-700">{result.clearance_margin} m <span className="font-normal">(12.1%)</span></p>
                          <div className="bg-green-600 rounded-full p-0.5">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
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
