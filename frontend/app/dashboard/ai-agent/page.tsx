"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiAgentChat } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 24 };

const QUICK_PROMPTS = [
  "IT Park imtiyozlaridan foydalanish uchun qanday ariza topshiraman?",
  "SQB anderraytingidan o'tishim uchun DSCR ko'rsatkichimni qanday yaxshilayman?",
  "Sirdaryo viloyatidagi yosh tadbirkorlar uchun qanday subsidiyalar faol?",
  "Aylanmam 1 mlrd UZS ga yaqinlashmoqda, nima qilishim kerak?",
  "5 ta dasturchi ishga olsam oylik xarajatim qancha oshadi?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

function IconAI() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#10b981" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

export default function AIAgentPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await aiAgentChat(msg, history);
      const reply = res.data.reply;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Xatolik yuz berdi. Qayta urinib ko'ring.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#060a12]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-5 border-b border-emerald-900/30 bg-[#0b132b]/80 backdrop-blur-xl flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <IconAI />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm">AI Moliyaviy Maslahatchi</h1>
          <p className="text-[10px] text-emerald-400">CFO Agent · O'zbek tilida</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400">Faol</span>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth-ios scrollbar-hide">

        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
            className="pt-4"
          >
            {/* Welcome */}
            <div className="max-w-2xl mx-auto text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <IconAI />
              </div>
              <h2 className="text-lg font-black text-white mb-2">Salom, {user?.full_name?.split(" ")[0]}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Men sizning shaxsiy AI moliyaviy mashlahatchiingizman. Soliq, kredit, IT Park imtiyozlari va subsidiyalar bo'yicha savollaringizga o'zbek tilida javob beraman.
              </p>
            </div>

            {/* Quick prompts */}
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-semibold">Tayyor savollar</p>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SPRING, delay: 0.15 + i * 0.07 }}
                    onClick={() => send(q)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/30 hover:bg-emerald-900/10 transition-all text-xs text-slate-300 hover:text-white group"
                  >
                    <span className="text-emerald-500 mr-2 opacity-60 group-hover:opacity-100">›</span>
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={SPRING}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} max-w-2xl mx-auto w-full`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mr-2.5 mt-1 flex-shrink-0">
                  <IconAI />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-emerald-600/20 border border-emerald-600/25 text-white rounded-tr-sm"
                    : "bg-slate-900/70 border border-slate-800/60 text-slate-200 rounded-tl-sm"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start max-w-2xl mx-auto w-full"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mr-2.5 mt-1 flex-shrink-0">
              <IconAI />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-900/70 border border-slate-800/60 flex items-center gap-1.5">
              {[0, 1, 2].map(n => (
                <motion.span
                  key={n}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: n * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                />
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-emerald-900/20 bg-[#0b132b]/60 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2 bg-slate-900/80 border border-slate-800/60 focus-within:border-emerald-500/40 rounded-2xl px-4 py-3 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Moliyaviy savolingizni yozing..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 resize-none outline-none scrollbar-hide max-h-32"
              style={{ lineHeight: "1.5" }}
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0 text-white"
            >
              <IconSend />
            </motion.button>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">Enter — yuborish · Shift+Enter — yangi qator</p>
        </div>
      </div>
    </div>
  );
}
