"use client";
import { motion } from "framer-motion";

interface Props {
  verified: boolean;
  score?: number;
  rating?: string;
  size?: "sm" | "lg";
}

export default function AIBadge({ verified, score, rating, size = "sm" }: Props) {
  if (size === "lg") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl ${
          verified
            ? "bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 badge-glow"
            : "bg-gradient-to-br from-slate-800/40 to-slate-700/20 border border-slate-600/30"
        }`}
      >
        <motion.div
          animate={verified ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl"
        >
          {verified ? "✅" : "⏳"}
        </motion.div>
        <div className="text-center">
          <p className={`text-lg font-bold ${verified ? "text-emerald-400" : "text-slate-400"}`}>
            {verified ? "AI Verified Badge" : "Badge Tasdiqlanmagan"}
          </p>
          {score !== undefined && (
            <p className="text-sm text-slate-400 mt-1">SQB Ball: {score}/100</p>
          )}
          {rating && (
            <p className={`text-xs font-semibold mt-1 ${verified ? "text-emerald-300" : "text-slate-500"}`}>
              {rating}
            </p>
          )}
        </div>
        {verified && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border border-emerald-400/20 pointer-events-none"
          />
        )}
      </motion.div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        verified
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
      }`}
    >
      {verified ? "✓" : "○"} {verified ? "AI Verified" : "Unverified"}
    </span>
  );
}
