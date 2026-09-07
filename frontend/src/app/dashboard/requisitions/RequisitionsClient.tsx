"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
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
import { loadJSON, saveJSON } from "@/lib/storage";

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

const VIEW_KEY = "kargosetu_req_view_v1";
const DRAFT_KEY = "kargosetu_req_draft_v1";
const DEFAULT_VIEW = {
  statusFilter: "All Statuses",
  commodityFilter: "All Commodities",
  originFilter: "All Origins",
  dateRange: "All Time",
  page: 1,
  search: "",
};
const DEFAULT_DRAFT = {
  volume_mt: "",
  commodity: "Iron Ore",
  origin: "Newcastle, Australia",
  dest_port: "Haldia",
};

export default function RequisitionsPage() {
  const { t } = useLanguage();
  const [savedView] = useState(() => loadJSON(VIEW_KEY, DEFAULT_VIEW));
  const [savedDraft] = useState(() => loadJSON(DRAFT_KEY, DEFAULT_DRAFT));
  const [search, setSearch] = useState(savedView.search);
  const [debouncedSearch, setDebouncedSearch] = useState(savedView.search);
  const [page, setPage] = useState(
    Number.isInteger(savedView.page) && savedView.page >= 1 ? savedView.page : 1,
  );

  const [dateRange, setDateRange] = useState(savedView.dateRange);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const dateRangeRef = useRef<HTMLDivElement>(null);

  const [actionOpenRowId, setActionOpenRowId] = useState<string | null>(null);
  const [selectedRequisition, setSelectedRequisition] =
    useState<Requisition | null>(null);

  const [isNewRequisitionOpen, setIsNewRequisitionOpen] = useState(false);
  const [newReqForm, setNewReqForm] = useState(savedDraft);

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

  const [statusFilter, setStatusFilter] = useState(savedView.statusFilter);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const [commodityFilter, setCommodityFilter] = useState(savedView.commodityFilter);
  const [commodityOpen, setCommodityOpen] = useState(false);
  const commodityRef = useRef<HTMLDivElement>(null);

  const [originFilter, setOriginFilter] = useState(savedView.originFilter);
  const [originOpen, setOriginOpen] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);

  // Display labels follow the active language; values stay English so
  // API queries and comparisons never break when the language changes.
  const STATUS_OPTS = [
    { value: "All Statuses", label: t("all_statuses") },
    { value: "Feasible", label: t("feasible") },
    { value: "Infeasible", label: t("infeasible") },
    { value: "Pending Evaluation", label: t("pending") },
    { value: "Converted", label: t("st_converted") },
  ];
  const COMMODITY_OPTS = [
    { value: "All Commodities", label: t("all_commodities") },
    ...["Iron Ore", "Coal", "Bauxite", "Thermal Coal", "Coking Coal", "Metallurgical Coal"].map(
      (c) => ({ value: c, label: c }),
    ),
  ];
  const ORIGIN_OPTS = [
    { value: "All Origins", label: t("all_origins") },
    ...[
      "Dampier, Australia",
      "Newcastle, Australia",
      "Port Hedland, Australia",
      "Richards Bay, SA",
      "Tubarão, Brazil",
      "Port Kembla, Australia",
      "Saldanha Bay, SA",
      "Hay Point, Australia",
    ].map((o) => ({ value: o, label: o })),
  ];
  const RANGE_OPTS = [
    { value: "All Time", label: t("all_time") },
    { value: "Last 7 Days", label: t("last_7") },
    { value: "Last 30 Days", label: t("last_30") },
  ];
  const optLabel = (opts: { value: string; label: string }[], v: string) =>
    (opts.find((o) => o.value === v) ?? opts[0]).label;

  // The register view (filters, page, search) and the unsent draft both
  // survive reloads. A successful create clears the draft via the reset below.
  useEffect(() => {
    saveJSON(VIEW_KEY, {
      statusFilter,
      commodityFilter,
      originFilter,
      dateRange,
      page,
      search,
    });
  }, [statusFilter, commodityFilter, originFilter, dateRange, page, search]);

  useEffect(() => {
    saveJSON(DRAFT_KEY, newReqForm);
  }, [newReqForm]);
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
    if (window.confirm(t("confirm_delete"))) {
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

  const showA = data?.meta?.total === 0 ? 0 : (page - 1) * 10 + 1;
  const showB = Math.min(page * 10, data?.meta?.total || 0);
  const showC = data?.meta?.total || 0;

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
          <p className="mono-label text-[#B45309]">{t("pg_requisitions")}</p>
          <h1 className="mt-1.5 font-display text-2xl md:text-3xl font-black tracking-[-0.02em] text-[#0A2342]">{t("req_title")}</h1>
          <p className="text-[#6B7D99] mt-1">
            {t("req_sub")}
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            aria-label="Export Requisitions"
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-[#E2E6EB] bg-white hover:bg-[#FAF7F1] text-[#3D4F68] h-10 px-4 py-2 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />{t("export")}</button>
          <button
            type="button"
            aria-label="Create New Requisition"
            onClick={() => setIsNewRequisitionOpen(true)}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-[#D95D0F] text-white hover:bg-[#B45309] h-10 px-4 py-2 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("new_requisition")}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Requisitions */}
        <div className="bg-white border border-[#E2E6EB] rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDF1E7] flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-[#B45309]" />
          </div>
          <div>
              <p className="text-sm font-medium text-[#3D4F68]">{t("stat_total")}</p>
            <h3 className="text-2xl font-bold text-[#0A2342]">
              {data?.meta?.total || 0}
            </h3>
            <p className="text-xs font-medium text-[#0E7A3D] mt-1">
              ↑ 12%{" "}
              <span className="text-[#6B7D99] font-normal">
                {t("vs_last_30")}
              </span>
            </p>
          </div>
        </div>

        {/* Pending Evaluation */}
        <div className="bg-white border border-[#E2E6EB] rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDF1E7] flex items-center justify-center shrink-0">
            <Hourglass className="w-6 h-6 text-[#D95D0F]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B7D99]">{t("pending")}</p>
            <h3 className="text-2xl font-bold text-[#0A2342]">32</h3>
            <p className="text-xs font-medium text-[#D95D0F] mt-1">
              ↑ 8%{" "}
              <span className="text-[#6B7D99] font-normal">
                {t("vs_last_30")}
              </span>
            </p>
          </div>
        </div>

        {/* Feasible */}
        <div className="bg-white border border-[#E2E6EB] rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#E9F5EE] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#0E7A3D]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B7D99]">{t("feasible")}</p>
            <h3 className="text-2xl font-bold text-[#0A2342]">68</h3>
            <p className="text-xs font-medium text-[#0E7A3D] mt-1">
              ↑ 15%{" "}
              <span className="text-[#6B7D99] font-normal">
                {t("vs_last_30")}
              </span>
            </p>
          </div>
        </div>

        {/* Infeasible */}
        <div className="bg-white border border-[#E2E6EB] rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDECEC] flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-[#B42318]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B7D99]">{t("infeasible")}</p>
            <h3 className="text-2xl font-bold text-[#0A2342]">14</h3>
            <p className="text-xs font-medium text-[#B42318] mt-1">
              ↓ 3%{" "}
              <span className="text-[#6B7D99] font-normal">
                {t("vs_last_30")}
              </span>
            </p>
          </div>
        </div>

        {/* {t("stat_converted")} */}
        <div className="bg-white border border-[#E2E6EB] rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF4FB] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[#1B7FBF]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B7D99]">
              {t("stat_converted")}
            </p>
            <h3 className="text-2xl font-bold text-[#0A2342]">24</h3>
            <p className="text-xs font-medium text-[#0E7A3D] mt-1">
              ↑ 10%{" "}
              <span className="text-[#6B7D99] font-normal">
                {t("vs_last_30")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-[#E2E6EB] rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between z-20 relative">
        <div className="flex-1 w-full lg:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#6B7D99]" />
          </div>
          <input
            type="text"
            placeholder={t("search_req")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex h-10 w-full rounded-lg border border-[#E2E6EB] bg-transparent pl-9 pr-3 py-2 text-sm text-[#0A2342] placeholder:text-[#6B7D99]/60 focus:outline-none focus:ring-2 focus:ring-[#D95D0F]/30 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="space-y-1 w-full sm:w-auto relative" ref={statusRef}>
            <label className="text-[11px] font-semibold text-[#6B7D99] uppercase tracking-wider">
              {t("f_status")}
            </label>
            <button
              type="button"
              aria-label="Select Status"
              aria-haspopup="listbox"
              aria-expanded={statusOpen}
              onClick={() => setStatusOpen(!statusOpen)}
              className={`flex h-10 w-full sm:w-[150px] items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-[#3D4F68] shadow-sm focus:outline-none transition-colors ${statusOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] hover:border-[#6B7D99]"}`}
            >
              <span>{optLabel(STATUS_OPTS, statusFilter)}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#6B7D99] transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
              />
            </button>
            {statusOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {STATUS_OPTS.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setStatusOpen(false);
                        setPage(1);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${statusFilter === opt.value ? "bg-[#FDF1E7] text-[#B45309] font-medium" : "text-[#3D4F68] hover:bg-[#FAF7F1]"}`}
                    >
                      {opt.label}
                      {statusFilter === opt.value && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-[#B45309]" />
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
            <label className="text-[11px] font-semibold text-[#6B7D99] uppercase tracking-wider">
              {t("f_commodity")}
            </label>
            <button
              type="button"
              aria-label="Select Commodity"
              aria-haspopup="listbox"
              aria-expanded={commodityOpen}
              onClick={() => setCommodityOpen(!commodityOpen)}
              className={`flex h-10 w-full sm:w-[160px] items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-[#3D4F68] shadow-sm focus:outline-none transition-colors ${commodityOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] hover:border-[#6B7D99]"}`}
            >
              <span>{optLabel(COMMODITY_OPTS, commodityFilter)}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#6B7D99] transition-transform duration-200 ${commodityOpen ? "rotate-180" : ""}`}
              />
            </button>
            {commodityOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {COMMODITY_OPTS.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setCommodityFilter(opt.value);
                        setCommodityOpen(false);
                        setPage(1);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${commodityFilter === opt.value ? "bg-[#FDF1E7] text-[#B45309] font-medium" : "text-[#3D4F68] hover:bg-[#FAF7F1]"}`}
                    >
                      {opt.label}
                      {commodityFilter === opt.value && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-[#B45309]" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1 w-full sm:w-auto relative" ref={originRef}>
            <label className="text-[11px] font-semibold text-[#6B7D99] uppercase tracking-wider">
              {t("f_origin")}
            </label>
            <button
              type="button"
              aria-label="Select Origin Port"
              aria-haspopup="listbox"
              aria-expanded={originOpen}
              onClick={() => setOriginOpen(!originOpen)}
              className={`flex h-10 w-full sm:w-[150px] items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-[#3D4F68] shadow-sm focus:outline-none transition-colors ${originOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] hover:border-[#6B7D99]"}`}
            >
              <span>{optLabel(ORIGIN_OPTS, originFilter)}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#6B7D99] transition-transform duration-200 ${originOpen ? "rotate-180" : ""}`}
              />
            </button>
            {originOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {ORIGIN_OPTS.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setOriginFilter(opt.value);
                        setOriginOpen(false);
                        setPage(1);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${originFilter === opt.value ? "bg-[#FDF1E7] text-[#B45309] font-medium" : "text-[#3D4F68] hover:bg-[#FAF7F1]"}`}
                    >
                      {opt.label}
                      {originFilter === opt.value && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-[#B45309]" />
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
            <label className="text-[11px] font-semibold text-[#6B7D99] uppercase tracking-wider">
              {t("f_range")}
            </label>
            <button
              type="button"
              aria-label="Select Date Range"
              aria-haspopup="listbox"
              aria-expanded={dateRangeOpen}
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className={`flex h-10 w-full sm:w-[220px] items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-[#3D4F68] shadow-sm focus:outline-none transition-colors ${dateRangeOpen ? "border-[#D95D0F] ring-2 ring-[#D95D0F]/20" : "border-[#E2E6EB] hover:border-[#6B7D99]"}`}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-[#6B7D99] mr-2" />
                <span>{optLabel(RANGE_OPTS, dateRange)}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#6B7D99] transition-transform duration-200 ${dateRangeOpen ? "rotate-180" : ""}`}
              />
            </button>
            {dateRangeOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <ul className="max-h-60 overflow-auto py-1">
                  {RANGE_OPTS.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setDateRange(opt.value);
                        setDateRangeOpen(false);
                        setPage(1);
                      }}
                      className={`flex items-center px-3 py-2.5 cursor-pointer text-sm transition-colors ${dateRange === opt.value ? "bg-[#FDF1E7] text-[#B45309] font-medium" : "text-[#3D4F68] hover:bg-[#FAF7F1]"}`}
                    >
                      {opt.label}
                      {dateRange === opt.value && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-[#B45309]" />
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
              className="flex h-10 w-full sm:w-auto items-center justify-center rounded-lg border border-[#E2E6EB] bg-white px-4 py-2 text-sm font-medium text-[#3D4F68] shadow-sm transition-colors hover:bg-[#FAF7F1]"
            >
              <XCircle className="w-4 h-4 mr-2 text-[#6B7D99]" />{t("clear_filters")}</button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#E2E6EB] rounded-xl shadow-sm overflow-hidden z-10 relative">
        <div className="p-5 border-b border-[#E2E6EB]">
          <h2 className="text-base font-display font-bold text-[#0A2342]">
            {t("all_requisitions")} ({data?.meta?.total || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#FAF7F1] text-[#6B7D99] border-b border-[#E2E6EB] text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#E2E6EB] accent-[#D95D0F] cursor-pointer"
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold cursor-pointer hover:text-[#0A2342]"
                >
                  <div className="flex items-center">{t("col_id")}<ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">{t("col_commodity")}</th>
                <th scope="col" className="px-6 py-3 font-semibold">{t("col_origin")}</th>
                <th scope="col" className="px-6 py-3 font-semibold">{t("col_dest")}</th>
                <th scope="col" className="px-6 py-3 font-semibold text-right">{t("col_vol")}</th>
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold cursor-pointer hover:text-[#0A2342]"
                >
                  <div className="flex items-center">{t("col_date")}<ArrowUpDown className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">{t("col_status")}</th>
                <th scope="col" className="px-6 py-3 font-semibold">{t("col_eval_on")}</th>
                <th scope="col" className="px-6 py-3 font-semibold text-center">{t("col_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EB]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#FAF7F1] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap w-12">
                      <div className="flex items-center justify-center">
                        <Skeleton className="h-4 w-4 rounded border-[#E2E6EB]" />
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
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#FAF7F1] flex items-center justify-center">
                        <Search className="w-6 h-6 text-[#6B7D99]" />
                      </div>
                      <h3 className="text-sm font-medium text-[#0A2342]">
                        {t("empty_title")}
                      </h3>
                      <p className="text-sm text-[#6B7D99] max-w-sm mx-auto">
                        {t("empty_sub")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data?.map((row: Requisition, i: number) => (
                  <tr
                    key={i}
                    className="hover:bg-[#FAF7F1] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#E2E6EB] accent-[#D95D0F] cursor-pointer"
                        />
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 font-medium text-[#B45309] cursor-pointer hover:underline"
                      title={row.id}
                      onClick={() => setSelectedRequisition(row)}
                    >
                      {row.id.substring(0, 14)}...
                    </td>
                    <td className="px-6 py-4 text-[#3D4F68]">
                      {row.commodity}
                    </td>
                    <td className="px-6 py-4 text-[#3D4F68]">{row.origin}</td>
                    <td className="px-6 py-4 text-[#3D4F68]">
                      {row.destPortName}
                    </td>
                    <td className="px-6 py-4 text-[#0A2342] font-medium text-right">
                      {row.volume_mt.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[#3D4F68]">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {row.status === "Feasible" && (
                        <span className="inline-flex items-center rounded-lg border border-[#0E7A3D]/25 bg-[#E9F5EE] px-2.5 py-1 text-xs font-semibold text-[#0E7A3D]">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Feasible
                        </span>
                      )}
                      {(row.status === "Pending Evaluation" ||
                        row.status === "Pending") && (
                        <span className="inline-flex items-center rounded-lg border border-[#D95D0F]/30 bg-[#FDF1E7] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                          <Hourglass className="w-3.5 h-3.5 mr-1" /> {t("badge_pending_short")}
                        </span>
                      )}
                      {row.status === "Infeasible" && (
                        <span className="inline-flex items-center rounded-lg border border-[#F3C2C2] bg-[#FDECEC] px-2.5 py-1 text-xs font-semibold text-[#B42318]">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Infeasible
                        </span>
                      )}
                      {row.status === "Converted" && (
                        <span className="inline-flex items-center rounded-lg border border-[#1B7FBF]/30 bg-[#EAF4FB] px-2.5 py-1 text-xs font-semibold text-[#1B7FBF]">
                          <Package className="w-3.5 h-3.5 mr-1" /> Converted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#3D4F68]">—</td>
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
                        className="text-[#6B7D99] hover:text-[#0A2342] p-1 rounded-lg hover:bg-[#FAF7F1] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionOpenRowId === row.id && (
                        <div className="absolute right-10 top-4 z-50 w-32 rounded-lg border border-[#E2E6EB] bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                          <ul className="py-1">
                            <li
                              className="px-4 py-2 text-sm text-[#3D4F68] hover:bg-[#FAF7F1] cursor-pointer"
                              onClick={() => {
                                setSelectedRequisition(row);
                                setActionOpenRowId(null);
                              }}
                            >{t("row_view")}</li>
                            <li
                              className="px-4 py-2 text-sm text-[#B42318] hover:bg-[#FDECEC] cursor-pointer"
                              onClick={() => handleDelete(row.id)}
                            >{t("row_delete")}</li>
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
        <div className="p-4 border-t border-[#E2E6EB] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF7F1]">
          <p className="text-sm text-[#6B7D99]">
            {t("showing_FMT")
              .replace("{a}", String(showA))
              .replace("{b}", String(showB))
              .replace("{c}", String(showC))}
          </p>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7D99] hover:bg-[#FAF7F1] transition-colors border border-[#E2E6EB] bg-white disabled:opacity-50"
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
                    className="w-8 h-8 flex items-center justify-center text-[#6B7D99] text-sm font-medium"
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
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-[#D95D0F] text-white shadow-sm"
                        : "text-[#6B7D99] hover:bg-[#FAF7F1] border border-[#E2E6EB] bg-white"
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
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7D99] hover:bg-[#FAF7F1] transition-colors border border-[#E2E6EB] bg-white disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Details Modal */}
      {selectedRequisition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A2342]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-[#0A2342]">{t("det_title")}</h3>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedRequisition(null)}
                className="text-[#6B7D99] hover:text-[#0A2342]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#6B7D99] uppercase">{t("det_id")}</p>
                <p className="font-medium text-[#0A2342] break-all">
                  {selectedRequisition.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7D99] uppercase">{t("det_commodity")}</p>
                  <p className="font-medium text-[#0A2342]">
                    {selectedRequisition.commodity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7D99] uppercase">
                    Volume (MT)
                  </p>
                  <p className="font-medium text-[#0A2342]">
                    {selectedRequisition.volume_mt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7D99] uppercase">{t("det_origin")}</p>
                  <p className="font-medium text-[#0A2342]">
                    {selectedRequisition.origin}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7D99] uppercase">
                    Destination
                  </p>
                  <p className="font-medium text-[#0A2342]">
                    {selectedRequisition.destPortName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7D99] uppercase">{t("det_status")}</p>
                  <p className="font-medium text-[#0A2342]">
                    {selectedRequisition.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7D99] uppercase">{t("det_date")}</p>
                  <p className="font-medium text-[#0A2342]">
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
                className="w-full h-10 rounded-lg bg-[#FAF7F1] text-[#3D4F68] font-medium hover:bg-[#FAF7F1] transition-colors"
              >{t("close")}</button>
            </div>
          </div>
        </div>
      )}

      {isNewRequisitionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A2342]/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 border border-[#E2E6EB]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A2342]">{t("new_title")}</h2>
                <p className="text-sm text-[#6B7D99] mt-1">
                  {t("new_sub")}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close form"
                onClick={() => setIsNewRequisitionOpen(false)}
                className="p-2 text-[#6B7D99] hover:text-[#3D4F68] hover:bg-[#FAF7F1] rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#3D4F68] mb-1.5">{t("det_volume")} <span className="text-[#B42318]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={newReqForm.volume_mt}
                  onChange={(e) =>
                    setNewReqForm({ ...newReqForm, volume_mt: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E6EB] focus:border-[#D95D0F] focus:ring-1 focus:ring-[#D95D0F]/30 outline-none transition-all text-[#0A2342]"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#3D4F68] mb-1.5">{t("f_commodity")} <span className="text-[#B42318]">*</span>
                  </label>
                  <select
                    value={newReqForm.commodity}
                    onChange={(e) =>
                      setNewReqForm({
                        ...newReqForm,
                        commodity: e.target.value,
                      })
                    }
                    className="w-full h-11 px-3 rounded-lg border border-[#E2E6EB] focus:border-[#D95D0F] focus:ring-1 focus:ring-[#D95D0F]/30 outline-none transition-all bg-white text-[#0A2342]"
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
                  <label className="block text-sm font-semibold text-[#3D4F68] mb-1.5">{t("col_dest")} <span className="text-[#B42318]">*</span>
                  </label>
                  <select
                    value={newReqForm.dest_port}
                    onChange={(e) =>
                      setNewReqForm({
                        ...newReqForm,
                        dest_port: e.target.value,
                      })
                    }
                    className="w-full h-11 px-3 rounded-lg border border-[#E2E6EB] focus:border-[#D95D0F] focus:ring-1 focus:ring-[#D95D0F]/30 outline-none transition-all bg-white text-[#0A2342]"
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
                <label className="block text-sm font-semibold text-[#3D4F68] mb-1.5">{t("f_origin")} <span className="text-[#B42318]">*</span>
                </label>
                <select
                  value={newReqForm.origin}
                  onChange={(e) =>
                    setNewReqForm({ ...newReqForm, origin: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E6EB] focus:border-[#D95D0F] focus:ring-1 focus:ring-[#D95D0F]/30 outline-none transition-all bg-white text-[#0A2342]"
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

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#E2E6EB]">
                <button
                  type="button"
                  aria-label="Cancel creation"
                  onClick={() => setIsNewRequisitionOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#3D4F68] hover:bg-[#FAF7F1] transition-colors"
                >{t("cancel")}</button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#D95D0F] text-white hover:bg-[#B45309] transition-colors disabled:opacity-70 flex items-center"
                >
                  {createMutation.isPending ? (
                    <>
                      <Hourglass className="w-4 h-4 mr-2 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    t("create_req")
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
