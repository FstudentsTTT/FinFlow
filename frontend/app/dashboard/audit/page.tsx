"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auditAdvisory, auditCalculate, extractFinancialDocument } from "@/lib/api";
import { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { fmtUZS, RATING_COLORS } from "@/lib/utils";
import {
  ChevronRight, Sparkles, AlertTriangle, CheckCircle,
  Upload, FileText, X, Plus, Minus, PenLine, Bot,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const SECTORS = [
  ["technology","IT / Texnologiya"],["retail","Savdo"],["manufacturing","Ishlab chiqarish"],
  ["agriculture","Qishloq xo'jaligi"],["services","Xizmat ko'rsatish"],["food_beverage","Oziq-ovqat"],
  ["construction","Qurilish"],["education","Ta'lim"],["healthcare","Sog'liqni saqlash"],
];
const REGIONS = [
  ["tashkent_city","Toshkent shahri"],["tashkent_region","Toshkent viloyati"],["samarkand","Samarqand"],
  ["bukhara","Buxoro"],["fergana","Farg'ona"],["namangan","Namangan"],["andijan","Andijon"],
  ["sirdaryo","Sirdaryo"],["navoi","Navoiy"],["jizzakh","Jizzax"],["kashkadarya","Qashqadaryo"],
  ["surkhandarya","Surxondaryo"],["khorezm","Xorazm"],["karakalpakstan","Qoraqalpog'iston"],
];
const STEPS = ["Biznes ma'lumotlari", "Moliyaviy ko'rsatkichlar", "Natijalar"];
const MONTH_LABELS = [
  "1-oy","2-oy","3-oy","4-oy","5-oy","6-oy",
  "7-oy","8-oy","9-oy","10-oy","11-oy","12-oy",
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtInput = (v: string): string => {
  const n = v.replace(/\D/g, "");
  if (!n) return "";
  return Number(n).toLocaleString("ru-RU");
};
const parseInput = (v: string): string => v.replace(/\D/g, "");

// ── MoneyInput component ───────────────────────────────────────────────────────
function MoneyInput({
  label, value, onChange, placeholder, required, hint, className = "",
}: {
  label: string;
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-slate-400 font-medium">
        {label}{required && <span className="text-blue-400 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={fmtInput(value)}
        onChange={e => onChange(parseInput(e.target.value))}
        placeholder={placeholder || "0"}
        className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
      />
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ── TextInput component ────────────────────────────────────────────────────────
function TextInput({
  label, value, onChange, placeholder, type = "text", required, hint, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; hint?: string; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-slate-400 font-medium">
        {label}{required && <span className="text-blue-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
      />
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AuditPage() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [extractFeedback, setExtractFeedback] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Business form
  const [bizForm, setBizForm] = useState({
    business_name: "", sector: "technology", region: "tashkent_city", tuman: "",
    employee_count: "5", years_in_operation: "2",
    is_registered_llc: true, has_it_component: false, it_revenue_percentage: "0",
  });

  // Financial form (raw numbers as strings)
  const [finForm, setFinForm] = useState({
    annual_revenue: "",
    annual_operating_expenses: "",
    gross_monthly_payroll: "",
    annual_debt_principal: "0",
    annual_debt_interest: "0",
    total_assets: "0",
    total_liabilities: "0",
  });

  // Monthly revenue trend as array (min 3)
  const [trendMonths, setTrendMonths] = useState<string[]>(["", "", ""]);

  const bf = (k: string) => (e: React.ChangeEvent<any>) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setBizForm(p => ({ ...p, [k]: val }));
  };
  const ff = (k: string) => (raw: string) => setFinForm(p => ({ ...p, [k]: raw }));

  const addTrendMonth = () => {
    if (trendMonths.length < 12) setTrendMonths(p => [...p, ""]);
  };
  const removeTrendMonth = (i: number) => {
    if (trendMonths.length <= 3) return;
    setTrendMonths(p => p.filter((_, idx) => idx !== i));
  };
  const updateTrendMonth = (i: number, raw: string) => {
    setTrendMonths(p => p.map((v, idx) => idx === i ? raw : v));
  };

  const buildPayload = () => ({
    business_name: bizForm.business_name,
    sector: bizForm.sector,
    region: bizForm.region,
    tuman: bizForm.tuman,
    employee_count: parseInt(bizForm.employee_count) || 1,
    years_in_operation: parseInt(bizForm.years_in_operation) || 0,
    is_registered_llc: bizForm.is_registered_llc,
    has_it_component: bizForm.has_it_component,
    it_revenue_percentage: parseFloat(bizForm.it_revenue_percentage) || 0,
    annual_revenue: parseFloat(finForm.annual_revenue) || 0,
    annual_operating_expenses: parseFloat(finForm.annual_operating_expenses) || 0,
    gross_monthly_payroll: parseFloat(finForm.gross_monthly_payroll) || 0,
    annual_debt_principal: parseFloat(finForm.annual_debt_principal) || 0,
    annual_debt_interest: parseFloat(finForm.annual_debt_interest) || 0,
    total_assets: parseFloat(finForm.total_assets) || 0,
    total_liabilities: parseFloat(finForm.total_liabilities) || 0,
    monthly_revenue_trend: trendMonths
      .map(v => parseFloat(v) || 0)
      .filter(v => v > 0),
  });

  const validateFinancials = (): string | null => {
    if (!finForm.annual_revenue || finForm.annual_revenue === "0")
      return "Yillik daromadni kiriting";
    if (!finForm.annual_operating_expenses || finForm.annual_operating_expenses === "0")
      return "Yillik operatsion xarajatlarni kiriting";
    if (!finForm.gross_monthly_payroll || finForm.gross_monthly_payroll === "0")
      return "Oylik ish haqi fondini kiriting";
    const filled = trendMonths.filter(v => v && parseFloat(v) > 0);
    if (filled.length < 3)
      return "Kamida 3 oylik daromad trendini kiriting";
    return null;
  };

  // ── File extraction ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setUploadFile(f);
    setExtractFeedback([]);
    setError("");
  };

  const handleExtract = async () => {
    if (!uploadFile) return;
    setExtracting(true);
    setError("");
    setExtractFeedback([]);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      const res = await extractFinancialDocument(fd);
      const d = res.data.data;
      const fb: string[] = res.data.feedback || [];

      // Fill financial form
      const newFin = { ...finForm };
      if (d.annual_revenue) newFin.annual_revenue = String(d.annual_revenue);
      if (d.annual_operating_expenses) newFin.annual_operating_expenses = String(d.annual_operating_expenses);
      if (d.gross_monthly_payroll) newFin.gross_monthly_payroll = String(d.gross_monthly_payroll);
      if (d.annual_debt_principal) newFin.annual_debt_principal = String(d.annual_debt_principal);
      if (d.annual_debt_interest) newFin.annual_debt_interest = String(d.annual_debt_interest);
      if (d.total_assets) newFin.total_assets = String(d.total_assets);
      if (d.total_liabilities) newFin.total_liabilities = String(d.total_liabilities);
      setFinForm(newFin);

      // Fill monthly trend
      const monthly: number[] = d.monthly_revenues || [];
      if (monthly.length >= 3) {
        setTrendMonths(monthly.map(String));
      }

      // Fill business name if found
      if (d.business_name) setBizForm(p => ({ ...p, business_name: d.business_name }));

      setExtractFeedback(fb);
      setMode("manual"); // Switch to manual to show filled form
    } catch (err: any) {
      setError(err.response?.data?.detail || "Hujjatdan ma'lumot ajratib bo'lmadi");
    } finally {
      setExtracting(false);
    }
  };

  // ── Main calculate ──
  const calculate = async () => {
    const valErr = validateFinancials();
    if (valErr) { setError(valErr); return; }

    setLoading(true);
    setError("");
    try {
      const res = await auditAdvisory(buildPayload());
      setResult(res.data.data);
      setStep(2);
    } catch (err: any) {
      // AI muvaffaqiyatsiz bo'lsa ham hisob natijalarini ko'rsatamiz
      try {
        const res2 = await auditCalculate(buildPayload());
        setResult({ audit_results: res2.data.data, advisory: null, audit_log_id: null });
        setStep(2);
        setError("⚠️ FinFlow AI maslahat bera olmadi — faqat hisob natijalari ko'rsatilmoqda.");
      } catch (e2: any) {
        setError(e2.response?.data?.detail || "Xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  const audit = result?.audit_results || result;
  const advisory = result?.advisory;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white mb-1">AI Moliyaviy Audit</h1>
        <p className="text-sm text-slate-400">Biznes ma'lumotlarini kiriting — FinFlow AI tahlil qiladi</p>
      </motion.div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mt-6 mb-6 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              i === step ? "bg-blue-600/20 text-blue-400 border border-blue-600/20" :
              i < step ? "bg-emerald-600/15 text-emerald-400" :
              "text-slate-600"
            }`}>
              {i < step ? <CheckCircle size={12} /> : <span className="text-[10px]">{i+1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-slate-700" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 0: Business info ── */}
        {step === 0 && (
          <motion.div key="s0" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
            <Card>
              <h2 className="font-bold text-white text-sm mb-4">Biznes ma'lumotlari</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <TextInput label="Biznes nomi" placeholder="Kompaniya MChJ" value={bizForm.business_name} onChange={v => setBizForm(p=>({...p, business_name:v}))} required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Soha</label>
                  <Select value={bizForm.sector} onChange={bf("sector")}>
                    {SECTORS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Hudud</label>
                  <Select value={bizForm.region} onChange={bf("region")}>
                    {REGIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </Select>
                </div>
                <TextInput label="Tuman (ixtiyoriy)" placeholder="Yunusobod tumani" value={bizForm.tuman} onChange={v=>setBizForm(p=>({...p,tuman:v}))} />
                <TextInput label="Xodimlar soni" type="number" placeholder="10" value={bizForm.employee_count} onChange={v=>setBizForm(p=>({...p,employee_count:v}))} />
                <div className="col-span-2">
                  <TextInput label="Faoliyat yillari" type="number" placeholder="3" value={bizForm.years_in_operation} onChange={v=>setBizForm(p=>({...p,years_in_operation:v}))} />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="llc" checked={bizForm.is_registered_llc} onChange={bf("is_registered_llc")} className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="llc" className="text-xs text-slate-300">MChJ sifatida ro'yxatdan o'tgan</label>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="it" checked={bizForm.has_it_component} onChange={bf("has_it_component")} className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="it" className="text-xs text-slate-300">IT komponenti mavjud</label>
                </div>
                {bizForm.has_it_component && (
                  <div className="col-span-2">
                    <TextInput label="IT daromad ulushi (%)" type="number" placeholder="60" value={bizForm.it_revenue_percentage} onChange={v=>setBizForm(p=>({...p,it_revenue_percentage:v}))} />
                  </div>
                )}
              </div>
            </Card>
            <div className="flex justify-end">
              <Button onClick={() => { setError(""); setStep(1); }}>
                Keyingi <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Financials ── */}
        {step === 1 && (
          <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">

            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60 w-fit">
              <button
                onClick={() => { setMode("manual"); setError(""); setExtractFeedback([]); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === "manual"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-600/25"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <PenLine size={13} /> Qo'lda to'ldirish
              </button>
              <button
                onClick={() => { setMode("upload"); setError(""); setExtractFeedback([]); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === "upload"
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/25"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bot size={13} /> Hujjat + FinFlow AI
              </button>
            </div>

            {/* ── Upload mode ── */}
            <AnimatePresence>
              {mode === "upload" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Card className="border-indigo-500/20 bg-indigo-900/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot size={14} className="text-indigo-400" />
                      <h3 className="text-sm font-bold text-white">FinFlow AI — Hujjatdan ajratish</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Moliyaviy hisobot, balans, daromad-xarajat jadvalingizni yuklang.
                      FinFlow AI kerakli ma'lumotlarni avtomatik ajratib, formni to'ldiradi.
                    </p>

                    {/* Drop zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        uploadFile
                          ? "border-indigo-500/40 bg-indigo-900/20"
                          : "border-slate-700 hover:border-indigo-500/40 hover:bg-indigo-900/10"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.xlsx,.xls,.csv,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {uploadFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText size={16} className="text-indigo-400" />
                          <span className="text-sm text-indigo-300 font-medium">{uploadFile.name}</span>
                          <button
                            onClick={e => { e.stopPropagation(); setUploadFile(null); setExtractFeedback([]); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload size={20} className="text-slate-500 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">PDF, Excel (.xlsx), CSV, TXT</p>
                          <p className="text-[10px] text-slate-600 mt-1">bosing yoki fayl sudrab tashlang</p>
                        </div>
                      )}
                    </div>

                    {extractFeedback.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {extractFeedback.map((msg, i) => (
                          <div key={i} className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                            <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-300">{msg}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={handleExtract}
                      loading={extracting}
                      disabled={!uploadFile}
                      className="w-full justify-center mt-3"
                    >
                      <Bot size={13} className="mr-1.5" />
                      {extracting ? "FinFlow AI tahlil qilyapti..." : "FinFlow AI bilan ajratish"}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Financial form (always shown) ── */}
            <Card>
              <h2 className="font-bold text-white text-sm mb-4">
                Moliyaviy ko'rsatkichlar
                {mode === "upload" && extractFeedback.length > 0 && (
                  <span className="ml-2 text-[10px] text-amber-400 font-normal">— Bo'sh maydonlarni qo'lda to'ldiring</span>
                )}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <MoneyInput
                  className="col-span-2"
                  label="Yillik daromad (so'm)"
                  value={finForm.annual_revenue}
                  onChange={ff("annual_revenue")}
                  placeholder="500 000 000"
                  required
                />
                <MoneyInput
                  className="col-span-2"
                  label="Yillik operatsion xarajatlar (so'm)"
                  value={finForm.annual_operating_expenses}
                  onChange={ff("annual_operating_expenses")}
                  placeholder="300 000 000"
                  required
                />
                <MoneyInput
                  className="col-span-2"
                  label="Oylik ish haqi fondi (so'm)"
                  value={finForm.gross_monthly_payroll}
                  onChange={ff("gross_monthly_payroll")}
                  placeholder="30 000 000"
                  required
                />
                <MoneyInput
                  label="Yillik qarz asosiy summasi"
                  value={finForm.annual_debt_principal}
                  onChange={ff("annual_debt_principal")}
                  placeholder="0"
                />
                <MoneyInput
                  label="Yillik qarz foizlari"
                  value={finForm.annual_debt_interest}
                  onChange={ff("annual_debt_interest")}
                  placeholder="0"
                />
                <MoneyInput
                  label="Jami aktivlar"
                  value={finForm.total_assets}
                  onChange={ff("total_assets")}
                  placeholder="0"
                />
                <MoneyInput
                  label="Jami majburiyatlar"
                  value={finForm.total_liabilities}
                  onChange={ff("total_liabilities")}
                  placeholder="0"
                />
              </div>

              {/* Monthly revenue trend */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Oylik daromad trendi (so'm)
                      <span className="text-blue-400 ml-0.5">*</span>
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">So'nggi oylar daromadi — kamida 3 oy</p>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-1 rounded-lg">
                    {trendMonths.length} oy
                  </span>
                </div>

                <div className="space-y-2 bg-slate-900/40 rounded-xl p-3 border border-slate-800/60">
                  {trendMonths.map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-medium min-w-[36px] text-right">
                        {MONTH_LABELS[i] || `${i+1}-oy`}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fmtInput(val)}
                        onChange={e => updateTrendMonth(i, parseInput(e.target.value))}
                        placeholder="10 000 000"
                        className="flex-1 bg-slate-900/60 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
                      />
                      {i >= 3 ? (
                        <button
                          onClick={() => removeTrendMonth(i)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                          title="Olib tashlash"
                        >
                          <Minus size={11} />
                        </button>
                      ) : (
                        <div className="w-6 shrink-0" />
                      )}
                    </div>
                  ))}

                  {trendMonths.length < 12 && (
                    <button
                      onClick={addTrendMonth}
                      className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-400 transition-colors mt-1 pl-[44px]"
                    >
                      <Plus size={11} /> Oy qo'shish
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => { setStep(0); setError(""); }}>
                ← Orqaga
              </Button>
              <Button onClick={calculate} loading={loading}>
                <Sparkles size={14} className="mr-1.5" />
                {loading ? "FinFlow AI tahlil qilyapti..." : "Natijalarga o'tish"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Results ── */}
        {step === 2 && audit && (
          <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-4">
            {error && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-400">
                {error}
              </div>
            )}

            {/* SQB Score */}
            <Card className="sqb-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">SQB Qarz Tayyorlik Indeksi</h2>
                <span className={`text-lg font-black ${RATING_COLORS[audit?.sqb_debt_readiness_index?.rating] || "text-slate-400"}`}>
                  {audit?.sqb_debt_readiness_index?.total_score}/100
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${audit?.sqb_debt_readiness_index?.total_score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    (audit?.sqb_debt_readiness_index?.total_score||0)>=70?"bg-emerald-500":
                    (audit?.sqb_debt_readiness_index?.total_score||0)>=55?"bg-blue-500":
                    (audit?.sqb_debt_readiness_index?.total_score||0)>=40?"bg-amber-500":"bg-red-500"
                  }`}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {Object.entries(audit?.sqb_debt_readiness_index?.components || {}).map(([k,v]:any) => (
                  <div key={k} className="text-center bg-slate-900/50 rounded-lg p-2">
                    <p className="text-base font-black text-white">{v}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                      {k==="dscr_score"?"DSCR":k==="revenue_trend_score"?"Trend":k==="tax_compliance_score"?"Soliq":"Garov"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                {audit?.sqb_debt_readiness_index?.badge_eligible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                    ✓ AI Verified Badge olindi!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/40 text-slate-400 rounded-full text-xs border border-slate-600/30">
                    Badge uchun 70+ ball kerak
                  </span>
                )}
              </div>
            </Card>

            {/* DSCR + IT Park */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <p className="text-xs text-slate-400 font-semibold uppercase mb-3">DSCR Tahlili</p>
                <p className="text-3xl font-black text-white">{audit?.dscr_analysis?.dscr_display}</p>
                <p className={`text-sm font-semibold mt-1 ${RATING_COLORS[audit?.dscr_analysis?.sqb_rating]||"text-slate-400"}`}>
                  {audit?.dscr_analysis?.sqb_rating}
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>NOI</span>
                    <span className="text-white">{fmtUZS(audit?.dscr_analysis?.net_operating_income||0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TDS</span>
                    <span className="text-white">{fmtUZS(audit?.dscr_analysis?.total_debt_service||0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SQB eligible</span>
                    <span className={audit?.dscr_analysis?.sqb_eligible?"text-emerald-400":"text-red-400"}>
                      {audit?.dscr_analysis?.sqb_eligible?"HA":"YO'Q"}
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <p className="text-xs text-slate-400 font-semibold uppercase mb-3">IT Park Tejami</p>
                <p className="text-2xl font-black text-blue-400">
                  {fmtUZS(audit?.it_park_optimization?.total_annual_savings||0)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">yillik potensial tejam</p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>IT Park muvofiqlik</span>
                    <span className={audit?.it_park_optimization?.is_eligible?"text-emerald-400":"text-red-400"}>
                      {audit?.it_park_optimization?.is_eligible?"HA":"YO'Q"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IT daromad</span>
                    <span className="text-white">{audit?.it_park_optimization?.it_revenue_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ijt. soliq tejam</span>
                    <span className="text-white">{fmtUZS(audit?.it_park_optimization?.annual_social_tax_savings||0)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tax wall */}
            <Card className={audit?.tax_wall_analysis?.alert_triggered ? "border-amber-500/30 bg-amber-900/10" : ""}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className={audit?.tax_wall_analysis?.alert_triggered?"text-amber-400":"text-slate-500"} />
                <p className="text-xs text-slate-400 font-semibold uppercase">1 Milliard UZS Soliq Devori</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Yaqinlik</span>
                <span className={`text-sm font-bold ${audit?.tax_wall_analysis?.alert_triggered?"text-amber-400":"text-emerald-400"}`}>
                  {audit?.tax_wall_analysis?.proximity_percentage?.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(audit?.tax_wall_analysis?.proximity_percentage||0, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    (audit?.tax_wall_analysis?.proximity_percentage||0)>=90?"bg-red-500":
                    (audit?.tax_wall_analysis?.proximity_percentage||0)>=70?"bg-amber-500":"bg-emerald-500"
                  }`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>0%</span><span>70% ⚠️</span><span>90% 🚨</span><span>100%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Qolgan yo'l: <span className="text-white font-medium">{fmtUZS(audit?.tax_wall_analysis?.remaining_runway_uzs||0)}</span>
                {audit?.tax_wall_analysis?.months_to_wall && (
                  <> · Taxminiy <span className="text-white">{audit?.tax_wall_analysis?.months_to_wall} oy</span></>
                )}
              </p>
            </Card>

            {/* FinFlow AI Advisory */}
            {advisory && (
              <Card className="border-indigo-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-indigo-400" />
                  <h2 className="font-bold text-white text-sm">FinFlow AI Tavsiyasi</h2>
                </div>

                {advisory.tax_strategy && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Soliq Strategiyasi</p>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{advisory.tax_strategy.joriy_holat_tahlili}</p>
                    <div className="space-y-2">
                      {advisory.tax_strategy.ustuvor_harakatlar?.map((a: any) => (
                        <div key={a.tartib} className="flex gap-2 bg-slate-900/50 rounded-lg p-3">
                          <span className="text-xs font-black text-blue-400 min-w-[20px]">{a.tartib}.</span>
                          <div>
                            <p className="text-xs text-slate-200">{a.tavsiya}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{a.muddat} · Tejam: {fmtUZS(a.taxminiy_tejam_uzs||0)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {advisory.investor_positioning_statement && (
                  <div className="border-t border-slate-800 pt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Investor Taqdimoti</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{advisory.investor_positioning_statement.qisqa_taqdimot}</p>
                  </div>
                )}
              </Card>
            )}

            <Button
              onClick={() => { setStep(0); setResult(null); setError(""); setExtractFeedback([]); setUploadFile(null); setMode("manual"); }}
              variant="ghost"
              className="w-full justify-center"
            >
              Yangi audit boshlash
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
