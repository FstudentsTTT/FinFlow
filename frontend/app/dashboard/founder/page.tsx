"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { auditHistory } from "@/lib/api";
import AIBadge from "@/components/ui/Badge";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { fmtUZS, fmtDate, RATING_COLORS } from "@/lib/utils";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 24, mass: 0.9 };
const ENTER  = { type: "spring" as const, stiffness: 220, damping: 22, mass: 1 };

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function IconMoney() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#10b981" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconGrowth() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#38bdf8" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#10b981" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
  );
}

function IconPitch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconWarn() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function AnimCard({ children, delay = 0, className = "", hover = false }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...ENTER, delay }}
      whileHover={hover ? { y: -6, scale: 1.012, transition: SPRING } : undefined}
      whileTap={hover ? { scale: 0.985, transition: { duration: 0.1 } } : undefined}
      className={`rounded-2xl p-5 ${className}`}
      style={{
        willChange: "transform",
        background: "var(--ff-card)",
        border: "1px solid var(--ff-accent-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {children}
    </motion.div>
  );
}

export default function FounderDashboard() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditHistory().then(r => setAudits(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const latest = audits[0];
  const sqbScore = user?.last_sqb_score ?? latest?.sqb_score ?? 0;
  const badgeVerified = user?.badge_verified ?? latest?.badge_eligible ?? false;
  const pct = Math.min(sqbScore, 100);

  const scoreColor =
    pct >= 70 ? "#10b981" :
    pct >= 55 ? "#3b82f6" :
    pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="p-6 space-y-6 min-h-screen" style={{ background: "transparent" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ENTER, delay: 0 }}
      >
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Xush kelibsiz, {user?.full_name?.split(" ")[0]}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#10b981" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {user?.business_name ? `${user.business_name} · ` : ""}
              Moliyaviy boshqaruv paneli
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* AI Badge card */}
        <AnimCard delay={0.06} className="md:col-span-1 flex flex-col items-center text-center">
          <AIBadge verified={badgeVerified} score={sqbScore} rating={latest?.sqb_rating} size="lg" />
        </AnimCard>

        {/* SQB Score ring */}
        <AnimCard delay={0.11} className="md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SQB Indeksi</p>
            <IconGrowth />
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg width="80" height="80" className="-rotate-90">
                <circle cx="40" cy="40" r="30" fill="none" stroke="var(--ff-border, #1e293b)" strokeWidth="7" opacity="0.5" />
                <motion.circle
                  cx="40" cy="40" r="30"
                  fill="none" stroke={scoreColor} strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 30}
                  initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - pct / 100) }}
                  transition={{ duration: 1.4, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.3 }}
                  style={{ filter: `drop-shadow(0 0 6px ${scoreColor}80)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl font-black leading-none"
                  style={{ color: "var(--ff-text)" }}
                >
                  <AnimatedNumber value={sqbScore} duration={1400} />
                </motion.span>
                <span className="text-[9px]" style={{ color: "var(--ff-text-subtle)" }}>/ 100</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--ff-border, #1e293b)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.3, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.35 }}
                  className="h-full rounded-full"
                  style={{ background: scoreColor }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-600 mb-2">
                <span>0</span><span>40</span><span>70</span><span>100</span>
              </div>
              <p className={`text-xs font-semibold ${RATING_COLORS[latest?.sqb_rating || "INELIGIBLE"]}`}>
                {latest?.sqb_rating || "Hali audit yo'q"}
              </p>
            </div>
          </div>
        </AnimCard>

        {/* Quick stats */}
        <AnimCard delay={0.16} className="md:col-span-1 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--ff-text-muted)" }}>Tizim holati</p>
          {[
            { IconC: IconCheck, label: "Tax Status", val: user?.tax_status || "UNVERIFIED", color: user?.tax_status === "VERIFIED" ? "text-emerald-400" : "text-amber-400" },
            { IconC: IconClock, label: "Jami auditlar", val: `${audits.length} ta`, color: "text-emerald-400" },
            { IconC: IconWarn, label: "Badge holati", val: badgeVerified ? "Tasdiqlangan" : "Tasdiqlanmagan", color: badgeVerified ? "text-emerald-400" : "text-slate-400" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...ENTER, delay: 0.2 + i * 0.07 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <s.IconC />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <span className={`text-xs font-semibold ${s.color}`}>{s.val}</span>
            </motion.div>
          ))}
        </AnimCard>
      </div>

      {/* CTA cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Yangi Audit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTER, delay: 0.22 }}
          whileHover={{ y: -5, scale: 1.01, transition: SPRING }}
          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
          style={{ willChange: "transform" }}
        >
          <Link href="/dashboard/audit">
            <div className="rounded-2xl p-5 cursor-pointer group" style={{ background: "var(--ff-card)", border: "1px solid var(--ff-accent-border)", transition: "border-color 0.2s, background 0.2s" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center mb-3">
                    <IconMoney />
                  </div>
                  <h3 className="font-bold text-white text-sm">Yangi Audit</h3>
                  <p className="text-xs text-slate-400 mt-1">AI moliyaviy tahlil</p>
                </div>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <IconArrow />
                </motion.div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* AI CFO Agent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTER, delay: 0.27 }}
          whileHover={{ y: -5, scale: 1.01, transition: SPRING }}
          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
          style={{ willChange: "transform" }}
        >
          <Link href="/dashboard/ai-agent">
            <div className="rounded-2xl p-5 cursor-pointer group" style={{ background: "var(--ff-accent-bg)", border: "1px solid var(--ff-accent-border)", transition: "border-color 0.2s, background 0.2s" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center mb-3">
                    <IconAI />
                  </div>
                  <h3 className="font-bold text-white text-sm">AI CFO Agent</h3>
                  <p className="text-xs text-slate-400 mt-1">Shaxsiy moliyaviy maslahat</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 font-semibold">YANGI</span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <IconArrow />
                  </motion.div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTER, delay: 0.32 }}
          whileHover={{ y: -5, scale: 1.01, transition: SPRING }}
          whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
          style={{ willChange: "transform" }}
        >
          <Link href="/dashboard/angel">
            <div className={`rounded-2xl p-5 border cursor-pointer transition-colors group ${
              badgeVerified
                ? "border-yellow-500/20 bg-yellow-900/10 hover:border-yellow-500/40"
                : "border-slate-800/50 bg-slate-900/30 hover:border-slate-700/60"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${badgeVerified ? "bg-yellow-500/15" : "bg-slate-800/60"}`}>
                    <IconPitch />
                  </div>
                  <h3 className="font-bold text-white text-sm">Pitch Yuklash</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {badgeVerified ? "Angel investorlar uchun" : "Badge talab etiladi"}
                  </p>
                </div>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className={`transition-opacity ${badgeVerified ? "text-yellow-400" : "text-slate-600"} opacity-60 group-hover:opacity-100`}
                >
                  <IconArrow />
                </motion.div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Recent audits */}
      {audits.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-sm">So'nggi Auditlar</h2>
            <Link href="/dashboard/history" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Barchasini ko'rish →
            </Link>
          </div>
          <div className="space-y-2">
            {audits.slice(0, 4).map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -12, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...ENTER, delay: 0.32 + i * 0.06 }}
                whileHover={{ x: 4, transition: { type: "spring", stiffness: 500, damping: 30 } }}
                className="rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer"
                style={{ background: "var(--ff-card)", border: "1px solid var(--ff-accent-border)", transition: "border-color 0.2s" }}
                style={{ willChange: "transform" }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{a.business_name}</p>
                  <p className="text-xs text-slate-500">{fmtDate(a.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${RATING_COLORS[a.sqb_rating] || "text-slate-400"}`}>
                    {a.sqb_score}/100
                  </span>
                  {a.badge_eligible && (
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20"
                    >
                      ✓ Badge
                    </motion.span>
                  )}
                  {a.dscr_display && (
                    <span className="text-xs text-slate-500">DSCR: {a.dscr_display}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {audits.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...ENTER, delay: 0.3 }}
          className="rounded-2xl p-10 text-center border-dashed"
          style={{ border: "1px dashed var(--ff-accent-border)", background: "var(--ff-accent-bg)" }}
        >
          <div className="flex justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#10b981" className="w-10 h-10 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white mb-1">Hali audit bajarilmagan</p>
          <p className="text-xs text-slate-500 mb-4">Birinchi AI moliyaviy auditingizni boshlang</p>
          <Link href="/dashboard/audit">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl font-medium transition-colors"
            >
              Audit boshlash →
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
