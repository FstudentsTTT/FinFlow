"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import {
  adminUsers, adminStats, adminToggleUser, adminUpdateTax,
  adminSaveGemini, adminGetGemini
} from "@/lib/api";
import { fmtDate, TAX_STATUS_COLORS } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users, Settings, Key, Shield, BarChart3, CheckCircle, XCircle, RefreshCw, Cpu, Link2 } from "lucide-react";
import Link from "next/link";

const TAB = ["Statistika", "Foydalanuvchilar", "AI Model"] as const;
type Tab = typeof TAB[number];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Statistika");
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [geminiStatus, setGeminiStatus] = useState<any>(null);
  const [testingConn, setTestingConn] = useState(false);
  const [connMsg, setConnMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [taxEditId, setTaxEditId] = useState<number | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    if (!u.is_admin) { router.replace("/dashboard/founder"); return; }
    loadAll();
  }, [router]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [us, st, gm] = await Promise.all([adminUsers(), adminStats(), adminGetGemini()]);
      setUsers(us.data.data || []);
      setStats(st.data.data);
      setGeminiStatus(gm.data);
    } catch {} finally { setLoading(false); }
  };

  const toggleUser = async (id: number) => {
    await adminToggleUser(id);
    setUsers(p => p.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  const updateTax = async (id: number, status: string) => {
    await adminUpdateTax(id, status);
    setUsers(p => p.map(u => u.id === id ? { ...u, tax_status: status } : u));
    setTaxEditId(null);
  };

  const testConnection = async () => {
    setTestingConn(true);
    setConnMsg("");
    try {
      const r = await adminSaveGemini();
      setConnMsg(`✓ ${r.data.message}`);
      const gm = await adminGetGemini();
      setGeminiStatus(gm.data);
    } catch (err: any) {
      setConnMsg(`✗ ${err.response?.data?.detail || "Ulanish xatosi"}`);
    } finally { setTestingConn(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#060a12] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060a12] p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-amber-400" />
              <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            </div>
            <p className="text-sm text-slate-400">FinFlow AI tizim boshqaruvi</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadAll} className="p-2 text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={14} />
            </button>
            <Link href="/dashboard/founder">
              <button className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg border border-white/10 transition-colors">
                ← Dashboard
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 rounded-xl p-1 mb-6 w-fit border border-slate-800/60">
          {TAB.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-amber-600/20 text-amber-400 border border-amber-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Stats */}
          {tab === "Statistika" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { l: "Foydalanuvchilar", v: stats?.total_users, icon: Users, color: "text-blue-400" },
                  { l: "Auditlar", v: stats?.total_audits, icon: BarChart3, color: "text-indigo-400" },
                  { l: "Feed elementlari", v: stats?.feed_items, icon: BarChart3, color: "text-purple-400" },
                  { l: "Badge egalar", v: stats?.badge_holders, icon: Shield, color: "text-emerald-400" },
                  { l: "AI Model", v: "DeepSeek R1", icon: Cpu, color: "text-emerald-400" },
                ].map((s, i) => (
                  <motion.div
                    key={s.l}
                    initial={{ opacity: 0, y: 18, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22, delay: i * 0.06 }}
                    whileHover={{ y: -5, scale: 1.02, boxShadow: "0 16px 40px rgba(0,0,0,0.3)", transition: { type: "spring", stiffness: 350, damping: 26 } }}
                    whileTap={{ scale: 0.97 }}
                    style={{ willChange: "transform" }}
                    className="glass rounded-2xl p-4 border border-slate-800/40"
                  >
                    <s.icon size={16} className={`${s.color} mb-2`} />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className={`text-2xl font-black ${s.color}`}
                    >{s.v}</motion.p>
                    <p className="text-xs text-slate-500 mt-1">{s.l}</p>
                  </motion.div>
                ))}
              </div>

              {/* AI Model status card */}
              <div className="glass rounded-2xl p-5 border border-emerald-500/20 bg-emerald-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={14} className="text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Mahalliy AI Model Holati</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={11} /> LM Studio orqali mahalliy model ulangan
                  </p>
                  <p className="text-xs text-slate-400">Model: <span className="text-slate-300">{geminiStatus?.model || "deepseek/deepseek-r1-0528-qwen3-8b"}</span></p>
                  <p className="text-xs text-slate-400">URL: <span className="text-slate-300 text-[10px]">{geminiStatus?.masked_key || "ngrok orqali ulangan"}</span></p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {tab === "Foydalanuvchilar" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-xs text-slate-500">{users.length} ta foydalanuvchi</p>
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 22, delay: i * 0.05 }}
                  whileHover={{ x: 3, transition: { type: "spring", stiffness: 500, damping: 30 } }}
                  className="glass rounded-xl px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                        u.is_admin ? "bg-amber-600/20 text-amber-400" : "bg-blue-600/20 text-blue-400"
                      }`}>
                        {u.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-white">{u.full_name}</p>
                          {u.is_admin && <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded">Admin</span>}
                          {u.badge_verified && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded">✓ Badge</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${TAX_STATUS_COLORS[u.tax_status] || "bg-slate-700 text-slate-400"}`}>
                            {u.tax_status}
                          </span>
                          {u.last_sqb_score !== null && (
                            <span className="text-[10px] text-slate-500">SQB: {u.last_sqb_score}</span>
                          )}
                          {u.business_name && (
                            <span className="text-[10px] text-slate-500 truncate max-w-32">{u.business_name}</span>
                          )}
                          <span className="text-[10px] text-slate-600">{fmtDate(u.created_at)}</span>
                        </div>

                        {/* Tax status edit */}
                        {taxEditId === u.id && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {["VERIFIED","PENDING","UNVERIFIED","FLAGGED"].map(s => (
                              <button
                                key={s}
                                onClick={() => updateTax(u.id, s)}
                                className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                                  u.tax_status === s
                                    ? "bg-blue-600/20 border-blue-600/30 text-blue-400"
                                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                            <button
                              onClick={() => setTaxEditId(null)}
                              className="text-[10px] px-2 py-1 rounded-lg border border-slate-700 text-slate-500"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setTaxEditId(taxEditId === u.id ? null : u.id)}
                        className="text-[10px] px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                      >
                        Soliq
                      </button>
                      {!u.is_admin && (
                        <button
                          onClick={() => toggleUser(u.id)}
                          className={`text-[10px] px-2 py-1.5 rounded-lg transition-colors ${
                            u.is_active
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {u.is_active ? "O'chirish" : "Yoqish"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* AI Model */}
          {tab === "AI Model" && (
            <motion.div key="aimodel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg space-y-4">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={14} className="text-indigo-400" />
                  <h2 className="font-bold text-white text-sm">Mahalliy AI Model</h2>
                </div>

                {/* Model info */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                    <span className="text-xs text-slate-400">Model nomi</span>
                    <span className="text-xs text-slate-200 font-mono">{geminiStatus?.model || "deepseek/deepseek-r1-0528-qwen3-8b"}</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-slate-800/60 gap-4">
                    <span className="text-xs text-slate-400 shrink-0">Base URL</span>
                    <span className="text-[10px] text-slate-300 font-mono text-right break-all">
                      {geminiStatus?.masked_key || "https://seventh-ecologist-motivate.ngrok-free.dev/v1"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                    <span className="text-xs text-slate-400">Provider</span>
                    <span className="text-xs text-slate-200">LM Studio + ngrok</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-400">API format</span>
                    <span className="text-xs text-emerald-400">OpenAI-compatible</span>
                  </div>
                </div>

                <Button
                  onClick={testConnection}
                  loading={testingConn}
                  className="w-full justify-center"
                >
                  <Link2 size={13} className="mr-1.5" /> Ulanishni Tekshirish
                </Button>

                {connMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs mt-3 ${connMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {connMsg}
                  </motion.p>
                )}
              </div>

              <div className="glass rounded-2xl p-5 border border-slate-700/40">
                <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-emerald-400" /> Sozlash talablari
                </h3>
                <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                  <li>LM Studio ilovasini ishga tushiring</li>
                  <li><span className="text-slate-300">deepseek/deepseek-r1-0528-qwen3-8b</span> modelini yuklang</li>
                  <li>LM Studio serverini port <span className="text-slate-300">1234</span> da yoqing</li>
                  <li>Ngrok tunnel: <span className="font-mono text-slate-300">ngrok http 1234</span></li>
                  <li>Ngrok URL ni <span className="text-slate-300">gemini_service.py</span> dagi <span className="font-mono text-slate-300">AI_BASE_URL</span> o'zgaruvchisiga kiriting</li>
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
