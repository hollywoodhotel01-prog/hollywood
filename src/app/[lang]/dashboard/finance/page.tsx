"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Wallet, 
  CreditCard, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  X, 
  ChevronRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { useFinance } from "@/context/FinanceContext";
import { useLanguage } from "@/context/LanguageContext";
import { CustomerAdvance } from "@/types/finance";

export default function DailyFinanceDashboard() {
  const { 
    bookings, 
    saunaBookings,
    conferenceBookings, 
    dailySalesReport, 
    dailySalesHistory,
    expenses, 
    addExpense, 
    deleteExpense,
    otherRevenues,
    addOtherRevenue,
    deleteOtherRevenue,
    customerAdvances,
    addCustomerAdvance,
    recordAdvanceConsumption,
    deleteCustomerAdvance,
  } = useHotel();

  const { lang, dict } = useLanguage();
  const d = (dict as any).finance || {};

  const { receipts } = useFinance();

  const [activeTab, setActiveTab] = useState<"overview" | "advances">("overview");

  const [expenseCat, setExpenseCat] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [revSource, setRevSource] = useState("");
  const [revDesc, setRevDesc] = useState("");
  const [revAmount, setRevAmount] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Modals for Advances
  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    guestName: "",
    phone: "",
    bookingId: "",
    depositDate: new Date().toISOString().split("T")[0],
    totalAmount: "",
    paymentMethod: "Cash",
    notes: "",
  });

  const [consumingAdvance, setConsumingAdvance] = useState<CustomerAdvance | null>(null);
  const [consumeForm, setConsumeForm] = useState({
    amount: "",
    reason: "Dining / Bar tab",
  });

  // Helper to match dates (YYYY-MM-DD)
  const isDateMatch = (dateStr: string) => {
    if (!dateStr) return false;
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] === selectedDate : false;
  };

  // Helper to check if a date falls in a range [start, end)
  const isDateWithinStay = (dateStr: string, startStr: string, endStr: string) => {
    if (!dateStr || !startStr || !endStr) return false;
    const d = dateStr.slice(0, 10);
    const s = startStr.slice(0, 10);
    const e = endStr.slice(0, 10);
    return d >= s && d < e;
  };

  // 1. CASH INFLOW TODAY (Actual physical money / MoMo / Bank collected on selectedDate)
  // Advances collected from Room Bookings on this date
  const roomAdvancesCollectedToday = bookings
    .filter(b => b.status !== "Cancelled" && isDateMatch(b.advanceDate || b.checkIn))
    .reduce((s, b) => {
      const adv = b.advancePaid !== undefined ? b.advancePaid : (b.paymentStatus === "Full Paid" ? b.amount : 0);
      return s + adv;
    }, 0);

  // Direct Customer Advances deposited on this date
  const directAdvancesCollectedToday = customerAdvances
    .filter(a => isDateMatch(a.depositDate))
    .reduce((s, a) => s + (a.totalAmount || 0), 0);

  // Sauna bookings paid today
  const saunaRevenue = saunaBookings
    .filter(s => s.status === "Confirmed" && isDateMatch(s.date))
    .reduce((s, b) => s + (b.amount || 0), 0);
  
  // Real POS Data from daily sales history
  const diningRevenue = dailySalesHistory?.filter(h => isDateMatch(h.date)).reduce((s, h) => s + h.totalSales, 0) || 0;
  
  // Paid Invoices (Receipts)
  const invoiceRevenue = receipts.filter(r => isDateMatch(r.payment_date)).reduce((s, r) => s + r.amount_received, 0);

  // Other Revenues
  const filteredOtherRevenues = otherRevenues.filter(r => isDateMatch(r.date));
  const totalOtherRevenue = filteredOtherRevenues.reduce((s, r) => s + r.amount, 0);

  // Total Cash Inflow Today
  const totalCashInflowToday = roomAdvancesCollectedToday + directAdvancesCollectedToday + diningRevenue + saunaRevenue + invoiceRevenue + totalOtherRevenue;

  // 2. DAILY EARNED OPERATIONAL REVENUE (Consumption on selectedDate)
  // Daily room consumption for guests currently staying for the night of selectedDate
  const dailyRoomConsumption = bookings
    .filter(b => b.status !== "Cancelled" && isDateWithinStay(selectedDate, b.checkIn, b.checkOut))
    .reduce((s, b) => {
      const days = b.days || 1;
      return s + ((b.amount || 0) / days);
    }, 0);

  const totalEarnedOperationalRevenue = Math.round(dailyRoomConsumption + diningRevenue + saunaRevenue + invoiceRevenue + totalOtherRevenue);

  // 3. EXPENDITURES
  const filteredExpenses = expenses.filter(e => isDateMatch(e.date));
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Net Cash Flow Balance Today
  const netCashBalanceToday = totalCashInflowToday - totalExpenses;

  // 4. TOTAL CUSTOMER ADVANCES HELD (Unearned Revenue / Future Consumption Liability)
  const directAdvancesHeld = customerAdvances
    .filter(a => a.status === "Active")
    .reduce((s, a) => s + (a.balanceRemaining !== undefined ? a.balanceRemaining : Math.max(0, a.totalAmount - a.consumedAmount)), 0);

  const bookingAdvancesHeld = bookings
    .filter(b => b.status !== "Cancelled")
    .reduce((s, b) => {
      const adv = b.advancePaid !== undefined ? b.advancePaid : (b.paymentStatus === "Full Paid" ? b.amount : 0);
      const consumed = b.consumedAmount || 0;
      return s + Math.max(0, adv - consumed);
    }, 0);

  const totalAdvancesHeld = directAdvancesHeld + bookingAdvancesHeld;

  // Form Handlers
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

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceForm.guestName || !advanceForm.totalAmount) return;
    const total = parseFloat(advanceForm.totalAmount) || 0;
    await addCustomerAdvance({
      guestName: advanceForm.guestName,
      phone: advanceForm.phone,
      bookingId: advanceForm.bookingId,
      depositDate: advanceForm.depositDate,
      totalAmount: total,
      consumedAmount: 0,
      balanceRemaining: total,
      paymentMethod: advanceForm.paymentMethod,
      status: "Active",
      notes: advanceForm.notes,
    });
    setShowAddAdvanceModal(false);
    setAdvanceForm({
      guestName: "",
      phone: "",
      bookingId: "",
      depositDate: new Date().toISOString().split("T")[0],
      totalAmount: "",
      paymentMethod: "Cash",
      notes: "",
    });
  };

  const handleRecordConsumptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumingAdvance || !consumeForm.amount) return;
    const amt = parseFloat(consumeForm.amount) || 0;
    await recordAdvanceConsumption(consumingAdvance.id, amt, `${consumeForm.reason} (-RWF ${amt.toLocaleString()} on ${selectedDate})`);
    setConsumingAdvance(null);
    setConsumeForm({ amount: "", reason: "Dining / Bar tab" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">{d.pageTitle || "Daily Finance Powerhouse"}</h1>
          <p className="text-gray-600 font-medium text-lg">Reconcile daily cash in hand, earned consumption, and customer advance deposits.</p>
        </div>
        <div className="flex items-center gap-3">
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

          <button
            onClick={() => setShowAddAdvanceModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-gold hover:text-black text-white rounded-2xl font-bold transition-all shadow-md cursor-pointer"
          >
            <Wallet size={18} /> Receive Customer Advance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "overview" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black hover:bg-gray-100"
          }`}
        >
          Operations &amp; Cash Flow
        </button>
        <button
          onClick={() => setActiveTab("advances")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "advances" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black hover:bg-gray-100"
          }`}
        >
          <Wallet size={16} /> Customer Advances &amp; Folios
          {totalAdvancesHeld > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-gold text-black font-black">
              RWF {totalAdvancesHeld.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Top Financial Health KPI Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Cash Inflow Today */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-black text-white p-6 rounded-3xl border-2 border-gray-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Cash Inflow Today</p>
            <h2 className="text-3xl font-black text-white">RWF {totalCashInflowToday.toLocaleString()}</h2>
            <p className="text-[11px] text-gray-400 mt-1 font-medium">Physical cash, MoMo &amp; advances received</p>
          </div>
          <div className="bg-green-400/20 p-3 rounded-2xl">
            <TrendingUp size={28} className="text-green-400" />
          </div>
        </motion.div>

        {/* Total Expenditures Today */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{d.totalExpenditures || "Total Expenditures"}</p>
            <h2 className="text-3xl font-black text-red-500">-RWF {totalExpenses.toLocaleString()}</h2>
            <p className="text-[11px] text-gray-400 mt-1 font-medium">Expenses paid on {selectedDate}</p>
          </div>
          <div className="bg-red-500/10 p-3 rounded-2xl">
            <TrendingDown size={28} className="text-red-500" />
          </div>
        </motion.div>

        {/* Net Cash Flow Balance Today */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gold p-6 rounded-3xl border-2 border-gold shadow-[0_10px_30px_rgba(251,191,36,0.3)] flex items-center justify-between">
          <div>
            <p className="text-xs text-black/70 font-bold uppercase tracking-widest mb-1">Net Cash in Hand</p>
            <h2 className="text-3xl font-black text-black">RWF {netCashBalanceToday.toLocaleString()}</h2>
            <p className="text-[11px] text-black/70 mt-1 font-bold">Inflow minus expenses for {selectedDate}</p>
          </div>
          <div className="bg-black/10 p-3 rounded-2xl">
            <DollarSign size={28} className="text-black" />
          </div>
        </motion.div>

        {/* Customer Advances Held (Unearned Revenue) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-6 rounded-3xl border-2 border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">Customer Advances Held</p>
            <h2 className="text-3xl font-black text-amber-600">RWF {totalAdvancesHeld.toLocaleString()}</h2>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">Unconsumed deposits waiting to be used</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-2xl">
            <Wallet size={28} className="text-amber-600" />
          </div>
        </motion.div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
              <h3 className="text-xl font-black text-black">Daily Inflow &amp; Consumption Breakdown ({selectedDate})</h3>
              <span className="text-xs font-bold text-gray-500">
                Earned Consumption: <strong className="text-black font-black">RWF {totalEarnedOperationalRevenue.toLocaleString()}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Room Stays (Consumed)</p>
                <p className="text-xl font-black text-blue-600">RWF {Math.round(dailyRoomConsumption).toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Active staying guests today</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Advances Paid Today</p>
                <p className="text-xl font-black text-indigo-600">RWF {(roomAdvancesCollectedToday + directAdvancesCollectedToday).toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Cash deposited today</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Sauna &amp; Wellness</p>
                <p className="text-xl font-black text-amber-600">RWF {saunaRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Sessions on {selectedDate}</p>
              </div>

              <Link
                href={`/${lang}/dashboard/cashier?date=${selectedDate}`}
                className="p-4 bg-gray-50 hover:bg-orange-50/50 rounded-2xl border border-gray-100 hover:border-orange-300 transition-all group block cursor-pointer"
                title="View POS details"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{d.cashierPos || "Cashier (POS)"}</p>
                  <span className="text-[10px] font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">Details →</span>
                </div>
                <p className="text-xl font-black text-orange-500">RWF {diningRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Restaurant &amp; Bar sales</p>
              </Link>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Other Revenues</p>
                <p className="text-xl font-black text-green-500">RWF {totalOtherRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Custom entries</p>
              </div>
            </div>
          </div>

          {/* Expenditures & Other Revenue Forms */}
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
                  <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <Plus size={18} /> {d.recordExpenditure || "Record Expenditure"}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-black mb-4">{d.recentExpenditures || "Recent Expenditures"} ({selectedDate})</h3>
                {filteredExpenses.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">{d.noExpenditures || "No expenditures recorded for this date."}</p>
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
                          <button onClick={() => deleteExpense(exp.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
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
                        placeholder="e.g. Garden Session, Laundry" 
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
                  <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
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
                          <button onClick={() => deleteOtherRevenue(rev.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
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
        </>
      )}

      {/* Customer Advances & Future Consumption Tab */}
      {activeTab === "advances" && (
        <div className="space-y-8">
          {/* Information Banner */}
          <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg text-amber-900">How Customer Advances Work</h3>
                <p className="text-sm text-amber-800">
                  When a customer pays an advance, cash is recorded in the drawer immediately. As they consume services (rooms, dining tabs, sauna), deduct charges from their remaining balance.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddAdvanceModal(true)}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all shrink-0 cursor-pointer"
            >
              + Receive New Deposit
            </button>
          </div>

          {/* Active Advances Table */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-black">Customer Advance Accounts &amp; Folios</h3>
                <p className="text-xs text-gray-500">Track deposited money vs. consumed services</p>
              </div>
              <span className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                Total Held: <strong className="text-black font-black">RWF {totalAdvancesHeld.toLocaleString()}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase">Guest / Client</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase">Deposit Date</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase">Payment Method</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase">Total Advance</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase">Consumed</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase">Remaining Balance</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase">Status</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Direct customer advances */}
                  {customerAdvances.map((adv) => {
                    const remaining = adv.balanceRemaining !== undefined ? adv.balanceRemaining : Math.max(0, adv.totalAmount - adv.consumedAmount);
                    return (
                      <tr key={adv.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {adv.guestName}
                          {adv.phone && <span className="block text-xs font-normal text-gray-400">{adv.phone}</span>}
                          {adv.bookingId && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">Booking: {adv.bookingId}</span>}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">{adv.depositDate}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{adv.paymentMethod}</td>
                        <td className="px-6 py-4 font-black text-black">RWF {adv.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-red-500">-RWF {adv.consumedAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 font-black text-amber-600 text-base">RWF {remaining.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            remaining <= 0 ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
                          }`}>
                            {remaining <= 0 ? "Fully Consumed" : "Active Credit"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {remaining > 0 && (
                              <button
                                onClick={() => {
                                  setConsumingAdvance(adv);
                                  setConsumeForm({ amount: "", reason: "Dining / Bar tab" });
                                }}
                                className="px-3 py-1.5 bg-black hover:bg-gold hover:text-black text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Deduct Charge
                              </button>
                            )}
                            <button
                              onClick={() => deleteCustomerAdvance(adv.id)}
                              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete advance record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Room bookings with advance payments */}
                  {bookings.filter(b => b.status !== "Cancelled" && (b.advancePaid || b.paymentStatus === "Full Paid")).map((b) => {
                    const advPaid = b.advancePaid !== undefined ? b.advancePaid : (b.paymentStatus === "Full Paid" ? b.amount : 0);
                    const consumed = b.consumedAmount || 0;
                    const remaining = Math.max(0, advPaid - consumed);
                    return (
                      <tr key={`b-${b.id}`} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {b.guestName}
                          <span className="block text-xs font-normal text-blue-600">{b.id} • {b.roomType}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">{b.advanceDate || b.checkIn}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{b.paymentMethod || "Cash"}</td>
                        <td className="px-6 py-4 font-black text-black">RWF {advPaid.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-red-500">-RWF {consumed.toLocaleString()}</td>
                        <td className="px-6 py-4 font-black text-blue-600 text-base">RWF {remaining.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            Room Advance ({b.status})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-gray-400 italic">Managed via Room Folio</span>
                        </td>
                      </tr>
                    );
                  })}

                  {customerAdvances.length === 0 && bookings.filter(b => b.advancePaid || b.paymentStatus === "Full Paid").length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-medium">
                        No customer advance deposits recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Customer Advance */}
      {showAddAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowAddAdvanceModal(false)} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-full cursor-pointer">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500 text-white rounded-2xl">
                <Wallet size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black">Receive Customer Advance</h3>
                <p className="text-xs text-gray-500">Record cash/momo deposited for future consumption</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdvance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Guest / Client Name *</label>
                <input 
                  required 
                  type="text" 
                  value={advanceForm.guestName} 
                  onChange={e => setAdvanceForm({ ...advanceForm, guestName: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" 
                  placeholder="e.g. Jean Paul Mugabo" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={advanceForm.phone} 
                    onChange={e => setAdvanceForm({ ...advanceForm, phone: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" 
                    placeholder="+250..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Deposit Date *</label>
                  <input 
                    required 
                    type="date" 
                    value={advanceForm.depositDate} 
                    onChange={e => setAdvanceForm({ ...advanceForm, depositDate: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Amount (RWF) *</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    value={advanceForm.totalAmount} 
                    onChange={e => setAdvanceForm({ ...advanceForm, totalAmount: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-bold text-sm focus:outline-none focus:border-gold" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Payment Method</label>
                  <select 
                    value={advanceForm.paymentMethod} 
                    onChange={e => setAdvanceForm({ ...advanceForm, paymentMethod: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money (MoMo)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Linked Booking / Room (Optional)</label>
                <input 
                  type="text" 
                  value={advanceForm.bookingId} 
                  onChange={e => setAdvanceForm({ ...advanceForm, bookingId: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" 
                  placeholder="e.g. HH-2026-003 or Room 104" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Notes / Purpose</label>
                <input 
                  type="text" 
                  value={advanceForm.notes} 
                  onChange={e => setAdvanceForm({ ...advanceForm, notes: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" 
                  placeholder="e.g. Advance for dining, bar tabs, and sauna" 
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowAddAdvanceModal(false)} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-black text-white hover:bg-gold hover:text-black transition-all cursor-pointer">
                  Record Advance
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Deduct / Record Consumption */}
      {consumingAdvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setConsumingAdvance(null)} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-full cursor-pointer">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500 text-white rounded-2xl">
                <ArrowRightLeft size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black">Deduct Charge from Advance</h3>
                <p className="text-xs text-gray-500">Guest: {consumingAdvance.guestName}</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-xs">
              <div className="flex justify-between font-bold text-gray-700 mb-1">
                <span>Total Deposited:</span>
                <span>RWF {consumingAdvance.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-700 mb-1">
                <span>Already Consumed:</span>
                <span>-RWF {consumingAdvance.consumedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-amber-700 text-sm pt-1 border-t border-amber-200">
                <span>Available Balance:</span>
                <span>RWF {(consumingAdvance.balanceRemaining !== undefined ? consumingAdvance.balanceRemaining : (consumingAdvance.totalAmount - consumingAdvance.consumedAmount)).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRecordConsumptionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Amount to Deduct (RWF) *</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  max={consumingAdvance.balanceRemaining} 
                  value={consumeForm.amount} 
                  onChange={e => setConsumeForm({ ...consumeForm, amount: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-black text-base focus:outline-none focus:border-gold" 
                  placeholder="0" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Consumption Reason *</label>
                <select 
                  value={consumeForm.reason} 
                  onChange={e => setConsumeForm({ ...consumeForm, reason: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold"
                >
                  <option value="Dining / Bar tab">Dining / Bar tab</option>
                  <option value="Room Night Stay">Room Night Stay</option>
                  <option value="Sauna / Spa session">Sauna / Spa session</option>
                  <option value="Laundry / Extra Service">Laundry / Extra Service</option>
                  <option value="Final Settlement / Checkout">Final Settlement / Checkout</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setConsumingAdvance(null)} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer">
                  Confirm Deduction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
