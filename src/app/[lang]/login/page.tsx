"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hotel, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";

const roleDashboard: Record<string, string> = {
  admin: "/dashboard",
  cashier: "/dashboard/cashier",
  receptionist: "/dashboard/receptionist",
  accountant: "/dashboard/accountant",
};

export default function LoginPage() {
  const { login, demoAccounts } = useHotel();
  const { lang, dict } = useLanguage();
  const d = dict.login;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(`/${lang}${roleDashboard[user.role] ?? "/dashboard"}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        setError(d.invalidCredentials);
      } else if (msg.includes("not a registered staff")) {
        setError("This email is not a registered staff account.");
      } else {
        setError(d.invalidCredentials);
      }
      setLoading(false);
    }
  };

  const fillDemo = (e: string, p: string) => { setEmail(e); setPassword(p); setError(""); };

  return (
    <div className="pt-20 min-h-screen bg-white flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
              <Hotel size={32} className="text-gold" />
            </div>
            <h1 className="text-3xl font-heading font-black text-black">{d.hotelControlSystem}</h1>
            <p className="text-gray-500 font-medium mt-2">{d.staffAccessOnly}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-2 border-gray-100 relative overflow-hidden mb-6">
            <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{d.emailAddress}</label>
                <input
                  required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="staff@hollywoodhotel.rw"
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{d.password}</label>
                <div className="relative">
                  <input
                    required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] disabled:opacity-70 flex justify-center items-center gap-3 group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : d.signIn}
                </span>
                <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              </button>
            </form>
          </div>

          {/* Staff accounts quick-fill */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gold/20 shadow-sm">
            <p className="text-xs font-black text-gold uppercase tracking-widest mb-4">{d.demoAccounts}</p>
            <div className="space-y-3">
              {demoAccounts.map((acc) => (
                <button key={acc.email} onClick={() => fillDemo(acc.email, acc.password)} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gold hover:bg-gold/5 transition-all text-left group">
                  <div>
                    <p className="text-sm font-bold text-black capitalize group-hover:text-gold transition-colors">{(dict.dashboard as any)[acc.role] || acc.role}</p>
                    <p className="text-xs text-gray-500 font-medium">{acc.email}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{acc.password}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 font-medium text-center">
              {d.demoWarning}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
