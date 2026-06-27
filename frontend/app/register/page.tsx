"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRegister } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";

const ENTER = { type: "spring" as const, stiffness: 220, damping: 22, mass: 1 };

const REGIONS = [
  ["tashkent_city","Toshkent shahri"],["tashkent_region","Toshkent viloyati"],
  ["samarkand","Samarqand"],["bukhara","Buxoro"],["fergana","Farg'ona"],
  ["namangan","Namangan"],["andijan","Andijon"],["sirdaryo","Sirdaryo"],
  ["navoi","Navoiy"],["jizzakh","Jizzax"],["kashkadarya","Qashqadaryo"],
  ["surkhandarya","Surxondaryo"],["khorezm","Xorazm"],["karakalpakstan","Qoraqalpog'iston"],
];

const PERKS = [
  "Bepul boshlang",
  "AI moliyaviy tahlil",
  "Angel investorlar bilan bog'lanish",
  "Kredit tayyorlik sertifikati",
];

const inputSt: React.CSSProperties = {
  background: "rgba(253,240,248,0.7)",
  border: "1.5px solid rgba(200,180,220,0.4)",
  color: "#1a2040",
  transition: "border-color 0.15s, background 0.15s",
};
const onF = (e: React.FocusEvent<any>) => {
  e.target.style.borderColor = "#0d6e64";
  e.target.style.background = "rgba(255,255,255,0.95)";
};
const onB = (e: React.FocusEvent<any>) => {
  e.target.style.borderColor = "rgba(200,180,220,0.4)";
  e.target.style.background = "rgba(253,240,248,0.7)";
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "", full_name: "", password: "", role: "founder",
    business_name: "", region: "tashkent_city",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const f = (k: string) => (e: React.ChangeEvent<any>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak"); return; }
    setLoading(true); setError("");
    try {
      const res = await authRegister(form);
      saveAuth(res.data.access_token, res.data.user);
      setSuccess(true);
      await new Promise(r => setTimeout(r, 600));
      router.push("/dashboard/founder");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        (err.message?.includes("Network") ? "Serverga ulanib bo'lmadi." : "Ro'yxatdan o'tish amalga oshmadi")
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
      {/* Pastel blobs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-15%] left-[-10%] w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: "rgba(108,99,255,0.25)", filter: "blur(100px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-[540px] h-[540px] rounded-full pointer-events-none"
        style={{ background: "rgba(240,130,200,0.23)", filter: "blur(100px)" }}
      />

      {/* ── Card: horizontal split ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...ENTER, delay: 0.06 }}
        className="relative z-10 w-full flex rounded-3xl overflow-hidden"
        style={{
          maxWidth: 760,
          boxShadow: "0 16px 64px rgba(80,60,140,0.14), 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* ── LEFT: Branding panel ── */}
        <div
          className="hidden md:flex flex-col items-center justify-center px-10 py-12"
          style={{
            width: "40%",
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
              width={155}
              height={105}
              className="object-contain"
              priority
            />
            <p className="text-xs text-center leading-relaxed" style={{ color: "#6b7280" }}>
              Hisob yarating va moliyaviy<br />imkoniyatlaringizni oching
            </p>
            <div className="flex flex-col gap-2.5 w-full mt-2">
              {PERKS.map((t, i) => (
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

        {/* ── RIGHT: Register form ── */}
        <div
          className="flex-1 px-8 py-8"
          style={{ background: "rgba(255,255,255,0.92)" }}
        >
          {/* Mobile-only logo */}
          <div className="flex justify-center mb-5 md:hidden">
            <Image src="/logo.jpg" alt="FinFlow AI" width={120} height={80} className="object-contain" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...ENTER, delay: 0.12 }}
          >
            <h1 className="text-xl font-black mb-1" style={{ color: "#1a2040" }}>Hisob yaratish</h1>
            <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>Bepul boshlang</p>

            <form onSubmit={submit} className="space-y-3">
              {/* Full name */}
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: "#374151" }}>To'liq ism</label>
                <input type="text" placeholder="Sardor Rahimov"
                  value={form.full_name} onChange={f("full_name")} required
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={inputSt} onFocus={onF} onBlur={onB}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: "#374151" }}>Email</label>
                <input type="email" placeholder="siz@kompaniya.uz"
                  value={form.email} onChange={f("email")} required autoComplete="email"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={inputSt} onFocus={onF} onBlur={onB}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: "#374151" }}>Parol (kamida 8 belgi)</label>
                <input type="password" placeholder="••••••••"
                  value={form.password} onChange={f("password")} required autoComplete="new-password"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={inputSt} onFocus={onF} onBlur={onB}
                />
              </div>

              {/* Business name */}
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: "#374151" }}>Biznes nomi (ixtiyoriy)</label>
                <input type="text" placeholder="Kompaniya MChJ"
                  value={form.business_name} onChange={f("business_name")}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  style={inputSt} onFocus={onF} onBlur={onB}
                />
              </div>

              {/* Role + Region */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: "#374151" }}>Rol</label>
                  <select value={form.role} onChange={f("role")}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={inputSt} onFocus={onF} onBlur={onB}
                  >
                    <option value="founder">Founder</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: "#374151" }}>Hudud</label>
                  <select value={form.region} onChange={f("region")}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={inputSt} onFocus={onF} onBlur={onB}
                  >
                    {REGIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl px-4 py-2.5 text-xs flex items-start gap-2"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
                  >
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl px-4 py-2.5 text-xs flex items-center gap-2"
                    style={{ background: "rgba(13,110,100,0.08)", border: "1px solid rgba(13,110,100,0.25)", color: "#0d6e64" }}
                  >
                    <CheckCircle size={13} /> Muvaffaqiyatli! Yo'naltirilmoqda...
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 mt-1"
                style={{ background: "#0d1b4b" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block"
                    />
                    Kutilmoqda...
                  </span>
                ) : "Hisob yaratish"}
              </motion.button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: "#9ca3af" }}>
              Hisob bormi?{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: "#0d6e64" }}>
                Kirish
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
