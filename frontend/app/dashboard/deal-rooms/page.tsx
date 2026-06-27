"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const SPRING = { type: "spring" as const, stiffness: 240, damping: 22 };

function IconRooms() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#e0a96d" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

const FEATURES = [
  "End-to-end shifrlangan xabar almashish",
  "Term Sheet muhokamasi va imzolash",
  "Ta'sischi bilan to'g'ridan-to'g'ri bog'lanish",
  "Moliyaviy hujjatlar xavfsiz almashish",
  "Video qo'ng'iroq va yozishma",
];

export default function DealRoomsPage() {
  return (
    <div className="p-6 min-h-screen bg-[#060a12] flex flex-col">
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Muloqot Xonalari</h1>
        <p className="text-sm text-slate-400 mt-1">Tadbirkorlar bilan xavfsiz muloqot va bitim muhokamasi</p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <IconRooms />
          </div>

          <h2 className="text-xl font-black text-white mb-2">Tez Orada</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Muloqot xonalari tizimi ishlab chiqilmoqda. Bu bo'lim sizga AI Verified ta'sischilar bilan to'g'ridan-to'g'ri, xavfsiz muloqot qilish imkonini beradi.
          </p>

          <div className="rounded-2xl bg-slate-900/60 border border-yellow-500/15 p-5 text-left space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <IconLock />
              <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Rejalashtirilgan imkoniyatlar</p>
            </div>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: 0.2 + i * 0.07 }}
                className="flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-slate-300">{f}</p>
              </motion.div>
            ))}
          </div>

          <Link href="/dashboard/angel">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 text-sm rounded-xl font-semibold transition-colors"
            >
              Venchur Lentaga o'tish
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
