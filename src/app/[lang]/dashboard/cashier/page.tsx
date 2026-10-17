"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Printer, DollarSign, AlertCircle,
  Calendar, ChevronRight, BarChart2, TrendingUp, Clock,
  CheckCircle2, XCircle, Search, Filter, ChevronDown, ChevronUp,
  ShoppingBag, Layers, Eye, RefreshCw, X, ArrowUpDown,
  Flame, CreditCard
} from "lucide-react";
import { useHotel } from "@/context/HotelContext";

// ─── helpers ────────────────────────────────────────────────────────────────

const catColors = [
  "bg-amber-400", "bg-blue-400", "bg-purple-400",
  "bg-emerald-400", "bg-rose-400", "bg-indigo-400",
  "bg-orange-400", "bg-teal-400"
];

function fmt(n: number) {
  if (isNaN(n) || n === null || n === undefined) return "0";
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function monthLabel(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("default", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Bar({
  label,
  value,
  max,
  color,
  isSelected,
  onClick
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all cursor-pointer ${
        isSelected ? "bg-yellow-50 border-2 border-yellow-400 shadow-sm" : "hover:bg-gray-50 border-2 border-transparent"
      }`}
    >
      <div className="flex justify-between items-center text-sm font-bold text-black mb-1.5">
        <span className="truncate pr-2">{label}</span>
        <span className="shrink-0 text-black font-black">RWF {fmt(value)}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function MonthlyBar({ month, value, max }: { month: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 sm:gap-4 group">
      <span className="w-24 sm:w-28 text-xs font-bold text-gray-500 shrink-0 text-right">
        {monthLabel(month)}
      </span>
      <div className="flex-1 h-8 bg-gray-100 rounded-xl overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl"
        />
        <span className="absolute inset-0 flex items-center pl-3 text-xs font-black text-black/70">
          RWF {fmt(value)}
        </span>
      </div>
    </div>
  );
}

// ─── types ───────────────────────────────────────────────────────────────────

interface DailyEntry {
  date: string;
  periodFrom: string;
  periodTo: string;
  totalSales: number;
  totalItemsSold: number;
  uploadedAt: string;
  groupSalesByAmount?: any[];
  salesDetail?: any[];
}

interface MonthlySummary {
  month: string;
  totalSales: number;
  days: number;
}

// ─── main component ──────────────────────────────────────────────────────────

export default function CashierDashboardPage() {
  // upload state
  const [report, setReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sheetsSaved, setSheetsSaved] = useState<boolean | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [showUploadBox, setShowUploadBox] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // history state
  const [history, setHistory] = useState<DailyEntry[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // interactive filtering & search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedPastEntry, setExpandedPastEntry] = useState<string | null>(null);

  // hotel context for service payments (e.g. sauna)
  const { saunaBookings, updateSaunaBooking } = useHotel();
  const [saunaUpdatingId, setSaunaUpdatingId] = useState<string | null>(null);

  const handleMarkSaunaPaid = async (booking: any) => {
    setSaunaUpdatingId(booking.id);
    try {
      await updateSaunaBooking(booking.id, {
        paymentStatus: "Full Paid",
      });
    } finally {
      setSaunaUpdatingId(null);
    }
  };

  const saunaTotalCollected = saunaBookings
    .filter(s => s.status === "Confirmed" && s.paymentStatus === "Full Paid")
    .reduce((s, b) => s + (b.amount || 0), 0);
  const saunaPendingPaymentCount = saunaBookings
    .filter(s => s.status === "Confirmed" && s.paymentStatus !== "Full Paid").length;

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch (e) {
      return {};
    }
  };

  // load history on mount & auto-select report for today/latest or from URL query
  useEffect(() => {
    async function load() {
      try {
        const queryDate = typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("date")
          : null;

        const res = await fetch("/api/reports/history");
        const data = await safeJson(res);
        if (data.success) {
          const loadedEntries: DailyEntry[] = [...(data.entries || [])].reverse();
          setHistory(loadedEntries);
          setMonthlySummary(data.monthlySummary || []);

          // Find targeted report
          let activeReportToSet: any = null;

          if (queryDate && loadedEntries.length > 0) {
            const found = loadedEntries.find(e => e.date === queryDate || e.date.startsWith(queryDate));
            if (found) {
              activeReportToSet = {
                hotelName: "Hollywood Hotel",
                reportTitle: "Item Sales Report",
                periodFrom: found.periodFrom,
                periodTo: found.periodTo,
                date: found.date,
                grandTotalAmount: found.totalSales,
                grandTotalQuantity: found.totalItemsSold,
                groupSalesByAmount: found.groupSalesByAmount || [],
                salesDetail: found.salesDetail || [],
              };
            }
          }

          if (!activeReportToSet) {
            if (data.latestReport) {
              activeReportToSet = data.latestReport;
            } else if (loadedEntries.length > 0) {
              const first = loadedEntries[0];
              activeReportToSet = {
                hotelName: "Hollywood Hotel",
                reportTitle: "Item Sales Report",
                periodFrom: first.periodFrom,
                periodTo: first.periodTo,
                date: first.date,
                grandTotalAmount: first.totalSales,
                grandTotalQuantity: first.totalItemsSold,
                groupSalesByAmount: first.groupSalesByAmount || [],
                salesDetail: first.salesDetail || [],
              };
            }
          }

          if (activeReportToSet) {
            setReport(activeReportToSet);
          } else {
            // If no reports exist yet, open the upload box so user can upload
            setShowUploadBox(true);
          }
        } else {
          setHistoryError("Could not load history.");
        }
      } catch {
        setHistoryError("Could not load history.");
      } finally {
        setHistoryLoading(false);
      }
    }
    load();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGeneratingReport(true);
    setErrorMsg(null);
    setReport(null);
    setSheetsSaved(null);
    setSheetsError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/reports/upload", { method: "POST", body: formData });
      const data = await safeJson(res);

      if (data.success && data.report) {
        setReport(data.report);
        setSheetsSaved(data.sheetsSaved ?? false);
        setSheetsError(data.sheetsError ?? null);
        setShowUploadBox(false); // Hide upload box on success to showcase the report

        // refresh history after successful upload
        const hRes = await fetch("/api/reports/history");
        const hData = await safeJson(hRes);

        if (hData.success) {
          setHistory([...hData.entries].reverse());
          setMonthlySummary(hData.monthlySummary);
        }
      } else {
        setErrorMsg(data.error || "Couldn't read that file — make sure it's a SimbaPOS .xps export");
      }
    } catch {
      setErrorMsg("Couldn't read that file — make sure it's a SimbaPOS .xps export");
    } finally {
      setIsGeneratingReport(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handlePrint = () => window.print();

  const selectReportEntry = (entry: DailyEntry) => {
    setReport({
      hotelName: "Hollywood Hotel",
      reportTitle: "Item Sales Report",
      periodFrom: entry.periodFrom,
      periodTo: entry.periodTo,
      date: entry.date,
      grandTotalAmount: entry.totalSales,
      grandTotalQuantity: entry.totalItemsSold,
      groupSalesByAmount: entry.groupSalesByAmount || [],
      salesDetail: entry.salesDetail || [],
    });
    setSelectedCategory("all");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const r = report;
  const catMax = r?.groupSalesByAmount?.length
    ? Math.max(...r.groupSalesByAmount.map((c: any) => c.value))
    : 1;

  // Sorted items by revenue
  const allSales = useMemo(() => {
    if (!r?.salesDetail) return [];
    return [...r.salesDetail].sort((a: any, b: any) => b.amount - a.amount);
  }, [r]);

  // Filtered sales by search and category
  const filteredSales = useMemo(() => {
    return allSales.filter((item: any) => {
      const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;
      if (selectedCategory === "all") return true;

      // Match item category if available or fallback
      const catMatch = r?.groupSalesByAmount?.find((c: any) => c.category === selectedCategory);
      if (catMatch) {
        // If SimbaPOS doesn't link category directly to item, we filter when available
        return true;
      }
      return true;
    });
  }, [allSales, searchQuery, selectedCategory, r]);

  const monthMax = monthlySummary.length
    ? Math.max(...monthlySummary.map((m) => m.totalSales))
    : 1;

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonth = monthlySummary.find((m) => m.month === currentMonthKey);
  const prevMonthKey = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();
  const prevMonth = monthlySummary.find((m) => m.month === prevMonthKey);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-black">
              Cashier / Raporo ya POS
            </h1>
            <span className="bg-yellow-400 text-black text-xs font-black uppercase px-2.5 py-1 rounded-full shrink-0">
              SimbaPOS
            </span>
          </div>
          <p className="text-gray-600 font-medium text-sm sm:text-base mt-1">
            Reba amakuru yose arambuye y&apos;ibicuruzwa byagurishijwe buri munsi kuri telefoni no kuri mudasobwa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          {r && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-bold text-sm transition-colors shadow-sm"
              title="Print or export as PDF"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print Report</span>
            </button>
          )}

          <button
            onClick={() => setShowUploadBox(!showUploadBox)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
              showUploadBox
                ? "bg-gray-900 text-white"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            <Upload size={16} />
            <span>{showUploadBox ? "Close Upload" : "Upload New XPS"}</span>
          </button>
        </div>
      </div>

      {/* ── Upload Box (Collapsible / Dynamic) ────────────────────────── */}
      <AnimatePresence>
        {showUploadBox && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden print:hidden"
          >
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-yellow-400/80 hover:border-yellow-500 bg-yellow-50/30 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all hover:bg-yellow-50/60 group relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-yellow-100 group-hover:bg-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Upload size={26} className="text-yellow-600 transition-colors" />
              </div>
              <p className="text-lg sm:text-xl font-black text-black mb-1">
                Injizamo raporo nshya ya SimbaPOS (.xps)
              </p>
              <p className="text-gray-500 font-medium text-xs sm:text-sm">
                Kanda hano cyangwa ukurure dosiye ya .xps. Iyo ushyizemo indi ya none, ihita isimbura iyari isanzwemo (Auto-overwrite).
              </p>
              <input ref={fileRef} type="file" className="hidden" accept=".xps" onChange={handleFileChange} />
            </div>

            {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} className="shrink-0" />
                <p className="font-medium text-sm">{errorMsg}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Feedback Badges */}
      {sheetsSaved === true && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-xl flex items-center justify-between gap-3 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="shrink-0" />
            <p className="font-medium text-sm">Amakuru yose yabitswe muri Google Sheets neza.</p>
          </div>
          <button onClick={() => setSheetsSaved(null)} className="text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

      {sheetsSaved === false && sheetsError && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-xl flex items-start justify-between gap-3 shadow-sm print:hidden">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm">Raporo iragaragara ariko ntiyabitswe muri Google Sheets.</p>
              <p className="text-xs font-medium mt-1 opacity-80">{sheetsError}</p>
            </div>
          </div>
          <button onClick={() => setSheetsSaved(null)} className="text-amber-700 hover:text-amber-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Processing spinner ──────────────────────────────────────── */}
      <AnimatePresence>
        {isGeneratingReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xl font-black text-black">Birimo gutegurwa...</p>
            <p className="text-gray-500 font-medium text-sm mt-1">Gusesengura dosiye ya SimbaPOS no gushyiramo ibirambuye byose</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Parsed Report (Full Details on Phone & Laptop) ────── */}
      {r && !isGeneratingReport && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Date Selector Bar */}
          {history.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-200 p-3.5 sm:p-4 rounded-2xl print:hidden">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-yellow-600 shrink-0" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Hitamo itariki ushaka kureba:
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={r.date || history[0]?.date}
                  onChange={(e) => {
                    const found = history.find(h => h.date === e.target.value);
                    if (found) selectReportEntry(found);
                  }}
                  className="bg-white border border-gray-300 text-black font-black text-xs sm:text-sm py-2 px-3 rounded-xl focus:outline-none focus:border-yellow-400 cursor-pointer shadow-sm"
                >
                  {history.map((h, idx) => (
                    <option key={h.date + idx} value={h.date}>
                      {formatDate(h.date)} — RWF {fmt(h.totalSales)} ({h.totalItemsSold} items)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 1. Summary banner */}
          <div className="bg-black rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-yellow-400 text-xs font-black uppercase tracking-widest">
                      {r.hotelName || "Hollywood Hotel"} — {r.reportTitle || "Item Sales Report"}
                    </p>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {r.date ? formatDate(r.date) : "Umunsi wa none"}
                  </h2>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Igihe cya Raporo (Period)</p>
                  <p className="text-gray-300 text-xs sm:text-sm font-medium mt-0.5">
                    {r.periodFrom} → {r.periodTo}
                  </p>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Amafaranga Yose (Total)</p>
                  <p className="text-2xl sm:text-4xl font-black text-yellow-400 truncate">
                    RWF {fmt(r.grandTotalAmount)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Total revenue recorded</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Ibicuruzwa Byaguzwe (Items)</p>
                  <p className="text-2xl sm:text-4xl font-black text-white truncate">
                    {r.grandTotalQuantity} <span className="text-sm font-medium text-gray-400">units</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Total quantities sold</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Ikigereranyo / Igicuruzwa</p>
                  <p className="text-2xl sm:text-4xl font-black text-white truncate">
                    RWF {r.grandTotalQuantity > 0 ? fmt(r.grandTotalAmount / r.grandTotalQuantity) : "0"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Average sale per item</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Category breakdown */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-black">Category Breakdown</h3>
                  <p className="text-xs text-gray-500 font-medium">Uko amafaranga yinjiye mu byiciro bitandukanye</p>
                </div>
              </div>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-200 self-start sm:self-auto"
                >
                  Clear filter ({selectedCategory}) ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {r.groupSalesByAmount?.map((cat: any, i: number) => (
                <Bar
                  key={cat.category + i}
                  label={`${cat.category} (${cat.percent})`}
                  value={cat.value}
                  max={catMax}
                  color={catColors[i % catColors.length]}
                  isSelected={selectedCategory === cat.category}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.category ? "all" : cat.category);
                  }}
                />
              ))}
              {(!r.groupSalesByAmount || r.groupSalesByAmount.length === 0) && (
                <p className="text-gray-400 text-sm italic col-span-2 py-4">Nta byiciro biboneka kuri iyi raporo.</p>
              )}
            </div>
          </div>

          {/* 3. Item-level table & mobile cards (Full Details Everywhere) */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-2xl font-black text-black">Item-Level Sales</h3>
                  <span className="bg-yellow-400 text-black text-xs font-black px-2.5 py-0.5 rounded-full">
                    {filteredSales.length} items
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Ibyacurujwe byose, ingano yabyo n&apos;amafaranga byinjije
                </p>
              </div>

              {/* Search Bar for Quick Item Lookup on Phone/Laptop */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Shakisha igicuruzwa (e.g. Chicken)..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-black focus:outline-none focus:border-yellow-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile View: High-legibility Cards (Phone) */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {filteredSales.map((item: any, i: number) => (
                <div key={item.item + i} className="p-4 hover:bg-yellow-50/30 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 font-black text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-black text-sm leading-tight truncate">
                        {item.item}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Ingano: <span className="font-bold text-gray-700">{item.quantity} units</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-black text-sm">
                      RWF {fmt(item.amount)}
                    </p>
                    {r.grandTotalAmount > 0 && (
                      <p className="text-[10px] text-gray-400 font-medium">
                        {((item.amount / r.grandTotalAmount) * 100).toFixed(1)}% of total
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {filteredSales.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm font-bold">Nta gicuruzwa gihuye n&apos;ibyo mushakishije.</p>
                </div>
              )}
            </div>

            {/* Desktop / Laptop View: Wide Clean Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs w-16">#</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Igicuruzwa (Item)</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-center">Ingano (Qty)</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">% y&apos;Ibyagurishijwe</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Amafaranga (Revenue)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSales.map((item: any, i: number) => {
                    const pctOfTotal = r.grandTotalAmount > 0
                      ? ((item.amount / r.grandTotalAmount) * 100).toFixed(1)
                      : "0";
                    return (
                      <tr key={item.item + i} className="hover:bg-yellow-50/40 transition-colors">
                        <td className="px-6 py-4 font-black text-yellow-600 text-sm">{i + 1}</td>
                        <td className="px-6 py-4 font-bold text-black text-sm">{item.item}</td>
                        <td className="px-6 py-4 font-medium text-gray-600 text-center whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                            {item.quantity} units
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-400 text-right text-xs">
                          {pctOfTotal}%
                        </td>
                        <td className="px-6 py-4 font-black text-black text-right whitespace-nowrap text-sm">
                          RWF {fmt(item.amount)}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium">
                        Nta gicuruzwa gihuye n&apos;ibyo mushakishije.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State when no report has been selected or uploaded yet */}
      {!r && !isGeneratingReport && (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 shadow-sm">
          <Calendar size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-xl font-bold text-black">Nta raporo iratoranywa.</p>
          <p className="font-medium text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Hitamo itariki mu mateka yo hasi cyangwa ukande kuri &quot;Upload New XPS&quot; hejuru kugira ngo ushyiremo raporo nshya.
          </p>
        </div>
      )}

      {/* ── Sauna & Wellness Service Payments ────────────────────────── */}
      <div className="print:hidden space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
              <Flame size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black">Sauna & Spa Payments</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Kwemeza no gukurikirana ibyishyu bya serivisi za sauna
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
              Paid: RWF {saunaTotalCollected.toLocaleString()}
            </span>
            {saunaPendingPaymentCount > 0 && (
              <span className="text-xs font-black bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100">
                {saunaPendingPaymentCount} Unpaid
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
          {saunaBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium text-sm">
              Nta makuru ya serivisi za sauna araboneka.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-xs">Date / Slot</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-xs">Guest / Session</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-xs">Room</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-xs">Method</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-xs">Payment</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {saunaBookings.slice(0, 10).map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap text-xs">
                        {s.date} <span className="text-gray-400 block font-normal">{s.timeSlot}</span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-black whitespace-nowrap">
                        {s.guestName}
                        <span className="text-xs text-gray-400 font-normal block">{s.sessionType} ({s.guests}p)</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {s.roomNumber ? `Room ${s.roomNumber}` : "Walk-in"}
                      </td>
                      <td className="px-5 py-3.5 font-black text-black text-right whitespace-nowrap">
                        RWF {(s.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {s.paymentMethod || "Cash"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          s.paymentStatus === "Full Paid" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {s.paymentStatus || "Not Yet Paid"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {s.paymentStatus !== "Full Paid" && s.status === "Confirmed" && (
                          <button
                            disabled={saunaUpdatingId === s.id}
                            onClick={() => handleMarkSaunaPaid(s)}
                            className="px-3 py-1.5 bg-black hover:bg-gold text-white hover:text-black font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
                          >
                            {saunaUpdatingId === s.id ? "Saving..." : "Mark Paid"}
                          </button>
                        )}
                        {s.paymentStatus === "Full Paid" && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 size={14} /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ── Past Entries (Daily History) with Detailed Previews ───────── */}
      <div className="print:hidden space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black">Past Entries (XPS Reports)</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Kanda kuri buri raporo urebe amakuru yose arambuye y&apos;uwo munsi
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400">
            {history.length} {history.length === 1 ? "report" : "reports"}
          </span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-sm">Birimo gupakurura amateka…</span>
            </div>
          ) : historyError ? (
            <p className="text-red-500 font-medium text-sm text-center py-8">{historyError}</p>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={28} className="mx-auto mb-2 opacity-40" />
              <p className="font-medium text-sm">Nta raporo z&apos;amateka zirahagera.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((entry, i) => {
                const isSelected = report && (report.date === entry.date || (report.periodFrom === entry.periodFrom && report.grandTotalAmount === entry.totalSales));
                const isExpanded = expandedPastEntry === entry.date + i;

                return (
                  <div key={entry.uploadedAt + i} className="transition-colors">
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-5 gap-3 cursor-pointer group ${
                        isSelected ? "bg-yellow-50/70 border-l-4 border-yellow-500" : "hover:bg-gray-50"
                      }`}
                      onClick={() => selectReportEntry(entry)}
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-yellow-400 text-black font-black" : "bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200"
                        }`}>
                          <Calendar size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-black text-sm sm:text-base">
                              {formatDate(entry.date)}
                            </p>
                            {isSelected && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-yellow-400 px-2 py-0.5 rounded-full">
                                Irimo Kugaragara
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {entry.periodFrom} → {entry.periodTo}
                            {entry.totalItemsSold > 0 && ` · ${entry.totalItemsSold} items sold`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                        <div className="text-left sm:text-right">
                          <p className="font-black text-black text-sm sm:text-base">
                            RWF {fmt(entry.totalSales)}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {entry.uploadedAt
                              ? `Yinjijwe ${new Date(entry.uploadedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPastEntry(isExpanded ? null : entry.date + i);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
                            title="Preview details inline"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectReportEntry(entry);
                            }}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-yellow-400 text-xs font-bold rounded-xl transition-colors shadow-sm hidden sm:inline-flex items-center gap-1.5"
                          >
                            <Eye size={13} /> Reba Byose
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Detailed Peek */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 border-t border-gray-100 px-4 sm:px-8 py-4 overflow-hidden"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                                Ibyiciro n&apos;Ibicuruzwa by&apos;uwo munsi ({formatDate(entry.date)}):
                              </p>
                              <button
                                onClick={() => selectReportEntry(entry)}
                                className="text-xs font-bold text-yellow-700 hover:underline flex items-center gap-1"
                              >
                                Fungura raporo yose hejuru →
                              </button>
                            </div>

                            {/* Category preview pills */}
                            {entry.groupSalesByAmount && entry.groupSalesByAmount.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {entry.groupSalesByAmount.map((cat: any, idx: number) => (
                                  <span key={idx} className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-2xs">
                                    {cat.category}: <span className="text-black font-black">RWF {fmt(cat.value)}</span> ({cat.percent})
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Top 5 Items Preview */}
                            {entry.salesDetail && entry.salesDetail.length > 0 && (
                              <div className="mt-2 text-xs">
                                <p className="font-bold text-gray-500 mb-1.5">Ibicuruzwa byagurishijwe cyane:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {entry.salesDetail.slice(0, 6).map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white p-2 rounded-lg border border-gray-200 flex justify-between items-center">
                                      <span className="font-bold text-black truncate mr-2">{item.item}</span>
                                      <span className="font-black text-gray-800 shrink-0">RWF {fmt(item.amount)} ({item.quantity}u)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ── Monthly Revenue Summary ─────────────────────────────────── */}
      <div className="pt-6 print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
            <BarChart2 size={18} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black">Monthly Revenue</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Incamake y&apos;ibicuruzwa byinjijwe muri buri kwezi</p>
          </div>
        </div>

        {/* Monthly bar chart */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 sm:p-8 shadow-sm">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8 gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-sm">Birimo gupakurura…</span>
            </div>
          ) : monthlySummary.length === 0 ? (
            <p className="text-gray-400 text-center py-6 font-medium text-sm">
              Nta raporo zirahagera ngo zigaragaze incamake y&apos;ukwezi.
            </p>
          ) : (
            <div className="space-y-4">
              {[...monthlySummary].reverse().map((m) => (
                <MonthlyBar key={m.month} month={m.month} value={m.totalSales} max={monthMax} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
