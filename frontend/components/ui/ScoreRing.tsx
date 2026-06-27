"use client";
import { motion } from "framer-motion";

interface Props {
  score: number;
  max?: number;
  size?: number;
  label?: string;
}

export default function ScoreRing({ score, max = 100, size = 120, label }: Props) {
  const pct = Math.min(score / max, 1);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  const color =
    pct >= 0.85 ? "#10b981" :
    pct >= 0.70 ? "#3b82f6" :
    pct >= 0.55 ? "#60a5fa" :
    pct >= 0.40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="score-ring -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#1e293b" strokeWidth={8}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: -(size / 2 + 16) }}>
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">/ {max}</span>
      </div>
      {label && <p className="text-xs text-slate-400 text-center mt-1">{label}</p>}
    </div>
  );
}
