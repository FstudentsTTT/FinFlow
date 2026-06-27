"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { feedGet } from "@/lib/api";
import { fmtUZS, fmtDate, RATING_COLORS, SECTOR_LABELS, REGION_LABELS } from "@/lib/utils";
import { TrendingUp, Shield, MapPin, ChevronDown, ChevronUp, Play } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AngelFeedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    feedGet(0, 50).then(r => {
      setItems(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const item = items[active];

  const auditData = (() => {
    try { return item?.audit ? (typeof item.audit === "string" ? JSON.parse(item.audit) : item.audit) : null; }
    catch { return null; }
  })();
  const advisory = (() => {
    try { return item?.advisory ? (typeof item.advisory === "string" ? JSON.parse(item.advisory) : item.advisory) : null; }
    catch { return null; }
  })();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Angel Feed yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-[#060a12]">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-12 h-12 opacity-60">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Hali e'lonlar yo'q</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            AI Verified Badge olgan founderlar o'z pitchlarini bu yerga chiqaradi.
            Badge olish uchun SQB ballingiz 70+ bo'lishi kerak.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0d14]">
      {/* Left: Vertical video feed */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={item?.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Video or placeholder */}
            <div className="flex-1 relative bg-slate-950">
              {item?.video_filename ? (
                <video
                  ref={videoRef}
                  src={`${BASE}/uploads/${item.video_filename}`}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-slate-950">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center"
                  >
                    <Play size={32} className="text-blue-400 ml-2" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-white font-bold">{item?.business_name}</p>
                    <p className="text-slate-400 text-sm mt-1">{item?.pitch_title}</p>
                  </div>
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

              {/* Pitch info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] font-semibold border border-yellow-500/30">
                        ✓ AI Verified
                      </span>
                      <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded-full text-[10px] font-semibold">
                        SQB: {item?.sqb_score}/100
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white leading-tight">{item?.pitch_title || item?.business_name}</h2>
                    <p className="text-sm text-slate-300 mt-1">{item?.business_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={10} />{REGION_LABELS[item?.region] || item?.region}</span>
                      <span>{SECTOR_LABELS[item?.sector] || item?.sector}</span>
                      <span>{fmtDate(item?.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {items.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === active ? "bg-white h-4" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Scroll arrows */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-20 flex flex-col gap-2 z-10">
          {active > 0 && (
            <button onClick={() => setActive(a => a - 1)} className="text-white/50 hover:text-white transition-colors">
              <ChevronUp size={20} />
            </button>
          )}
          {active < items.length - 1 && (
            <button onClick={() => setActive(a => a + 1)} className="text-white/50 hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Dynamic financial audit panel */}
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-96 glass border-l border-slate-800/60 flex flex-col overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-yellow-900/30 bg-[#0f172a]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <h3 className="font-bold text-white text-sm">Moliyaviy Dossier</h3>
          </div>
          <span className="text-xs text-yellow-600">{active + 1}/{items.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
          {/* SQB Score */}
          <motion.div
            key={`sqb-${item?.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-900/20 to-amber-900/10 rounded-2xl p-4 border border-yellow-500/20"
          >
            <p className="text-[10px] text-slate-400 font-semibold uppercase mb-2">SQB Debt-Readiness Index</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-black text-white">{item?.sqb_score}</span>
              <span className="text-slate-500 mb-1">/100</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item?.sqb_score}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${(item?.sqb_score||0)>=70?"bg-yellow-500":(item?.sqb_score||0)>=40?"bg-amber-500":"bg-orange-500"}`}
              />
            </div>
            <p className={`text-xs font-semibold mt-2 ${RATING_COLORS[item?.sqb_rating]||"text-slate-400"}`}>
              {item?.sqb_rating}
            </p>
          </motion.div>

          {/* Key metrics */}
          <motion.div
            key={`metrics-${item?.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { l: "DSCR", v: item?.dscr_display || "N/A", icon: TrendingUp, color: "text-blue-400" },
              { l: "Yillik daromad", v: fmtUZS(item?.annual_revenue||0), icon: TrendingUp, color: "text-emerald-400" },
              { l: "Soliq tejami", v: fmtUZS(item?.total_tax_savings||0), icon: Shield, color: "text-purple-400" },
              { l: "AI Badge", v: item?.badge_eligible?"Tasdiqlangan":"Yo'q", icon: Shield, color: item?.badge_eligible?"text-emerald-400":"text-slate-500" },
            ].map((m) => (
              <div key={m.l} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/40">
                <p className="text-[10px] text-slate-500 mb-1">{m.l}</p>
                <p className={`text-xs font-bold ${m.color}`}>{m.v}</p>
              </div>
            ))}
          </motion.div>

          {/* Audit details if available */}
          {auditData && (
            <motion.div
              key={`audit-${item?.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/40"
            >
              <p className="text-[10px] text-slate-400 font-semibold uppercase mb-3">Moliyaviy Ko'rsatkichlar</p>
              <div className="space-y-2">
                {auditData.tax_wall_analysis && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">1B Devori yaqinligi</span>
                    <span className={auditData.tax_wall_analysis.alert_triggered?"text-amber-400":"text-emerald-400"}>
                      {auditData.tax_wall_analysis.proximity_percentage?.toFixed(1)}%
                    </span>
                  </div>
                )}
                {auditData.it_park_optimization && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">IT Park vakolat</span>
                    <span className={auditData.it_park_optimization.is_eligible?"text-emerald-400":"text-red-400"}>
                      {auditData.it_park_optimization.is_eligible?"HA":"YO'Q"}
                    </span>
                  </div>
                )}
                {auditData.regional_subsidies?.matched_programmes?.length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Subsidiya dasturlari</span>
                    <span className="text-blue-400">{auditData.regional_subsidies.total_matched} ta</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* AI Advisory excerpt */}
          {advisory?.investor_positioning_statement && (
            <motion.div
              key={`advisory-${item?.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-yellow-900/10 rounded-xl p-4 border border-yellow-500/15"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                <p className="text-[10px] text-yellow-500 font-semibold uppercase">AI Investor Taqdimoti</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-5">
                {advisory.investor_positioning_statement.qisqa_taqdimot}
              </p>
            </motion.div>
          )}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-yellow-900/15 to-amber-900/5 rounded-xl p-4 border border-yellow-500/20"
          >
            <p className="text-[10px] text-yellow-500 font-semibold uppercase mb-2">Ta'sischi bilan bog'lanish</p>
            <p className="text-xs text-white font-semibold">{item?.author?.full_name}</p>
            <p className="text-xs text-slate-400">{REGION_LABELS[item?.author?.region] || item?.author?.region}</p>
          </motion.div>
        </div>

        {/* Feed list mini */}
        <div className="border-t border-slate-800/40 p-3">
          <p className="text-[10px] text-slate-500 uppercase mb-2 font-semibold">Barcha pitchlar</p>
          <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setActive(i)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                  i === active ? "bg-yellow-600/15 border border-yellow-600/20" : "hover:bg-white/5"
                }`}
              >
                <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-700 to-amber-600 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0">
                  {it.sqb_score}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-white font-medium truncate">{it.pitch_title || it.business_name}</p>
                  <p className="text-[9px] text-slate-500 truncate">{REGION_LABELS[it.region]||it.region}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
