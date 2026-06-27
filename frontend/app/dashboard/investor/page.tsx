"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { feedGet } from "@/lib/api";
import { fmtUZS, fmtDate, RATING_COLORS, SECTOR_LABELS, REGION_LABELS } from "@/lib/utils";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 240, damping: 22, mass: 0.9 };

function IconFeed() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function IconGrowth() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#38bdf8" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedGet(0, 50).then(r => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const topItems = items.slice(0, 3);

  return (
    <div className="p-6 space-y-6 min-h-screen" style={{ background: "transparent" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING }}>
        <h1 className="text-2xl font-black text-white">
          Xush kelibsiz, {user?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-400 mt-1">Angel Investor Portal · FinFlow AI</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Tasdiqlangan Bizneslar",
            value: loading ? "..." : items.length.toString(),
            sub: "AI Verified badge",
            Icon: IconShield,
            color: "text-yellow-400",
            bg: "from-yellow-900/20 to-amber-900/10",
            border: "border-yellow-500/20",
          },
          {
            label: "Eng yuqori SQB ball",
            value: loading ? "..." : (items[0]?.sqb_score?.toString() ?? "—"),
            sub: "Top pitch",
            Icon: IconGrowth,
            color: "text-sky-400",
            bg: "from-sky-900/20 to-blue-900/10",
            border: "border-sky-500/20",
          },
          {
            label: "Aktiv Pitchlar",
            value: loading ? "..." : items.length.toString(),
            sub: "Angel Discovery Feed",
            Icon: IconFeed,
            color: "text-yellow-400",
            bg: "from-yellow-900/15 to-transparent",
            border: "border-yellow-500/15",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.08 * (i + 1) }}
            className="p-5"
            style={{ background: "var(--ff-card)", border: "1px solid var(--ff-accent-border)", borderRadius: 16 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ff-text-muted)" }}>{stat.label}</p>
              <stat.Icon />
            </div>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--ff-text-muted)" }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Link href="/dashboard/angel">
            <div className="rounded-2xl p-5 group" style={{ background: "var(--ff-accent-bg)", border: "1px solid var(--ff-accent-border)", transition: "border-color 0.2s" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center mb-3">
                    <IconFeed />
                  </div>
                  <h3 className="font-bold text-white text-sm">Venchur Lenta</h3>
                  <p className="text-xs text-slate-400 mt-1">90-sekundlik video pitchlar oqimi</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.37 }}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Link href="/dashboard/deals">
            <div className="rounded-2xl p-5 group transition-colors" style={{ background: "var(--ff-card)", border: "1px solid var(--ff-accent-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--ff-accent-bg)" }}>
                    <IconShield />
                  </div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--ff-text)" }}>Tasdiqlangan Bitimlar</h3>
                  <p className="text-xs mt-1" style={{ color: "var(--ff-text-muted)" }}>AI Verified moliyaviy pasportlar</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Top pitches */}
      {topItems.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-sm">Top AI Verified Pitchlar</h2>
            <Link href="/dashboard/angel" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              Hammasi →
            </Link>
          </div>
          <div className="space-y-2">
            {topItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.42 + i * 0.07 }}
                className="rounded-xl px-4 py-3 hover:border-yellow-500/25 transition-colors flex items-center justify-between"
                style={{ background: "var(--ff-card)", border: "1px solid var(--ff-accent-border)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-700 to-amber-600 flex items-center justify-center text-xs font-black text-white">
                    {item.sqb_score}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--ff-text)" }}>{item.pitch_title || item.business_name}</p>
                    <p className="text-xs" style={{ color: "var(--ff-text-muted)" }}>
                      {SECTOR_LABELS[item.sector] || item.sector} · {REGION_LABELS[item.region] || item.region}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-yellow-400">{fmtUZS(item.annual_revenue || 0)}</p>
                  <p className="text-[10px] text-slate-500">yillik daromad</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!loading && items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 0.3 }}
          className="rounded-2xl p-10 text-center border border-dashed border-yellow-900/40 bg-yellow-900/5"
        >
          <p className="text-3xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-10 h-10 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </p>
          <p className="text-sm font-semibold text-white mb-1">Hali tasdiqlangan pitchlar yo'q</p>
          <p className="text-xs text-slate-500">AI Verified Badge olgan founderlar pitchlarini bu yerga joylaydi</p>
        </motion.div>
      )}
    </div>
  );
}
