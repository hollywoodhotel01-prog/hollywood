"use client";

import { useState } from "react";
import { useHotel, STAFF_ROSTER } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

const STAFF_LIST = Object.entries(STAFF_ROSTER).map(([email, info]) => ({
  email,
  role: info.role,
  name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
}));

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cashier: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  receptionist: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  accountant: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function ChangePasswordPage() {
  const { currentUser, adminChangePassword } = useHotel();
  const { lang } = useLanguage();
  const router = useRouter();

  const [selectedEmail, setSelectedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Guard: only admin
  if (currentUser?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-sm">
          <Lock size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-black text-red-400 mb-1">Access Denied</h2>
          <p className="text-sm text-gray-400">Only the Admin can change user passwords.</p>
        </div>
      </div>
    );
  }

  const selectedStaff = STAFF_LIST.find((s) => s.email === selectedEmail);

  const passwordStrength = (() => {
    if (!newPassword) return null;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    if (!selectedEmail) {
      setErrorMsg("Please select a staff member.");
      setStatus("error");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }

    setLoading(true);
    try {
      await adminChangePassword(selectedEmail, newPassword);
      setStatus("success");
      setNewPassword("");
      setConfirmPassword("");
      setSelectedEmail("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to change password.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gold p-2.5 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.25)]">
            <KeyRound size={22} className="text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Change User Password</h1>
            <p className="text-sm text-gray-500 font-medium">
              Admin override — no previous password required
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent mt-4" />
      </div>

      {/* Success Banner */}
      {status === "success" && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 animate-in fade-in">
          <CheckCircle size={22} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-black text-emerald-700 text-sm">Password changed successfully!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              The user will need to use the new password on their next login.
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

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Step 1: Select Staff */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 bg-black text-white text-xs font-black rounded-full flex items-center justify-center shrink-0">
                1
              </span>
              <span className="font-black text-sm text-gray-700 uppercase tracking-wider">
                Select Staff Member
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
                      {selectedStaff.email.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex flex-col items-start">
                      <span className="text-gray-900 font-black text-sm">{selectedStaff.email}</span>
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
                    <span>Select a staff member…</span>
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                  {STAFF_LIST.map((staff) => (
                    <button
                      key={staff.email}
                      type="button"
                      onClick={() => {
                        setSelectedEmail(staff.email);
                        setDropdownOpen(false);
                        setStatus("idle");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                        selectedEmail === staff.email ? "bg-gold/5" : ""
                      }`}
                    >
                      <span className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">
                        {staff.email.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-gray-900 font-black text-sm">{staff.email}</span>
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
                Set New Password
              </span>
            </div>

            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password-input"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setStatus("idle");
                    }}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 font-semibold text-sm text-gray-900 focus:outline-none focus:border-gold focus:bg-white transition-all placeholder:text-gray-300"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength Bar */}
                {passwordStrength && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.width}`}
                      />
                    </div>
                    <span className={`text-[11px] font-black ${
                      passwordStrength.label === "Weak" ? "text-red-500" :
                      passwordStrength.label === "Fair" ? "text-amber-500" :
                      passwordStrength.label === "Good" ? "text-blue-500" : "text-emerald-500"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password-input"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setStatus("idle");
                    }}
                    placeholder="Re-enter new password"
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 bg-gray-50 font-semibold text-sm text-gray-900 focus:outline-none focus:bg-white transition-all placeholder:text-gray-300 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-red-300 focus:border-red-400"
                        : confirmPassword && confirmPassword === newPassword
                        ? "border-emerald-300 focus:border-emerald-400"
                        : "border-gray-200 focus:border-gold"
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="mt-1.5 text-xs text-red-500 font-bold">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="mt-1.5 text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle size={12} /> Passwords match
                  </p>
                )}
              </div>

              {/* Requirements hint */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-400 font-medium space-y-1">
                <p className="font-black text-gray-500 uppercase tracking-wider text-[10px] mb-1.5">
                  Password Requirements
                </p>
                {[
                  { rule: newPassword.length >= 8, text: "At least 8 characters" },
                  { rule: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
                  { rule: /[0-9]/.test(newPassword), text: "One number" },
                  { rule: /[^A-Za-z0-9]/.test(newPassword), text: "One special character" },
                ].map(({ rule, text }) => (
                  <p key={text} className={`flex items-center gap-1.5 ${rule ? "text-emerald-500" : "text-gray-400"}`}>
                    <span>{rule ? "✓" : "○"}</span>
                    <span>{text}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <button
              type="submit"
              id="change-password-submit-btn"
              disabled={loading || !selectedEmail || !newPassword || newPassword !== confirmPassword}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-black text-white font-black text-sm rounded-xl hover:bg-gold hover:text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing Password…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2.5 text-xs text-gray-400 font-medium px-1">
        <Lock size={13} className="mt-0.5 shrink-0 text-gray-300" />
        <p>
          This action uses the Firebase Admin SDK and does not require the user's current password.
          The change takes effect immediately on next login.
        </p>
      </div>
    </div>
  );
}
