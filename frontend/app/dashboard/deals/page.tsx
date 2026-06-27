"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { feedGet } from "@/lib/api";
import { fmtUZS, fmtDate, RATING_COLORS, SECTOR_LABELS, REGION_LABELS } from "@/lib/utils";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 240, damping: 22 };

function IconVerified() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

export default function DealsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    feedGet(0, 100).then(r => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(it =>
    !search ||
    it.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    it.pitch_title?.toLowerCase().includes(search.toLowerCase()) ||
    (SECTOR_LABELS[it.sector] || it.sector || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 min-h-screen bg-[#060a12]">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Tasdiqlangan Bitimlar</h1>
        <p className="text-sm text-slate-400 mt-1">AI Verified — shifrlangan moliyaviy pasportlar</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
        <input
          type="text"
          placeholder="Biznes nomi yoki soha bo'yicha qidiring..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-800/60 focus:border-yellow-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors"
        />
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 text-sm">
          {search ? "Qidiruv natijasi topilmadi" : "Hali tasdiqlangan bitimlar yo'q"}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item, i) => {
          const advisory = (() => {
            try { return item?.advisory ? (typeof item.advisory === "string" ? JSON.parse(item.advisory) : item.advisory) : null; }
            catch { return null; }
          })();

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.05 }}
              className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800/40 hover:border-yellow-500/25 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-700/60 to-amber-600/40 border border-yellow-600/20 flex items-center justify-center text-sm font-black text-yellow-300 flex-shrink-0">
                    {item.sqb_score}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-white text-sm truncate">{item.pitch_title || item.business_name}</p>
                      <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[9px] text-yellow-400">
                        <IconVerified />
                        AI Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {item.business_name} · {SECTOR_LABELS[item.sector] || item.sector} · {REGION_LABELS[item.region] || item.region}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-yellow-400">{fmtUZS(item.annual_revenue || 0)}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{fmtDate(item.created_at)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { l: "DSCR", v: item.dscr_display || "N/A", c: "text-sky-400" },
                  { l: "SQB Reyting", v: item.sqb_rating || "—", c: RATING_COLORS[item.sqb_rating] || "text-slate-400" },
                  { l: "Soliq tejam", v: fmtUZS(item.total_tax_savings || 0), c: "text-emerald-400" },
                ].map(m => (
                  <div key={m.l} className="bg-slate-950/50 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] text-slate-500 mb-1">{m.l}</p>
                    <p className={`text-xs font-bold ${m.c}`}>{m.v}</p>
                  </div>
                ))}
              </div>

              {advisory?.investor_positioning_statement?.qisqa_taqdimot && (
                <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-2 border-t border-slate-800/40 pt-3">
                  {advisory.investor_positioning_statement.qisqa_taqdimot}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <Link href="/dashboard/angel">
                  <button className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 text-xs rounded-lg transition-colors font-medium">
                    Pitchni ko'rish
                  </button>
                </Link>
                <Link href="/dashboard/deal-rooms">
                  <button className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-xs rounded-lg transition-colors">
                    Muloqot xonasi
                  </button>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
