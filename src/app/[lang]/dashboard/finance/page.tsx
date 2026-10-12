"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { useFinance } from "@/context/FinanceContext";
import { useLanguage } from "@/context/LanguageContext";

export default function DailyFinanceDashboard() {
  const { 
    bookings, 
    conferenceBookings, 
    dailySalesReport, 
    dailySalesHistory,
    expenses, 
    addExpense, 
    deleteExpense,
    otherRevenues,
    addOtherRevenue,
    deleteOtherRevenue
  } = useHotel();

  const { lang, dict } = useLanguage();
  const d = (dict as any).finance || {};

  const { receipts } = useFinance();

  const [expenseCat, setExpenseCat] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [revSource, setRevSource] = useState("");
  const [revDesc, setRevDesc] = useState("");
  const [revAmount, setRevAmount] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Helper to match dates
  const isDateMatch = (dateStr: string) => {
    if (!dateStr) return false;
    // Handle both ISO strings and standard date formats by extracting YYYY-MM-DD
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] === selectedDate : false;
  };

  // Calculate Operational Revenue (Bookings + POS)
  const roomRevenue = bookings.filter(b => b.status === "Confirmed" && isDateMatch(b.checkIn)).reduce((s, b) => s + b.amount, 0);
  
  // Real POS Data from daily sales history
  const diningRevenue = dailySalesHistory?.filter(h => isDateMatch(h.date)).reduce((s, h) => s + h.totalSales, 0) || 0;
  
  // Paid Invoices (Receipts)
  const invoiceRevenue = receipts.filter(r => isDateMatch(r.payment_date)).reduce((s, r) => s + r.amount_received, 0);

  const operationalRevenue = roomRevenue + diningRevenue + invoiceRevenue;

  // Calculate Other Revenue
  const filteredOtherRevenues = otherRevenues.filter(r => isDateMatch(r.date));
  const totalOtherRevenue = filteredOtherRevenues.reduce((s, r) => s + r.amount, 0);

  // Total Gross Revenue
  const totalGrossRevenue = operationalRevenue + totalOtherRevenue;

  // Calculate Total Expenses
  const filteredExpenses = expenses.filter(e => isDateMatch(e.date));
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Net Balance
  const netBalance = totalGrossRevenue - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount) return;
    addExpense({
      category: expenseCat || "General",
      description: expenseDesc,
      amount: parseFloat(expenseAmount),
      date: new Date(selectedDate).toISOString()
    });
    setExpenseCat("");
    setExpenseDesc("");
    setExpenseAmount("");
  };

  const handleAddRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revDesc || !revAmount) return;
    addOtherRevenue({
      source: revSource || "General",
      description: revDesc,
      amount: parseFloat(revAmount),
      date: new Date(selectedDate).toISOString()
    });
    setRevSource("");
    setRevDesc("");
    setRevAmount("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">{d.pageTitle || "Daily Finance Powerhouse"}</h1>
          <p className="text-gray-600 font-medium text-lg">{d.pageSubtitle || "Track all inflows and outflows to see your true net balance."}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-gray-100 p-2 rounded-2xl shadow-sm">
          <div className="bg-gold/20 p-2 rounded-xl text-gold">
            <CalendarIcon size={20} />
          </div>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-bold text-black bg-transparent border-none focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-black text-white p-6 rounded-3xl border-2 border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{d.grossRevenue || "Gross Revenue"}</p>
            <h2 className="text-3xl font-black text-green-400">RWF {totalGrossRevenue.toLocaleString()}</h2>
          </div>
          <div className="bg-green-400/20 p-3 rounded-2xl">
            <TrendingUp size={28} className="text-green-400" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{d.totalExpenditures || "Total Expenditures"}</p>
            <h2 className="text-3xl font-black text-red-500">RWF {totalExpenses.toLocaleString()}</h2>
          </div>
          <div className="bg-red-500/10 p-3 rounded-2xl">
            <TrendingDown size={28} className="text-red-500" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gold p-6 rounded-3xl border-2 border-gold shadow-[0_10px_30px_rgba(251,191,36,0.3)] flex items-center justify-between">
          <div>
            <p className="text-xs text-black/70 font-bold uppercase tracking-widest mb-1">{d.netBalance || "Net Balance"}</p>
            <h2 className="text-3xl font-black text-black">RWF {netBalance.toLocaleString()}</h2>
          </div>
          <div className="bg-black/10 p-3 rounded-2xl">
            <DollarSign size={28} className="text-black" />
          </div>
        </motion.div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
        <h3 className="text-xl font-black text-black mb-4">{d.revenueBreakdown || "Revenue Breakdown"} ({selectedDate})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{d.accommodation || "Accommodation"}</p>
            <p className="text-xl font-black text-blue-600">RWF {roomRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{d.cashierPos || "Cashier (POS)"}</p>
            <p className="text-xl font-black text-orange-500">RWF {diningRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{d.invoicesPaid || "Invoices (Paid)"}</p>
            <p className="text-xl font-black text-teal-600">RWF {invoiceRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{d.otherRevenues || "Other Revenues"}</p>
            <p className="text-xl font-black text-green-500">RWF {totalOtherRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expenditures Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-black mb-4">{d.addExpenditure || "Add Expenditure"}</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{d.category || "Category"}</label>
                  <input 
                    type="text" 
                    required 
                    value={expenseCat} 
                    onChange={(e) => setExpenseCat(e.target.value)} 
                    className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-black focus:outline-none focus:border-gold" 
                    placeholder="e.g. Supplies, Fuel" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{d.amount || "Amount (RWF)"}</label>
                  <input type="number" required min="0" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-black focus:outline-none focus:border-gold" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{d.description || "Description"}</label>
                <input type="text" required value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-black focus:outline-none focus:border-gold" placeholder="What was this expense for?" />
              </div>
              <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Plus size={18} /> {d.recordExpenditure || "Record Expenditure"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-black mb-4">{d.recentExpenditures || "Recent Expenditures"} ({selectedDate})</h3>
            {filteredExpenses.length === 0 ? (
              <p className="text-gray-400 text-sm italic">{d.noExpenditures || "No expenditures recorded."}</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredExpenses.slice().reverse().map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors group">
                    <div>
                      <p className="font-bold text-sm text-black">{exp.description}</p>
                      <p className="text-xs text-gray-500">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-red-500">-RWF {exp.amount.toLocaleString()}</span>
                      <button onClick={() => deleteExpense(exp.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Other Revenues Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-black mb-4">{d.addOtherRevenue || "Add Other Revenue"}</h3>
            <form onSubmit={handleAddRevenue} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{d.sourceDepartment || "Source / Department"}</label>
                  <input 
                    type="text" 
                    required 
                    value={revSource} 
                    onChange={(e) => setRevSource(e.target.value)} 
                    className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-black focus:outline-none focus:border-gold" 
                    placeholder="e.g. Laundry, Tours" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (RWF)</label>
                  <input type="number" required min="0" value={revAmount} onChange={(e) => setRevAmount(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-black focus:outline-none focus:border-gold" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <input type="text" required value={revDesc} onChange={(e) => setRevDesc(e.target.value)} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-black focus:outline-none focus:border-gold" placeholder="Describe the revenue source..." />
              </div>
              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Plus size={18} /> {d.recordRevenue || "Record Revenue"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-black mb-4">{d.recentRevenues || "Recent Other Revenues"} ({selectedDate})</h3>
            {filteredOtherRevenues.length === 0 ? (
              <p className="text-gray-400 text-sm italic">{d.noRevenues || "No other revenues recorded."}</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredOtherRevenues.slice().reverse().map(rev => (
                  <div key={rev.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors group">
                    <div>
                      <p className="font-bold text-sm text-black">{rev.description}</p>
                      <p className="text-xs text-gray-500">{rev.source} • {new Date(rev.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-green-500">+RWF {rev.amount.toLocaleString()}</span>
                      <button onClick={() => deleteOtherRevenue(rev.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
