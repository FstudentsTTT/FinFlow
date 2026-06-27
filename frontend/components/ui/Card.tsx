"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  noAnim?: boolean;
}

// iOS spring — same easing as iPhone unlock bounce
const IOS_SPRING = { type: "spring", stiffness: 320, damping: 28, mass: 0.9 };
const IOS_ENTER  = { type: "spring", stiffness: 260, damping: 24, mass: 0.85 };

export default function Card({ children, className = "", hover, delay = 0, noAnim }: Props) {
  if (noAnim) {
    return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...IOS_ENTER, delay }}
      whileHover={hover ? {
        y: -6,
        scale: 1.013,
        boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(59,130,246,0.18)",
        transition: { ...IOS_SPRING }
      } : undefined}
      whileTap={hover ? { scale: 0.985, transition: { duration: 0.12 } } : undefined}
      className={`glass rounded-2xl p-5 ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
