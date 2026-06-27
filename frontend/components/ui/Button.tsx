"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

const variants = {
  primary:   "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30",
  secondary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30",
  danger:    "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20",
  ghost:     "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10",
};

// iPhone-style spring tap
const tapAnim = { scale: 0.94, transition: { type: "spring", stiffness: 600, damping: 30 } };
const hoverAnim = { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 22 } };

export default function Button({
  children, onClick, type = "button", variant = "primary",
  disabled, className = "", loading
}: Props) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled ? undefined : hoverAnim}
      whileTap={disabled ? undefined : tapAnim}
      className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      style={{ willChange: "transform" }}
    >
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block"
          />
          Kutilmoqda...
        </span>
      ) : children}
    </motion.button>
  );
}
