"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import {
  BarChart3, Shield, TrendingUp, Brain, Star, Coins,
  ArrowRight, ChevronRight, CheckCircle2, Menu, X,
  Sparkles, Building2, Users, Sun, Moon,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BarChart3,
    tag: "Tahlil",
    title: "DSCR Tahlili",
    desc: "SQB mezonlariga asoslangan qarz xizmati koeffitsientini avtomatik hisoblash va baholash.",
    accent: "rgba(59,130,246,0.22)",
    iconBg: "rgba(59,130,246,0.10)",
    iconColor: "#2563eb",
    tagColor: "#1d4ed8",
  },
  {
    icon: Shield,
    tag: "Sertifikat",
    title: "AI Verified Badge",
    desc: "Investor ishonchi uchun raqamli moliyaviy sertifikat. To'g'ridan-to'g'ri bankka taqdim etiladi.",
    accent: "rgba(16,185,129,0.22)",
    iconBg: "rgba(16,185,129,0.10)",
    iconColor: "#059669",
    tagColor: "#047857",
  },
  {
    icon: TrendingUp,
    tag: "Tejam",
    title: "IT Park Imtiyozlari",
    desc: "Oylik ish haqi fondi × 11% × 12 — yillik potensial soliq tejamini bir zumda ko'ring.",
    accent: "rgba(124,58,237,0.20)",
    iconBg: "rgba(124,58,237,0.09)",
    iconColor: "#7c3aed",
    tagColor: "#6d28d9",
  },
  {
    icon: Brain,
    tag: "AI",
    title: "FinFlow AI Maslahati",
    desc: "O'zbek tilida professional moliyaviy maslahat, strategik tavsiyalar va risk tahlili.",
    accent: "rgba(99,102,241,0.20)",
    iconBg: "rgba(99,102,241,0.09)",
    iconColor: "#6366f1",
    tagColor: "#4f46e5",
  },
  {
    icon: Star,
    tag: "Angel",
    title: "Angel Feed",
    desc: "Investor va tadbirkor o'rtasida to'g'ridan-to'g'ri muloqot, deal room va investitsiya boshqaruvi.",
    accent: "rgba(217,119,6,0.20)",
    iconBg: "rgba(217,119,6,0.09)",
    iconColor: "#d97706",
    tagColor: "#b45309",
  },
  {
    icon: Coins,
    tag: "Monitor",
    title: "1B UZS Monitoring",
    desc: "Soliq devori yaqinligi real vaqt ogohlantirish va avtonom boshqaruv strategiyasi.",
    accent: "rgba(220,38,38,0.18)",
    iconBg: "rgba(220,38,38,0.08)",
    iconColor: "#dc2626",
    tagColor: "#b91c1c",
  },
];

const STEPS = [
  {
    num: "01",
    icon: Building2,
    title: "Biznes ma'lumotlarini kiriting",
    desc: "Kompaniya nomi, soha, hudud va asosiy moliyaviy ko'rsatkichlarni kiriting. Faqat 5 daqiqa ketadi.",
  },
  {
    num: "02",
    icon: Brain,
    title: "FinFlow AI tahlil qiladi",
    desc: "Sun'iy intellekt DSCR, IT Park imtiyozlari, soliq devori va SQB mezonlarini avtomatik hisoblaydi.",
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Natija va tavsiyalarni oling",
    desc: "Moliyaviy audit hisoboti, strategik tavsiyalar va investor uchun tayyor sertifikat.",
  },
];

const STATS = [
  { value: "~1.3×", label: "DSCR minimal daraja", sub: "SQB standart" },
  { value: "11%",   label: "IT Park tejami",       sub: "Ijtimoiy soliq" },
  { value: "1B",    label: "UZS Soliq devori",     sub: "Real-time monitor" },
  { value: "100%",  label: "O'zbek tilida",        sub: "AI maslahat" },
];

const TRUSTED = [
  "SQB mezonlari asosida",
  "IT Park ulangan",
  "DSCR standartlari",
  "O'zbekiston SME uchun",
];

