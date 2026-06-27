"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authLogin } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";

const ENTER = { type: "spring" as const, stiffness: 220, damping: 24, mass: 0.9 };

const FEATURES = [
  "AI tomonidan moliyaviy audit",
  "SQB kredit tayyorlik indeksi",
  "Angel investor platforma",
  "IT Park imtiyoz kalkulyatori",
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authLogin(form);
      saveAuth(res.data.access_token, res.data.user);
      await new Promise(r => setTimeout(r, 200));
      router.push(res.data.user.is_admin ? "/admin" : "/dashboard/founder");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        (err.message?.includes("Network") ? "Serverga ulanib bo'lmadi." : "Kirish amalga oshmadi")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#f0f3fa" }}
    >
      {/* Pastel blob — bottom-left */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-15%] left-[-10%] w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: "rgba(108,99,255,0.27)", filter: "blur(100px)" }}
      />
      {/* Pastel blob — top-right */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[-10%] right-[-10%] w-[540px] h-[540px] rounded-full pointer-events-none"
        style={{ background: "rgba(240,130,200,0.25)", filter: "blur(100px)" }}
      />

      {/* ── Card: horizontal split ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...ENTER, delay: 0.06 }}
        className="relative z-10 w-full flex rounded-3xl overflow-hidden"
        style={{
          maxWidth: 740,
          boxShadow: "0 16px 64px rgba(80,60,140,0.14), 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* ── LEFT: Logo & branding ── */}
        <div
          className="hidden md:flex flex-col items-center justify-center px-10 py-12"
          style={{
            width: "42%",
            flexShrink: 0,
            background: "linear-gradient(145deg, rgba(13,110,100,0.09) 0%, rgba(108,99,255,0.08) 100%)",
            borderRight: "1px solid rgba(200,180,220,0.22)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...ENTER, delay: 0.15 }}
            className="flex flex-col items-center gap-5"
          >
            <Image
              src="/logo.jpg"
              alt="FinFlow AI"
              width={160}
              height={108}
              className="object-contain"
              priority
            />
            <p className="text-xs text-center leading-relaxed" style={{ color: "#6b7280" }}>
              O'zbekiston SME tadbirkorlari uchun<br />AI-asosli moliyaviy boshqaruv
            </p>
            <div className="flex flex-col gap-2.5 w-full mt-2">
              {FEATURES.map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.08 }}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(13,110,100,0.13)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#0d6e64" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-xs" style={{ color: "#4b5563" }}>{t}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: Login form ── */}
        <div
          className="flex-1 px-8 py-10"
          style={{ background: "rgba(255,255,255,0.92)" }}
        >
          {/* Mobile-only logo */}
          <div className="flex justify-center mb-6 md:hidden">
            <Image src="/logo.jpg" alt="FinFlow AI" width={120} height={80} className="object-contain" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...ENTER, delay: 0.12 }}
          >
            <h1 className="text-2xl font-black mb-1" style={{ color: "#1a2040" }}>Xush kelibsiz</h1>
            <p className="text-xs mb-7" style={{ color: "#9ca3af" }}>Hisobingizga kiring</p>

            <form onSubmit={submit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Email manzil
                </label>
                <input
                  type="email"
                  placeholder="siz@kompaniya.uz"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(253,240,248,0.7)", border: "1.5px solid rgba(200,180,220,0.4)", color: "#1a2040", transition: "border-color 0.15s, background 0.15s" }}
                  onFocus={e => { e.target.style.borderColor = "#0d6e64"; e.target.style.background = "rgba(255,255,255,0.95)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(200,180,220,0.4)"; e.target.style.background = "rgba(253,240,248,0.7)"; }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Parol
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm outline-none"
                    style={{ background: "rgba(253,240,248,0.7)", border: "1.5px solid rgba(200,180,220,0.4)", color: "#1a2040", transition: "border-color 0.15s, background 0.15s" }}
                    onFocus={e => { e.target.style.borderColor = "#0d6e64"; e.target.style.background = "rgba(255,255,255,0.95)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(200,180,220,0.4)"; e.target.style.background = "rgba(253,240,248,0.7)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl px-4 py-2.5 text-xs flex items-start gap-2"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
                  >
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                style={{ background: "#0d1b4b", color: "#ffffff" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 rounded-full block"
                      style={{ border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#ffffff" }}
                    />
                    <span style={{ color: "#ffffff" }}>Kutilmoqda...</span>
                  </span>
                ) : <span style={{ color: "#ffffff" }}>Kirish</span>}
              </motion.button>

              {/* Demo creds */}
              <div
                className="rounded-xl px-4 py-2.5"
                style={{ background: "rgba(13,110,100,0.06)", border: "1px solid rgba(13,110,100,0.18)" }}
              >
                <p className="text-[11px] font-semibold mb-0.5" style={{ color: "#0d6e64" }}>Demo Admin:</p>
                <button
                  type="button"
                  onClick={() => setForm({ email: "admin@finflow.uz", password: "Admin@12345" })}
                  className="text-[11px] hover:underline"
                  style={{ color: "#0d6e64" }}
                >
                  admin@finflow.uz / Admin@12345
                </button>
              </div>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: "#9ca3af" }}>
              Hisob yo'qmi?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: "#0d6e64" }}>
                Ro'yxatdan o'tish
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
