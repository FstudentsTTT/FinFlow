"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { feedGet } from "@/lib/api";
import { fmtUZS, fmtDate, SECTOR_LABELS, REGION_LABELS, RATING_COLORS } from "@/lib/utils";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 240, damping: 22 };
const WATCHLIST_KEY = "ff_watchlist";

function IconBookmark({ filled }: { filled: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "#e0a96d" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}

function getWatchlist(): number[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]"); } catch { return []; }
}

function toggleWatchlist(id: number): boolean {
  const list = getWatchlist();
  const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  return next.includes(id);
}

export default function WatchlistPage() {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWatchlist(getWatchlist());
    feedGet(0, 100).then(r => setAllItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saved = allItems.filter(it => watchlist.includes(it.id));
  const others = allItems.filter(it => !watchlist.includes(it.id));

  const toggle = (id: number) => {
    toggleWatchlist(id);
    setWatchlist(getWatchlist());
  };

  return (
    <div className="p-6 space-y-5 min-h-screen bg-[#060a12]">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Mening Portfelim</h1>
        <p className="text-sm text-slate-400 mt-1">Kuzatib borayotgan loyihalarim · {saved.length} ta saqlangan</p>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && saved.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 rounded-2xl border border-dashed border-yellow-900/30 bg-yellow-900/5"
        >
          <div className="flex justify-center mb-3">
            <IconBookmark filled={false} />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Hali saqlangan loyiha yo'q</p>
          <p className="text-xs text-slate-500 mb-4">Venchur Lentadan loyihalarni saqlang</p>
          <Link href="/dashboard/angel">
            <button className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-500/20 transition-colors">
              Venchur Lentaga o'tish
            </button>
          </Link>
        </motion.div>
      )}

      {saved.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/60 mb-3">Saqlangan</p>
          <div className="space-y-2">
            {saved.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: i * 0.05 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-yellow-900/10 border border-yellow-500/20 hover:border-yellow-500/35 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-700/60 to-amber-600/40 flex items-center justify-center text-xs font-black text-yellow-300 flex-shrink-0">
                    {item.sqb_score}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.pitch_title || item.business_name}</p>
                    <p className="text-[10px] text-slate-500">{SECTOR_LABELS[item.sector] || item.sector} · {fmtDate(item.created_at)}</p>
                  </div>
                </div>
                <button onClick={() => toggle(item.id)} className="ml-3 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                  <IconBookmark filled={true} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Boshqa pitchlar</p>
          <div className="space-y-2">
            {others.slice(0, 10).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.1 + i * 0.04 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800/40 hover:border-slate-700/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                    {item.sqb_score}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-300 truncate">{item.pitch_title || item.business_name}</p>
                    <p className="text-[10px] text-slate-600">{SECTOR_LABELS[item.sector] || item.sector} · {fmtDate(item.created_at)}</p>
                  </div>
                </div>
                <button onClick={() => toggle(item.id)} className="ml-3 flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity">
                  <IconBookmark filled={false} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
