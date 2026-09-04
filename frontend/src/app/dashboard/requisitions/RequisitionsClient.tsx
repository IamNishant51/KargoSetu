"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  Download, 
  Plus, 
  Search, 
  ChevronDown, 
  Calendar, 
  Filter, 
  ClipboardList, 
  Hourglass, 
  CheckCircle2, 
  XCircle, 
  Package,
  MoreVertical,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";

interface Requisition {
  id: string;
  volume_mt: number;
  dest_port: string;
  commodity: string;
  status: string;
  origin: string;
  createdAt: string;
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function RequisitionsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [dateRange, setDateRange] = useState("All Time");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const dateRangeRef = useRef<HTMLDivElement>(null);

  const [actionOpenRowId, setActionOpenRowId] = useState<string | null>(null);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);

  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const [commodityFilter, setCommodityFilter] = useState("All Commodities");
  const [commodityOpen, setCommodityOpen] = useState(false);
  const commodityRef = useRef<HTMLDivElement>(null);

  const [originFilter, setOriginFilter] = useState("All Origins");
  const [originOpen, setOriginOpen] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setStatusOpen(false);
      if (commodityRef.current && !commodityRef.current.contains(event.target as Node)) setCommodityOpen(false);
      if (originRef.current && !originRef.current.contains(event.target as Node)) setOriginOpen(false);
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target as Node)) setDateRangeOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.delete(`${baseUrl}/api/v1/requisitions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this requisition?")) {
      deleteMutation.mutate(id);
    }
    setActionOpenRowId(null);
  };

  const fetchRequisitions = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10"
    });
    if (statusFilter !== "All Statuses") params.append("status", statusFilter);
    if (commodityFilter !== "All Commodities") params.append("commodity", commodityFilter);
    if (originFilter !== "All Origins") params.append("origin", originFilter);
    if (dateRange !== "All Time") params.append("dateRange", dateRange);
    if (debouncedSearch) params.append("search", debouncedSearch);
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const { data } = await axios.get(`${baseUrl}/api/v1/requisitions?${params.toString()}`);
    return data;
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["requisitions", page, statusFilter, commodityFilter, originFilter, dateRange, debouncedSearch],
    queryFn: fetchRequisitions,
  });


  // Reset page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [statusFilter, commodityFilter, originFilter, dateRange, debouncedSearch]);

  const handleExport = () => {
    if (!data?.data) return;
    
    const headers = ["Requisition ID", "Commodity", "Origin Port", "Destination Port", "Volume (MT)", "Requisition Date", "Status"];
    const csvContent = [
      headers.join(","),
      ...data.data.map((r: Requisition) => 
        [
          r.id, 
          `"${r.commodity}"`, 
          `"${r.origin}"`, 
          `"${r.dest_port}"`, 
          r.volume_mt, 
          new Date(r.createdAt).toLocaleDateString(), 
          r.status
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "requisitions.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1727]">Requisitions</h1>
          <p className="text-slate-500 mt-1">Create, manage, and track all your cargo transportation requisitions.</p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button onClick={handleExport} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 px-4 py-2 shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#0A1727] text-white hover:bg-[#0A1727]/90 h-10 px-4 py-2 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Requisition
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Requisitions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{data?.meta?.total || 0}</h3>
            <p className="text-xs font-medium text-green-600 mt-1">↑ 12% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
          </div>
        </div>

        {/* Pending Evaluation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Hourglass className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Evaluation</p>
            <h3 className="text-2xl font-bold text-slate-800">32</h3>
            <p className="text-xs font-medium text-orange-500 mt-1">↑ 8% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
          </div>
        </div>

        {/* Feasible */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Feasible</p>
            <h3 className="text-2xl font-bold text-slate-800">68</h3>
            <p className="text-xs font-medium text-green-600 mt-1">↑ 15% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
          </div>
        </div>

        {/* Infeasible */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Infeasible</p>
            <h3 className="text-2xl font-bold text-slate-800">14</h3>
            <p className="text-xs font-medium text-red-500 mt-1">↓ 3% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
          </div>
        </div>

        {/* Converted to Shipment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Converted to Shipment</p>
            <h3 className="text-2xl font-bold text-slate-800">24</h3>
            <p className="text-xs font-medium text-green-600 mt-1">↑ 10% <span className="text-slate-400 font-normal">vs last 30 days</span></p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between z-20 relative">
        <div className="flex-1 w-full lg:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search requisition ID, commodity, or port..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="space-y-1 w-full sm:w-auto relative" ref={statusRef}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
            <button 
              onClick={() => setStatusOpen(!statusOpen)}
              className={`flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${statusOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
            >
              <span>{statusFilter}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`} />
            </button>
            {statusOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {["All Statuses", "Feasible", "Infeasible", "Pending Evaluation", "Converted"].map((item) => (
                    <li 
                      key={item}
                      onClick={() => { setStatusFilter(item); setStatusOpen(false); }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${statusFilter === item ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {item}
                      {statusFilter === item && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1 w-full sm:w-auto relative" ref={commodityRef}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Commodity</label>
            <button 
              onClick={() => setCommodityOpen(!commodityOpen)}
              className={`flex h-10 w-full sm:w-[160px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${commodityOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
            >
              <span>{commodityFilter}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${commodityOpen ? 'rotate-180' : ''}`} />
            </button>
            {commodityOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {["All Commodities", "Iron Ore", "Coal", "Bauxite", "Thermal Coal", "Coking Coal", "Metallurgical Coal"].map((item) => (
                    <li 
                      key={item}
                      onClick={() => { setCommodityFilter(item); setCommodityOpen(false); }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${commodityFilter === item ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {item}
                      {commodityFilter === item && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1 w-full sm:w-auto relative" ref={originRef}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Origin Port</label>
            <button 
              onClick={() => setOriginOpen(!originOpen)}
              className={`flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${originOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
            >
              <span>{originFilter}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${originOpen ? 'rotate-180' : ''}`} />
            </button>
            {originOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {["All Origins", "Dampier, Australia", "Newcastle, Australia", "Port Hedland, Australia", "Richards Bay, SA", "Tubarão, Brazil", "Port Kembla, Australia", "Saldanha Bay, SA", "Hay Point, Australia"].map((item) => (
                    <li 
                      key={item}
                      onClick={() => { setOriginFilter(item); setOriginOpen(false); }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${originFilter === item ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {item}
                      {originFilter === item && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="space-y-1 w-full sm:w-auto relative" ref={dateRangeRef}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
            <button 
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className={`flex h-10 w-full sm:w-[220px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${dateRangeOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                <span>{dateRange}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dateRangeOpen ? 'rotate-180' : ''}`} />
            </button>
            {dateRangeOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {["All Time", "Last 7 Days", "Last 30 Days"].map((item) => (
                    <li 
                      key={item}
                      onClick={() => { setDateRange(item); setDateRangeOpen(false); }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${dateRange === item ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {item}
                      {dateRange === item && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1 w-full sm:w-auto self-end">
            <button 
              onClick={() => {
                setStatusFilter("All Statuses");
                setCommodityFilter("All Commodities");
                setOriginFilter("All Origins");
                setDateRange("All Time");
                setSearch("");
              }}
              className="flex h-10 w-full sm:w-auto items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <XCircle className="w-4 h-4 mr-2 text-slate-500" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden z-10 relative">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-800">All Requisitions ({data?.meta?.total || 0})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold w-12">
                  <div className="flex items-center justify-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold cursor-pointer hover:text-slate-700">
                  <div className="flex items-center">
                    Requisition ID
                    <ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">Commodity</th>
                <th scope="col" className="px-6 py-3 font-semibold">Origin Port</th>
                <th scope="col" className="px-6 py-3 font-semibold">Destination Port</th>
                <th scope="col" className="px-6 py-3 font-semibold text-right">Volume (MT)</th>
                <th scope="col" className="px-6 py-3 font-semibold cursor-pointer hover:text-slate-700">
                  <div className="flex items-center">
                    Requisition Date
                    <ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                <th scope="col" className="px-6 py-3 font-semibold">Evaluated On</th>
                <th scope="col" className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-slate-500">Loading requisitions...</td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-slate-500">No requisitions found.</td>
                </tr>
              ) : data?.data?.map((row: Requisition, i: number) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 font-medium text-blue-600 cursor-pointer hover:underline" 
                    title={row.id}
                    onClick={() => setSelectedRequisition(row)}
                  >
                    {row.id.substring(0, 14)}...
                  </td>
                  <td className="px-6 py-4 text-slate-700">{row.commodity}</td>
                  <td className="px-6 py-4 text-slate-700">{row.origin}</td>
                  <td className="px-6 py-4 text-slate-700">{row.dest_port}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium text-right">{row.volume_mt.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {row.status === "Feasible" && (
                      <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Feasible
                      </span>
                    )}
                    {(row.status === "Pending Evaluation" || row.status === "Pending") && (
                      <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        <Hourglass className="w-3.5 h-3.5 mr-1" /> Pending
                      </span>
                    )}
                    {row.status === "Infeasible" && (
                      <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Infeasible
                      </span>
                    )}
                    {row.status === "Converted" && (
                      <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                        <Package className="w-3.5 h-3.5 mr-1" /> Converted
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">—</td>
                  <td className="px-6 py-4 text-center relative">
                    <button 
                      onClick={() => setActionOpenRowId(actionOpenRowId === row.id ? null : row.id)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {actionOpenRowId === row.id && (
                      <div className="absolute right-10 top-4 z-50 w-32 rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                        <ul className="py-1">
                          <li 
                            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                            onClick={() => { setSelectedRequisition(row); setActionOpenRowId(null); }}
                          >
                            View Details
                          </li>
                          <li 
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => handleDelete(row.id)}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{data?.meta?.total === 0 ? 0 : (page - 1) * 10 + 1}</span> to <span className="font-medium text-slate-700">{Math.min(page * 10, data?.meta?.total || 0)}</span> of <span className="font-medium text-slate-700">{data?.meta?.total || 0}</span> entries
          </p>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 bg-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0A1727] text-white font-medium text-sm transition-colors shadow-sm">
              {page}
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (data?.meta?.totalPages || 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 bg-white disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Details Modal */}
      {selectedRequisition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">Requisition Details</h3>
              <button 
                onClick={() => setSelectedRequisition(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div><p className="text-xs text-slate-500 uppercase">ID</p><p className="font-medium text-slate-800 break-all">{selectedRequisition.id}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500 uppercase">Commodity</p><p className="font-medium text-slate-800">{selectedRequisition.commodity}</p></div>
                <div><p className="text-xs text-slate-500 uppercase">Volume (MT)</p><p className="font-medium text-slate-800">{selectedRequisition.volume_mt.toLocaleString()}</p></div>
                <div><p className="text-xs text-slate-500 uppercase">Origin</p><p className="font-medium text-slate-800">{selectedRequisition.origin}</p></div>
                <div><p className="text-xs text-slate-500 uppercase">Destination</p><p className="font-medium text-slate-800">{selectedRequisition.dest_port}</p></div>
                <div><p className="text-xs text-slate-500 uppercase">Status</p><p className="font-medium text-slate-800">{selectedRequisition.status}</p></div>
                <div><p className="text-xs text-slate-500 uppercase">Date</p><p className="font-medium text-slate-800">{new Date(selectedRequisition.createdAt).toLocaleDateString()}</p></div>
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => setSelectedRequisition(null)}
                className="w-full h-10 rounded-md bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}