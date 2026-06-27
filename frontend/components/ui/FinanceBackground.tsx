"use client";
import { motion } from "framer-motion";

// Deterministic particle data — no Math.random() to avoid hydration mismatch
type Particle = { x: number; y: number; text: string; dur: number; delay: number; opacity: number };

function makeParticles(texts: string[]): Particle[] {
  return texts.map((text, i) => ({
    x:       ((i * 67 + 13) % 86) + 5,
    y:       ((i * 41 + 7)  % 80) + 8,
    dur:     28 + (i % 6) * 6,          // 28–58 s
    delay:   -(i * 3.2),                // staggered start
    opacity: 0.045 + (i % 4) * 0.015,  // 0.045–0.09
    text,
  }));
}

const FOUNDER_PARTICLES = makeParticles([
  "+12.4%", "127M UZS", "DSCR: 1.8", "SQB: 82", "↑ 8.2%",
  "EBITDA", "Tax: ✓", "ROI: 24%", "Capital", "Audit: ✓",
  "Badge ✓", "AAA", "IT Park", "Kredit",
]);
const INVESTOR_PARTICLES = makeParticles([
  "+$2.4M", "IRR: 18%", "MOIC: 3.2x", "Exit: 4x", "Cap Table",
  "ARR", "Runway", "Series A", "Portfolio", "+22%",
  "LP Return", "Equity", "Term Sheet", "Valuation",
]);

// SVG chart path — realistic upward trend with natural volatility
const CHART_D =
  "M 0 310 L 90 272 L 175 255 L 210 282 L 295 228 L 380 195 " +
  "L 435 218 L 515 172 L 595 152 L 658 132 L 738 98 " +
  "L 802 112 L 868 82 L 948 55 L 1000 38";
const DASH_LEN = 2400;

interface Props {
  isInvestor: boolean;
  isLight: boolean;
}

export default function FinanceBackground({ isInvestor, isLight }: Props) {
  const accent     = isInvestor ? "#d4a853" : "#10b981";
  const accentDim  = isInvestor ? "rgba(212,168,83,0.06)" : "rgba(16,185,129,0.06)";
  const particles  = isInvestor ? INVESTOR_PARTICLES : FOUNDER_PARTICLES;

  // Gradient orb colors
  const orb1 = isInvestor
    ? (isLight ? "rgba(212,168,83,0.12)" : "rgba(212,168,83,0.05)")
    : (isLight ? "rgba(16,185,129,0.10)" : "rgba(16,185,129,0.05)");
  const orb2 = isLight ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.04)";
  const orb3 = isInvestor
    ? (isLight ? "rgba(250,220,130,0.08)" : "rgba(180,130,40,0.04)")
    : (isLight ? "rgba(52,211,153,0.07)" : "rgba(16,185,129,0.03)");

  const dotColor = isLight
    ? (isInvestor ? "#b8860b" : "#0a9e6e")
    : accent;
  const dotOpacity = isLight ? 0.18 : 0.06;
  const chartOpacity = isLight ? 0.09 : 0.07;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        overflow: "hidden", pointerEvents: "none",
      }}
    >
      {/* ── Gradient orbs ── */}
      <motion.div
        animate={{ x: [0, 45, -20, 0], y: [0, -35, 18, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "-25%", left: "-12%",
          width: 760, height: 760, borderRadius: "50%",
          background: orb1, filter: "blur(130px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -32, 14, 0], y: [0, 28, -38, 0], scale: [1, 0.92, 1.06, 1] }}
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut", delay: 10 }}
        style={{
          position: "absolute", bottom: "-18%", right: "-14%",
          width: 640, height: 640, borderRadius: "50%",
          background: orb2, filter: "blur(110px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 20, -28, 0], y: [0, -22, 30, 0] }}
        transition={{ duration: 70, repeat: Infinity, ease: "easeInOut", delay: 20 }}
        style={{
          position: "absolute", top: "40%", left: "50%",
          width: 480, height: 480, borderRadius: "50%",
          background: orb3, filter: "blur(100px)",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* ── Dot grid ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: dotOpacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="ff-dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={dotColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ff-dots)" />
      </svg>

      {/* ── Animated finance chart (lower-right) ── */}
      <svg
        viewBox="0 0 1000 360"
        preserveAspectRatio="none"
        style={{
          position: "absolute", bottom: "3%", right: "1%",
          width: "42%", maxWidth: 480, height: "auto",
          opacity: chartOpacity,
        }}
      >
        {/* Horizontal grid lines */}
        {[90, 170, 250, 330].map(y => (
          <line
            key={y} x1="0" y1={y} x2="1000" y2={y}
            stroke={accent} strokeWidth="0.6" strokeDasharray="10 8"
            opacity="0.5"
          />
        ))}
        {/* Area fill — static, no animation needed */}
        <path
          d={`${CHART_D} L 1000 360 L 0 360 Z`}
          fill={accentDim}
        />
        {/* The main chart line — draws itself, then resets */}
        <motion.path
          d={CHART_D}
          fill="none"
          stroke={accent}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH_LEN}
          initial={{ strokeDashoffset: DASH_LEN }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 4,
          }}
          style={{ filter: `drop-shadow(0 0 5px ${accent}70)` }}
        />
        {/* Pulsing dot at chart apex */}
        <motion.circle
          cx="1000" cy="38" r="5"
          fill={accent}
          animate={{ scale: [1, 1.7, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${accent})` }}
        />
      </svg>

      {/* ── Secondary smaller chart (upper-left area) ── */}
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        style={{
          position: "absolute", top: "8%", left: "18%",
          width: "22%", maxWidth: 260, height: "auto",
          opacity: chartOpacity * 0.6,
          transform: "scaleY(-1) rotate(180deg)",
        }}
      >
        <motion.path
          d="M 0 180 L 80 140 L 180 110 L 260 125 L 360 80 L 460 55 L 560 40 L 600 30"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1400"
          initial={{ strokeDashoffset: 1400 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: 12,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 6,
            delay: 5,
          }}
        />
      </svg>

      {/* ── Floating financial particles ── */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -26, 0],
            opacity: [0, p.opacity, p.opacity * 0.8, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top:  `${p.y}%`,
            fontSize: 10,
            fontFamily: "'Geist Mono', 'Courier New', monospace",
            color: accent,
            opacity: 0,
            fontWeight: 600,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {p.text}
        </motion.span>
      ))}
    </div>
  );
}
