"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Printer, TrendingUp, TrendingDown, ShoppingCart, DollarSign } from "lucide-react";
import { useHotel } from "@/context/HotelContext";

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold text-black">
        <span>{label}</span>
        <span>${value}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

export default function CashierDashboardPage() {
  const { dailySalesReport, isGeneratingReport, uploadAndGenerateReport, currentUser } = useHotel();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    // NOTE: Real SimbaPOS XPS file parsing to be implemented once the deal is signed.
    uploadAndGenerateReport();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePrint = () => window.print();

  const r = dailySalesReport;
  const catMax = r ? Math.max(r.categories.food, r.categories.drinks, r.categories.roomService, r.categories.bar) : 1;
  const pmTotal = r ? r.paymentMethods.cash + r.paymentMethods.mobileMoney + r.paymentMethods.card : 1;

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">Cashier / POS Report</h1>
          <p className="text-gray-600 font-medium text-lg">Upload your daily SimbaPOS XPS export to generate a sales report.</p>
        </div>
        {r && (
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-colors shadow-md print:hidden">
            <Printer size={18} />
            Print Report
          </button>
        )}
      </div>

      {/* Upload Box */}
      <div className="mb-10 print:hidden">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-gold rounded-3xl p-12 text-center cursor-pointer transition-all hover:bg-gold/5 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gray-100 group-hover:bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
              <Upload size={28} className="text-gray-400 group-hover:text-gold transition-colors" />
            </div>
            <p className="text-xl font-black text-black mb-2">Upload Daily Report</p>
            <p className="text-gray-500 font-medium text-sm">Click to select your SimbaPOS XPS export file (.xps, .csv, .xlsx)</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              {/* NOTE: Real XPS parsing to be implemented once the deal is signed. Currently generates a mocked report. */}
              Demo mode: any file upload generates a mocked report.
            </p>
          </div>
          <input ref={fileRef} type="file" className="hidden" accept=".xps,.csv,.xlsx,.xls" onChange={handleFileChange} />
        </div>
      </div>

      {/* Processing animation */}
      <AnimatePresence>
        {isGeneratingReport && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-black text-black">Processing...</p>
            <p className="text-gray-500 font-medium mt-2">Parsing SimbaPOS export and generating your report</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report */}
      {r && !isGeneratingReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">

          {/* Header */}
          <div className="bg-black rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-gold text-xs font-black uppercase tracking-widest mb-2">Hollywood Hotel � Daily Sales Report</p>
                <p className="text-gray-400 font-medium text-sm">Report Date: {r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm ${r.vsYesterday >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {r.vsYesterday >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {r.vsYesterday >= 0 ? "+" : ""}{r.vsYesterday}% vs yesterday
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8 relative z-10">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Sales</p>
                <p className="text-4xl font-black text-gold">${r.totalSales.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Orders</p>
                <p className="text-4xl font-black text-white">{r.totalOrders}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Avg. Order Value</p>
                <p className="text-4xl font-black text-white">${Math.round(r.totalSales / r.totalOrders)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign size={20} className="text-gold" />
                <h2 className="text-xl font-black text-black">Category Breakdown</h2>
              </div>
              <div className="space-y-6">
                <Bar label="Food" value={r.categories.food} max={catMax} color="bg-orange-400" />
                <Bar label="Drinks" value={r.categories.drinks} max={catMax} color="bg-blue-400" />
                <Bar label="Room Service" value={r.categories.roomService} max={catMax} color="bg-purple-400" />
                <Bar label="Bar" value={r.categories.bar} max={catMax} color="bg-gold" />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-8">
                <ShoppingCart size={20} className="text-gold" />
                <h2 className="text-xl font-black text-black">Payment Methods</h2>
              </div>
              <div className="space-y-6">
                {[
                  { label: "Mobile Money", value: r.paymentMethods.mobileMoney, color: "bg-green-400" },
                  { label: "Card", value: r.paymentMethods.card, color: "bg-blue-500" },
                  { label: "Cash", value: r.paymentMethods.cash, color: "bg-gold" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-black">
                      <span>{label}</span>
                      <span>${value} <span className="text-gray-400 font-medium">({Math.round((value / pmTotal) * 100)}%)</span></span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((value / pmTotal) * 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={`h-full rounded-full ${color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 md:p-8 border-b-2 border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-black">Top-Selling Items</h2>
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
                  {r.topItems.map((item, i) => (
                    <tr key={i} className="hover:bg-gold/5 transition-colors">
                      <td className="px-8 py-5 font-black text-gold text-lg">{i + 1}</td>
                      <td className="px-8 py-5 font-bold text-black">{item.name}</td>
                      <td className="px-8 py-5 font-medium text-gray-600">{item.qty} units</td>
                      <td className="px-8 py-5 font-black text-black text-right">${item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {!r && !isGeneratingReport && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl font-bold">No report generated yet.</p>
          <p className="font-medium mt-2">Upload a SimbaPOS export file above to get started.</p>
        </div>
      )}
    </>
  );
}
