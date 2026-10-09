"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Printer, DollarSign, AlertCircle,
  Calendar, ChevronRight, BarChart2, TrendingUp, Clock,
  CheckCircle2, XCircle,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const catColors = ["bg-orange-400", "bg-blue-400", "bg-purple-400", "bg-yellow-400", "bg-green-400", "bg-red-400"];

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold text-black">
        <span>{label}</span>
        <span>RWF {value.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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
    <div className="flex items-center gap-4 group">
      <span className="w-28 text-xs font-bold text-gray-500 shrink-0 text-right">{monthLabel(month)}</span>
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
  const fileRef = useRef<HTMLInputElement>(null);

  // history state
  const [history, setHistory] = useState<DailyEntry[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch (e) {
      return {};
    }
  };

  // load history on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reports/history");
        const data = await safeJson(res);
        if (data.success) {
          setHistory([...data.entries].reverse()); // newest first
          setMonthlySummary(data.monthlySummary);
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

  const r = report;
  const catMax = r?.groupSalesByAmount?.length
    ? Math.max(...r.groupSalesByAmount.map((c: any) => c.value))
    : 1;
  const sortedSales = r?.salesDetail
    ? [...r.salesDetail].sort((a: any, b: any) => b.amount - a.amount)
    : [];

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
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">Cashier / raporo ya pos</h1>
          <p className="text-gray-600 font-medium text-lg">injizamo raporo ya pos haboneke commande zakozwe.</p>
        </div>
        {r && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-colors shadow-md print:hidden"
          >
            <Printer size={18} />
            Print Report
          </button>
        )}
      </div>

      {/* ── Upload Box ──────────────────────────────────────────────── */}
      <div className="mb-10 print:hidden">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-yellow-400 rounded-3xl p-12 text-center cursor-pointer transition-all hover:bg-yellow-50/40 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gray-100 group-hover:bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
              <Upload size={28} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
            </div>
            <p className="text-xl font-black text-black mb-2">injizamo raporo y&apos;umunsi</p>
            <p className="text-gray-500 font-medium text-sm">Click to select your SimbaPOS XPS export file (.xps)</p>
          </div>
          <input ref={fileRef} type="file" className="hidden" accept=".xps" onChange={handleFileChange} />
        </div>
        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}
        {/* Sheets save status badge — shown after every upload */}
        {sheetsSaved === true && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center gap-3">
            <CheckCircle2 size={20} />
            <p className="font-medium">Data saved to Google Sheets successfully.</p>
          </div>
        )}
        {sheetsSaved === false && sheetsError && (
          <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-md flex items-start gap-3">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-black">Report displayed but NOT saved to Google Sheets.</p>
              <p className="text-sm font-medium mt-1 opacity-80">{sheetsError}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Processing spinner ──────────────────────────────────────── */}
      <AnimatePresence>
        {isGeneratingReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-xl font-black text-black">Processing...</p>
            <p className="text-gray-500 font-medium mt-2">Parsing SimbaPOS export and generating your report</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Parsed Report ───────────────────────────────────────────── */}
      {r && !isGeneratingReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 mb-14"
        >
          {/* Summary banner */}
          <div className="bg-black rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <p className="text-yellow-400 text-xs font-black uppercase tracking-widest mb-1">
                {r.hotelName || "Hotel"} — {r.reportTitle || "Report"}
              </p>
              <p className="text-gray-400 font-medium text-sm mb-8">Period: {r.periodFrom} → {r.periodTo}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Sales</p>
                  <p className="text-4xl font-black text-yellow-400">RWF {fmt(r.grandTotalAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Items Sold</p>
                  <p className="text-4xl font-black text-white">{r.grandTotalQuantity}</p>
                </div>
                {r.grandTotalQuantity > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Avg. Item Value</p>
                    <p className="text-4xl font-black text-white">
                      RWF {fmt(r.grandTotalAmount / r.grandTotalQuantity)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-8">
              <DollarSign size={20} className="text-yellow-500" />
              <h2 className="text-xl font-black text-black">Category Breakdown</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {r.groupSalesByAmount?.map((cat: any, i: number) => (
                <Bar
                  key={cat.category}
                  label={`${cat.category} (${cat.percent})`}
                  value={cat.value}
                  max={catMax}
                  color={catColors[i % catColors.length]}
                />
              ))}
              {(!r.groupSalesByAmount || r.groupSalesByAmount.length === 0) && (
                <p className="text-gray-500 text-sm">No category breakdown available.</p>
              )}
            </div>
          </div>

          {/* Item-level table */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 md:p-8 border-b-2 border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-black">Item-Level Sales</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">#</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Item</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Qty Sold</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedSales.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-yellow-50/40 transition-colors">
                      <td className="px-8 py-5 font-black text-yellow-500 text-lg">{i + 1}</td>
                      <td className="px-8 py-5 font-bold text-black">{item.item}</td>
                      <td className="px-8 py-5 font-medium text-gray-600">{item.quantity} units</td>
                      <td className="px-8 py-5 font-black text-black text-right">RWF {fmt(item.amount)}</td>
                    </tr>
                  ))}
                  {sortedSales.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-5 text-center text-gray-500">
                        No sales detail available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {!r && !isGeneratingReport && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-xl font-bold">nta raporo iratangwa.</p>
          <p className="font-medium mt-2">Upload a SimbaPOS export file above to get started.</p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ── Monthly Revenue Summary ─────────────────────────────────── */}
      <div className="mt-4 mb-14 print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
            <BarChart2 size={18} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black">Monthly Revenue</h2>
            <p className="text-sm text-gray-500 font-medium">Total sales earned per month from all uploaded reports</p>
          </div>
        </div>

        {/* Quick stat cards */}
        {(thisMonth || prevMonth) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {thisMonth && (
              <div className="bg-black rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
                <p className="text-yellow-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                  <TrendingUp size={12} /> This Month
                </p>
                <p className="text-3xl font-black text-white">RWF {fmt(thisMonth.totalSales)}</p>
                <p className="text-gray-500 text-sm mt-1">{thisMonth.days} day{thisMonth.days !== 1 ? "s" : ""} of reports</p>
              </div>
            )}
            {prevMonth && (
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 relative overflow-hidden">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Clock size={12} /> Last Month
                </p>
                <p className="text-3xl font-black text-black">RWF {fmt(prevMonth.totalSales)}</p>
                <p className="text-gray-400 text-sm mt-1">{prevMonth.days} day{prevMonth.days !== 1 ? "s" : ""} of reports</p>
              </div>
            )}
          </div>
        )}

        {/* Monthly bar chart */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          {historyLoading ? (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-sm">Loading history…</span>
            </div>
          ) : historyError ? (
            <p className="text-red-500 font-medium text-sm text-center py-6">{historyError}</p>
          ) : monthlySummary.length === 0 ? (
            <p className="text-gray-400 text-center py-8 font-medium">
              No reports uploaded yet — monthly summary will appear here.
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

      {/* ════════════════════════════════════════════════════════════════
          ── Past Entries (Daily History) ─────────────────────────────── */}
      <div className="print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <Calendar size={18} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black">Past Entries</h2>
            <p className="text-sm text-gray-500 font-medium">All uploaded daily POS reports</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-sm">Loading past entries…</span>
            </div>
          ) : historyError ? (
            <p className="text-red-500 font-medium text-sm text-center py-8">{historyError}</p>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No reports have been uploaded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((entry, i) => (
                <motion.div
                  key={entry.uploadedAt + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="flex items-center justify-between px-6 md:px-8 py-5 hover:bg-yellow-50/40 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 group-hover:bg-yellow-200 rounded-xl flex items-center justify-center transition-colors shrink-0">
                      <Calendar size={16} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-black text-black text-sm">
                        {new Date(entry.date).toLocaleDateString("default", {
                          weekday: "short", year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {entry.periodFrom} → {entry.periodTo}
                        {entry.totalItemsSold > 0 && ` · ${entry.totalItemsSold} items`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-black text-black text-sm">RWF {fmt(entry.totalSales)}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {entry.uploadedAt
                          ? `Uploaded ${new Date(entry.uploadedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
