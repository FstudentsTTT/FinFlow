"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import Sidebar from "@/components/Sidebar";
import FinanceBackground from "@/components/ui/FinanceBackground";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  const isInvestor = user?.role === "investor";
  const isLight    = theme === "light";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--ff-bg)",
        position: "relative",
      }}
    >
      {/* Finance-themed animated background */}
      <FinanceBackground isInvestor={isInvestor} isLight={isLight} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content — shifts with sidebar width via CSS var */}
      <main
        id="ff-main"
        className="scroll-smooth-ios"
        style={{
          flex: 1,
          marginLeft: "var(--ff-sidebar-w, 240px)",
          height: "100vh",
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
          transition: "margin-left 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
