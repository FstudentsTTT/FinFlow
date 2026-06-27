"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import {
  ShieldCheck, LogOut, Sun, Moon,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import Image from "next/image";

// ── SVG icon set ───────────────────────────────────────────────────────────────

function IcoDashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}
function IcoAudit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function IcoAgent() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
  );
}
function IcoCredit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  );
}
function IcoPitch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}
function IcoFeed() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}
function IcoDeals() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}
function IcoRooms() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}
function IcoWatchlist() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}

// ── Nav definitions ────────────────────────────────────────────────────────────

const FOUNDER_NAV = [
  { href: "/dashboard/founder",   label: "CFO Dashboard",            Icon: IcoDashboard },
  { href: "/dashboard/audit",     label: "Soliq & Muvofiqlik",       Icon: IcoAudit     },
  { href: "/dashboard/ai-agent",  label: "AI Moliyaviy Maslahatchi", Icon: IcoAgent, badge: "YANGI" },
  { href: "/dashboard/history",   label: "Kredit & Kapital",         Icon: IcoCredit    },
  { href: "/dashboard/angel",     label: "Pitch Yuklash",            Icon: IcoPitch     },
];

const INVESTOR_NAV = [
  { href: "/dashboard/angel",      label: "Venchur Lenta",      Icon: IcoFeed      },
  { href: "/dashboard/deals",      label: "Tasdiqlangan Bitim", Icon: IcoDeals     },
  { href: "/dashboard/deal-rooms", label: "Muloqot Xonalari",  Icon: IcoRooms     },
  { href: "/dashboard/watchlist",  label: "Mening Portfelim",  Icon: IcoWatchlist },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────

const EXPANDED_W  = 240;
const COLLAPSED_W = 64;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const path = usePathname();

  const isInvestor = user?.role === "investor";
  const isLight    = theme === "light";
  const navItems   = isInvestor ? INVESTOR_NAV : FOUNDER_NAV;

  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Read persisted collapse state after mount
  useEffect(() => {
    const saved = localStorage.getItem("ff_sidebar");
    if (saved === "1") setCollapsed(true);
  }, []);

  // Persist and update CSS variable when collapsed changes
  useEffect(() => {
    localStorage.setItem("ff_sidebar", collapsed ? "1" : "0");
    document.documentElement.style.setProperty(
      "--ff-sidebar-w",
      `${collapsed ? COLLAPSED_W : EXPANDED_W}px`
    );
    // Apply role for CSS scoping
    document.documentElement.setAttribute("data-role", isInvestor ? "investor" : "founder");
  }, [collapsed, isInvestor]);

  // Sync role attribute independently of collapse state
  useEffect(() => {
    document.documentElement.setAttribute("data-role", isInvestor ? "investor" : "founder");
  }, [isInvestor]);

  const toggleCollapse = () => setCollapsed(c => !c);

  // ── Design tokens (role + theme aware) ──
  const accent       = isInvestor ? "#d4a853" : "#10b981";
  const accentHover  = isInvestor ? "#e8c075" : "#34d399";
  const accentBg     = isInvestor ? "rgba(212,168,83,0.10)" : "rgba(16,185,129,0.10)";
  const accentBorder = isInvestor ? "rgba(212,168,83,0.22)" : "rgba(16,185,129,0.22)";
  const accentGlow   = isInvestor ? "rgba(212,168,83,0.18)" : "rgba(16,185,129,0.18)";
  const accentText   = isInvestor
    ? (isLight ? "#8a6200" : "#d4a853")
    : (isLight ? "#0a7a58" : "#10b981");

  const roleLabel    = isInvestor ? "Angel Investor" : "Ta'sischi";
  const panelLabel   = isInvestor ? "INVESTOR PANEL" : "FOUNDER PANEL";
  const subtitle     = isInvestor ? "Capital Gateway" : "CFO Engine";

  const sidebarBg = isLight
    ? "rgba(255,255,255,0.98)"
    : isInvestor ? "#08101e" : "#07101f";
  const sidebarBorder = isLight
    ? `1px solid ${isInvestor ? "rgba(184,134,11,0.18)" : "rgba(10,158,110,0.18)"}`
    : `1px solid ${isInvestor ? "rgba(212,168,83,0.12)" : "rgba(16,185,129,0.10)"}`;
  const sidebarShadow = isLight
    ? "2px 0 32px rgba(0,0,0,0.07)"
    : "2px 0 32px rgba(0,0,0,0.30)";

  const textPrimary = isLight ? "#0e1e2c" : "#e2e8f0";
  const textMuted   = isLight ? "#64748b" : "#94a3b8";
  const textSubtle  = isLight ? "#9ca3af" : "#475569";
  const divider     = isLight
    ? `1px solid ${isInvestor ? "rgba(184,134,11,0.12)" : "rgba(10,158,110,0.12)"}`
    : `1px solid ${isInvestor ? "rgba(212,168,83,0.08)" : "rgba(16,185,129,0.07)"}`;
  const userCardBg = isLight ? "rgba(245,247,252,0.80)" : "rgba(255,255,255,0.04)";
  const badgeBg    = `${accentBg}`;
  const badgeBorder = accentBorder;

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <motion.aside
      initial={{ x: -EXPANDED_W, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.85, restDelta: 0.001 }}
      style={{
        position: "fixed", left: 0, top: 0, height: "100%", zIndex: 50,
        display: "flex", flexDirection: "column",
        width: w,
        background: sidebarBg,
        borderRight: sidebarBorder,
        boxShadow: sidebarShadow,
        overflow: "hidden",
        willChange: "width",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1), background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* ── Logo header ── */}
      <div
        style={{
          padding: collapsed ? "1.1rem 0" : "1.1rem 1.25rem",
          borderBottom: divider,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 64,
          transition: "padding 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <motion.div
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
          style={{ overflow: "hidden" }}
        >
          {/* Logo icon */}
          <div
            style={{
              width: 34, height: 34, borderRadius: 10,
              overflow: "hidden", flexShrink: 0,
              border: `1.5px solid ${accentBorder}`,
              boxShadow: `0 0 12px ${accentGlow}`,
            }}
          >
            <Image src="/logo.jpg" alt="FinFlow" width={34} height={34} className="object-cover w-full h-full" />
          </div>

          {/* Title — hidden when collapsed */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="font-bold text-sm leading-tight" style={{ color: textPrimary }}>
                  FinFlow AI
                </p>
                <p style={{ color: accentText, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }}>
                  {subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapse toggle — only when expanded */}
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={toggleCollapse}
              title="Yig'ish"
              style={{
                width: 26, height: 26, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent",
                border: `1px solid ${isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)"}`,
                color: textMuted, cursor: "pointer", flexShrink: 0,
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = accentBg;
                (e.currentTarget as HTMLElement).style.borderColor = accentBorder;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)";
              }}
            >
              <ChevronLeft size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Expand button when collapsed ── */}
      {collapsed && (
        <div style={{ padding: "0.5rem 0", display: "flex", justifyContent: "center", borderBottom: divider }}>
          <motion.button
            onClick={toggleCollapse}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Kengaytirish"
            style={{
              width: 32, height: 32, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: accentBg, border: `1px solid ${accentBorder}`,
              color: accent, cursor: "pointer",
            }}
          >
            <ChevronRight size={15} />
          </motion.button>
        </div>
      )}

      {/* ── User info ── */}
      <div
        style={{
          padding: collapsed ? "0.6rem 0" : "0.75rem 1rem",
          borderBottom: divider,
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "padding 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {collapsed ? (
          /* Collapsed: just avatar circle */
          <div
            title={user?.full_name || ""}
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: accentBg, border: `1.5px solid ${accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: accentText, fontWeight: 700, fontSize: 13,
              flexShrink: 0,
            }}
          >
            {user?.full_name?.charAt(0).toUpperCase() || "?"}
          </div>
        ) : (
          /* Expanded: full user card */
          <div
            style={{
              background: userCardBg,
              borderRadius: 12,
              padding: "0.6rem 0.8rem",
              width: "100%",
              border: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)"}`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: accentBg, border: `1.5px solid ${accentBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: accentText, fontWeight: 700, fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: textPrimary }}
                >
                  {user?.full_name}
                </p>
                <p className="text-[10px] truncate" style={{ color: textMuted }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 99,
                  background: badgeBg, color: accentText,
                  border: `1px solid ${badgeBorder}`,
                  fontWeight: 600, letterSpacing: "0.03em",
                }}
              >
                {roleLabel}
              </span>
              {user?.badge_verified && (
                <span
                  style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 99,
                    background: "rgba(16,185,129,0.10)", color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.22)",
                    fontWeight: 600,
                  }}
                >
                  ✓ AI Verified
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: collapsed ? "0.75rem 0" : "0.75rem 0.5rem", overflowY: "auto", transition: "padding 0.22s cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Section label */}
        {!collapsed && (
          <p
            style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: textSubtle,
              padding: "0 0.75rem", marginBottom: "0.4rem",
            }}
          >
            {panelLabel}
          </p>
        )}

        {navItems.map((item, idx) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 28 }}
                whileHover={{
                  x: collapsed ? 0 : 3,
                  transition: { type: "spring", stiffness: 500, damping: 30 },
                }}
                whileTap={{ scale: 0.97, transition: { duration: 0.08 } }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "0.65rem 0" : "0.6rem 0.75rem",
                  marginBottom: "2px",
                  borderRadius: collapsed ? 0 : 10,
                  /* Active: accent left border + gradient bg */
                  borderLeft: collapsed ? "none" : (active ? `2px solid ${accent}` : "2px solid transparent"),
                  background: active
                    ? (collapsed
                        ? accentBg
                        : `linear-gradient(90deg, ${accentBg} 0%, transparent 80%)`)
                    : "transparent",
                  color: active ? accentText : textMuted,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
                  position: "relative",
                  paddingLeft: collapsed ? 0 : (active ? "calc(0.75rem - 2px)" : "0.75rem"),
                }}
              >
                {/* Active accent bar for collapsed mode */}
                {collapsed && active && (
                  <div
                    style={{
                      position: "absolute", left: 0, top: "20%", bottom: "20%",
                      width: 2.5, borderRadius: 99, background: accent,
                    }}
                  />
                )}

                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>
                  <item.Icon />
                </span>

                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span
                        style={{
                          fontSize: 9, padding: "1px 6px", borderRadius: 99,
                          background: accentBg, color: accentText,
                          border: `1px solid ${accentBorder}`,
                          fontWeight: 700, letterSpacing: "0.05em",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <motion.div
                        layoutId="ff-nav-dot"
                        style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: accent,
                          boxShadow: `0 0 6px ${accent}`,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Admin section */}
        {user?.is_admin && (
          <>
            <div
              style={{
                borderTop: divider,
                margin: collapsed ? "0.5rem 0" : "0.5rem 0.75rem",
                paddingTop: "0.4rem",
              }}
            >
              {!collapsed && (
                <p
                  style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: textSubtle,
                    marginBottom: "0.3rem",
                  }}
                >
                  ADMIN
                </p>
              )}
            </div>
            <Link href="/admin" title={collapsed ? "Admin Panel" : undefined}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "0.65rem 0" : "0.6rem 0.75rem",
                  borderRadius: collapsed ? 0 : 10,
                  borderLeft: collapsed ? "none" : (
                    path.startsWith("/admin")
                      ? "2px solid #f59e0b"
                      : "2px solid transparent"
                  ),
                  background: path.startsWith("/admin")
                    ? (collapsed ? "rgba(245,158,11,0.10)" : "linear-gradient(90deg, rgba(245,158,11,0.10) 0%, transparent 80%)")
                    : "transparent",
                  color: path.startsWith("/admin") ? "#f59e0b" : textMuted,
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "background 0.18s ease, color 0.18s ease",
                }}
              >
                <ShieldCheck size={17} style={{ flexShrink: 0, opacity: 0.85 }} />
                {!collapsed && <span>Admin Panel</span>}
              </motion.div>
            </Link>
          </>
        )}
      </nav>

      {/* ── Bottom actions ── */}
      <div
        style={{
          padding: collapsed ? "0.75rem 0" : "0.75rem 0.5rem",
          borderTop: divider,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          transition: "padding 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          title={isLight ? "Qorong'i rejim" : "Yorug' rejim"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "0.65rem 0" : "0.6rem 0.75rem",
            borderRadius: collapsed ? 0 : 10,
            background: "transparent",
            color: textMuted,
            fontSize: 13, fontWeight: 400,
            cursor: "pointer", width: "100%",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = accentBg;
            (e.currentTarget as HTMLElement).style.color = accentText;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = textMuted;
          }}
        >
          {isLight
            ? <Moon size={16} style={{ color: "#6366f1", flexShrink: 0 }} />
            : <Sun  size={16} style={{ color: "#fbbf24", flexShrink: 0 }} />
          }
          {!collapsed && (
            <span>{isLight ? "Qorong'i rejim" : "Yorug' rejim"}</span>
          )}
        </motion.button>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          title="Chiqish"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "0.65rem 0" : "0.6rem 0.75rem",
            borderRadius: collapsed ? 0 : 10,
            background: "transparent",
            color: textMuted,
            fontSize: 13, fontWeight: 400,
            cursor: "pointer", width: "100%",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = textMuted;
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Chiqish</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
