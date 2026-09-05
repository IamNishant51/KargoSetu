"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  ClipboardList,
  Hourglass,
  CheckCircle2,
  XCircle,
  Package,
  MoreVertical,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Requisition {
  id: string;
  volume_mt: number;
  destPortName: string;
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
  const [selectedRequisition, setSelectedRequisition] =
    useState<Requisition | null>(null);

  const [isNewRequisitionOpen, setIsNewRequisitionOpen] = useState(false);
  const [newReqForm, setNewReqForm] = useState({
    volume_mt: "",
    commodity: "Iron Ore",
    origin: "Newcastle, Australia",
    dest_port: "Haldia",
  });

  const createMutation = useMutation({
    mutationFn: async (newReq: Record<string, unknown>) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/requisitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReq),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      setIsNewRequisitionOpen(false);
      setNewReqForm({
        volume_mt: "",
        commodity: "Iron Ore",
        origin: "Newcastle, Australia",
        dest_port: "Haldia",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...newReqForm,
      volume_mt: Number(newReqForm.volume_mt),
    });
  };
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
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      )
        setStatusOpen(false);
      if (
        commodityRef.current &&
        !commodityRef.current.contains(event.target as Node)
      )
        setCommodityOpen(false);
      if (
        originRef.current &&
        !originRef.current.contains(event.target as Node)
      )
        setOriginOpen(false);
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target as Node)
      )
        setDateRangeOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/requisitions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Network response was not ok");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
    },
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
      limit: "10",
    });
    if (statusFilter !== "All Statuses") params.append("status", statusFilter);
    if (commodityFilter !== "All Commodities")
      params.append("commodity", commodityFilter);
    if (originFilter !== "All Origins") params.append("origin", originFilter);
    if (dateRange !== "All Time") params.append("dateRange", dateRange);
    if (debouncedSearch) params.append("search", debouncedSearch);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(
      `${baseUrl}/api/v1/requisitions?${params.toString()}`,
    );
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "requisitions",
      page,
      statusFilter,
      commodityFilter,
      originFilter,
      dateRange,
      debouncedSearch,
    ],
    queryFn: fetchRequisitions,
  });

