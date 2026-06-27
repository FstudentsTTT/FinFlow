"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auditHistory, auditGet, feedPublish, uploadVideo } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fmtUZS, fmtDate, RATING_COLORS } from "@/lib/utils";
import { ChevronDown, ChevronUp, Upload, Globe } from "lucide-react";

export default function HistoryPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [publishForm, setPublishForm] = useState<{ title: string; file?: File }>({ title: "" });
  const [uploadStatus, setUploadStatus] = useState<Record<number, string>>({});

  useEffect(() => {
    auditHistory().then(r => setAudits(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const toggle = async (id: number) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!detail[id]) {
      const r = await auditGet(id);
      setDetail(p => ({ ...p, [id]: r.data.data }));
    }
  };

  const startPublish = (id: number, title: string) => {
    setPublishingId(id);
    setPublishForm({ title });
  };

  const doPublish = async (auditId: number) => {
    try {
      if (publishForm.file) {
        setUploadStatus(p => ({ ...p, [auditId]: "Video yuklanmoqda..." }));
        const fd = new FormData();
        fd.append("file", publishForm.file);
        fd.append("audit_log_id", String(auditId));
        fd.append("pitch_title", publishForm.title);
        await uploadVideo(fd);
        setUploadStatus(p => ({ ...p, [auditId]: "Video yuklandi ✓" }));
      }
      await feedPublish({ audit_log_id: auditId, pitch_title: publishForm.title });
      const r = await auditHistory();
      setAudits(r.data.data || []);
      setPublishingId(null);
      setUploadStatus(p => ({ ...p, [auditId]: "✓ Feed'da e'lon qilindi!" }));
    } catch (err: any) {
      setUploadStatus(p => ({ ...p, [auditId]: `Xatolik: ${err.response?.data?.detail || err.message}` }));
    }
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white mb-1">Audit Tarixi</h1>
        <p className="text-sm text-slate-400">{audits.length} ta audit topildi</p>
      </motion.div>

      {audits.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm text-slate-400">Hali audit bajarilmagan</p>
        </Card>
      )}

      {audits.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="glass rounded-2xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggle(a.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                  a.badge_eligible ? "bg-emerald-600/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                }`}>
                  {a.sqb_score}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{a.business_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500">{fmtDate(a.created_at)}</p>
                    {a.badge_eligible && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded">✓ Badge</span>
                    )}
                    {a.published_to_feed && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/15 text-blue-400 rounded flex items-center gap-1">
                        <Globe size={9} /> E'lon qilingan
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold ${RATING_COLORS[a.sqb_rating] || "text-slate-400"}`}>
                  {a.sqb_rating}
                </span>
                {expanded === a.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
              </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
              {expanded === a.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-slate-800/40 pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-900/60 rounded-xl p-3">
                        <p className="text-[10px] text-slate-500 mb-1">DSCR</p>
                        <p className="text-sm font-bold text-white">{a.dscr_display || "N/A"}</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-3">
                        <p className="text-[10px] text-slate-500 mb-1">Yillik daromad</p>
                        <p className="text-xs font-bold text-white">{fmtUZS(a.annual_revenue || 0)}</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-3">
                        <p className="text-[10px] text-slate-500 mb-1">IT tejami</p>
                        <p className="text-xs font-bold text-blue-400">{fmtUZS(a.total_tax_savings || 0)}</p>
                      </div>
                    </div>

                    {/* Publish to feed */}
                    {a.badge_eligible && !a.published_to_feed && (
                      <div className="border border-dashed border-emerald-500/30 rounded-xl p-4">
                        <p className="text-xs font-semibold text-emerald-400 mb-3">Angel Discovery Feed'ga e'lon qilish</p>
                        {publishingId === a.id ? (
                          <div className="space-y-3">
                            <input
                              value={publishForm.title}
                              onChange={e => setPublishForm(p => ({ ...p, title: e.target.value }))}
                              placeholder="Pitch sarlavhasi..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 transition-colors"
                            />
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400 cursor-pointer hover:border-slate-600 transition-colors">
                                <Upload size={12} />
                                {publishForm.file ? publishForm.file.name : "Video yuklash (ixtiyoriy)"}
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm"
                                  className="hidden"
                                  onChange={e => setPublishForm(p => ({ ...p, file: e.target.files?.[0] }))}
                                />
                              </label>
                              <Button onClick={() => doPublish(a.id)} className="flex-1 justify-center text-xs py-2">
                                E'lon qilish
                              </Button>
                              <Button variant="ghost" onClick={() => setPublishingId(null)} className="text-xs py-2">
                                Bekor
                              </Button>
                            </div>
                            {uploadStatus[a.id] && (
                              <p className="text-xs text-slate-400">{uploadStatus[a.id]}</p>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={() => startPublish(a.id, a.business_name || "")}
                            className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Globe size={12} className="mr-1.5" /> Feed'ga chiqarish
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
