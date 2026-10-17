"use client";

import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Calendar, BedDouble, CheckCircle, DollarSign,
  ClipboardList, CreditCard, UserCog, ChevronRight,
  TrendingUp, TrendingDown, BarChart3, X, FileText,
  Hotel, ConciergeBell, ArrowUpRight, ArrowDownRight,
  Layers, CalendarDays, Star, Flame,
  Plus, Trash2, Key, Shield, AlertCircle, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function AdminDashboardPage() {
  const {
    bookings, inHouseGuests, roomsData, conferenceBookings, currentUser,
    expenses, otherRevenues, saunaBookings,
    staffUsers, createStaffUser, deleteStaffUser,
  } = useHotel();
  const { lang, dict } = useLanguage();
  const d = dict.dashboard;

  // ── Staff Management Modal State ─────────────────────────────────
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"admin" | "manager" | "cashier" | "receptionist" | "accountant">("manager");
  const [newStaffDisplayName, setNewStaffDisplayName] = useState("");
  const [staffActionLoading, setStaffActionLoading] = useState(false);
  const [staffModalError, setStaffModalError] = useState("");
  const [staffModalSuccess, setStaffModalSuccess] = useState("");

  // ── Reports Panel ────────────────────────────────────────────────
  const [showReports, setShowReports] = useState(false);
  const [reportTab, setReportTab] = useState<"daily" | "monthly" | "reception">("daily");

  // ── Date Filtering (for stats) ───────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState("all");

  const filteredBookings = useMemo(() => {
    if (selectedMonth === "all") return bookings;
    return bookings.filter(b => b.checkIn.startsWith(selectedMonth));
  }, [bookings, selectedMonth]);

  const filteredConfBookings = useMemo(() => {
    if (selectedMonth === "all") return conferenceBookings;
    return conferenceBookings.filter(b => b.date.startsWith(selectedMonth));
  }, [conferenceBookings, selectedMonth]);

  const filteredSaunaBookings = useMemo(() => {
    if (selectedMonth === "all") return saunaBookings;
    return saunaBookings.filter(s => s.date.startsWith(selectedMonth));
  }, [saunaBookings, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === "all") return expenses;
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const filteredOtherRevenues = useMemo(() => {
    if (selectedMonth === "all") return otherRevenues;
    return otherRevenues.filter(r => r.date.startsWith(selectedMonth));
  }, [otherRevenues, selectedMonth]);

  // ── Monthly Financial Report ──────────────────────────────────────
  const monthlyReport = useMemo(() => {
    const reportMap: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.status === "Confirmed" && b.checkIn) {
        const month = b.checkIn.substring(0, 7);
        reportMap[month] = (reportMap[month] || 0) + (b.amount || 0);
      }
    });
    saunaBookings.forEach(s => {
      if (s.status === "Confirmed" && s.date) {
        const month = s.date.substring(0, 7);
        reportMap[month] = (reportMap[month] || 0) + (s.amount || 0);
      }
    });
    conferenceBookings.forEach(c => {
      // Conference revenue is handled separately now
    });
    return Object.entries(reportMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [bookings, conferenceBookings, saunaBookings]);

  const maxMonthlyRevenue = Math.max(...monthlyReport.map(r => r.revenue), 1);

  const formatMonth = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // ── Report Computations ───────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.substring(0, 7);

  // Daily
  const todayBookings = bookings.filter(b => b.checkIn === today);
  const todayConferences = conferenceBookings.filter(b => b.date === today);
  const todaySauna = saunaBookings.filter(s => s.date === today);
  const todaySaunaRevenue = todaySauna.filter(s => s.status === "Confirmed").reduce((s, b) => s + (b.amount || 0), 0);
  const todayRevenue =
    todayBookings.filter(b => b.status === "Confirmed").reduce((s, b) => s + (b.amount || 0), 0) +
    todaySaunaRevenue;
  const todayCheckouts = bookings.filter(b => b.checkOut === today);

  // Monthly
  const monthBookings = bookings.filter(b => b.checkIn.startsWith(thisMonth));
  const monthSauna = saunaBookings.filter(s => s.date.startsWith(thisMonth));
  const monthRevenue = monthBookings.filter(b => b.status === "Confirmed").reduce((s, b) => s + (b.amount || 0), 0);
  const monthSaunaRevenue = monthSauna.filter(s => s.status === "Confirmed").reduce((s, b) => s + (b.amount || 0), 0);
  const monthExpenses = expenses.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + (e.amount || 0), 0);
  const monthOtherRevenue = otherRevenues.filter(r => r.date.startsWith(thisMonth)).reduce((s, r) => s + (r.amount || 0), 0);
  const monthTotalRevenue = monthRevenue + monthOtherRevenue + monthSaunaRevenue;
  const monthProfit = monthTotalRevenue - monthExpenses;

  // Reception / Overall
  const totalGuests = inHouseGuests.length;
  const totalRooms = roomsData.length;
  const occupiedRooms = roomsData.filter(r => r.status === "Occupied").length;
  const availableRooms = roomsData.filter(r => r.status === "Available").length;
  const bookedRooms = roomsData.filter(r => r.status === "Booked").length;
  const maintenanceRooms = roomsData.filter(r => r.status === "Maintenance").length;
  const totalConferences = conferenceBookings.length;
  const confirmedConf = conferenceBookings.filter(b => b.status === "Confirmed").length;
  const pendingConf = conferenceBookings.filter(b => b.status === "Pending").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // ────────────────────────────────────────────────────────────────

  const totalRevenueCalc =
    filteredBookings.filter(b => b.status === "Confirmed").reduce((s, b) => s + (b.amount || 0), 0) +
    filteredSaunaBookings.filter(s => s.status === "Confirmed").reduce((s, b) => s + (b.amount || 0), 0) +
    filteredOtherRevenues.reduce((s, r) => s + (r.amount || 0), 0);

  const totalExpensesCalc = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalProfitCalc = totalRevenueCalc - totalExpensesCalc;

  const stats = [
    { label: (d as any).totalRevenue || "Total Revenue", value: `RWF ${totalRevenueCalc.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100", href: `/${lang}/dashboard/finance` },
    { label: (d as any).totalExpenses || "Total Expenses", value: `RWF ${totalExpensesCalc.toLocaleString()}`, icon: TrendingDown, color: "text-red-600", bg: "bg-red-100", href: `/${lang}/dashboard/finance` },
    { label: (d as any).netProfit || "Net Profit", value: `RWF ${totalProfitCalc.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100", href: `/${lang}/dashboard/finance` },
    { label: d.inHouseGuests, value: inHouseGuests.length, icon: Users, color: "text-purple-600", bg: "bg-purple-100", href: `/${lang}/dashboard/receptionist` },
    { label: d.totalBookings, value: filteredBookings.length + filteredSaunaBookings.length, icon: Calendar, color: "text-black", bg: "bg-gray-100", href: `/${lang}/dashboard/bookings` },
  ];

  const shortcuts = [
    { label: d.cashierPosReport, href: `/${lang}/dashboard/cashier`, icon: CreditCard, desc: d.uploadDailyReport },
    { label: d.receptionistDesk, href: `/${lang}/dashboard/receptionist`, icon: ClipboardList, desc: d.guestCheckIn },
    { label: "Daily Finance", href: `/${lang}/dashboard/finance`, icon: DollarSign, desc: "Revenue & Expense Tracking" },
    { label: d.allBookings, href: `/${lang}/dashboard/bookings`, icon: Calendar, desc: d.viewSearchReservations },
  ];

  const demoStaff = [
    { roleKey: "admin", email: "admin@hollywoodhotel.rw", href: `/${lang}/dashboard` },
    { roleKey: "manager", email: "manager@hollywoodhotel.rw", href: `/${lang}/dashboard` },
    { roleKey: "cashier", email: "cashier@hollywoodhotel.rw", href: `/${lang}/dashboard/cashier` },
    { roleKey: "receptionist", email: "reception@hollywoodhotel.rw", href: `/${lang}/dashboard/receptionist` },
    { roleKey: "accountant", email: "accounts@hollywoodhotel.rw", href: `/${lang}/dashboard/finance` },
  ];

  const TABS = [
    { key: "daily", label: (d as any).daily || "Daily", icon: CalendarDays },
    { key: "monthly", label: (d as any).monthly || "Monthly", icon: BarChart3 },
    { key: "reception", label: (d as any).reception || "Reception", icon: Hotel },
  ] as const;

  return (
    <>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-heading font-black text-black leading-tight mb-1">{d.adminOverview}</h1>
          <p className="text-gray-500 font-medium text-xs sm:text-base">{d.welcomeBack}. {d.fullControl}</p>
        </div>

        {/* Reports Button */}
        <button
          id="open-reports-btn"
          onClick={() => setShowReports(true)}
          className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-black text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:bg-gray-900 transition-all shadow-sm hover:shadow-md group whitespace-nowrap self-start"
        >
          <FileText size={15} className="text-gold group-hover:scale-110 transition-transform" />
          <span>{(d as any).reportsBtn || "Reports"}</span>
          <span className="ml-1 text-[10px] bg-gold text-black font-black px-1.5 py-0.5 rounded-full">3</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-12">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={stat.href} className="block bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-gold hover:shadow-[0_10px_30px_rgba(251,191,36,0.1)] transition-all h-full">
              <div className="flex items-center gap-3.5 sm:gap-5">
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} shadow-inner shrink-0`}>
                  <stat.icon size={22} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] sm:text-sm text-gray-500 font-bold uppercase tracking-widest mb-0.5">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-black text-black leading-tight">{stat.value}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick-jump shortcuts */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-black mb-6">{d.quickAccess}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shortcuts.map((s, i) => (
            <Link key={i} href={s.href} className="group bg-white p-6 rounded-3xl border-2 border-gray-100 hover:border-gold hover:shadow-[0_10px_30px_rgba(251,191,36,0.1)] transition-all flex flex-col gap-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-colors shadow-md">
                <s.icon size={22} />
              </div>
              <div>
                <p className="font-black text-black group-hover:text-gold transition-colors">{s.label}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">{s.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gold transition-colors self-end" />
            </Link>
          ))}
        </div>
      </div>

      {/* Staff Accounts Management */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <UserCog size={22} className="text-gold" />
            <div>
              <h2 className="text-2xl font-black text-black">{d.staffAccounts}</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Manage administrators, managers, cashiers, receptionists & accountants</p>
            </div>
          </div>
          {currentUser?.role === "admin" && (
            <button
              onClick={() => {
                setShowAddStaffModal(true);
                setStaffModalError("");
                setStaffModalSuccess("");
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gold hover:text-black transition-all shadow-md group"
            >
              <Plus size={16} className="text-gold group-hover:text-black transition-colors" />
              <span>{d.addStaff}</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Name / Display</th>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">{d.role}</th>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">{d.email}</th>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(staffUsers && staffUsers.length > 0 ? staffUsers : demoStaff.map((s) => ({
                uid: s.email,
                email: s.email,
                displayName: s.email.split("@")[0],
                role: s.roleKey as any,
              }))).map((staff) => {
                const roleHrefMap: Record<string, string> = {
                  admin: `/${lang}/dashboard`,
                  manager: `/${lang}/dashboard`,
                  cashier: `/${lang}/dashboard/cashier`,
                  receptionist: `/${lang}/dashboard/receptionist`,
                  accountant: `/${lang}/dashboard/finance`,
                };
                const dashboardHref = roleHrefMap[staff.role] || `/${lang}/dashboard`;

                return (
                  <tr key={staff.email} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-5 font-bold text-black flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0">
                        {staff.displayName ? staff.displayName.charAt(0).toUpperCase() : staff.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[180px]">{staff.displayName || staff.email.split("@")[0]}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                        staff.role === "admin" ? "bg-amber-500/20 text-amber-700 border border-amber-300" :
                        staff.role === "manager" ? "bg-purple-500/20 text-purple-700 border border-purple-300" :
                        staff.role === "cashier" ? "bg-blue-500/20 text-blue-700 border border-blue-300" :
                        staff.role === "receptionist" ? "bg-emerald-500/20 text-emerald-700 border border-emerald-300" :
                        "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}>
                        {(d as any)[staff.role] || staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-600 font-medium">{staff.email}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={dashboardHref}
                          className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gold hover:text-black rounded-lg transition-colors"
                        >
                          {d.view} →
                        </Link>
                        {(currentUser?.role === "admin" || currentUser?.role === "manager") && (
                          <Link
                            href={`/${lang}/dashboard/change-password?email=${encodeURIComponent(staff.email)}`}
                            title="Reset password for this user"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors"
                          >
                            <Key size={14} />
                          </Link>
                        )}
                        {currentUser?.role === "admin" && staff.email !== "admin@hollywoodhotel.rw" && (
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete staff account ${staff.email}?`)) {
                                try {
                                  await deleteStaffUser(staff.uid, staff.email);
                                } catch (err: any) {
                                  alert(err.message || "Failed to delete user");
                                }
                              }
                            }}
                            title="Delete staff account"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-gray-100 overflow-hidden"
            >
              <div className="p-6 bg-black text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gold text-black rounded-xl">
                    <UserCog size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg">Add New Staff User</h3>
                    <p className="text-xs text-gray-400">e.g. manager1, manager2, cashier2</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setStaffModalError("");
                  setStaffModalSuccess("");
                  if (!newStaffEmail || !newStaffPassword) {
                    setStaffModalError("Email and password are required.");
                    return;
                  }
                  if (newStaffPassword.length < 6) {
                    setStaffModalError("Password must be at least 6 characters.");
                    return;
                  }

                  setStaffActionLoading(true);
                  try {
                    await createStaffUser({
                      email: newStaffEmail,
                      password: newStaffPassword,
                      displayName: newStaffDisplayName || newStaffEmail.split("@")[0],
                      role: newStaffRole,
                    });
                    setStaffModalSuccess("Staff account created successfully!");
                    setNewStaffEmail("");
                    setNewStaffPassword("");
                    setNewStaffDisplayName("");
                    setTimeout(() => setShowAddStaffModal(false), 1200);
                  } catch (err: any) {
                    setStaffModalError(err.message || "Failed to create staff account.");
                  } finally {
                    setStaffActionLoading(false);
                  }
                }}
                className="p-6 space-y-4"
              >
                {staffModalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{staffModalError}</span>
                  </div>
                )}
                {staffModalSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle size={16} className="shrink-0" />
                    <span>{staffModalSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 focus:border-gold outline-none"
                  >
                    <option value="manager">Manager (e.g. manager1, manager2)</option>
                    <option value="cashier">Cashier</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="accountant">Accountant</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager1@hollywoodhotel.rw"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:border-gold outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Users can have unique emails like manager1@..., manager2@...
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Manager 1 (Duty Manager)"
                    value={newStaffDisplayName}
                    onChange={(e) => setNewStaffDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:border-gold outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={staffActionLoading}
                    className="flex-1 py-3 text-sm font-black text-black bg-gold hover:bg-gold-dark rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {staffActionLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Creating…</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monthly Financial Report Bar Chart */}
      <div className="mt-12 mb-12 bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <TrendingUp size={22} className="text-gold" />
          <h2 className="text-2xl font-black text-black">Monthly Financial Report</h2>
        </div>
        <div className="p-6 md:p-8">
          {monthlyReport.length === 0 ? (
            <p className="text-gray-500 font-medium text-center py-10">No revenue data available.</p>
          ) : (
            <div className="space-y-6">
              {monthlyReport.map((report, i) => {
                const widthPercent = Math.max(10, (report.revenue / maxMonthlyRevenue) * 100);
                return (
                  <motion.div key={report.month} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <p className="font-bold text-black">{formatMonth(report.month)}</p>
                      <p className="font-black text-lg text-gold">RWF {report.revenue.toLocaleString()}</p>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-black rounded-full relative overflow-hidden"
                      >
                        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px]" />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Reports Slide-Over Panel ── */}
      <AnimatePresence>
        {showReports && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReports(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 z-50 h-screen w-full max-w-[480px] bg-white shadow-[−40px_0_80px_rgba(0,0,0,0.18)] flex flex-col"
            >
              {/* Panel Header */}
              <div className="bg-black px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-gold p-2 rounded-xl">
                    <FileText size={18} className="text-black" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg leading-tight">{(d as any).reports || "Reports"}</h2>
                    <p className="text-gray-400 text-xs font-medium">{new Date().toLocaleDateString(lang === 'rw' ? "rw-RW" : "en-RW", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </div>
                <button
                  id="close-reports-btn"
                  onClick={() => setShowReports(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex gap-2 shrink-0">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    id={`report-tab-${tab.key}`}
                    onClick={() => setReportTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      reportTab === tab.key
                        ? "bg-black text-gold shadow-sm"
                        : "text-gray-500 hover:text-black hover:bg-gray-200"
                    }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {/* ── DAILY REPORT ── */}
                {reportTab === "daily" && (
                  <motion.div key="daily" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays size={15} className="text-gold" />
                      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                        {(d as any).todaysSnapshot || "Today's Snapshot"} — {new Date().toLocaleDateString(lang === 'rw' ? "rw-RW" : "en-RW", { dateStyle: "medium" })}
                      </span>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: (d as any).newCheckIns || "New Check-ins", value: todayBookings.length, icon: ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: (d as any).checkOutsToday || "Check-outs Today", value: todayCheckouts.length, icon: ArrowDownRight, color: "text-red-500", bg: "bg-red-50" },
                        { label: (d as any).conferences || "Conferences", value: todayConferences.length, icon: ConciergeBell, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: (d as any).revenueToday || "Revenue Today", value: `RWF ${todayRevenue.toLocaleString()}`, icon: DollarSign, color: "text-gold", bg: "bg-amber-50" },
                      ].map((m, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          <div className={`w-8 h-8 rounded-xl ${m.bg} flex items-center justify-center mb-2`}>
                            <m.icon size={16} className={m.color} />
                          </div>
                          <p className="text-xl font-black text-black">{m.value}</p>
                          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* In-house guests */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-500">{(d as any).currentlyInHouse || "Currently In-House"}</p>
                        <span className="text-xs font-black text-white bg-black px-2.5 py-1 rounded-full">{inHouseGuests.length} {(d as any).guests || "guests"}</span>
                      </div>
                      {inHouseGuests.length === 0 ? (
                        <p className="text-sm text-gray-400 font-medium text-center py-4">{(d as any).noGuestsCheckedIn || "No guests currently checked in."}</p>
                      ) : (
                        <div className="space-y-2">
                          {inHouseGuests.slice(0, 5).map((g, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-gold text-xs font-black">
                                  {g.fullName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-black leading-tight">{g.fullName}</p>
                                  <p className="text-[11px] text-gray-400">{g.roomAssigned}</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 font-medium">{(d as any).out || "Out"}: {g.checkOut}</p>
                            </div>
                          ))}
                          {inHouseGuests.length > 5 && (
                            <p className="text-xs text-center text-gray-400 font-medium pt-1">+{inHouseGuests.length - 5} {(d as any).moreGuests || "more guests"}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Room status quick view */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{(d as any).roomStatusToday || "Room Status Today"}</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { label: (d as any).available || "Available", value: availableRooms, color: "text-emerald-600" },
                          { label: (d as any).occupied || "Occupied", value: occupiedRooms, color: "text-red-500" },
                          { label: (d as any).booked || "Booked", value: bookedRooms, color: "text-blue-600" },
                          { label: (d as any).maintenance || "Maintenance", value: maintenanceRooms, color: "text-amber-500" },
                        ].map((r, i) => (
                          <div key={i}>
                            <p className={`text-2xl font-black ${r.color}`}>{r.value}</p>
                            <p className="text-[10px] text-gray-400 font-bold leading-tight mt-0.5">{r.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        {totalRooms > 0 && (
                          <>
                            <div style={{ width: `${(occupiedRooms / totalRooms) * 100}%` }} className="bg-red-400 h-full" />
                            <div style={{ width: `${(bookedRooms / totalRooms) * 100}%` }} className="bg-blue-400 h-full" />
                            <div style={{ width: `${(availableRooms / totalRooms) * 100}%` }} className="bg-emerald-400 h-full" />
                            <div style={{ width: `${(maintenanceRooms / totalRooms) * 100}%` }} className="bg-amber-400 h-full" />
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── MONTHLY REPORT ── */}
                {reportTab === "monthly" && (
                  <motion.div key="monthly" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 size={15} className="text-gold" />
                      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                        {new Date().toLocaleString(lang === 'rw' ? "rw-RW" : "en-RW", { month: "long", year: "numeric" })} {(d as any).summary || "Summary"}
                      </span>
                    </div>

                    {/* Revenue / Expenses / Profit cards */}
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{(d as any).totalRevenue || "Total Revenue"}</p>
                          <TrendingUp size={16} className="text-emerald-600" />
                        </div>
                        <p className="text-3xl font-black text-emerald-700">RWF {monthTotalRevenue.toLocaleString()}</p>
                        <div className="mt-3 space-y-1.5 text-xs font-medium text-emerald-600">
                          <div className="flex justify-between">
                            <span>{(d as any).roomBookings || "Room Bookings"}</span>
                            <span className="font-black">RWF {monthRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sauna & Spa</span>
                            <span className="font-black">RWF {monthSaunaRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{(d as any).otherRevenue || "Other Revenue"}</span>
                            <span className="font-black">RWF {monthOtherRevenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black uppercase tracking-wider text-red-700">{(d as any).totalExpenses || "Total Expenses"}</p>
                          <TrendingDown size={16} className="text-red-500" />
                        </div>
                        <p className="text-3xl font-black text-red-600">RWF {monthExpenses.toLocaleString()}</p>
                        {monthExpenses === 0 && (
                          <p className="text-xs text-red-400 mt-1.5 font-medium">{(d as any).noExpensesLogged || "No expenses logged this month."}</p>
                        )}
                      </div>

                      <div className={`border rounded-2xl p-5 ${monthProfit >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-black uppercase tracking-wider ${monthProfit >= 0 ? "text-blue-700" : "text-orange-700"}`}>{(d as any).netProfit || "Net Profit"}</p>
                          <Star size={16} className={monthProfit >= 0 ? "text-blue-500" : "text-orange-500"} />
                        </div>
                        <p className={`text-3xl font-black ${monthProfit >= 0 ? "text-blue-700" : "text-orange-600"}`}>
                          {monthProfit < 0 ? "-" : ""}RWF {Math.abs(monthProfit).toLocaleString()}
                        </p>
                        {monthTotalRevenue > 0 && (
                          <p className={`text-xs font-bold mt-1.5 ${monthProfit >= 0 ? "text-blue-500" : "text-orange-500"}`}>
                            {(d as any).margin || "Margin"}: {Math.round((monthProfit / monthTotalRevenue) * 100)}%
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Monthly bookings breakdown */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{(d as any).thisMonthsBookings || "This Month's Bookings"}</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: (d as any).total || "Total", value: monthBookings.length, color: "text-black" },
                          { label: (d as any).confirmed || "Confirmed", value: monthBookings.filter(b => b.status === "Confirmed").length, color: "text-emerald-600" },
                          { label: (d as any).pending || "Pending", value: monthBookings.filter(b => b.status === "Pending").length, color: "text-amber-500" },
                        ].map((item, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl py-3">
                            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Past months mini list */}
                    {monthlyReport.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{(d as any).revenuePastMonths || "Revenue — Past Months"}</p>
                        <div className="space-y-2.5">
                          {monthlyReport.slice(0, 6).map((r, i) => (
                            <div key={r.month} className="flex items-center gap-3">
                              <p className="text-xs font-bold text-gray-600 w-28 shrink-0">{formatMonth(r.month)}</p>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(5, (r.revenue / maxMonthlyRevenue) * 100)}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.05 }}
                                  className="h-full bg-black rounded-full"
                                />
                              </div>
                              <p className="text-xs font-black text-gold w-28 text-right shrink-0">RWF {r.revenue.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── RECEPTION REPORT ── */}
                {reportTab === "reception" && (
                  <motion.div key="reception" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Hotel size={15} className="text-gold" />
                      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{(d as any).receptionOverview || "Reception & Operations Overview"}</span>
                    </div>

                    {/* Occupancy Rate */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-500">{(d as any).occupancyRate || "Occupancy Rate"}</p>
                        <span className="text-xs font-black bg-black text-gold px-2.5 py-1 rounded-full">{totalRooms} {(d as any).totalRooms || "total rooms"}</span>
                      </div>
                      <div className="flex items-end gap-4">
                        <p className="text-5xl font-black text-black">{occupancyRate}<span className="text-2xl text-gray-400">%</span></p>
                        <div className="flex-1 mb-1.5">
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${occupancyRate}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${occupancyRate > 70 ? "bg-emerald-500" : occupancyRate > 40 ? "bg-amber-400" : "bg-red-400"}`}
                            />
                          </div>
                          <p className="text-xs text-gray-400 font-medium mt-1">{occupiedRooms} {(d as any).occupiedOf || "occupied of"} {totalRooms} {(d as any).rooms || "rooms"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Room breakdown */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{(d as any).roomBreakdown || "Room Breakdown"}</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { label: (d as any).available || "Available", value: availableRooms, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                          { label: (d as any).occupied || "Occupied", value: occupiedRooms, color: "bg-red-50 text-red-700 border-red-100" },
                          { label: (d as any).booked || "Booked", value: bookedRooms, color: "bg-blue-50 text-blue-700 border-blue-100" },
                          { label: (d as any).maintenance || "Maintenance", value: maintenanceRooms, color: "bg-amber-50 text-amber-700 border-amber-100" },
                        ].map((item, i) => (
                          <div key={i} className={`border rounded-xl p-3 ${item.color}`}>
                            <p className="text-2xl font-black">{item.value}</p>
                            <p className="text-[11px] font-bold uppercase tracking-wide opacity-70 mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Guest Summary */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{(d as any).guestSummary || "Guest Summary"}</p>
                      <div className="space-y-2.5">
                        {[
                          { label: (d as any).currentlyInHouse || "Currently In-House", value: totalGuests, icon: Users },
                          { label: (d as any).totalBookingsAllTime || "Total Bookings (All Time)", value: bookings.length, icon: Calendar },
                          { label: (d as any).confirmedBookings || "Confirmed Bookings", value: bookings.filter(b => b.status === "Confirmed").length, icon: CheckCircle },
                          { label: (d as any).pendingBookings || "Pending Bookings", value: bookings.filter(b => b.status === "Pending").length, icon: Layers },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2">
                              <item.icon size={14} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">{item.label}</span>
                            </div>
                            <span className="text-sm font-black text-black">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conference Summary */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{(d as any).conferenceAndEvents || "Conference & Events"}</p>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        {[
                          { label: (d as any).total || "Total", value: totalConferences, color: "text-black" },
                          { label: (d as any).confirmed || "Confirmed", value: confirmedConf, color: "text-emerald-600" },
                          { label: (d as any).pending || "Pending", value: pendingConf, color: "text-amber-500" },
                        ].map((item, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl py-3">
                            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      {conferenceBookings.length === 0 && (
                        <p className="text-xs text-gray-400 text-center font-medium py-1">{(d as any).noConferenceRecord || "No conference bookings on record."}</p>
                      )}
                      {conferenceBookings.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-t border-gray-50">
                          <div>
                            <p className="text-sm font-bold text-black">{c.contactName}</p>
                            <p className="text-[11px] text-gray-400">{c.eventType} · {c.date}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            c.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                            c.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          }`}>{c.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Sauna Summary */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Flame size={15} className="text-amber-500" />
                          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Sauna & Wellness Sessions</p>
                        </div>
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          {saunaBookings.filter(s => s.status === "Pending").length} Pending
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        {[
                          { label: (d as any).total || "Total", value: saunaBookings.length, color: "text-black" },
                          { label: (d as any).confirmed || "Confirmed", value: saunaBookings.filter(s => s.status === "Confirmed").length, color: "text-emerald-600" },
                          { label: (d as any).pending || "Pending", value: saunaBookings.filter(s => s.status === "Pending").length, color: "text-amber-500" },
                        ].map((item, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl py-3">
                            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      {saunaBookings.length === 0 && (
                        <p className="text-xs text-gray-400 text-center font-medium py-1">No sauna bookings on record.</p>
                      )}
                      {saunaBookings.slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-t border-gray-50">
                          <div>
                            <p className="text-sm font-bold text-black">{s.guestName}</p>
                            <p className="text-[11px] text-gray-400">{s.sessionType} · {s.date} ({s.timeSlot})</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            s.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                            s.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          }`}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium">{(d as any).liveData || "Live data · Updated now"}</p>
                <Link
                  href={`/${lang}/dashboard/reports`}
                  onClick={() => setShowReports(false)}
                  className="flex items-center gap-1.5 text-xs font-black text-gold hover:underline"
                >
                  {(d as any).fullReports || "Full Reports"} <ChevronRight size={12} />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
