"use client";

import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Calendar, BedDouble, CheckCircle, DollarSign,
  ClipboardList, CreditCard, UserCog, ChevronRight,
  KeyRound, Eye, EyeOff, X, AlertCircle, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AdminDashboardPage() {
  const { bookings, inHouseGuests, roomsData, conferenceBookings, currentUser, changePassword } = useHotel();
  const { lang, dict } = useLanguage();
  const d = dict.dashboard;
  const [addStaffMsg, setAddStaffMsg] = useState(false);

  // ── Change Password Modal ────────────────────────────────────────
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const openChangePw = () => {
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwError(""); setPwSuccess(false); setPwLoading(false);
    setShowChangePw(true);
  };
  const closeChangePw = () => setShowChangePw(false);

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwSuccess(true);
      setTimeout(() => { setShowChangePw(false); }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setPwError("Current password is incorrect.");
      } else {
        setPwError("Failed to change password. Please try again.");
      }
    } finally {
      setPwLoading(false);
    }
  };
  // ────────────────────────────────────────────────────────────────

  const totalRevenue = bookings.filter(b => b.status === "Confirmed").reduce((s, b) => s + b.amount, 0);
  const occupiedRooms = roomsData.filter(r => r.status === "Occupied").length;

  const stats = [
    { label: d.totalBookings, value: bookings.length, icon: Calendar, color: "text-black", bg: "bg-gray-100" },
    { label: d.confirmed, value: bookings.filter(b => b.status === "Confirmed").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: d.roomsOccupied, value: occupiedRooms, icon: BedDouble, color: "text-gold", bg: "bg-black" },
    { label: d.inHouseGuests, value: inHouseGuests.length, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: d.revenueConfirmed, value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-100" },
    { label: d.conferenceBookings, value: conferenceBookings.length, icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  const shortcuts = [
    { label: d.cashierPosReport, href: `/${lang}/dashboard/cashier`, icon: CreditCard, desc: d.uploadDailyReport },
    { label: d.receptionistDesk, href: `/${lang}/dashboard/receptionist`, icon: ClipboardList, desc: d.guestCheckIn },
    { label: d.accountantOverview, href: `/${lang}/dashboard/accountant`, icon: DollarSign, desc: d.revenueBreakdown },
    { label: d.allBookings, href: `/${lang}/dashboard/bookings`, icon: Calendar, desc: d.viewSearchReservations },
  ];

  const demoStaff = [
    { name: "Victor Adonis", roleKey: "admin", email: "admin@hollywoodhotel.rw", href: `/${lang}/dashboard` },
    { name: "Sandra Mbeki", roleKey: "cashier", email: "cashier@hollywoodhotel.rw", href: `/${lang}/dashboard/cashier` },
    { name: "James Osei", roleKey: "receptionist", email: "reception@hollywoodhotel.rw", href: `/${lang}/dashboard/receptionist` },
    { name: "Grace Mutua", roleKey: "accountant", email: "accounts@hollywoodhotel.rw", href: `/${lang}/dashboard/accountant` },
  ];

  return (
    <>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">{d.adminOverview}</h1>
          <p className="text-gray-600 font-medium text-lg">{d.welcomeBack}, {currentUser?.name}. {d.fullControl}</p>
        </div>
        {/* Change Password Button */}
        <button
          id="change-password-btn"
          onClick={openChangePw}
          className="flex items-center gap-2 px-5 py-3 bg-black text-gold rounded-2xl font-bold text-sm hover:bg-gray-900 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(251,191,36,0.25)] group"
        >
          <KeyRound size={16} className="group-hover:rotate-12 transition-transform" />
          Change Password
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-gold hover:shadow-[0_10px_30px_rgba(251,191,36,0.1)] transition-all">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-black">{stat.value}</p>
              </div>
            </div>
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

      {/* Staff Accounts */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <UserCog size={22} className="text-gold" />
            <h2 className="text-2xl font-black text-black">{d.staffAccounts}</h2>
          </div>
          <button onClick={() => setAddStaffMsg(true)} className="px-5 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-colors shadow-md">
            {d.addStaff}
          </button>
        </div>
        {addStaffMsg && (
          <div className="px-8 py-4 bg-gold/10 border-b border-gold/20 text-sm font-medium text-black flex items-center gap-2">
            <CheckCircle size={16} className="text-gold" />
            {(d as any).staffModuleComing}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
              <tr>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">{d.name}</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">{d.role}</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">{d.email}</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Dashboard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {demoStaff.map((staff, i) => (
                <tr key={i} className="hover:bg-gold/5 transition-colors">
                  <td className="px-8 py-5 font-bold text-black">{staff.name}</td>
                  <td className="px-8 py-5">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-black text-gold">{(d as any)[staff.roleKey] || staff.roleKey}</span>
                  </td>
                  <td className="px-8 py-5 text-gray-500 font-medium">{staff.email}</td>
                  <td className="px-8 py-5 text-right">
                    <Link href={staff.href} className="text-xs font-bold text-gold hover:underline">
                      {d.view} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      <AnimatePresence>
        {showChangePw && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeChangePw(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.25)] w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative bg-black px-8 py-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                      <KeyRound size={20} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Change Password</h3>
                      <p className="text-xs text-gray-400 font-medium">{currentUser?.email}</p>
                    </div>
                  </div>
                  <button onClick={closeChangePw} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6">
                {pwSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <ShieldCheck size={32} className="text-green-600" />
                    </div>
                    <p className="font-black text-black text-lg">Password Changed!</p>
                    <p className="text-sm text-gray-500">Your password has been updated successfully.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleChangePw} className="space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          required
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPw}
                          onChange={e => setCurrentPw(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:border-gold outline-none transition-all font-medium text-sm"
                        />
                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                          {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          required
                          type={showNewPw ? "text" : "password"}
                          value={newPw}
                          onChange={e => setNewPw(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:border-gold outline-none transition-all font-medium text-sm"
                        />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                          {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {/* Password strength indicator */}
                      {newPw.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                              newPw.length >= (i + 1) * 2
                                ? i < 2 ? "bg-red-400" : i < 3 ? "bg-yellow-400" : "bg-green-500"
                                : "bg-gray-200"
                            }`} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        required
                        type="password"
                        value={confirmPw}
                        onChange={e => setConfirmPw(e.target.value)}
                        placeholder="Repeat new password"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 text-black focus:bg-white outline-none transition-all font-medium text-sm ${
                          confirmPw && confirmPw !== newPw ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-gold"
                        }`}
                      />
                    </div>

                    {pwError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        {pwError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={closeChangePw} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={pwLoading}
                        className="flex-1 py-3 rounded-xl bg-black text-gold font-bold text-sm hover:bg-gray-900 transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {pwLoading
                          ? <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                          : <><KeyRound size={14} /> Update Password</>
                        }
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
