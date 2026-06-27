"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function DashboardIndex() {
  const router = useRouter();
  useEffect(() => {
    const u = getUser();
    if (u?.role === "investor") router.replace("/dashboard/investor");
    else router.replace("/dashboard/founder");
  }, [router]);
  return null;
}