// ── Inline gradient span (CSS-var driven, no flash) ───────────────────────────
const GradSpan = ({ children, cssVar }: { children: React.ReactNode; cssVar: string }) => (
  <span
    style={{
      background: `var(${cssVar})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    {children}
  </span>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getToken()) router.replace("/dashboard");
  }, [router]);

  // Navbar glass on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Theme toggle — pure DOM, no React state (avoids SSR flash)
  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("ff_theme", next); } catch {}
  };

  // GSAP animations
  useEffect(() => {
    const titleEl = document.getElementById("hero-title");
    if (!titleEl || !mainRef.current) return;

    const split = new SplitType(titleEl, { types: "chars,words" });
    const gradWordEl = document.getElementById("hero-grad-word");
    const cfoCopyEls = Array.from(document.querySelectorAll<HTMLElement>(".ai-cfo-copy"));
    const cfoSplits = cfoCopyEls.map((el) => new SplitType(el, { types: "words" }));

    const ctx = gsap.context(() => {
      // ── Hero entrance — replays when scrolling back to top ─────────────
      const heroTl = gsap.timeline({ delay: 0.1 });
      heroTl.from("#hero-badge", {
        opacity: 0, y: -16, scale: 0.88,
        duration: 0.55, ease: "back.out(1.8)",
      })
      .from([...(split.chars || []), ...(gradWordEl ? [gradWordEl] : [])], {
        opacity: 0, y: 80, rotateX: -90,
        transformOrigin: "0% 50% -50",
        stagger: 0.016,
        duration: 0.75, ease: "back.out(2)",
      }, "-=0.3")
      .from("#hero-sub", {
        opacity: 0, y: 24,
        duration: 0.65, ease: "power3.out",
      }, "-=0.45")
      .from("#hero-cta > *", {
        opacity: 0, y: 18, stagger: 0.09,
        duration: 0.55, ease: "power3.out",
      }, "-=0.4")
      .from("#hero-trust > *", {
        opacity: 0, x: -12, stagger: 0.06,
        duration: 0.45, ease: "power2.out",
      }, "-=0.3")
      .from("#hero-scroll-hint", { opacity: 0, duration: 0.5 }, "-=0.1");

      ScrollTrigger.create({
        trigger: "#hero-heading",
        start: "top 90%",
        onEnterBack: () => { heroTl.restart(); },
      });

      // ── Scroll-triggered (toggleActions: reset on leave-back so they replay) ──
      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: "#stats-section", start: "top 78%",
          toggleActions: "play none none reset",
        },
        opacity: 0, y: 40, stagger: 0.1, duration: 0.7, ease: "power3.out",
      });

      gsap.from("#features-header", {
        scrollTrigger: {
          trigger: "#features-section", start: "top 75%",
          toggleActions: "play none none reset",
        },
        opacity: 0, y: 45, duration: 0.7, ease: "power3.out",
      });

      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: "#features-section", start: "top 62%",
          toggleActions: "play none none reset",
        },
        opacity: 0, y: 60, scale: 0.93, stagger: 0.07,
        duration: 0.85, ease: "back.out(1.4)",
      });

      gsap.from("#process-header", {
        scrollTrigger: {
          trigger: "#process-section", start: "top 78%",
          toggleActions: "play none none reset",
        },
        opacity: 0, y: 40, duration: 0.65, ease: "power3.out",
      });

      document.querySelectorAll<HTMLElement>(".process-step").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reset",
          },
          opacity: 0, x: -50, duration: 0.75, ease: "power3.out",
        });
      });

      gsap.from("#cta-card", {
        scrollTrigger: {
          trigger: "#cta-section", start: "top 72%",
          toggleActions: "play none none reset",
        },
        opacity: 0, y: 60, scale: 0.94, duration: 0.9, ease: "back.out(1.3)",
      });

      gsap.from("#ai-cfo-badge", {
        scrollTrigger: {
          trigger: "#ai-cfo-section", start: "top 72%",
          toggleActions: "play none none reset",
        },
        opacity: 0, x: -20, duration: 0.6, ease: "power3.out",
      });

      gsap.from("#ai-cfo-title", {
        scrollTrigger: {
          trigger: "#ai-cfo-section", start: "top 68%",
          toggleActions: "play none none reset",
        },
        opacity: 0, y: 36, duration: 0.85, ease: "power3.out",
      });

      // ── AI CFO Card — 3D deal slide, replayable ────────────────────────
      const cfoCardEl = document.getElementById("ai-cfo-card");
      if (cfoCardEl) {
        gsap.set(cfoCardEl, {
          x: "-110vw", rotateY: -42, skewY: -7, transformPerspective: 1400, opacity: 0,
        });
        ScrollTrigger.create({
          trigger: "#ai-cfo-section",
          start: "top 70%",
          onEnter: () => {
            gsap.to(cfoCardEl, {
              x: 0, rotateY: 0, skewY: 0, opacity: 1,
              duration: 1.2, ease: "power4.out",
            });
          },
          onLeaveBack: () => {
            gsap.set(cfoCardEl, {
              x: "-110vw", rotateY: -42, skewY: -7, opacity: 0,
            });
          },
        });
      }

      // ── AI CFO copy SplitType ──────────────────────────────────────────
      cfoSplits.forEach((s, i) => {
        if (s.words && s.words.length) {
          gsap.from(s.words, {
            scrollTrigger: {
              trigger: cfoCopyEls[i], start: "top 86%",
              toggleActions: "play none none reset",
            },
            opacity: 0, y: 28, stagger: 0.038, duration: 0.6, ease: "power3.out",
          });
        }
      });
    }, mainRef);

    return () => {
      ctx.revert();
      split.revert();
      cfoSplits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <div
      ref={mainRef}
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--lp-bg)", color: "var(--lp-heading)" }}
    >
      {/* ── Ambient background ───────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--lp-grid) 1px, transparent 1px),
              linear-gradient(90deg, var(--lp-grid) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse, var(--lp-orb1) 0%, transparent 68%)" }}
        />
        <div
          className="absolute top-[40%] right-[-120px] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, var(--lp-orb2) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-[-60px] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, var(--lp-orb3) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "var(--lp-nav)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid var(--lp-nav-border)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all duration-200 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.35)]"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", fontFamily: "var(--font-clash)" }}
            >
              F
            </div>
            <span
              className="text-[17px] font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-clash)", color: "var(--lp-heading)" }}
            >
              FinFlow <span style={{ color: "#6366f1" }}>AI</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Imkoniyatlar", href: "#features-section" },
              { label: "Qanday ishlaydi", href: "#process-section" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm transition-colors duration-200"
                style={{ color: "var(--lp-nav-link)", fontFamily: "var(--font-satoshi)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--lp-heading)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--lp-nav-link)")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs + theme toggle */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: "var(--lp-btn2-bg)", border: "1px solid var(--lp-btn2-border)", color: "var(--lp-nav-link)" }}
              aria-label="Toggle theme"
            >
              <Sun size={15} className="lp-icon-sun" />
              <Moon size={15} className="lp-icon-moon" />
            </button>

            <Link href="/login">
              <button
                className="px-4 py-2 text-sm transition-colors duration-200"
                style={{ color: "var(--lp-nav-link)", fontFamily: "var(--font-satoshi)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--lp-heading)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--lp-nav-link)")}
              >
                Kirish
              </button>
            </Link>
            <Link href="/register">
              <button
                className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  boxShadow: "0 1px 3px rgba(99,102,241,0.30)",
                  color: "#ffffff",
                  fontFamily: "var(--font-satoshi)",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.40)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(99,102,241,0.30)")}
              >
                Bepul boshlash
              </button>
            </Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--lp-btn2-bg)", border: "1px solid var(--lp-btn2-border)", color: "var(--lp-nav-link)" }}
              aria-label="Toggle theme"
            >
              <Sun size={15} className="lp-icon-sun" />
              <Moon size={15} className="lp-icon-moon" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: "var(--lp-nav-link)" }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-6 pb-6 pt-4 space-y-4"
            style={{
              background: "var(--lp-mob-menu)",
              backdropFilter: "blur(20px)",
              borderColor: "var(--lp-mob-border)",
            }}
          >
            {["Imkoniyatlar", "Qanday ishlaydi"].map((label) => (
              <a
                key={label}
                href="#"
                onClick={() => setMenuOpen(false)}
                className="block text-sm py-1 transition-colors"
                style={{ color: "var(--lp-nav-link)", fontFamily: "var(--font-satoshi)" }}
              >
                {label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1">
                <button
                  className="w-full py-2.5 text-sm rounded-xl border"
                  style={{
                    borderColor: "var(--lp-mob-btn)",
                    color: "var(--lp-mob-btn-text)",
                    fontFamily: "var(--font-satoshi)",
                  }}
                >
                  Kirish
                </button>
              </Link>
              <Link href="/register" className="flex-1">
                <button
                  className="w-full py-2.5 text-sm font-semibold rounded-xl"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#ffffff", fontFamily: "var(--font-satoshi)" }}
                >
                  Boshlash
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">

        {/* Badge */}
        <div
          id="hero-badge"
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            border: "1px solid var(--lp-badge-border)",
            background: "var(--lp-badge-bg)",
            color: "var(--lp-badge-text)",
            fontFamily: "var(--font-satoshi)",
          }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            O'zbekiston №1 AI Moliyaviy Platform
          </span>
          <ChevronRight size={12} className="opacity-40" />
        </div>

        {/* Hero title — #hero-title is plain-text only so SplitType chars don't inherit transparent fill */}
        <h1
          id="hero-heading"
          className="text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.06] tracking-tight max-w-4xl mx-auto mb-6"
          style={{ fontFamily: "var(--font-clash)", fontWeight: 700 }}
        >
          <span id="hero-title" style={{ color: "var(--lp-heading)", perspective: "800px" }}>
            Biznesingizni moliyaviy jihatdan{" "}
          </span>
          <span
            id="hero-grad-word"
            style={{
              background: "var(--lp-hero-grad)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >tayyorlang</span>
        </h1>

        {/* Subtitle */}
        <p
          id="hero-sub"
          className="text-[clamp(1rem,1.5vw,1.15rem)] max-w-[540px] mx-auto leading-relaxed mb-10"
          style={{ color: "var(--lp-body)", fontFamily: "var(--font-satoshi)" }}
        >
          DSCR tahlili, IT Park imtiyozlari, SQB kredit tayyorligi va
          FinFlow AI yordamida professional audit — barchasi bir platformada.
        </p>

        {/* CTAs */}
        <div id="hero-cta" className="flex flex-col sm:flex-row gap-3.5 justify-center mb-12">
          <Link href="/register">
            <button
              className="flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.30)",
                color: "#ffffff",
                fontFamily: "var(--font-satoshi)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 28px rgba(99,102,241,0.45)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.30)")}
            >
              Bepul boshlash <ArrowRight size={15} />
            </button>
          </Link>
          <Link href="/login">
            <button
              className="flex items-center gap-2 px-8 py-4 text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                border: "1px solid var(--lp-btn2-border)",
                background: "var(--lp-btn2-bg)",
                color: "var(--lp-btn2-text)",
                fontFamily: "var(--font-satoshi)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--lp-heading)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--lp-btn2-text)";
              }}
            >
              Kirish <ChevronRight size={14} />
            </button>
          </Link>
        </div>

        {/* Trust chips */}
        <div id="hero-trust" className="flex flex-wrap justify-center gap-2">
          {TRUSTED.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium"
              style={{
                background: "var(--lp-trust-bg)",
                border: "1px solid var(--lp-trust-border)",
                color: "var(--lp-trust-text)",
                fontFamily: "var(--font-satoshi)",
              }}
            >
              <CheckCircle2 size={10} style={{ color: "#10b981" }} />
              {label}
            </span>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          id="hero-scroll-hint"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div
            className="w-px h-10"
            style={{ background: "linear-gradient(to bottom, transparent, var(--lp-scroll-line))" }}
          />
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--lp-scroll-text)", fontFamily: "var(--font-satoshi)" }}
          >
            Scroll
          </span>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────────────────── */}
      <section
        id="stats-section"
        className="relative z-10 py-16"
        style={{
          borderTop: "1px solid var(--lp-stat-border)",
          borderBottom: "1px solid var(--lp-stat-border)",
          background: "var(--lp-stat-bg)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item text-center">
                <p
                  className="text-[clamp(2rem,4vw,3rem)] font-bold mb-1 leading-none"
                  style={{
                    fontFamily: "var(--font-clash)",
                    background: "linear-gradient(135deg, var(--lp-stat-from) 0%, var(--lp-stat-to) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--lp-stat-label)", fontFamily: "var(--font-satoshi)" }}>
                  {s.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--lp-stat-sub)", fontFamily: "var(--font-satoshi)" }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────── */}
      <section id="features-section" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">

          <div id="features-header" className="text-center mb-16">
            <span
              className="inline-block text-xs font-semibold tracking-[0.18em] uppercase mb-4"
              style={{ color: "#6366f1", fontFamily: "var(--font-satoshi)" }}
            >
              Imkoniyatlar
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight"
              style={{ fontFamily: "var(--font-clash)", fontWeight: 700, color: "var(--lp-heading)" }}
            >
              Moliyaviy o&apos;sish uchun
              <br />
              <GradSpan cssVar="--lp-feat-grad">hamma narsa bir joyda</GradSpan>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CFO Section ───────────────────────────────────────────────── */}
      <section
        id="ai-cfo-section"
        className="relative z-10 py-28 px-6 overflow-hidden"
        style={{
          borderTop: "1px solid var(--lp-cfo-bg-border)",
          background: "var(--lp-cfo-bg)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 15% 50%, var(--lp-orb3) 0%, transparent 60%)" }}
        />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT — AI CFO Card */}
            <div style={{ perspective: "1400px", perspectiveOrigin: "60% 50%" }}>
              <div
                id="ai-cfo-card"
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: "var(--lp-cfo-card)",
                  backdropFilter: "blur(24px) saturate(200%)",
                  WebkitBackdropFilter: "blur(24px) saturate(200%)",
                  border: "1px solid var(--lp-cfo-border)",
                  boxShadow: "var(--lp-cfo-shadow)",
                }}
              >
                {/* Shimmer */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 25% 0%, var(--lp-orb3) 0%, transparent 55%)" }}
                />

                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(16,185,129,0.12)", border: "1px solid var(--lp-cfo-border)" }}
                      >
                        <Brain size={16} style={{ color: "var(--lp-cfo-brain)" }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--lp-cfo-h)", fontFamily: "var(--font-clash)" }}>
                          AI CFO Tahlili
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--lp-cfo-sub)", fontFamily: "var(--font-satoshi)" }}>
                          Moliyaviy balans monitoringi
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(16,185,129,0.10)", border: "1px solid var(--lp-cfo-border)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--lp-cfo-brain)" }} />
                      <span className="text-[10px] font-medium" style={{ color: "var(--lp-cfo-brain)", fontFamily: "var(--font-satoshi)" }}>
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl p-4" style={{ background: "var(--lp-cfo-ng-bg)", border: "1px solid var(--lp-cfo-ng-bd)" }}>
                      <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--lp-cfo-ng-lbl)", fontFamily: "var(--font-satoshi)" }}>
                        Buxgalter Yondashuvi
                      </p>
                      <p className="text-[26px] font-bold leading-none mb-2" style={{ color: "var(--lp-cfo-ng-num)", fontFamily: "var(--font-clash)" }}>
                        0.89
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--lp-cfo-ng-lbl)" }} />
                        <span className="text-[9px]" style={{ color: "var(--lp-cfo-ng-sub)", fontFamily: "var(--font-satoshi)" }}>Kredit rad etiladi</span>
                      </div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "var(--lp-cfo-ok-bg)", border: "1px solid var(--lp-cfo-ok-bd)" }}>
                      <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--lp-cfo-ok-lbl)", fontFamily: "var(--font-satoshi)" }}>
                        AI CFO Balansi
                      </p>
                      <p className="text-[26px] font-bold leading-none mb-2" style={{ color: "var(--lp-cfo-ok-num)", fontFamily: "var(--font-clash)" }}>
                        1.38
                      </p>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={10} style={{ color: "var(--lp-cfo-brain)" }} />
                        <span className="text-[9px]" style={{ color: "var(--lp-cfo-ok-sub)", fontFamily: "var(--font-satoshi)" }}>SQB tasdiqladi</span>
                      </div>
                    </div>
                  </div>

                  {/* DSCR threshold */}
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
                    style={{ background: "var(--lp-cfo-dscr-bg)", border: "1px solid var(--lp-cfo-dscr-bd)" }}
                  >
                    <span className="text-[12px] font-bold" style={{ color: "var(--lp-cfo-dscr-txt)", fontFamily: "var(--font-clash)" }}>
                      DSCR ≥ 1.25
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--lp-cfo-dscr-sub)", fontFamily: "var(--font-satoshi)" }}>
                      SQB Anderrayting Chegarasi
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px mb-4" style={{ background: "var(--lp-cfo-border)" }} />

                  {/* Key Metrics */}
                  <div className="space-y-2.5 mb-5">
                    {([
                      { label: "Soliq Tejami (Optimal)",     value: "−28%",     color: "var(--lp-cfo-brain)" },
                      { label: "IT Park Yillik Tejam",       value: "+$18,480", color: "#2563eb" },
                      { label: "Kredit Tasdiqlash Ehtimoli", value: "94%",      color: "#7c3aed" },
                    ] as { label: string; value: string; color: string }[]).map((m) => (
                      <div key={m.label} className="flex items-center justify-between">
                        <span className="text-[11px]" style={{ color: "var(--lp-cfo-mlabel)", fontFamily: "var(--font-satoshi)" }}>
                          {m.label}
                        </span>
                        <span className="text-[11px] font-bold" style={{ color: m.color, fontFamily: "var(--font-clash)" }}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: "var(--lp-cfo-st-bg)", border: "1px solid var(--lp-cfo-st-bd)" }}
                  >
                    <CheckCircle2 size={13} style={{ color: "var(--lp-cfo-brain)" }} />
                    <span className="text-[11px] font-medium" style={{ color: "var(--lp-cfo-st-txt)", fontFamily: "var(--font-satoshi)" }}>
                      AI optimal muvozanat topdi — soliq & bank tayyor
                    </span>
                  </div>
                </div>

                <div
                  className="h-px w-full"
                  style={{ background: "linear-gradient(90deg, transparent, var(--lp-cfo-border), transparent)" }}
                />
              </div>
            </div>

            {/* RIGHT — Typographic copy */}
            <div className="flex flex-col gap-6">
              <div id="ai-cfo-badge">
                <span
                  className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase"
                  style={{ color: "var(--lp-cfo-badge)", fontFamily: "var(--font-satoshi)" }}
                >
                  <span className="w-1 h-4 rounded-full" style={{ background: "var(--lp-cfo-badge)" }} />
                  Feature 01 · AI CFO
                </span>
              </div>

              <h2
                id="ai-cfo-title"
                className="text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.06] tracking-tight"
                style={{ fontFamily: "var(--font-clash)", fontWeight: 700, color: "var(--lp-cfo-rh)" }}
              >
                Buxgalteriya tuzog&apos;idan{" "}
                <br className="hidden sm:block" />
                <span
                  style={{
                    background: "var(--lp-cfo-grad)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  qutuling.
                </span>
              </h2>

              <p
                className="ai-cfo-copy text-[15px] leading-relaxed"
                style={{ color: "var(--lp-cfo-rbody)", fontFamily: "var(--font-satoshi)" }}
              >
                O&apos;zbekistondagi 99% buxgalterlar soliqni kamaytirish uchun
                rasmiy foydani 0 ga yaqin ko&apos;rsatishadi. Natijada banklar
                kredit berishni avtomatik rad etadi. FinFlow AI soliqni qonuniy
                optimallashtirib, bank anderrayting mezonlari (DSCR ≥ 1.25)
                o&apos;rtasidagi mukammal muvozanatni hisoblaydi.
              </p>

              {/* Callout */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "var(--lp-cfo-cl-bg)", border: "1px solid var(--lp-cfo-cl-bd)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid var(--lp-cfo-cl-ibd)" }}
                  >
                    <TrendingUp size={16} style={{ color: "var(--lp-cfo-brain)" }} />
                  </div>
                  <div>
                    <p
                      className="ai-cfo-copy text-sm font-semibold mb-1.5"
                      style={{ color: "var(--lp-cfo-cl-h)", fontFamily: "var(--font-clash)" }}
                    >
                      Soliq tejami va kredit imkoniyati — bir vaqtda
                    </p>
                    <p
                      className="ai-cfo-copy text-[13px] leading-relaxed"
                      style={{ color: "var(--lp-cfo-cl-b)", fontFamily: "var(--font-satoshi)" }}
                    >
                      AI hisobotingizni optimal ko&apos;rsatadi: soliq xarajati
                      minimallashadi, DSCR 1.25 dan yuqori qoladi. Banklar
                      kreditni avtomatik tasdiqlaydi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Metric pair */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: "Buxgalter DSCR", value: "0.89", sub: "Kredit bloklanadi", ok: false },
                  { label: "AI CFO DSCR",    value: "1.38", sub: "Kredit ochiq",      ok: true  },
                ] as { label: string; value: string; sub: string; ok: boolean }[]).map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl p-4"
                    style={{
                      background: m.ok ? "var(--lp-cfo-ok-bg)" : "var(--lp-cfo-ng-bg)",
                      border: `1px solid ${m.ok ? "var(--lp-cfo-ok-bd)" : "var(--lp-cfo-ng-bd)"}`,
                    }}
                  >
                    <p
                      className="text-[10px] font-medium mb-1.5"
                      style={{ color: m.ok ? "var(--lp-cfo-ok-lbl)" : "var(--lp-cfo-ng-lbl)", fontFamily: "var(--font-satoshi)" }}
                    >
                      {m.label}
                    </p>
                    <p
                      className="text-[28px] font-bold leading-none mb-1"
                      style={{ color: m.ok ? "var(--lp-cfo-ok-num)" : "var(--lp-cfo-ng-num)", fontFamily: "var(--font-clash)" }}
                    >
                      {m.value}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: m.ok ? "var(--lp-cfo-ok-sub)" : "var(--lp-cfo-ng-sub)", fontFamily: "var(--font-satoshi)" }}
                    >
                      {m.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process Section ───────────────────────────────────────────────── */}
      <section
        id="process-section"
        className="relative z-10 py-28 px-6"
        style={{
          borderTop: "1px solid var(--lp-stat-border)",
          background: "var(--lp-process-bg)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div id="process-header" className="text-center mb-16">
            <span
              className="inline-block text-xs font-semibold tracking-[0.18em] uppercase mb-4"
              style={{ color: "#059669", fontFamily: "var(--font-satoshi)" }}
            >
              Jarayon
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3.2rem)] font-bold"
              style={{ fontFamily: "var(--font-clash)", fontWeight: 700, color: "var(--lp-heading)" }}
            >
              Qanday ishlaydi?
            </h2>
          </div>

          <div className="relative space-y-4">
            <div
              className="absolute left-[35px] top-12 bottom-12 w-px hidden sm:block"
              style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.25), rgba(99,102,241,0.04))" }}
            />
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="process-step relative flex gap-5 p-6 rounded-2xl transition-all duration-300"
                style={{ background: "var(--lp-step)", border: "1px solid var(--lp-step-border)" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--lp-cfo-dscr-bg)";
                  el.style.border = "1px solid var(--lp-cfo-dscr-bd)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--lp-step)";
                  el.style.border = "1px solid var(--lp-step-border)";
                }}
              >
                <div className="shrink-0 flex flex-col items-center">
                  <div
                    className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-xs font-bold relative z-10"
                    style={{
                      background: "rgba(99,102,241,0.10)",
                      border: "1px solid rgba(99,102,241,0.20)",
                      color: "#6366f1",
                      fontFamily: "var(--font-clash)",
                    }}
                  >
                    {step.num}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon size={14} style={{ color: "#6366f1" }} />
                    <h3 className="text-base font-semibold" style={{ color: "var(--lp-step-title)", fontFamily: "var(--font-clash)" }}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--lp-step-desc)", fontFamily: "var(--font-satoshi)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section id="cta-section" className="relative z-10 py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            id="cta-card"
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)" }}
          >
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(129,140,248,0.25) 0%, transparent 60%)" }}
            />
            <div
              className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", transform: "translate(-40%, -40%)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", transform: "translate(40%, 40%)" }}
            />

            <div className="relative">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium mb-6"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", color: "#c7d2fe", fontFamily: "var(--font-satoshi)" }}
              >
                <Sparkles size={10} />
                Bepul, hech qanday kredit karta kerak emas
              </div>

              <h2
                className="text-[clamp(1.8rem,4vw,3rem)] font-bold mb-4"
                style={{ fontFamily: "var(--font-clash)", fontWeight: 700, color: "#ffffff" }}
              >
                Boshlashga tayyor?
              </h2>
              <p
                className="mb-8 max-w-md mx-auto leading-relaxed text-[15px]"
                style={{ color: "rgba(199,210,254,0.80)", fontFamily: "var(--font-satoshi)" }}
              >
                Ro&apos;yxatdan o&apos;ting va birinchi moliyaviy auditingizni
                bepul bajaring. Atigi 5 daqiqa yetarli.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <Link href="/register">
                  <button
                    className="flex items-center gap-2 px-8 py-4 font-bold text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: "#ffffff", color: "#1e3a8a", fontFamily: "var(--font-satoshi)", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.28)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.18)")}
                  >
                    Bepul boshlash <ArrowRight size={15} />
                  </button>
                </Link>
                <Link href="/login">
                  <button
                    className="flex items-center gap-2 px-8 py-4 text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                    style={{ border: "1px solid rgba(255,255,255,0.20)", background: "rgba(255,255,255,0.06)", color: "#c7d2fe", fontFamily: "var(--font-satoshi)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                      (e.currentTarget as HTMLElement).style.color = "#ffffff";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLElement).style.color = "#c7d2fe";
                    }}
                  >
                    Kirish <ChevronRight size={14} />
                  </button>
                </Link>
              </div>

              <div
                className="flex items-center justify-center gap-4 mt-8 text-[11px]"
                style={{ color: "rgba(165,180,252,0.65)", fontFamily: "var(--font-satoshi)" }}
              >
                <span className="flex items-center gap-1.5">
                  <Users size={11} />
                  O&apos;zbekiston tadbirkorlari ishonadi
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={11} style={{ color: "#34d399" }} />
                  SQB standartlari asosida
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 py-10 px-6"
        style={{ borderTop: "1px solid var(--lp-foot-border)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", fontFamily: "var(--font-clash)" }}
            >
              F
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--lp-foot-brand)", fontFamily: "var(--font-clash)" }}>
              FinFlow AI
            </span>
          </div>

          <p className="text-xs text-center" style={{ color: "var(--lp-foot-copy)", fontFamily: "var(--font-satoshi)" }}>
            © 2024 FinFlow AI — O&apos;zbekiston SME moliyaviy avtomatlashtirish platformasi
          </p>

          <div className="flex gap-6">
            {["Shartlar", "Maxfiylik", "Yordam"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs transition-colors duration-200"
                style={{ color: "var(--lp-foot-link)", fontFamily: "var(--font-satoshi)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--lp-body)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--lp-foot-link)")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── FeatureCard ───────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, tag, title, desc, accent, iconBg, iconColor, tagColor,
}: (typeof FEATURES)[number]) {
  return (
    <div
      className="feature-card relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-default"
      style={{
        background: "var(--lp-card)",
        border: "1px solid var(--lp-card-border)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "var(--lp-card-hover)";
        el.style.border = `1px solid ${accent}`;
        el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.10), 0 0 0 1px ${accent}`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "var(--lp-card)";
        el.style.border = "1px solid var(--lp-card-border)";
        el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: iconBg, border: `1px solid ${accent}` }}
        >
          <Icon size={19} style={{ color: iconColor }} />
        </div>
        <span
          className="text-[10px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
          style={{ background: iconBg, border: `1px solid ${accent}`, color: tagColor, fontFamily: "var(--font-satoshi)" }}
        >
          {tag}
        </span>
      </div>

      <h3 className="text-[15px] font-semibold mb-2" style={{ color: "var(--lp-card-title)", fontFamily: "var(--font-clash)" }}>
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--lp-card-desc)", fontFamily: "var(--font-satoshi)" }}>
        {desc}
      </p>
    </div>
  );
}