// Reset page when filters change
  useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [statusFilter, commodityFilter, originFilter, dateRange, debouncedSearch]);

  const handleExport = () => {
    if (!data?.data) return;

    const headers = [
      "Requisition ID",
      "Commodity",
      "Origin Port",
      "Destination Port",
      "Volume (MT)",
      "Requisition Date",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...data.data.map((r: Requisition) =>
        [
          r.id,
          `"${r.commodity}"`,
          `"${r.origin}"`,
          `"${r.destPortName}"`,
          r.volume_mt,
          new Date(r.createdAt).toLocaleDateString(),
          r.status,
        ].join(","),
      ),
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1727]">
            Requisitions
          </h1>
          <p className="text-slate-500 mt-1">
            Create, manage, and track all your cargo transportation
            requisitions.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            aria-label="Export Requisitions"
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 px-4 py-2 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            type="button"
            aria-label="Create New Requisition"
            onClick={() => setIsNewRequisitionOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#0A1727] text-white hover:bg-[#0A1727]/90 h-10 px-4 py-2 shadow-sm"
          >
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
            <h3 className="text-2xl font-bold text-slate-800">
              {data?.meta?.total || 0}
            </h3>
            <p className="text-xs font-medium text-green-600 mt-1">
              ↑ 12%{" "}
              <span className="text-slate-400 font-normal">
                vs last 30 days
              </span>
            </p>
          </div>
        </div>

        {/* Pending Evaluation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Hourglass className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Pending Evaluation
            </p>
            <h3 className="text-2xl font-bold text-slate-800">32</h3>
            <p className="text-xs font-medium text-orange-500 mt-1">
              ↑ 8%{" "}
              <span className="text-slate-400 font-normal">
                vs last 30 days
              </span>
            </p>
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
            <p className="text-xs font-medium text-green-600 mt-1">
              ↑ 15%{" "}
              <span className="text-slate-400 font-normal">
                vs last 30 days
              </span>
            </p>
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
            <p className="text-xs font-medium text-red-500 mt-1">
              ↓ 3%{" "}
              <span className="text-slate-400 font-normal">
                vs last 30 days
              </span>
            </p>
          </div>
        </div>

        {/* Converted to Shipment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Converted to Shipment
            </p>
            <h3 className="text-2xl font-bold text-slate-800">24</h3>
            <p className="text-xs font-medium text-green-600 mt-1">
              ↑ 10%{" "}
              <span className="text-slate-400 font-normal">
                vs last 30 days
              </span>
            </p>
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
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="space-y-1 w-full sm:w-auto relative" ref={statusRef}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </label>
            <button
              type="button"
              aria-label="Select Status"
              aria-haspopup="listbox"
              aria-expanded={statusOpen}
              onClick={() => setStatusOpen(!statusOpen)}
              className={`flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${statusOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-300 hover:border-slate-400"}`}
            >
              <span>{statusFilter}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
              />
            </button>
            {statusOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {[
                    "All Statuses",
                    "Feasible",
                    "Infeasible",
                    "Pending Evaluation",
                    "Converted",
                  ].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setStatusFilter(item);
                        setStatusOpen(false);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${statusFilter === item ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item}
                      {statusFilter === item && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="space-y-1 w-full sm:w-auto relative"
            ref={commodityRef}
          >
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Commodity
            </label>
            <button
              type="button"
              aria-label="Select Commodity"
              aria-haspopup="listbox"
              aria-expanded={commodityOpen}
              onClick={() => setCommodityOpen(!commodityOpen)}
              className={`flex h-10 w-full sm:w-[160px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${commodityOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-300 hover:border-slate-400"}`}
            >
              <span>{commodityFilter}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${commodityOpen ? "rotate-180" : ""}`}
              />
            </button>
            {commodityOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {[
                    "All Commodities",
                    "Iron Ore",
                    "Coal",
                    "Bauxite",
                    "Thermal Coal",
                    "Coking Coal",
                    "Metallurgical Coal",
                  ].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setCommodityFilter(item);
                        setCommodityOpen(false);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${commodityFilter === item ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item}
                      {commodityFilter === item && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1 w-full sm:w-auto relative" ref={originRef}>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Origin Port
            </label>
            <button
              type="button"
              aria-label="Select Origin Port"
              aria-haspopup="listbox"
              aria-expanded={originOpen}
              onClick={() => setOriginOpen(!originOpen)}
              className={`flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${originOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-300 hover:border-slate-400"}`}
            >
              <span>{originFilter}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${originOpen ? "rotate-180" : ""}`}
              />
            </button>
            {originOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {[
                    "All Origins",
                    "Dampier, Australia",
                    "Newcastle, Australia",
                    "Port Hedland, Australia",
                    "Richards Bay, SA",
                    "Tubarão, Brazil",
                    "Port Kembla, Australia",
                    "Saldanha Bay, SA",
                    "Hay Point, Australia",
                  ].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setOriginFilter(item);
                        setOriginOpen(false);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${originFilter === item ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item}
                      {originFilter === item && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div
            className="space-y-1 w-full sm:w-auto relative"
            ref={dateRangeRef}
          >
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Date Range
            </label>
            <button
              type="button"
              aria-label="Select Date Range"
              aria-haspopup="listbox"
              aria-expanded={dateRangeOpen}
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className={`flex h-10 w-full sm:w-[220px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none transition-colors ${dateRangeOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-300 hover:border-slate-400"}`}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                <span>{dateRange}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dateRangeOpen ? "rotate-180" : ""}`}
              />
            </button>
            {dateRangeOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {["All Time", "Last 7 Days", "Last 30 Days"].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setDateRange(item);
                        setDateRangeOpen(false);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${dateRange === item ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {item}
                      {dateRange === item && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-blue-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1 w-full sm:w-auto self-end">
            <button
              type="button"
              aria-label="Clear Filters"
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
          <h2 className="text-base font-semibold text-slate-800">
            All Requisitions ({data?.meta?.total || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center">
                    Requisition ID
                    <ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Commodity
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Origin Port
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Destination Port
                </th>
                <th scope="col" className="px-6 py-3 font-semibold text-right">
                  Volume (MT)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold cursor-pointer hover:text-slate-700"
                >
                  <div className="flex items-center">
                    Requisition Date
                    <ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Evaluated On
                </th>
                <th scope="col" className="px-6 py-3 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap w-12">
                      <div className="flex items-center justify-center">
                        <Skeleton className="h-4 w-4 rounded border-slate-300" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end">
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900">
                        No requisitions found
                      </h3>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        We couldn&apos;t find any requisitions matching your
                        current filters. Try adjusting your search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data?.map((row: Requisition, i: number) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 font-medium text-blue-600 cursor-pointer hover:underline"
                      title={row.id}
                      onClick={() => setSelectedRequisition(row)}
                    >
                      {row.id.substring(0, 14)}...
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {row.commodity}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.origin}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {row.destPortName}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium text-right">
                      {row.volume_mt.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {row.status === "Feasible" && (
                        <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Feasible
                        </span>
                      )}
                      {(row.status === "Pending Evaluation" ||
                        row.status === "Pending") && (
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
                        type="button"
                        aria-label="Row Actions"
                        aria-haspopup="menu"
                        aria-expanded={actionOpenRowId === row.id}
                        onClick={() =>
                          setActionOpenRowId(
                            actionOpenRowId === row.id ? null : row.id,
                          )
                        }
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionOpenRowId === row.id && (
                        <div className="absolute right-10 top-4 z-50 w-32 rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                          <ul className="py-1">
                            <li
                              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                              onClick={() => {
                                setSelectedRequisition(row);
                                setActionOpenRowId(null);
                              }}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {data?.meta?.total === 0 ? 0 : (page - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-700">
              {Math.min(page * 10, data?.meta?.total || 0)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {data?.meta?.total || 0}
            </span>{" "}
            entries
          </p>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200 bg-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {(() => {
              const totalPages = data?.meta?.totalPages || 1;
              const pages = [];
              const maxVisiblePages = 5;

              if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                if (page <= 3) {
                  pages.push(1, 2, 3, 4, "...", totalPages);
                } else if (page >= totalPages - 2) {
                  pages.push(
                    1,
                    "...",
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages,
                  );
                } else {
                  pages.push(
                    1,
                    "...",
                    page - 1,
                    page,
                    page + 1,
                    "...",
                    totalPages,
                  );
                }
              }

              return pages.map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm font-medium"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    aria-label={`Page ${p}`}
                    aria-current={page === p ? "page" : undefined}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-[#0A1727] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-200 border border-slate-200 bg-white"
                    }`}
                  >
                    {p}
                  </button>
                ),
              );
            })()}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((p) => p + 1)}
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
              <h3 className="text-lg font-bold text-slate-800">
                Requisition Details
              </h3>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedRequisition(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">ID</p>
                <p className="font-medium text-slate-800 break-all">
                  {selectedRequisition.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Commodity</p>
                  <p className="font-medium text-slate-800">
                    {selectedRequisition.commodity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">
                    Volume (MT)
                  </p>
                  <p className="font-medium text-slate-800">
                    {selectedRequisition.volume_mt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Origin</p>
                  <p className="font-medium text-slate-800">
                    {selectedRequisition.origin}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">
                    Destination
                  </p>
                  <p className="font-medium text-slate-800">
                    {selectedRequisition.destPortName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <p className="font-medium text-slate-800">
                    {selectedRequisition.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Date</p>
                  <p className="font-medium text-slate-800">
                    {new Date(
                      selectedRequisition.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                aria-label="Close details button"
                onClick={() => setSelectedRequisition(null)}
                className="w-full h-10 rounded-md bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewRequisitionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1727]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1727]">
                  New Requisition
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Create a new cargo transportation request.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close form"
                onClick={() => setIsNewRequisitionOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Volume (MT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={newReqForm.volume_mt}
                  onChange={(e) =>
                    setNewReqForm({ ...newReqForm, volume_mt: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-md border border-slate-300 focus:border-[#0A1727] focus:ring-1 focus:ring-[#0A1727] outline-none transition-all text-slate-900"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Commodity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReqForm.commodity}
                    onChange={(e) =>
                      setNewReqForm({
                        ...newReqForm,
                        commodity: e.target.value,
                      })
                    }
                    className="w-full h-11 px-3 rounded-md border border-slate-300 focus:border-[#0A1727] focus:ring-1 focus:ring-[#0A1727] outline-none transition-all bg-white text-slate-900"
                  >
                    {[
                      "Iron Ore",
                      "Coal",
                      "Bauxite",
                      "Thermal Coal",
                      "Coking Coal",
                      "Metallurgical Coal",
                      "Grain",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Destination Port <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReqForm.dest_port}
                    onChange={(e) =>
                      setNewReqForm({
                        ...newReqForm,
                        dest_port: e.target.value,
                      })
                    }
                    className="w-full h-11 px-3 rounded-md border border-slate-300 focus:border-[#0A1727] focus:ring-1 focus:ring-[#0A1727] outline-none transition-all bg-white text-slate-900"
                  >
                    {[
                      "Haldia",
                      "Paradip",
                      "Dhamra",
                      "Mumbai",
                      "Kandla",
                      "Mundra",
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Origin Port <span className="text-red-500">*</span>
                </label>
                <select
                  value={newReqForm.origin}
                  onChange={(e) =>
                    setNewReqForm({ ...newReqForm, origin: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-md border border-slate-300 focus:border-[#0A1727] focus:ring-1 focus:ring-[#0A1727] outline-none transition-all bg-white text-slate-900"
                >
                  {[
                    "Port Hedland, Australia",
                    "Newcastle, Australia",
                    "Richards Bay, South Africa",
                    "Dampier, Australia",
                    "Tubarão, Brazil",
                    "Samarinda, Indonesia",
                    "Baltimore, USA",
                    "Gladstone, Australia",
                  ].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  aria-label="Cancel creation"
                  onClick={() => setIsNewRequisitionOpen(false)}
                  className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 rounded-md text-sm font-medium bg-[#0A1727] text-white hover:bg-[#0A1727]/90 transition-colors disabled:opacity-70 flex items-center"
                >
                  {createMutation.isPending ? (
                    <>
                      <Hourglass className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Requisition"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
