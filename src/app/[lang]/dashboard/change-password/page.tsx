"use client";

import { useState, useEffect } from "react";
import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Lock,
  User,
  ShieldAlert,
} from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  manager: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  cashier: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  receptionist: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  accountant: "bg-purple-500/20 text-purple-700 border-purple-500/30",
};

export default function ChangePasswordPage() {
  const { currentUser, staffUsers, changePassword, adminChangePassword } = useHotel();
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Can override if admin or manager
  const canAdminOverride = currentUser?.role === "admin" || currentUser?.role === "manager";

  // Tab mode: "self" (change my own password) or "admin" (override a staff member's password)
  const [activeTab, setActiveTab] = useState<"self" | "admin">(canAdminOverride ? "admin" : "self");

  // Self change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [selfNewPassword, setSelfNewPassword] = useState("");
  const [selfConfirmPassword, setSelfConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showSelfNewPassword, setShowSelfNewPassword] = useState(false);
  const [showSelfConfirm, setShowSelfConfirm] = useState(false);

  // Admin override state
  const [selectedEmail, setSelectedEmail] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Preset email from search params if provided
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setSelectedEmail(emailParam);
      if (canAdminOverride) {
        setActiveTab("admin");
      }
    }
  }, [searchParams, canAdminOverride]);

  if (!currentUser) {
    return null;
  }

  // Combined staff list
  const staffList = (staffUsers && staffUsers.length > 0
    ? staffUsers
    : [
        { email: "admin@hollywoodhotel.rw", role: "admin", displayName: "Admin" },
        { email: "manager@hollywoodhotel.rw", role: "manager", displayName: "Manager" },
        { email: "cashier@hollywoodhotel.rw", role: "cashier", displayName: "Cashier" },
        { email: "reception@hollywoodhotel.rw", role: "receptionist", displayName: "Receptionist" },
        { email: "accounts@hollywoodhotel.rw", role: "accountant", displayName: "Accountant" },
      ]
  ).map((s) => ({
    email: s.email,
    role: s.role,
    name: s.displayName || s.email.split("@")[0],
  }));

  const selectedStaff = staffList.find((s) => s.email.toLowerCase() === selectedEmail.toLowerCase());

  // Password strength calculation helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const selfPasswordStrength = getPasswordStrength(selfNewPassword);
  const adminPasswordStrength = getPasswordStrength(adminNewPassword);

  // Handle Self Password Change
  const handleSelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    if (!currentPassword) {
      setErrorMsg("Please enter your current password.");
      setStatus("error");
      return;
    }
    if (selfNewPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    if (selfNewPassword !== selfConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, selfNewPassword);
      setStatus("success");
      setCurrentPassword("");
      setSelfNewPassword("");
      setSelfConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update your password.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin/Manager Override Password Change
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    if (!selectedEmail) {
      setErrorMsg("Please select a staff member.");
      setStatus("error");
      return;
    }
    if (adminNewPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }

    setLoading(true);
    try {
      await adminChangePassword(selectedEmail, adminNewPassword);
      setStatus("success");
      setAdminNewPassword("");
      setAdminConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to override staff password.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gold p-2.5 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.25)]">
            <KeyRound size={22} className="text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Security & Password Management</h1>
            <p className="text-sm text-gray-500 font-medium">
              Update your account password or use manager override
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent mt-4" />
      </div>

      {/* Mode Switcher Tabs if Admin or Manager */}
      {canAdminOverride && (
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("admin");
              setStatus("idle");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "admin"
                ? "bg-black text-gold shadow-md"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <ShieldAlert size={16} />
            <span>Staff Password Override ({currentUser.role === "admin" ? "Admin" : "Manager"})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("self");
              setStatus("idle");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "self"
                ? "bg-black text-gold shadow-md"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <Lock size={16} />
            <span>Change My Own Password</span>
          </button>
        </div>
      )}

      {/* Success Banner */}
      {status === "success" && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 animate-in fade-in">
          <CheckCircle size={22} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-black text-emerald-700 text-sm">
              {activeTab === "admin"
                ? "User password updated successfully!"
                : "Your password has been changed successfully!"}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {activeTab === "admin"
                ? "The user can now sign in using the new credentials immediately."
                : "Please use this new password on your next login."}
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {status === "error" && errorMsg && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 animate-in fade-in">
          <AlertCircle size={22} className="text-red-500 mt-0.5 shrink-0" />
          <p className="font-bold text-red-700 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* TAB 1: SELF-SERVICE CHANGE PASSWORD */}
      {activeTab === "self" && (
        <form onSubmit={handleSelfSubmit}>
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-5">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signed In Account</p>
                <p className="text-sm font-black text-gray-900 mt-0.5">{currentUser.email}</p>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${ROLE_COLORS[currentUser.role] || ""}`}>
                {currentUser.role}
              </span>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="Enter your current password"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 font-semibold text-sm text-gray-900 focus:outline-none focus:border-gold focus:bg-white transition-all placeholder:text-gray-300"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showSelfNewPassword ? "text" : "password"}
                  value={selfNewPassword}
                  onChange={(e) => {
                    setSelfNewPassword(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 font-semibold text-sm text-gray-900 focus:outline-none focus:border-gold focus:bg-white transition-all placeholder:text-gray-300"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSelfNewPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSelfNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {selfPasswordStrength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${selfPasswordStrength.color} ${selfPasswordStrength.width}`}
                    />
                  </div>
                  <span className={`text-[11px] font-black ${
                    selfPasswordStrength.label === "Weak" ? "text-red-500" :
                    selfPasswordStrength.label === "Fair" ? "text-amber-500" :
                    selfPasswordStrength.label === "Good" ? "text-blue-500" : "text-emerald-500"
                  }`}>
                    {selfPasswordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showSelfConfirm ? "text" : "password"}
                  value={selfConfirmPassword}
                  onChange={(e) => {
                    setSelfConfirmPassword(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="Re-enter new password"
                  required
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 bg-gray-50 font-semibold text-sm text-gray-900 focus:outline-none focus:bg-white transition-all placeholder:text-gray-300 ${
                    selfConfirmPassword && selfConfirmPassword !== selfNewPassword
                      ? "border-red-300 focus:border-red-400"
                      : selfConfirmPassword && selfConfirmPassword === selfNewPassword
                      ? "border-emerald-300 focus:border-emerald-400"
                      : "border-gray-200 focus:border-gold"
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSelfConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSelfConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {selfConfirmPassword && selfConfirmPassword !== selfNewPassword && (
                <p className="mt-1.5 text-xs text-red-500 font-bold">Passwords do not match</p>
              )}
              {selfConfirmPassword && selfConfirmPassword === selfNewPassword && (
                <p className="mt-1.5 text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !currentPassword || !selfNewPassword || selfNewPassword !== selfConfirmPassword}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-black text-white font-black text-sm rounded-xl hover:bg-gold hover:text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating Password…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Update My Password
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: ADMIN / MANAGER OVERRIDE */}
      {canAdminOverride && activeTab === "admin" && (
        <form onSubmit={handleAdminSubmit}>
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            {/* Step 1: Select Staff */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-black text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="font-black text-sm text-gray-700 uppercase tracking-wider">
                  Select User (e.g. manager1, manager2, cashier...)
                </span>
              </div>

              {/* Custom Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  id="staff-dropdown-btn"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                    dropdownOpen
                      ? "border-gold bg-gold/5"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {selectedStaff ? (
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-black">
                        {selectedStaff.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex flex-col items-start">
                        <span className="text-gray-900 font-black text-sm">{selectedStaff.name}</span>
                        <span className="text-gray-400 text-xs">{selectedStaff.email}</span>
                      </span>
                      <span
                        className={`ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          ROLE_COLORS[selectedStaff.role] ?? ""
                        }`}
                      >
                        {selectedStaff.role}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-400">
                      <User size={16} />
                      <span>Select staff user to reset…</span>
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                    {staffList.map((staff) => (
                      <button
                        key={staff.email}
                        type="button"
                        onClick={() => {
                          setSelectedEmail(staff.email);
                          setDropdownOpen(false);
                          setStatus("idle");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                          selectedEmail.toLowerCase() === staff.email.toLowerCase() ? "bg-gold/5" : ""
                        }`}
                      >
                        <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">
                          {staff.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-gray-900 font-black text-sm truncate">{staff.name}</span>
                          <span className="block text-gray-400 text-xs truncate">{staff.email}</span>
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                            ROLE_COLORS[staff.role] ?? ""
                          }`}
                        >
                          {staff.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: New Password */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-black text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="font-black text-sm text-gray-700 uppercase tracking-wider">
                  Set New Password for User
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password-input"
                      type={showAdminPassword ? "text" : "password"}
                      value={adminNewPassword}
                      onChange={(e) => {
                        setAdminNewPassword(e.target.value);
                        setStatus("idle");
                      }}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 font-semibold text-sm text-gray-900 focus:outline-none focus:border-gold focus:bg-white transition-all placeholder:text-gray-300"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {adminPasswordStrength && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${adminPasswordStrength.color} ${adminPasswordStrength.width}`}
                        />
                      </div>
                      <span className={`text-[11px] font-black ${
                        adminPasswordStrength.label === "Weak" ? "text-red-500" :
                        adminPasswordStrength.label === "Fair" ? "text-amber-500" :
                        adminPasswordStrength.label === "Good" ? "text-blue-500" : "text-emerald-500"
                      }`}>
                        {adminPasswordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password-input"
                      type={showAdminConfirm ? "text" : "password"}
                      value={adminConfirmPassword}
                      onChange={(e) => {
                        setAdminConfirmPassword(e.target.value);
                        setStatus("idle");
                      }}
                      placeholder="Re-enter new password"
                      className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 bg-gray-50 font-semibold text-sm text-gray-900 focus:outline-none focus:bg-white transition-all placeholder:text-gray-300 ${
                        adminConfirmPassword && adminConfirmPassword !== adminNewPassword
                          ? "border-red-300 focus:border-red-400"
                          : adminConfirmPassword && adminConfirmPassword === adminNewPassword
                          ? "border-emerald-300 focus:border-emerald-400"
                          : "border-gray-200 focus:border-gold"
                      }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirm((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showAdminConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {adminConfirmPassword && adminConfirmPassword !== adminNewPassword && (
                    <p className="mt-1.5 text-xs text-red-500 font-bold">Passwords do not match</p>
                  )}
                  {adminConfirmPassword && adminConfirmPassword === adminNewPassword && (
                    <p className="mt-1.5 text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> Passwords match
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                type="submit"
                id="change-password-submit-btn"
                disabled={loading || !selectedEmail || !adminNewPassword || adminNewPassword !== adminConfirmPassword}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-black text-white font-black text-sm rounded-xl hover:bg-gold hover:text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting Password…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Override & Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2.5 text-xs text-gray-400 font-medium px-1">
        <Lock size={13} className="mt-0.5 shrink-0 text-gray-300" />
        <p>
          {activeTab === "admin"
            ? "Manager override bypasses the previous user password and updates their credentials directly in Firebase Authentication."
            : "Your password is encrypted and securely updated in the hotel system."}
        </p>
      </div>
    </div>
  );
}
